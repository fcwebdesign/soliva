"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const PreviewBar: React.FC = () => {
  const router = useRouter();
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [originalPage, setOriginalPage] = useState<string | null>(null);
  const [pageStatus, setPageStatus] = useState<'draft' | 'published'>('published'); // 'draft' ou 'published'
  const [template, setTemplate] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const previewParam = urlParams.get('preview');
    const templateParam = urlParams.get('template');
    setPreviewId(previewParam);
    setOriginalPage(window.location.pathname);
    setTemplate(templateParam);
    
    // Récupérer le statut de la page depuis la révision temporaire
    if (previewParam) {
      fetch(`/api/admin/preview/${previewParam}`)
        .then((response: Response) => response.json())
        .then((data: any) => {
          // Détecter le statut basé sur les métadonnées de la révision
          const status = data._status || 'published';
          setPageStatus(status as 'draft' | 'published');
          console.log('📊 Statut de la page:', status);
        })
        .catch((error: Error) => {
          console.error('Erreur récupération statut:', error);
          setPageStatus('published'); // Par défaut
        });
    }
  }, []);

  const getRedirectUrl = (): string => {
    // Si on a un template, rediriger vers le template
    if (template) {
      return `/?template=${template}`;
    }
    // Sinon, rediriger vers la page normale
    return window.location.pathname;
  };

  const handlePublish = async (): Promise<void> => {
    if (!previewId) return;
    
    try {
      // Envoyer un message à l'admin pour qu'il sauvegarde
      if (window.opener && !window.opener.closed) {
        console.log('📤 Envoi du message SAVE_FROM_PREVIEW à l\'admin');
        window.opener.postMessage({
          type: 'SAVE_FROM_PREVIEW',
          previewId: previewId,
          message: 'Demande de sauvegarde depuis l\'aperçu'
        }, window.location.origin);
        
        // Attendre un peu pour laisser l'admin traiter
        await new Promise<void>(resolve => setTimeout(resolve, 1000));
        
        // Notifier et rediriger
        alert('✅ Contenu sauvegardé avec succès !');
        window.location.href = getRedirectUrl(); // Utiliser la fonction pour l'URL
      } else {
        alert('❌ Impossible de communiquer avec l\'admin. Veuillez sauvegarder depuis l\'admin.');
      }
      
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleExitPreview = async (): Promise<void> => {
    if (!previewId) return;
    
    try {
      // Supprimer la révision temporaire
      await fetch(`/api/admin/preview/${previewId}`, { method: 'DELETE' });
      
      // Rediriger vers la version publique
      window.location.href = getRedirectUrl(); // Utiliser la fonction pour l'URL
      
    } catch (error) {
      console.error('Erreur lors de la sortie d\'aperçu:', error);
      // Rediriger quand même
      window.location.href = getRedirectUrl();
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
};

export default PreviewBar; 