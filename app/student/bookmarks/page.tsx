'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, BookOpen, Puzzle, Library, Trash2 } from 'lucide-react';

interface BookmarkedLesson { _id: string; title: string; type: string; courseId: string }
interface BookmarkedPuzzle { _id: string; title?: string; difficulty: string; rating: number; themes: string[] }
interface BookmarkedGame { _id: string; title: string; white: string; black: string; opening?: string }

interface Bookmarks {
  lessons: BookmarkedLesson[];
  puzzles: BookmarkedPuzzle[];
  games: BookmarkedGame[];
}

const TYPE_ICONS: Record<string, string> = { text: '📝', video: '▶️', pdf: '📄', image: '🖼️', pgn: '♟️', board: '♟', link: '🔗' };
const DIFF_COLORS: Record<string, string> = { easy: 'text-green-400', medium: 'text-amber-400', hard: 'text-orange-400', expert: 'text-red-400' };

export default function StudentBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmarks>({ lessons: [], puzzles: [], games: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'lessons' | 'puzzles' | 'games'>('lessons');

  useEffect(() => {
    fetch('/api/student/bookmarks')
      .then(r => r.json())
      .then(d => { setBookmarks(d.bookmarks || { lessons: [], puzzles: [], games: [] }); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const removeBookmark = async (type: string, id: string) => {
    await fetch(`/api/student/bookmarks?type=${type}&id=${id}`, { method: 'DELETE' });
    setBookmarks(b => ({
      ...b,
      [type]: (b[type as keyof Bookmarks] as { _id: string }[]).filter(x => x._id !== id),
    }));
  };

  const tabs = [
    { key: 'lessons' as const, label: 'Lessons', count: bookmarks.lessons.length, icon: BookOpen },
    { key: 'puzzles' as const, label: 'Puzzles', count: bookmarks.puzzles.length, icon: Puzzle },
    { key: 'games' as const, label: 'Games', count: bookmarks.games.length, icon: Library },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bookmark size={20} className="text-amber-400" /> Bookmarks
        </h1>
        <p className="text-gray-400 text-sm mt-1">Your saved lessons, puzzles, and games</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1a1a1a] border border-white/5 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'bg-amber-500 text-black' : 'text-gray-400 hover:text-white'}`}>
            <tab.icon size={15} />
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === tab.key ? 'bg-black/20 text-black' : 'bg-white/10 text-gray-300'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-3">
          {/* Lessons */}
          {activeTab === 'lessons' && (
            bookmarks.lessons.length === 0 ? (
              <Empty label="No bookmarked lessons" />
            ) : bookmarks.lessons.map(lesson => (
              <div key={lesson._id} className="flex items-center justify-between bg-[#1a1a1a] border border-white/5 hover:border-amber-500/20 rounded-xl p-4 transition-all">
                <Link href={`/student/courses/${lesson.courseId}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xl">{TYPE_ICONS[lesson.type] || '📝'}</span>
                  <div>
                    <p className="text-white text-sm font-medium truncate">{lesson.title}</p>
                    <p className="text-gray-500 text-xs capitalize">{lesson.type} lesson</p>
                  </div>
                </Link>
                <button onClick={() => removeBookmark('lessons', lesson._id)}
                  className="ml-3 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}

          {/* Puzzles */}
          {activeTab === 'puzzles' && (
            bookmarks.puzzles.length === 0 ? (
              <Empty label="No bookmarked puzzles" />
            ) : bookmarks.puzzles.map(puzzle => (
              <div key={puzzle._id} className="flex items-center justify-between bg-[#1a1a1a] border border-white/5 hover:border-amber-500/20 rounded-xl p-4 transition-all">
                <Link href="/student/chess/puzzles" className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xl">🧩</span>
                  <div>
                    <p className="text-white text-sm font-medium">{puzzle.title || `Puzzle #${puzzle._id.slice(-6)}`}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs capitalize font-medium ${DIFF_COLORS[puzzle.difficulty]}`}>{puzzle.difficulty}</span>
                      <span className="text-gray-600 text-xs">•</span>
                      <span className="text-gray-500 text-xs">Rating: {puzzle.rating}</span>
                    </div>
                    {puzzle.themes.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {puzzle.themes.slice(0, 3).map(t => (
                          <span key={t} className="text-xs px-1.5 py-0.5 bg-white/5 text-gray-400 rounded">{t}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
                <button onClick={() => removeBookmark('puzzles', puzzle._id)}
                  className="ml-3 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}

          {/* Games */}
          {activeTab === 'games' && (
            bookmarks.games.length === 0 ? (
              <Empty label="No bookmarked games" />
            ) : bookmarks.games.map(game => (
              <div key={game._id} className="flex items-center justify-between bg-[#1a1a1a] border border-white/5 hover:border-amber-500/20 rounded-xl p-4 transition-all">
                <Link href={`/student/chess/games/${game._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xl">♟</span>
                  <div>
                    <p className="text-white text-sm font-medium truncate">{game.title}</p>
                    <p className="text-gray-500 text-xs">{game.white} vs {game.black}</p>
                    {game.opening && <p className="text-gray-600 text-xs mt-0.5">{game.opening}</p>}
                  </div>
                </Link>
                <button onClick={() => removeBookmark('games', game._id)}
                  className="ml-3 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors shrink-0">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 bg-[#1a1a1a] rounded-xl border border-white/5 text-gray-500">
      <Bookmark size={36} className="opacity-20" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
