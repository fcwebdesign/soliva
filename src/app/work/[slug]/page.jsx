"use client";
import { useState, useEffect, use } from "react";
import { useGSAP } from "@gsap/react";
import { useTransitionRouter } from "next-view-transitions";
import { useTransition } from "@/hooks/useTransition";
import { TRANSITION_CONFIG } from "@/config";
import { notFound } from "next/navigation";
import FormattedText from "@/components/FormattedText";

import gsap from "gsap";
import SplitText from "gsap/SplitText";
import ReactLenis from "lenis/react";

gsap.registerPlugin(SplitText);

const ProjectPage = ({ params }) => {
  const resolvedParams = use(params);
  const router = useTransitionRouter();
  useTransition(); // Utilise la configuration de transition

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
        const response = await fetch('/api/content');
        const content = await response.json();
        
        const foundProject = content.work.projects.find(p => p.slug === resolvedParams.slug);
        
        if (!foundProject) {
          notFound();
        }
        
        setProject(foundProject);
      } catch (error) {
        console.error('Erreur lors du chargement du projet:', error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [resolvedParams.slug]);

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

  return (
    <>
      <ReactLenis root>
        {/* Div revealer seulement en mode curtain */}
        {TRANSITION_CONFIG.mode === 'curtain' && <div className="revealer"></div>}
        
        <div className="project-page">
          <div className="col">
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
          <div className="col">
            <div className="project-content">
              <div className="project-image">
                <img src={project.image} alt={project.alt} />
              </div>
              
              <div className="project-description">
                <h2>Description</h2>
                <FormattedText>{project.description}</FormattedText>
              </div>
              
              <div className="project-navigation">
                <a href="/work" onClick={handleBackClick} className="back-link">
                  ← Back to Selected Work
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