'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Pencil, Trash2, X, BookOpen, Users, Eye } from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  description: string;
  level: string;
  instructor?: string;
  duration?: string;
  enrolledStudents: { _id: string; name: string }[];
  isPublished: boolean;
  createdAt: string;
}

const levelColors: Record<string, string> = {
  beginner: 'green',
  intermediate: 'amber',
  advanced: 'orange',
  elite: 'red',
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#1a1a1a]">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [form, setForm] = useState({ title: '', description: '', level: 'beginner', instructor: '', duration: '', isPublished: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchCourses = async () => {
    const res = await fetch('/api/admin/courses');
    const data = await res.json();
    setCourses(data.courses || []);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const openCreate = () => {
    setEditCourse(null);
    setForm({ title: '', description: '', level: 'beginner', instructor: '', duration: '', isPublished: true });
    setError('');
    setShowModal(true);
  };

  const openEdit = (c: Course) => {
    setEditCourse(c);
    setForm({ title: c.title, description: c.description, level: c.level, instructor: c.instructor || '', duration: c.duration || '', isPublished: c.isPublished });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const url = editCourse ? `/api/admin/courses/${editCourse._id}` : '/api/admin/courses';
      const method = editCourse ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      await fetchCourses();
      setShowModal(false);
    } catch { setError('Network error'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course and all its content?')) return;
    await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
    await fetchCourses();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Courses</h1>
          <p className="text-gray-400 text-sm mt-1">{courses.length} courses</p>
        </div>
        <button
          id="create-course-btn"
          onClick={openCreate}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={18} /> Create Course
        </button>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => {
            const color = levelColors[course.level] || 'gray';
            return (
              <div key={course._id} className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-all">
                <div className={`h-1.5 bg-${color}-500`} />
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-white font-semibold">{course.title}</h3>
                      <span className={`text-xs text-${color}-400 font-medium capitalize`}>{course.level}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${course.isPublished ? 'bg-green-500/15 text-green-400' : 'bg-gray-500/15 text-gray-400'}`}>
                      {course.isPublished ? 'Live' : 'Draft'}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm line-clamp-2 mb-4">{course.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Users size={14} />
                      {course.enrolledStudents.length} students
                    </span>
                    {course.instructor && <span className="truncate">{course.instructor}</span>}
                  </div>

                  <div className="flex gap-2">
                    <Link
                      href={`/admin/courses/${course._id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm py-2 rounded-lg transition-colors"
                    >
                      <Eye size={14} /> Manage
                    </Link>
                    <button
                      onClick={() => openEdit(course)}
                      className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(course._id)}
                      className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {courses.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
              <BookOpen size={40} className="opacity-30" />
              <p>No courses yet. Create your first course!</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <Modal title={editCourse ? 'Edit Course' : 'Create Course'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Course Title</label>
              <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Advanced Endgame Techniques"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Course description..."
                rows={4}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors text-sm resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Level</label>
                <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-amber-500/50 transition-colors text-sm">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="elite">Elite</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1.5">Duration</label>
                <input type="text" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  placeholder="e.g. 8 weeks"
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Instructor</label>
              <input type="text" value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))}
                placeholder="e.g. GM Magnus Carlsen"
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 transition-colors text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="published" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                className="w-4 h-4 accent-amber-500" />
              <label htmlFor="published" className="text-sm text-gray-300">Published (visible to students)</label>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-300 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg transition-colors text-sm"
              >
                {saving ? 'Saving...' : editCourse ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
