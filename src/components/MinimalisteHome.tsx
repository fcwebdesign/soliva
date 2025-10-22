"use client";
import React from "react";
import { motion } from "framer-motion";

interface Project {
  id: string;
  title: string;
  slug?: string;
  category?: string;
  status: string;
  image?: {
    src: string;
  };
  featuredImage?: string;
  coverImage?: string;
}

interface MinimalisteHomeProps {
  content: {
    nav?: {
      logo?: string;
      items?: string[];
      pageLabels?: Record<string, string>;
    };
    hero?: {
      title?: string;
      subtitle?: string;
      button1Text?: string;
      button1Link?: string;
      button2Text?: string;
      button2Link?: string;
    };
    featured?: {
      src?: string;
      alt?: string;
    };
    work?: {
      title?: string;
      subtitle?: string;
    };
    about?: {
      title?: string;
      text?: string;
    };
    cta?: {
      text?: string;
      emailLabel?: string;
      email?: string;
    };
    home?: {
      selectedProjects?: string[];
    };
    selectedProjects?: string[];
  };
  workProjects?: Project[];
}

const Tokens: React.FC = () => (
  <style>{`
    :root {
      --bg: 255 255 255;
      --fg: 17 17 17;
      --muted: 106 106 106;
      --max: 1200px;
      --section: 160px;
    }
    html, body { background: rgb(var(--bg)); color: rgb(var(--fg)); }
    * { border-radius: 0; box-shadow: none; }
    .container { width: 100%; max-width: var(--max); margin: 0 auto; padding: 0 20px; }
    .title { font-family: ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif; }
    .body { font-family: Inter, ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif; }
    .link { text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 1px; }
  `}</style>
);

interface HeroProps {
  title: string;
  subtitle?: string;
  button1Text?: string;
  button1Link?: string;
  button2Text?: string;
  button2Link?: string;
}

function Hero({ title, subtitle, button1Text, button1Link, button2Text, button2Link }: HeroProps) {
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
          <motion.div 
            initial={{ y: 8, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2, duration: 0.6 }} 
            className="mt-6 text-black/70 leading-relaxed max-w-[68ch]"
            dangerouslySetInnerHTML={{ __html: subtitle }}
          />
        )}
        <div className="mt-10 flex items-center gap-6 text-sm">
          {button1Text && (
            <a href={button1Link || "#work"} className="link">{button1Text}</a>
          )}
          {button2Text && (
            <a href={button2Link || "#contact"} className="link">{button2Text}</a>
          )}
        </div>
      </div>
    </section>
  );
}

interface FeaturedProps {
  src?: string;
  alt?: string;
}

function Featured({ src, alt }: FeaturedProps) {
  if (!src) return null;
  
  return (
    <section aria-label="Featured" className="border-y border-black/5">
      <div className="container py-10 md:py-14">
        <div className="aspect-[21/9] w-full overflow-hidden">
          <img src={src} alt={alt || "Image vedette"} className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
}

interface WorkItem {
  title: string;
  kind: string;
  image: string;
  href: string;
}

interface WorkGridProps {
  items: WorkItem[];
  title: string;
  subtitle: string;
}

function WorkGrid({ items, title, subtitle }: WorkGridProps) {
  if (!items || items.length === 0) return null;
  
  return (
    <section id="work" className="py-[var(--section)]">
      <div className="container">
        <div className="mb-12">
          <h2 className="title text-3xl md:text-5xl font-semibold tracking-tight">{title}</h2>
          <p className="mt-2 text-black/60">{subtitle}</p>
        </div>
        <div className="grid md:grid-cols-2 gap-12">
          {items.map((p, index) => (
            <a key={p.title || index} href={p.href || "#"} className="group">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={p.image} alt={p.title} className="w-full h-full object-cover group-hover:opacity-95 transition" />
              </div>
              <div className="mt-4 flex items-center justify-between">
                <h3 className="title text-lg md:text-xl font-medium tracking-tight">{p.title}</h3>
                <span className="text-sm text-black/50">{p.kind}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

interface TextBlockProps {
  title?: string;
  text?: string;
}

function TextBlock({ title, text }: TextBlockProps) {
  if (!title && !text) return null;
  
  return (
    <section id="about" className="py-[var(--section)] border-t border-black/5">
      <div className="container grid md:grid-cols-12 gap-12 items-start">
        {title && (
          <div className="md:col-span-4">
            <h2 className="title text-2xl md:text-4xl font-semibold tracking-tight">{title}</h2>
          </div>
        )}
        {text && (
          <div 
            className={`${title ? 'md:col-span-8' : 'md:col-span-12'} text-black/70 leading-relaxed max-w-[68ch]`}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        )}
      </div>
    </section>
  );
}

interface CTAProps {
  text?: string;
  emailLabel?: string;
  email?: string;
}

function CTA({ text, emailLabel, email }: CTAProps) {
  if (!text && !email) return null;
  
  return (
    <section id="contact" className="py-[var(--section)] border-t border-black/5">
      <div className="container flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
        {text && (
          <h3 className="title text-3xl md:text-5xl font-semibold tracking-tight">
            {text}
          </h3>
        )}
        {email && (
          <a href={`mailto:${email}`} className="link text-[15px] md:text-base">{emailLabel || email}</a>
        )}
      </div>
    </section>
  );
}

const MinimalisteHome: React.FC<MinimalisteHomeProps> = ({ content, workProjects = [] }) => {
  // Utiliser les projets passés en props - corriger le chemin d'accès
  const selectedProjectIds = content?.home?.selectedProjects || content?.selectedProjects || [];
  
  console.log('🔍 MinimalisteHome Debug:', {
    workProjects: workProjects.length,
    selectedProjectIds,
    content: content?.home,
    firstProject: workProjects[0]
  });
  
  // Utiliser les projets sélectionnés ou tous les projets publiés par défaut
  const projects = selectedProjectIds.length > 0
    ? workProjects
        .filter(project => selectedProjectIds.includes(project.id) && project.status === 'published')
        .slice(0, 4)
    : workProjects
        .filter(project => project.status === 'published')
        .slice(0, 4);
  
  console.log('🔍 Projets filtrés:', projects.length);
  
  const mappedProjects: WorkItem[] = projects.map(project => {
    console.log('🔍 Projet debug:', project);
    
    // Essayer différentes propriétés pour l'image
    let imageUrl: string = project.image?.src || 
                   project.featuredImage || 
                   (typeof project.image === 'string' ? project.image : '') ||
                   project.coverImage ||
                   "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=2000&auto=format&fit=crop";
    
    return {
      title: project.title,
      kind: project.category || "Projet",
      image: imageUrl,
      href: `/work/${project.slug || project.id || 'projet'}`
    };
  });

  console.log('🔍 Projets mappés:', mappedProjects);

  return (
    <div className="body">
      <Tokens />
      
      {/* Header minimaliste */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-black/10">
        <div className="container h-[68px] flex items-center justify-between">
          <a href="/" className="tracking-tight font-semibold">
            {content?.nav?.logo || "STUDIO"}
          </a>
          <nav className="hidden md:flex items-center gap-10 text-sm text-black/70">
            {(content?.nav?.items || ['home', 'work', 'studio', 'contact']).map((item) => {
              const label = content?.nav?.pageLabels?.[item] || item;
              const href = item === 'home' ? '/' : `/${item}`;
              return (
                <a key={item} href={href} className="hover:text-black transition-colors">
                  {label}
                </a>
              );
            })}
          </nav>
        </div>
      </header>
      
      <Hero 
        title={content?.hero?.title || "Design minimal. Impact maximal."}
        subtitle={content?.hero?.subtitle || "Identités, sites et produits. Sobriété, précision, résultats."}
        button1Text={content?.hero?.button1Text || "Voir les projets"}
        button1Link={content?.hero?.button1Link || "#work"}
        button2Text={content?.hero?.button2Text || "Parler d'un projet"}
        button2Link={content?.hero?.button2Link || "#contact"}
      />
      <Featured 
        src={content?.featured?.src} 
        alt={content?.featured?.alt || "Projet en vedette"} 
      />
      <WorkGrid 
        items={mappedProjects}
        title={content?.work?.title || "Travaux sélectionnés"}
        subtitle={content?.work?.subtitle || "Peu de pièces, beaucoup d'impact."}
      />
      <TextBlock 
        title={content?.about?.title || "À propos"} 
        text={content?.about?.text || "Studio indépendant. Nous concevons des expériences sobres et utiles. Peu d'éléments, beaucoup d'impact. Chaque décision sert la lisibilité, la vitesse et la conversion."} 
      />
      <CTA 
        text={content?.cta?.text || "Travaillons ensemble"} 
        emailLabel={content?.cta?.emailLabel || "hello@studio.fr"} 
        email={content?.cta?.email || "hello@studio.fr"} 
      />
    </div>
  );
};

export default MinimalisteHome;
