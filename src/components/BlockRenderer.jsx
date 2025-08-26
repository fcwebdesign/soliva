import React, { useState, useEffect } from 'react';
import FormattedText from './FormattedText';
import HeroSignature from './HeroSignature';
import StorytellingSection from './StorytellingSection';
import TwoColumns from '../blocks/defaults/TwoColumns';

const BlockRenderer = ({ blocks = [] }) => {
  // Gestion du thème par bloc avec priorité sur le scroll
  React.useEffect(() => {
    // Observer les blocs pour détecter lequel est visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const blockType = entry.target.dataset.blockType;
          const blockTheme = entry.target.dataset.blockTheme;
          
          console.log('👁️ IntersectionObserver - Bloc détecté:', { blockType, blockTheme });
          
          // Si le bloc a un thème spécifique, l'appliquer
          if (blockTheme && blockTheme !== 'auto') {
            console.log('🎨 Application du thème:', blockTheme);
            document.documentElement.setAttribute('data-theme', blockTheme);
          } else {
            // Sinon, appliquer le thème par défaut selon le type
            if (blockType === 'services' || blockType === 'projects') {
              document.documentElement.setAttribute('data-theme', 'dark');
            } else if (blockType === 'logos') {
              document.documentElement.setAttribute('data-theme', 'light');
            } else if (blockType === 'two-columns') {
              // Pour two-columns avec thème auto, utiliser le thème global actuel
              const currentTheme = localStorage.getItem('theme') || 'light';
              console.log('🎨 TwoColumns avec thème auto - utilisation du thème global:', currentTheme);
              document.documentElement.setAttribute('data-theme', currentTheme);
            }
          }
        }
      });
    }, { threshold: 0.3 }); // Seuil plus bas pour une détection plus rapide

    // Observer tous les blocs
    setTimeout(() => {
      document.querySelectorAll('[data-block-type]').forEach(el => {
        observer.observe(el);
      });
    }, 100);

    return () => observer.disconnect();
  }, [blocks]);

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
          <section key={block.id} className="service-offerings-section py-32" data-block-type="services" data-block-theme={block.theme || 'auto'}>
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
                        <div 
                          className="max-w-[68ch]"
                          dangerouslySetInnerHTML={{ __html: offering.description || '' }}
                        />
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
          <section key={block.id} className="projects-section py-32" data-block-type="projects" data-block-theme={block.theme || 'auto'}>
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
                
                // Déterminer si on utilise un carousel ou si on a besoin de navigation
                const useCarousel = selectedCount > 3;
                const needsNavigation = selectedCount > 3 || (selectedCount > 1 && selectedCount > 2);
                
                return (
                  <div className="mb-12 flex justify-between items-center">
                    {block.title && (
                      <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                        {block.title}
                      </h2>
                    )}
                    
                    {/* Navigation - sur la même ligne que le titre */}
                    {needsNavigation && (() => {
                      // Déterminer le nombre de projets par page selon le layout et la taille d'écran
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
                        projectsPerPage = 1; // Fullscreen
                      } else if (selectedCount === 2) {
                        projectsPerPage = windowWidth < 768 ? 1 : 2; // 1 sur mobile, 2 sur desktop
                      } else {
                        projectsPerPage = windowWidth < 768 ? 1 : windowWidth < 1024 ? 2 : 3; // 1/2/3 selon la taille
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
                
                // Déterminer si on utilise un carousel ou si on a besoin de navigation
                const useCarousel = selectedCount > 3;
                const needsNavigation = selectedCount > 3 || (selectedCount > 1 && selectedCount > 2);
                
                if (needsNavigation) {
                  // Layout avec navigation pour plus de projets que d'espaces disponibles
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
                        <div className={gridClass} id={`carousel-${block.id}`} style={{ transform: 'translateX(0%)' }}>
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
                  // Grille normale pour 1-3 projets sans navigation
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
      
      case 'logos':
        return (
          <section key={block.id} className="logos-section py-32" data-block-type="logos" data-block-theme={block.theme || 'auto'}>
            <div className="container mx-auto">
              {/* Titre de la section */}
              {block.title && (
                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {block.title}
                  </h2>
                </div>
              )}

              {/* Grille des logos clients */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 justify-items-center">
                {(block.logos || []).map((logo, index) => (
                  <div key={index} className="logo-item">
                    <img
                      src={logo.src || logo.image}
                      alt={logo.alt || logo.name || `Logo client ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      
      case 'two-columns':
        return (
          <TwoColumns key={block.id} {...block} />
        );
      
      case 'contact':
        return (
          <section key={block.id} className="contact-section py-32" data-block-type="contact" data-block-theme={block.theme || 'auto'}>
            <div className="container mx-auto border border-black/20 p-8">
              <div className="flex justify-between items-center">
                {/* Titre de la section */}
                {block.title && (
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {block.title}
                  </h2>
                )}
                
                {/* Bouton CTA */}
                {block.ctaText && block.ctaLink && (
                  <a 
                    href={block.ctaLink}
                    className="inline-flex items-center px-6 py-3 bg-black text-white font-medium text-sm hover:bg-gray-800 transition-all duration-300"
                  >
                    {block.ctaText}
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                )}
              </div>
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