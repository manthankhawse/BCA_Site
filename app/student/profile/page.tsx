'use client';
import { useEffect, useState } from 'react';
import { User, Mail, Phone, Trophy, BookOpen, Calendar, Star, MessageSquare, Edit2, X, Save } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  rating?: number;
  role: string;
  enrolledCourses: { _id: string; title: string; level: string }[];
  createdAt: string;
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'text-green-400 bg-green-500/10 border-green-500/20',
  intermediate: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  advanced: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  elite: 'text-red-400 bg-red-500/10 border-red-500/20',
};

export default function StudentProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', bio: '' });

  const fetchProfile = () => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { 
        setProfile(d.user); 
        setForm({ name: d.user.name || '', phone: d.user.phone || '', bio: d.user.bio || '' });
        setLoading(false); 
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/auth/me', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      await fetchProfile();
      setEditing(false);
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!profile) return <div className="text-center py-16 text-red-400">Failed to load profile</div>;

  const rating = profile.rating || 1000;

  const getTitle = (r: number) => {
    if (r >= 2400) return { title: 'Grandmaster', color: 'text-red-400', emoji: '👑' };
    if (r >= 2200) return { title: 'International Master', color: 'text-orange-400', emoji: '🏅' };
    if (r >= 2000) return { title: 'FIDE Master', color: 'text-amber-400', emoji: '⭐' };
    if (r >= 1800) return { title: 'Candidate Master', color: 'text-yellow-400', emoji: '🎖️' };
    if (r >= 1600) return { title: 'Club Player', color: 'text-green-400', emoji: '♟️' };
    if (r >= 1400) return { title: 'Intermediate', color: 'text-cyan-400', emoji: '📈' };
    return { title: 'Beginner', color: 'text-blue-400', emoji: '🌱' };
  };

  const titleInfo = getTitle(rating);
  const ratingProgress = Math.min((rating / 2800) * 100, 100);
  const joined = new Date(profile.createdAt);
  const validDate = !isNaN(joined.getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">My Profile</h1>
        <button onClick={() => setEditing(true)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>

      {/* Hero card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0a1a1f] via-[#1a1a1a] to-[#0a0f1a] border border-cyan-500/20 rounded-2xl p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-violet-500/5 pointer-events-none" />

        <div className="relative flex items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-cyan-400 to-violet-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl shadow-lg shadow-cyan-500/20">
              {profile.name[0].toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">{profile.name}</h2>
                <p className={`${titleInfo.color} font-semibold text-sm mt-1`}>
                  {titleInfo.emoji} {titleInfo.title}
                </p>
              </div>
              <div className="text-center bg-amber-500/10 border border-amber-500/20 rounded-xl px-5 py-3">
                <div className="text-3xl font-bold text-amber-400">{rating}</div>
                <div className="text-gray-500 text-xs mt-0.5">Rating</div>
              </div>
            </div>

            {profile.bio && <p className="text-gray-400 text-sm mt-3 max-w-lg">{profile.bio}</p>}

            {/* Rating bar */}
            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">🌱 Beginner</span>
                <span className="text-gray-500">👑 Grandmaster</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-500 via-amber-500 to-red-500 transition-all duration-700"
                  style={{ width: `${ratingProgress}%` }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
              </div>
              <p className="text-center text-xs text-gray-500">
                {ratingProgress.toFixed(0)}% to Grandmaster • Currently <span className={`font-medium ${titleInfo.color}`}>{titleInfo.title}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: BookOpen, label: 'Courses', value: profile.enrolledCourses.length, color: 'text-amber-400', bg: 'from-amber-500/10 border-amber-500/20' },
          { icon: Trophy, label: 'Rating', value: rating, color: 'text-yellow-400', bg: 'from-yellow-500/10 border-yellow-500/20' },
          { icon: Star, label: 'Title', value: titleInfo.emoji, color: 'text-cyan-400', bg: 'from-cyan-500/10 border-cyan-500/20' },
          { icon: Calendar, label: 'Member since', value: validDate ? joined.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—', color: 'text-violet-400', bg: 'from-violet-500/10 border-violet-500/20' },
        ].map((stat, i) => (
          <div key={i} className={`bg-gradient-to-br ${stat.bg} to-transparent border rounded-xl p-4`}>
            <stat.icon size={18} className={`${stat.color} mb-2`} />
            <p className="text-gray-500 text-xs">{stat.label}</p>
            <p className="text-white font-bold text-lg mt-0.5">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Contact info */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <User size={16} className="text-gray-400" /> Account Information
        </h3>
        <div className="space-y-0">
          {[
            { icon: Mail, label: 'Email', value: profile.email },
            ...(profile.phone ? [{ icon: Phone, label: 'Phone', value: profile.phone }] : []),
            { icon: User, label: 'Role', value: profile.role, isCapitalized: true },
            { icon: Calendar, label: 'Joined', value: validDate ? joined.toLocaleDateString() : 'Unknown' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                <item.icon size={14} className="text-gray-400" />
              </div>
              <div>
                <p className="text-gray-500 text-xs">{item.label}</p>
                <p className={`text-white text-sm mt-0.5 ${item.isCapitalized ? 'capitalize' : ''}`}>{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <BookOpen size={16} className="text-amber-400" /> Enrolled Courses ({profile.enrolledCourses.length})
        </h3>
        {profile.enrolledCourses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <BookOpen size={32} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">Not enrolled in any courses yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {profile.enrolledCourses.map(course => (
              <Link key={course._id} href={`/student/courses/${course._id}`}
                className="flex items-center justify-between bg-white/5 hover:bg-white/10 border border-white/5 hover:border-amber-500/20 rounded-xl px-4 py-3.5 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <BookOpen size={14} className="text-amber-400" />
                  </div>
                  <span className="text-white text-sm group-hover:text-amber-400 transition-colors">{course.title}</span>
                </div>
                <span className={`text-xs font-medium capitalize px-2.5 py-1 rounded-full border ${LEVEL_COLORS[course.level] || 'text-gray-400 bg-white/5 border-white/10'}`}>
                  {course.level}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-white/5">
              <h2 className="text-lg font-semibold text-white">Edit Profile</h2>
              <button onClick={() => setEditing(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Full Name</label>
                <input required type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Bio</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 text-sm resize-none" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditing(false)} className="flex-1 border border-white/10 text-gray-300 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50">
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
