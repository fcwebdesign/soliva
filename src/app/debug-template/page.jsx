import { getActiveTemplate } from '@/templates/get-active-template';
import { readContent } from '@/lib/content';

export default async function DebugTemplate() {
  const activeTemplate = await getActiveTemplate();
  const content = await readContent();
  
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Debug Template</h1>
      
      <div className="bg-white p-4 rounded mb-4">
        <h2 className="font-bold">Template Actif:</h2>
        <pre className="bg-gray-100 p-2 rounded mt-2">
          {JSON.stringify(activeTemplate, null, 2)}
        </pre>
      </div>
      
      <div className="bg-white p-4 rounded mb-4">
        <h2 className="font-bold">Content._template:</h2>
        <pre className="bg-gray-100 p-2 rounded mt-2">
          {content._template || 'undefined'}
        </pre>
      </div>
      
      <div className="bg-white p-4 rounded">
        <h2 className="font-bold">Résultat:</h2>
        <p>Autonomous: {activeTemplate?.autonomous ? 'TRUE' : 'FALSE'}</p>
        <p>Header/Footer affiché: {activeTemplate?.autonomous ? 'NON' : 'OUI'}</p>
      </div>
    </div>
  );
} 