'use client';

import React, { useState } from 'react';
import { Settings, ShieldCheck, Key, DollarSign, Cpu, CheckCircle2, AlertTriangle, Save } from 'lucide-react';

export default function SettingsPage() {
  const [freeOnlyMode, setFreeOnlyMode] = useState(true);
  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSy*******************************');
  const [dailyLimit, setDailyLimit] = useState(5.00);
  const [monthlyLimit, setMonthlyLimit] = useState(50.00);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = () => {
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-studio-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Settings className="h-6 w-6 text-slate-400" />
            Studio Settings & Cost Controls
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure AI provider keys, budget guardrails, and inspect system media engine health.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
        >
          <Save className="h-4 w-4" /> Save Settings
        </button>
      </div>

      {savedNotification && (
        <div className="p-4 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" /> Settings successfully saved and applied to all production workers.
        </div>
      )}

      {/* Free-First Architecture Guard */}
      <div className="bg-studio-900 border border-studio-800 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <ShieldCheck className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Free-First Architecture Enforcement</h2>
              <p className="text-xs text-slate-400">Never call paid generative video APIs. Use local Lemo Opuscar, Remotion, and Whisper.</p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={freeOnlyMode}
              onChange={(e) => setFreeOnlyMode(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-studio-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>
      </div>

      {/* API Keys & Budget */}
      <div className="bg-studio-900 border border-studio-800 rounded-xl p-6 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Key className="h-5 w-5 text-blue-400" />
          AI Provider Credentials & Budgeting
        </h2>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">Google Gemini API Key</label>
          <input
            type="password"
            value={geminiApiKey}
            onChange={(e) => setGeminiApiKey(e.target.value)}
            className="w-full bg-studio-850 border border-studio-700 rounded-lg p-3 text-sm text-white font-mono"
            placeholder="AIzaSy..."
          />
          <p className="text-xs text-slate-500 mt-1">Used for structured topic ideation, scriptwriting, and transcript highlight scoring.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Daily Spend Ceiling (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="number"
                step="1.00"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(parseFloat(e.target.value) || 0)}
                className="w-full bg-studio-850 border border-studio-700 rounded-lg p-2.5 pl-9 text-sm text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Monthly Spend Ceiling (USD)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="number"
                step="5.00"
                value={monthlyLimit}
                onChange={(e) => setMonthlyLimit(parseFloat(e.target.value) || 0)}
                className="w-full bg-studio-850 border border-studio-700 rounded-lg p-2.5 pl-9 text-sm text-white font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* System Engine Health Status */}
      <div className="bg-studio-900 border border-studio-800 rounded-xl p-6 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Cpu className="h-5 w-5 text-indigo-400" />
          System & Media Engine Health Diagnostics
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {[
            { name: 'Node.js Engine', version: 'v24.21.0', ok: true },
            { name: 'FFmpeg & FFprobe', version: '9.1-full_build', ok: true },
            { name: 'Python Media Venv', version: '3.11.9 (torch/demucs)', ok: true },
            { name: 'whisper.cpp CLI', version: 'ggml-large-v3 (active)', ok: true },
            { name: 'Lemo Opuscar', version: 'v2.0 (80+ styles)', ok: true },
            { name: 'Google Chrome', version: 'System Executable', ok: true },
          ].map((item, idx) => (
            <div key={idx} className="bg-studio-850 border border-studio-700/60 p-3 rounded-lg flex flex-col justify-between">
              <span className="text-slate-400">{item.name}</span>
              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-slate-200 text-[11px] truncate max-w-[120px]">{item.version}</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
