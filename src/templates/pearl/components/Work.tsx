"use client";
import React from 'react';
import Link from 'next/link';

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

export default function WorkPearl({ content }: { content?: { hero?: { title?: string; subtitle?: string }; description?: string; projects?: Project[]; adminProjects?: Project[] } }) {
  const title = content?.hero?.title || 'Réalisations';
  const subtitle = content?.hero?.subtitle || content?.description || '';
  const projectsFromProjects: Project[] = Array.isArray(content?.projects) ? (content?.projects as Project[]) : [];
  const projectsFromAdmin: Project[] = Array.isArray((content as any)?.adminProjects) ? ((content as any)?.adminProjects as Project[]) : [];
  const projects: Project[] = projectsFromProjects.length > 0 ? projectsFromProjects : projectsFromAdmin;

  return (
    <section>
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-3 text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Aucun projet pour l’instant.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <article key={project.slug || project.id} className="group border border-gray-200 rounded-xl overflow-hidden hover:shadow-sm transition-shadow">
              {project.image && (
                <Link href={`/work/${project.slug || project.id}`} className="block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={project.image} alt={project.alt || project.title || 'Projet'} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
                </Link>
              )}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700">
                  <Link href={`/work/${project.slug || project.id}`} className="hover:text-blue-600 transition-colors">
                    {project.title || 'Projet'}
                  </Link>
                </h3>
                {(project.excerpt || project.description) && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">{project.excerpt || project.description}</p>
                )}
                {project.category && (
                  <span className="inline-block mt-3 text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{project.category}</span>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}


