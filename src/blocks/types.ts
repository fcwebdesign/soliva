export type BlockBase = { id: string; type: string };

export type H2Block = BlockBase & { type: 'h2'; content: string };
export type H3Block = BlockBase & { type: 'h3'; content: string };
export type ContentBlock = BlockBase & { type: 'content'; content: string };
export type ImageBlock = BlockBase & { 
  type: 'image'; 
  image?: { src: string; alt?: string };
};
export type CtaBlock = BlockBase & { 
  type: 'cta'; 
  ctaText?: string; 
  ctaLink?: string;
};
export type AboutBlock = BlockBase & { 
  type: 'about'; 
  title: string;
  content: string;
};

export type AnyBlock = H2Block | H3Block | ContentBlock | ImageBlock | CtaBlock | AboutBlock;

import React from 'react';

export type BlockComponent<P extends AnyBlock = AnyBlock> =
  (props: P) => React.JSX.Element | null; 