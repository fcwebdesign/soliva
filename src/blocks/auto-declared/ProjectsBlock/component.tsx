import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface ProjectsData {
  id?: string;
  title?: string;
  maxProjects?: number;
  selectedProjects?: string[];
  theme?: 'light' | 'dark' | 'auto';
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

export default function ProjectsBlock({ data }: { data: ProjectsData }) {
  const { title = "NOS RÉALISATIONS", maxProjects = 6, selectedProjects = [] } = data;
  
  // Générer un ID unique pour le carousel
  const carouselId = data.id || `projects-${Math.random().toString(36).substr(2, 9)}`;
  
  // État pour les projets récupérés depuis l'API
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États pour la navigation du carousel
  const [currentPage, setCurrentPage] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  
  // Récupérer les projets depuis l'API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/content', {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        const content = await response.json();
        
        // Récupérer les projets publiés depuis adminProjects ou projects
        let projects: Project[] = [];
        
        if (content.work?.adminProjects) {
          // Priorité aux projets de l'admin (avec blocs)
          projects = content.work.adminProjects
            .filter((p: any) => p.status === 'published')
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
        // Fallback vers des projets par défaut en cas d'erreur
        setAllProjects([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  const withTpl = (href: string) => {
    if (typeof window === 'undefined') return href;
    try {
      const params = new URLSearchParams(window.location.search);
      const tpl = params.get('template');
      return tpl ? `${href}${href.includes('?') ? '&' : '?'}template=${tpl}` : href;
    } catch {
      return href;
    }
  };
  
  // Gérer la largeur de la fenêtre
  useEffect(() => {
    const updateWidth = () => setWindowWidth(window.innerWidth);
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);
  
  // Filtrer les projets selon la sélection
  let displayedProjects;
  if (selectedProjects && selectedProjects.length > 0) {
    displayedProjects = allProjects.filter(project => selectedProjects.includes(project.id));
  } else {
    displayedProjects = allProjects.slice(0, maxProjects);
  }

  // État de chargement
  if (loading) {
    return (
      <section className="projects-section py-28" data-block-type="projects" data-block-theme={data.theme || 'auto'}>
        <div className="container mx-auto">
          <div className="mb-12">
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                {title}
              </h2>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-[1/1] rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Aucun projet trouvé
  if (displayedProjects.length === 0) {
    return (
      <section className="projects-section py-28" data-block-type="projects" data-block-theme={data.theme || 'auto'}>
        <div className="container mx-auto">
          <div className="mb-12">
            {title && (
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                {title}
              </h2>
            )}
          </div>
          <div className="text-center text-gray-500">
            <p>Aucun projet publié pour le moment.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="projects-section py-28" data-block-type="projects" data-block-theme={data.theme || 'auto'}>
      <div className="container mx-auto">
        {/* Titre de la section et navigation du carousel */}
        {(() => {
          const actualCount = displayedProjects.length;
          
          // Déterminer si on utilise un carousel ou si on a besoin de navigation
          const useCarousel = actualCount > 3;
          const needsNavigation = actualCount > 3;
          
          return (
            <div className="mb-12 flex justify-between items-center">
              {title && (
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {title}
                </h2>
              )}
              
              {/* Navigation - sur la même ligne que le titre */}
              {needsNavigation && (() => {
                
                let projectsPerPage;
                if (actualCount === 1) {
                  projectsPerPage = 1;
                } else if (actualCount === 2) {
                  projectsPerPage = windowWidth < 768 ? 1 : 2;
                } else {
                  projectsPerPage = windowWidth < 768 ? 1 : windowWidth < 1024 ? 2 : 3;
                }
                
                const maxPages = Math.ceil(displayedProjects.length / projectsPerPage);
                const isFirstPage = currentPage === 0;
                const isLastPage = currentPage === maxPages - 1;
                
                return (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        if (!isFirstPage) {
                          const newPage = currentPage - 1;
                          setCurrentPage(newPage);
                          
                          const carousel = document.getElementById(`carousel-${carouselId}`);
                          if (carousel) {
                            const translateX = -(newPage * (100 / projectsPerPage));
                            carousel.style.transform = `translateX(${translateX}%)`;
                          }
                        }
                      }}
                      className={`w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-300 flex items-center justify-center text-gray-500 hover:text-gray-700 ${
                        isFirstPage ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                      }`}
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
                            const translateX = -(newPage * (100 / projectsPerPage));
                            carousel.style.transform = `translateX(${translateX}%)`;
                          }
                        }
                      }}
                      className={`w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-300 flex items-center justify-center text-gray-500 hover:text-gray-700 ${
                        isLastPage ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      →
                    </button>
                  </div>
                );
              })()}
            </div>
          );
        })()}
        
        {/* Grille des projets */}
        {(() => {
          const actualCount = displayedProjects.length;
          const needsNavigation = actualCount > 3;
          
          if (needsNavigation) {
            
            let projectsPerPage;
            let gridClass;
            
            if (actualCount === 1) {
              projectsPerPage = 1;
              gridClass = "grid grid-cols-1 gap-8";
            } else if (actualCount === 2) {
              projectsPerPage = windowWidth < 768 ? 1 : 2;
              gridClass = "flex transition-transform duration-300 ease-in-out";
            } else {
              projectsPerPage = windowWidth < 768 ? 1 : windowWidth < 1024 ? 2 : 3;
              gridClass = "flex transition-transform duration-300 ease-in-out";
            }
            
            return (
              <div className="relative">
                <div className="overflow-hidden">
                  <div className={gridClass} id={`carousel-${carouselId}`} style={{ transform: 'translateX(0%)' }}>
                    {displayedProjects.map((project, index) => (
                      <div key={project.id} className={`project-card flex-shrink-0 ${
                        actualCount === 1 ? 'w-full' :
                        actualCount === 2 ? 'w-full md:w-1/2' :
                        'w-full md:w-1/2 lg:w-1/3'
                      } px-4`}>
                        <div className="project-image mb-4">
                          <Image 
                            src={project.image || '/img1.jpg'} 
                            alt={project.alt || project.title}
                            width={400}
                            height={300}
                            className={`w-full object-cover rounded-lg cursor-pointer ${
                              actualCount === 1 ? 'h-96' : 'aspect-[1/1]'
                            }`}
                            onClick={() => {
                              if (project.slug) {
                                window.location.href = withTpl(`/work/${project.slug}`);
                              }
                            }}
                          />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {project.excerpt || project.description}
                        </p>
                        {project.category && (
                          <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                            {project.category}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          } else {
            let gridClass;
            if (actualCount === 1) {
              gridClass = "grid grid-cols-1 gap-8";
            } else if (actualCount === 2) {
              gridClass = "grid grid-cols-1 md:grid-cols-2 gap-8";
            } else {
              gridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";
            }
            
            return (
              <div className={gridClass}>
                {displayedProjects.map(project => (
                  <div key={project.id} className="project-card">
                    <div className="project-image mb-4">
                      <Image 
                        src={project.image || '/img1.jpg'} 
                        alt={project.alt || project.title}
                        width={400}
                        height={300}
                        className={`w-full object-cover rounded-lg cursor-pointer ${
                          actualCount === 1 ? 'h-96' : 'aspect-[1/1]'
                        }`}
                        onClick={() => {
                          if (project.slug) {
                            window.location.href = withTpl(`/work/${project.slug}`);
                          }
                        }}
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {project.excerpt || project.description}
                    </p>
                    {project.category && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                        {project.category}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            );
          }
        })()}
      </div>
    </section>
  );
}
