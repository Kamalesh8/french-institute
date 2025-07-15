import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Cache for public assets (1 day)
const PUBLIC_FILE_CACHE = {
  'public': {
    'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=31536000',
    'Vary': 'Accept-Encoding',
  },
};

// Cache for static pages (1 hour)
const STATIC_PAGE_CACHE = {
  'static': {
    'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    'Vary': 'Accept-Encoding, Accept-Language',
  },
};

// No cache for authenticated pages
const NO_CACHE = {
  'Cache-Control': 'no-store, max-age=0',
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname, origin } = request.nextUrl;
  const userAgent = request.headers.get('user-agent') || '';

  // Skip files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/workbox-') ||
    pathname.startsWith('/manifest.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Public paths that don't require authentication
  const publicPaths = ['/auth/login', '/auth/register', '/', '/about', '/contact', '/pricing'];
  
  // Protected paths that require authentication
  const protectedPaths = ['/dashboard', '/courses', '/profile', '/settings'];
  
  // Admin paths that require admin role
  const adminPaths = ['/admin'];
  
  // Teacher paths that require teacher role
  const teacherPaths = ['/teacher'];

  // Static content paths
  const staticPaths = ['/api/trpc', '/_next/static', '/static', '/assets'];

  // Check if the path is public
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!token) {
    const url = new URL('/auth/login', origin);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Check admin paths
  if (adminPaths.some(path => pathname.startsWith(path)) && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Check teacher paths
  if (teacherPaths.some(path => pathname.startsWith(path)) && token.role !== 'teacher' && token.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Set appropriate cache headers
  const headers = new Headers();

  if (staticPaths.some(path => pathname.startsWith(path))) {
    Object.entries(PUBLIC_FILE_CACHE.public).forEach(([key, value]) => {
      headers.set(key, value);
    });
  } else if (publicPaths.some(path => pathname.startsWith(path))) {
    Object.entries(STATIC_PAGE_CACHE.static).forEach(([key, value]) => {
      headers.set(key, value);
    });
  } else {
    // No cache for authenticated pages
    Object.entries(NO_CACHE).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }

  // Add security headers
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'SAMEORIGIN');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Handle response
  const res = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Apply all headers to the response
  headers.forEach((value, key) => {
    res.headers.set(key, value);
  });

  return res;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|workbox-*).*)',
    '/teacher/:path*',
  ],
};
