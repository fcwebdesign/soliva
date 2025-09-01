import React from 'react';

interface H2Data {
  content: string;
  theme?: 'light' | 'dark' | 'auto';
}

export default function H2Block({ data }: { data: H2Data }) {
  return (
    <h2 className={`text-3xl font-bold mb-6 ${
      data.theme === 'dark' 
        ? 'text-white' 
        : data.theme === 'light' 
        ? 'text-gray-900' 
        : 'text-gray-900 dark:text-white'
    }`}>
      {data.content}
    </h2>
  );
}
