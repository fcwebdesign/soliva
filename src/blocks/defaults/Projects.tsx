import React from 'react';
import type { BlockBase } from '../types';
import { readContent } from '@/lib/content';

interface ProjectsBlock extends BlockBase {
  type: 'projects';
  title?: string;
  maxProjects?: number;
  selectedProjects?: string[]; // IDs des projets sélectionnés
}

export default function Projects({ title = "NOS RÉALISATIONS", maxProjects = 6, selectedProjects = [] }: ProjectsBlock) {
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
    // Afficher seulement les projets sélectionnés
    displayedProjects = allProjects.filter(project => selectedProjects.includes(project.id));
  } else {
    // Afficher tous les projets (limités par maxProjects)
    displayedProjects = allProjects.slice(0, maxProjects);
  }

  return (
    <section className="projects-section py-16">
      <div className="container mx-auto">
        {/* Titre de la section */}
        {title && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {title}
            </h2>
          </div>
        )}
        
        {/* Grille des projets */}
        {(() => {
          const selectedCount = selectedProjects?.length || 0;
          const useCarousel = selectedCount > 3;
          
          if (useCarousel) {
            // Carousel pour plus de 3 projets
            return (
              <div className="relative">
                {/* Navigation du carousel - maintenant en haut à droite */}
                <div className="flex justify-end mb-4 space-x-2">
                  {Array.from({ length: Math.ceil(displayedProjects.length / 3) }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        const carousel = document.getElementById('carousel-projects');
                        if (carousel) {
                          // Calculer la translation basée sur le nombre de projets par page
                          const projectsPerPage = 3;
                          const translateX = -(i * (100 / projectsPerPage));
                          carousel.style.transform = `translateX(${translateX}%)`;
                          console.log('Carousel navigation:', { page: i + 1, translateX, projectsPerPage });
                        }
                      }}
                      className="custom-carousel-dot w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 transition-all duration-300 flex items-center justify-center text-xs text-gray-500 hover:text-gray-700"
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
                
                <div className="overflow-hidden">
                  <div className="flex transition-transform duration-300 ease-in-out" id="carousel-projects" style={{ transform: 'translateX(0%)' }}>
                    {displayedProjects.map((project, index) => (
                      <div key={project.slug || index} className="project-card flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4">
                        {/* Image du projet */}
                        <div className="project-image mb-4 relative cursor-none">
                          <img 
                            src={project.image || '/placeholder-project.jpg'} 
                            alt={project.alt || project.title}
                            className="w-full object-cover rounded-lg aspect-[1/1]"
                            onMouseEnter={(e) => {
                              const cursor = document.createElement('div');
                              cursor.className = 'custom-cursor';
                              cursor.innerHTML = '→';
                              document.body.appendChild(cursor);
                              
                              const updateCursor = (e: MouseEvent) => {
                                cursor.style.left = e.clientX + 'px';
                                cursor.style.top = e.clientY + 'px';
                              };
                              
                              const handleMouseMove = (e: MouseEvent) => updateCursor(e);
                              const handleMouseLeave = () => {
                                if (cursor.parentNode) {
                                  document.body.removeChild(cursor);
                                }
                                document.removeEventListener('mousemove', handleMouseMove);
                              };
                              
                              document.addEventListener('mousemove', handleMouseMove);
                              e.target.addEventListener('mouseleave', handleMouseLeave);
                            }}
                          />
                        </div>
                        
                        {/* Titre du projet */}
                        <h3 className="text-xl font-semibold mb-2">
                          {project.title}
                        </h3>
                        
                        {/* Description courte */}
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
            // Grille normale pour 1-3 projets
            let gridClass;
            if (selectedCount === 1) {
              gridClass = "grid grid-cols-1 gap-8"; // Fullscreen
            } else if (selectedCount === 2) {
              gridClass = "grid grid-cols-1 md:grid-cols-2 gap-8"; // 2 colonnes
            } else {
              gridClass = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"; // 3 colonnes
            }
            
            return (
              <div className={gridClass}>
                {displayedProjects.map((project, index) => (
                  <div key={project.slug || index} className="project-card">
                    {/* Image du projet */}
                    <div className="project-image mb-4">
                      <img 
                        src={project.image || '/placeholder-project.jpg'} 
                        alt={project.alt || project.title}
                        className={`w-full object-cover rounded-lg ${
                          selectedProjects?.length === 1 ? 'h-96' : 'aspect-[1/1]'
                        }`}
                      />
                    </div>
                    
                    {/* Titre du projet */}
                    <h3 className="text-xl font-semibold mb-2">
                      {project.title}
                    </h3>
                    
                    {/* Description courte */}
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