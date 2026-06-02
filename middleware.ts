import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('bca_token')?.value;

  // Auth routes — redirect if already logged in
  if (pathname.startsWith('/auth/login')) {
    if (token) {
      const payload = await verifyToken(token);
      if (payload) {
        const dest =
          payload.role === 'admin' ? '/admin' :
          payload.role === 'coach' ? '/coach' :
          '/student';
        return NextResponse.redirect(new URL(dest, req.url));
      }
    }
    return NextResponse.next();
  }

  // Admin routes — require admin role
  if (pathname.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/auth/login', req.url));
    const payload = await verifyToken(token);
    if (!payload || payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    return NextResponse.next();
  }

  // Coach routes — require coach or admin role
  if (pathname.startsWith('/coach')) {
    if (!token) return NextResponse.redirect(new URL('/auth/login', req.url));
    const payload = await verifyToken(token);
    if (!payload || (payload.role !== 'coach' && payload.role !== 'admin')) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    return NextResponse.next();
  }

  // Student routes — require any authenticated user
  if (pathname.startsWith('/student')) {
    if (!token) return NextResponse.redirect(new URL('/auth/login', req.url));
    const payload = await verifyToken(token);
    if (!payload) return NextResponse.redirect(new URL('/auth/login', req.url));
    // Coaches/admins can access student portal too (for testing)
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/coach/:path*', '/student/:path*', '/auth/login'],
};
