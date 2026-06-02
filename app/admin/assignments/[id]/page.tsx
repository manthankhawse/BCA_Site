'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, File, ExternalLink, MessageSquare, ClipboardList, Clock, Paperclip, X, Users, CheckCircle, Search } from 'lucide-react';

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

interface Assignment {
  _id: string;
  course: string;
  title: string;
  description: string;
  dueDate?: string;
  maxPoints: number;
  attachments: string[];
  comments: Comment[];
  createdAt: string;
}

export default function AdminAssignmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attachFiles, setAttachFiles] = useState<File[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [grade, setGrade] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/assignments/${id}`).then(r => r.json()),
      fetch(`/api/submissions?assignmentId=${id}`).then(r => r.json())
    ]).then(([a, s]) => {
      setAssignment(a.assignment);
      setSubmissions(s.submissions || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'assignment-feedback');
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const { url } = await res.json();
    return url;
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && attachFiles.length === 0) return;
    if (!assignment) return;
    setSubmitting(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of attachFiles) {
        const url = await uploadFile(file);
        uploadedUrls.push(url);
      }
      const payload: any = { body: commentText || '(attachment)', attachments: uploadedUrls };
      if (replyingTo) payload.commentId = replyingTo;
      
      const res = await fetch(`/api/assignments/${assignment._id}/comments`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setAssignment(prev => prev ? { ...prev, comments: data.comments } : null);
        setCommentText('');
        setAttachFiles([]);
        setReplyingTo(null);
      }
    } finally { setSubmitting(false); }
  };

  const handleGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !grade) return;
    setGrading(true);
    try {
      const res = await fetch(`/api/submissions`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedSub._id, grade: Number(grade), feedback }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(prev => prev.map(s => s._id === data.submission._id ? { ...s, grade: data.submission.grade, feedback: data.submission.feedback } : s));
        setSelectedSub(data.submission);
      }
    } finally { setGrading(false); }
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Loading assignment...</div>;
  if (!assignment) return <div className="text-center py-16 text-red-400">Assignment not found</div>;

  const isOverdue = assignment.dueDate && Date.now() > new Date(assignment.dueDate).getTime();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <Link href={`/admin/courses/${assignment.course}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
        <ArrowLeft size={16} /> Back to Course
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#1a1a1a] border border-amber-500/20 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 md:p-8">
              <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shrink-0 border border-amber-500/20">
              <ClipboardList size={24} />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-2">{assignment.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-400 font-medium flex-wrap">
                {assignment.dueDate && (
                  <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-400' : 'text-orange-400'}`}>
                    <Clock size={14} /> Due: {new Date(assignment.dueDate).toLocaleString()}
                    {isOverdue && ' (Overdue)'}
                  </span>
                )}
                <span className="bg-white/5 px-2.5 py-1 rounded-md">{assignment.maxPoints} points</span>
                <span className="bg-white/5 px-2.5 py-1 rounded-md flex items-center gap-1">
                  <Users size={12} /> {assignment.comments?.length || 0} comment(s)
                </span>
              </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-gray-300">
            <p className="whitespace-pre-wrap leading-relaxed">{assignment.description}</p>
          </div>

          {/* Attachments */}
          {assignment.attachments?.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/5 grid gap-3">
              <h3 className="text-sm font-semibold text-gray-400 mb-1">📎 Attachments</h3>
              {assignment.attachments.map((url, i) => {
                const isPdf = url.includes('.pdf');
                const isImage = /\.(jpg|jpeg|png|gif|webp)/.test(url);
                return (
                  <div key={i} className="border border-white/10 rounded-lg overflow-hidden bg-[#222]">
                    {isImage ? (
                      <img src={url} alt={`Attachment ${i + 1}`} className="w-full max-h-60 object-contain bg-black cursor-pointer" onClick={() => window.open(url)} />
                    ) : isPdf ? (
                      <div className="flex flex-col">
                        <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <File size={16} className="text-red-400" />
                            <span className="text-sm font-medium text-white">PDF Resource</span>
                          </div>
                          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-white transition-colors">Open PDF</a>
                        </div>
                        <iframe src={url} className="w-full h-48 bg-white" />
                      </div>
                    ) : (
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 hover:bg-white/5 transition-colors group">
                        <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-amber-500 shrink-0">
                          <File size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">Attached File {i + 1}</p>
                          <p className="text-xs text-gray-500 truncate">{url}</p>
                        </div>
                        <ExternalLink size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="bg-[#141414] border-t border-white/5">
          <div className="p-5 border-b border-white/5">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <MessageSquare size={16} /> Class Comments ({assignment.comments?.length || 0})
            </h3>
            <p className="text-gray-500 text-xs mt-1">Add feedback, grade, or attach files for students</p>
          </div>

          <div className="divide-y divide-white/5">
            {assignment.comments?.map((comment: Comment) => (
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
            {(!assignment.comments || assignment.comments.length === 0) && (
              <div className="p-8 text-center text-gray-500 text-sm">
                No class comments yet.
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
              placeholder={replyingTo ? "Write a reply..." : "Add feedback or grade comment..."}
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

        <div className="space-y-6">
          <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-white font-semibold">Submissions</h3>
              <span className="bg-amber-500/10 text-amber-400 text-xs px-2.5 py-1 rounded-full font-medium">
                {submissions.length} Turn In
              </span>
            </div>
            
            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto">
              {submissions.map(sub => (
                <div key={sub._id} className="p-4 hover:bg-white/5 transition-colors cursor-pointer" onClick={() => { setSelectedSub(sub); setGrade(sub.grade?.toString() || ''); setFeedback(sub.feedback || ''); }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{sub.student?.name || 'Unknown Student'}</p>
                      <p className="text-xs text-gray-500">{new Date(sub.submittedAt).toLocaleDateString()}</p>
                    </div>
                    {sub.grade !== undefined ? (
                      <span className="text-xs font-bold text-green-400 bg-green-500/10 px-2 py-1 rounded">{sub.grade} / {assignment.maxPoints}</span>
                    ) : (
                      <span className="text-xs font-medium text-amber-400 bg-amber-500/10 px-2 py-1 rounded">Needs Grading</span>
                    )}
                  </div>
                </div>
              ))}
              {submissions.length === 0 && (
                <div className="p-6 text-center text-gray-500 text-sm">
                  No submissions yet
                </div>
              )}
            </div>
          </div>
        </div>

        {selectedSub && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#141414] border border-white/10 rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
                <div>
                  <h3 className="text-white font-semibold">{selectedSub.student?.name}&apos;s Submission</h3>
                  <p className="text-xs text-gray-400">Submitted on {new Date(selectedSub.submittedAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedSub(null)} className="text-gray-400 hover:text-white p-1"><X size={20} /></button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
                {selectedSub.content && (
                  <div className="bg-white/5 p-4 rounded-lg">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Text Response</h4>
                    <p className="text-sm text-gray-200 whitespace-pre-wrap">{selectedSub.content}</p>
                  </div>
                )}
                
                {selectedSub.fileUrls?.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Attached Files</h4>
                    <div className="grid gap-2">
                      {selectedSub.fileUrls.map((url: string, i: number) => (
                        <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 transition-colors border border-white/10 rounded-lg">
                          <File size={16} className="text-amber-500 shrink-0" />
                          <span className="text-sm text-white truncate flex-1">{url.split('/').pop() || 'File'}</span>
                          <ExternalLink size={14} className="text-gray-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                <form onSubmit={handleGrade} className="bg-[#1a1a1a] p-5 rounded-lg border border-amber-500/20 space-y-4">
                  <h4 className="text-sm font-semibold text-amber-400 flex items-center gap-2"><CheckCircle size={14} /> Evaluation</h4>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Grade (out of {assignment.maxPoints})</label>
                      <input type="number" required min="0" max={assignment.maxPoints} value={grade} onChange={e => setGrade(e.target.value)}
                        className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500/50" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1">Feedback (Optional)</label>
                      <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
                        className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:border-amber-500/50 resize-none" />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button type="button" onClick={() => setSelectedSub(null)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">Cancel</button>
                    <button type="submit" disabled={grading} className="bg-amber-500 hover:bg-amber-400 text-black px-5 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">
                      {grading ? 'Saving...' : 'Save Grade'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
