'use client';

import React, { useState, useEffect } from 'react';
import { Tv, Plus, CheckCircle2, Clock, ShieldCheck, ExternalLink, RefreshCw } from 'lucide-react';

interface ChannelItem {
  id: string;
  name: string;
  slug: string;
  category: string;
  language: string;
  timezone: string;
  status: string;
  default_visibility: string;
  require_human_approval: boolean;
  description?: string;
  created_at?: string;
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<ChannelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newCategory, setNewCategory] = useState('Science & Technology');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/channels');
      const data = await res.json();
      if (data.channels) {
        setChannels(data.channels);
      }
    } catch (err) {
      console.error('Failed to load channels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, []);

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    try {
      setCreating(true);
      const res = await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newChannelName,
          category: newCategory,
          description: newDescription,
          require_human_approval: true
        })
      });
      const data = await res.json();
      if (data.success && data.channel) {
        setChannels(prev => [data.channel, ...prev]);
        setNewChannelName('');
        setNewDescription('');
        setShowAddModal(false);
      }
    } catch (err) {
      console.error('Error creating channel:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleConnectYouTube = (channel: ChannelItem) => {
    window.location.href = `/api/auth/youtube?channel_id=${channel.id}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-studio-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Tv className="h-6 w-6 text-blue-500" />
            Connected YouTube Channels
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure independent brand voices, procedural render styles, and publishing schedules per channel.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchChannels}
            className="inline-flex items-center gap-2 px-3 py-2 bg-studio-800 hover:bg-studio-700 text-slate-300 rounded-lg text-sm border border-studio-700 transition"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg transition"
          >
            <Plus className="h-4 w-4" />
            Add New Channel
          </button>
        </div>
      </div>

      {/* Channel Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-slate-500">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-3 text-blue-500" />
          Loading channels from database...
        </div>
      ) : channels.length === 0 ? (
        <div className="p-12 bg-studio-900 border border-studio-800 rounded-xl text-center">
          <Tv className="h-12 w-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-white">No channels configured yet</h3>
          <p className="text-sm text-slate-400 mt-1 mb-4">Add your first YouTube channel to get started.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium"
          >
            Create Channel
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {channels.map((ch) => (
            <div
              key={ch.id}
              className="bg-studio-900 border border-studio-800 rounded-xl p-6 space-y-6 hover:border-studio-700 transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">{ch.name}</h3>
                    <span className="px-2 py-0.5 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-mono">
                      {ch.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">/{ch.slug} • {ch.category}</p>
                  {ch.description && (
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2">{ch.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleConnectYouTube(ch)}
                    title="Connect using Google Cloud OAuth Client"
                    className="px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Google OAuth
                  </button>
                  <a
                    href={`/api/auth/youtube/callback?mode=sandbox&state=${ch.id}`}
                    title="Instant connection for testing and publishing pipelines"
                    className="px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Direct Connect
                  </a>
                </div>
              </div>

              {/* Channel Meta Specs */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-studio-950/60 p-3.5 rounded-lg border border-studio-800/80">
                <div>
                  <span className="text-slate-500 block">Default Visibility</span>
                  <span className="text-slate-200 font-medium">{ch.default_visibility || 'PRIVATE'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Review Gate</span>
                  <span className="text-slate-200 font-medium">
                    {ch.require_human_approval ? 'Required Before Publish' : 'Auto-Publish'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Language & Timezone</span>
                  <span className="text-slate-200 font-medium">{ch.language} ({ch.timezone})</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Channel ID</span>
                  <span className="text-slate-400 font-mono text-[10px] truncate block">{ch.id}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Channel Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-studio-900 border border-studio-700 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Create New YouTube Channel Profile</h3>
            
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-slate-300 block mb-1">Channel Name</label>
                <input
                  type="text"
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g. Future Frontiers"
                  className="w-full bg-studio-950 border border-studio-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Category / Niche</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-studio-950 border border-studio-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Science & Technology">Science & Technology</option>
                  <option value="History & Education">History & Education</option>
                  <option value="Finance & Business">Finance & Business</option>
                  <option value="True Crime & Mystery">True Crime & Mystery</option>
                  <option value="Entertainment & Culture">Entertainment & Culture</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Mission / Description</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief summary of channel content focus..."
                  rows={3}
                  className="w-full bg-studio-950 border border-studio-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 resize-none text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-studio-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-studio-800 hover:bg-studio-700 text-slate-300 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                disabled={creating || !newChannelName.trim()}
                onClick={handleCreateChannel}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium"
              >
                {creating ? 'Saving...' : 'Create Channel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
