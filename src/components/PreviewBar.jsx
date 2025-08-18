"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PreviewBar() {
  const router = useRouter();
  const [previewId, setPreviewId] = useState(null);
  const [originalPage, setOriginalPage] = useState(null);
  const [pageStatus, setPageStatus] = useState('published'); // 'draft' ou 'published'

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const previewParam = urlParams.get('preview');
    setPreviewId(previewParam);
    setOriginalPage(window.location.pathname);
    
    // Récupérer le statut de la page depuis la révision temporaire
    if (previewParam) {
      fetch(`/api/admin/preview/${previewParam}`)
        .then(response => response.json())
        .then(data => {
          // Détecter le statut basé sur les métadonnées de la révision
          const status = data._status || 'published';
          setPageStatus(status);
          console.log('📊 Statut de la page:', status);
        })
        .catch(error => {
          console.error('Erreur récupération statut:', error);
          setPageStatus('published'); // Par défaut
        });
    }
  }, []);

  const handlePublish = async () => {
    if (!previewId) return;
    
    try {
      // 1. Récupérer la révision temporaire
      const previewResponse = await fetch(`/api/admin/preview/${previewId}`);
      if (!previewResponse.ok) {
        throw new Error('Révision non trouvée');
      }
      
      const previewContent = await previewResponse.json();
      
      // 2. Publier le contenu
      const publishResponse = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: previewContent })
      });
      
      if (!publishResponse.ok) {
        throw new Error('Erreur lors de la publication');
      }
      
      // 3. Supprimer la révision temporaire
      await fetch(`/api/admin/preview/${previewId}`, { method: 'DELETE' });
      
      // 4. Notifier l'admin que le contenu a été publié
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage({
          type: 'PREVIEW_PUBLISHED',
          message: 'Contenu publié depuis l\'aperçu'
        }, window.location.origin);
      }
      
      // 5. Notifier et rediriger
      alert('✅ Contenu publié avec succès !');
      window.location.href = window.location.pathname; // Sans paramètre preview
      
    } catch (error) {
      console.error('Erreur lors de la publication:', error);
      alert('Erreur lors de la publication');
    }
  };

  const handleExitPreview = async () => {
    if (!previewId) return;
    
    try {
      // Supprimer la révision temporaire
      await fetch(`/api/admin/preview/${previewId}`, { method: 'DELETE' });
      
      // Rediriger vers la version publique
      window.location.href = window.location.pathname; // Sans paramètre preview
      
    } catch (error) {
      console.error('Erreur lors de la sortie d\'aperçu:', error);
      // Rediriger quand même
      window.location.href = window.location.pathname;
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-orange-500 text-white text-center py-3 z-50">
      <div className="flex items-center justify-center space-x-4">
        <span className="font-medium">👁️ MODE APERÇU</span>
        <span className="text-sm opacity-90">- Modifications non sauvegardées</span>
        
        <div className="flex space-x-2 ml-6">
          <button
            onClick={handlePublish}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
          >
            {pageStatus === 'draft' ? '📤 Publier' : '🔄 Mettre à jour'}
          </button>
          
          <button
            onClick={handleExitPreview}
            className="px-3 py-1 bg-white text-orange-600 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            ❌ Quitter l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
} 