import { NextRequest, NextResponse } from 'next/server';
import { validateBasicAuth, createBasicAuthResponse } from './lib/auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protéger /admin et /api/admin/*
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    if (!validateBasicAuth(request)) {
      return createBasicAuthResponse();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
}; 