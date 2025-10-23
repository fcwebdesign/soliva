import React from "react";
import { readContent } from '@/lib/content';
import StudioClient from './studio-client';
import { notFound } from 'next/navigation';

export const runtime = "nodejs";

export default async function Studio() {
  const content = await readContent();
  const hidden = (content as any)?.pages?.hiddenSystem || [];
  if (hidden.includes('studio')) {
    notFound();
  }
  
  // Rendre directement le StudioClient sans passer par le layout normal
  return <StudioClient content={content.studio} />;
}
