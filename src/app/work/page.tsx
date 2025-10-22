import { readContent } from '@/lib/content';
import WorkClient from './work-client';

export const runtime = "nodejs";

export default async function Work(): Promise<React.JSX.Element> {
  const content = await readContent();
  
  return <WorkClient content={content.work} />;
}
