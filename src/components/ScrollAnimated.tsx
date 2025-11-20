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
  enabled = true
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useScrollAnimation(ref, {
    config: animationConfig,
    blockType,
    enabled,
    content
  });

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
};

export default ScrollAnimated;

