"use client";
import { useState, useEffect, use } from "react";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";
import { notFound } from "next/navigation";
import FormattedText from "@/components/FormattedText";
import PreviewBar from "@/components/PreviewBar";
import BlockRenderer from "@/components/BlockRenderer";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ProjectPage = ({ params }) => {
  const resolvedParams = use(params);
  const router = useTransitionRouter();
  useTransition(); // Utilise la configuration de transition

  // Vérifier si on est en mode aperçu via l'URL
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewId, setPreviewId] = useState(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const previewParam = urlParams.get('preview');
    
    if (previewParam) {
      setIsPreviewMode(true);
      setPreviewId(previewParam);
      console.log('🔍 Mode aperçu détecté (projet):', previewParam);
    }
  }, []);

  // Décaler tout le site en mode aperçu (comme WordPress)
  useEffect(() => {
    if (isPreviewMode) {
      document.documentElement.classList.add('preview-mode');
      return () => {
        document.documentElement.classList.remove('preview-mode');
      };
    }
  }, [isPreviewMode]);

  // Même logique que le Nav pour l'animation du cercle
  const isSafari = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("safari") && !ua.includes("chrome");
  };

  const isBasicTransition = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("firefox") || isSafari();
  };

  function triggerPageTransition(path) {
    if (isBasicTransition()) {
      const curtain = document.getElementById("curtain");
      if (!curtain) return;

      curtain.style.transform = "translateY(0%)";

      const delay = isSafari() ? 1000 : 600;

      setTimeout(() => {
        router.push(path);
      }, delay);

      return;
    }

    // Chrome → animation native via clipPath avec cercle
    document.documentElement.animate(
      [
        {
          // Étape 1 : cercle très petit au centre
          clipPath: "circle(0% at 50% 50%)"
        },
        {
          // Étape 2 : cercle qui s'agrandit pour couvrir tout l'écran
          clipPath: "circle(150% at 50% 50%)",
        },
      ],
      {
        duration: 2000,
        easing: "cubic-bezier(0.9, 0, 0.1, 1)",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  }

  const handleBackClick = (e) => {
    e.preventDefault();

    if (isBasicTransition()) {
      triggerPageTransition("/work");
    } else {
      router.push("/work", {
        onTransitionReady: () => triggerPageTransition("/work"),
      });
    }
  };

  useGSAP(() => {
    // Animation du titre avec SplitText (comme selected work)
    const splitText = SplitText.create("h1", {
      type: "words",
      wordsClass: "word",
      mask: "words",
    });

    gsap.set(splitText.words, { y: "110%" });

    // Délai ajusté selon le mode de transition
    const delay = TRANSITION_CONFIG.mode === 'circle' ? 1.15 : 1.75;

    gsap.to(splitText.words, {
      y: "0%",
      duration: 1.5,
      stagger: 0.25,
      delay: delay,
      ease: "power4.out",
    });

    // Animation progressive du contenu
    gsap.fromTo(".project-content > *", 
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        stagger: 0.2,
        delay: 0.5,
        ease: "power2.out" 
      }
    );
  }, {});

  // Récupérer les données du projet
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const fetchProject = async () => {
    try {
      // Si on est en mode aperçu, charger la révision temporaire
      if (isPreviewMode && previewId) {
        console.log('📖 Chargement de la révision temporaire (projet):', previewId);
        
        const response = await fetch(`/api/admin/preview/${previewId}`, {
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        });
        
        if (response.ok) {
          const previewContent = await response.json();
          console.log('📖 Contenu de prévisualisation reçu:', {
            hasWork: !!previewContent.work,
            hasProjects: !!previewContent.work?.projects,
            projectsCount: previewContent.work?.projects?.length || 0,
            projects: previewContent.work?.projects?.map(p => ({ title: p.title, slug: p.slug }))
          });
          
          const foundProject = previewContent.work?.projects?.find(p => p.slug === resolvedParams.slug);
          
          if (foundProject) {
            console.log('✅ Projet de prévisualisation chargé:', {
              title: foundProject.title,
              slug: foundProject.slug,
              hasContent: !!foundProject.content,
              contentLength: foundProject.content?.length || 0,
              contentPreview: foundProject.content?.substring(0, 100)
            });
            setProject(foundProject);
            setLoading(false);
            return;
          } else {
            console.warn('⚠️ Projet non trouvé dans la prévisualisation:', resolvedParams.slug);
          }
        } else {
          console.warn('⚠️ Révision temporaire non trouvée, chargement normal');
        }
      }
      
      // Sinon, charger normalement depuis l'API
      const response = await fetch('/api/content', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      const content = await response.json();
      
      // Chercher d'abord dans adminProjects (avec blocs), puis dans projects (fallback)
      let foundProject = content.work?.adminProjects?.find(p => p.slug === resolvedParams.slug);
      
      if (!foundProject) {
        // Fallback vers les projets publics
        foundProject = content.work?.projects?.find(p => p.slug === resolvedParams.slug);
      }
      
      if (!foundProject) {
        notFound();
      }
      
      console.log('🔍 Projet trouvé:', {
        title: foundProject.title,
        slug: foundProject.slug,
        hasContent: !!foundProject.content,
        hasDescription: !!foundProject.description,
        hasBlocks: !!foundProject.blocks,
        blocksCount: foundProject.blocks?.length || 0,
        contentLength: foundProject.content?.length || 0,
        contentPreview: foundProject.content?.substring(0, 100),
        descriptionPreview: foundProject.description?.substring(0, 100)
      });
      
      setProject(foundProject);
    } catch (error) {
      console.error('Erreur lors du chargement du projet:', error);
      notFound();
    } finally {
      setLoading(false);
    }
  };

    fetchProject();
  }, [resolvedParams.slug, isPreviewMode, previewId]);

  if (loading) {
    return (
      <div className="project-page">
        <div className="col">
          <div className="loading">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!project) {
    notFound();
  }

  // Vérifier si le projet est publié ou si on est en mode aperçu
  if (!isPreviewMode && project.status && project.status !== 'published') {
    return <div>Ce projet n'est pas encore publié</div>;
  }

  return (
    <>
      <ReactLenis root>
        {/* Div revealer seulement en mode curtain */}
        {TRANSITION_CONFIG.mode === 'curtain' && <div className="revealer"></div>}
        
        {/* Bandeau d'aperçu */}
        {isPreviewMode && <PreviewBar />}
        
        <div className="project-page">
          <div className="col">
            <div className="work-header-section sticky top-32">
              <h1 className="work-header">{project.title}</h1>
              <div className="project-meta">
                <div className="project-category">
                  <h3>Catégorie</h3>
                  <p>{project.category}</p>
                </div>
                <div className="project-slug">
                  <h3>Slug</h3>
                  <p>{project.slug}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="col">
            <div className="project-content">
              {/* Image du projet */}
              {project.image && (
                <div className="project-image mb-8">
                  <img src={project.image} alt={project.alt || project.title} className="w-full h-auto rounded-lg" />
                </div>
              )}
              
              {/* Contenu principal : blocs scalables ou fallback HTML */}
              {project.blocks && project.blocks.length > 0 ? (
                <div className="project-blocks">
                  <BlockRenderer blocks={project.blocks} />
                </div>
              ) : project.content || project.description ? (
                /* Fallback vers le content HTML si pas de blocs */
                <div className="project-description">
                  <h2>Description</h2>
                  <FormattedText>{project.content || project.description}</FormattedText>
                </div>
              ) : (
                <div className="project-description">
                  <p>Ce projet n'a pas encore de contenu.</p>
                </div>
              )}
              
              {/* Navigation */}
              <div className="project-navigation mt-8">
                <a href="/work" onClick={handleBackClick} className="back-link">
                  ← Retour aux réalisations
                </a>
              </div>
            </div>
          </div>
        </div>
      </ReactLenis>
    </>
  );
};

export default ProjectPage; 