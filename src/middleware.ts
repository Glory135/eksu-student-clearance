import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/verify-email', '/reset-password'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Check if user is authenticated (has auth cookie)
  const hasAuthCookie = request.cookies.has('payload-token');

  // If accessing a public route and user is authenticated, redirect to appropriate dashboard
  if (isPublicRoute && hasAuthCookie) {
    // You can add logic here to determine the user's role and redirect accordingly
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If accessing a protected route and user is not authenticated, redirect to login
  if (!isPublicRoute && !hasAuthCookie) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 