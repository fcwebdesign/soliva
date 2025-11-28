import { useRef, useState } from 'react';

interface UseImageUploadOptions {
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

interface UseImageUploadReturn {
  fileInputRef: React.RefObject<HTMLInputElement>;
  isUploading: boolean;
  uploadImage: (file: File) => Promise<string | null>;
  triggerFileSelect: () => void;
}

/**
 * Hook réutilisable pour gérer l'upload d'images
 * Utilise l'endpoint /api/admin/upload
 */
export function useImageUpload(options: UseImageUploadOptions = {}): UseImageUploadReturn {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadImage = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Échec de l\'upload de l\'image');
      }

      const result = await response.json();
      
      if (!result.url) {
        throw new Error('URL manquante dans la réponse');
      }

      options.onSuccess?.(result.url);
      return result.url;
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error('Erreur inconnue');
      options.onError?.(errorObj);
      console.error('[useImageUpload] Erreur:', errorObj);
      return null;
    } finally {
      setIsUploading(false);
      // Reset l'input pour permettre de ré-uploader le même fichier
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return {
    fileInputRef,
    isUploading,
    uploadImage,
    triggerFileSelect,
  };
}

