'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Trash2, File, Image as ImageIcon, ExternalLink, Pin, MessageSquare, Paperclip, X } from 'lucide-react';

interface Attachment {
  url: string;
  type: string;
  name?: string;
}

interface Reply {
  _id: string;
  author: { _id: string; name: string; role: string };
  body: string;
  attachments?: Attachment[];
  createdAt: string;
}

interface Comment {
  _id: string;
  author: { _id: string; name: string; role: string };
  body: string;
  attachments?: Attachment[];
  replies?: Reply[];
  createdAt: string;
}

interface Post {
  _id: string;
  author: { _id: string; name: string; role: string };
  title?: string;
  body: string;
  type: string;
  isPinned: boolean;
  attachments: { url: string; key?: string; type: string }[];
  reactions: { user: string; emoji: string }[];
  comments: Comment[];
  createdAt: string;
  courseId?: string;
}

const EMOJIS = ['♟️', '👍', '🔥', '🧠', '❤️', '✅'];

export default function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attachFiles, setAttachFiles] = useState<File[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'post-comments');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const { url } = await res.json();
    return url;
  };

  useEffect(() => {
    Promise.all([
      fetch(`/api/posts/${id}`).then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json())
    ]).then(([p, me]) => {
      setPost(p.post);
      setCurrentUserId(me.user?._id || '');
      setIsAdmin(me.user?.role === 'admin');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && attachFiles.length === 0) return;
    if (!post) return;
    setSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of attachFiles) {
        const url = await uploadFile(file);
        uploadedUrls.push(url);
      }
      const payload: any = { body: commentText || '(attachment)', attachments: uploadedUrls };
      if (replyingTo) payload.commentId = replyingTo;

      const res = await fetch(`/api/posts/${post._id}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setPost(prev => prev ? { ...prev, comments: data.comments } : null);
        setCommentText('');
        setAttachFiles([]);
        setReplyingTo(null);
      }
    } finally { setSubmitting(false); }
  };

  const handleReact = async (emoji: string) => {
    if (!post) return;
    await fetch(`/api/posts/${post._id}/react`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    });
    const res = await fetch(`/api/posts/${id}`);
    const data = await res.json();
    setPost(data.post);
  };

  const handleDelete = async () => {
    if (!post || !confirm('Delete this post?')) return;
    await fetch(`/api/posts/${post._id}`, { method: 'DELETE' });
    if (post.courseId) {
      router.push(`/student/courses/${post.courseId}`);
    } else {
      router.push('/student/community');
    }
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Loading post...</div>;
  if (!post) return <div className="text-center py-16 text-red-400">Post not found</div>;

  const reactionMap: Record<string, number> = {};
  post.reactions?.forEach(r => { reactionMap[r.emoji] = (reactionMap[r.emoji] || 0) + 1; });

  const backLink = post.courseId ? `/student/courses/${post.courseId}` : '/student/community';
  const backLabel = post.courseId ? 'Back to Course' : 'Back to Community';

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <Link href={backLink} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
        <ArrowLeft size={16} /> {backLabel}
      </Link>

      <div className={`bg-[#1a1a1a] border rounded-xl overflow-hidden shadow-xl ${post.isPinned ? 'border-amber-500/30' : 'border-white/5'}`}>
        {post.isPinned && (
          <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium px-5 pt-4 pb-0">
            <Pin size={11} /> Pinned Announcement
          </div>
        )}

        <div className="p-5 md:p-6">
          {/* Author row */}
          <div className="flex items-start justify-between gap-2 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
                {post.author?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-white font-medium">{post.author?.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  <span className="capitalize text-amber-400/70">{post.author?.role}</span>
                  {' · '}{new Date(post.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            {(isAdmin || post.author?._id === currentUserId) && (
              <button onClick={handleDelete} className="text-gray-600 hover:text-red-400 transition-colors p-1">
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {post.title && <h2 className="text-xl font-bold text-white mb-2">{post.title}</h2>}
          <p className="text-gray-300 text-base leading-relaxed whitespace-pre-wrap">{post.body}</p>

          {/* Attachments */}
          {post.attachments?.length > 0 && (
            <div className="mt-5 grid gap-4">
              {post.attachments.map((att, i) => (
                <div key={i} className="border border-white/10 rounded-xl overflow-hidden bg-[#222]">
                  {att.type === 'image' ? (
                    <img src={att.url} alt="" className="w-full max-h-[500px] object-contain bg-black" />
                  ) : att.type === 'video' ? (
                    <video src={att.url} controls className="w-full max-h-[500px] bg-black" />
                  ) : att.type === 'pdf' ? (
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 p-3 bg-white/5 border-b border-white/10">
                        <File size={16} className="text-red-400" />
                        <span className="text-sm font-medium text-white flex-1 truncate">PDF Document</span>
                        <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-white transition-colors">Open PDF</a>
                      </div>
                      <iframe src={att.url} className="w-full h-96 bg-white" />
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
                      <ExternalLink size={16} className="text-gray-500" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Reactions */}
          <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/5 flex-wrap">
            {EMOJIS.map(emoji => (
              <button key={emoji} onClick={() => handleReact(emoji)}
                className="text-lg hover:scale-125 transition-transform active:scale-110">
                {emoji}
              </button>
            ))}
            {Object.entries(reactionMap).length > 0 && (
              <div className="ml-3 flex gap-1.5 flex-wrap">
                {Object.entries(reactionMap).map(([emoji, count]) => (
                  <span key={emoji} className="text-xs bg-white/5 border border-white/10 px-2.5 py-1 rounded-full text-gray-300 font-medium">
                    {emoji} {count}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-[#141414] border-t border-white/5">
          <div className="p-5 border-b border-white/5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <MessageSquare size={16} /> Class Comments ({post.comments?.length || 0})
            </h3>
          </div>
          
          <div className="divide-y divide-white/5">
            {post.comments?.map((comment: Comment) => (
              <div key={comment._id} className="p-5 flex flex-col gap-3 hover:bg-white/5 transition-colors">
                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full ${comment.author?.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-400'} flex items-center justify-center font-bold text-xs shrink-0 mt-0.5`}>
                    {comment.author?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-200 text-sm font-medium flex items-center gap-2">
                      {comment.author?.name}
                      {comment.author?.role === 'admin' && <span className="text-xs bg-amber-500/15 text-amber-400 px-1.5 py-0.5 rounded">Admin</span>}
                      <span className="text-gray-500 font-normal text-xs">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </p>
                    <p className="text-gray-400 text-sm mt-1 whitespace-pre-wrap">{comment.body}</p>
                    {comment.attachments && comment.attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {comment.attachments.map((att, i) => (
                          <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-xs text-blue-400 transition-colors border border-white/5">
                            <File size={12} /> {att.name || 'Attachment'}
                          </a>
                        ))}
                      </div>
                    )}
                    <button onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)} className="text-xs text-gray-500 hover:text-white mt-2 transition-colors">
                      {replyingTo === comment._id ? 'Cancel Reply' : 'Reply'}
                    </button>
                  </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="ml-11 space-y-3 mt-2 border-l border-white/10 pl-4">
                    {comment.replies.map(reply => (
                      <div key={reply._id} className="flex gap-3">
                        <div className={`w-6 h-6 rounded-full ${reply.author?.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-400'} flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5`}>
                          {reply.author?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-200 text-sm font-medium flex items-center gap-2">
                            {reply.author?.name}
                            <span className="text-gray-500 font-normal text-xs">{new Date(reply.createdAt).toLocaleDateString()}</span>
                          </p>
                          <p className="text-gray-400 text-sm mt-0.5 whitespace-pre-wrap">{reply.body}</p>
                          {reply.attachments && reply.attachments.length > 0 && (
                            <div className="mt-1.5 flex flex-wrap gap-2">
                              {reply.attachments.map((att, i) => (
                                <a key={i} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-xs text-blue-400 transition-colors border border-white/5">
                                  <File size={12} /> {att.name || 'Attachment'}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {(!post.comments || post.comments.length === 0) && (
              <div className="p-8 text-center text-gray-500 text-sm">
                No comments yet. Start the discussion!
              </div>
            )}
          </div>

          <form onSubmit={handleComment} className="p-5 bg-[#1a1a1a] border-t border-white/5 space-y-3">
            {replyingTo && (
              <div className="mb-2 px-4 py-2 bg-[#2a2a2a] rounded-lg text-xs text-gray-400 flex items-center justify-between border border-white/5">
                <span>Replying to comment</span>
                <button type="button" onClick={() => setReplyingTo(null)} className="hover:text-white"><X size={14} /></button>
              </div>
            )}
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
              rows={3}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
            />
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white transition-colors text-sm">
                <Paperclip size={15} />
                <span>{attachFiles.length > 0 ? `${attachFiles.length} file(s)` : 'Attach files'}</span>
                <input type="file" multiple className="hidden" accept="image/*,.pdf,.txt,.pgn,video/*"
                  onChange={e => setAttachFiles(Array.from(e.target.files || []))} />
              </label>
              {attachFiles.length > 0 && (
                <button type="button" onClick={() => setAttachFiles([])} className="text-gray-500 hover:text-red-400 text-xs flex items-center gap-1">
                  <X size={12} /> Clear
                </button>
              )}
              <button type="submit" disabled={(!commentText.trim() && attachFiles.length === 0) || submitting}
                className="ml-auto flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-40 transition-colors">
                <Send size={15} /> {submitting ? 'Sending...' : 'Post'}
              </button>
            </div>
            {attachFiles.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {attachFiles.map((f, i) => (
                  <span key={i} className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded">{f.name}</span>
                ))}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
