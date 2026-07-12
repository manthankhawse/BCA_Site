'use client';
import { useEffect, useState, useRef } from 'react';
import { Image as ImageIcon, Plus, Trash2, Upload, X, Lock, RefreshCw } from 'lucide-react';

interface GalleryItem {
  _id: string;
  url: string;
  caption?: string;
  isDefault: boolean;
  order: number;
}

// Default images seeded on the landing page
const DEFAULT_GALLERY = [
  "IMG-20240617-WA0017.jpg", "IMG-20240617-WA0018.jpg", "IMG-20240617-WA0022.jpg",
  "IMG-20240617-WA0023.jpg", "IMG-20240617-WA0024.jpg", "IMG-20240617-WA0025.jpg",
  "IMG-20240617-WA0026.jpg", "IMG-20240617-WA0027.jpg", "IMG-20240617-WA0028.jpg",
  "IMG-20240617-WA0029.jpg", "IMG-20240617-WA0030.jpg",
];

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ url: '', caption: '', order: 999 });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    fetch('/api/gallery')
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.url) { setError('Image URL is required'); return; }
    setAdding(true);
    setError('');
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to add'); return; }
      setItems(prev => [...prev, data.item]);
      setForm({ url: '', caption: '', order: 999 });
      setShowForm(false);
    } catch {
      setError('Network error');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this gallery image?')) return;
    const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setItems(prev => prev.filter(i => i._id !== id));
    }
  };

  // Bento layout logic: same as landing page
  const getBentoSpan = (index: number, total: number) => {
    if (index === 0) return 'col-span-2 row-span-2';
    if (index === 3 || index === 7) return 'row-span-2';
    return '';
  };

  const allItems: (GalleryItem | { url: string; caption?: string; isDefault: true; _id: string; order: number })[] =
    items.length > 0
      ? items
      : DEFAULT_GALLERY.map((img, i) => ({
          _id: `default-${i}`,
          url: `/assets/gallery/${img}`,
          caption: `Default photo ${i + 1}`,
          isDefault: true,
          order: i,
        }));

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon size={22} className="text-amber-400" /> Gallery Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {allItems.length} photos · Bento grid layout adjusts dynamically
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm transition-all">
            <Plus size={16} /> Add Photo
          </button>
        </div>
      </div>

      {/* Add Photo Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Upload size={16} className="text-amber-400" /> Add Gallery Photo
              </h2>
              <button onClick={() => { setShowForm(false); setError(''); }}
                className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Image URL <span className="text-red-400">*</span></label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg or /assets/gallery/photo.jpg"
                  value={form.url}
                  onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 text-sm"
                />
                <p className="text-gray-600 text-xs mt-1">Paste an image URL or use a path from /public/assets/gallery/</p>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Caption (optional)</label>
                <input
                  type="text"
                  placeholder="Tournament highlight, award ceremony..."
                  value={form.caption}
                  onChange={e => setForm(p => ({ ...p, caption: e.target.value }))}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/60 text-sm"
                />
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
                <p className="text-gray-600 text-xs mt-1">Lower numbers appear first. Default images have order 0–10.</p>
              </div>

              {/* Preview */}
              {form.url && (
                <div className="rounded-xl overflow-hidden border border-white/10 h-40">
                  <img src={form.url} alt="Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).src = ''; }} />
                </div>
              )}

              {error && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setError(''); }}
                  className="flex-1 py-2.5 border border-white/10 rounded-lg text-gray-400 hover:text-white text-sm transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={adding}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold rounded-lg text-sm transition-all flex items-center justify-center gap-2">
                  {adding ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Plus size={14} /> Add Photo</>}
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
          <p className="text-blue-300 text-sm font-medium">Default photos are protected</p>
          <p className="text-gray-500 text-xs mt-0.5">The original 11 gallery images cannot be deleted. Photos you add can be removed anytime.</p>
        </div>
      </div>

      {/* Bento grid preview */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 auto-rows-[180px]">
          {allItems.map((item, index) => {
            const spanClass = getBentoSpan(index, allItems.length);
            const isDefault = item.isDefault;
            return (
              <div key={item._id} className={`group relative rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 ${spanClass}`}>
                <img
                  src={item.url}
                  alt={item.caption || `Photo ${index + 1}`}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      {item.caption && <p className="text-white text-xs font-medium truncate">{item.caption}</p>}
                      {isDefault && (
                        <span className="flex items-center gap-1 text-gray-400 text-[10px] mt-0.5">
                          <Lock size={9} /> Default
                        </span>
                      )}
                    </div>
                    {!isDefault && (
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="bg-red-500/80 hover:bg-red-500 text-white p-1.5 rounded-lg transition-all ml-2 shrink-0">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
                {isDefault && (
                  <div className="absolute top-2 right-2">
                    <span className="bg-black/60 text-gray-400 text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Lock size={8} /> Default
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-gray-600 text-xs text-center pb-4">
        The landing page gallery shows the same bento grid layout. First image spans 2×2, positions 4 and 8 span 2 rows tall.
      </p>
    </div>
  );
}
