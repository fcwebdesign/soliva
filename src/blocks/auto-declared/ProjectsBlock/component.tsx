'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'next-view-transitions';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';
import { useContentUpdate, fetchContentWithNoCache } from '@/hooks/useContentUpdate';
import useEmblaCarousel from 'embla-carousel-react';

interface ProjectsData {
  id?: string;
  title?: string;
  maxProjects?: number;
  selectedProjects?: string[];
  theme?: 'light' | 'dark' | 'auto';
  columns?: number;
  displayMode?: 'grid' | 'carousel';
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
  const { title = "NOS RÉALISATIONS", maxProjects = 6, selectedProjects = [], columns = 3, displayMode = 'grid' } = blockData;
  
  // État pour les projets récupérés depuis l'API
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [fullContent, setFullContent] = useState<any>(null);
  const [windowWidth, setWindowWidth] = useState<number>(1440);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    loop: false,
    dragFree: false,
    slidesToScroll: 1,
  });
  const [hasScroll, setHasScroll] = useState(false);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  
  // Récupérer les projets et le contenu complet depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
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
  }, []);
  
  // Écouter les mises à jour de contenu pour recharger les projets
  useContentUpdate(() => {
    // Recharger les projets quand le contenu est mis à jour
    const fetchData = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        const content = await response.json();
        setFullContent(content);
        
        let projects: Project[] = [];
        
        if (content.work?.adminProjects) {
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
        
        const uniqueProjects = projects.filter((project, index, self) => 
          index === self.findIndex(p => p.id === project.id)
        );
        
        uniqueProjects.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return 0;
        });
        
        setAllProjects(uniqueProjects);
      } catch (error) {
        console.error('Erreur lors du rechargement des projets:', error);
      }
    };
    
    fetchData();
  });
  
  // Synchro nav Embla
  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setHasScroll(emblaApi.canScrollNext() || emblaApi.canScrollPrev());
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    emblaApi.on('select', update);
    emblaApi.on('reInit', update);
    update();
    return () => {
      emblaApi.off('select', update);
      emblaApi.off('reInit', update);
    };
  }, [emblaApi]);

  // Réinit Embla après rendu (quand les projets sont prêts)
  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi]);

  // Suivre la largeur fenêtre pour calculer projectsPerPage
  useEffect(() => {
    const update = () => {
      if (typeof window !== 'undefined') {
        setWindowWidth(window.innerWidth);
      }
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  
  // Récupérer les styles typographiques
  const typoConfig = useMemo(() => {
    return fullContent ? getTypographyConfig(fullContent) : {};
  }, [fullContent]);
  
  const h2Classes = getTypographyClasses('h2', typoConfig, defaultTypography.h2);
  const h3Classes = getTypographyClasses('h3', typoConfig, defaultTypography.h3);
  const h4Classes = getTypographyClasses('h4', typoConfig, defaultTypography.h4);
  const h2CustomColor = getCustomColor('h2', typoConfig);
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
  
  // Filtrer les projets selon la sélection (en maintenant l'ordre de selectedProjects)
  let displayedProjects: Project[];
  if (selectedProjects && selectedProjects.length > 0) {
    displayedProjects = selectedProjects
      .map(id => allProjects.find(p => p.id === id))
      .filter(Boolean)
      .slice(0, maxProjects) as Project[]; // Limiter au nombre max
  } else {
    displayedProjects = allProjects.slice(0, maxProjects);
  }
  
  // État de chargement
  if (loading) {
    return (
      <section className="projects-section" data-block-type="projects" data-block-theme={blockData.theme || (data as any).theme || 'auto'}>
        <div className="text-center py-16">
          <p style={{ color: 'var(--muted-foreground)' }}>Chargement des projets...</p>
        </div>
      </section>
    );
  }
  
  // Aucun projet trouvé
  if (displayedProjects.length === 0) {
    return (
      <section className="projects-section" data-block-type="projects" data-block-theme={blockData.theme || (data as any).theme || 'auto'}>
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
  
  const needsNavigation = displayMode !== 'grid' && hasScroll;
  
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
    <section className="projects-section" data-block-type="projects" data-block-theme={blockData.theme || (data as any).theme || 'auto'}>
      <div>
        {/* Titre de la section et navigation du carousel */}
        <div className="mb-12 flex justify-between items-center">
          {title && (
            <h2 
              className={h2Classes}
              style={h2CustomColor ? { color: h2CustomColor } : { color: 'var(--foreground)' }}
              data-block-type="h2"
            >
              {title}
            </h2>
          )}
          
          {/* Navigation - sur la même ligne que le titre */}
          {needsNavigation && displayMode !== 'grid' && (
            <div className="flex space-x-2">
              <button
                onClick={() => emblaApi?.scrollPrev()}
                className={`w-[42px] h-[42px] rounded-full transition-all duration-300 flex items-center justify-center font-semibold ${
                  !canPrev ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{
                  backgroundColor: !canPrev ? 'var(--muted)' : 'var(--primary)',
                  color: !canPrev ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                  border: !canPrev ? '1px solid var(--border)' : 'none'
                }}
              >
                ←
              </button>
              <button
                onClick={() => emblaApi?.scrollNext()}
                className={`w-[42px] h-[42px] rounded-full transition-all duration-300 flex items-center justify-center font-semibold ${
                  !canNext ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                }`}
                style={{
                  backgroundColor: !canNext ? 'var(--muted)' : 'var(--primary)',
                  color: !canNext ? 'var(--muted-foreground)' : 'var(--primary-foreground)',
                  border: !canNext ? '1px solid var(--border)' : 'none'
                }}
              >
                →
              </button>
            </div>
          )}
        </div>
        
        {/* Grille des projets ou carousel Embla */}
        {displayMode === 'grid' ? (
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-8 ${
            columns === 2 ? 'lg:grid-cols-2' :
            columns === 4 ? 'lg:grid-cols-4 work-columns-4' :
            'lg:grid-cols-3'
          }`}>
            {displayedProjects.map(project => renderProject(project))}
          </div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className={`flex gap-8 ${
                columns === 2 ? 'md:pr-8 lg:pr-8' :
                columns === 4 ? 'md:pr-8 lg:pr-24' :
                'md:pr-8 lg:pr-16'
              }`}>
                {displayedProjects.map((project) => {
                  // Ajuster la base pour compenser le gap afin que le dernier slide ne soit pas rogné
                  return (
                    <div
                      key={project.id}
                      className={`flex-none w-full ${
                        columns === 2 ? 'md:w-1/2 lg:w-1/2' :
                        columns === 4 ? 'md:w-1/2 lg:w-1/4' :
                        'md:w-1/2 lg:w-1/3'
                      }`}
                    >
                      {renderProject(project)}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
