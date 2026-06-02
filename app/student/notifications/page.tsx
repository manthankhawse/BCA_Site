'use client';
import { useEffect, useState } from 'react';
import { Bell, CheckCheck, BookOpen, Trophy, ClipboardList, CalendarDays, Settings, Megaphone, MessageSquare, BookMarked, FileText, Trash2, X } from 'lucide-react';
import Link from 'next/link';

interface Notification {
  _id: string; title: string; body: string; type: string;
  read: boolean; link?: string; createdAt: string;
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  assignment: { icon: ClipboardList, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  new_assignment: { icon: ClipboardList, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  lesson: { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  content_update: { icon: FileText, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  new_course: { icon: BookMarked, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  announcement: { icon: Megaphone, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  new_post: { icon: MessageSquare, color: 'text-green-400', bg: 'bg-green-500/10' },
  tournament: { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  grade: { icon: CheckCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  attendance: { icon: CalendarDays, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  system: { icon: Settings, color: 'text-gray-400', bg: 'bg-gray-500/10' },
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

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => { setNotifications(d.notifications || []); setLoading(false); });
  }, []);

  const markAllRead = async () => {
    setMarking(true);
    await fetch('/api/notifications', { method: 'PUT' });
    setNotifications(ns => ns.map(n => ({ ...n, read: true })));
    setMarking(false);
  };

  const deleteNotification = async (id: string) => {
    await fetch(`/api/notifications?id=${id}`, { method: 'DELETE' });
    setNotifications(ns => ns.filter(n => n._id !== id));
  };

  const clearAll = async () => {
    if (!confirm('Clear all notifications?')) return;
    await fetch('/api/notifications', { method: 'DELETE' });
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell size={20} className="text-blue-400" /> Notifications
          </h1>
          {unreadCount > 0 && <p className="text-gray-400 text-sm mt-1">{unreadCount} unread</p>}
        </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead} disabled={marking}
                className="flex items-center gap-2 bg-[#1a1a1a] border border-white/10 hover:border-white/20 text-gray-300 hover:text-white px-3 py-2 rounded-lg text-sm transition-colors">
                <CheckCheck size={15} />
                {marking ? 'Marking...' : 'Mark all read'}
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll}
                className="flex items-center gap-2 bg-[#1a1a1a] border border-red-500/20 hover:border-red-500/40 text-red-400 px-3 py-2 rounded-lg text-sm transition-colors">
                <Trash2 size={15} />
                Clear all
              </button>
            )}
          </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#1a1a1a] rounded-xl border border-white/5 text-gray-500">
          <Bell size={48} className="opacity-20" />
          <p>You&apos;re all caught up!</p>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden divide-y divide-white/5">
          {notifications.map(n => {
            const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
            const Icon = cfg.icon;
            return (
              <div key={n._id} className={`group flex items-start gap-4 p-4 hover:bg-white/5 transition-colors ${!n.read ? 'bg-white/3' : ''}`}>
                <div className={`w-9 h-9 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 ${cfg.color}`}>
                  <Icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${!n.read ? 'text-white' : 'text-gray-300'}`}>{n.title}</p>
                    <span className="text-gray-600 text-xs shrink-0">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{n.body}</p>
                  {n.link && (
                    <Link href={n.link} className={`text-xs mt-1 inline-block font-medium hover:underline ${cfg.color}`}>
                      View →
                    </Link>
                  )}
                </div>
                {!n.read && <div className={`w-2 h-2 rounded-full ${cfg.bg.replace('/10', '')} mt-1.5 shrink-0`} />}
                <button onClick={(e) => { e.preventDefault(); deleteNotification(n._id); }} className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100">
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
