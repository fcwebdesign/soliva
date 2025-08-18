"use client";
import { useState, useEffect } from 'react';

interface SEOData {
  title: string;
  description: string;
  keywords: string[];
  slug: string;
  excerpt: string;
}

interface SEOOptimizerProps {
  articleTitle: string;
  articleContent: string;
  onUpdate: (seoData: SEOData) => void;
}

export default function SEOOptimizer({ articleTitle, articleContent, onUpdate }: SEOOptimizerProps) {
  const [seoData, setSeoData] = useState<SEOData>({
    title: '',
    description: '',
    keywords: [],
    slug: '',
    excerpt: ''
  });

  // Générer automatiquement le SEO quand le titre ou le contenu change
  useEffect(() => {
    if (articleTitle) {
      generateSEO(articleTitle, articleContent);
    }
  }, [articleTitle, articleContent]);

  const generateSEO = (title: string, content: string) => {
    // Générer le slug à partir du titre
    const slug = title
      .toLowerCase()
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ûüù]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Extraire les mots-clés du titre et du contenu
    const text = `${title} ${content}`.toLowerCase();
    const words = text
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);
    
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    const keywords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    // Générer une description
    const cleanContent = content.replace(/<[^>]*>/g, '').trim();
    const description = cleanContent.length > 160 
      ? cleanContent.substring(0, 157) + '...'
      : cleanContent;

    // Générer un extrait
    const excerpt = cleanContent.length > 300
      ? cleanContent.substring(0, 297) + '...'
      : cleanContent;

    const newSeoData: SEOData = {
      title: title,
      description,
      keywords,
      slug,
      excerpt
    };

    setSeoData(newSeoData);
    onUpdate(newSeoData);
  };

  const updateSeoField = (field: keyof SEOData, value: any) => {
    const newSeoData = { ...seoData, [field]: value };
    setSeoData(newSeoData);
    onUpdate(newSeoData);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl">🔍</span>
        <h3 className="text-lg font-semibold text-gray-900">Optimisation SEO</h3>
      </div>
      
      <div className="space-y-4">
        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug (URL)
          </label>
          <input
            type="text"
            value={seoData.slug}
            onChange={(e) => updateSeoField('slug', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="slug-de-larticle"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description (Meta description)
            <span className="text-xs text-gray-500 ml-2">
              {seoData.description.length}/160 caractères
            </span>
          </label>
          <textarea
            value={seoData.description}
            onChange={(e) => updateSeoField('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              seoData.description.length > 160 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            }`}
            placeholder="Description pour les moteurs de recherche..."
          />
        </div>

        {/* Extrait */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Extrait (Résumé)
            <span className="text-xs text-gray-500 ml-2">
              {seoData.excerpt.length}/300 caractères
            </span>
          </label>
          <textarea
            value={seoData.excerpt}
            onChange={(e) => updateSeoField('excerpt', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
              seoData.excerpt.length > 300 
                ? 'border-red-300 bg-red-50' 
                : 'border-gray-300'
            }`}
            placeholder="Résumé de l'article..."
          />
        </div>

        {/* Mots-clés */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mots-clés (séparés par des virgules)
          </label>
          <input
            type="text"
            value={seoData.keywords.join(', ')}
            onChange={(e) => updateSeoField('keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="mot-clé1, mot-clé2, mot-clé3..."
          />
        </div>

        {/* Prévisualisation */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Prévisualisation Google</h4>
          <div className="space-y-1 text-sm">
            <div className="text-blue-600 font-medium">{seoData.title}</div>
            <div className="text-green-600">{`https://soliva.studio/blog/${seoData.slug}`}</div>
            <div className="text-gray-600">{seoData.description}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 