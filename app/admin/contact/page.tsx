'use client';
import { useEffect, useState } from 'react';
import { Mail, Trash2, Check, Clock, User, Phone, BookOpen, MessageSquare, RefreshCw } from 'lucide-react';

interface ContactMsg {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  program?: string;
  message: string;
  read: boolean;
  createdAt: string;
}

const programLabels: Record<string, string> = {
  beginner: 'Beginner Training',
  intermediate: 'Intermediate Training',
  advanced: 'Advanced Training',
  online: 'Online Training',
};

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  const load = () => {
    setLoading(true);
    fetch('/api/contact')
      .then(r => r.json())
      .then(d => { setMessages(d.messages || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => {
    await fetch(`/api/contact/${id}`, { method: 'PATCH' });
    setMessages(prev => prev.map(m => m._id === id ? { ...m, read: true } : m));
  };

  const deleteMsg = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    await fetch(`/api/contact/${id}`, { method: 'DELETE' });
    setMessages(prev => prev.filter(m => m._id !== id));
  };

  const filtered = messages.filter(m =>
    filter === 'all' ? true : filter === 'unread' ? !m.read : m.read
  );

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Mail size={22} className="text-amber-400" /> Contact Messages
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {unreadCount} unread · {messages.length} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
          {(['all', 'unread', 'read'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-all ${filter === f ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-12 text-center">
          <Mail size={36} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(msg => (
            <div key={msg._id}
              className={`bg-[#1a1a1a] border rounded-xl p-5 transition-all ${msg.read ? 'border-white/5' : 'border-amber-500/30 bg-amber-500/5'}`}>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className="text-white font-semibold">{msg.name}</span>
                    {!msg.read && (
                      <span className="bg-amber-500/20 text-amber-400 text-xs px-2 py-0.5 rounded-full font-medium border border-amber-500/30">New</span>
                    )}
                    {msg.program && (
                      <span className="bg-blue-500/10 text-blue-400 text-xs px-2 py-0.5 rounded-full border border-blue-500/20">
                        {programLabels[msg.program] || msg.program}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <Mail size={12} className="text-gray-500" /> {msg.email}
                    </span>
                    {msg.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone size={12} className="text-gray-500" /> {msg.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Clock size={12} className="text-gray-500" />
                      {new Date(msg.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="bg-[#111] border border-white/5 rounded-lg p-4">
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {!msg.read && (
                    <button onClick={() => markRead(msg._id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-lg hover:bg-green-500/20 transition-all">
                      <Check size={12} /> Mark read
                    </button>
                  )}
                  <button onClick={() => deleteMsg(msg._id)}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-lg hover:bg-red-500/20 transition-all">
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
