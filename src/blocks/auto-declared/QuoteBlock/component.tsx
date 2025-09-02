import React from 'react';

interface QuoteData {
  quote: string;
  author: string;
  role?: string;
  theme: 'light' | 'dark' | 'auto';
}

export default function QuoteBlock({ data }: { data: QuoteData }) {
  const getThemeClasses = () => {
    if (data.theme === 'light') {
      return {
        container: 'bg-gray-50 text-gray-900 border-gray-200',
        role: 'text-gray-500'
      };
    }
    if (data.theme === 'dark') {
      return {
        container: 'bg-gray-800 text-white border-gray-600',
        role: 'text-gray-400'
      };
    }
    // Auto - sera surchargé par CSS
    return {
      container: 'bg-white text-gray-900 border-gray-200',
      role: 'text-gray-500'
    };
  };

  const themeClasses = getThemeClasses();

  return (
    <blockquote 
      className={`p-8 border-l-4 rounded-r-lg ${themeClasses.container} transition-colors`}
      data-block-type="quote"
      data-block-theme={data.theme}
    >
      <div className="text-xl italic mb-4">
        "{data.quote}"
      </div>
      <footer className="text-sm">
        <cite className="not-italic font-semibold">{data.author}</cite>
        {data.role && (
          <span className={`${themeClasses.role} ml-2`}>— {data.role}</span>
        )}
      </footer>
    </blockquote>
  );
}