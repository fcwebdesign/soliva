import React from 'react';
import Image from 'next/image';

interface LogosData {
  title?: string;
  theme?: 'light' | 'dark' | 'auto';
  logos: Array<{
    src?: string;
    image?: string;
    alt?: string;
    name?: string;
  }>;
}

export default function LogosBlock({ data }: { data: LogosData }) {
  const { title = "NOS CLIENTS", logos = [] } = data;
  
  return (
    <section className="logos-section py-28" data-block-type="logos" data-block-theme={data.theme || 'auto'}>
      <div className="container mx-auto">
        {/* Titre de la section */}
        {title && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {title}
            </h2>
          </div>
        )}
        
        {/* Grille des logos clients */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 justify-items-center">
          {logos.map((logo, index) => (
            <div key={index} className="logo-item">
              <Image
                src={logo.src || logo.image}
                alt={logo.alt || logo.name || `Logo client ${index + 1}`}
                width={120}
                height={60}
                className="w-full h-auto object-contain"
                placeholder="blur"
                blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
