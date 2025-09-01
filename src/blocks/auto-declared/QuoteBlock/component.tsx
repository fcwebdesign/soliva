import React from 'react';

interface QuoteData {
  quote: string;
  author: string;
  role?: string;
  theme: 'light' | 'dark' | 'auto';
}

export default function QuoteBlock({ data }: { data: QuoteData }) {
  const themeClasses = {
    light: 'bg-gray-50 text-gray-900 border-gray-200',
    dark: 'bg-gray-800 text-white border-gray-600',
    auto: 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-600'
  };

  return (
    <blockquote 
      className={`p-8 border-l-4 rounded-r-lg ${themeClasses[data.theme]} transition-colors`}
      data-block-type="quote"
      data-block-theme={data.theme}
    >
      <div className="text-xl italic mb-4">
        "{data.quote}"
      </div>
      <footer className="text-sm">
        <cite className="not-italic font-semibold">{data.author}</cite>
        {data.role && (
          <span className="text-gray-500 dark:text-gray-400 ml-2">— {data.role}</span>
        )}
      </footer>
    </blockquote>
  );
}