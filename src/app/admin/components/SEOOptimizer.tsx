"use client";
import { useState, useEffect } from 'react';
import { Search, Link, FileText, Hash, Eye } from 'lucide-react';

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
    <div className="bg-white/80 backdrop-blur-xl rounded-xl border border-gray-200/50 p-6 shadow-lg">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-lg">
          <Search className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">SEO Optimizer</h3>
          <p className="text-sm text-gray-500">Optimisation automatique avec IA</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Slug */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Link className="w-4 h-4 mr-2 text-gray-500" />
            Slug (URL)
          </label>
          <input
            type="text"
            value={seoData.slug}
            onChange={(e) => updateSeoField('slug', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
            placeholder="slug-de-larticle"
          />
        </div>

        {/* Description */}
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-gray-500" />
              Description (Meta description)
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              seoData.description.length > 160 
                ? 'bg-red-100 text-red-700' 
                : seoData.description.length > 140
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {seoData.description.length}/160
            </span>
          </label>
          <textarea
            value={seoData.description}
            onChange={(e) => updateSeoField('description', e.target.value)}
            rows={3}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              seoData.description.length > 160 
                ? 'border-red-300 bg-red-50/50' 
                : 'border-gray-200'
            }`}
            placeholder="Description pour les moteurs de recherche..."
          />
        </div>

        {/* Extrait */}
        <div>
          <label className="flex items-center justify-between text-sm font-medium text-gray-700 mb-2">
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-2 text-gray-500" />
              Extrait (Résumé)
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${
              seoData.excerpt.length > 300 
                ? 'bg-red-100 text-red-700' 
                : seoData.excerpt.length > 250
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {seoData.excerpt.length}/300
            </span>
          </label>
          <textarea
            value={seoData.excerpt}
            onChange={(e) => updateSeoField('excerpt', e.target.value)}
            rows={3}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm ${
              seoData.excerpt.length > 300 
                ? 'border-red-300 bg-red-50/50' 
                : 'border-gray-200'
            }`}
            placeholder="Résumé de l'article..."
          />
        </div>

        {/* Mots-clés */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Hash className="w-4 h-4 mr-2 text-gray-500" />
            Mots-clés (séparés par des virgules)
          </label>
          <input
            type="text"
            value={seoData.keywords.join(', ')}
            onChange={(e) => updateSeoField('keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
            placeholder="mot-clé1, mot-clé2, mot-clé3..."
          />
        </div>

        {/* Prévisualisation */}
        <div className="mt-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl border border-gray-200/50">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-white rounded-lg shadow-sm mr-3">
              <Eye className="w-4 h-4 text-gray-600" />
            </div>
            <h4 className="text-sm font-semibold text-gray-800">Prévisualisation Google</h4>
          </div>
          <div className="space-y-2 text-sm bg-white/80 backdrop-blur-sm p-4 rounded-lg border border-gray-200/50">
            <div className="text-blue-600 font-medium text-lg leading-tight">{seoData.title || 'Titre de l\'article'}</div>
            <div className="text-green-600 text-sm">{`https://soliva.studio/blog/${seoData.slug || 'slug-article'}`}</div>
            <div className="text-gray-600 leading-relaxed">{seoData.description || 'Description de l\'article pour les moteurs de recherche...'}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 