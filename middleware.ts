import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Protect selected routes (e.g. /resources) from unauthenticated access
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only guard the /resources path (including all sub-paths)
  if (pathname.startsWith('/resources')) {
    const token = await getToken({ req });
    if (!token) {
      // Redirect to login with callback to the originally requested path
      const loginUrl = new URL('/auth/login', req.url);
      loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Apply middleware only to the resources path to keep it lightweight
export const config = {
  matcher: ['/resources(.*)'],
};
