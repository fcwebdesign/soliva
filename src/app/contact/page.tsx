import React from "react";
import { loadTemplateMetadata } from '@/lib/load-template-metadata';
import ContactClient from './contact-client';
import { notFound } from 'next/navigation';

export default async function Contact() {
  // ✅ OPTIMISATION : Utiliser loadTemplateMetadata au lieu de readContent (41 MB → ~100 Ko)
  const content = await loadTemplateMetadata();
  const hidden = (content as any)?.pages?.hiddenSystem || [];
  if (hidden.includes('contact')) {
    notFound();
  }
  
  return <ContactClient content={content.contact} />;
}
