import { useEffect } from 'react';

interface SchemaScriptProps {
  schema: string;
}

export default function SchemaScript({ schema }: SchemaScriptProps) {
  useEffect(() => {
    // Supprimer l'ancien script s'il existe
    const existingScript = document.getElementById('schema-script');
    if (existingScript) {
      existingScript.remove();
    }

    // Créer le nouveau script
    const script = document.createElement('script');
    script.id = 'schema-script';
    script.type = 'application/ld+json';
    script.textContent = schema;
    
    // Ajouter au head
    document.head.appendChild(script);

    // Cleanup
    return () => {
      const scriptToRemove = document.getElementById('schema-script');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [schema]);

  return null; // Ce composant ne rend rien visuellement
}
