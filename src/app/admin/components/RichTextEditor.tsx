"use client";
import { useState, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder }) => {
  const [showToolbar, setShowToolbar] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const formatText = (format: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let formattedText = '';
    let newCursorPos = start;
    
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        newCursorPos = start + 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        newCursorPos = start + 1;
        break;
      case 'link':
        const url = prompt('Entrez l\'URL du lien:');
        if (url) {
          formattedText = `[${selectedText}](${url})`;
          newCursorPos = start + 1;
        } else {
          return;
        }
        break;
      default:
        return;
    }
    
    const newValue = value.substring(0, start) + formattedText + value.substring(end);
    onChange(newValue);
    
    // Restaurer le focus et la position du curseur
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos + selectedText.length);
    }, 0);
  };



  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="mb-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border transition-colors"
          title="Gras"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border transition-colors"
          title="Italique"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => formatText('link')}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded border transition-colors"
          title="Lien"
        >
          🔗
        </button>
      </div>

      {/* Aperçu en temps réel */}
      <div className="mb-2 p-3 bg-gray-50 rounded border text-sm">
        <div className="text-xs text-gray-500 mb-1">Aperçu :</div>
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{
            __html: value
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-blue-600 underline">$1</a>')
              .replace(/\n/g, '<br>')
          }}
        />
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
      />
      
      {/* Aide */}
      <div className="mt-2 text-xs text-gray-500">
        <p><strong>Formatage :</strong> Sélectionnez du texte puis cliquez sur les boutons</p>
      </div>
    </div>
  );
};

export default RichTextEditor; 