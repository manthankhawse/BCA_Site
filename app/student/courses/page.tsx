'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, ArrowRight, CheckCircle, Lock } from 'lucide-react';

interface Progress { progressPercent: number; completedLessons: string[] }
interface Course {
  _id: string; title: string; description: string; level: string;
  totalLessons: number; instructor?: string; duration?: string;
  thumbnail?: string; progress?: Progress;
}

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'bg-green-500/10 text-green-400 border-green-500/20',
  intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  advanced: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  elite: 'bg-red-500/10 text-red-400 border-red-500/20',
};

export default function StudentCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetch('/api/student/courses')
      .then(r => r.json())
      .then(async d => {
        const coursesData: Course[] = d.courses || [];
        // Fetch progress for each course
        const withProgress = await Promise.all(
          coursesData.map(async c => {
            try {
              const pr = await fetch(`/api/student/progress?courseId=${c._id}`).then(r => r.json());
              return { ...c, progress: pr.progress };
            } catch { return c; }
          })
        );
        setCourses(withProgress);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  const levels = ['all', 'beginner', 'intermediate', 'advanced', 'elite'];
  const filtered = filter === 'all' ? courses : courses.filter(c => c.level === filter);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Courses</h1>
        <p className="text-gray-400 text-sm mt-1">{courses.length} course{courses.length !== 1 ? 's' : ''} enrolled</p>
      </div>

      {/* Level filter */}
      <div className="flex gap-1.5 flex-wrap">
        {levels.map(l => (
          <button key={l} onClick={() => setFilter(l)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === l ? 'bg-amber-500 text-black' : 'bg-[#1a1a1a] border border-white/5 text-gray-400 hover:text-white'}`}>
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading your courses...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#1a1a1a] rounded-xl border border-white/5 text-gray-500">
          <BookOpen size={48} className="opacity-20" />
          <p>No courses found. Contact your academy to get enrolled.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map(course => {
            const pct = course.progress?.progressPercent || 0;
            const completed = course.progress?.completedLessons?.length || 0;
            return (
              <Link key={course._id} href={`/student/courses/${course._id}`}
                className="group bg-[#1a1a1a] border border-white/5 hover:border-amber-500/30 rounded-xl overflow-hidden transition-all">
                {/* Thumbnail / gradient header */}
                <div className="h-32 bg-gradient-to-br from-amber-500/20 via-orange-500/10 to-transparent flex items-center justify-center relative overflow-hidden">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl opacity-30">♟</span>
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${LEVEL_COLORS[course.level] || ''}`}>
                      {course.level}
                    </span>
                  </div>
                  {pct === 100 && (
                    <div className="absolute top-3 left-3">
                      <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-full">
                        <CheckCircle size={10} /> Complete
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-white font-semibold text-sm leading-snug mb-1 group-hover:text-amber-400 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-500 text-xs line-clamp-2 mb-3">{course.description}</p>

                  <div className="flex items-center gap-3 text-gray-500 text-xs mb-3">
                    {course.instructor && <span>👤 {course.instructor}</span>}
                    {course.totalLessons > 0 && (
                      <span className="flex items-center gap-1">
                        <BookOpen size={10} /> {course.totalLessons} lessons
                      </span>
                    )}
                    {course.duration && <span className="flex items-center gap-1"><Clock size={10} /> {course.duration}</span>}
                  </div>

                  
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
