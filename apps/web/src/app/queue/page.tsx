'use client';

import React, { useState, useEffect } from 'react';
import {
  ListOrdered,
  RefreshCw,
  Play,
  Download,
  Share2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Film
} from 'lucide-react';

interface JobItem {
  id: string;
  channel_id: string;
  job_type: string;
  status: string;
  stage: string;
  progress_percentage: number;
  retry_count: number;
  created_at: string;
  channels?: { name: string };
  workflow_config_snapshot?: Record<string, any>;
  render_outputs?: any[];
}

export default function QueuePage() {
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [heartbeats, setHeartbeats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      const data = await res.json();
      if (data.jobs) {
        setJobs(data.jobs);
      }
      const tasksRes = await fetch('/api/tasks');
      const tasksData = await tasksRes.json();
      if (tasksData.tasks) {
        setTasks(tasksData.tasks);
        setHeartbeats(tasksData.heartbeats || []);
      }
    } catch (err) {
      console.error('Failed to load jobs/tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleProcessJob = async (jobId: string) => {
    try {
      setActionLoading(jobId);
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PROCESS_JOB', jobId })
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(`Job ${jobId.substring(0, 8)}... rendered and completed!`);
        await fetchJobs();
      } else {
        alert(data.error || 'Failed to process job');
      }
    } catch (err) {
      console.error('Error processing job:', err);
    } finally {
      setActionLoading(null);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const handlePublishJob = async (jobId: string) => {
    try {
      setActionLoading(jobId);
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PUBLISH_JOB', jobId })
      });
      const data = await res.json();
      if (data.success) {
        setToastMessage(data.message || 'Video published to YouTube!');
        await fetchJobs();
      } else {
        alert(data.error || 'Failed to publish');
      }
    } catch (err) {
      console.error('Error publishing job:', err);
    } finally {
      setActionLoading(null);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to remove this job from the queue?')) return;
    try {
      setActionLoading(jobId);
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'DELETE_JOB', jobId })
      });
      const data = await res.json();
      if (data.success) {
        setJobs(jobs.filter((j) => j.id !== jobId));
      }
    } catch (err) {
      console.error('Error deleting job:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDownload = (job: JobItem) => {
    const isClip = job.job_type === 'CLIP_VIDEO';
    const url = isClip ? '/storage/sample_clip.mp4' : '/storage/sample_render.mp4';
    const link = document.createElement('a');
    link.href = url;
    const cleanTitle = (job.workflow_config_snapshot?.title || job.job_type)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_');
    link.setAttribute('download', `${cleanTitle}.mp4`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessAll = async () => {
    const queuedJobs = jobs.filter((j) => j.status === 'queued' || j.status === 'processing');
    if (queuedJobs.length === 0) return;
    setActionLoading('ALL');
    for (const j of queuedJobs) {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PROCESS_JOB', jobId: j.id })
      });
    }
    setActionLoading(null);
    setToastMessage(`Processed ${queuedJobs.length} jobs successfully!`);
    await fetchJobs();
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm flex items-center justify-between shadow-2xl animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-400 text-xs hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-studio-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <ListOrdered className="h-6 w-6 text-amber-500" />
            Production Job Queue
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Trigger generation pipelines, download completed MP4 video files, and dispatch directly to YouTube.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleProcessAll}
            disabled={actionLoading !== null}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-sm font-semibold shadow-lg shadow-blue-500/20 transition disabled:opacity-50"
          >
            <Play className="h-4 w-4 fill-white" />
            {actionLoading === 'ALL' ? 'Processing Queue...' : 'Process All Queued'}
          </button>

          <button
            onClick={fetchJobs}
            className="inline-flex items-center gap-2 px-3 py-2 bg-studio-800 hover:bg-studio-700 text-slate-300 rounded-lg text-sm border border-studio-700 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-studio-900 border border-studio-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-studio-950 text-xs uppercase tracking-wider text-slate-400 border-b border-studio-800">
              <tr>
                <th className="px-6 py-4">Job ID & Type</th>
                <th className="px-6 py-4">Channel & Title</th>
                <th className="px-6 py-4">Stage / Pipeline</th>
                <th className="px-6 py-4">Status & Progress</th>
                <th className="px-6 py-4">Enqueued</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-800/60">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                        Fetching live jobs from Supabase...
                      </span>
                    ) : (
                      'Queue is currently empty. Start a Generation or Clipping job to populate.'
                    )}
                  </td>
                </tr>
              ) : (
                jobs.map((job) => {
                  const isQueued = job.status === 'queued' || job.status === 'processing';
                  const isCompleted = job.status === 'completed' || job.progress_percentage === 100;
                  const isProcessingThis = actionLoading === job.id;

                  return (
                    <tr key={job.id} className="hover:bg-studio-800/30 transition">
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs font-semibold text-white">
                          {job.id.substring(0, 16)}...
                        </div>
                        <span className="text-[11px] text-blue-400 font-medium">{job.job_type}</span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-slate-200 font-medium">
                          {job.channels?.name || 'Studio Global'}
                        </div>
                        {job.workflow_config_snapshot?.title && (
                          <div className="text-xs text-slate-400 truncate max-w-xs">
                            {job.workflow_config_snapshot.title}
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-xs bg-studio-800 text-slate-300 border border-studio-700 font-mono">
                            {job.stage}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1.5 w-40">
                          <div className="flex justify-between text-xs">
                            <span
                              className={`font-semibold capitalize ${
                                isCompleted
                                  ? 'text-emerald-400'
                                  : job.status === 'processing'
                                  ? 'text-amber-400'
                                  : 'text-blue-400'
                              }`}
                            >
                              {job.status.toLowerCase()}
                            </span>
                            <span className="text-slate-400 font-mono">{job.progress_percentage}%</span>
                          </div>
                          <div className="w-full bg-studio-950 h-1.5 rounded-full overflow-hidden border border-studio-800">
                            <div
                              className={`h-full transition-all duration-300 ${
                                isCompleted
                                  ? 'bg-emerald-500'
                                  : job.status === 'processing'
                                  ? 'bg-amber-500'
                                  : 'bg-blue-500'
                              }`}
                              style={{ width: `${job.progress_percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-400">
                        {new Date(job.created_at).toLocaleTimeString()}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* If Queued: Show Process Now Button */}
                          {isQueued && (
                            <button
                              onClick={() => handleProcessJob(job.id)}
                              disabled={isProcessingThis}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition"
                              title="Render & Complete Job Now"
                            >
                              <Play className="h-3.5 w-3.5 fill-white" />
                              {isProcessingThis ? 'Rendering...' : 'Process'}
                            </button>
                          )}

                          {/* If Completed: Show Download MP4 & Publish Buttons */}
                          {isCompleted && (
                            <>
                              <button
                                onClick={() => handleDownload(job)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition"
                                title="Download MP4 Video"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Download
                              </button>

                              <button
                                onClick={() => handlePublishJob(job.id)}
                                disabled={isProcessingThis}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow transition"
                                title="Publish to Connected YouTube Channel"
                              >
                                <Share2 className="h-3.5 w-3.5" />
                                Publish
                              </button>
                            </>
                          )}

                          {/* Delete Job Button */}
                          <button
                            onClick={() => handleDeleteJob(job.id)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-studio-800 rounded transition"
                            title="Remove from Queue"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
