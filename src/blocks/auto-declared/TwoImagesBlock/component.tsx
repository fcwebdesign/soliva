'use client';

import React, { useMemo } from 'react';
import { useContentUpdate } from '../../../hooks/useContentUpdate';

interface TwoImagesData {
  reversed?: boolean;
  leftImage?: {
    src?: string;
    alt?: string;
    aspectRatio?: string;
    alignHorizontal?: 'left' | 'center' | 'right';
    alignVertical?: 'top' | 'center' | 'bottom';
  };
  rightImage?: {
    src?: string;
    alt?: string;
    aspectRatio?: string;
    alignHorizontal?: 'left' | 'center' | 'right';
    alignVertical?: 'top' | 'center' | 'bottom';
  };
  theme?: 'light' | 'dark' | 'auto';
}

export default function TwoImagesBlock({ data }: { data: TwoImagesData | any }) {
  const blockData = useMemo(() => {
    return (data as any).data || data;
  }, [data]);
  
  useContentUpdate(() => {
    // Le useMemo se mettra à jour automatiquement
  });

  const leftImage = blockData.leftImage;
  const rightImage = blockData.rightImage;

  // Si aucune image, afficher un placeholder
  if (!leftImage?.src && !rightImage?.src) {
    return (
      <div className="block-two-images p-4 bg-gray-100 border border-gray-300 rounded text-center text-gray-500">
        Aucune image
      </div>
    );
  }

  const isReversed = blockData.reversed || false;
  // L'image de droite doit toujours être petite
  // Normal : gauche = leftImage (petite), droite = rightImage (grande)
  // Inversé : droite = rightImage (petite), gauche = leftImage (grande)
  const firstImage = isReversed ? rightImage : leftImage; // Toujours la petite
  const secondImage = isReversed ? leftImage : rightImage; // Toujours la grande
  const firstIsSmall = true; // La première est toujours la petite
  const firstColOrder = isReversed ? 'md:order-2' : 'md:order-1';
  const secondColOrder = isReversed ? 'md:order-1' : 'md:order-2';
  

  return (
    <section 
      className="block-two-images-section" 
      data-block-type="two-images" 
      data-block-theme={blockData.theme || 'auto'}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start min-h-0">
        {/* Première image (gauche si normal, droite si inversé) - TOUJOURS LA PETITE */}
        {firstImage?.src && (() => {
          // Récupérer les données de la bonne image selon l'inversion
          const imageData = isReversed ? blockData.rightImage : blockData.leftImage;
          const getImageStyle = () => {
            if (!imageData?.aspectRatio || imageData.aspectRatio === 'auto') {
              return { className: 'w-full md:max-w-sm h-auto object-contain' };
            }
            // Convertir le ratio en valeur CSS (ex: '16:9' -> '16/9')
            const ratio = imageData.aspectRatio.replace(':', '/');
            return {
              className: 'w-full md:max-w-sm object-cover',
              style: { aspectRatio: ratio }
            };
          };
          const imageStyle = getImageStyle();
          
          // La première image est TOUJOURS la petite
          // SOLUTION SIMPLE : Toujours centrer la petite image
          const justifyClass = 'justify-center';
          
          const verticalAlign = imageData?.alignVertical ?? 'center';
          const itemsClass = 
            verticalAlign === 'top' ? 'items-start' :
            verticalAlign === 'center' ? 'items-center' :
            'items-end';
          
          
          return (
            <div className={`flex ${itemsClass} ${justifyClass} w-full h-full ${firstColOrder}`}>
              <img 
                src={firstImage.src} 
                alt={firstImage.alt || ''} 
                className={imageStyle.className}
                style={imageStyle.style}
                loading="lazy"
              />
            </div>
          );
        })()}

        {/* Deuxième image (droite si normal, gauche si inversé) */}
        {secondImage?.src && (() => {
          // Récupérer les données de la bonne image selon l'inversion
          const imageData = isReversed ? blockData.leftImage : blockData.rightImage;
          const getImageStyle = () => {
            if (!imageData?.aspectRatio || imageData.aspectRatio === 'auto') {
              return { className: 'w-full h-auto object-contain' };
            }
            // Convertir le ratio en valeur CSS (ex: '16:9' -> '16/9')
            const ratio = imageData.aspectRatio.replace(':', '/');
            return {
              className: 'w-full object-cover',
              style: { aspectRatio: ratio }
            };
          };
          const imageStyle = getImageStyle();
          
          // Appliquer les alignements (toujours appliqués avec valeurs par défaut)
          const horizontalAlign = imageData?.alignHorizontal ?? 'center';
          const justifyClass = 
            horizontalAlign === 'left' ? 'justify-start' :
            horizontalAlign === 'center' ? 'justify-center' :
            'justify-end';
          
          const verticalAlign = imageData?.alignVertical ?? 'center';
          const itemsClass = 
            verticalAlign === 'top' ? 'items-start' :
            verticalAlign === 'center' ? 'items-center' :
            'items-end';
          
          return (
            <div className={`flex ${itemsClass} ${justifyClass} w-full h-full ${secondColOrder}`}>
              <img 
                src={secondImage.src} 
                alt={secondImage.alt || ''} 
                className={imageStyle.className}
                style={imageStyle.style}
                loading="lazy"
              />
            </div>
          );
          
          return (
            <div className={`flex items-center justify-center w-full ${secondColOrder}`}>
              <img 
                src={secondImage.src} 
                alt={secondImage.alt || ''} 
                className={imageStyle.className}
                style={imageStyle.style}
                loading="lazy"
              />
            </div>
          );
        })()}
      </div>
    </section>
  );
}
