"use client";
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Version {
  filename: string;
  createdAt: string;
}

interface VersionListProps {
  onRevert: (filename: string) => void;
}

export default function VersionList({ onRevert }: VersionListProps) {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/versions');
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des versions');
      }
      
      const data = await response.json();
      setVersions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleRevert = async (filename: string) => {
    if (!confirm('Êtes-vous sûr de vouloir revenir à cette version ?')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/versions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filename }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors du revert');
      }

      onRevert(filename);
      toast.success('Version restaurée avec succès !');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erreur lors du revert');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <div className="version-list">Chargement des versions...</div>;
  }

  if (error) {
    return (
      <div className="version-list">
        <div className="error-message">
          Erreur: {error}
          <button onClick={fetchVersions}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="version-list">
      <h3>Versions disponibles</h3>
      
      {versions.length === 0 ? (
        <p>Aucune version disponible</p>
      ) : (
        <div className="versions-grid">
          {versions.map((version) => (
            <div key={version.filename} className="version-item">
              <div className="version-info">
                <span className="version-date">
                  {formatDate(version.createdAt)}
                </span>
                <span className="version-filename">
                  {version.filename}
                </span>
              </div>
              <button
                onClick={() => handleRevert(version.filename)}
                className="revert-button"
              >
                Revenir à cette version
              </button>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .version-list {
          background: #fff;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .version-list h3 {
          margin: 0 0 1rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #333;
        }
        
        .versions-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .version-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
        }
        
        .version-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        
        .version-date {
          font-weight: 600;
          color: #333;
          font-size: 0.875rem;
        }
        
        .version-filename {
          font-size: 0.75rem;
          color: #666;
          font-family: monospace;
        }
        
        .revert-button {
          background: #dc3545;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.875rem;
          transition: background-color 0.2s ease;
        }
        
        .revert-button:hover {
          background: #c82333;
        }
        
        .error-message {
          color: #dc3545;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .error-message button {
          background: #0070f3;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          align-self: flex-start;
        }
      `}</style>
    </div>
  );
} 