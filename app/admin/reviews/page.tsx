'use client';
import { useEffect, useState } from 'react';
import { Star, Plus, Trash2, Lock, X, RefreshCw, Quote } from 'lucide-react';

interface Review {
  _id: string;
  name: string;
  comment: string;
  role: string;
  rating: number;
  isDefault: boolean;
  order: number;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', comment: '', role: 'BCA Student / Parent', rating: 5, order: 999 });

  const load = () => {
    setLoading(true);
    fetch('/api/reviews')
      .then(r => r.json())
      .then(d => { setReviews(d.reviews || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.comment) { setError('Name and comment are required'); return; }
    setAdding(true);
    setError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to add'); return; }
      setReviews(prev => [...prev, data.review]);
      setForm({ name: '', comment: '', role: 'BCA Student / Parent', rating: 5, order: 999 });
      setShowForm(false);
    } catch {
      setError('Network error');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return;
    const res = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
    if (res.ok) setReviews(prev => prev.filter(r => r._id !== id));
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Star size={22} className="text-amber-400" /> Reviews & Testimonials
          </h1>
          <p className="text-gray-400 text-sm mt-1">{reviews.length} reviews displayed in landing page carousel</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-all">
            <Plus size={16} /> Add Review
          </button>
        </div>
      </div>

      {/* Add Review Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Quote size={16} className="text-amber-400" /> Add Testimonial
              </h2>
              <button onClick={() => { setShowForm(false); setError(''); }}
                className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Name <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    placeholder="Student / Parent name"
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Role / Title</label>
                  <input
                    type="text"
                    placeholder="BCA Student / Parent"
                    value={form.role}
                    onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Testimonial <span className="text-red-400">*</span></label>
                <textarea
                  placeholder="Share the student's experience..."
                  rows={4}
                  value={form.comment}
                  onChange={e => setForm(p => ({ ...p, comment: e.target.value }))}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 text-sm resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Rating (1–5)</label>
                  <select
                    value={form.rating}
                    onChange={e => setForm(p => ({ ...p, rating: Number(e.target.value) }))}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500/60 text-sm"
                  >
                    {[5, 4, 3, 2, 1].map(r => (
                      <option key={r} value={r}>{'★'.repeat(r)} {r}/5</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={form.order}
                    onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500/60 text-sm"
                  />
                </div>
              </div>

              {error && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setError(''); }}
                  className="flex-1 py-2.5 border border-white/10 rounded-lg text-gray-400 hover:text-white text-sm transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={adding}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2">
                  {adding ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Plus size={14} /> Add Review</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Info banner */}
      <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <Lock size={16} className="text-blue-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-blue-300 text-sm font-medium">Default reviews are protected</p>
          <p className="text-gray-500 text-xs mt-0.5">The 5 original testimonials cannot be deleted. Reviews you add can be removed anytime. The landing page loads reviews from the database when available, otherwise falls back to defaults.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-12 text-center">
          <Star size={36} className="text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No reviews in database yet</p>
          <p className="text-gray-600 text-xs">The landing page uses built-in default reviews. Click "Add Review" to manage them from here.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {reviews.map(review => (
            <div key={review._id}
              className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5 relative group hover:border-white/10 transition-all">
              {review.isDefault && (
                <span className="absolute top-4 right-4 flex items-center gap-1 text-gray-600 text-[10px]">
                  <Lock size={9} /> Default
                </span>
              )}

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[...Array(review.rating)].map((_, i) => (
                  <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                ))}
              </div>

              <Quote size={20} className="text-white/10 mb-2" />
              <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">"{review.comment}"</p>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-semibold">{review.name}</p>
                  <p className="text-gray-500 text-xs">{review.role}</p>
                </div>
                {!review.isDefault && (
                  <button onClick={() => handleDelete(review._id)}
                    className="opacity-0 group-hover:opacity-100 bg-red-500/10 border border-red-500/20 text-red-400 p-2 rounded-lg hover:bg-red-500/20 transition-all">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
