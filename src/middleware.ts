import { NextRequest, NextResponse } from 'next/server';
import { validateBasicAuth, createBasicAuthResponse } from './lib/auth';

export async function middleware(request: NextRequest) {
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

  // Exclure l'admin et les pages de template de la redirection
  if (pathname.startsWith('/admin') || 
      pathname.startsWith('/agency-premium') ||
      pathname.startsWith('/portfolio-signature')) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Pour la redirection de template, on va utiliser une approche différente
  // On peut vérifier le template via une API route ou un cookie
  // Pour l'instant, on désactive cette fonctionnalité pour éviter le problème de node:fs

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
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     *
     * Note: On inclut /admin pour que le middleware ajoute les headers x-pathname/x-search-params
     * afin que getActiveTemplate puisse détecter et ignorer le template sur les routes admin.
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 
