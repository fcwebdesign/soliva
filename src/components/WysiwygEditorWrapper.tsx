/**
 * Wrapper pour WysiwygEditor avec props optionnelles par défaut
 * Évite de répéter les props onAISuggestion et isLoadingAI partout
 */
import React from 'react';
import WysiwygEditor from '../app/admin/components/WysiwygEditor';

interface WysiwygEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onAISuggestion?: ((params: any) => Promise<void> | void) | null;
  isLoadingAI?: boolean;
  compact?: boolean;
}

export default function WysiwygEditorWrapper({
  value,
  onChange,
  placeholder = '',
  onAISuggestion = null,
  isLoadingAI = false,
  compact = false
}: WysiwygEditorWrapperProps) {
  return (
    <WysiwygEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      onAISuggestion={onAISuggestion}
      isLoadingAI={isLoadingAI}
      compact={compact}
    />
  );
}
