"use client";
import React, { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { isMarkActiveAtCursor } from '@/utils/tiptapToolbar';
import LinkDialog from './LinkDialog';

const WysiwygEditor = ({ value, onChange, placeholder, onAISuggestion, isLoadingAI }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Désactiver les extensions qui causent des conflits
        heading: false,
        codeBlock: false,
        horizontalRule: false,
        // Réactiver les listes et citations pour l'éditeur de contenu
        blockquote: true,
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-inside',
          },
          // Configuration pour corriger le bug du premier élément après du texte
          content: 'listItem+',
          defining: true,
          parseHTML() {
            return [
              {
                tag: 'ul',
              },
            ];
          },
          renderHTML({ HTMLAttributes }) {
            return ['ul', HTMLAttributes, 0];
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-inside',
          },
          // Configuration pour corriger le bug du premier élément après du texte
          content: 'listItem+',
          defining: true,
          parseHTML() {
            return [
              {
                tag: 'ol',
              },
            ];
          },
          renderHTML({ HTMLAttributes }) {
            return ['ol', HTMLAttributes, 0];
          },
        },
        listItem: {
          HTMLAttributes: {
            class: 'mb-1',
          },
          // Configuration pour corriger le bug du premier élément
          content: 'inline*',
          defining: true,
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Link.configure({
        autolink: true,
        openOnClick: false,
        protocols: ['http', 'https', 'mailto', 'tel'],
        validate: (href) => {
          const { detectLinkKind } = require('@/utils/linkUtils');
          return detectLinkKind(href) !== 'invalid';
        },
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 transition-colors duration-300',
        },
        // Ne pas forcer target="_blank" sur tous les liens
        // Laisser la logique de normalizeHref décider
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      // Laisser TipTap travailler naturellement avec son schéma par défaut
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-3 wysiwyg-editor',
      },
    },
    immediatelyRender: false,
  });

  // Fonction pour convertir HTML en Markdown
  const htmlToMarkdown = (html) => {
    return html
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<a href="([^"]+)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
      .replace(/<p>(.*?)<\/p>/g, '$1\n\n')
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/&nbsp;/g, ' ')
      .trim();
  };

  // Fonction pour convertir Markdown en HTML
  const markdownToHtml = (markdown) => {
    return markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>')
      .replace(/ {2}/g, '&nbsp; ');
  };

  // Mettre à jour le contenu quand value change
  React.useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      // Pas de nettoyage - on charge le contenu tel quel
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  const addLink = () => {
    if (!editor) return;
    
    // Récupérer le texte sélectionné
    const selectedText = editor.state.doc.textBetween(
      editor.state.selection.from,
      editor.state.selection.to
    );
    
    // Récupérer le lien existant si on est sur un lien
    const existingLink = editor.getAttributes('link');
    
    setLinkDialogOpen(true);
  };

  const handleLinkSave = (linkData) => {
    if (!editor) return;
    
    if (linkData === null) {
      // Supprimer le lien
      editor.chain().focus().unsetLink().run();
    } else {
      // Ajouter/modifier le lien
      const { href, target, rel } = linkData;
      
      // Vérifier si c'est un lien interne
      const { detectLinkKind } = require('@/utils/linkUtils');
      const linkKind = detectLinkKind(href);
      
      // Si du texte est sélectionné, créer le lien avec ce texte
      const { from, to } = editor.state.selection;
      const selectedText = editor.state.doc.textBetween(from, to);
      
      if (selectedText && !editor.isActive('link')) {
        // Remplacer le texte sélectionné par un lien
        // ⬇️ Appliquer uniquement target/rel pour l'externe
        const linkAttributes = `href="${href}"`;
        const targetAttribute = (linkKind === 'external' && target) ? ` target="${target}"` : '';
        const relAttribute = (linkKind === 'external' && rel) ? ` rel="${rel}"` : '';
        
        editor.chain()
          .focus()
          .insertContent(`<a ${linkAttributes}${targetAttribute}${relAttribute}>${selectedText}</a>`)
          .run();
      } else {
        // Modifier le lien existant ou créer un nouveau lien
        // ⬇️ Appliquer uniquement target/rel pour l'externe
        const attrs = { href };
        if (linkKind === 'external' && target) {
          attrs.target = target;
          attrs.rel = rel;
        }
        
        editor.chain()
          .focus()
          .setLink(attrs)
          .run();
      }
    }
  };

  // État UI pour les boutons
  const [ui, setUi] = useState({ 
    bold: false, 
    italic: false, 
    link: false,
    bulletList: false,
    orderedList: false,
    blockquote: false,
    alignLeft: false,
    alignCenter: false,
    alignRight: false,
    alignJustify: false
  });
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);

  // Mettre à jour l'état UI quand la sélection change
  useEffect(() => {
    if (!editor) return;
    
    const update = () => setUi({
      bold: isMarkActiveAtCursor(editor, 'bold'),
      italic: isMarkActiveAtCursor(editor, 'italic'),
      link: isMarkActiveAtCursor(editor, 'link'),
      bulletList: editor.isActive('bulletList'),
      orderedList: editor.isActive('orderedList'),
      blockquote: editor.isActive('blockquote'),
      alignLeft: editor.isActive({ textAlign: 'left' }),
      alignCenter: editor.isActive({ textAlign: 'center' }),
      alignRight: editor.isActive({ textAlign: 'right' }),
      alignJustify: editor.isActive({ textAlign: 'justify' }),
    });
    
    editor.on('selectionUpdate', update);
    editor.on('transaction', update);
    editor.on('update', update);
    update();
    
    return () => {
      editor.off('selectionUpdate', update);
      editor.off('transaction', update);
      editor.off('update', update);
    };
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <>
      <div className="border border-gray-300 rounded-lg [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[200px] [&_.ProseMirror_p]:mb-2 [&_.ProseMirror_p:last-child]:mb-0">
        {/* Toolbar */}
        <div className="border-b border-gray-300 p-2 flex gap-2">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`px-3 py-1 rounded transition-colors ${ui.bold ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Gras"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`px-3 py-1 rounded transition-colors ${ui.italic ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Italique"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            onClick={addLink}
            className={`px-3 py-1 rounded transition-colors ${ui.link ? 'bg-green-100 text-green-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Lien"
          >
            🔗
          </button>
          {ui.link && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className="px-3 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 transition-colors"
              title="Supprimer le lien"
            >
              ✕
            </button>
          )}
          
          {/* Séparateur */}
          <div className="w-px bg-gray-300 mx-2"></div>
          
          {/* Boutons de formatage de bloc */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`px-3 py-1 rounded transition-colors ${ui.bulletList ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Liste à puces"
          >
            ⚬
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`px-3 py-1 rounded transition-colors ${ui.orderedList ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Liste numérotée"
          >
            ⒈
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`px-3 py-1 rounded transition-colors ${ui.blockquote ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Citation"
          >
            ❝
          </button>
          
          {/* Séparateur */}
          <div className="w-px bg-gray-300 mx-2"></div>
          
          {/* Boutons d'alignement */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`px-3 py-1 rounded transition-colors ${ui.alignLeft ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Aligner à gauche"
          >
            <span style={{fontFamily: 'monospace'}}>⊣</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`px-3 py-1 rounded transition-colors ${ui.alignCenter ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Centrer"
          >
            <span style={{fontFamily: 'monospace'}}>≡</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`px-3 py-1 rounded transition-colors ${ui.alignRight ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Aligner à droite"
          >
            <span style={{fontFamily: 'monospace'}}>⊢</span>
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={`px-3 py-1 rounded transition-colors ${ui.alignJustify ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'}`}
            title="Justifier"
          >
            <span style={{fontFamily: 'monospace'}}>≣</span>
          </button>
          
          {/* Séparateur */}
          <div className="w-px bg-gray-300 mx-2"></div>
          
          {/* Bouton IA */}
          {onAISuggestion && (
            <button
              type="button"
              onClick={onAISuggestion}
              disabled={isLoadingAI}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                isLoadingAI 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
              }`}
              title="Suggestion IA"
            >
              {isLoadingAI ? '...' : 'IA'}
            </button>
          )}
        </div>

        {/* Zone d'édition */}
        <div className="p-3">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Dialogue de lien */}
      <LinkDialog
        isOpen={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        onSave={handleLinkSave}
        initialHref={editor?.getAttributes('link')?.href || ''}
        initialText={editor?.state.doc.textBetween(
          editor?.state.selection.from || 0,
          editor?.state.selection.to || 0
        ) || ''}
      />
    </>
  );
};

export default WysiwygEditor; 