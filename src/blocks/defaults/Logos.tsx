import React from 'react';
import type { BlockBase } from '../types';

interface LogosBlock extends BlockBase {
  type: 'logos';
  title?: string;
  logos: Array<{
    src?: string;
    image?: string;
    alt?: string;
    name?: string;
  }>;
}

export default function Logos({ title = "NOS CLIENTS", logos = [] }: LogosBlock) {
  return (
    <section className="logos-section py-32">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
          {logos.map((logo, index) => (
            <div key={index} className="logo-item flex items-center justify-center">
              <img 
                src={logo.src || logo.image} 
                alt={logo.alt || logo.name || `Logo client ${index + 1}`}
                className="max-w-full h-12 md:h-16 object-contain grayscale hover:grayscale-0 transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 