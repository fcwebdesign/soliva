"use client";
import { useState, useRef } from 'react';

interface MediaUploaderProps {
  currentUrl?: string;
  onUpload: (url: string) => void;
}

export default function MediaUploader({ currentUrl, onUpload }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      onUpload(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-4">
      {currentUrl && (
        <div className="relative inline-block rounded-lg overflow-hidden border-2 border-gray-200">
          <img 
            src={currentUrl} 
            alt="Image actuelle" 
            className="max-w-[200px] max-h-[150px] block"
          />
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <button 
              onClick={handleClick} 
              disabled={isUploading}
              className="bg-blue-600 text-white border-none px-4 py-2 rounded text-sm disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {isUploading ? 'Upload en cours...' : 'Remplacer'}
            </button>
          </div>
        </div>
      )}
      
      {!currentUrl && (
        <div 
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer transition-all duration-200 hover:border-blue-500 hover:bg-blue-50" 
          onClick={handleClick}
        >
          <div className="flex flex-col items-center gap-2 text-gray-600">
            {isUploading ? (
              <span>Upload en cours...</span>
            ) : (
              <>
                <span className="text-4xl">📁</span>
                <span>Cliquez pour uploader une image</span>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="text-red-600 text-sm mt-2">
          {error}
        </div>
      )}

      {/* Styles Tailwind déjà appliqués via className */}
    </div>
  );
}

// Composant spécialisé pour les logos clients avec carré fixe de 150x150
export function LogoUploader({ currentUrl, onUpload }: MediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }

      const data = await response.json();
      onUpload(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="mb-4">
      {currentUrl && (
        <div className="relative w-[150px] h-[150px] rounded-lg overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-gray-50 p-4">
          <img 
            src={currentUrl} 
            alt="Image actuelle" 
            className="w-auto h-auto max-w-full max-h-full"
            style={{ objectFit: 'contain' }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            <button 
              onClick={handleClick} 
              disabled={isUploading}
              className="bg-blue-600 text-white border-none px-4 py-2 rounded text-sm disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
            >
              {isUploading ? 'Upload en cours...' : 'Remplacer'}
            </button>
          </div>
        </div>
      )}
      
      {!currentUrl && (
        <div 
          className="w-[150px] h-[150px] border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 hover:border-blue-500 hover:bg-blue-50" 
          onClick={handleClick}
        >
          <div className="flex flex-col items-center gap-2 text-gray-600">
            {isUploading ? (
              <span className="text-sm">Upload en cours...</span>
            ) : (
              <>
                <span className="text-2xl">📁</span>
                <span className="text-xs text-center">Cliquez pour uploader</span>
              </>
            )}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="text-red-600 text-sm mt-2">
          {error}
        </div>
      )}
    </div>
  );
} 