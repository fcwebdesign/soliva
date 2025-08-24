import React from 'react';
import type { ServiceOfferingBlock } from '../types';

export default function ServiceOffering({ title, description, icon }: ServiceOfferingBlock) {
  return (
    <div className="service-offering-block border-b border-black/10 py-8 last:border-b-0">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Colonne de gauche - Titre */}
        <div className="md:col-span-7">
          {icon && (
            <div className="mb-2">
              <span className="text-blue-400 text-lg">{icon}</span>
            </div>
          )}
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
            {title}
          </h3>
        </div>
        
        {/* Colonne de droite - Description */}
        <div className="md:col-span-5 flex justify-end">
          <p className="max-w-[68ch]">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
} 