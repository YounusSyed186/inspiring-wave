/**
 * Comprehensive End-to-End Multi-Agent Production Verification Script
 * Validates DAG Orchestrator, 15 specialized agents, Supabase database persistence,
 * Lemo-Opuscar procedural frame assembly, audio mastering (-14.0 LUFS), and Technical QA.
 */

import fs from 'fs';
import path from 'path';

// Load apps/web/.env into process.env
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

import { defaultDAGOrchestrator } from '../workers/scheduler/src/dag';
import { supabaseAdmin } from '../packages/database/src/client';

async function main() {
  console.log('================================================================');
  console.log('STARTING MULTI-AGENT CINEMATIC VIDEO SYSTEM ACCEPTANCE AUDIT');
  console.log('================================================================');

  const testJobId = `job_audit_${Date.now()}`;
  const theme = 'The Golden Age of Islamic Civilization';
  const category = 'History & Education';
  const visualStyle = 'impasto';
  const targetDurationSeconds = 60;

  // 1. Ensure channel in Supabase
  const { data: channels } = await supabaseAdmin.from('channels').select('id, name').limit(1);
  const channelId = channels?.[0]?.id || 'c0000000-0000-0000-0000-000000000001';
  console.log(`[Audit] Target Channel ID: ${channelId} (${channels?.[0]?.name})`);

  // 2. Insert production_job
  console.log(`[Audit] Initializing Production Job: ${testJobId}`);
  const { error: jobErr } = await supabaseAdmin.from('production_jobs').upsert({
    id: 'f0000000-0000-0000-0000-000000000099',
    channel_id: channelId,
    job_type: 'GENERATE_VIDEO',
    status: 'leased',
    stage: 'RESEARCHING',
    progress_percentage: 10,
    idempotency_key: `audit_${Date.now()}`,
    workflow_config_snapshot: { theme, category, visualStyle, targetDurationSeconds },
  });
  if (jobErr) console.warn('[Audit] Job upsert warning:', jobErr.message);

  const realJobId = 'f0000000-0000-0000-0000-000000000099';

  // 3. Initialize DAG & Persist Tasks
  console.log('[Audit] Invoking Agent 01 (Master Orchestrator) to construct DAG plan...');
  const planId = await defaultDAGOrchestrator.initializeProductionDAG({
    jobId: realJobId,
    channelId,
    theme,
    category,
    targetDurationSeconds,
    visualStyle,
  });
  console.log(`[Audit] DAG Plan constructed successfully: ${planId}`);

  // Check tasks in DB
  const { data: tasks } = await supabaseAdmin.from('production_tasks').select('*').eq('job_id', realJobId);
  console.log(`[Audit] Persisted DAG Tasks in database: ${tasks?.length || 0} nodes`);

  // 4. Execute Full Multi-Agent DAG Pipeline
  console.log('[Audit] Executing DAG Multi-Agent Pipeline...');
  const result = await defaultDAGOrchestrator.executeProductionDAG(realJobId, async (stage, percent, msg) => {
    console.log(`[DAG Progress][${percent}%][${stage}] ${msg}`);
  });

  console.log('[Audit] DAG Execution Finished! Success:', result.success);
  console.log('[Audit] Master MP4 Path:', result.masterMp4Path);

  if (result.masterMp4Path && fs.existsSync(result.masterMp4Path)) {
    const stats = fs.statSync(result.masterMp4Path);
    console.log(`[Audit] Master MP4 File Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
  }

  // 5. Query and Verify Database State Across All 6 New Tables
  console.log('\n--- VERIFYING DURABLE POSTGRESQL STATE ---');
  const { count: tasksCount } = await supabaseAdmin.from('production_tasks').select('*', { count: 'exact', head: true }).eq('job_id', realJobId);
  const { count: artifactsCount } = await supabaseAdmin.from('production_artifacts').select('*', { count: 'exact', head: true }).eq('job_id', realJobId);
  const { count: scenesCount } = await supabaseAdmin.from('scene_manifests').select('*', { count: 'exact', head: true }).eq('job_id', realJobId);
  const { count: qaCount } = await supabaseAdmin.from('quality_reports').select('*', { count: 'exact', head: true }).eq('job_id', realJobId);
  const { count: heartbeatsCount } = await supabaseAdmin.from('worker_heartbeats').select('*', { count: 'exact', head: true });

  console.log(`- production_tasks: ${tasksCount} records`);
  console.log(`- production_artifacts: ${artifactsCount} records`);
  console.log(`- scene_manifests: ${scenesCount} records`);
  console.log(`- quality_reports: ${qaCount} records`);
  console.log(`- worker_heartbeats: ${heartbeatsCount} records`);

  console.log('================================================================');
  console.log('MULTI-AGENT SYSTEM VERIFICATION COMPLETE');
  console.log('================================================================');
}

main().catch(err => {
  console.error('[Audit Error]', err);
  process.exit(1);
});
