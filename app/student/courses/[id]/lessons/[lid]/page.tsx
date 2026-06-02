'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, CheckCircle, Bookmark, BookmarkCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const ChessboardViewer = dynamic(() => import('./ChessboardViewer'), { ssr: false });

interface Lesson {
  _id: string; title: string; type: string; body?: string;
  fileUrl?: string; linkUrl?: string; fen?: string; duration?: number;
  moduleId: string; order: number;
}

interface NavLesson { _id: string; title: string; type: string }

export default function LessonPage({ params }: { params: Promise<{ id: string; lid: string }> }) {
  const { id, lid } = use(params);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [allLessons, setAllLessons] = useState<NavLesson[]>([]);
  const [completed, setCompleted] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/courses/${id}/modules`).then(r => r.json()),
      fetch(`/api/student/progress?courseId=${id}`).then(r => r.json()),
    ]).then(([modData, progData]) => {
      const flat: NavLesson[] = [];
      (modData.modules || []).forEach((m: { lessons: NavLesson[] }) => {
        m.lessons.forEach(l => flat.push(l));
      });
      setAllLessons(flat);

      const currentLesson = flat.find(l => l._id === lid);
      if (!currentLesson) { setLoading(false); return; }

      // Fetch full lesson data
      const mod = (modData.modules || []).find((m: { lessons: NavLesson[] }) =>
        m.lessons.some(l => l._id === lid));
      if (mod) {
        fetch(`/api/admin/courses/${id}/modules/${mod._id}/lessons/${lid}`)
          .then(r => r.json())
          .then(d => {
            setLesson(d.lesson);
            const prog = progData.progress;
            setCompleted(prog?.completedLessons?.includes(lid) ?? false);
            setLoading(false);
          });
      }
    }).catch(() => setLoading(false));
  }, [id, lid]);

  const currentIndex = allLessons.findIndex(l => l._id === lid);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const markComplete = async () => {
    if (completed || marking) return;
    setMarking(true);
    await fetch('/api/student/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lessonId: lid, courseId: id }),
    });
    setCompleted(true);
    setMarking(false);
  };

  const toggleBookmark = async () => {
    const action = bookmarked ? 'DELETE' : 'POST';
    if (action === 'POST') {
      await fetch('/api/student/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'lessons', id: lid }),
      });
    } else {
      await fetch(`/api/student/bookmarks?type=lessons&id=${lid}`, { method: 'DELETE' });
    }
    setBookmarked(b => !b);
  };

  if (loading) return <div className="text-center py-16 text-gray-500">Loading lesson...</div>;
  if (!lesson) return <div className="text-center py-16 text-red-400">Lesson not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Nav bar */}
      <div className="flex items-center justify-between">
        <Link href={`/student/courses/${id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
          <ArrowLeft size={16} /> Back to course
        </Link>
        <div className="flex items-center gap-2">
          {prevLesson && (
            <Link href={`/student/courses/${id}/lessons/${prevLesson._id}`}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#1a1a1a] border border-white/5 hover:border-white/20 rounded-lg text-gray-400 hover:text-white text-xs transition-colors">
              <ChevronLeft size={14} /> Prev
            </Link>
          )}
          <span className="text-gray-600 text-xs px-2">{currentIndex + 1} / {allLessons.length}</span>
          {nextLesson && (
            <Link href={`/student/courses/${id}/lessons/${nextLesson._id}`}
              className="flex items-center gap-1 px-3 py-1.5 bg-[#1a1a1a] border border-white/5 hover:border-white/20 rounded-lg text-gray-400 hover:text-white text-xs transition-colors">
              Next <ChevronRight size={14} />
            </Link>
          )}
        </div>
      </div>

      {/* Lesson header */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-gray-500 text-xs capitalize mb-1">{lesson.type} lesson</p>
            <h1 className="text-xl font-bold text-white">{lesson.title}</h1>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button onClick={toggleBookmark} title="Bookmark"
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors ${
                bookmarked ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}>
              {bookmarked ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
            </button>
            <button onClick={markComplete} disabled={completed || marking}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                completed
                  ? 'bg-green-500/15 text-green-400 border border-green-500/20 cursor-default'
                  : 'bg-amber-500 hover:bg-amber-400 text-black'}`}>
              <CheckCircle size={15} />
              {completed ? 'Completed' : marking ? 'Saving...' : 'Mark Complete'}
            </button>
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden">
        {lesson.type === 'text' && lesson.body && (
          <div className="p-6 prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white">
            <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{lesson.body}</div>
          </div>
        )}

        {lesson.type === 'video' && lesson.fileUrl && (
          <div className="aspect-video bg-black">
            <video src={lesson.fileUrl} controls className="w-full h-full" />
          </div>
        )}

        {lesson.type === 'pdf' && lesson.fileUrl && (
          <div className="p-4">
            <iframe src={lesson.fileUrl} className="w-full rounded-lg border border-white/10" style={{ height: '70vh' }} />
          </div>
        )}

        {lesson.type === 'image' && lesson.fileUrl && (
          <div className="p-6 flex justify-center">
            <img src={lesson.fileUrl} alt={lesson.title} className="max-w-full rounded-lg border border-white/10" />
          </div>
        )}

        {lesson.type === 'link' && lesson.linkUrl && (
          <div className="p-6 text-center">
            <a href={lesson.linkUrl} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-6 py-3 rounded-lg transition-colors">
              Open Link <ArrowRight size={16} />
            </a>
            <p className="text-gray-500 text-sm mt-3 break-all">{lesson.linkUrl}</p>
          </div>
        )}

        {lesson.type === 'pgn' && lesson.body && (
          <div className="p-6 space-y-4">
            <div className="bg-[#0a0a0a] rounded-xl p-4 border border-white/5 font-mono text-xs text-gray-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {lesson.body}
            </div>
            {/* Analysis removed as per request */}
          </div>
        )}

        {lesson.type === 'board' && (
          <div className="p-6">
            <ChessboardViewer fen={lesson.fen} />
            {lesson.body && (
              <p className="text-gray-400 text-sm mt-4 leading-relaxed">{lesson.body}</p>
            )}
          </div>
        )}
      </div>

      {/* Next lesson CTA */}
      {nextLesson && completed && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/5 border border-amber-500/15 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-xs">Next up</p>
            <p className="text-white font-medium">{nextLesson.title}</p>
          </div>
          <Link href={`/student/courses/${id}/lessons/${nextLesson._id}`}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold px-4 py-2 rounded-lg text-sm transition-colors">
            Continue <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
