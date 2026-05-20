import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const role = request.cookies.get('user_role')?.value;
  const { pathname } = request.nextUrl;

  // Protect Admin routes
  if (pathname.startsWith('/admin')) {
    if (!token || role !== 'Admin') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Franchise routes
  if (pathname.startsWith('/franchise')) {
    if (!token || role !== 'Franchisee') {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect Customer dashboard
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect logged-in users trying to access login/register pages
  if (pathname === '/login' || pathname === '/register') {
    if (token && role) {
      if (role === 'Admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (role === 'Franchisee') {
        return NextResponse.redirect(new URL('/franchise/dashboard', request.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/franchise/:path*',
    '/dashboard/:path*',
    '/login',
    '/register',
  ],
};
