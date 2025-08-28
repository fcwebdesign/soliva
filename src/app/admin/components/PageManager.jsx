"use client";
import { useState, useEffect } from 'react';

const PageManager = ({ content, onSave }) => {
  const [pages, setPages] = useState([
    {
      id: 'home',
      title: 'Accueil',
      slug: '/',
      content: content?.home?.hero?.title || 'Bienvenue sur notre site',
      status: 'published'
    },
    {
      id: 'studio',
      title: 'Studio',
      slug: '/studio',
      content: content?.studio?.hero?.title || 'Notre studio',
      status: 'published'
    },
    {
      id: 'contact',
      title: 'Contact',
      slug: '/contact',
      content: content?.contact?.hero?.title || 'Contactez-nous',
      status: 'published'
    }
  ]);

  const [editingPage, setEditingPage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Exposer les données actuelles via une fonction globale
  useEffect(() => {
    window.getCurrentPagesData = () => pages;
    return () => {
      delete window.getCurrentPagesData;
    };
  }, [pages]);

  // Mettre à jour les données quand le contenu change
  useEffect(() => {
    setPages([
      {
        id: 'home',
        title: 'Accueil',
        slug: '/',
        content: content?.home?.hero?.title || 'Bienvenue sur notre site',
        status: 'published'
      },
      {
        id: 'studio',
        title: 'Studio',
        slug: '/studio',
        content: content?.studio?.hero?.title || 'Notre studio',
        status: 'published'
      },
      {
        id: 'contact',
        title: 'Contact',
        slug: '/contact',
        content: content?.contact?.hero?.title || 'Contactez-nous',
        status: 'published'
      }
    ]);
  }, [content]);

  const updatePage = (pageId, field, value) => {
    setPages(prev => prev.map(page => 
      page.id === pageId ? { ...page, [field]: value } : page
    ));
    window.dispatchEvent(new CustomEvent('pages-changed'));
  };

  const savePage = (pageId) => {
    setEditingPage(null);
    // Ici on pourrait sauvegarder les modifications
    window.dispatchEvent(new CustomEvent('pages-changed'));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Gestion des Pages
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
          >
            {isEditing ? 'Fermer' : 'Modifier'}
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-6">
          {/* Liste des pages */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
              📄 Pages disponibles
            </h3>
            
            <div className="space-y-4">
              {pages.map((page) => (
                <div key={page.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">{page.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        page.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {page.status === 'published' ? 'Publié' : 'Brouillon'}
                      </span>
                      <span className="text-xs text-gray-500">{page.slug}</span>
                    </div>
                  </div>
                  
                  {editingPage === page.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Titre
                        </label>
                        <input
                          type="text"
                          value={page.title}
                          onChange={(e) => updatePage(page.id, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Contenu principal
                        </label>
                        <textarea
                          value={page.content}
                          onChange={(e) => updatePage(page.id, 'content', e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => savePage(page.id)}
                          className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={() => setEditingPage(null)}
                          className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-gray-600 mb-3">{page.content}</p>
                      <button
                        onClick={() => setEditingPage(page.id)}
                        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Modifier
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Aperçu */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Pages disponibles :</h4>
            <div className="space-y-2">
              {pages.map((page) => (
                <div key={page.id} className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{page.title}</span>
                    <span className="text-sm text-gray-500 ml-2">{page.slug}</span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    page.status === 'published' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {page.status === 'published' ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Informations */}
          <div className="text-sm text-gray-600">
            <p><strong>Pages système :</strong> {pages.length} page(s)</p>
            <p><strong>Pages publiées :</strong> {pages.filter(p => p.status === 'published').length} page(s)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageManager; 