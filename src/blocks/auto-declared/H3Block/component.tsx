import React from 'react';

interface H3Data {
  content: string;
  theme?: 'light' | 'dark' | 'auto';
}

export default function H3Block({ data }: { data: H3Data }) {
  return (
    <h3 className={`text-xl font-semibold mb-4 ${
      data.theme === 'dark' 
        ? 'text-white' 
        : data.theme === 'light' 
        ? 'text-gray-900' 
        : 'text-gray-900 dark:text-white'
    }`}>
      {data.content}
    </h3>
  );
}
