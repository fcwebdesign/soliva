import { readContent } from '@/lib/content';
import HomeClient from './home-client';

export const runtime = "nodejs";

export default async function Home() {
  const content = await readContent();
  
  return <HomeClient content={content.home} />;
}


