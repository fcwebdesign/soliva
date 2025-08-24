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
        <div className={(() => {
          const selectedCount = selectedProjects?.length || 0;
          if (selectedCount === 1) {
            return "grid grid-cols-1 gap-8"; // Fullscreen
          } else if (selectedCount === 2) {
            return "grid grid-cols-1 md:grid-cols-2 gap-8"; // 2 colonnes
          } else {
            return "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"; // 3 colonnes
          }
        })()}>
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
      </div>
    </section>
  );
} 