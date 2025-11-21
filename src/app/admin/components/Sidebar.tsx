"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
  Sparkles,
  Type,
  // Icônes populaires pour le sélecteur
  Book,
  Calendar,
  Camera,
  Code,
  Coffee,
  Compass,
  Database,
  Edit,
  Folder,
  Image,
  Link,
  List,
  MapPin,
  Music,
  Package,
  Phone,
  Search,
  ShoppingBag,
  Star,
  Tag,
  User,
  Users,
  Video,
  Zap,
  X
} from 'lucide-react';
import { Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Page {
  id: string;
  label: string;
  path: string | null;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  currentPage: string;
  onPageChange?: (newPage: string) => void;
}

// Liste d'icônes Lucide populaires pour le sélecteur
const POPULAR_ICONS = [
  { name: 'FileText', component: FileText },
  { name: 'Home', component: Home },
  { name: 'Briefcase', component: Briefcase },
  { name: 'Book', component: Book },
  { name: 'Calendar', component: Calendar },
  { name: 'Camera', component: Camera },
  { name: 'Code', component: Code },
  { name: 'Coffee', component: Coffee },
  { name: 'Compass', component: Compass },
  { name: 'Database', component: Database },
  { name: 'Edit', component: Edit },
  { name: 'Folder', component: Folder },
  { name: 'Image', component: Image },
  { name: 'Link', component: Link },
  { name: 'List', component: List },
  { name: 'Mail', component: Mail },
  { name: 'MapPin', component: MapPin },
  { name: 'Music', component: Music },
  { name: 'Package', component: Package },
  { name: 'Phone', component: Phone },
  { name: 'Search', component: Search },
  { name: 'ShoppingBag', component: ShoppingBag },
  { name: 'Star', component: Star },
  { name: 'Tag', component: Tag },
  { name: 'User', component: User },
  { name: 'Users', component: Users },
  { name: 'Video', component: Video },
  { name: 'Zap', component: Zap },
  { name: 'Palette', component: Palette },
  { name: 'Settings', component: Settings },
  { name: 'Layout', component: Layout },
  { name: 'Brain', component: Brain },
  { name: 'Sparkles', component: Sparkles },
  { name: 'Type', component: Type },
];

export default function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const [pinnedPages, setPinnedPages] = useState<Array<{ id: string; label: string; type: 'system' | 'custom'; iconName?: string }>>([]);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);

  // Nettoyer automatiquement les classes dragging qui peuvent interférer
  useEffect(() => {
    const cleanupDragging = () => {
      if (document.body.classList.contains('dragging')) {
        document.body.classList.remove('dragging');
      }
    };

    // Nettoyer au montage du composant
    cleanupDragging();

    // Nettoyer périodiquement (au cas où un drag se serait mal terminé)
    const interval = setInterval(cleanupDragging, 1000);

    return () => clearInterval(interval);
  }, []);

  // Supprime la liste fixe; on affiche uniquement les pages épinglées

  const SETTINGS = [
    { id: 'nav', label: 'Navigation', path: null, icon: Navigation },
    { id: 'metadata', label: 'Métadonnées', path: null, icon: Settings },
    { id: 'typography', label: 'Typographie', path: null, icon: Type },
    { id: 'spacing', label: 'Espacement', path: null, icon: Layout },
    { id: 'colors', label: 'Palette de Couleurs', path: null, icon: Palette },
    { id: 'scroll-animations', label: 'Animations Scroll', path: null, icon: Sparkles },
    { id: 'reveal', label: 'Preloader / Reveal', path: null, icon: Sparkles },
    { id: 'templates', label: 'Templates', path: null, icon: Layout },
    { id: 'template-manager', label: 'Template Manager', path: '/admin/template-manager', icon: Palette },
    { id: 'footer', label: 'Footer', path: null, icon: Footprints },
    { id: 'backup', label: 'Sauvegarde', path: null, icon: Save },
    { id: 'preview-live', label: 'Preview live', path: '/admin/preview?page=studio&template=pearl', icon: Eye },
    { id: 'ai', label: 'IA', path: '/admin/ai', icon: Brain },
  ];

  const handlePageChange = (pageId: string, event?: React.MouseEvent) => {
    // Empêcher les conflits d'événements
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Nettoyer les classes dragging avant la navigation
    if (document.body.classList.contains('dragging')) {
      document.body.classList.remove('dragging');
    }

    // Vérifier si la page a un path défini dans SETTINGS
    const setting = SETTINGS.find(s => s.id === pageId);
    if (setting && setting.path) {
      router.push(setting.path);
      return;
    }
    
    if (onPageChange) {
      // Ajouter un petit délai pour éviter les problèmes de synchronisation
      setTimeout(() => {
        onPageChange(pageId);
      }, 10);
    } else {
      // Fallback si onPageChange n'est pas fourni
      if (pageId === 'pages') {
        router.push('/admin/pages');
      } else if (pageId === 'ai') {
        router.push('/admin/ai');
      } else if (pageId === 'template-manager') {
        router.push('/admin/template-manager');
      } else {
        router.push(`/admin?page=${pageId}`);
      }
    }
  };

  // Fonction pour recharger les pages épinglées
  const reloadPinnedPages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/content', { cache: 'no-store' });
      if (!res.ok) return;
      const data = await res.json();
      const pageIcons = data.metadata?.pageIcons || {};
      console.log('🔄 [Sidebar] Rechargement pages, pageIcons:', pageIcons);
      
      const customs = data?.pages?.pages || [];
      const pinnedCustom = customs
        .filter((p: any) => p && p.pinned)
        .map((p: any) => ({ 
          id: p.id, 
          label: p.title || p.id, 
          type: 'custom' as const,
          iconName: p.iconName
        }));
      
      const systemMap: Record<string,string> = {
        home: 'Accueil',
        studio: 'Studio',
        contact: 'Contact',
        work: 'Portfolio',
        blog: 'Blog',
      };
      const pinnedSystem: string[] = data?.pages?.pinnedSystem || [];
      const hiddenSystem: string[] = data?.pages?.hiddenSystem || [];
      const systemItems = pinnedSystem
        .filter((id) => systemMap[id] && !hiddenSystem.includes(id))
        .map((id) => ({ 
          id, 
          label: systemMap[id], 
          type: 'system' as const,
          iconName: pageIcons[id]
        }));
      const allPages = [...systemItems, ...pinnedCustom];
      console.log('🔄 [Sidebar] Pages chargées:', allPages.map(p => ({ id: p.id, iconName: p.iconName })));
      setPinnedPages(allPages);
    } catch (error) {
      console.error('Erreur rechargement pages:', error);
    }
  }, []);

  // Fonction pour sauvegarder l'icône choisie
  const saveIcon = useCallback(async (pageId: string, iconName: string) => {
    console.log('💾 [Sidebar] Sauvegarde icône:', pageId, iconName);
    try {
      // Récupérer le contenu actuel
      const res = await fetch('/api/admin/content', { cache: 'no-store' });
      if (!res.ok) {
        console.error('❌ [Sidebar] Erreur récupération contenu');
        reloadPinnedPages();
        return;
      }
      const data = await res.json();
      
      // Déterminer si c'est une page système ou personnalisée
      const isSystemPage = ['home', 'studio', 'contact', 'work', 'blog'].includes(pageId);
      
      if (isSystemPage) {
        // Pour les pages système, sauvegarder dans metadata.pageIcons
        const pageIcons = data.metadata?.pageIcons || {};
        pageIcons[pageId] = iconName;
        console.log('💾 [Sidebar] Sauvegarde page système, pageIcons:', pageIcons);
        
        const updateRes = await fetch('/api/admin/content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: {
              ...data,
              metadata: {
                ...data.metadata,
                pageIcons
              }
            }
          })
        });
        
        if (!updateRes.ok) {
          console.error('❌ [Sidebar] Erreur sauvegarde');
          toast.error('Erreur lors de la sauvegarde de l\'icône');
          reloadPinnedPages();
        } else {
          console.log('✅ [Sidebar] Sauvegarde réussie, rechargement...');
          toast.success('Icône mise à jour avec succès !');
          // Mettre à jour l'état local immédiatement
          setPinnedPages(prev => prev.map(p => 
            p.id === pageId ? { ...p, iconName } : p
          ));
          // Recharger après un court délai pour être sûr
          setTimeout(() => {
            reloadPinnedPages();
          }, 100);
        }
      } else {
        // Pour les pages personnalisées, sauvegarder dans la page elle-même
        const pages = data.pages?.pages || [];
        const pageIndex = pages.findIndex((p: any) => p.id === pageId);
        if (pageIndex !== -1) {
          pages[pageIndex].iconName = iconName;
          console.log('💾 [Sidebar] Sauvegarde page personnalisée, iconName:', iconName);
          
          const updateRes = await fetch('/api/admin/content', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: {
                ...data,
                pages: {
                  ...data.pages,
                  pages
                }
              }
            })
          });
          
          if (!updateRes.ok) {
            console.error('❌ [Sidebar] Erreur sauvegarde');
            toast.error('Erreur lors de la sauvegarde de l\'icône');
            reloadPinnedPages();
          } else {
            console.log('✅ [Sidebar] Sauvegarde réussie, rechargement...');
            toast.success('Icône mise à jour avec succès !');
            // Mettre à jour l'état local immédiatement
            setPinnedPages(prev => prev.map(p => 
              p.id === pageId ? { ...p, iconName } : p
            ));
            // Recharger après un court délai pour être sûr
            setTimeout(() => {
              reloadPinnedPages();
            }, 100);
          }
        }
      }
    } catch (error) {
      console.error('❌ [Sidebar] Erreur sauvegarde icône:', error);
      toast.error('Erreur lors de la sauvegarde de l\'icône');
      reloadPinnedPages();
    }
  }, [reloadPinnedPages]);

  // Charger les pages épinglées depuis le contenu admin
  useEffect(() => {
    reloadPinnedPages();
  }, [reloadPinnedPages]);

  // Live update when pages are pinned/unpinned elsewhere in the admin
  // On recharge depuis le serveur pour récupérer les icônes sauvegardées
  useEffect(() => {
    const handler = (e: any) => {
      // Recharger depuis le serveur pour avoir les icônes à jour
      // Cela garantit que même si une page est décochée puis ré-épinglée, l'icône est conservée
      reloadPinnedPages();
    };
    window.addEventListener('admin:pinned-updated', handler as EventListener);
    return () => window.removeEventListener('admin:pinned-updated', handler as EventListener);
  }, [reloadPinnedPages]);

  // Fonction pour obtenir le composant d'icône à partir du nom
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return FileText;
    const iconData = POPULAR_ICONS.find(i => i.name === iconName);
    return iconData?.component || FileText;
  };

  const handlePagesClick = (isMobile = false, event?: React.MouseEvent) => {
    // Empêcher les conflits d'événements
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Nettoyer les classes dragging avant la navigation
    if (document.body.classList.contains('dragging')) {
      document.body.classList.remove('dragging');
    }

    router.push('/admin/pages');
    if (isMobile) setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-[100] lg:bg-white lg:border-r lg:border-gray-200 admin-sidebar">
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
              onClick={(e) => handlePagesClick(false, e)}
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
          
          {pinnedPages.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Pages épinglées
              </h3>
              <ul className="space-y-1">
                {pinnedPages.map((p) => (
                  <li key={p.id}>
                    <div className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      currentPage === p.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedPageId(p.id);
                          setIconPickerOpen(true);
                        }}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Changer l'icône"
                      >
                        {(() => {
                          const IconComponent = getIconComponent(p.iconName);
                          return <IconComponent className="w-5 h-5" />;
                        })()}
                      </button>
                      <span 
                        className="truncate flex-1 cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          if (document.body.classList.contains('dragging')) {
                            document.body.classList.remove('dragging');
                          }
                          
                          if (['home','studio','contact','work','blog'].includes(p.id)) {
                            router.push(`/admin?page=${p.id}`);
                          } else {
                            router.push(`/admin/pages/${p.id}`);
                          }
                        }}
                      >
                        {p.label}
                      </span>
                    </div>
                  </li>
                ))}
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
                    onClick={(e) => handlePageChange(setting.id, e)}
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Nettoyer les classes dragging avant l'action
                  if (document.body.classList.contains('dragging')) {
                    document.body.classList.remove('dragging');
                  }
                  
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
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  
                  // Nettoyer les classes dragging avant l'action
                  if (document.body.classList.contains('dragging')) {
                    document.body.classList.remove('dragging');
                  }
                  
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
                  onClick={(e) => handlePagesClick(true, e)}
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
              
              {pinnedPages.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Pages épinglées
                  </h3>
                  <ul className="space-y-1">
                    {pinnedPages.map((p) => (
                      <li key={p.id}>
                        <div className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === p.id
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700'
                        }`}>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setSelectedPageId(p.id);
                              setIconPickerOpen(true);
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Changer l'icône"
                          >
                            {(() => {
                              const IconComponent = getIconComponent(p.iconName);
                              return <IconComponent className="w-5 h-5" />;
                            })()}
                          </button>
                          <span 
                            className="truncate flex-1 cursor-pointer hover:text-gray-900"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              
                              if (document.body.classList.contains('dragging')) {
                                document.body.classList.remove('dragging');
                              }
                              
                              if (['home','studio','contact','work','blog'].includes(p.id)) {
                                router.push(`/admin?page=${p.id}`);
                              } else {
                                router.push(`/admin/pages/${p.id}`);
                              }
                              setIsMobileMenuOpen(false);
                            }}
                          >
                            {p.label}
                          </span>
                        </div>
                      </li>
                    ))}
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
                        onClick={(e) => {
                          handlePageChange(setting.id, e);
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Nettoyer les classes dragging avant l'action
                      if (document.body.classList.contains('dragging')) {
                        document.body.classList.remove('dragging');
                      }
                      
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
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Nettoyer les classes dragging avant l'action
                      if (document.body.classList.contains('dragging')) {
                        document.body.classList.remove('dragging');
                      }
                      
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

      {/* Dialog de sélection d'icône */}
      <Dialog open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choisir une icône pour "{pinnedPages.find(p => p.id === selectedPageId)?.label || 'cette page'}"</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-3 mt-4">
            {POPULAR_ICONS.map((iconData) => {
              const IconComponent = iconData.component;
              const isSelected = pinnedPages.find(p => p.id === selectedPageId)?.iconName === iconData.name;
              return (
                <button
                  key={iconData.name}
                  onClick={() => {
                    if (selectedPageId) {
                      saveIcon(selectedPageId, iconData.name);
                      setIconPickerOpen(false);
                    }
                  }}
                  className={`p-3 rounded-lg border-2 transition-all hover:bg-gray-50 ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  title={iconData.name}
                >
                  <IconComponent className="w-6 h-6 mx-auto text-gray-700" />
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 
