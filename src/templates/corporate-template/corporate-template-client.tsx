'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BlockRenderer from '@/blocks/BlockRenderer';

interface CorporatetemplateClientProps {
  blocks?: any[];
}

export default function CorporatetemplateClient({ blocks = [] }: CorporatetemplateClientProps) {
  const router = useRouter();
  const [content, setContent] = useState<any>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch('/api/content', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setContent(data);
        }
      } catch (error) {
        console.error('Erreur chargement contenu:', error);
      }
    };
    loadContent();
  }, []);

  if (!content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">corporate-template</h1>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="/" className="text-gray-500 hover:text-gray-900">Accueil</a>
              <a href="/work" className="text-gray-500 hover:text-gray-900">Projets</a>
              <a href="/studio" className="text-gray-500 hover:text-gray-900">Studio</a>
              <a href="/blog" className="text-gray-500 hover:text-gray-900">Blog</a>
              <a href="/contact" className="text-gray-500 hover:text-gray-900">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {blocks.length > 0 ? (
          <BlockRenderer blocks={blocks} />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Template corporate-template</h2>
            <p className="text-gray-600 mb-8">Template corporate généré avec l'IA</p>
            <div className="bg-gray-50 rounded-lg p-8">
              <p className="text-gray-500">Contenu du template à configurer</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 corporate-template. Template généré automatiquement.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}