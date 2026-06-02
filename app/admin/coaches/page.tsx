'use client';
import { useEffect, useState } from 'react';
import { Plus, Trash2, Search, UserPlus, BookOpen, X, Save } from 'lucide-react';

interface Coach {
  _id: string;
  name: string;
  email: string;
  rating?: number;
  specialization?: string[];
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminCoaches() {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', bio: '',
    specialization: '', rating: 1800,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/coaches')
      .then(r => r.json())
      .then(d => { setCoaches(d.coaches || []); setLoading(false); });
  }, []);

  const filtered = coaches.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError('');
    const res = await fetch('/api/admin/coaches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        specialization: form.specialization.split(',').map(s => s.trim()).filter(Boolean),
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed'); setSaving(false); return; }
    setCoaches(c => [data.coach, ...c]);
    setShowForm(false);
    setForm({ name: '', email: '', password: '', phone: '', bio: '', specialization: '', rating: 1800 });
    setSaving(false);
  };

  const deleteCoach = async (id: string) => {
    if (!confirm('Delete this coach?')) return;
    await fetch(`/api/admin/coaches/${id}`, { method: 'DELETE' });
    setCoaches(c => c.filter(x => x._id !== id));
  };

  const toggleActive = async (coach: Coach) => {
    await fetch(`/api/admin/coaches/${coach._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !coach.isActive }),
    });
    setCoaches(c => c.map(x => x._id === coach._id ? { ...x, isActive: !x.isActive } : x));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Coaches</h1>
          <p className="text-gray-400 text-sm mt-1">{coaches.length} total coaches</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <UserPlus size={16} /> Add Coach
        </button>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-amber-500/50" />
      </div>

      {/* Add Coach Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg">Add New Coach</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            {error && <p className="text-red-400 text-sm mb-4 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Full Name *', key: 'name', type: 'text', placeholder: 'Coach name' },
                  { label: 'Email *', key: 'email', type: 'email', placeholder: 'coach@bca.com' },
                  { label: 'Password *', key: 'password', type: 'password', placeholder: 'Min 6 characters' },
                  { label: 'Phone', key: 'phone', type: 'tel', placeholder: '+91 9876543210' },
                  { label: 'Chess Rating', key: 'rating', type: 'number', placeholder: '1800' },
                  { label: 'Specializations (comma-separated)', key: 'specialization', type: 'text', placeholder: 'Opening, Endgame' },
                ].map(field => (
                  <div key={field.key} className={field.key === 'specialization' ? 'col-span-2' : ''}>
                    <label className="text-gray-400 text-xs mb-1 block">{field.label}</label>
                    <input
                      type={field.type}
                      value={form[field.key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [field.key]: field.type === 'number' ? Number(e.target.value) : e.target.value }))}
                      placeholder={field.placeholder}
                      required={field.label.includes('*')}
                      className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  {saving ? 'Adding...' : 'Add Coach'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coaches Table */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No coaches found</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map(coach => (
              <div key={coach._id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold">
                    {coach.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium">{coach.name}</p>
                    <p className="text-gray-500 text-xs">{coach.email}</p>
                    {coach.specialization && coach.specialization.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {coach.specialization.map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-mono font-bold">{coach.rating}</span>
                  <button onClick={() => toggleActive(coach)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      coach.isActive
                        ? 'border-emerald-500/30 text-emerald-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30'
                        : 'border-gray-500/30 text-gray-400 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/30'
                    }`}>
                    {coach.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => deleteCoach(coach._id)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
