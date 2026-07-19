'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { Image as ImageIcon, Plus, RefreshCw, CloudUpload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AdaptiveGallery } from '@/components/AdaptiveGallery';

interface GalleryItem {
  _id: string;
  url: string;
  caption?: string;
  order: number;
}

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const [caption, setCaption] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetch('/api/gallery')
      .then(r => r.json())
      .then(d => { setItems(d.items || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const uploadFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (!arr.length) { setError('Please select image files only.'); return; }

    setUploading(true);
    setError('');
    setSuccess('');
    setUploadProgress([]);

    const uploaded: GalleryItem[] = [];

    for (let i = 0; i < arr.length; i++) {
      const file = arr[i];
      setUploadProgress(prev => [...prev, `Uploading ${file.name}…`]);

      try {
        // 1. Upload file to R2
        const fd = new FormData();
        fd.append('file', file);
        fd.append('folder', 'gallery');
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!uploadRes.ok) throw new Error('Upload failed');
        const { url } = await uploadRes.json();

        // 2. Save to DB
        const dbRes = await fetch('/api/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, caption: caption || undefined, order: 999 }),
        });
        if (!dbRes.ok) throw new Error('Failed to save');
        const { item } = await dbRes.json();
        uploaded.push(item);

        setUploadProgress(prev => {
          const updated = [...prev];
          updated[i] = `✓ ${file.name}`;
          return updated;
        });
      } catch (err) {
        setUploadProgress(prev => {
          const updated = [...prev];
          updated[i] = `✗ ${file.name} — failed`;
          return updated;
        });
      }
    }

    setItems(prev => [...prev, ...uploaded]);
    setCaption('');
    setUploading(false);
    if (uploaded.length > 0) {
      setSuccess(`${uploaded.length} photo${uploaded.length > 1 ? 's' : ''} added to gallery.`);
      setTimeout(() => setSuccess(''), 4000);
    }
    setTimeout(() => setUploadProgress([]), 3000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) uploadFiles(e.target.files);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this photo from the gallery?')) return;
    const res = await fetch(`/api/gallery/${id}`, { method: 'DELETE' });
    if (res.ok) setItems(prev => prev.filter(i => i._id !== id));
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ImageIcon size={22} className="text-amber-400" /> Gallery Management
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {items.length} photo{items.length !== 1 ? 's' : ''} · Upload images directly from your device
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-all">
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold rounded-lg text-sm transition-all"
          >
            <Plus size={16} /> Add Photos
          </button>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-300 text-sm">
          <AlertCircle size={15} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-300 text-sm">
          <CheckCircle2 size={15} /> {success}
        </div>
      )}

      {/* Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
          dragOver
            ? 'border-amber-400 bg-amber-500/10'
            : 'border-white/10 bg-white/2 hover:border-white/30 hover:bg-white/5'
        } ${uploading ? 'pointer-events-none' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
        <CloudUpload size={40} className={`mx-auto mb-4 ${dragOver ? 'text-amber-400' : 'text-gray-500'}`} />
        <p className="text-white font-medium mb-1">
          {uploading ? 'Uploading…' : 'Drop images here or click to browse'}
        </p>
        <p className="text-gray-500 text-sm">Supports JPG, PNG, WebP · Multiple files allowed</p>

        {/* Upload progress */}
        {uploadProgress.length > 0 && (
          <div className="mt-5 space-y-1.5 text-left max-w-sm mx-auto">
            {uploadProgress.map((msg, i) => (
              <div key={i} className={`text-xs px-3 py-1.5 rounded-lg ${
                msg.startsWith('✓') ? 'bg-green-500/15 text-green-300'
                : msg.startsWith('✗') ? 'bg-red-500/15 text-red-300'
                : 'bg-white/5 text-gray-400'
              }`}>{msg}</div>
            ))}
          </div>
        )}
      </div>

      {/* Optional caption for batch upload */}
      {/* <div>
        <label className="block text-sm text-gray-400 mb-1.5">Caption for uploaded photos <span className="text-gray-600">(optional)</span></label>
        <input
          type="text"
          placeholder="e.g. State Championship 2024"
          value={caption}
          onChange={e => setCaption(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-amber-500/60 text-sm max-w-md"
        />
        <p className="text-gray-600 text-xs mt-1">This caption will appear on hover in the gallery.</p>
      </div> */}

      {/* Bento preview */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 border border-white/5 rounded-2xl bg-white/2">
          <ImageIcon size={40} className="mx-auto text-gray-700 mb-3" />
          <p className="text-gray-500 text-sm">No photos yet. Upload some above.</p>
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-xs mb-3">Adaptive preview — each image sizes itself from its actual proportions</p>
          <AdaptiveGallery
            images={items.map(it => ({ _id: it._id, url: it.url, caption: it.caption }))}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  );
}
