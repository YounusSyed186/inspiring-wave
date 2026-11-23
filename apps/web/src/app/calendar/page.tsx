'use client';

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronLeft, ChevronRight, Video } from 'lucide-react';

export default function CalendarPage() {
  const [currentWeek] = useState('Nov 23 – Nov 29, 2026');

  const scheduledSlots = [
    { day: 'Monday (Today)', time: '09:00 UTC', channel: 'Chronicles of Antiquity', title: 'The Bronze Age Collapse', status: 'Published' },
    { day: 'Monday (Today)', time: '18:00 UTC', channel: 'Deep Tech Dispatch', title: 'Quantum Computers Superposition', status: 'In Production' },
    { day: 'Tuesday', time: '09:00 UTC', channel: 'Chronicles of Antiquity', title: 'Hannibal Crossing the Alps', status: 'Scheduled' },
    { day: 'Wednesday', time: '11:00 UTC', channel: 'Deep Tech Dispatch', title: 'CRISPR Gene Drive Frontiers', status: 'Draft' },
    { day: 'Thursday', time: '09:00 UTC', channel: 'Chronicles of Antiquity', title: 'The Library of Alexandria', status: 'Scheduled' },
    { day: 'Friday', time: '18:00 UTC', channel: 'Deep Tech Dispatch', title: 'Fusion Ignition Milestones', status: 'Scheduled' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-studio-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <CalendarIcon className="h-6 w-6 text-purple-400" />
            Content Publishing Calendar
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Automated publishing schedules, video queues, and release slot coordination across channels.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-studio-900 border border-studio-800 p-1.5 rounded-lg text-xs font-semibold text-slate-300">
          <button className="p-1 hover:bg-studio-800 rounded"><ChevronLeft className="h-4 w-4" /></button>
          <span className="px-3">{currentWeek}</span>
          <button className="p-1 hover:bg-studio-800 rounded"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Calendar Slots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {scheduledSlots.map((slot, idx) => (
          <div key={idx} className="bg-studio-900 border border-studio-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">{slot.day}</span>
              <span className="font-mono text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {slot.time}
              </span>
            </div>

            <div className="bg-studio-850 border border-studio-700/60 rounded-lg p-3">
              <div className="text-[11px] font-bold text-blue-400 uppercase tracking-wide">{slot.channel}</div>
              <h3 className="text-sm font-semibold text-white mt-1">{slot.title}</h3>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                slot.status === 'Published'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                  : slot.status === 'In Production'
                  ? 'bg-blue-500/15 text-blue-400 border-blue-500/20'
                  : 'bg-studio-800 text-slate-400 border-studio-700'
              }`}>
                {slot.status}
              </span>
              <button className="text-blue-400 hover:underline">Edit Slot</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
