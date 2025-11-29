'use client';

import React from 'react';

export interface ImageData {
  src: string;
  alt?: string;
  aspectRatio?: string; // 'auto' | '1:1' | '16:9' | etc.
}

interface ReusableImageProps {
  /** Données de l'image */
  image: ImageData;
  /** Classes CSS supplémentaires pour le conteneur */
  containerClassName?: string;
  /** Classes CSS supplémentaires pour l'image */
  imageClassName?: string;
  /** Style inline pour le conteneur */
  containerStyle?: React.CSSProperties;
  /** Style inline pour l'image */
  imageStyle?: React.CSSProperties;
  /** Alignement horizontal du conteneur */
  alignHorizontal?: 'left' | 'center' | 'right';
  /** Alignement vertical du conteneur */
  alignVertical?: 'top' | 'center' | 'bottom';
  /** Loading strategy */
  loading?: 'lazy' | 'eager';
  /** Priorité de chargement */
  fetchPriority?: 'high' | 'low' | 'auto';
}

/**
 * Composant réutilisable pour afficher une image avec gestion de l'aspect ratio
 * Utilisé dans tous les blocs pour garantir une présentation cohérente
 */
export default function ReusableImage({
  image,
  containerClassName = '',
  imageClassName = '',
  containerStyle,
  imageStyle,
  alignHorizontal = 'center',
  alignVertical = 'center',
  loading = 'lazy',
  fetchPriority = 'auto',
}: ReusableImageProps) {
  if (!image?.src) {
    return null;
  }

  // Calculer le style selon le ratio d'aspect
  const getImageStyle = () => {
    const baseStyle = imageStyle || {};
    
    if (!image.aspectRatio || image.aspectRatio === 'auto') {
      return {
        className: `w-full h-auto object-contain ${imageClassName}`,
        style: baseStyle,
      };
    }
    
    // Convertir le ratio en valeur CSS (ex: '16:9' -> '16/9')
    const ratio = image.aspectRatio.replace(':', '/');
    return {
      className: `w-full object-cover ${imageClassName}`,
      style: {
        ...baseStyle,
        aspectRatio: ratio,
      },
    };
  };

  const imageStyleResult = getImageStyle();
  
  // Classes d'alignement pour le conteneur
  const justifyClass = 
    alignHorizontal === 'left' ? 'justify-start' :
    alignHorizontal === 'center' ? 'justify-center' :
    'justify-end';
  
  const itemsClass = 
    alignVertical === 'top' ? 'items-start' :
    alignVertical === 'center' ? 'items-center' :
    'items-end';

  return (
    <div 
      className={`flex ${itemsClass} ${justifyClass} w-full ${containerClassName}`}
      style={containerStyle}
    >
      <img 
        src={image.src} 
        alt={image.alt || ''} 
        className={imageStyleResult.className}
        style={imageStyleResult.style}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
      />
    </div>
  );
}

