"use client";
import React, { useRef } from 'react';
import { useScrollAnimation, AnimationConfig } from '@/hooks/useScrollAnimation';

interface ScrollAnimatedProps {
  children: React.ReactNode;
  blockType?: string;
  animationConfig?: AnimationConfig;
  className?: string;
  content?: any;
  enabled?: boolean;
  /** Si true, applique l'animation uniquement sur les enfants, pas sur le wrapper (utile pour les blocs avec pin) */
  animateChildrenOnly?: boolean;
}

/**
 * Composant wrapper pour appliquer automatiquement les animations de scroll
 * Utilise la configuration depuis metadata.scrollAnimations
 */
export const ScrollAnimated: React.FC<ScrollAnimatedProps> = ({
  children,
  blockType,
  animationConfig,
  className = '',
  content,
  enabled = true,
  animateChildrenOnly = false
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useScrollAnimation(ref, {
    config: animationConfig,
    blockType,
    enabled,
    content,
    animateChildrenOnly
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ScrollAnimated;

