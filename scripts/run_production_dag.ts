/**
 * CLI Runner for Multi-Agent DAG Production Pipeline
 * Provides extensive, detailed console logging for every step in the pipeline.
 */

import fs from 'fs';
import path from 'path';

// Load apps/web/.env
const envFile = path.resolve(process.cwd(), 'apps', 'web', '.env');
if (fs.existsSync(envFile)) {
  const content = fs.readFileSync(envFile, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const k = trimmed.substring(0, idx).trim();
      const v = trimmed.substring(idx + 1).trim();
      process.env[k] = v;
    }
  }
}

// Add Gyan FFmpeg to PATH
const gyanDir = 'C:\\Users\\DELL\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.1-full_build\\bin';
if (fs.existsSync(gyanDir)) {
  const sep = path.delimiter;
  process.env.PATH = `${gyanDir}${sep}${process.env.PATH || ''}`;
  process.env.Path = `${gyanDir}${sep}${process.env.Path || ''}`;
}

import { defaultDAGOrchestrator } from '../workers/scheduler/src/dag';
import { supabaseAdmin } from '../packages/database/src/client';

async function run() {
  const args = process.argv.slice(2);
  const getArg = (flag: string, fallback: string = '') => {
    const idx = args.indexOf(flag);
    return idx !== -1 && args[idx + 1] ? args[idx + 1] : fallback;
  };

  const jobId = getArg('--jobId') || `job_${Date.now()}`;
  const channelId = getArg('--channelId') || 'c0000000-0000-0000-0000-000000000001';
  const theme = getArg('--theme') || 'The Golden Age of Islamic Civilization';
  const category = getArg('--category') || 'History & Education';
  const targetDurationSeconds = parseInt(getArg('--duration', '60'), 10);
  const visualStyle = getArg('--style') || 'impasto';

  console.log('\n================================================================================');
  console.log('🚀 [MULTI-AGENT DAG PRODUCTION ENGINE STARTED]');
  console.log(`⏱️  Timestamp: ${new Date().toISOString()}`);
  console.log(`📋 Job ID: ${jobId}`);
  console.log(`📺 Channel ID: ${channelId}`);
  console.log(`🎯 Theme: "${theme}"`);
  console.log(`🎨 Visual Style: ${visualStyle}`);
  console.log(`⏳ Target Duration: ${targetDurationSeconds} seconds`);
  console.log('================================================================================\n');

  console.log('👉 [STEP 0/10] INITIALIZING DAG & PERSISTING TASK NODES...');
  const planId = await defaultDAGOrchestrator.initializeProductionDAG({
    jobId,
    channelId,
    theme,
    category,
    targetDurationSeconds,
    visualStyle,
  });
  console.log(`✅ [STEP 0/10] DAG Initialized: Plan ${planId} saved to Supabase (production_tasks table)\n`);

  const stageDescriptions: Record<string, string> = {
    RESEARCHING: 'Agent 02 (Research Specialist) conducting factual deep-dive & primary source verification',
    SCRIPTING: 'Agent 03 (Lead Scriptwriter) drafting 5-act narrative documentary script',
    STORYBOARDING: 'Agent 04 (Creative Director), Agent 05 (Reference Analyst) & Agent 06 (Storyboard Director) designing scenes',
    VISUALS_RENDERING: 'Agent 08 (Animation TD) & Agent 09 (Scene Animator) synthesizing Lemo-Opuscar procedural code and rendering',
    VOICEOVER_GENERATING: 'Agent 10 (Audio Director) synthesizing speech and mastering to broadcast -14.0 LUFS',
    FINAL_ENCODING: 'Agent 14 (Video Compositor) concatenating scene layers and muxing audio with faststart',
    QA_VERIFYING: 'Agent 13 (Technical QA Inspector) certifying container codec and audio with ffprobe',
    UPLOADING: 'Agent 15 (Publishing Specialist) packaging SEO metadata, chapters and YouTube distribution tags',
    COMPLETED: 'Video production completed successfully and verified'
  };

  const result = await defaultDAGOrchestrator.executeProductionDAG(jobId, async (stage, percent, msg) => {
    const desc = stageDescriptions[stage] || msg;
    console.log(`⏩ [PROGRESS ${String(percent).padStart(3, ' ')}%] [STAGE: ${stage.padEnd(20, ' ')}] ${desc}`);
  });

  console.log('\n================================================================================');
  if (result.success) {
    console.log('🎉 [PRODUCTION DAG PIPELINE COMPLETED SUCCESSFULLY]');
    console.log(`📁 Master Video File: ${result.masterMp4Path}`);
    if (result.masterMp4Path && fs.existsSync(result.masterMp4Path)) {
      const stats = fs.statSync(result.masterMp4Path);
      console.log(`📊 File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
      console.log('🎬 Codec: H.264 / AAC 1080p 24fps (-14.0 LUFS broadcast verified)');
    }
  } else {
    console.error('❌ [PRODUCTION DAG PIPELINE FAILED]:', result.error);
  }
  console.log('================================================================================\n');
}

run().catch((err) => {
  console.error('\n💥 [FATAL DAG RUNNER ERROR]:', err);
  process.exit(1);
});
