'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, BookOpen, ChevronRight, Send,
  MessageSquare, Paperclip, X, File,
  Pin, Trash2, ExternalLink, FileText, Film, Image as ImageIcon, Link as LinkIcon, Download, Loader2
} from 'lucide-react';

interface Content {
  _id: string; title: string; type: string; body?: string; fileUrl?: string; linkUrl?: string; isPublished: boolean; createdAt: string;
  comments?: Comment[];
}
interface Course {
  _id: string; title: string; description: string; level: string;
  instructor?: string; coachId?: { name: string };
}
interface Assignment {
  _id: string; title: string; description: string; dueDate?: string; maxPoints: number; attachments?: string[];
}

interface Comment {
  _id: string;
  author: { _id: string; name: string; role: string };
  body: string;
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
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  text: <FileText size={16} />,
  video: <Film size={16} />,
  pdf: <File size={16} />,
  image: <ImageIcon size={16} />,
  pgn: <span>♟️</span>,
  link: <LinkIcon size={16} />,
};

const TYPE_COLORS: Record<string, string> = {
  text: 'text-blue-400 bg-blue-500/10',
  pdf: 'text-red-400 bg-red-500/10',
  image: 'text-violet-400 bg-violet-500/10',
  video: 'text-emerald-400 bg-emerald-500/10',
  link: 'text-cyan-400 bg-cyan-500/10',
  pgn: 'text-amber-400 bg-amber-500/10',
};

const EMOJIS = ['♟️', '👍', '🔥', '🧠', '❤️', '✅'];

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'text-green-400', intermediate: 'text-amber-400',
  advanced: 'text-orange-400', elite: 'text-red-400',
};

function PostCard({ post, onReact, onDelete, currentUserId, isAdmin }: {
  post: Post;
  onReact: (postId: string, emoji: string) => void;
  onDelete: (postId: string) => void;
  currentUserId: string;
  isAdmin: boolean;
}) {
  const reactionMap: Record<string, number> = {};
  post.reactions.forEach(r => { reactionMap[r.emoji] = (reactionMap[r.emoji] || 0) + 1; });

  return (
    <div className={`bg-[#1a1a1a] border rounded-xl overflow-hidden ${post.isPinned ? 'border-amber-500/30' : 'border-white/5'}`}>
      {post.isPinned && (
        <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium px-4 pt-3 pb-0">
          <Pin size={11} /> Pinned
        </div>
      )}

      <div className="p-4">
        {/* Author row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
              {post.author?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-white text-sm font-medium leading-none">{post.author?.name}</p>
              <p className="text-gray-500 text-xs mt-0.5">
                <span className="capitalize text-amber-400/70">{post.author?.role}</span>
                {' · '}{new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {(isAdmin || post.author?._id === currentUserId) && (
            <button onClick={() => onDelete(post._id)} className="text-gray-600 hover:text-red-400 transition-colors p-1">
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {post.title && <p className="text-white font-semibold text-sm mb-1">{post.title}</p>}
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>

        {/* Attachments */}
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
                      <a href={att.url} target="_blank" rel="noopener noreferrer" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white transition-colors">View</a>
                      <a href={att.url} download className="text-xs bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1 rounded text-amber-400 transition-colors flex items-center gap-1"><Download size={11} /> Download</a>
                    </div>
                    <iframe src={att.url} className="w-full h-64 bg-white" />
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center text-gray-400 shrink-0">
                      <File size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">Attached File</p>
                      <p className="text-xs text-gray-500 truncate">{att.url.split('/').pop()}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={att.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Open">
                        <ExternalLink size={14} />
                      </a>
                      <a href={att.url} download className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded transition-colors" title="Download">
                        <Download size={14} />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Reactions */}
        <div className="flex items-center gap-1 mt-4 flex-wrap">
          {EMOJIS.map(emoji => (
            <button key={emoji} onClick={() => onReact(post._id, emoji)}
              className="text-base hover:scale-125 transition-transform active:scale-110">
              {emoji}
            </button>
          ))}
          {Object.entries(reactionMap).length > 0 && (
            <div className="ml-2 flex gap-1 flex-wrap">
              {Object.entries(reactionMap).map(([emoji, count]) => (
                <span key={emoji} className="text-xs bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-gray-300">
                  {emoji} {count}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Comments link */}
        <Link
          href={`/student/posts/${post._id}`}
          className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-xs mt-3 transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5"
        >
          <MessageSquare size={14} />
          {post.comments?.length || 0} class comment{(post.comments?.length || 0) !== 1 ? 's' : ''}
        </Link>
      </div>
    </div>
  );
}

export default function StudentCourseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'assignments' | 'discussion'>('content');
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [posting, setPosting] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const [expandedCommentsContentId, setExpandedCommentsContentId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState<Record<string, boolean>>({});

  const handlePostContentComment = async (contentId: string) => {
    const text = commentInputs[contentId] || '';
    if (!text.trim()) return;

    setSubmittingComment(prev => ({ ...prev, [contentId]: true }));
    try {
      const res = await fetch(`/api/courses/content/${contentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: text }),
      });
      if (res.ok) {
        const data = await res.json();
        setContents(prev => prev.map(item => item._id === contentId ? { ...item, comments: data.comments } : item));
        setCommentInputs(prev => ({ ...prev, [contentId]: '' }));
      }
    } catch (_) {
    } finally {
      setSubmittingComment(prev => ({ ...prev, [contentId]: false }));
    }
  };

  const handleDeleteContentComment = async (contentId: string, commentId: string) => {
    if (!confirm('Delete this comment?')) return;
    try {
      const res = await fetch(`/api/courses/content/${contentId}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        const data = await res.json();
        setContents(prev => prev.map(item => item._id === contentId ? { ...item, comments: data.comments } : item));
      }
    } catch (_) {}
  };

  useEffect(() => {
    Promise.all([
      fetch(`/api/student/courses/${id}`).then(r => r.json()),
      fetch(`/api/posts?courseId=${id}`).then(r => r.json()),
      fetch('/api/auth/me').then(r => r.json()),
    ]).then(([c, postsRes, me]) => {
      setCourse(c.course);
      setContents(c.contents || []);
      setAssignments(c.assignments || []);
      setPosts(postsRes.posts || []);
      setCurrentUserId(me.user?._id || '');
      setIsAdmin(me.user?.role === 'admin');
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', `courses/${id}`);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const { url } = await res.json();
    const type = file.type.startsWith('image') ? 'image' : file.type === 'application/pdf' ? 'pdf' : file.type.startsWith('video') ? 'video' : 'file';
    return { url, type };
  };

  const submitPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosting(true);
    const attachments = [];
    for (const f of uploadFiles) attachments.push(await uploadFile(f));
    const res = await fetch('/api/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: postTitle || undefined, body: newPost, courseId: id, type: 'post', attachments }),
    });
    if (res.ok) {
      const data = await res.json();
      setPosts(prev => [data.post, ...prev]);
      setNewPost('');
      setPostTitle('');
      setUploadFiles([]);
    }
    setPosting(false);
  };

  const handleReact = async (postId: string, emoji: string) => {
    await fetch(`/api/posts/${postId}/react`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    });
    const res = await fetch(`/api/posts?courseId=${id}`);
    const data = await res.json();
    setPosts(data.posts || []);
  };

  const handleDelete = async (postId: string) => {
    if (!confirm('Delete this post?')) return;
    await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Loading course...</div>;
  if (!course) return <div className="text-center py-16 text-red-400">Course not found or not accessible</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <Link href="/student/courses" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
        <ArrowLeft size={16} /> Back to courses
      </Link>

      {/* Course Header */}
      <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/15 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className={`text-xs capitalize font-medium ${LEVEL_COLORS[course.level]}`}>{course.level}</span>
            <h1 className="text-2xl font-bold text-white mt-1">{course.title}</h1>
            <p className="text-gray-400 text-sm mt-2 max-w-2xl">{course.description}</p>
            <div className="flex gap-4 mt-3 text-gray-500 text-xs">
              {course.instructor && <span>👤 {course.instructor}</span>}
              <span className="flex items-center gap-1"><BookOpen size={11} /> {contents.length} items</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/5 pb-0">
        {(['content', 'assignments', 'discussion'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-1 py-2.5 text-sm font-medium border-b-2 transition-colors capitalize ${
              activeTab === tab ? 'border-amber-500 text-amber-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`}>
            {tab === 'discussion' ? `💬 Discussion (${posts.length})` : tab === 'assignments' ? `Assignments (${assignments.length})` : 'Course Content'}
          </button>
        ))}
      </div>

      {activeTab === 'content' ? (
        <div className="space-y-3">
          {contents.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-[#1a1a1a] rounded-xl border border-white/5">
              <BookOpen size={36} className="mx-auto mb-3 opacity-20" />
              <p>No content added yet</p>
            </div>
          ) : (
            contents.map((item) => (
              <div key={item._id} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors group">
                <div className="flex items-start gap-4">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${TYPE_COLORS[item.type] || 'text-gray-400 bg-white/5'}`}>
                    {TYPE_ICONS[item.type] || '📝'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-medium text-white group-hover:text-amber-400 transition-colors">
                        {item.title}
                      </h3>
                      <span className="text-xs text-gray-500 capitalize bg-white/5 px-2 py-0.5 rounded-full">{item.type}</span>
                    </div>
                    <p className="text-xs text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</p>

                    {item.body && <p className="text-sm text-gray-400 mt-2 whitespace-pre-wrap leading-relaxed">{item.body}</p>}

                    {(item.fileUrl || item.linkUrl) && (
                      <div className="mt-3">
                        {item.type === 'image' && item.fileUrl ? (
                          <div className="relative group/img">
                            <img src={item.fileUrl} alt={item.title} className="rounded-lg max-h-80 object-contain bg-black/50 border border-white/10 w-full" />
                            <a href={item.fileUrl} download className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg opacity-0 group-hover/img:opacity-100 transition-all" title="Download">
                              <Download size={14} />
                            </a>
                          </div>
                        ) : item.type === 'video' && item.fileUrl ? (
                          <video src={item.fileUrl} controls className="w-full max-w-2xl rounded-lg bg-black border border-white/10" />
                        ) : item.type === 'pdf' && item.fileUrl ? (
                          <div className="border border-white/10 rounded-lg overflow-hidden bg-[#222]">
                            <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/10">
                              <div className="flex items-center gap-2">
                                <File size={16} className="text-red-400" />
                                <span className="text-sm font-medium text-white">PDF Document</span>
                              </div>
                              <div className="flex gap-2">
                                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-white transition-colors">View</a>
                                <a href={item.fileUrl} download className="text-xs bg-amber-500/20 hover:bg-amber-500/30 px-3 py-1.5 rounded text-amber-400 transition-colors flex items-center gap-1"><Download size={11} /> Download</a>
                              </div>
                            </div>
                            <iframe src={item.fileUrl} className="w-full h-80 bg-white" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <a href={item.fileUrl || item.linkUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm text-amber-400 transition-colors">
                              {item.linkUrl ? <ExternalLink size={14} /> : <ExternalLink size={14} />}
                              {item.linkUrl ? 'Open Link' : 'View File'}
                            </a>
                            {!item.linkUrl && item.fileUrl && (
                              <a href={item.fileUrl} download
                                className="inline-flex items-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-4 py-2 rounded-lg text-sm text-amber-400 transition-colors">
                                <Download size={14} /> Download
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Toggle Comments Button */}
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        onClick={() => setExpandedCommentsContentId(expandedCommentsContentId === item._id ? null : item._id)}
                        className="inline-flex items-center gap-1.5 text-gray-400 hover:text-white text-xs transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5"
                      >
                        <MessageSquare size={13} />
                        {item.comments?.length || 0} class comment{(item.comments?.length || 0) !== 1 ? 's' : ''}
                      </button>
                    </div>

                    {/* Expandable comments thread */}
                    {expandedCommentsContentId === item._id && (
                      <div className="mt-4 border-t border-white/5 pt-4 space-y-3">
                        {/* Comments List */}
                        {item.comments && item.comments.length > 0 ? (
                          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {item.comments.map(comment => (
                              <div key={comment._id} className="flex gap-2.5 items-start text-xs">
                                <div className={`w-6 h-6 rounded-full ${comment.author?.role === 'admin' ? 'bg-amber-500/20 text-amber-400' : 'bg-white/10 text-gray-400'} flex items-center justify-center font-bold shrink-0`}>
                                  {comment.author?.name?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <div className="flex-1 min-w-0 bg-white/[0.02] border border-white/5 rounded-lg p-2">
                                  <div className="flex justify-between items-start gap-2">
                                    <span className="font-medium text-gray-200">
                                      {comment.author?.name}
                                      {comment.author?.role === 'admin' && <span className="ml-1 text-[9px] bg-amber-500/10 text-amber-400 px-1 py-0.2 rounded">Admin</span>}
                                    </span>
                                    <span className="text-gray-600 text-[10px]">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-gray-400 mt-1 whitespace-pre-wrap">{comment.body}</p>
                                  
                                  {/* Delete comment button */}
                                  {(isAdmin || comment.author?._id === currentUserId) && (
                                    <button
                                      onClick={() => handleDeleteContentComment(item._id, comment._id)}
                                      className="text-red-400 hover:text-red-300 text-[10px] mt-1 transition-colors font-medium"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-gray-500">No comments yet. Start the conversation!</p>
                        )}

                        {/* Comment Form */}
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            placeholder="Add class comment..."
                            value={commentInputs[item._id] || ''}
                            onChange={e => setCommentInputs(prev => ({ ...prev, [item._id]: e.target.value }))}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handlePostContentComment(item._id);
                              }
                            }}
                            className="flex-1 bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                          />
                          <button
                            onClick={() => handlePostContentComment(item._id)}
                            disabled={!(commentInputs[item._id] || '').trim() || submittingComment[item._id]}
                            className="bg-amber-500 hover:bg-amber-400 text-black px-3 py-1.5 rounded-lg text-xs font-semibold disabled:opacity-50 transition-all flex items-center gap-1 shrink-0"
                          >
                            {submittingComment[item._id] ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : activeTab === 'assignments' ? (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-[#1a1a1a] rounded-xl border border-white/5">
              No assignments yet.
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map(a => (
                <Link href={`/student/assignments/${a._id}`} key={a._id} className="block bg-[#1a1a1a] border border-white/5 rounded-xl p-5 hover:border-amber-500/30 transition-all group">
                  <div>
                    <h3 className="text-white font-medium group-hover:text-amber-400 transition-colors">{a.title}</h3>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-2">{a.description}</p>
                    <div className="flex gap-3 mt-3 text-xs text-gray-500">
                      {a.dueDate && <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>}
                      <span>{a.maxPoints} points</span>
                      {a.attachments && a.attachments.length > 0 && <span>📎 {a.attachments.length} attachment(s)</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Post composer */}
          <form onSubmit={submitPost} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-4 space-y-3">
            <input
              value={postTitle}
              onChange={e => setPostTitle(e.target.value)}
              placeholder="Title (optional)"
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
            />
            <textarea
              value={newPost} onChange={e => setNewPost(e.target.value)}
              placeholder="Ask a question or start a discussion..."
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none min-h-[80px]"
            />
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white transition-colors text-sm">
                <Paperclip size={15} />
                <span>{uploadFiles.length > 0 ? `${uploadFiles.length} file(s) selected` : 'Attach files'}</span>
                <input type="file" multiple className="hidden"
                  accept="image/*,.pdf,video/*,.pgn,.txt"
                  onChange={e => setUploadFiles(Array.from(e.target.files || []))} />
              </label>
              <div className="flex items-center gap-2">
                {uploadFiles.length > 0 && (
                  <button type="button" onClick={() => setUploadFiles([])} className="text-gray-500 hover:text-red-400 text-xs flex items-center gap-1">
                    <X size={12} /> Clear
                  </button>
                )}
                <button type="submit" disabled={!newPost.trim() || posting}
                  className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">
                  <Send size={13} /> {posting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </form>

          {/* Posts list */}
          {posts.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-[#1a1a1a] rounded-xl border border-white/5">
              <MessageSquare size={32} className="mx-auto mb-2 opacity-20" />
              <p className="text-sm">No discussions yet. Be the first to start one!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map(post => (
                <PostCard
                  key={post._id}
                  post={post}
                  onReact={handleReact}
                  onDelete={handleDelete}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
