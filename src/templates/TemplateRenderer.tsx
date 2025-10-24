import MinimalistePremiumClient from '@/templates/minimaliste-premium/minimaliste-premium-client';
import StudioMinimalisteClient from '@/templates/minimaliste-premium/studio-client';
import WorkMinimalisteClient from '@/templates/minimaliste-premium/work-client';
import ContactMinimalisteClient from '@/templates/minimaliste-premium/contact-client';
import BlogMinimalisteClient from '@/templates/minimaliste-premium/blog-client';
import { headers } from 'next/headers';
import StarterApp from '@/templates/starter/StarterApp';

export async function TemplateRenderer({ keyName }: { keyName: string }) {
  // Récupérer le pathname pour déterminer quelle page rendre
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '/';

  switch (keyName) {
    case 'minimaliste-premium':
      // Rendre le bon client selon la page - TOUTES les pages utilisent le template
      switch (pathname) {
        case '/':
          return <MinimalistePremiumClient />;
        case '/studio':
          return <StudioMinimalisteClient />;
        case '/work':
          return <WorkMinimalisteClient />;
        case '/contact':
          return <ContactMinimalisteClient />;
        case '/blog':
          return <BlogMinimalisteClient />;
        default:
          // Pour les autres pages, utiliser la home par défaut (style cohérent)
          return <MinimalistePremiumClient />;
      }
    case 'starter':
      // Exemple: un seul point d'entrée côté client (Shell + routing côté client)
      return <StarterApp />;
    
    // Autres templates futurs...
    // case 'autre-template':
    //   return <AutreTemplateClient />;
    
    default:
      console.warn(`Template "${keyName}" non trouvé dans TemplateRenderer`);
      return null;
  }
} 
