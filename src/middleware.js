import { NextResponse } from 'next/server';
import { readContent } from '@/lib/content';

export async function middleware(request) {
  // Exclure l'admin et les pages de template de la redirection
  if (request.nextUrl.pathname.startsWith('/admin') || 
      request.nextUrl.pathname.startsWith('/agency-premium') ||
      request.nextUrl.pathname.startsWith('/portfolio-signature')) {
    return NextResponse.next();
  }

  try {
    // Lire le contenu pour vérifier le template actif
    const content = await readContent();
    
    // Si le template agency-premium est actif, rediriger
    if (content._template === 'agency-premium') {
      return NextResponse.redirect(new URL('/agency-premium', request.url));
    }
  } catch (error) {
    console.error('Erreur middleware:', error);
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
     * - admin (admin routes)
     * - agency-premium (template routes)
     * - portfolio-signature (template routes)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|admin|agency-premium|portfolio-signature).*)',
  ],
}; 