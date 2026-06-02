'use client';
import { useEffect, useState } from 'react';
import { Trophy, Calendar, Users, ExternalLink, Link as LinkIcon, DollarSign } from 'lucide-react';

interface Tournament {
  _id: string; name: string; type: string; format: string; status: string;
  startDate: string; rounds: number; maxParticipants?: number;
  participants: { userId: string }[];
  description?: string; venue?: string; prizes?: string;
  locationType?: 'online' | 'offline'; platform?: string; link?: string;
  registrationLink?: string; entryFee?: string;
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

const FORMAT_EMOJIS: Record<string, string> = {
  classical: '♔', rapid: '⚡', blitz: '🔥', bullet: '💨',
};

export default function StudentTournaments() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const q = filter ? `?status=${filter}` : '';
    fetch(`/api/tournaments${q}`)
      .then(r => r.json())
      .then(d => { setTournaments(d.tournaments || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [filter]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Trophy size={22} className="text-orange-400" /> Tournaments
        </h1>
        <p className="text-gray-400 text-sm mt-1">Academy chess tournaments</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-[#1a1a1a] border border-white/5 rounded-xl p-1 w-fit">
        {[
          { val: '', label: 'All' },
          { val: 'upcoming', label: '📅 Upcoming' },
          { val: 'completed', label: '✅ Completed' },
        ].map(f => (
          <button key={f.val} onClick={() => setFilter(f.val)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f.val ? 'bg-orange-500 text-black' : 'text-gray-400 hover:text-white'}`}>
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading tournaments...</div>
      ) : tournaments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#1a1a1a] rounded-xl border border-white/5 text-gray-500">
          <Trophy size={48} className="opacity-20" />
          <p>No tournaments found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tournaments.map(t => (
            <div key={t._id} className="bg-[#1a1a1a] border border-white/5 hover:border-orange-500/20 rounded-xl p-5 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center text-2xl shrink-0">
                    {FORMAT_EMOJIS[t.format] || '♟'}
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{t.name}</h3>
                    <p className="text-gray-500 text-xs capitalize mt-0.5">{t.type.replace('_', ' ')} · {t.format} · {t.rounds} rounds</p>
                  </div>
                </div>
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[t.status] || ''}`}>
                  {t.status}
                </span>
              </div>

              {t.description && <p className="text-gray-400 text-sm mt-3">{t.description}</p>}

              <div className="flex flex-wrap gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Calendar size={12} /> {new Date(t.startDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {t.maxParticipants && (
                  <span className="flex items-center gap-1.5">
                    <Users size={12} /> Max {t.maxParticipants} players
                  </span>
                )}
                {t.locationType === 'online' ? (
                  <span className="flex items-center gap-1.5 text-blue-400">
                    🌐 {t.platform || 'Online'}
                  </span>
                ) : t.venue ? (
                  <span>📍 {t.venue}</span>
                ) : null}
                {t.prizes && <span>🏅 {t.prizes}</span>}
                {t.entryFee && (
                  <span className="flex items-center gap-1 text-amber-400 font-medium">
                    <DollarSign size={11} /> {t.entryFee}
                  </span>
                )}
              </div>

              {(t.registrationLink || (t.locationType === 'online' && t.link)) && (
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                  {t.registrationLink && (
                    <a href={t.registrationLink} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
                      <LinkIcon size={14} /> Register Now
                    </a>
                  )}
                  {t.locationType === 'online' && t.link && (
                    <a href={t.link} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 px-4 py-2 rounded-lg text-sm transition-colors">
                      <ExternalLink size={14} /> Play Online
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
