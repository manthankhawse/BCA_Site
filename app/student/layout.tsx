'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen, MessageSquare,
  User, LogOut, Menu, X, ChevronRight, Trophy,
  Bell
} from 'lucide-react';

const navItems = [
  { href: '/student/courses', label: 'Courses', icon: BookOpen },
  { href: '/student/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/student/community', label: 'Community', icon: MessageSquare },
  { href: '/student/notifications', label: 'Notifications', icon: Bell },
  { href: '/student/profile', label: 'Profile', icon: User },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
    router.refresh();
  };

  useEffect(() => {
    fetch('/api/notifications')
      .then(r => r.json())
      .then(d => setUnreadCount(d.unreadCount || 0))
      .catch(() => {});
    const interval = setInterval(() => {
      fetch('/api/notifications')
        .then(r => r.json())
        .then(d => setUnreadCount(d.unreadCount || 0))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const isActive = (item: typeof navItems[0]) =>
    pathname.startsWith(item.href);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#111111] border-r border-white/5 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-black font-bold text-lg">♟</div>
            <div>
              <p className="font-bold text-white text-sm leading-none">BCA Student</p>
              <p className="text-gray-500 text-xs mt-0.5">Chess Academy</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150
                  ${active ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Icon size={17} className={active ? 'text-amber-400' : ''} />
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {item.href === '/student/notifications' && unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shrink-0">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
                {active && <ChevronRight size={13} className="ml-auto text-amber-400/60 shrink-0" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/5">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut size={17} />
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-white/5 px-6 py-3.5 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-gray-400 hover:text-white">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <Link href="/student/notifications" className="relative">
              <Bell size={18} className="text-gray-400 hover:text-white transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link href="/student/profile"
              className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 hover:bg-amber-500/30 transition-colors">
              <User size={16} />
            </Link>
          </div>
        </header>
        <main className="flex-1 p-5 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
