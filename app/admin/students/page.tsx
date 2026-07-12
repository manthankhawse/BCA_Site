'use client';
import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X, User, BookOpen, Loader2 } from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  rating?: number;
  bio?: string;
  enrolledCourses: { _id: string; title: string; level: string }[];
  createdAt: string;
}

interface Course { _id: string; title: string; }

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-white/5 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={20} /></button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [enrollModal, setEnrollModal] = useState<Student | null>(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', bio: '', rating: '1000' });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [courseSearch, setCourseSearch] = useState('');

  const fetchStudents = async () => {
    const res = await fetch('/api/admin/students');
    const data = await res.json();
    setStudents(data.students || []);
    setLoading(false);
  };

  const fetchCourses = async () => {
    const res = await fetch('/api/admin/courses');
    const data = await res.json();
    setCourses(data.courses || []);
  };

  useEffect(() => { fetchStudents(); fetchCourses(); }, []);

  const openCreate = () => {
    setEditStudent(null);
    setForm({ name: '', email: '', password: '', phone: '', bio: '', rating: '1000' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (s: Student) => {
    setEditStudent(s);
    setForm({ name: s.name, email: s.email, password: '', phone: s.phone || '', bio: s.bio || '', rating: String(s.rating || 1000) });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);
    try {
      const url = editStudent ? `/api/admin/students/${editStudent._id}` : '/api/admin/students';
      const method = editStudent ? 'PUT' : 'POST';
      const body = { ...form, rating: Number(form.rating) };
      if (editStudent && !form.password) delete (body as Record<string, unknown>).password;

      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      await fetchStudents();
      setShowModal(false);
    } catch { setError('Network error'); } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this student?')) return;
    setDeleting(id);
    try {
      await fetch(`/api/admin/students/${id}`, { method: 'DELETE' });
      await fetchStudents();
    } finally { setDeleting(null); }
  };

  const handleEnroll = async (courseId: string, action: 'enroll' | 'unenroll') => {
    if (!enrollModal) return;
    setEnrolling(courseId);
    try {
      await fetch(`/api/admin/courses/${courseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: enrollModal._id, action }),
      });
      await fetchStudents();
      // Refresh the enrollModal state with updated data
      const res = await fetch('/api/admin/students');
      const data = await res.json();
      const updatedStudents: Student[] = data.students || [];
      setStudents(updatedStudents);
      const updated = updatedStudents.find(s => s._id === enrollModal._id);
      if (updated) setEnrollModal(updated);
    } finally { setEnrolling(null); }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Students</h1>
          <p className="text-gray-400 text-sm mt-1">{students.length} total students</p>
        </div>
        <button
          id="add-student-btn"
          onClick={openCreate}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={18} /> Add Student
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500
            focus:outline-none focus:border-amber-500/50 transition-colors"
        />
      </div>

      {/* Table */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500 gap-2">
            <Loader2 size={18} className="animate-spin" /> Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500 gap-3">
            <User size={40} className="opacity-30" />
            <p>No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Rating</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Courses</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(s => (
                  <tr key={s._id} className="hover:bg-white/2 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 font-bold text-sm flex-shrink-0">
                          {s.name[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{s.name}</p>
                          <p className="text-gray-500 text-xs">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-amber-400 font-mono font-semibold">{s.rating || 1000}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 flex-wrap">
                        {s.enrolledCourses.length === 0 ? (
                          <span className="text-gray-600 text-xs">None</span>
                        ) : s.enrolledCourses.slice(0, 2).map(c => (
                          <span key={c._id} className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">
                            {c.title}
                          </span>
                        ))}
                        {s.enrolledCourses.length > 2 && (
                          <span className="text-xs text-gray-500">+{s.enrolledCourses.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEnrollModal(s); setCourseSearch(''); }}
                          className="p-1.5 text-gray-400 hover:text-cyan-400 hover:bg-cyan-400/10 rounded-lg transition-colors"
                          title="Manage enrollment"
                        >
                          <BookOpen size={16} />
                        </button>
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 text-gray-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-colors"
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(s._id)}
                          disabled={deleting === s._id}
                          className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {deleting === s._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <Modal title={editStudent ? 'Edit Student' : 'Add Student'} onClose={() => setShowModal(false)}>
          <div className="space-y-4">
            {[
              { label: 'Full Name', field: 'name', type: 'text', placeholder: 'John Doe' },
              { label: 'Email', field: 'email', type: 'email', placeholder: 'john@example.com' },
              { label: 'Password', field: 'password', type: 'password', placeholder: editStudent ? 'Leave blank to keep current' : 'Min 6 characters' },
              { label: 'Phone', field: 'phone', type: 'text', placeholder: '+91 9876543210' },
              { label: 'Chess Rating', field: 'rating', type: 'number', placeholder: '1000' },
            ].map(({ label, field, type, placeholder }) => (
              <div key={field}>
                <label className="block text-sm text-gray-300 mb-1.5">{label}</label>
                <input
                  type={type}
                  value={form[field as keyof typeof form]}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500
                    focus:outline-none focus:border-amber-500/50 transition-colors text-sm"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm text-gray-300 mb-1.5">Bio</label>
              <textarea
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Student bio..."
                rows={3}
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500
                  focus:outline-none focus:border-amber-500/50 transition-colors text-sm resize-none"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowModal(false)} className="flex-1 border border-white/10 text-gray-300 py-2.5 rounded-lg hover:bg-white/5 transition-colors text-sm">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-semibold py-2.5 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                {saving ? <><Loader2 size={15} className="animate-spin" /> Saving...</> : editStudent ? 'Save Changes' : 'Add Student'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Enrollment Modal with Search */}
      {enrollModal && (
        <Modal title={`Manage Enrollment — ${enrollModal.name}`} onClose={() => { setEnrollModal(null); fetchStudents(); }}>
          <div className="space-y-3">
            {/* Course Search */}
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                value={courseSearch}
                onChange={e => setCourseSearch(e.target.value)}
                placeholder="Search courses..."
                className="w-full bg-[#2a2a2a] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-white text-sm placeholder-gray-500
                  focus:outline-none focus:border-amber-500/50 transition-colors"
              />
            </div>

            {filteredCourses.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No courses match your search</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filteredCourses.map(course => {
                  const enrolled = enrollModal.enrolledCourses.some(c => c._id === course._id);
                  const isLoading = enrolling === course._id;
                  return (
                    <div key={course._id} className="flex items-center justify-between p-3 bg-[#2a2a2a] rounded-lg">
                      <span className="text-white text-sm truncate flex-1 mr-3">{course.title}</span>
                      <button
                        onClick={() => handleEnroll(course._id, enrolled ? 'unenroll' : 'enroll')}
                        disabled={isLoading}
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 flex-shrink-0 disabled:opacity-60 ${
                          enrolled
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        }`}
                      >
                        {isLoading && <Loader2 size={12} className="animate-spin" />}
                        {enrolled ? 'Unenroll' : 'Enroll'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-gray-600 text-xs pt-1">
              {enrollModal.enrolledCourses.length} course{enrollModal.enrolledCourses.length !== 1 ? 's' : ''} enrolled
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
