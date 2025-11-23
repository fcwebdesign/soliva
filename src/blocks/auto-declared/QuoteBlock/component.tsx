'use client';

import React, { useMemo } from 'react';
import { useContentUpdate } from '../../../hooks/useContentUpdate';

interface QuoteData {
  quote: string;
  author: string;
  role?: string;
  theme?: 'light' | 'dark' | 'auto';
}

export default function QuoteBlock({ data }: { data: QuoteData | any }) {
  // Extraire les données (peut être dans data directement ou dans data.data)
  const blockData = useMemo(() => {
    return (data as any).data || data;
  }, [data]);
  
  // Écouter les mises à jour de contenu pour forcer le rechargement
  useContentUpdate(() => {
    // Le useMemo se mettra à jour automatiquement
  });
  
  const quote = blockData.quote || '';
  const author = blockData.author || '';
  const role = blockData.role || '';
  const theme = blockData.theme || 'auto';
  
  return (
    <blockquote 
      className="p-8 border-l-4 rounded-r-lg transition-colors"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        color: 'var(--foreground)'
      }}
      data-block-type="quote"
      data-block-theme={theme}
    >
      <div className="text-xl italic mb-4" style={{ color: 'var(--foreground)' }}>
        "{quote}"
      </div>
      <footer className="text-sm">
        <cite className="not-italic font-semibold" style={{ color: 'var(--foreground)' }}>{author}</cite>
        {role && (
          <span className="ml-2" style={{ color: 'var(--muted-foreground)' }}>— {role}</span>
        )}
      </footer>
    </blockquote>
  );
}