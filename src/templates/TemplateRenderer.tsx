import { headers } from 'next/headers';
import StarterApp from '@/templates/starter/StarterApp';

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
    
    // Templates générés dynamiquement sont gérés par le système de fichiers
    default:
      console.warn(`Template "${keyName}" non trouvé dans TemplateRenderer`);
      return null;
  }
} 
