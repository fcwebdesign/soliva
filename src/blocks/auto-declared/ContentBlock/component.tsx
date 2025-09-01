import React from 'react';

interface ContentData {
  content: string;
}

export default function ContentBlock({ data }: { data: ContentData }) {
  return (
    <div 
      className="text-black/70 leading-relaxed max-w-[68ch] mb-6" 
      dangerouslySetInnerHTML={{ __html: data.content }} 
    />
  );
}
