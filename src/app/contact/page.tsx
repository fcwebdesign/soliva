import React from "react";
import { readContent } from '@/lib/content';
import ContactClient from './contact-client';
import { notFound } from 'next/navigation';

export default async function Contact() {
  const content = await readContent();
  const hidden = (content as any)?.pages?.hiddenSystem || [];
  if (hidden.includes('contact')) {
    notFound();
  }
  
  return <ContactClient content={content.contact} />;
}
