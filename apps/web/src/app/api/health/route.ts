import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { existsSync } from 'fs';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'DISCONNECTED';
  let dbLatencyMs = 0;
  let channelsCount = 0;

  try {
    const dbStart = Date.now();
    const { count, error } = await supabaseAdmin
      .from('channels')
      .select('*', { count: 'exact', head: true });

    if (!error) {
      dbStatus = 'CONNECTED';
      channelsCount = count || 0;
      dbLatencyMs = Date.now() - dbStart;
    } else {
      dbStatus = `ERROR: ${error.message}`;
    }
  } catch (err: unknown) {
    dbStatus = `UNREACHABLE: ${String(err)}`;
  }

  // Check Gemini API Configuration
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10);
  const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';

  // Check Local Tooling Paths
  const pythonPath = process.env.HYPERFRAMES_PYTHON || 'C:\\Users\\DELL\\video-tools\\Scripts\\python.exe';
  const whisperPath = process.env.HYPERFRAMES_WHISPER_PATH || 'C:\\Users\\DELL\\whisper.cpp\\Release\\whisper-cli.exe';
  const opuscarPath = process.env.LEMO_OPUSCAR_DIR || 'C:\\Users\\DELL\\lemo-opuscar';

  const toolsStatus = {
    pythonVenv: existsSync(pythonPath),
    whisperCli: existsSync(whisperPath),
    lemoOpuscar: existsSync(opuscarPath)
  };

  return NextResponse.json({
    status: dbStatus === 'CONNECTED' ? 'HEALTHY' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      latencyMs: dbLatencyMs,
      channelsCount,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54621'
    },
    ai: {
      provider: 'Google Gemini',
      configured: hasGeminiKey,
      model: geminiModel,
      freeOnlyMode: process.env.FREE_ONLY_MODE !== 'false'
    },
    tools: toolsStatus,
    responseTimeMs: Date.now() - startTime
  });
}
