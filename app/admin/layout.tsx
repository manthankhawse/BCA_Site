'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, BookOpen, MessageSquare, Settings,
  LogOut, Menu, X, GraduationCap, ChevronRight, Trophy,
  Library, Puzzle, CalendarDays, BarChart3
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/tournaments', label: 'Tournaments', icon: Trophy },
  { href: '/admin/community', label: 'Community', icon: MessageSquare },
  { href: '/admin/profile', label: 'Profile', icon: GraduationCap },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
    router.refresh();
  };

  const isActive = (item: typeof navItems[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex">
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#111111] border-r border-white/5 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>

        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center text-black font-bold text-lg">♛</div>
            <div>
              <p className="font-bold text-white text-sm leading-none">BCA Admin</p>
              <p className="text-gray-500 text-xs mt-0.5">Brilliant Chess Academy</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item);
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group
                  ${active ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <Icon size={17} className={active ? 'text-amber-400' : ''} />
                <span className="text-sm font-medium">{item.label}</span>
                {active && <ChevronRight size={14} className="ml-auto text-amber-400/60" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <LogOut size={18} />
            <span className="text-sm font-medium">Sign out</span>
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 bg-[#0a0a0a]/80 backdrop-blur-sm border-b border-white/5 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden text-gray-400 hover:text-white">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="flex items-center gap-2 ml-auto">
            <Link href="/admin/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
                <GraduationCap size={16} className="text-black" />
              </div>
              <span className="text-sm text-gray-300 hidden sm:block font-medium">Admin</span>
            </Link>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
