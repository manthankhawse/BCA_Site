'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Trophy, Plus, Trash2, Edit3, X, CloudUpload, CheckCircle2, AlertCircle, RefreshCw, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';

interface Category {
  label: string;
  items: string[];
}

interface Achiever {
  _id: string;
  name: string;
  title: string;
  photo: string;
  categories: Category[];
  order: number;
}

const emptyForm = (): Omit<Achiever, '_id'> => ({
  name: '',
  title: '',
  photo: '',
  categories: [{ label: 'Notable Achievements', items: [''] }],
  order: 999,
});

export default function AdminAchievementsPage() {
  const [achievers, setAchievers] = useState<Achiever[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/achievements')
      .then(r => r.json())
      .then(d => { setAchievers(d.achievers || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  // --- Photo upload ---
  const handlePhotoUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    setPhotoUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'achievements');
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      if (!res.ok) throw new Error();
      const { url } = await res.json();
      setForm(p => ({ ...p, photo: url }));
    } catch {
      setError('Photo upload failed.');
    } finally {
      setPhotoUploading(false);
    }
  };

  // --- Achievement item helpers ---
  const addItem = () => setForm(p => {
    const items = [...p.categories[0].items, ''];
    return { ...p, categories: [{ label: 'Notable Achievements', items }] };
  });
  const updateItem = (ii: number, value: string) => setForm(p => {
    const items = [...p.categories[0].items];
    items[ii] = value;
    return { ...p, categories: [{ label: 'Notable Achievements', items }] };
  });
  const removeItem = (ii: number) => setForm(p => {
    const items = p.categories[0].items.filter((_, i) => i !== ii);
    return { ...p, categories: [{ label: 'Notable Achievements', items }] };
  });

  // --- Save ---
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.title || !form.photo) { setError('Name, title and photo are required.'); return; }
    setSaving(true); setError('');
    try {
      const url = editingId ? `/api/achievements/${editingId}` : '/api/achievements';
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save'); return; }
      setSuccess(editingId ? 'Updated!' : 'Achiever added!');
      setTimeout(() => setSuccess(''), 3000);
      setShowForm(false); setEditingId(null); setForm(emptyForm());
      load();
    } catch { setError('Network error'); }
    finally { setSaving(false); }
  };

  const handleEdit = (a: Achiever) => {
    // Flatten all existing items into a single category labeled 'Notable Achievements'
    const items = a.categories ? a.categories.flatMap(cat => cat.items) : [''];
    setForm({
      name: a.name,
      title: a.title,
      photo: a.photo,
      categories: [{ label: 'Notable Achievements', items: items.length > 0 ? items : [''] }],
      order: a.order
    });
    setEditingId(a._id); setShowForm(true); setError('');
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this achiever?')) return;
    const res = await fetch(`/api/achievements/${id}`, { method: 'DELETE' });
    if (res.ok) setAchievers(prev => prev.filter(a => a._id !== id));
  };

  const openNew = () => { setForm(emptyForm()); setEditingId(null); setShowForm(true); setError(''); };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy size={22} className="text-amber-400" /> Achievements Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">{achievers.length} Achievements · Changes appear instantly on landing page</p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white">
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg text-sm">
            <Plus size={16} /> Add Achievement
          </button>
        </div>
      </div>

      {/* Feedback */}
      {error && <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm"><AlertCircle size={15} />{error}</div>}
      {success && <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-300 text-sm"><CheckCircle2 size={15} />{success}</div>}

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" />
                {editingId ? 'Edit Achievement' : 'Add New Achievement'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-500 hover:text-white"><X size={18} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-6">
              {/* Photo Upload */}
              <div>
                <label className="block text-sm text-gray-400 mb-2">Student Photo <span className="text-red-400">*</span></label>
                <div className="flex gap-4 items-start">
                  {form.photo ? (
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-white/10 shrink-0">
                      <img src={form.photo} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setForm(p => ({ ...p, photo: '' }))}
                        className="absolute top-1 right-1 bg-black/70 text-white p-0.5 rounded-md"><X size={10} /></button>
                    </div>
                  ) : (
                    <div
                      onClick={() => photoInputRef.current?.click()}
                      className="w-24 h-24 rounded-xl border-2 border-dashed border-white/20 hover:border-amber-500/60 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shrink-0"
                    >
                      <CloudUpload size={20} className="text-gray-500" />
                      <span className="text-gray-600 text-[10px]">Upload</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <button type="button" onClick={() => photoInputRef.current?.click()} disabled={photoUploading}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white rounded-lg text-sm transition-all disabled:opacity-50">
                      <CloudUpload size={14} />
                      {photoUploading ? 'Uploading…' : form.photo ? 'Change Photo' : 'Upload Photo'}
                    </button>
                    <p className="text-gray-600 text-xs mt-1.5">JPG, PNG, WebP</p>
                  </div>
                </div>
                <input ref={photoInputRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handlePhotoUpload(e.target.files[0]); e.target.value = ''; }} />
              </div>

              {/* Name + Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Full Name <span className="text-red-400">*</span></label>
                  <input type="text" placeholder="Student Name" value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 text-sm" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1.5">Title / Tagline <span className="text-red-400">*</span></label>
                  <input type="text" placeholder="e.g National Chess Champion" value={form.title}
                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 text-sm" />
                </div>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm text-gray-400 mb-1.5">Display Order</label>
                <input type="number" min={1} value={form.order}
                  onChange={e => setForm(p => ({ ...p, order: Number(e.target.value) }))}
                  className="w-28 bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/60 text-sm" />
                <p className="text-gray-600 text-xs mt-1">Lower = appears first.</p>
              </div>

              {/* Achievements */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm text-gray-400 font-medium">Notable Achievements</label>
                  <button type="button" onClick={addItem}
                    className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 border border-amber-400/30 hover:border-amber-400/60 px-2.5 py-1 rounded-lg transition-all">
                    <Plus size={12} /> Add Achievement
                  </button>
                </div>

                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 space-y-3">
                  <div className="space-y-2">
                    {form.categories[0].items.map((item, ii) => (
                      <div key={ii} className="flex items-center gap-2">
                        <span className="text-gray-600 text-xs shrink-0">·</span>
                        <input
                          type="text"
                          placeholder="e.g. 🥇 Gold Medal – Under-10 Blitz…"
                          value={item}
                          onChange={e => updateItem(ii, e.target.value)}
                          className="flex-1 bg-[#222] border border-white/10 rounded-lg px-3 py-1.5 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 text-sm"
                        />
                        <button type="button" onClick={() => removeItem(ii)} disabled={form.categories[0].items.length === 1}
                          className="text-gray-600 hover:text-red-400 disabled:opacity-30 flex items-center justify-center p-1.5"><X size={14} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Form actions */}
              <div className="flex gap-3 pt-2 border-t border-white/10">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-white/10 rounded-lg text-gray-400 hover:text-white text-sm transition-all">Cancel</button>
                <button type="submit" disabled={saving || photoUploading}
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold rounded-lg text-sm flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><Trophy size={14} />{editingId ? 'Save Changes' : 'Add Achievement'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Achievers list */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : achievers.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/2">
          <Trophy size={40} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500 text-sm">No champions yet. Add the first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {achievers.map(a => (
            <div key={a._id} className="flex items-center gap-4 bg-[#111] border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all group">
              <img src={a.photo} alt={a.name} className="w-14 h-14 rounded-xl object-cover object-top shrink-0 border border-white/10" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold text-sm truncate">{a.name}</p>
                  {/* <span className="text-gray-600 text-xs shrink-0">{a.order}</span> */}
                </div>
                <p className="text-gray-500 text-xs truncate mt-0.5">{a.title}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {a.categories.map((cat, ci) => (
                    <span key={ci} className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full px-2 py-0.5">
                      {cat.label} ({cat.items.length})
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(a)} className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-all">
                  <Edit3 size={14} />
                </button>
                <button onClick={() => handleDelete(a._id)} className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-400 hover:text-red-300 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-gray-700 text-xs text-center pb-4">
        Note: The landing page shows these achievers dynamically if any exist, otherwise falls back to the hardcoded list in code.
      </p>
    </div>
  );
}
