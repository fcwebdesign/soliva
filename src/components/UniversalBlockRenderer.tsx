"use client";
import React from 'react';
import { useTemplate } from '@/templates/context';
import FormattedText from './FormattedText';
import HeroSignature from './HeroSignature';
import StorytellingSection from './StorytellingSection';
import MinimalisteHero from './MinimalisteHero';
import MinimalisteFeatured from './MinimalisteFeatured';
import HeroComplet from './HeroComplet';

interface Block {
  id: string;
  type: string;
  content?: string;
  image?: {
    src: string;
    alt?: string;
  };
  ctaText?: string;
  title?: string;
  subtitle?: string;
  text?: string;
  email?: string;
  emailLabel?: string;
  button1Text?: string;
  button1Link?: string;
  button2Text?: string;
  button2Link?: string;
  items?: Array<{
    title: string;
    kind: string;
    image: string;
    href: string;
  }>;
  [key: string]: any;
}

interface UniversalBlockRendererProps {
  blocks?: Block[];
  template?: string;
}

const UniversalBlockRenderer: React.FC<UniversalBlockRendererProps> = ({ blocks = [], template = 'default' }) => {
  const renderBlock = (block: Block) => {
    // Classes CSS conditionnelles selon le template
    const getTemplateClasses = (baseClass: string): string => {
      return `${baseClass} template-${template}`;
    };

    switch (block.type) {
      case 'content':
        return (
          <div key={block.id} className={getTemplateClasses("block-content")}>
            <FormattedText>
              {block.content}
            </FormattedText>
          </div>
        );
      
      case 'h2':
        return (
          <h2 key={block.id} className={getTemplateClasses("block-h2")}>
            {block.content}
          </h2>
        );
      
      case 'h3':
        return (
          <h3 key={block.id} className={getTemplateClasses("block-h3")}>
            {block.content}
          </h3>
        );
      
      case 'image':
        return (
          <div key={block.id} className={getTemplateClasses("block-image")}>
            <img 
              src={block.image?.src} 
              alt={block.image?.alt || ''} 
              className="w-full h-auto"
            />
          </div>
        );
      
      case 'cta':
        return (
          <div key={block.id} className={getTemplateClasses("block-cta")}>
            <button className="cta-button">
              {block.ctaText || block.content}
            </button>
          </div>
        );
      
      case 'hero-signature':
        return (
          <div key={block.id} className={getTemplateClasses("block-hero-signature")}>
            <HeroSignature block={block} />
          </div>
        );
      
      case 'storytelling':
        return (
          <div key={block.id} className={getTemplateClasses("block-storytelling")}>
            <StorytellingSection block={block} />
          </div>
        );
      
      // Blocs spécifiques au template minimaliste
      case 'hero-complet':
        return <HeroComplet key={block.id} content={block} />;
      
      case 'hero-minimaliste':
        return <MinimalisteHero key={block.id} content={block} />;
      
      case 'featured-minimaliste':
        return <MinimalisteFeatured key={block.id} content={block} />;
      

      
      case 'work-grid-minimaliste':
        return (
          <section key={block.id} id="work" className="py-[var(--section)]">
            <div className="container">
              <div className="mb-12">
                <h2 className="title text-3xl md:text-5xl font-semibold tracking-tight">
                  {block.title || "Travaux sélectionnés"}
                </h2>
                <p className="mt-2 text-black/60">{block.subtitle || "Peu de pièces, beaucoup d'impact."}</p>
              </div>
              <div className="grid md:grid-cols-2 gap-12">
                {(block.items || []).map((item: { title: string; kind: string; image: string; href: string }, index: number) => (
                  <a key={index} href={item.href || "#"} className="group">
                    <div className="aspect-[16/10] overflow-hidden">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:opacity-95 transition" 
                      />
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <h3 className="title text-lg md:text-xl font-medium tracking-tight">
                        {item.title}
                        </h3>
                      <span className="text-sm text-black/50">{item.kind}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        );
      
      case 'text-block-minimaliste':
        return (
          <section key={block.id} id="about" className="py-[var(--section)] border-t border-black/5">
            <div className="container grid md:grid-cols-12 gap-12 items-start">
              <div className="md:col-span-4">
                <h2 className="title text-2xl md:text-4xl font-semibold tracking-tight">
                  {block.title || "À propos"}
                </h2>
              </div>
              <div className="md:col-span-8 text-black/70 leading-relaxed max-w-[68ch]">
                <FormattedText>
                  {block.text || ''}
                </FormattedText>
              </div>
            </div>
          </section>
        );
      
      case 'cta-minimaliste':
        return (
          <section key={block.id} id="contact" className="py-[var(--section)] border-t border-black/5">
            <div className="container flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
              <h3 className="title text-3xl md:text-5xl font-semibold tracking-tight">
                {block.text || "Travaillons ensemble"}
              </h3>
              <a href={`mailto:${block.email || "hello@studio.fr"}`} className="link text-[15px] md:text-base">
                {block.emailLabel || block.email || "hello@studio.fr"}
              </a>
            </div>
          </section>
        );
      
      default:
        return (
          <div key={block.id} className={getTemplateClasses("block-unknown")}>
            <p>Type de bloc non reconnu: {block.type}</p>
          </div>
        );
    }
  };

  return (
    <div className={`blocks-container template-${template}`}>
      {blocks.map(renderBlock)}
    </div>
  );
};

export default UniversalBlockRenderer; 