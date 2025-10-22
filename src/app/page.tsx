import React from "react";
import { readContent } from '@/lib/content';
import HomeClient from './home-client';

export default async function Home() {
  const content = await readContent();
  
  return <HomeClient content={content.home} />;
}


