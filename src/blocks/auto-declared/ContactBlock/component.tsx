import React from 'react';

interface ContactData {
  title?: string;
  ctaText?: string;
  ctaLink?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export default function ContactBlock({ data }: { data: ContactData }) {
  const { title, ctaText, ctaLink } = data;
  
  if (!title && !ctaText && !ctaLink) {
    return null;
  }

  return (
    <section 
      className="contact-section py-28" 
      data-block-type="contact" 
      data-block-theme={data.theme || 'auto'}
    >
      <div className="container mx-auto border border-black/20 dark:border-white/20 p-8">
        <div className="flex justify-between items-center">
          {/* Titre de la section */}
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-black dark:text-white">
              {title}
            </h2>
          )}
          
          {/* Bouton CTA */}
          {ctaText && ctaLink && (
            <a 
              href={ctaLink}
              className="inline-flex items-center px-6 py-3 font-medium text-sm transition-all duration-300 contact-button"
            >
              {ctaText}
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
