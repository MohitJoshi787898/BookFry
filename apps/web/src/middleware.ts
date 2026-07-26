import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('refreshToken')?.value;
  const isLoggedInCookie = request.cookies.get('bookmarket_logged_in')?.value;
  const hasToken = token || isLoggedInCookie === 'true';
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');
  const isProtectedRoute =
    pathname.startsWith('/seller') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/account') ||
    pathname.startsWith('/checkout');

  if (isProtectedRoute && !hasToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && hasToken) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/seller/:path*',
    '/admin/:path*',
    '/account/:path*',
    '/checkout',
  ],
};
