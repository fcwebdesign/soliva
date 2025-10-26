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

  // Supprimer le paramètre ?template= si présent (sauf si explicitement en mode preview)
  // Cela évite que le paramètre reste collé dans l'URL après l'application d'un template
  const hasTemplateParam = request.nextUrl.searchParams.has('template');
  const hasPreviewParam = request.nextUrl.searchParams.has('preview');
  
  if (hasTemplateParam && !hasPreviewParam) {
    // Rediriger vers la même URL sans le paramètre template
    const url = request.nextUrl.clone();
    url.searchParams.delete('template');
    return NextResponse.redirect(url);
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
