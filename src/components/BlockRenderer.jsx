import React, { useState, useEffect } from 'react';
import FormattedText from './FormattedText';
import HeroSignature from './HeroSignature';
import StorytellingSection from './StorytellingSection';
// Import du système scalable (charge automatiquement tous les blocs)
import '../blocks/auto-declared';
import { getAutoDeclaredBlock } from '../blocks/auto-declared/registry';

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
        // Utilisation du système scalable pour le bloc content
        const ContentBlockScalable = getAutoDeclaredBlock('content')?.component;
        if (ContentBlockScalable) {
          // Validation des données avec fallback
          const contentData = { content: block.content || '' };
          return (
            <ContentBlockScalable 
              key={block.id}
              data={contentData}
            />
          );
        }
        // Fallback vers l'ancien système
        return (
          <div key={block.id} className="block-content">
            <FormattedText>
              {block.content}
            </FormattedText>
          </div>
        );
      
      case 'h2':
        // Utilisation du système scalable pour le bloc h2
        const H2BlockScalable = getAutoDeclaredBlock('h2')?.component;
        if (H2BlockScalable) {
          // Validation des données avec fallback
          const h2Data = { content: block.content || '' };
          return (
            <H2BlockScalable 
              key={block.id}
              data={h2Data}
            />
          );
        }
        // Fallback vers l'ancien système
        return (
          <h2 key={block.id} className="block-h2">
            {block.content}
          </h2>
        );
      
      case 'h3':
        // Utilisation du système scalable pour le bloc h3
        const H3BlockScalable = getAutoDeclaredBlock('h3')?.component;
        if (H3BlockScalable) {
          // Validation des données avec fallback
          const h3Data = { content: block.content || '' };
          return (
            <H3BlockScalable 
              key={block.id}
              data={h3Data}
            />
          );
        }
        // Fallback vers l'ancien système
        return (
          <h3 key={block.id} className="block-h3">
            {block.content}
          </h3>
        );
      
        case 'image':
          // Utilisation du système scalable pour le bloc image
          const ImageBlockScalable = getAutoDeclaredBlock('image')?.component;
          if (ImageBlockScalable) {
            // Validation des données avec fallback
            const imageData = block.image || { src: '', alt: '' };
            return (
              <ImageBlockScalable 
                key={block.id}
                data={imageData}
              />
            );
          }
          // Fallback vers l'ancien système
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
        // Utilisation du système scalable pour le bloc services
        const ServicesBlockScalable = getAutoDeclaredBlock('services')?.component;
        if (ServicesBlockScalable) {
          // Validation des données avec fallback
          const servicesData = {
            title: block.title || 'OUR CORE OFFERINGS',
            offerings: block.offerings || [],
            theme: block.theme || 'auto'
          };
          return (
            <ServicesBlockScalable 
              key={block.id}
              data={servicesData}
            />
          );
        }
        // Fallback vers l'ancien système
        return (
          <Services 
            key={block.id}
            id={block.id}
            type={block.type}
            title={block.title}
            offerings={block.offerings}
            theme={block.theme}
          />
        );
      

      case 'projects':
        // Utilisation du système scalable pour le bloc projects
        const ProjectsBlockScalable = getAutoDeclaredBlock('projects')?.component;
        if (ProjectsBlockScalable) {
          // Validation des données avec fallback
          const projectsData = {
            title: block.title || 'NOS RÉALISATIONS',
            maxProjects: block.maxProjects || 6,
            selectedProjects: block.selectedProjects || [],
            theme: block.theme || 'auto',
            id: block.id // Pour l'ID du carousel
          };
          return (
            <ProjectsBlockScalable 
              key={block.id}
              data={projectsData}
            />
          );
        }
        // Fallback vers l'ancien système (le code existant)
        return (
          <section key={block.id} className="projects-section py-28" data-block-type="projects" data-block-theme={block.theme || 'auto'}>
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
        // Utilisation du système scalable pour le bloc logos
        const LogosBlockScalable = getAutoDeclaredBlock('logos')?.component;
        if (LogosBlockScalable) {
          // Validation des données avec fallback
          const logosData = {
            title: block.title || 'NOS CLIENTS',
            theme: block.theme || 'auto',
            logos: block.logos || []
          };
          return (
            <LogosBlockScalable 
              key={block.id}
              data={logosData}
            />
          );
        }
        // Fallback vers l'ancien système
        return (
          <section key={block.id} className="logos-section py-28" data-block-type="logos" data-block-theme={block.theme || 'auto'}>
            <div className="container mx-auto">
              {block.title && (
                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {block.title}
                  </h2>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
                {(block.logos || []).map((logo, index) => (
                  <div key={index} className="logo-item flex items-center justify-center">
                    <img
                      src={logo.src || logo.image}
                      alt={logo.alt || logo.name || `Logo client ${index + 1}`}
                      className="max-w-full h-12 md:h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      
      case 'two-columns':
        // Utilisation du système scalable pour le bloc two-columns
        const TwoColumnsBlockScalable = getAutoDeclaredBlock('two-columns')?.component;
        if (TwoColumnsBlockScalable) {
          return (
            <TwoColumnsBlockScalable 
              key={block.id}
              data={block}
            />
          );
        }
        // Plus de fallback - le bloc scalable est obligatoire
        return null;
      
      case 'contact':
        // Utilisation du système scalable pour le bloc contact
        const ContactBlockScalable = getAutoDeclaredBlock('contact')?.component;
        if (ContactBlockScalable) {
          // Validation des données avec fallback
          const contactData = {
            title: block.title || '',
            ctaText: block.ctaText || '',
            ctaLink: block.ctaLink || '',
            theme: block.theme || 'auto'
          };
          return (
            <ContactBlockScalable 
              key={block.id}
              data={contactData}
            />
          );
        }
        // Fallback vers l'ancien système
        return (
          <section 
            key={block.id} 
            className="contact-section py-28" 
            data-block-type="contact" 
            data-block-theme={block.theme || 'auto'}
          >
            <div className="container mx-auto border border-black/20 dark:border-white/20 p-8">
              <div className="flex justify-between items-center">
                {block.title && (
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-black dark:text-white">
                    {block.title}
                  </h2>
                )}
                {block.ctaText && block.ctaLink && (
                  <a 
                    href={block.ctaLink}
                    className="inline-flex items-center px-6 py-3 font-medium text-sm transition-all duration-300 contact-button"
                  >
                    {block.ctaText}
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