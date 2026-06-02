'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Send, File, ExternalLink, MessageSquare, ClipboardList, Clock, Paperclip, X, Image as ImageIcon, UploadCloud, CheckCircle } from 'lucide-react';

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

export default function AssignmentDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [attachFiles, setAttachFiles] = useState<File[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const [submission, setSubmission] = useState<any>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState<File[]>([]);
  const [submittingWork, setSubmittingWork] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/assignments/${id}`).then(r => r.json()),
      fetch(`/api/submissions?assignmentId=${id}`).then(r => r.json())
    ]).then(([a, s]) => {
      setAssignment(a.assignment);
      setSubmission(s.submissions?.[0] || null);
      if (s.submissions?.[0]) {
        setSubmissionText(s.submissions[0].content || '');
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', 'assignment-submissions');
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
      // Build message with attachment links if any
      let body = commentText.trim();
      const uploadedUrls: string[] = [];
      for (const file of attachFiles) {
        const url = await uploadFile(file);
        uploadedUrls.push(url);
      }

      const payload: any = { body: body || '(attachment)', attachments: uploadedUrls };
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

  const handleSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionText.trim() && submissionFiles.length === 0 && (!submission?.fileUrls || submission.fileUrls.length === 0)) return;
    setSubmittingWork(true);
    try {
      const uploadedUrls: string[] = submission?.fileUrls || [];
      for (const file of submissionFiles) {
        const url = await uploadFile(file);
        uploadedUrls.push(url);
      }
      const res = await fetch('/api/submissions', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentId: id, content: submissionText, fileUrls: uploadedUrls }),
      });
      if (res.ok) {
        const data = await res.json();
        setSubmission(data.submission);
        setSubmissionFiles([]);
      }
    } finally { setSubmittingWork(false); }
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Loading assignment...</div>;
  if (!assignment) return <div className="text-center py-16 text-red-400">Assignment not found</div>;

  const isOverdue = assignment.dueDate && Date.now() > new Date(assignment.dueDate).getTime();

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <Link href={`/student/courses/${assignment.course}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
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
              </div>
            </div>
          </div>

          <div className="prose prose-invert max-w-none text-gray-300">
            <p className="whitespace-pre-wrap leading-relaxed">{assignment.description}</p>
          </div>

          {/* Attachments from assignment */}
          {assignment.attachments?.length > 0 && (
            <div className="mt-8 pt-6 border-t border-white/5 grid gap-3">
              <h3 className="text-sm font-semibold text-gray-400 mb-1">📎 Assignment Resources</h3>
              {assignment.attachments.map((url, i) => {
                const isPdf = url.includes('.pdf');
                const isImage = /\.(jpg|jpeg|png|gif|webp)/.test(url);
                return (
                  <div key={i} className="border border-white/10 rounded-lg overflow-hidden bg-[#222]">
                    {isImage ? (
                      <img src={url} alt={`Resource ${i + 1}`} className="w-full max-h-60 object-contain bg-black cursor-pointer" onClick={() => window.open(url)} />
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
                        <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center text-amber-500 shrink-0 group-hover:scale-110 transition-transform">
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
            <p className="text-gray-500 text-xs mt-1">Share your work, ask questions, or attach files below</p>
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
                No class comments yet. Start the discussion or submit your work!
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
              placeholder={replyingTo ? "Write a reply..." : "Add class comment or share your work..."}
              rows={3}
              className="w-full bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
            />
            <div className="flex items-center justify-between gap-3">
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
                <Send size={15} /> {submitting ? 'Sending...' : 'Submit'}
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

      {/* Right Column - Your Work */}
      <div className="space-y-6">
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-white font-semibold">Your Work</h3>
            {submission ? (
              <span className="text-xs font-medium bg-green-500/10 text-green-400 px-2.5 py-1 rounded-full flex items-center gap-1">
                <CheckCircle size={12} /> Turned in
              </span>
            ) : (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${isOverdue ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                {isOverdue ? 'Missing' : 'Assigned'}
              </span>
            )}
          </div>
          <div className="p-5 space-y-4">
            {submission?.grade !== undefined && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                <p className="text-green-400 font-bold text-lg">{submission.grade} / {assignment.maxPoints}</p>
                <p className="text-green-500/70 text-xs mt-0.5">Grade</p>
                {submission.feedback && (
                  <p className="mt-2 text-sm text-gray-300 text-left border-t border-green-500/20 pt-2">{submission.feedback}</p>
                )}
              </div>
            )}
            
            <form onSubmit={handleSubmission} className="space-y-4">
              {submission?.fileUrls?.map((url: string, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#2a2a2a] border border-white/10 rounded-lg">
                  <File size={16} className="text-amber-500 shrink-0" />
                  <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-white hover:underline truncate flex-1">{url.split('/').pop() || 'Submitted File'}</a>
                </div>
              ))}

              {!submission?.grade && (
                <>
                  <textarea
                    value={submissionText}
                    onChange={e => setSubmissionText(e.target.value)}
                    placeholder="Add submission text..."
                    rows={3}
                    className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none"
                  />

                  {submissionFiles.map((f, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-white/5 rounded-lg text-sm">
                      <span className="text-gray-300 truncate pr-3">{f.name}</span>
                      <button type="button" onClick={() => setSubmissionFiles(fs => fs.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300"><X size={14} /></button>
                    </div>
                  ))}

                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 rounded-lg cursor-pointer transition-colors text-sm font-medium">
                      <UploadCloud size={16} /> Add file
                      <input type="file" multiple className="hidden" onChange={e => setSubmissionFiles(prev => [...prev, ...Array.from(e.target.files || [])])} />
                    </label>
                  </div>

                  <button type="submit" disabled={submittingWork} className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-black py-2.5 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors">
                    {submittingWork ? 'Submitting...' : submission ? 'Resubmit' : 'Turn in'}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}
