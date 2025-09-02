import React from 'react';

interface H3Data {
  content: string;
  theme?: 'light' | 'dark' | 'auto';
}

export default function H3Block({ data }: { data: H3Data }) {
  const getThemeClasses = () => {
    if (data.theme === 'dark') return 'text-white';
    if (data.theme === 'light') return 'text-gray-900';
    return 'text-gray-900'; // Par défaut, sera surchargé par CSS
  };

  return (
    <h3 
      className={`text-2xl font-semibold mb-4 ${getThemeClasses()}`}
      data-block-type="h3"
      data-block-theme={data.theme || 'auto'}
    >
      {data.content}
    </h3>
  );
}
