"use client";
import React, { useEffect } from 'react';
import Sidebar from './Sidebar';

interface AdminPageLayoutProps {
  /**
   * Titre principal de la page
   */
  title: string;
  
  /**
   * Description ou chemin de la page (optionnel)
   */
  description?: string;
  
  /**
   * ID de la page courante pour la sidebar
   */
  currentPage: string;
  
  /**
   * Actions/boutons à afficher dans le header (optionnel)
   * Ex: boutons Sauvegarder, Aperçu, etc.
   */
  actions?: React.ReactNode;
  
  /**
   * Contenu principal de la page
   */
  children: React.ReactNode;
  
  /**
   * Désactiver le container avec max-width (pour pages pleine largeur)
   * @default false
   */
  fullWidth?: boolean;
  
  /**
   * Loading state - affiche un skeleton
   * @default false
   */
  loading?: boolean;
}

/**
 * Layout standardisé pour toutes les pages admin
 * 
 * Fournit :
 * - Sidebar automatique
 * - Header sticky avec titre et actions
 * - Container responsive avec padding uniforme
 * - Styles admin appliqués au body
 * 
 * @example
 * ```tsx
 * <AdminPageLayout
 *   title="Pages"
 *   description="Gestion des pages"
 *   currentPage="pages"
 *   actions={<Button>Nouvelle page</Button>}
 * >
 *   <div className="space-y-6">
 *     // Contenu
 *   </div>
 * </AdminPageLayout>
 * ```
 */
export default function AdminPageLayout({
  title,
  description,
  currentPage,
  actions,
  children,
  fullWidth = false,
  loading = false,
}: AdminPageLayoutProps) {
  
  // Appliquer les styles admin au body
  useEffect(() => {
    document.body.classList.add('admin-page');
    
    return () => {
      document.body.classList.remove('admin-page');
    };
  }, []);

  // État de chargement
  if (loading) {
    return (
      <div className="admin-page min-h-screen bg-gray-50">
        {/* Styles admin pour s'assurer du fullscreen */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .nav {
              display: none !important;
            }
            body.admin-page {
              background-color: #f9fafb;
              margin: 0;
              padding: 0;
            }
          `
        }} />
        
        <Sidebar currentPage={currentPage} />
        
        <div className="lg:ml-64 flex flex-col min-h-screen">
          <header className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </header>
          
          <main className="flex-1 p-6">
            <div className={fullWidth ? "w-full" : "w-full max-w-7xl mx-auto"}>
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page min-h-screen bg-gray-50">
      {/* Styles admin pour s'assurer du fullscreen */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .nav {
            display: none !important;
          }
          body.admin-page {
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
          }
        `
      }} />
      
      {/* Sidebar */}
      <Sidebar currentPage={currentPage} />
      
      {/* Zone principale */}
      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Header sticky avec titre et actions */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className={fullWidth ? "px-4 lg:px-6 py-4" : "max-w-7xl mx-auto px-4 lg:px-6 py-4"}>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              {/* Titre et description */}
              <div className="min-w-0 flex-1">
                <h1 
                  className="text-2xl lg:text-4xl font-semibold text-gray-900 mb-2 truncate" 
                  style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)' }}
                >
                  {title}
                </h1>
                {description && (
                  <p className="text-sm text-gray-500 truncate">
                    {description}
                  </p>
                )}
              </div>
              
              {/* Actions (boutons, status, etc.) */}
              {actions && (
                <div className="flex flex-wrap items-center gap-2 lg:gap-4">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Contenu principal */}
        <main className="flex-1 p-6">
          <div className={fullWidth ? "w-full" : "w-full max-w-7xl mx-auto"}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

