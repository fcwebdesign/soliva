"use client";
import { motion } from "framer-motion";
import Image from 'next/image';

interface HeroCompletProps {
  content: {
    title?: string;
    subtitle?: string;
    button1Text?: string;
    button1Link?: string;
    button2Text?: string;
    button2Link?: string;
    image?: {
      src: string;
      alt?: string;
    };
  };
}

const HeroComplet: React.FC<HeroCompletProps> = ({ content }) => {
  // Debug: log des données reçues
  console.log('🎯 HeroComplet: Données reçues', content);

  return (
    <>
      {/* Section Hero */}
      <section id="home" className="pt-[calc(var(--section)*1.2)] pb-0">
        <div className="container">
          {/* Titre */}
          {content?.title && (
            <motion.h1 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ duration: 0.6 }} 
              className="title text-[clamp(48px,10vw,120px)] leading-[0.95] font-semibold tracking-tight"
            >
              {content.title}
            </motion.h1>
          )}
          
          {/* Sous-titre */}
          {content?.subtitle && (
            <motion.p 
              initial={{ y: 8, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              transition={{ delay: 0.2, duration: 0.6 }} 
              className="mt-6 max-w-[56ch] text-[15px] md:text-base text-black/65"
            >
              {content.subtitle}
            </motion.p>
          )}
          
          {/* Boutons */}
          {(content?.button1Text || content?.button2Text) && (
            <div className="mt-10 flex items-center gap-6 text-sm">
              {content?.button1Text && (
                <a href={content.button1Link || "#"} className="link">
                  {content.button1Text}
                </a>
              )}
              {content?.button2Text && (
                <a href={content.button2Link || "#"} className="link">
                  {content.button2Text}
                </a>
              )}
            </div>
          )}
        </div>
      </section>
      
      {/* Section Image séparée */}
      {content?.image?.src && (
        <section aria-label="Featured" className="border-y border-black/5">
          <div className="container py-10 md:py-14">
            <div className="aspect-[21/9] w-full overflow-hidden">
              <Image 
                src={content.image.src} 
                alt={content.image.alt || ""} 
                width={2000}
                height={857}
                className="w-full h-full object-cover"
                priority
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default HeroComplet;
