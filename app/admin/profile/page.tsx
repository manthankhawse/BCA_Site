'use client';
import { useEffect, useState } from 'react';
import { User, Mail, ShieldCheck, Calendar, BookOpen, Settings, Activity, Edit2, X, Save } from 'lucide-react';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminProfile() {
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
      <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!profile) return <div className="text-center py-16 text-red-400">Failed to load profile</div>;

  const joined = new Date(profile.createdAt);
  const validDate = !isNaN(joined.getTime());

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Admin Profile</h1>
        <button onClick={() => setEditing(true)}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm transition-colors">
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>

      {/* Hero card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1f1a0a] via-[#1a1a1a] to-[#1a1205] border border-amber-500/20 rounded-2xl p-8">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none" />

        <div className="relative flex items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-2xl flex items-center justify-center text-black font-bold text-4xl shadow-lg shadow-amber-500/20">
              {profile.name[0].toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-[#1a1a1a] flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">{profile.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <ShieldCheck size={14} className="text-amber-400" />
                  <span className="text-amber-400 font-semibold text-sm capitalize">{profile.role} Access</span>
                </div>
              </div>
              <span className="text-xs bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1.5 rounded-full font-medium">
                System Admin
              </span>
            </div>

            <p className="text-gray-400 text-sm mt-3 max-w-lg">
              Full administrative access to manage courses, students, assignments, tournaments, and platform settings.
            </p>
          </div>
        </div>

        {/* Stat row */}
        <div className="relative mt-8 grid grid-cols-3 gap-4">
          {[
            { icon: ShieldCheck, label: 'Access Level', value: 'Full Admin', color: 'text-amber-400' },
            { icon: Mail, label: 'Email', value: profile.email, color: 'text-blue-400' },
            { icon: Calendar, label: 'Member Since', value: validDate ? joined.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—', color: 'text-violet-400' },
          ].map((item, i) => (
            <div key={i} className="bg-white/5 border border-white/5 rounded-xl p-4">
              <item.icon size={16} className={`${item.color} mb-2`} />
              <p className="text-gray-500 text-xs mb-0.5">{item.label}</p>
              <p className="text-white text-sm font-medium truncate">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Manage Courses', href: '/admin/courses', icon: BookOpen, color: 'from-amber-500/10 to-amber-600/5 border-amber-500/20 text-amber-400' },
          { label: 'Students', href: '/admin/students', icon: User, color: 'from-blue-500/10 to-blue-600/5 border-blue-500/20 text-blue-400' },
          { label: 'Community', href: '/admin/community', icon: Activity, color: 'from-violet-500/10 to-violet-600/5 border-violet-500/20 text-violet-400' },
          { label: 'Settings', href: '/admin/settings', icon: Settings, color: 'from-gray-500/10 to-gray-600/5 border-gray-500/20 text-gray-400' },
        ].map((action) => (
          <a key={action.href} href={action.href}
            className={`bg-gradient-to-br ${action.color} border rounded-xl p-4 flex flex-col items-start gap-2 hover:scale-[1.02] transition-transform cursor-pointer`}>
            <action.icon size={20} />
            <span className="text-white text-sm font-medium">{action.label}</span>
          </a>
        ))}
      </div>

      {/* Account Details */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <User size={16} className="text-gray-400" /> Account Details
        </h3>
        <div className="space-y-3">
          {[
            { icon: Mail, label: 'Email address', value: profile.email },
            { icon: User, label: 'Role', value: profile.role, isCapitalized: true },
            { icon: Calendar, label: 'Account created', value: validDate ? joined.toLocaleString() : 'Unknown' },
            { icon: ShieldCheck, label: 'User ID', value: profile._id, isMono: true },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
              <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
                <item.icon size={14} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-500 text-xs">{item.label}</p>
                <p className={`text-white text-sm mt-0.5 truncate ${item.isCapitalized ? 'capitalize' : ''} ${item.isMono ? 'font-mono text-xs text-gray-400' : ''}`}>
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
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
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 text-sm" />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setEditing(false)} className="flex-1 border border-white/10 text-gray-300 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50">
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
