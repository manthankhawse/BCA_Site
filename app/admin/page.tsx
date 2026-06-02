'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users, BookOpen, MessageSquare, Trophy, BarChart3,
  TrendingUp, ArrowRight, ClipboardList
} from 'lucide-react';

interface DashStats {
  totalStudents: number;
  totalCourses: number;
  totalPosts: number;
  totalTournaments: number;
  pendingSubmissions: number;
}

interface RecentStudent { _id: string; name: string; email: string; rating: number; createdAt: string }
interface TopCourse { _id: string; title: string; level: string; count: number }
interface TrendPoint { _id: string; count: number }
interface Tournament { _id: string; name: string; status: string; startDate: string }

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashStats | null>(null);
  const [recentStudents, setRecentStudents] = useState<RecentStudent[]>([]);
  const [topCourses, setTopCourses] = useState<TopCourse[]>([]);
  const [trend, setTrend] = useState<TrendPoint[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(r => r.json())
      .then(d => {
        setStats(d.stats);
        setRecentStudents(d.recentStudents || []);
        setTopCourses(d.topCourses || []);
        setTrend(d.enrollmentTrend || []);
        setTournaments(d.activeTournaments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: Users, label: 'Students', value: stats?.totalStudents, color: 'amber', href: '/admin/students' },
    { icon: BookOpen, label: 'Courses', value: stats?.totalCourses, color: 'blue', href: '/admin/courses' },
    { icon: Trophy, label: 'Tournaments', value: stats?.totalTournaments, color: 'orange', href: '/admin/tournaments' },
    { icon: MessageSquare, label: 'Community Posts', value: stats?.totalPosts, color: 'violet', href: '/admin/community' },
    { icon: ClipboardList, label: 'Pending Grades', value: stats?.pendingSubmissions, color: 'red', href: '/admin/students' },
  ];

  const levelColors: Record<string, string> = {
    beginner: 'text-green-400', intermediate: 'text-amber-400',
    advanced: 'text-orange-400', elite: 'text-red-400',
  };
  const tournamentStatusColors: Record<string, string> = {
    upcoming: 'text-blue-400 bg-blue-500/10',
    registration: 'text-emerald-400 bg-emerald-500/10',
    ongoing: 'text-amber-400 bg-amber-500/10',
    completed: 'text-gray-400 bg-gray-500/10',
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl">
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard ♔</h1>
        <p className="text-gray-400 mt-1">Welcome back, Admin · Academy overview</p>
      </div>

      {/* Stat Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {statCards.map(card => (
          <Link key={card.label} href={card.href}
            className={`bg-[#1a1a1a] border border-white/5 hover:border-${card.color}-500/30 rounded-xl p-4 transition-all group`}>
            <div className={`w-10 h-10 bg-${card.color}-500/10 rounded-xl flex items-center justify-center mb-3`}>
              <card.icon size={18} className={`text-${card.color}-400`} />
            </div>
            <p className="text-2xl font-bold text-white">{card.value ?? '—'}</p>
            <p className="text-gray-500 text-xs mt-0.5">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Students */}
        <div className="lg:col-span-2 bg-[#1a1a1a] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Users size={16} className="text-amber-400" /> Recent Students
            </h2>
            <Link href="/admin/students" className="text-amber-400 text-xs hover:text-amber-300 flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {recentStudents.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No students yet</div>
            ) : recentStudents.map(s => (
              <div key={s._id} className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                <div className="w-9 h-9 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
                  {s.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{s.name}</p>
                  <p className="text-gray-500 text-xs truncate">{s.email}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-amber-400 font-mono text-sm font-bold">{s.rating}</p>
                  <p className="text-gray-600 text-xs">{new Date(s.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Top Courses */}
          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <TrendingUp size={16} className="text-blue-400" /> Top Courses
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {topCourses.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No courses yet</p>
              ) : topCourses.map((c, i) => (
                <div key={c._id} className="flex items-center gap-3">
                  <span className="text-gray-600 text-xs font-mono w-4">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{c.title}</p>
                    <p className={`text-xs capitalize ${levelColors[c.level] || 'text-gray-400'}`}>{c.level}</p>
                  </div>
                  <span className="text-gray-400 text-xs shrink-0">{c.count} enrolled</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Tournaments */}
          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Trophy size={16} className="text-orange-400" /> Live Tournaments
              </h2>
              <Link href="/admin/tournaments" className="text-orange-400 text-xs hover:text-orange-300 flex items-center gap-1">
                Manage <ArrowRight size={12} />
              </Link>
            </div>
            <div className="p-4 space-y-2">
              {tournaments.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No active tournaments</p>
              ) : tournaments.map(t => (
                <Link key={t._id} href={`/admin/tournaments/${t._id}`}
                  className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg hover:bg-[#333] transition-colors">
                  <div>
                    <p className="text-white text-xs font-medium">{t.name}</p>
                    <p className="text-gray-500 text-xs">{new Date(t.startDate).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${tournamentStatusColors[t.status] || ''}`}>
                    {t.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-amber-500/8 to-orange-500/8 border border-amber-500/15 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <BarChart3 size={16} className="text-amber-400" /> Quick Actions
        </h3>
        <div className="flex flex-wrap gap-3">
          {[
            { label: '+ Add Student', href: '/admin/students' },
            { label: '+ New Course', href: '/admin/courses' },
            { label: '🏆 New Tournament', href: '/admin/tournaments' },
            { label: '📢 Post Announcement', href: '/admin/community' },
          ].map(a => (
            <Link key={a.label} href={a.href}
              className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm text-gray-300 hover:text-white transition-colors">
              {a.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
