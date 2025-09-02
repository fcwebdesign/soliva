import React from 'react';

interface ContentData {
  content: string;
  theme?: 'light' | 'dark' | 'auto';
}

export default function ContentBlock({ data }: { data: ContentData }) {
  return (
    <div 
      className="content-block mb-8"
      data-block-type="content"
      data-block-theme={data.theme || 'auto'}
    >
      <div 
        className="prose prose-lg max-w-none custom-lists"
        dangerouslySetInnerHTML={{ __html: data.content }}
      />
    </div>
  );
}
