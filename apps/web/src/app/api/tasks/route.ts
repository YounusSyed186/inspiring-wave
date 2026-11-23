import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const jobId = searchParams.get('job_id');

    let tasksQuery = supabaseAdmin
      .from('production_tasks')
      .select('*')
      .order('created_at', { ascending: true });

    if (jobId) {
      tasksQuery = tasksQuery.eq('job_id', jobId);
    }

    const { data: tasks, error: tasksError } = await tasksQuery.limit(50);
    if (tasksError) {
      return NextResponse.json({ success: false, error: tasksError.message }, { status: 500 });
    }

    // Also fetch scene manifests, quality reports, and worker heartbeats
    const { data: scenes } = await supabaseAdmin
      .from('scene_manifests')
      .select('*')
      .order('sequence_index', { ascending: true });

    const { data: qualityReports } = await supabaseAdmin
      .from('quality_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    const { data: heartbeats } = await supabaseAdmin
      .from('worker_heartbeats')
      .select('*')
      .order('last_heartbeat', { ascending: false });

    return NextResponse.json({
      success: true,
      tasks: tasks || [],
      scenes: scenes || [],
      qualityReports: qualityReports || [],
      heartbeats: heartbeats || [],
    });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
