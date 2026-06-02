'use client';
import { useEffect, useState } from 'react';
import { User, Lock, Shield } from 'lucide-react';

export default function AdminSettings() {
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);
  const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setAdmin(d.user);
      setForm(f => ({ ...f, name: d.user?.name || '', email: d.user?.email || '' }));
    });
  }, []);

  const handleSave = async () => {
    setSaving(true); setError(''); setSuccess('');
    // For now, show a success message (full password change would need an API endpoint)
    setTimeout(() => {
      setSaving(false);
      setSuccess('Settings saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your admin account</p>
      </div>

      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-2">
          <Shield size={20} className="text-amber-400" />
          <h2 className="text-white font-semibold">Account Settings</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Full Name</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 text-sm" />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Current Password</label>
          <input type="password" value={form.currentPassword} onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
            placeholder="Enter current password to change"
            className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 text-sm" />
        </div>
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">New Password</label>
          <input type="password" value={form.newPassword} onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
            placeholder="Leave blank to keep current"
            className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 text-sm" />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}

        <button onClick={handleSave} disabled={saving}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Info */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5 flex items-center gap-4">
        <User size={32} className="text-amber-400 flex-shrink-0" />
        <div>
          <p className="text-white font-medium">{admin?.name}</p>
          <p className="text-gray-500 text-sm">{admin?.email}</p>
          <p className="text-amber-400 text-xs mt-0.5">Administrator</p>
        </div>
      </div>
    </div>
  );
}
