"use client";
import React from 'react';

interface AdminStatusBarProps {
  currentPage: string;
  currentPageConfig: {
    label: string;
    path: string | null;
    icon: string;
  } | null;
  pageStatus: 'draft' | 'published';
}

const AdminStatusBar: React.FC<AdminStatusBarProps> = ({
  currentPage,
  currentPageConfig,
  pageStatus
}) => {
  // Masquer pour la navigation, footer et pages
  if (currentPage === 'nav' || currentPage === 'footer' || currentPage === 'pages') {
    return null;
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium text-gray-700">Statut :</span>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
            pageStatus === 'published' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {pageStatus === 'published' ? 'Publié' : 'Brouillon'}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Page: {currentPageConfig?.label}
        </div>
      </div>
    </div>
  );
};

export default AdminStatusBar;
