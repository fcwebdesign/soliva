"use client";
import React from 'react';
import { Link } from 'next-view-transitions';
import { getTypographyConfig, getTypographyClasses, defaultTypography } from '@/utils/typography';

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


  return (
    <section>
      <div className="text-left py-10">
        <h1 className={h1Classes}>{title}</h1>
        {subtitle && <p className={`mt-3 max-w-2xl ${pClasses}`}>{subtitle}</p>}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Aucun projet pour l'instant.</p>
        </div>
      ) : (
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-8 ${
          content?.columns === 2 ? 'lg:grid-cols-2' :
          content?.columns === 4 ? 'lg:grid-cols-4' :
          'lg:grid-cols-3' // Par défaut 3 colonnes
        }`}>
          {projects.map((project) => (
            <article key={project.slug || project.id} className="group">
              {project.image && (
                <Link href={`/work/${project.slug || project.id}`} className="block mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={project.image} 
                    alt={project.alt || project.title || 'Projet'} 
                    className="w-full object-cover rounded-lg"
                    style={{ aspectRatio: '2400 / 1800' }}
                  />
                </Link>
              )}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`${h3Classes}`}>
                    <Link href={`/work/${project.slug || project.id}`} className="hover:text-blue-600 transition-colors">
                      {project.title || 'Projet'}
                    </Link>
                  </h3>
                  {project.category && (
                    <small className="inline-block px-4 py-1.5 text-sm font-medium text-white bg-black rounded-full ml-4 whitespace-nowrap">{project.category}</small>
                  )}
                </div>
                {(project.excerpt || project.description) && (
                  <h4 className={`${h4Classes} line-clamp-3`}>{project.excerpt || project.description}</h4>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}


