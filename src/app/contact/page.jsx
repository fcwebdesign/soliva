import { readContent } from '@/lib/content';
import ContactClient from './contact-client';

export const runtime = "nodejs";

export default async function Contact() {
  const content = await readContent();
  
  return <ContactClient content={content.contact} />;
}
