'use client';
import { useEffect, useState } from 'react';
import { User, Lock, Shield, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function AdminSettings() {
  const [admin, setAdmin] = useState<{ name: string; email: string } | null>(null);
  const [form, setForm] = useState({ name: '', email: '', currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      setAdmin(d.user);
      setForm(f => ({ ...f, name: d.user?.name || '', email: d.user?.email || '' }));
    });
  }, []);

  const handleSave = async () => {
    setError(''); setSuccess('');

    // Validate passwords match if changing password
    if (form.newPassword || form.confirmPassword) {
      if (!form.currentPassword) {
        setError('Current password is required to set a new password.');
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
      if (form.newPassword.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
    }

    setSaving(true);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save settings.');
      } else {
        setSuccess('Settings saved successfully!');
        // Update local admin state
        setAdmin({ name: form.name, email: form.email });
        // Clear password fields
        setForm(f => ({ ...f, currentPassword: '', newPassword: '', confirmPassword: '' }));
        setTimeout(() => setSuccess(''), 4000);
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your admin account</p>
      </div>

      {/* Account Info Card */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5 flex items-center gap-4">
        <div className="size-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-black font-bold text-xl shrink-0">
          {admin?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
        <div>
          <p className="text-white font-semibold text-lg">{admin?.name}</p>
          <p className="text-gray-500 text-sm">{admin?.email}</p>
          <p className="text-amber-400 text-xs mt-0.5 font-medium">Administrator</p>
        </div>
      </div>

      {/* Settings Form */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-6 space-y-5">
        <div className="flex items-center gap-3 mb-4">
          <Shield size={20} className="text-amber-400" />
          <h2 className="text-white font-semibold text-lg">Account Settings</h2>
        </div>

        {/* Name & Email */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 text-sm transition-colors"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 pt-2">
          <Lock size={16} className="text-amber-400 shrink-0" />
          <p className="text-gray-400 text-sm font-medium">Change Password <span className="text-gray-600 font-normal">(leave blank to keep current)</span></p>
        </div>

        {/* Current Password */}
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Current Password</label>
          <div className="relative">
            <input
              type={showCurrent ? 'text' : 'password'}
              value={form.currentPassword}
              onChange={e => setForm(f => ({ ...f, currentPassword: e.target.value }))}
              placeholder="Enter your current password"
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 text-sm transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">New Password</label>
          <div className="relative">
            <input
              type={showNew ? 'text' : 'password'}
              value={form.newPassword}
              onChange={e => setForm(f => ({ ...f, newPassword: e.target.value }))}
              placeholder="Min. 6 characters"
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 text-sm transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowNew(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-sm text-gray-300 mb-1.5">Confirm New Password</label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))}
              placeholder="Re-enter new password"
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/50 text-sm transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        {/* Feedback */}
        {error && (
          <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg">
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-3 rounded-lg">
            <CheckCircle size={14} className="shrink-0" /> {success}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold px-6 py-2.5 rounded-lg transition-colors text-sm"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
