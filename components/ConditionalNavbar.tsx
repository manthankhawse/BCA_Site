'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  // Hide public navbar on admin, student, and auth pages
  const hideOn = ['/admin', '/student', '/auth'];
  const shouldHide = hideOn.some(prefix => pathname.startsWith(prefix));
  if (shouldHide) return null;
  return <Navbar />;
}
