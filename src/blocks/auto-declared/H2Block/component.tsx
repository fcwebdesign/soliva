import React from 'react';

interface H2Data {
  content: string;
  theme?: 'light' | 'dark' | 'auto';
}

export default function H2Block({ data }: { data: H2Data }) {
  const getThemeClasses = () => {
    if (data.theme === 'dark') return 'text-white';
    if (data.theme === 'light') return 'text-gray-900';
    return 'text-gray-900'; // Par défaut, sera surchargé par CSS
  };

  return (
    <h2 
      className={`text-3xl font-bold mb-6 ${getThemeClasses()}`}
      data-block-type="h2"
      data-block-theme={data.theme || 'auto'}
    >
      {data.content}
    </h2>
  );
}
