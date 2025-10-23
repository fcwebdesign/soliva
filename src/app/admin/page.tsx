"use client";
import { Suspense } from 'react';
import { useAdminPage } from './hooks/useAdminPage';
import Sidebar from './components/Sidebar';
import AdminHeader from './components/AdminHeader';
import AdminStatusBar from './components/AdminStatusBar';
import AdminContent from './components/AdminContent';
import ArticleGeneratorModal from './components/ArticleGeneratorModal';
import { createPortal } from 'react-dom';

function AdminPageContent() {
  const {
    // State
    content,
    setContent,
    originalContent,
    setOriginalContent,
          currentPage,
    setCurrentPage,
    isPreviewMode,
    setIsPreviewMode,
    loading,
    setLoading,
    error,
    setError,
    saveStatus,
    setSaveStatus,
        hasUnsavedChanges,
    setHasUnsavedChanges,
    pageStatus,
    setPageStatus,
      isJustSaved,
    setIsJustSaved,
      isPageLoading,
    setIsPageLoading,
    headerManagerRef,
    setHeaderManagerRef,
    showArticleGenerator,
    setShowArticleGenerator,
    
    // Data
    currentPageConfig,
    currentPageData,
    
    // Functions
    getPagePath,
    getPageConfig,
    handlePageChange,
    fetchContent,
    handleSaveWithStatus,
    handlePreview,
    updateContent,
    cleanContent,
    onArticleGenerated,
  } = useAdminPage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Recharger
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />

      {/* Zone principale */}
      <div className="lg:ml-64 flex flex-col">
        {/* Header avec SaveBar sticky */}
        <AdminHeader
          currentPageConfig={currentPageConfig}
          currentPage={currentPage}
          hasUnsavedChanges={hasUnsavedChanges}
          isPreviewMode={isPreviewMode}
          saveStatus={saveStatus}
          pageStatus={pageStatus}
          onPreview={handlePreview}
          onSaveDraft={() => handleSaveWithStatus('draft')}
          onSavePublished={() => handleSaveWithStatus('published')}
        />

        {/* Contenu principal */}
        <AdminContent
          currentPage={currentPage}
          currentPageConfig={currentPageConfig}
          content={content}
          currentPageData={currentPageData}
          onUpdate={(updates) => updateContent(currentPage, updates)}
          onShowArticleGenerator={() => setShowArticleGenerator(true)}
                    onTemplateChange={(newContent) => {
                      setContent(newContent);
                      setOriginalContent(newContent);
                      setHasUnsavedChanges(false);
                    }}
                    onSave={(newContent) => {
                      setContent(newContent);
                      setOriginalContent(newContent);
                      setHasUnsavedChanges(false);
                    }}
          onUpdateContent={(newContent) => {
                      setContent(newContent);
                      setHasUnsavedChanges(true);
                    }}
                  />
      </div>
      
      {/* Modal de génération d'articles */}
      {showArticleGenerator && (
        <ArticleGeneratorModal
          isOpen={showArticleGenerator}
          onClose={() => setShowArticleGenerator(false)}
          onArticleGenerated={onArticleGenerated}
        />
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
} 
