"use client";
import React, { useMemo } from 'react';
import { Link } from 'next-view-transitions';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';

type Project = {
  id?: string;
  slug?: string;
  title?: string;
  excerpt?: string;
  description?: string;
  image?: string;
  alt?: string;
  category?: string;
};

export default function WorkPearl({ content, fullContent }: { 
  content?: { hero?: { title?: string; subtitle?: string }; description?: string; projects?: Project[]; adminProjects?: Project[]; columns?: number };
  fullContent?: any; // Contenu complet avec metadata
}) {
  const title = content?.hero?.title || 'Réalisations';
  const subtitle = content?.hero?.subtitle || content?.description || '';
  const projectsFromProjects: Project[] = Array.isArray(content?.projects) ? (content?.projects as Project[]) : [];
  const projectsFromAdmin: Project[] = Array.isArray((content as any)?.adminProjects) ? ((content as any)?.adminProjects as Project[]) : [];
  const projects: Project[] = projectsFromProjects.length > 0 ? projectsFromProjects : projectsFromAdmin;

  // Récupérer les styles typographiques
  const typoConfig = getTypographyConfig(fullContent || {});
  const h1Classes = getTypographyClasses('h1', typoConfig, defaultTypography.h1);
  const h3Classes = getTypographyClasses('h3', typoConfig, defaultTypography.h3);
  const h4Classes = getTypographyClasses('h4', typoConfig, defaultTypography.h4);
  const pClasses = getTypographyClasses('p', typoConfig, defaultTypography.p);
  const h1CustomColor = getCustomColor('h1', typoConfig);
  const h3CustomColor = getCustomColor('h3', typoConfig);
  const h4CustomColor = getCustomColor('h4', typoConfig);
  const pCustomColor = getCustomColor('p', typoConfig);

  // Récupérer la palette actuelle pour les animations de hover
  const currentPaletteId = fullContent?.metadata?.colorPalette || 'classic';

  // Fonction pour obtenir les classes d'animation selon la palette
  // Pour l'instant, on applique le style mammothmurals à toutes les palettes
  const getHoverAnimationClasses = (paletteId: string) => {
    // Animation zoom arrière + clip-path (style mammothmurals exact)
    return {
      wrapper: 'work-hover-wrapper overflow-hidden rounded-lg transition-all duration-500 ease-out border-0',
      image: 'work-hover-image w-full h-full object-cover transition-all duration-500 ease-out rounded-lg',
      useMammothStyle: true
    };
  };

  const hoverClasses = useMemo(() => getHoverAnimationClasses(currentPaletteId), [currentPaletteId]);

  return (
    <section>
      <div className="py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          {/* Titre à gauche */}
          <div className="text-left">
            <h1 
              className={h1Classes}
              style={h1CustomColor ? { color: h1CustomColor } : undefined}
            >
              {title}
            </h1>
          </div>
          
          {/* Description à droite, alignée à droite et en bas */}
          {subtitle && (
            <div className="text-left md:text-right">
              <div
                className={`max-w-2xl md:ml-auto ${pClasses}`}
                style={pCustomColor ? { color: pCustomColor } : { color: 'var(--foreground)' }}
                dangerouslySetInnerHTML={{ __html: subtitle }}
              />
            </div>
          )}
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Aucun projet pour l'instant.</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-8 ${
          content?.columns === 2 ? 'lg:grid-cols-2' :
          content?.columns === 4 ? 'lg:grid-cols-4 work-columns-4' :
          'lg:grid-cols-3' // Par défaut 3 colonnes
        }`}>
          {projects.map((project) => (
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
                    className={`${h3Classes}`}
                    style={h3CustomColor ? { color: h3CustomColor } : undefined}
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
                    style={h4CustomColor ? { color: h4CustomColor } : undefined}
                  >
                    {project.excerpt || project.description}
                  </h4>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}


