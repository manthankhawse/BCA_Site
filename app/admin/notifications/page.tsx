'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Bell, CheckCheck, BookOpen, Trophy, ClipboardList,
  Settings, Megaphone, MessageSquare, BookMarked, FileText,
  Trash2, X, Users, Upload, RefreshCw
} from 'lucide-react';

interface Notification {
  _id: string; title: string; body: string; type: string;
  read: boolean; link?: string; createdAt: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  assignment:      { icon: ClipboardList, color: 'text-amber-400',   bg: 'bg-amber-500/10',  label: 'Assignment' },
  new_assignment:  { icon: ClipboardList, color: 'text-amber-400',   bg: 'bg-amber-500/10',  label: 'Assignment' },
  submission:      { icon: Upload,        color: 'text-cyan-400',     bg: 'bg-cyan-500/10',   label: 'Submission' },
  lesson:          { icon: BookOpen,      color: 'text-blue-400',     bg: 'bg-blue-500/10',   label: 'Lesson' },
  content_update:  { icon: FileText,      color: 'text-cyan-400',     bg: 'bg-cyan-500/10',   label: 'Content' },
  new_course:      { icon: BookMarked,    color: 'text-violet-400',   bg: 'bg-violet-500/10', label: 'Course' },
  announcement:    { icon: Megaphone,     color: 'text-orange-400',   bg: 'bg-orange-500/10', label: 'Announcement' },
  new_post:        { icon: MessageSquare, color: 'text-green-400',    bg: 'bg-green-500/10',  label: 'Post' },
  tournament:      { icon: Trophy,        color: 'text-yellow-400',   bg: 'bg-yellow-500/10', label: 'Tournament' },
  grade:           { icon: CheckCheck,    color: 'text-emerald-400',  bg: 'bg-emerald-500/10',label: 'Grade' },
  new_student:     { icon: Users,         color: 'text-purple-400',   bg: 'bg-purple-500/10', label: 'New Student' },
  system:          { icon: Settings,      color: 'text-gray-400',     bg: 'bg-gray-500/10',   label: 'System' },
};

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const fetchNotifications = async () => {
    setLoading(true);
    const res = await fetch('/api/notifications');
    const data = await res.json();
    setNotifications(data.notifications || []);
    setLoading(false);
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    setMarking(true);
    await fetch('/api/notifications', { method: 'PUT' });
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
    setMarking(false);
  };

  const deleteOne = async (id: string) => {
    await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
    setNotifications(ns => ns.filter(n => n._id !== id));
  };

  const clearAll = async () => {
    if (!confirm('Clear all notifications?')) return;
    await fetch('/api/notifications', { method: 'DELETE' });
    setNotifications([]);
  };

  const displayed = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell size={22} className="text-amber-400" /> Notifications
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} · {notifications.length} total
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button onClick={fetchNotifications} title="Refresh"
            className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
            <RefreshCw size={16} />
          </button>
          {unreadCount > 0 && (
            <button onClick={markAllRead} disabled={marking}
              className="flex items-center gap-1.5 bg-[#1a1a1a] border border-white/10 hover:border-white/20 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors">
              <CheckCheck size={15} />
              {marking ? 'Marking...' : 'Mark all read'}
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll}
              className="flex items-center gap-1.5 bg-[#1a1a1a] border border-red-500/20 hover:border-red-500/40 text-red-400 px-3 py-2 rounded-lg text-sm transition-colors">
              <Trash2 size={15} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-[#1a1a1a] border border-white/5 rounded-xl p-1 w-fit">
        {['all', 'unread'].map(f => (
          <button key={f} onClick={() => setFilter(f as typeof filter)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              filter === f ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
            }`}>
            {f} {f === 'unread' && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
          <RefreshCw size={16} className="animate-spin" /> Loading...
        </div>
      ) : displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#1a1a1a] rounded-xl border border-white/5 text-gray-500">
          <Bell size={48} className="opacity-20" />
          <p>{filter === 'unread' ? 'No unread notifications' : "You're all caught up!"}</p>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
          {displayed.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
            const Icon = cfg.icon;
            return (
              <div key={n._id}
                className={`group flex items-start gap-4 p-4 hover:bg-white/[0.03] transition-colors ${!n.read ? 'bg-white/[0.02]' : ''}`}>
                <div className={`w-10 h-10 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 ${cfg.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${!n.read ? 'text-white' : 'text-gray-300'}`}>{n.title}</p>
                      <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <span className="text-gray-600 text-xs shrink-0">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{n.body}</p>
                  {n.link && (
                    <Link href={n.link}
                      className={`text-xs mt-1.5 inline-flex items-center gap-1 font-medium hover:underline ${cfg.color}`}>
                      View →
                    </Link>
                  )}
                </div>
                {!n.read && <div className={`w-2 h-2 rounded-full bg-amber-400 mt-2 shrink-0`} />}
                <button onClick={() => deleteOne(n._id)}
                  className="text-gray-600 hover:text-red-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
