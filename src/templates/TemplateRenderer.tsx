import { headers } from 'next/headers';
import GenericAutonomous from '@/templates/GenericAutonomous';
import PearlClient from '@/templates/pearl/pearl-client';
import StarterKitClient from '@/templates/Starter-Kit/Starter-Kit-client';
export async function TemplateRenderer({ keyName }: { keyName: string }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';

  switch (keyName) {
    case 'soliva':
      // Template Soliva original - utilise le layout par défaut
      return null;
    case 'pearl':
      return <PearlClient />;
    case 'Starter-Kit':
      return <StarterKitClient />;
    default:
      // Fallback: afficher un shell autonome générique (header/footer basiques)
      return <GenericAutonomous keyName={keyName} pathname={pathname} />;
  }
}
