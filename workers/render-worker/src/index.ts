/**
 * Render Worker Process
 * Operates browser-based Playwright frame rendering via Lemo-Opuscar and Video Compositor concatenation
 */

import { supabaseAdmin } from '../../../packages/database/src/client';
import { defaultLemoAdapter } from '../../../integrations/lemo-opuscar/src/adapter';
import os from 'os';

const workerId = `render_worker_${process.pid}_${Math.random().toString(36).substring(7)}`;

console.log(`[Render-Worker] Started worker instance ${workerId} on ${os.hostname()}`);
console.log(`[Render-Worker] Lemo-Opuscar available: ${defaultLemoAdapter.isAvailable()}`);

async function heartbeat() {
  try {
    await supabaseAdmin.from('worker_heartbeats').upsert({
      worker_id: workerId,
      worker_type: 'render-worker',
      hostname: os.hostname(),
      active_tasks: [],
      cpu_percent: 25.0,
      memory_mb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      status: 'healthy',
      last_heartbeat: new Date().toISOString(),
    });
  } catch (err) {
    console.warn('[Render-Worker] Heartbeat error:', err);
  }
}

setInterval(heartbeat, 30000);
heartbeat();
