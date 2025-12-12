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

// Override pour Starter-Kit : titre h3 aligné sur la taille h4, uppercase/bold et inline avec la description + séparateur.
export default function ProjectsBlockStarterKit({ data }: { data: ProjectsData | any }) {
  const blockData = (data as any).data || data;
  const { title = "NOS RÉALISATIONS", maxProjects = 6, selectedProjects = [], columns = 3, displayMode = 'grid' } = blockData;
  
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
  
  // Récupération des projets (metadata) avec fallback public
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        const content = await response.json();
        setFullContent(content);
        
        const adminProjects = Array.isArray(content.work?.adminProjects) ? content.work.adminProjects : [];
        const publicProjects = Array.isArray(content.work?.projects) ? content.work.projects : [];

        let projects: Project[] = [];

        if (adminProjects.length > 0) {
          projects = adminProjects
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
        } else if (publicProjects.length > 0) {
          projects = publicProjects.map((p: any, index: number) => ({
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
        console.error('Erreur lors du chargement des projets:', error);
        setAllProjects([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Écoute des mises à jour de contenu
  useContentUpdate(() => {
    const fetchData = async () => {
      try {
        const response = await fetchContentWithNoCache('/api/content/metadata');
        const content = await response.json();
        setFullContent(content);
        
        const adminProjects = Array.isArray(content.work?.adminProjects) ? content.work.adminProjects : [];
        const publicProjects = Array.isArray(content.work?.projects) ? content.work.projects : [];

        let projects: Project[] = [];
        
        if (adminProjects.length > 0) {
          projects = adminProjects
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
        } else if (publicProjects.length > 0) {
          projects = publicProjects.map((p: any, index: number) => ({
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
  
  // Synchro Embla
  useEffect(() => {
    if (!emblaApi) return undefined;
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

  useEffect(() => {
    emblaApi?.reInit();
  }, [emblaApi]);

  // Suivre la largeur fenêtre
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
  
  // Typographie
  const typoConfig = useMemo(() => {
    return fullContent ? getTypographyConfig(fullContent) : {};
  }, [fullContent]);
  
  const h2Classes = getTypographyClasses('h2', typoConfig, defaultTypography.h2);
  const h3Classes = getTypographyClasses('h3', typoConfig, defaultTypography.h3);
  const h4Classes = getTypographyClasses('h4', typoConfig, defaultTypography.h4);
  const h2CustomColor = getCustomColor('h2', typoConfig);
  const h3CustomColor = getCustomColor('h3', typoConfig);
  const h4CustomColor = getCustomColor('h4', typoConfig);
  
  const currentPaletteId = fullContent?.metadata?.colorPalette || 'classic';
  const hoverClasses = useMemo(() => {
    // Version simplifiée : pas de coins arrondis, animation réduite
    return {
      wrapper: 'overflow-hidden transition-all duration-200 ease-out border-0',
      image: 'w-full h-full object-cover transition-all duration-200 ease-out',
      useMammothStyle: false
    };
  }, [currentPaletteId]); // eslint-disable-line @typescript-eslint/no-unused-vars
  
  // Filtrer selon la sélection
  let displayedProjects: Project[];
  if (selectedProjects && selectedProjects.length > 0) {
    displayedProjects = selectedProjects
      .map(id => allProjects.find(p => p.id === id))
      .filter(Boolean)
      .slice(0, maxProjects) as Project[];
  } else {
    displayedProjects = allProjects.slice(0, maxProjects);
  }
  
  if (loading) {
    return (
      <section className="projects-section" data-block-type="projects" data-block-theme={blockData.theme || (data as any).theme || 'auto'}>
        <div className="text-center py-16">
          <p style={{ color: 'var(--muted-foreground)' }}>Chargement des projets...</p>
        </div>
      </section>
    );
  }
  
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
  
  let projectsPerPage;
  if (actualCount === 1) {
    projectsPerPage = 1;
  } else if (actualCount === 2) {
    projectsPerPage = windowWidth < 768 ? 1 : 2;
  } else {
    if (columns === 2) {
      projectsPerPage = windowWidth < 768 ? 1 : 2;
    } else if (columns === 4) {
      projectsPerPage = windowWidth < 768 ? 1 : windowWidth < 1024 ? 2 : 4;
    } else {
      projectsPerPage = windowWidth < 768 ? 1 : windowWidth < 1024 ? 2 : 3;
    }
  }
  
  const needsNavigation = displayMode !== 'grid' && hasScroll;

  // Rendu projet avec titre en taille h4, uppercase bold, inline avec description
  const renderProject = (project: Project) => {
    const titleAndDesc = project.excerpt || project.description;
    return (
      <article key={project.slug || project.id} className="group">
        {project.image && (
          <Link href={`/work/${project.slug || project.id}`} className="block mb-4">
            <div 
              className={`${hoverClasses.wrapper} relative`}
              style={{ 
                aspectRatio: '2400 / 1800'
              }}
            >
              {/* Label catégorie en overlay haut gauche */}
              {project.category && (
                <div className="absolute top-4 left-4 z-10">
                  <small className="inline-block px-2 py-0 text-xs font-light uppercase text-primary-foreground bg-primary rounded-full whitespace-nowrap">
                    {project.category}
                  </small>
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={project.image} 
                alt={project.alt || project.title || 'Projet'} 
                className={hoverClasses.image}
                style={{ aspectRatio: '2400 / 1800', width: '100%', height: '100%' }}
              />
            </div>
          </Link>
        )}
        <div className="space-y-2">
          <div className="flex flex-nowrap items-baseline gap-2 min-w-0">
            <h3
              className="text-lg font-bold leading-none text-muted-foreground tracking-normal uppercase font-extrabold inline-flex items-baseline m-0 shrink-0"
              style={h4CustomColor ? { color: h4CustomColor } : { color: 'var(--foreground)' }}
            >
              <Link href={`/work/${project.slug || project.id}`} className="hover:text-accent transition-colors">
                {project.title || 'Projet'}
              </Link>
            </h3>
            {titleAndDesc && (
              <>
                <span className="text-muted-foreground">—</span>
                <h4
                  className={`${h4Classes} line-clamp-2 sm:line-clamp-3 inline-flex items-baseline m-0 flex-1 min-w-0`}
                  style={h4CustomColor ? { color: h4CustomColor } : { color: 'var(--foreground)' }}
                >
                  {titleAndDesc}
                </h4>
              </>
            )}
          </div>
        </div>
      </article>
    );
  };
  
  return (
    <section className="projects-section" data-block-type="projects" data-block-theme={blockData.theme || (data as any).theme || 'auto'}>
      <div>
        {(title || (needsNavigation && displayMode !== 'grid')) && (
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
        )}
        
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
                {displayedProjects.map((project) => (
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
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

