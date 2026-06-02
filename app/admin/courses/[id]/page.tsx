'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, X, FileText, Image as ImageIcon, Film, Link as LinkIcon, File, BookOpen, ClipboardList, Upload, Paperclip, Pin } from 'lucide-react';

interface Content {
  _id: string;
  title: string;
  type: string;
  body?: string;
  fileUrl?: string;
  linkUrl?: string;
  isPublished: boolean;
  createdAt: string;
}

interface Assignment {
  _id: string;
  title: string;
  description: string;
  dueDate?: string;
  maxPoints: number;
  attachments?: string[];
}

interface Course {
  _id: string;
  title: string;
  level: string;
  enrolledStudents: { _id: string; name: string; email: string }[];
}

const typeIcons: Record<string, React.ReactNode> = {
  text: <FileText size={16} />,
  pdf: <File size={16} />,
  image: <ImageIcon size={16} />,
  video: <Film size={16} />,
  link: <LinkIcon size={16} />,
  pgn: <span className="text-sm">♟</span>,
};

const typeColors: Record<string, string> = {
  text: 'text-blue-400 bg-blue-500/10',
  pdf: 'text-red-400 bg-red-500/10',
  image: 'text-violet-400 bg-violet-500/10',
  video: 'text-emerald-400 bg-emerald-500/10',
  link: 'text-cyan-400 bg-cyan-500/10',
  pgn: 'text-amber-400 bg-amber-500/10',
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#1a1a1a]">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function CourseDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [contents, setContents] = useState<Content[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'content' | 'assignments' | 'students'>('content');
  const [showContentModal, setShowContentModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [contentForm, setContentForm] = useState({ title: '', type: 'text', body: '', linkUrl: '' });
  const [assignmentForm, setAssignmentForm] = useState({ title: '', description: '', dueDate: '', maxPoints: 100 });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [assignmentAttachments, setAssignmentAttachments] = useState<File[]>([]);
  const [error, setError] = useState('');

  const fetchData = async () => {
    const res = await fetch(`/api/admin/courses/${id}`);
    const data = await res.json();
    setCourse(data.course);
    setContents(data.contents || []);
    setAssignments(data.assignments || []);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const uploadToR2 = async (file: File, folder: string): Promise<{ url: string; key: string }> => {
    const fd = new FormData();
    fd.append('file', file);
    fd.append('folder', folder);
    const res = await fetch('/api/upload', { method: 'POST', body: fd });
    const { url, key } = await res.json();
    return { url, key };
  };

  const handleAddContent = async () => {
    setError('');
    setSaving(true);
    try {
      let fileUrl: string | undefined;
      let fileKey: string | undefined;
      if (uploadFile && ['pdf', 'image', 'video'].includes(contentForm.type)) {
        setUploading(true);
        const result = await uploadToR2(uploadFile, `courses/${id}/content`);
        fileUrl = result.url;
        fileKey = result.key;
        setUploading(false);
      }
      const res = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...contentForm, course: id, fileUrl, fileKey }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      await fetchData();
      setShowContentModal(false);
      setUploadFile(null);
      setContentForm({ title: '', type: 'text', body: '', linkUrl: '' });
    } catch { setError('Failed to save'); } finally { setSaving(false); setUploading(false); }
  };

  const handleDeleteContent = async (contentId: string) => {
    if (!confirm('Delete this content?')) return;
    await fetch(`/api/admin/content/${contentId}`, { method: 'DELETE' });
    await fetchData();
  };

  const handleAddAssignment = async () => {
    setError('');
    setSaving(true);
    try {
      // Upload assignment attachments
      const attachmentUrls: string[] = [];
      for (const file of assignmentAttachments) {
        const { url } = await uploadToR2(file, `courses/${id}/assignments`);
        attachmentUrls.push(url);
      }
      const res = await fetch('/api/admin/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...assignmentForm, course: id, attachments: attachmentUrls }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.error); return; }
      await fetchData();
      setShowAssignmentModal(false);
      setAssignmentForm({ title: '', description: '', dueDate: '', maxPoints: 100 });
      setAssignmentAttachments([]);
    } catch { setError('Failed to save'); } finally { setSaving(false); }
  };

  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!confirm('Delete this assignment?')) return;
    await fetch(`/api/admin/assignments?id=${assignmentId}`, { method: 'DELETE' });
    await fetchData();
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Loading...</div>;
  if (!course) return <div className="text-center py-16 text-red-400">Course not found</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/courses" className="text-gray-400 hover:text-white">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">{course.title}</h1>
          <p className="text-gray-400 text-sm capitalize">{course.level} • {course.enrolledStudents.length} students</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1a1a1a] border border-white/5 rounded-xl p-1 w-fit">
        {[
          { key: 'content', label: 'Content', icon: BookOpen },
          { key: 'assignments', label: 'Assignments', icon: ClipboardList },
          { key: 'students', label: 'Students', icon: null },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">{contents.length} items</p>
            <button
              onClick={() => { setShowContentModal(true); setError(''); }}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <Plus size={16} /> Add Content
            </button>
          </div>

          {contents.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-[#1a1a1a] rounded-xl border border-white/5">
              No content yet. Add lessons, PDFs, videos or links.
            </div>
          ) : (
            <div className="space-y-3">
              {contents.map((item) => (
                <div key={item._id} className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5 transition-colors group hover:border-white/10">
                  <div className="flex items-start gap-4">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${typeColors[item.type] || 'text-gray-400 bg-white/5'}`}>
                      {typeIcons[item.type] || '📝'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-medium text-white group-hover:text-amber-400 transition-colors">
                          {item.title}
                        </h3>
                        <span className="text-xs text-gray-500 capitalize bg-white/5 px-2 py-0.5 rounded-full">{item.type}</span>
                      </div>
                      <p className="text-xs text-gray-600">{new Date(item.createdAt).toLocaleDateString()}</p>

                      {item.body && <p className="text-sm text-gray-400 mt-2 whitespace-pre-wrap leading-relaxed line-clamp-3">{item.body}</p>}

                      {(item.fileUrl || item.linkUrl) && (
                        <div className="mt-3">
                          {item.type === 'image' && item.fileUrl ? (
                            <img src={item.fileUrl} alt={item.title} className="rounded-lg max-h-48 object-contain bg-black/50 border border-white/10" />
                          ) : item.type === 'video' && item.fileUrl ? (
                            <video src={item.fileUrl} controls className="w-full max-w-xl rounded-lg bg-black border border-white/10" />
                          ) : item.type === 'pdf' && item.fileUrl ? (
                            <div className="border border-white/10 rounded-lg overflow-hidden bg-[#222]">
                              <div className="flex items-center justify-between p-3 bg-white/5 border-b border-white/10">
                                <div className="flex items-center gap-2">
                                  <File size={16} className="text-red-400" />
                                  <span className="text-sm font-medium text-white">PDF Document</span>
                                </div>
                                <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-white transition-colors">
                                  Open PDF
                                </a>
                              </div>
                              <iframe src={item.fileUrl} className="w-full h-60 bg-white" />
                            </div>
                          ) : (
                            <a href={item.fileUrl || item.linkUrl} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm text-amber-400 transition-colors">
                              {item.linkUrl ? <LinkIcon size={14} /> : <File size={14} />}
                              {item.linkUrl ? 'Open Link' : 'Download File'}
                            </a>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleDeleteContent(item._id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-gray-400 text-sm">{assignments.length} assignments</p>
            <button
              onClick={() => { setShowAssignmentModal(true); setError(''); }}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <Plus size={16} /> Add Assignment
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="text-center py-12 text-gray-500 bg-[#1a1a1a] rounded-xl border border-white/5">
              No assignments yet.
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map(a => (
                <Link href={`/admin/assignments/${a._id}`} key={a._id} className="block bg-[#1a1a1a] border border-white/5 rounded-xl p-5 hover:border-amber-500/30 transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-white font-medium group-hover:text-amber-400 transition-colors">{a.title}</h3>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">{a.description}</p>
                      <div className="flex gap-3 mt-3 text-xs text-gray-500">
                        {a.dueDate && <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>}
                        <span>{a.maxPoints} points</span>
                        {a.attachments && a.attachments.length > 0 && <span>📎 {a.attachments.length} file(s)</span>}
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); handleDeleteAssignment(a._id); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
          {course.enrolledStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No students enrolled</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {course.enrolledStudents.map(s => (
                  <tr key={s._id} className="hover:bg-white/2">
                    <td className="px-6 py-4 text-white text-sm">{s.name}</td>
                    <td className="px-6 py-4 text-gray-400 text-sm">{s.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Add Content Modal — Post-like UI */}
      {showContentModal && (
        <Modal title="Add Course Content" onClose={() => setShowContentModal(false)}>
          <div className="space-y-4">
            {/* Type selector — tabs style */}
            <div>
              <label className="block text-sm text-gray-300 mb-2">Content Type</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { val: 'text', label: '📝 Text', color: 'blue' },
                  { val: 'pdf', label: '📄 PDF', color: 'red' },
                  { val: 'image', label: '🖼️ Image', color: 'violet' },
                  { val: 'video', label: '▶️ Video', color: 'emerald' },
                  { val: 'link', label: '🔗 Link', color: 'cyan' },
                  { val: 'pgn', label: '♟ PGN', color: 'amber' },
                ].map(t => (
                  <button key={t.val} type="button"
                    onClick={() => setContentForm(f => ({ ...f, type: t.val }))}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                      contentForm.type === t.val
                        ? 'bg-amber-500 border-amber-500 text-black'
                        : 'border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Title</label>
              <input type="text" value={contentForm.title} onChange={e => setContentForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Introduction to Chess Openings"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 text-sm" />
            </div>

            {(contentForm.type === 'text' || contentForm.type === 'pgn') && (
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">
                  {contentForm.type === 'pgn' ? 'PGN Notation' : 'Content'}
                </label>
                <textarea value={contentForm.body} onChange={e => setContentForm(f => ({ ...f, body: e.target.value }))}
                  placeholder={contentForm.type === 'pgn' ? '1. e4 e5 2. Nf3 Nc6...' : 'Write your lesson content here...'}
                  rows={8}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 text-sm resize-none font-mono" />
              </div>
            )}

            {contentForm.type === 'link' && (
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">URL</label>
                <input type="url" value={contentForm.linkUrl} onChange={e => setContentForm(f => ({ ...f, linkUrl: e.target.value }))}
                  placeholder="https://..."
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 text-sm" />
              </div>
            )}

            {['pdf', 'image', 'video'].includes(contentForm.type) && (
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Upload File</label>
                <label className="flex items-center gap-3 w-full bg-[#2a2a2a] border-2 border-dashed border-white/10 hover:border-amber-500/40 rounded-lg px-4 py-6 cursor-pointer transition-colors">
                  <Upload size={20} className="text-gray-500" />
                  <span className="text-sm text-gray-400">{uploadFile ? uploadFile.name : 'Click to select file'}</span>
                  <input type="file" className="hidden"
                    accept={contentForm.type === 'pdf' ? '.pdf' : contentForm.type === 'image' ? 'image/*' : 'video/*'}
                    onChange={e => setUploadFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            )}

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowContentModal(false)} className="flex-1 border border-white/10 text-gray-300 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm">Cancel</button>
              <button
                onClick={handleAddContent}
                disabled={saving || uploading || !contentForm.title.trim()}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                {uploading ? 'Uploading...' : saving ? 'Saving...' : 'Add Content'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Assignment Modal */}
      {showAssignmentModal && (
        <Modal title="Add Assignment" onClose={() => setShowAssignmentModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Title</label>
              <input type="text" value={assignmentForm.title} onChange={e => setAssignmentForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Assignment title"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Description / Instructions</label>
              <textarea value={assignmentForm.description} onChange={e => setAssignmentForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Describe the assignment tasks and instructions..."
                rows={5}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 text-sm resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Due Date</label>
                <input type="datetime-local" value={assignmentForm.dueDate} onChange={e => setAssignmentForm(f => ({ ...f, dueDate: e.target.value }))}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Max Points</label>
                <input type="number" value={assignmentForm.maxPoints} onChange={e => setAssignmentForm(f => ({ ...f, maxPoints: Number(e.target.value) }))}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 text-sm" />
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Attachments (optional)</label>
              <label className="flex items-center gap-3 w-full bg-[#2a2a2a] border-2 border-dashed border-white/10 hover:border-amber-500/40 rounded-lg px-4 py-4 cursor-pointer transition-colors">
                <Paperclip size={16} className="text-gray-500" />
                <span className="text-sm text-gray-400">
                  {assignmentAttachments.length > 0 ? `${assignmentAttachments.length} file(s) selected` : 'Attach files for students to reference'}
                </span>
                <input type="file" className="hidden" multiple accept="image/*,.pdf,video/*,.pgn,.txt"
                  onChange={e => setAssignmentAttachments(Array.from(e.target.files || []))} />
              </label>
              {assignmentAttachments.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {assignmentAttachments.map((f, i) => (
                    <span key={i} className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded">{f.name}</span>
                  ))}
                </div>
              )}
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowAssignmentModal(false)} className="flex-1 border border-white/10 text-gray-300 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm">Cancel</button>
              <button
                onClick={handleAddAssignment}
                disabled={saving}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                {saving ? 'Saving...' : 'Add Assignment'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
