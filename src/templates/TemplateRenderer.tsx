import { headers } from 'next/headers';
import StarterApp from '@/templates/starter/StarterApp';
import PraxisClient from '@/templates/praxis/praxis-client';
import EfficaClient from '@/templates/effica/effica-client';
import GenericAutonomous from '@/templates/GenericAutonomous';

export async function TemplateRenderer({ keyName }: { keyName: string }) {
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';

  switch (keyName) {
    case 'soliva':
      // Template Soliva original - utilise le layout par défaut
      return null;
    case 'starter':
      // Exemple: un seul point d'entrée côté client (Shell + routing côté client)
      return <StarterApp />;
    case 'praxis':
      // Template autonome: en-tête/structure propres au thème
      return <PraxisClient />;
    case 'effica':
      return <EfficaClient />;
    default:
      // Fallback: afficher un shell autonome générique (header/footer basiques)
      return <GenericAutonomous keyName={keyName} pathname={pathname} />;
  }
}
