import { NextRequest, NextResponse } from 'next/server';
import { validateBasicAuth, createBasicAuthResponse } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Ajouter le pathname et les query params dans les headers pour que getActiveTemplate puisse les utiliser
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-search-params', request.nextUrl.searchParams.toString());

  // Protéger /admin et /api/admin/*
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!validateBasicAuth(request)) {
      return createBasicAuthResponse();
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 