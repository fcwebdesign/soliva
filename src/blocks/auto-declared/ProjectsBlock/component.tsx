import React, { useState, useEffect } from 'react';

interface ProjectsData {
  id?: string;
  title?: string;
  maxProjects?: number;
  selectedProjects?: string[];
  theme?: 'light' | 'dark' | 'auto';
}

export default function ProjectsBlock({ data }: { data: ProjectsData }) {
  const { title = "NOS RÉALISATIONS", maxProjects = 6, selectedProjects = [] } = data;
  
  // Générer un ID unique pour le carousel
  const carouselId = data.id || `projects-${Math.random().toString(36).substr(2, 9)}`;
  
  // Tous les projets disponibles
  const allProjects = [
    {
      id: "project-1",
      title: "Project Alpha",
      description: "Une identité de marque moderne pour une startup innovante dans le secteur de la technologie.",
      category: "Brand",
      image: "/img1.jpg",
      alt: "Project Alpha",
      slug: "project-1"
    },
    {
      id: "project-2",
      title: "Project Beta", 
      description: "Plateforme web interactive pour une exposition d'art contemporain.",
      category: "Digital",
      image: "/img2.jpg",
      alt: "Project Beta",
      slug: "project-2"
    },
    {
      id: "project-3",
      title: "Project Gamma",
      description: "Stratégie de communication globale pour une entreprise de mode durable.",
      category: "Strategy", 
      image: "/img3.jpg",
      alt: "Project Gamma",
      slug: "project-3"
    },
    {
      id: "project-4",
      title: "Project Delta",
      description: "Application mobile pour la gestion de projets créatifs et collaboratifs.",
      category: "Digital",
      image: "/img4.jpg",
      alt: "Project Delta",
      slug: "project-4"
    }
  ];
  
  // Filtrer les projets selon la sélection
  let displayedProjects;
  if (selectedProjects && selectedProjects.length > 0) {
    displayedProjects = allProjects.filter(project => selectedProjects.includes(project.id));
  } else {
    displayedProjects = allProjects.slice(0, maxProjects);
  }

  return (
    <section className="projects-section py-28" data-block-type="projects" data-block-theme={data.theme || 'auto'}>
      <div className="container mx-auto">
        {/* Titre de la section et navigation du carousel */}
        {(() => {
          const selectedCount = selectedProjects?.length || 0;
          
          // Déterminer si on utilise un carousel ou si on a besoin de navigation
          const useCarousel = selectedCount > 3;
          const needsNavigation = selectedCount > 3 || (selectedCount > 1 && selectedCount > 2);
          
          return (
            <div className="mb-12 flex justify-between items-center">
              {title && (
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                  {title}
                </h2>
              )}
              
              {/* Navigation - sur la même ligne que le titre */}
              {needsNavigation && (() => {
                const [currentPage, setCurrentPage] = useState(0);
                const [windowWidth, setWindowWidth] = useState(0);
                
                useEffect(() => {
                  const updateWidth = () => setWindowWidth(window.innerWidth);
                  updateWidth();
                  window.addEventListener('resize', updateWidth);
                  return () => window.removeEventListener('resize', updateWidth);
                }, []);
                
                let projectsPerPage;
                if (selectedCount === 1) {
                  projectsPerPage = 1;
                } else if (selectedCount === 2) {
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
          const selectedCount = selectedProjects?.length || 0;
          const needsNavigation = selectedCount > 3 || (selectedCount > 1 && selectedCount > 2);
          
          if (needsNavigation) {
            const [windowWidth, setWindowWidth] = useState(0);
            
            useEffect(() => {
              const updateWidth = () => setWindowWidth(window.innerWidth);
              updateWidth();
              window.addEventListener('resize', updateWidth);
              return () => window.removeEventListener('resize', updateWidth);
            }, []);
            
            let projectsPerPage;
            let gridClass;
            
            if (selectedCount === 1) {
              projectsPerPage = 1;
              gridClass = "grid grid-cols-1 gap-8";
            } else if (selectedCount === 2) {
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
                        selectedCount === 1 ? 'w-full' :
                        selectedCount === 2 ? 'w-full md:w-1/2' :
                        'w-full md:w-1/2 lg:w-1/3'
                      } px-4`}>
                        <div className="project-image mb-4">
                          <img 
                            src={project.image} 
                            alt={project.alt}
                            className={`w-full object-cover rounded-lg cursor-pointer ${
                              selectedCount === 1 ? 'h-96' : 'aspect-[1/1]'
                            }`}
                          />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {project.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          } else {
            let gridClass;
            if (selectedCount === 1) {
              gridClass = "grid grid-cols-1 gap-8";
            } else if (selectedCount === 2) {
              gridClass = "grid grid-cols-1 md:grid-cols-2 gap-8";
            } else {
              gridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";
            }
            
            return (
              <div className={gridClass}>
                {displayedProjects.map(project => (
                  <div key={project.id} className="project-card">
                    <div className="project-image mb-4">
                      <img 
                        src={project.image} 
                        alt={project.alt}
                        className={`w-full object-cover rounded-lg cursor-pointer ${
                          selectedCount === 1 ? 'h-96' : 'aspect-[1/1]'
                        }`}
                      />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{project.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {project.description}
                    </p>
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
