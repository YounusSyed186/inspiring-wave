'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wand2,
  Scissors,
  Tv,
  CheckCircle2,
  Clock,
  Play,
  ArrowRight,
  TrendingUp,
  Cpu,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface ChannelSummary {
  id: string;
  name: string;
  category: string;
  status: string;
}

interface JobSummary {
  id: string;
  job_type: string;
  status: string;
  stage: string;
  progress_percentage: number;
}

export default function DashboardPage() {
  const [channels, setChannels] = useState<ChannelSummary[]>([]);
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [chRes, jobRes, healthRes] = await Promise.all([
          fetch('/api/channels'),
          fetch('/api/jobs'),
          fetch('/api/health')
        ]);
        const chData = await chRes.json();
        const jobData = await jobRes.json();
        const healthData = await healthRes.json();

        if (chData.channels) setChannels(chData.channels);
        if (jobData.jobs) setJobs(jobData.jobs);
        setHealthStatus(healthData);
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-studio-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Production Studio Overview</h1>
          <p className="text-sm text-slate-400 mt-1">
            Autonomous multi-channel generation, intelligent clipping, and scheduled YouTube dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/studio/generate"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg transition"
          >
            <Wand2 className="h-4 w-4" />
            New Generation
          </Link>
          <Link
            href="/studio/clipping"
            className="inline-flex items-center gap-2 px-4 py-2 bg-studio-800 hover:bg-studio-700 text-slate-200 border border-studio-700 rounded-lg text-sm font-medium transition"
          >
            <Scissors className="h-4 w-4" />
            Clip Longform
          </Link>
        </div>
      </div>

      {/* Production Health Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-studio-900 border border-studio-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Channels</span>
            <Tv className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white">{channels.length}</div>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Independent Profiles
          </div>
        </div>

        <div className="bg-studio-900 border border-studio-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Queue Workload</span>
            <Play className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">{jobs.length}</div>
          <div className="text-xs text-slate-400 flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-amber-400" />
            Active / Queued Jobs
          </div>
        </div>

        <div className="bg-studio-900 border border-studio-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Database Engine</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {healthStatus?.database?.status === 'CONNECTED' ? 'Supabase DB' : 'Connecting...'}
          </div>
          <div className="text-xs text-slate-400">
            {healthStatus?.database?.latencyMs ? `${healthStatus.database.latencyMs}ms latency` : 'Local Docker Container'}
          </div>
        </div>

        <div className="bg-studio-900 border border-studio-800 rounded-xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">AI Intelligence</span>
            <Cpu className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {healthStatus?.ai?.model || 'Gemini 3.1'}
          </div>
          <div className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Google AI Studio Key Active
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Channels */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Connected Channel Roster</h2>
            <Link href="/channels" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              Manage All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {channels.map((channel) => (
              <div
                key={channel.id}
                className="bg-studio-900 border border-studio-800 rounded-xl p-4 flex items-center justify-between hover:border-studio-700 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                    {channel.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{channel.name}</h3>
                    <p className="text-xs text-slate-400">{channel.category}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  {channel.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Workload */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Live Queue Monitor</h2>
            <Link href="/queue" className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View Queue <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="bg-studio-900 border border-studio-800 rounded-xl p-5 space-y-4">
            {jobs.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No active jobs in production pipeline.
              </div>
            ) : (
              jobs.slice(0, 4).map((job) => (
                <div key={job.id} className="space-y-2 pb-3 border-b border-studio-800 last:border-0 last:pb-0">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-white truncate max-w-[150px]">{job.id.substring(0, 14)}...</span>
                    <span className="px-1.5 py-0.5 rounded bg-studio-800 text-blue-400 font-mono text-[10px]">
                      {job.stage}
                    </span>
                  </div>
                  <div className="w-full bg-studio-950 h-1.5 rounded-full overflow-hidden border border-studio-800">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${job.progress_percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
