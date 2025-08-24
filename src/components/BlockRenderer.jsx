import React, { useState, useEffect } from 'react';
import FormattedText from './FormattedText';
import HeroSignature from './HeroSignature';
import StorytellingSection from './StorytellingSection';

const BlockRenderer = ({ blocks = [] }) => {
  const renderBlock = (block) => {
    switch (block.type) {
      case 'content':
        return (
          <div key={block.id} className="block-content">
            <FormattedText>
              {block.content}
            </FormattedText>
          </div>
        );
      
      case 'h2':
        return (
          <h2 key={block.id} className="block-h2">
            {block.content}
          </h2>
        );
      
      case 'h3':
        return (
          <h3 key={block.id} className="block-h3">
            {block.content}
          </h3>
        );
      
      case 'image':
        return (
          <div key={block.id} className="block-image">
            <img 
              src={block.image?.src} 
              alt={block.image?.alt || ''} 
              className="w-full h-auto"
            />
          </div>
        );
      
      case 'cta':
        return (
          <div key={block.id} className="block-cta">
            <button className="cta-button">
              {block.ctaText || block.content}
            </button>
          </div>
        );
      
      case 'hero-signature':
        return (
          <HeroSignature key={block.id} block={block} />
        );
      
      case 'storytelling':
        return (
          <StorytellingSection key={block.id} block={block} />
        );
      
      case 'services':
        return (
          <section key={block.id} className="service-offerings-section py-16">
            <div className="container mx-auto">
              {/* Titre de la section */}
              {block.title && (
                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {block.title}
                  </h2>
                </div>
              )}
              
              {/* Liste des offres de service */}
              <div className="space-y-0">
                {(block.offerings || []).map((offering, index) => (
                  <div 
                    key={offering.id || index}
                    className="service-offering-block border-b border-black/10 py-8 last:border-b-0"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      {/* Colonne de gauche - Titre */}
                      <div className="md:col-span-7">
                        {offering.icon && (
                          <div className="mb-2">
                            <span className="text-blue-400 text-lg">{offering.icon}</span>
                          </div>
                        )}
                        <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                          {offering.title}
                        </h3>
                      </div>
                      
                      {/* Colonne de droite - Description */}
                      <div className="md:col-span-5 flex justify-end">
                        <p className="max-w-[68ch]">
                          {offering.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      
      case 'projects':
        return (
          <section key={block.id} className="projects-section py-16">
            <div className="container mx-auto">
              {/* Titre de la section et navigation du carousel */}
              {(() => {
                const selectedCount = block.selectedProjects?.length || 0;
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
                if (block.selectedProjects && block.selectedProjects.length > 0) {
                  // Afficher seulement les projets sélectionnés
                  displayedProjects = allProjects.filter(project => block.selectedProjects.includes(project.id));
                } else {
                  // Afficher tous les projets (limités par maxProjects)
                  displayedProjects = allProjects.slice(0, block.maxProjects || 6);
                }
                
                // Déterminer si on utilise un carousel
                const useCarousel = selectedCount > 3;
                
                return (
                  <div className="mb-12 flex justify-between items-center">
                    {block.title && (
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {block.title}
                      </h2>
                    )}
                    
                    {/* Navigation du carousel - sur la même ligne que le titre */}
                    {useCarousel && (() => {
                      const projectsPerPage = 3;
                      const maxPages = Math.ceil(displayedProjects.length / projectsPerPage);
                      const [currentPage, setCurrentPage] = useState(0);
                      
                      const isFirstPage = currentPage === 0;
                      const isLastPage = currentPage === maxPages - 1;
                      
                      return (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              if (!isFirstPage) {
                                const newPage = currentPage - 1;
                                setCurrentPage(newPage);
                                
                                const carousel = document.getElementById(`carousel-${block.id}`);
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
                                
                                const carousel = document.getElementById(`carousel-${block.id}`);
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
                const selectedCount = block.selectedProjects?.length || 0;
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
                if (block.selectedProjects && block.selectedProjects.length > 0) {
                  // Afficher seulement les projets sélectionnés
                  displayedProjects = allProjects.filter(project => block.selectedProjects.includes(project.id));
                } else {
                  // Afficher tous les projets (limités par maxProjects)
                  displayedProjects = allProjects.slice(0, block.maxProjects || 6);
                }
                
                // Déterminer si on utilise un carousel
                const useCarousel = selectedCount > 3;
                
                if (useCarousel) {
                  // Carousel pour plus de 3 projets
                  return (
                    <div className="relative">
                      <div className="overflow-hidden">
                        <div className="flex transition-transform duration-300 ease-in-out" id={`carousel-${block.id}`} style={{ transform: 'translateX(0%)' }}>
                          {displayedProjects.map((project, index) => (
                            <div key={project.id} className="project-card flex-shrink-0 w-full md:w-1/2 lg:w-1/3 px-4">
                              <div className="project-image mb-4 relative cursor-none">
                                <img 
                                  src={project.image} 
                                  alt={project.alt}
                                  className="w-full object-cover rounded-lg aspect-[1/1]"
                                  onMouseEnter={(e) => {
                                    const cursor = document.createElement('div');
                                    cursor.className = 'custom-cursor';
                                    cursor.innerHTML = '→';
                                    document.body.appendChild(cursor);
                                    
                                    const updateCursor = (e) => {
                                      cursor.style.left = e.clientX + 'px';
                                      cursor.style.top = e.clientY + 'px';
                                    };
                                    
                                    const handleMouseMove = (e) => updateCursor(e);
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
                      {displayedProjects.map(project => (
                        <div key={project.id} className="project-card">
                          <div className="project-image mb-4">
                            <img 
                              src={project.image} 
                              alt={project.alt}
                              className={`w-full object-cover rounded-lg ${
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
      
      default:
        return (
          <div key={block.id} className="block-unknown">
            <p>Type de bloc non reconnu: {block.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="blocks-container">
      {blocks.map(renderBlock)}
    </div>
  );
};

export default BlockRenderer; 