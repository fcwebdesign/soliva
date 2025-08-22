"use client";
import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import PreviewBar from "@/components/PreviewBar";

const MinimalistePremiumClient = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewId, setPreviewId] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Vérifier si on est en mode aperçu via l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const previewParam = urlParams.get('preview');
        
        let response;
        if (previewParam) {
          setIsPreviewMode(true);
          setPreviewId(previewParam);
          console.log('🔍 Mode aperçu détecté (minimaliste):', previewParam);
          
          // Ajouter la classe CSS pour le décalage
          document.documentElement.classList.add('preview-mode');
          
          // Charger le contenu de prévisualisation
          response = await fetch(`/api/admin/preview/${previewParam}`);
        } else {
          response = await fetch('/api/content');
        }
        
        const data = await response.json();
        console.log('📦 Contenu chargé (minimaliste):', data);
        console.log('🔍 Détails du contenu:', {
          hasHero: !!data.hero,
          hasFeatured: !!data.featured,
          hasWork: !!data.work,
          hasAbout: !!data.about,
          hasContact: !!data.contact,
          heroTitle: data.hero?.title,
          featuredImage: data.featured?.image,
          workProjects: data.work?.adminProjects?.length || data.work?.items?.length
        });
        setContent(data);
      } catch (error) {
        console.error('Erreur lors du chargement du contenu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
    
    // Cleanup function pour supprimer la classe
    return () => {
      document.documentElement.classList.remove('preview-mode');
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Chargement...</div>
      </div>
    );
  }

  // Données par défaut
  const data = {
    nav: content?.nav?.items?.map(item => ({
      label: content?.nav?.pageLabels?.[item] || item,
      href: `#${item}`
    })) || [
      { label: "Accueil", href: "#home" },
      { label: "Réalisations", href: "#work" },
      { label: "Studio", href: "#about" },
      { label: "Contact", href: "#contact" }
    ],
    hero: {
      title: content?.hero?.title || "Design minimal. Impact maximal.",
      subtitle: content?.hero?.subtitle || "Identités, sites et produits. Sobriété, précision, résultats."
    },
    featured: {
      src: content?.featured?.image || "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=2000&auto=format&fit=crop",
      alt: content?.featured?.alt || "Projet en vedette"
    },
    work: content?.work?.adminProjects?.map(item => ({
      title: item.title,
      kind: item.category || "Design",
      image: item.image || item.featuredImage,
      href: `/work/${item.slug}` || "#"
    })) || content?.work?.items?.map(item => ({
      title: item.title,
      kind: item.category || "Design",
      image: item.image || item.featuredImage,
      href: item.url || `/work/${item.slug}` || "#"
    })) || [
      {
        title: "Retail Flagship — Harrods",
        kind: "Spatial / Digital",
        image: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2000&auto=format&fit=crop"
      },
      {
        title: "Pop‑up — Prada Milano",
        kind: "Brand / Retail",
        image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=2000&auto=format&fit=crop"
      },
      {
        title: "Hospitality — Four Seasons",
        kind: "Experience / UX",
        image: "https://images.unsplash.com/photo-1516542076529-1ea3854896e1?q=80&w=2000&auto=format&fit=crop"
      },
      {
        title: "Workplace — Editorial Hub",
        kind: "Design System",
        image: "https://images.unsplash.com/photo-1513530176992-0cf39c4cbed4?q=80&w=2000&auto=format&fit=crop"
      }
    ],
    about: {
      title: content?.about?.title || "À propos",
      text: content?.about?.description || "Studio indépendant. Nous concevons des expériences sobres et utiles. Peu d'éléments, beaucoup d'impact. Chaque décision sert la lisibilité, la vitesse et la conversion."
    },
    cta: {
      text: content?.contact?.title || "Travaillons ensemble",
      emailLabel: content?.contact?.email || "hello@studio.fr",
      email: content?.contact?.email || "hello@studio.fr"
    }
  };

  return (
    <div className="font-sans bg-white text-gray-900">
      {isPreviewMode && <PreviewBar />}
      <style jsx global>{`
        :root {
          --bg: 255 255 255;
          --fg: 17 17 17;
          --muted: 106 106 106;
          --max: 1200px;
          --section: 160px;
        }
        html, body { 
          background: rgb(var(--bg)); 
          color: rgb(var(--fg)); 
        }
        * { 
          border-radius: 0; 
          box-shadow: none; 
        }
        .container { 
          width: 100%; 
          max-width: var(--max); 
          margin: 0 auto; 
          padding: 0 20px; 
        }
        .title { 
          font-family: ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif; 
        }
        .body { 
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif; 
        }
        .link { 
          text-decoration: underline; 
          text-underline-offset: 3px; 
          text-decoration-thickness: 1px; 
        }
      `}</style>
      
      <Nav items={data.nav} logo={content?.nav?.logo || "STUDIO"} />
      <Hero title={data.hero.title} subtitle={data.hero.subtitle} />
      <Featured src={data.featured.src} alt={data.featured.alt} />
      <WorkGrid items={data.work} />
      <TextBlock title={data.about.title} text={data.about.text} />
      <CTA text={data.cta.text} emailLabel={data.cta.emailLabel} email={data.cta.email} />
      <Footer socials={content?.footer?.socialLinks || content?.footer?.socials || []} />
    </div>
  );
};


function Nav({ items, logo }) {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-black/10">
      <div className="container h-[68px] flex items-center justify-between">
        <a href="#home" className="tracking-tight font-semibold">{logo}</a>
        <nav className="hidden md:flex items-center gap-10 text-sm text-black/70">
          {items.map((it) => (
            <a key={it.label} href={it.href} className="hover:text-black transition-colors">
              {it.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Hero({ title, subtitle }) {
  return (
    <section id="home" className="py-[calc(var(--section)*1.2)]">
      <div className="container">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.6 }} 
          className="title text-[clamp(48px,10vw,120px)] leading-[0.95] font-semibold tracking-tight"
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p 
            initial={{ y: 8, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2, duration: 0.6 }} 
            className="mt-6 max-w-[56ch] text-[15px] md:text-base text-black/65"
          >
            {subtitle}
          </motion.p>
        )}
        <div className="mt-10 flex items-center gap-6 text-sm">
          <a href="#work" className="link">Voir les projets</a>
          <a href="#contact" className="link">Parler d'un projet</a>
        </div>
      </div>
    </section>
  );
}

function Featured({ src, alt }) {
  return (
    <section aria-label="Featured" className="border-y border-black/5">
      <div className="container py-10 md:py-14">
        <div className="aspect-[21/9] w-full overflow-hidden">
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
}

function WorkGrid({ items }) {
  return (
    <section id="work" className="py-[var(--section)]">
      <div className="container">
        <div className="mb-12">
          <h2 className="title text-3xl md:text-5xl font-semibold tracking-tight">
            Travaux sélectionnés
          </h2>
          <p className="mt-2 text-black/60">Peu de pièces, beaucoup d'impact.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          {items.map((p) => (
            <a key={p.title} href={p.href || "#"} className="group">
              <div className="aspect-[16/10] overflow-hidden">
                <img 
                  src={p.image} 
                  alt={p.title} 
                  className="w-full h-full object-cover group-hover:opacity-95 transition" 
                />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <h3 className="title text-lg md:text-xl font-medium tracking-tight">
                  {p.title}
                </h3>
                <span className="text-sm text-black/50">{p.kind}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function TextBlock({ title, text }) {
  return (
    <section id="about" className="py-[var(--section)] border-t border-black/5">
      <div className="container grid md:grid-cols-12 gap-12 items-start">
        <div className="md:col-span-4">
          <h2 className="title text-2xl md:text-4xl font-semibold tracking-tight">
            {title}
          </h2>
        </div>
        <div className="md:col-span-8 text-black/70 leading-relaxed max-w-[68ch]">
          {text}
        </div>
      </div>
    </section>
  );
}

function CTA({ text, emailLabel, email }) {
  return (
    <section id="contact" className="py-[var(--section)] border-t border-black/5">
      <div className="container flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
        <h3 className="title text-3xl md:text-5xl font-semibold tracking-tight">
          {text}
        </h3>
        <a href={`mailto:${email}`} className="link text-[15px] md:text-base">
          {emailLabel}
        </a>
      </div>
    </section>
  );
}

function Footer({ socials }) {
  // Afficher tous les réseaux sociaux, même sans URL (permet au client de voir qu'ils existent)
  const validSocials = socials;
  
  return (
    <footer className="border-t border-black/5">
      <div className="container h-[80px] flex items-center justify-between text-sm text-black/60">
        <p>© {new Date().getFullYear()} Studio — Tous droits réservés</p>
        <div className="flex items-center gap-6">
          {validSocials.map((social, index) => (
            <a 
              key={index} 
              href={social.url || "#"} 
              target={social.target || "_blank"}
              className="hover:text-black transition-colors capitalize"
            >
              {social.platform}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

export default MinimalistePremiumClient; 