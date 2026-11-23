'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Tv,
  Wand2,
  Scissors,
  ListOrdered,
  Calendar,
  Settings,
  ShieldCheck,
  Video
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/channels', label: 'Channels', icon: Tv },
  { href: '/studio/generate', label: 'AI Video Studio', icon: Wand2 },
  { href: '/studio/clipping', label: 'Clipping Studio', icon: Scissors },
  { href: '/queue', label: 'Production Queue', icon: ListOrdered },
  { href: '/calendar', label: 'Content Calendar', icon: Calendar },
  { href: '/settings', label: 'Settings & Budgets', icon: Settings },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-studio-900 border-r border-studio-800 flex flex-col shrink-0 min-h-screen">
      {/* Studio Header Brand */}
      <div className="p-5 border-b border-studio-800 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Video className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-100 tracking-wide uppercase">AI Video Studio</h1>
          <p className="text-xs text-slate-400">Autonomous Multi-Channel</p>
        </div>
      </div>

      {/* Nav List */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-studio-850'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Mode & Engine Footer Badge */}
      <div className="p-4 border-t border-studio-800">
        <div className="bg-studio-850 border border-studio-700/60 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">Free-First Mode Active</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Lemo Opuscar + Local Whisper + Gemini Free Tier</p>
        </div>
      </div>
    </aside>
  );
}
