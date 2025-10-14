"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Home, 
  Palette, 
  Mail, 
  Briefcase, 
  FileText, 
  Navigation, 
  Settings, 
  Layout, 
  Footprints, 
  Save,
  Globe,
  LogOut,
  Brain,
  Download
} from 'lucide-react';

interface Page {
  id: string;
  label: string;
  path: string | null;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  currentPage: string;
}

export default function Sidebar({ currentPage }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  // Pages unifiées pour tout l'admin
  const PAGES = [
    { id: 'home', label: 'Accueil', path: '/', icon: Home },
    { id: 'studio', label: 'Studio', path: '/studio', icon: Palette },
    { id: 'contact', label: 'Contact', path: '/contact', icon: Mail },
    { id: 'work', label: 'Portfolio', path: '/work', icon: Briefcase },
    { id: 'blog', label: 'Blog', path: '/blog', icon: FileText },
  ];

  const SETTINGS = [
    { id: 'nav', label: 'Navigation', path: null, icon: Navigation },
    { id: 'metadata', label: 'Métadonnées', path: null, icon: Settings },
    { id: 'templates', label: 'Templates', path: null, icon: Layout },
    { id: 'footer', label: 'Footer', path: null, icon: Footprints },
    { id: 'backup', label: 'Sauvegarde', path: null, icon: Save },
    { id: 'export', label: 'Export Statique', path: null, icon: Download },
    { id: 'ai', label: 'IA', path: '/admin/ai', icon: Brain },
  ];

  const handlePageChange = (pageId: string) => {
    if (pageId === 'pages') {
      router.push('/admin/pages');
    } else if (pageId === 'ai') {
      router.push('/admin/ai');
    } else {
      router.push(`/admin?page=${pageId}`);
    }
  };

  const renderPageItem = (page: Page, isMobile = false) => (
    <li key={page.id}> 
      <button
        onClick={() => {
          handlePageChange(page.id);
          if (isMobile) setIsMobileMenuOpen(false);
        }}
        className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
          currentPage === page.id
            ? 'bg-blue-50 text-blue-700'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <page.icon className="w-5 h-5" />
        <span>{page.label}</span>
      </button>
    </li>
  );

  const handlePagesClick = (isMobile = false) => {
    router.push('/admin/pages');
    if (isMobile) setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:bg-white lg:border-r lg:border-gray-200">
        {/* Logo */}
        <div className="flex items-center px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {/* Bouton Pages */}
          <div className="mb-4">
            <button
              onClick={() => handlePagesClick()}
              className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                currentPage === 'pages'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Pages</span>
            </button>
          </div>
          
          {/* Pages */}
          {PAGES.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Pages
              </h3>
              <ul className="space-y-1">
                {PAGES.map((page) => renderPageItem(page))}
              </ul>
            </div>
          )}
          
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              Paramètres
            </h3>
            <ul className="space-y-1">
              {SETTINGS.map((setting) => (
                <li key={setting.id}> 
                  <button
                    onClick={() => handlePageChange(setting.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                      currentPage === setting.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <setting.icon className="w-5 h-5" />
                    <span>{setting.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Actions */}
        <div className="px-4 py-4 border-t border-gray-200">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Actions
          </h3>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => {
                  window.open('/', '_blank');
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors focus:outline-none"
              >
                <Globe className="w-5 h-5" />
                <span>Voir le site</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => {
                  // Logout - rediriger vers la page d'accueil
                  window.location.href = '/';
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors focus:outline-none"
              >
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Soliva CMS v2.0
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-[9999]">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white p-3 rounded-lg shadow-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setIsMobileMenuOpen(false)} />
          
          <div className="fixed inset-y-0 left-0 flex flex-col w-64 bg-white shadow-xl">
            {/* Logo mobile */}
            <div className="flex items-center px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">S</span>
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Soliva</h1>
                  <p className="text-xs text-gray-500">Admin Panel</p>
                </div>
              </div>
            </div>

            {/* Navigation mobile */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {/* Bouton Pages mobile */}
              <div className="mb-4">
                <button
                  onClick={() => handlePagesClick(true)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                    currentPage === 'pages'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                  <span>Pages</span>
                </button>
              </div>
              
              {/* Pages mobile */}
              {PAGES.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Pages
                  </h3>
                  <ul className="space-y-1">
                    {PAGES.map((page) => renderPageItem(page, true))}
                  </ul>
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Paramètres
                </h3>
                <ul className="space-y-1">
                  {SETTINGS.map((setting) => (
                    <li key={setting.id}>
                      <button
                        onClick={() => {
                          handlePageChange(setting.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none ${
                          currentPage === setting.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <setting.icon className="w-5 h-5" />
                        <span>{setting.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Actions mobile */}
            <div className="px-4 py-4 border-t border-gray-200">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Actions
              </h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => {
                      window.open('/', '_blank');
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors focus:outline-none"
                  >
                    <Globe className="w-5 h-5" />
                    <span>Voir le site</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      window.location.href = '/';
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors focus:outline-none"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Déconnexion</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Footer mobile */}
            <div className="px-4 py-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 text-center">
                Soliva CMS v2.0
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spacer pour le contenu principal */}
      <div className="hidden lg:block lg:w-64" />
    </>
  );
} 