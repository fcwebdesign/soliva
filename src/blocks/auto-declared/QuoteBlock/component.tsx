import React from 'react';

interface QuoteData {
  quote: string;
  author: string;
  role?: string;
  theme: 'light' | 'dark' | 'auto';
}

export default function QuoteBlock({ data }: { data: QuoteData }) {
  return (
    <blockquote 
      className="p-8 border-l-4 rounded-r-lg transition-colors"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        color: 'var(--foreground)'
      }}
      data-block-type="quote"
      data-block-theme={data.theme}
    >
      <div className="text-xl italic mb-4" style={{ color: 'var(--foreground)' }}>
        "{data.quote}"
      </div>
      <footer className="text-sm">
        <cite className="not-italic font-semibold" style={{ color: 'var(--foreground)' }}>{data.author}</cite>
        {data.role && (
          <span className="ml-2" style={{ color: 'var(--muted-foreground)' }}>— {data.role}</span>
        )}
      </footer>
    </blockquote>
  );
}