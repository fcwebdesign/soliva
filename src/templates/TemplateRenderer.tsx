import { headers } from 'next/headers';
import StarterApp from '@/templates/starter/StarterApp';
import PraxisClient from '@/templates/praxis/praxis-client';
import EfficaClient from '@/templates/effica/effica-client';
import GenericAutonomous from '@/templates/GenericAutonomous';

import DebugtestClient from '@/templates/debug-test/debug-test-client';
import ConversionflowClient from '@/templates/conversionflow/conversionflow-client';
import SalescoreClient from '@/templates/salescore/salescore-client';
import OmnisClient from '@/templates/omnis/omnis-client';
import DesignhubClient from '@/templates/designhub/designhub-client';
import MinimalflowClient from '@/templates/minimalflow/minimalflow-client';
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
      return <PraxisClient />;case 'effica':
      return <EfficaClient />;
    
    case 'debug-test':
      return <DebugtestClient />;
    
    case 'conversionflow':
      return <ConversionflowClient />;
    
    case 'salescore':
      return <SalescoreClient />;
    
    case 'omnis':
      return <OmnisClient />;
    
    case 'designhub':
      return <DesignhubClient />;
    case 'minimalflow':
      return <MinimalflowClient />;
    default:
      // Fallback: afficher un shell autonome générique (header/footer basiques)
      return <GenericAutonomous keyName={keyName} pathname={pathname} />;
  }
}
