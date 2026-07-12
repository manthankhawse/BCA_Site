'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus, X, MessageSquare, Pin, Paperclip, Send,
  Trash2, ChevronDown, ChevronUp, File, Loader2
} from 'lucide-react';

interface Comment {
  _id: string;
  author: { _id: string; name: string; role: string };
  body: string;
  createdAt: string;
}

interface Post {
  _id: string;
  title?: string;
  body: string;
  type: string;
  author: { _id: string; name: string; avatar?: string; role: string };
  reactions: { user: string; emoji: string }[];
  isPinned: boolean;
  attachments: { url: string; type: string }[];
  comments: Comment[];
  createdAt: string;
}

const EMOJIS = ['♟️', '👍', '🔥', '🧠', '♛', '❤️'];

function PostCard({ post, onReact, onDelete }: {
  post: Post;
  onReact: (postId: string, emoji: string) => void;
  onDelete: (postId: string) => void;
}) {
  const reactionMap: Record<string, number> = {};
  post.reactions.forEach(r => { reactionMap[r.emoji] = (reactionMap[r.emoji] || 0) + 1; });

  return (
    <div className={`bg-[#1a1a1a] border rounded-xl overflow-hidden transition-all ${post.isPinned ? 'border-amber-500/30' : 'border-white/5'}`}>
      {post.isPinned && (
        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium px-5 pt-3">
          <Pin size={11} /> Pinned
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 font-bold text-sm shrink-0">
              {post.author.name[0].toUpperCase()}
            </div>
            <div>
              <span className="text-white text-sm font-medium">{post.author.name}</span>
              <span className="text-gray-500 text-xs ml-2 capitalize">{post.author.role}</span>
              <p className="text-gray-500 text-xs">{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
              post.type === 'announcement' ? 'bg-amber-500/15 text-amber-400' :
              post.type === 'puzzle_challenge' ? 'bg-violet-500/15 text-violet-400' :
              post.type === 'analysis' ? 'bg-cyan-500/15 text-cyan-400' : 'bg-white/5 text-gray-400'}`}>
              {post.type.replace('_', ' ')}
            </span>
            <button onClick={() => onDelete(post._id)} className="p-1 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {post.title && <h3 className="text-white font-semibold mb-1">{post.title}</h3>}
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>

        {/* Attachments - Rich Preview */}
        {post.attachments?.length > 0 && (
          <div className="mt-4 grid gap-3">
            {post.attachments.map((att, i) => (
              <div key={i} className="border border-white/10 rounded-lg overflow-hidden bg-[#222]">
                {att.type === 'image' ? (
                  <img src={att.url} alt="" className="w-full max-h-96 object-contain bg-black cursor-pointer" onClick={() => window.open(att.url)} />
                ) : att.type === 'video' ? (
                  <video src={att.url} controls className="w-full max-h-96 bg-black" />
                ) : att.type === 'pdf' ? (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 p-3 bg-white/5 border-b border-white/10">
                      <File size={16} className="text-red-400" />
                      <span className="text-sm font-medium text-white flex-1 truncate">PDF Document</span>
                      <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white transition-colors">Open PDF</a>
                    </div>
                    <iframe src={att.url} className="w-full h-64 bg-white" />
                  </div>
                ) : (
                  <a href={att.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center text-gray-400 shrink-0">
                      <File size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">Attached File</p>
                      <p className="text-xs text-gray-500 truncate">{att.url}</p>
                    </div>
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 mt-4 flex-wrap">
          {EMOJIS.map(emoji => (
            <button key={emoji} onClick={() => onReact(post._id, emoji)}
              className="text-lg hover:scale-125 transition-transform">
              {emoji}
            </button>
          ))}
          {Object.entries(reactionMap).length > 0 && (
            <div className="ml-2 flex gap-2">
              {Object.entries(reactionMap).map(r => (
                <span key={r[0]} className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-gray-300">{r[0]} {r[1]}</span>
              ))}
            </div>
          )}
        </div>

        <Link
          href={`/admin/posts/${post._id}`}
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-xs mt-3 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5"
        >
          <MessageSquare size={14} />
          {post.comments?.length || 0} class comment{(post.comments?.length || 0) !== 1 ? 's' : ''}
        </Link>
      </div>
    </div>
  );
}

export default function AdminCommunity() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', type: 'announcement', isPinned: false });
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchPosts = async () => {
    const res = await fetch('/api/posts');
    const data = await res.json();
    setPosts(data.posts || []);
    setLoading(false);
  };

  useEffect(() => { fetchPosts(); }, []);

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'community');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const { url } = await res.json();
    const type = file.type.startsWith('image') ? 'image' : file.type === 'application/pdf' ? 'pdf' : file.type.startsWith('video') ? 'video' : 'file';
    return { url, type };
  };

  const handlePost = async () => {
    setSaving(true);
    try {
      const attachments = [];
      for (const file of uploadFiles) attachments.push(await uploadFile(file));
      const res = await fetch('/api/posts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, attachments }),
      });
      if (res.ok) {
        await fetchPosts();
        setShowModal(false);
        setForm({ title: '', body: '', type: 'announcement', isPinned: false });
        setUploadFiles([]);
      }
    } finally { setSaving(false); }
  };

  const handleReact = async (postId: string, emoji: string) => {
    await fetch(`/api/posts/${postId}/react`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    });
    await fetchPosts();
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Community</h1>
          <p className="text-gray-400 text-sm mt-1">{posts.length} posts</p>
        </div>
        <button id="create-post-btn" onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2.5 rounded-lg transition-colors">
          <Plus size={18} /> New Post
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
          <MessageSquare size={40} className="opacity-30" />
          <p>No posts yet. Create your first post!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map(post => (
            <PostCard key={post._id} post={post} onReact={handleReact} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#1a1a1a]">
              <h2 className="text-lg font-semibold text-white">Create Post</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 text-sm">
                <option value="announcement">📢 Announcement</option>
                <option value="post">💬 Regular Post</option>
                <option value="puzzle_challenge">♟️ Puzzle Challenge</option>
                <option value="analysis">♛ Game Analysis</option>
              </select>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Title (optional)"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 text-sm" />
              <textarea value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                placeholder="Write something..."
                rows={6}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 text-sm resize-none" />
              <label className="flex items-center gap-3 w-full bg-[#2a2a2a] border-2 border-dashed border-white/10 hover:border-amber-500/40 rounded-lg px-4 py-5 cursor-pointer transition-colors">
                <Paperclip size={18} className="text-gray-500" />
                <span className="text-sm text-gray-400">
                  {uploadFiles.length > 0 ? `${uploadFiles.length} file(s) selected` : 'Attach images, PDFs, videos, PGN files…'}
                </span>
                <input type="file" className="hidden" multiple accept="image/*,.pdf,video/*,.pgn,.txt"
                  onChange={e => setUploadFiles(Array.from(e.target.files || []))} />
              </label>
              {uploadFiles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {uploadFiles.map((f, i) => (
                    <span key={i} className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded">{f.name}</span>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3">
                <input type="checkbox" id="pin" checked={form.isPinned}
                  onChange={e => setForm(f => ({ ...f, isPinned: e.target.checked }))}
                  className="w-4 h-4 accent-amber-500" />
                <label htmlFor="pin" className="text-sm text-gray-300">Pin this post to top</label>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-300 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm">Cancel</button>
                <button onClick={handlePost} disabled={saving || !form.body.trim()}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                  {saving && <Loader2 size={15} className="animate-spin" />}
                  {saving ? 'Posting...' : 'Publish Post'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
