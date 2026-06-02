'use client';
import { useEffect, useState } from 'react';
import { Plus, Trophy, Users, Calendar, X, ExternalLink, Link as LinkIcon, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface Tournament {
  _id: string; name: string; type: string; format: string; status: string;
  startDate: string; rounds: number; maxParticipants?: number;
  participants: unknown[]; createdAt: string; description?: string;
  venue?: string; platform?: string; link?: string; prizes?: string;
  locationType: string; entryFee?: string; registrationLink?: string;
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const FORMAT_EMOJIS: Record<string, string> = {
  classical: '♔', rapid: '⚡', blitz: '🔥', bullet: '💨',
};

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [form, setForm] = useState({
    name: '', description: '', type: 'swiss', format: 'rapid',
    status: 'upcoming', startDate: '', endDate: '',
    rounds: 5, maxParticipants: '',
    venue: '', prizes: '', locationType: 'offline', platform: '', link: '',
    registrationLink: '', entryFee: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchTournaments = () => {
    const q = filterStatus ? `?status=${filterStatus}` : '';
    fetch(`/api/tournaments${q}`)
      .then(r => r.json())
      .then(d => { setTournaments(d.tournaments || []); setLoading(false); });
  };

  useEffect(() => { fetchTournaments(); }, [filterStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch('/api/tournaments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        rounds: Number(form.rounds),
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : undefined,
      }),
    });
    const data = await res.json();
    if (res.ok) { setTournaments(t => [data.tournament, ...t]); setShowForm(false); }
    setSaving(false);
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/tournaments/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setTournaments(t => t.map(x => x._id === id ? { ...x, status } : x));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Tournaments</h1>
          <p className="text-gray-400 text-sm mt-1">{tournaments.length} tournaments</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
          <Plus size={16} /> New Tournament
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-[#1a1a1a] border border-white/5 rounded-xl p-1 w-fit">
        {['', 'upcoming', 'completed'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filterStatus === s ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {/* Create Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-lg flex items-center gap-2"><Trophy size={18} className="text-amber-400" /> New Tournament</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Tournament Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. BCA Summer Open 2026"
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                    {['swiss', 'round_robin', 'knockout', 'arena'].map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Format</label>
                  <select value={form.format} onChange={e => setForm(f => ({ ...f, format: e.target.value }))}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                    {['classical', 'rapid', 'blitz', 'bullet'].map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Start Date *</label>
                  <input required type="datetime-local" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">End Date</label>
                  <input type="datetime-local" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Rounds</label>
                  <input type="number" value={form.rounds} onChange={e => setForm(f => ({ ...f, rounds: Number(e.target.value) }))}
                    min={1} max={20}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Max Participants</label>
                  <input type="number" value={form.maxParticipants} onChange={e => setForm(f => ({ ...f, maxParticipants: e.target.value }))}
                    placeholder="Unlimited"
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                  {['upcoming', 'completed'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} placeholder="Tournament details..."
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Location Type</label>
                  <select value={form.locationType} onChange={e => setForm(f => ({ ...f, locationType: e.target.value }))}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                    <option value="offline">Offline / Over-the-board</option>
                    <option value="online">Online</option>
                  </select>
                </div>
                {form.locationType === 'offline' ? (
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Venue</label>
                    <input value={form.venue} onChange={e => setForm(f => ({ ...f, venue: e.target.value }))}
                      placeholder="e.g. Chess Club Hall"
                      className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                  </div>
                ) : (
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Platform</label>
                    <input value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}
                      placeholder="e.g. Lichess, Chess.com"
                      className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                  </div>
                )}
              </div>
              {form.locationType === 'online' && (
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Tournament Link</label>
                  <input value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))}
                    placeholder="https://lichess.org/tournament/..."
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Entry Fee</label>
                  <input value={form.entryFee} onChange={e => setForm(f => ({ ...f, entryFee: e.target.value }))}
                    placeholder="e.g. ₹200 or Free"
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="text-gray-400 text-xs mb-1 block">Prizes</label>
                  <input value={form.prizes} onChange={e => setForm(f => ({ ...f, prizes: e.target.value }))}
                    placeholder="1st: Medal, 2nd: Trophy..."
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="text-gray-400 text-xs mb-1 block">Registration Link (external)</label>
                <input value={form.registrationLink} onChange={e => setForm(f => ({ ...f, registrationLink: e.target.value }))}
                  placeholder="https://forms.google.com/..."
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-lg text-sm transition-colors">Cancel</button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black py-2.5 rounded-lg text-sm font-semibold transition-colors">
                  {saving ? 'Creating...' : 'Create Tournament'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tournament grid */}
      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : tournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#1a1a1a] rounded-xl border border-white/5 text-gray-500">
          <Trophy size={48} className="opacity-20" />
          <p>No tournaments found</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tournaments.map(t => (
            <div key={t._id} className="bg-[#1a1a1a] border border-white/5 hover:border-amber-500/20 rounded-xl p-5 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{FORMAT_EMOJIS[t.format] || '♟'}</span>
                  <div>
                    <h3 className="text-white font-semibold text-sm">{t.name}</h3>
                    <p className="text-gray-500 text-xs capitalize">{t.type.replace('_', ' ')} · {t.format}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[t.status] || ''}`}>
                  {t.status}
                </span>
              </div>
              {t.description && <p className="text-gray-400 text-xs mb-3 line-clamp-2">{t.description}</p>}
              <div className="flex flex-wrap gap-3 mb-3">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                  <Calendar size={12} /> {new Date(t.startDate).toLocaleDateString()}
                </div>
                {t.maxParticipants && (
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <Users size={12} /> Max {t.maxParticipants}
                  </div>
                )}
                <div className="text-gray-400 text-xs">{t.rounds} rounds</div>
                {(t as any).entryFee && (
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-medium">
                    <DollarSign size={11} /> {(t as any).entryFee}
                  </div>
                )}
              </div>
              {t.prizes && <p className="text-xs text-gray-500 mb-3">🏆 {t.prizes}</p>}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={t.status}
                  onChange={e => updateStatus(t._id, e.target.value)}
                  className="flex-1 bg-[#2a2a2a] border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs focus:outline-none"
                >
                  {['upcoming', 'completed'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                {(t as any).registrationLink && (
                  <a href={(t as any).registrationLink} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 rounded-lg text-xs font-medium transition-colors">
                    <LinkIcon size={11} /> Register
                  </a>
                )}
                {t.link && (
                  <a href={t.link} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-medium transition-colors">
                    <ExternalLink size={11} /> Play
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
