import React from "react";
import { loadTemplateMetadata } from '@/lib/load-template-metadata';
import StudioClient from './studio-client';
import { notFound } from 'next/navigation';

export const runtime = "nodejs";

export default async function Studio() {
  // ✅ OPTIMISATION : Utiliser loadTemplateMetadata au lieu de readContent (41 MB → ~100 Ko)
  const content = await loadTemplateMetadata();
  const hidden = (content as any)?.pages?.hiddenSystem || [];
  if (hidden.includes('studio')) {
    notFound();
  }
  
  // Rendre directement le StudioClient sans passer par le layout normal
  return <StudioClient content={content.studio} />;
}
