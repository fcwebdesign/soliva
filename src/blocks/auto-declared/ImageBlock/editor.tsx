'use client';
import React from 'react';
import MediaUploader from '@/app/admin/components/MediaUploader';

interface ImageBlockEditorProps {
  data: {
    id: string;
    type: string;
    image?: {
      src: string;
      alt: string;
    };
  };
  onChange: (updates: any) => void;
}

export default function ImageBlockEditor({ data, onChange }: ImageBlockEditorProps) {
  const updateBlock = (updates: any) => {
    onChange(updates);
  };

  return (
    <div className="block-editor">
      <MediaUploader
        currentUrl={data.image?.src || ''}
        onUpload={(src) => updateBlock({ image: { ...data.image, src } })}
      />
      <input
        type="text"
        value={data.image?.alt || ''}
        onChange={(e) => updateBlock({ image: { ...data.image, alt: e.target.value } })}
        placeholder="Description de l'image (alt text)"
        className="block-input"
      />
    </div>
  );
}
