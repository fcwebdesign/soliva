'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function DebugtestClient() {
  const [content, setContent] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    console.log('🔄 DebugTest - pathname changé:', pathname);
    const loadContent = async () => {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setContent(data);
          console.log('✅ Contenu chargé pour pathname:', pathname);
        }
      } catch (error) {
        console.error('Erreur chargement contenu:', error);
      }
    };
    loadContent();
  }, [pathname]);

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Logique de routage simple
  let pageData: any = null;
  if (pathname === '/') {
    pageData = content?.home;
  } else if (pathname === '/work') {
    pageData = content?.work;
  } else if (pathname === '/blog') {
    pageData = content?.blog;
  } else if (pathname === '/studio') {
    pageData = content?.studio;
  } else if (pathname === '/contact') {
    pageData = content?.contact;
  } else {
    pageData = content?.home;
  }

  console.log('📄 DebugTest - pathname:', pathname, 'pageData:', pageData?.title);

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">Debug Test</h1>
      <p className="text-gray-600 mb-4">Pathname: {pathname}</p>
      <p className="text-gray-600 mb-4">Page: {pageData?.title || 'Non trouvée'}</p>
      <p className="text-gray-600 mb-4">Description: {pageData?.description || 'Aucune'}</p>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-xl font-bold mb-2">Contenu de la page:</h2>
        <pre className="text-sm">{JSON.stringify(pageData, null, 2)}</pre>
      </div>
    </div>
  );
}