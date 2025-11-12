'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'next-view-transitions';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';

interface ProjectsData {
  id?: string;
  title?: string;
  maxProjects?: number;
  selectedProjects?: string[];
  theme?: 'light' | 'dark' | 'auto';
  columns?: number;
}

interface Project {
  id: string;
  title: string;
  description?: string;
  excerpt?: string;
  category?: string;
  image?: string;
  alt?: string;
  slug?: string;
  status?: string;
  featured?: boolean;
}

export default function ProjectsBlock({ data }: { data: ProjectsData | any }) {
  // Extraire les données (peut être dans data directement ou dans data.data)
  const blockData = (data as any).data || data;
  const { title = "NOS RÉALISATIONS", maxProjects = 6, selectedProjects = [], columns = 3 } = blockData;
  
  // Générer un ID unique pour le carousel
  const carouselId = blockData.id || `projects-${Math.random().toString(36).substr(2, 9)}`;
  
  // État pour les projets récupérés depuis l'API
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullContent, setFullContent] = useState<any>(null);
  
  // États pour la navigation du carousel
  const [currentPage, setCurrentPage] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  
  // Récupérer les projets et le contenu complet depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/content?t=' + Date.now(), {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const content = await response.json();
        setFullContent(content);
        
        // Récupérer les projets publiés depuis adminProjects ou projects
        let projects: Project[] = [];
        
        if (content.work?.adminProjects) {
          // Priorité aux projets de l'admin (avec blocs)
          projects = content.work.adminProjects
            .filter((p: any) => p.status === 'published' || !p.status)
            .map((p: any, index: number) => ({
              id: p.id || p.slug || `project-${index}`,
              title: p.title,
              description: p.description,
              excerpt: p.excerpt,
              category: p.category,
              image: p.image,
              alt: p.alt,
              slug: p.slug,
              status: p.status,
              featured: p.featured
            }));
        } else if (content.work?.projects) {
          // Fallback vers les projets publics
          projects = content.work.projects.map((p: any, index: number) => ({
            id: p.id || p.slug || `project-${index}`,
            title: p.title,
            description: p.description,
            excerpt: p.excerpt,
            category: p.category,
            image: p.image,
            alt: p.alt,
            slug: p.slug,
            status: p.status,
            featured: p.featured
          }));
        }
        
        // Supprimer les doublons basés sur l'ID
        const uniqueProjects = projects.filter((project, index, self) => 
          index === self.findIndex(p => p.id === project.id)
        );
        
        // Trier par featured puis par date de publication
        uniqueProjects.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        
        setAllProjects(uniqueProjects);
      } catch (error) {
        console.error('Erreur lors du chargement des projets:', error);
        setAllProjects([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Écouter les mises à jour de contenu
    const handleContentUpdate = () => {
      fetchData();
    };
    window.addEventListener('content-updated', handleContentUpdate);
    return () => window.removeEventListener('content-updated', handleContentUpdate);
  }, []);
  
  // Gérer la largeur de la fenêtre
  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  // Récupérer les styles typographiques
  const typoConfig = useMemo(() => {
    return fullContent ? getTypographyConfig(fullContent) : {};
  }, [fullContent]);
  
  const h3Classes = getTypographyClasses('h3', typoConfig, defaultTypography.h3);
  const h4Classes = getTypographyClasses('h4', typoConfig, defaultTypography.h4);
  const h3CustomColor = getCustomColor('h3', typoConfig);
  const h4CustomColor = getCustomColor('h4', typoConfig);
  
  // Récupérer la palette actuelle pour les animations de hover
  const currentPaletteId = fullContent?.metadata?.colorPalette || 'classic';
  
  // Fonction pour obtenir les classes d'animation selon la palette
  const getHoverAnimationClasses = (paletteId: string) => {
    // Animation zoom arrière + clip-path (style mammothmurals exact)
    return {
      wrapper: 'work-hover-wrapper overflow-hidden rounded-lg transition-all duration-500 ease-out border-0',
      image: 'work-hover-image w-full h-full object-cover transition-all duration-500 ease-out rounded-lg',
      useMammothStyle: true
    };
  };
  
  const hoverClasses = useMemo(() => getHoverAnimationClasses(currentPaletteId), [currentPaletteId]);
  
  // Filtrer les projets selon la sélection
  let displayedProjects: Project[];
  if (selectedProjects && selectedProjects.length > 0) {
    displayedProjects = allProjects.filter(project => selectedProjects.includes(project.id));
  } else {
    displayedProjects = allProjects.slice(0, maxProjects);
  }
  
  // État de chargement
  if (loading) {
    return (
      <section className="projects-section py-28" data-block-type="projects" data-block-theme={blockData.theme || (data as any).theme || 'auto'}>
        <div className="text-center py-16">
          <p style={{ color: 'var(--muted-foreground)' }}>Chargement des projets...</p>
        </div>
      </section>
    );
  }
  
  // Aucun projet trouvé
  if (displayedProjects.length === 0) {
    return (
      <section className="projects-section py-28" data-block-type="projects" data-block-theme={blockData.theme || (data as any).theme || 'auto'}>
        <div className="text-center py-16">
          <p style={{ color: 'var(--muted-foreground)' }}>Aucun projet pour l'instant.</p>
        </div>
      </section>
    );
  }
  
  const actualCount = displayedProjects.length;
  
  // Calculer le nombre de projets par page selon la largeur et le nombre de colonnes
  let projectsPerPage;
  if (actualCount === 1) {
    projectsPerPage = 1;
  } else if (actualCount === 2) {
    projectsPerPage = windowWidth < 768 ? 1 : 2;
  } else {
    // Utiliser le nombre de colonnes configuré
    if (columns === 2) {
      projectsPerPage = windowWidth < 768 ? 1 : 2;
    } else if (columns === 4) {
      projectsPerPage = windowWidth < 768 ? 1 : windowWidth < 1024 ? 2 : 4;
    } else {
      // 3 colonnes par défaut
      projectsPerPage = windowWidth < 768 ? 1 : windowWidth < 1024 ? 2 : 3;
    }
  }
  
  // Le carousel est nécessaire si on a plus de projets que ce qui peut être affiché sur une page
  const needsNavigation = actualCount > projectsPerPage;
  
  const maxPages = Math.ceil(displayedProjects.length / projectsPerPage);
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === maxPages - 1;
  
  // Fonction pour rendre un projet avec le style de survol
  const renderProject = (project: Project) => (
    <article key={project.slug || project.id} className="group">
      {project.image && (
        <Link href={`/work/${project.slug || project.id}`} className="block mb-4">
          <div 
            className={`${hoverClasses.wrapper} relative`}
            style={{ 
              aspectRatio: '2400 / 1800',
              ...(hoverClasses.useMammothStyle && {
                backgroundColor: 'var(--primary)'
              } as React.CSSProperties)
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={project.image} 
              alt={project.alt || project.title || 'Projet'} 
              className={hoverClasses.image}
              style={{ aspectRatio: '2400 / 1800', width: '100%', height: '100%' }}
            />
            {/* Icône flèche en haut à droite (apparaît au hover) */}
            {hoverClasses.useMammothStyle && (
              <div className="work-hover-arrow absolute top-4 right-4 w-8 h-8" style={{ color: 'var(--primary-foreground)' }}>
                <svg 
                  width="24" 
                  height="24" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full"
                >
                  <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M9 6.75C8.58579 6.75 8.25 6.41421 8.25 6C8.25 5.58579 8.58579 5.25 9 5.25H18C18.4142 5.25 18.75 5.58579 18.75 6V15C18.75 15.4142 18.4142 15.75 18 15.75C17.5858 15.75 17.25 15.4142 17.25 15V7.81066L6.53033 18.5303C6.23744 18.8232 5.76256 18.8232 5.46967 18.5303C5.17678 18.2374 5.17678 17.7626 5.46967 17.4697L16.1893 6.75H9Z" 
                    fill="currentColor"
                  />
                </svg>
              </div>
            )}
          </div>
        </Link>
      )}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 
            className={h3Classes}
            style={h3CustomColor ? { color: h3CustomColor } : { color: 'var(--foreground)' }}
          >
            <Link href={`/work/${project.slug || project.id}`} className="hover:text-accent transition-colors">
              {project.title || 'Projet'}
            </Link>
          </h3>
          {project.category && (
            <small className="inline-block px-4 py-1.5 text-sm font-medium text-primary-foreground bg-primary rounded-full ml-4 whitespace-nowrap">{project.category}</small>
          )}
        </div>
        {(project.excerpt || project.description) && (
          <h4 
            className={`${h4Classes} line-clamp-3`}
            style={h4CustomColor ? { color: h4CustomColor } : { color: 'var(--foreground)' }}
          >
            {project.excerpt || project.description}
          </h4>
        )}
      </div>
    </article>
  );
  
  return (
    <section className="projects-section py-28" data-block-type="projects" data-block-theme={blockData.theme || (data as any).theme || 'auto'}>
      <div>
        {/* Titre de la section et navigation du carousel */}
        <div className="mb-12 flex justify-between items-center">
          {title && (
            <h2 
              className={h3Classes}
              style={h3CustomColor ? { color: h3CustomColor } : { color: 'var(--foreground)' }}
            >
              {title}
            </h2>
          )}
          
          {/* Navigation - sur la même ligne que le titre */}
          {needsNavigation && (
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  if (!isFirstPage) {
                    const newPage = currentPage - 1;
                    setCurrentPage(newPage);
                    
                    const carousel = document.getElementById(`carousel-${carouselId}`);
                    if (carousel) {
                      // Calculer la translation en pixels pour plus de précision
                      const firstItem = carousel.querySelector('div');
                      if (firstItem) {
                        const itemWidth = firstItem.offsetWidth;
                        const gap = 32; // 2rem = 32px
                        const translateX = -(newPage * (itemWidth + gap));
                        carousel.style.transform = `translateX(${translateX}px)`;
                      }
                    }
                  }
                }}
                className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center font-semibold ${
                  isFirstPage ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{
                  backgroundColor: isFirstPage ? 'var(--muted)' : 'var(--primary)',
                  color: isFirstPage ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                  border: isFirstPage ? '1px solid var(--border)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isFirstPage) {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isFirstPage) {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                ←
              </button>
              <button
                onClick={() => {
                  if (!isLastPage) {
                    const newPage = currentPage + 1;
                    setCurrentPage(newPage);
                    
                    const carousel = document.getElementById(`carousel-${carouselId}`);
                    if (carousel) {
                      // Calculer la translation en pixels pour plus de précision
                      const firstItem = carousel.querySelector('div');
                      if (firstItem) {
                        const itemWidth = firstItem.offsetWidth;
                        const gap = 32; // 2rem = 32px
                        const translateX = -(newPage * (itemWidth + gap));
                        carousel.style.transform = `translateX(${translateX}px)`;
                      }
                    }
                  }
                }}
                className={`w-8 h-8 rounded-full transition-all duration-300 flex items-center justify-center font-semibold ${
                  isLastPage ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{
                  backgroundColor: isLastPage ? 'var(--muted)' : 'var(--primary)',
                  color: isLastPage ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                  border: isLastPage ? '1px solid var(--border)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isLastPage) {
                    e.currentTarget.style.opacity = '0.9';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLastPage) {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                →
              </button>
            </div>
          )}
        </div>
        
        {/* Grille des projets avec carousel si nécessaire */}
        {needsNavigation ? (
          <div className="relative">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-300 ease-in-out" 
                id={`carousel-${carouselId}`} 
                style={{ transform: 'translateX(0%)' }}
              >
                {displayedProjects.map((project, index) => (
                  <div 
                    key={project.id} 
                    className={`flex-shrink-0 ${
                      actualCount === 1 ? 'w-full' :
                      actualCount === 2 ? 'w-full md:w-[calc(50%-1rem)]' :
                      columns === 2 ? 'w-full md:w-[calc(50%-1rem)]' :
                      columns === 4 ? 'w-full md:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]' :
                      'w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)]' // 3 colonnes par défaut
                    } ${index < displayedProjects.length - 1 ? 'mr-8' : ''}`}
                  >
                    {renderProject(project)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-8 ${
            columns === 2 ? 'lg:grid-cols-2' :
            columns === 4 ? 'lg:grid-cols-4 work-columns-4' :
            'lg:grid-cols-3' // Par défaut 3 colonnes
          }`}>
            {displayedProjects.map(project => renderProject(project))}
          </div>
        )}
      </div>
    </section>
  );
}
