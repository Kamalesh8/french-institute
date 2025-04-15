import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authToken = request.cookies.get('auth-token');
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/register', '/'];
  
  // Protected paths that require authentication
  const protectedPaths = [
    '/dashboard',
    '/courses',
    '/profile',
  ];

  // Admin paths that require admin role
  const adminPaths = ['/admin'];

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => 
    pathname.startsWith(path)
  );

  // Check if the current path is admin only
  const isAdminPath = adminPaths.some(path => 
    pathname.startsWith(path)
  );

  // Check if the current path is public
  const isPublicPath = publicPaths.some(path => 
    pathname === path
  );

  // If the path is protected and there's no auth token, redirect to login
  if (isProtectedPath && !authToken) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If the path is admin and there's no admin role (check cookie), redirect to dashboard
  if (isAdminPath) {
    const userRole = request.cookies.get('user-role')?.value;
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // If user is authenticated and tries to access login/register, redirect to dashboard
  if (isPublicPath && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/courses/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/auth/login',
    '/auth/register',
  ],
};
