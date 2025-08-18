import { readContent } from '@/lib/content';

export const runtime = "nodejs";

export default async function DebugContent() {
  let content;
  let error;

  try {
    content = await readContent();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Erreur inconnue';
  }

  if (error) {
    return (
      <div className="debug-page">
        <h1>Debug Content - Erreur</h1>
        <div className="error">
          <h2>Erreur lors de la lecture du contenu :</h2>
          <pre>{error}</pre>
        </div>
      </div>
    );
  }

  const pages = Object.keys(content).filter(key => key !== 'metadata' && key !== 'nav');
  const sections = {
    home: Object.keys(content.home),
    contact: Object.keys(content.contact),
    studio: Object.keys(content.studio),
    work: Object.keys(content.work),
    blog: Object.keys(content.blog)
  };

  return (
    <div className="debug-page">
      <h1>Debug Content</h1>
      
      <div className="debug-section">
        <h2>Pages disponibles :</h2>
        <ul>
          {pages.map(page => (
            <li key={page}>
              <strong>{page}</strong>
              <ul>
                {sections[page as keyof typeof sections]?.map(section => (
                  <li key={section}>
                    {section}
                    {section === 'hero' && content[page as keyof typeof content]?.hero?.title && (
                      <span> - "{content[page as keyof typeof content].hero.title}"</span>
                    )}
                    {section === 'projects' && Array.isArray(content[page as keyof typeof content]?.projects) && (
                      <span> - {content[page as keyof typeof content].projects.length} projets</span>
                    )}
                    {section === 'articles' && Array.isArray(content[page as keyof typeof content]?.articles) && (
                      <span> - {content[page as keyof typeof content].articles.length} articles</span>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>

      <div className="debug-section">
        <h2>Navigation :</h2>
        <ul>
          <li><strong>Logo :</strong> {content.nav.logo}</li>
          <li><strong>Items :</strong> {content.nav.items.join(', ')}</li>
          <li><strong>Location :</strong> {content.nav.location}</li>
        </ul>
      </div>

      <div className="debug-section">
        <h2>Metadata :</h2>
        <ul>
          <li><strong>Title :</strong> {content.metadata.title}</li>
          <li><strong>Description :</strong> {content.metadata.description}</li>
        </ul>
      </div>

      <div className="debug-section">
        <h2>Contenu JSON complet :</h2>
        <pre className="json-content">
          {JSON.stringify(content, null, 2)}
        </pre>
      </div>

      <style jsx>{`
        .debug-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          font-family: monospace;
        }
        
        .debug-section {
          margin-bottom: 2rem;
          padding: 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .debug-section h2 {
          margin-top: 0;
          color: #333;
        }
        
        .json-content {
          background: #f5f5f5;
          padding: 1rem;
          border-radius: 4px;
          overflow-x: auto;
          font-size: 12px;
          line-height: 1.4;
        }
        
        .error {
          background: #fee;
          border: 1px solid #fcc;
          padding: 1rem;
          border-radius: 4px;
        }
        
        ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }
        
        li {
          margin: 0.25rem 0;
        }
        
        span {
          color: #666;
          font-style: italic;
        }
      `}</style>
    </div>
  );
} 