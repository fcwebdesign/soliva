"use client";
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { normalizeHref, detectLinkKind, filterInternalPages, internalPages } from '@/utils/linkUtils';

const LinkDialog = ({ isOpen, onClose, onSave, initialHref = '', initialText = '' }) => {
  const [href, setHref] = useState(initialHref);
  const [text, setText] = useState(initialText);
  const [linkKind, setLinkKind] = useState(detectLinkKind(initialHref));
  const [searchQuery, setSearchQuery] = useState('');
  const [showInternalPages, setShowInternalPages] = useState(false);
  const [validationError, setValidationError] = useState('');
  const inputRef = useRef(null);

  // Réinitialiser les états quand la popup s'ouvre
  useEffect(() => {
    if (isOpen) {
      setHref(initialHref);
      setText(initialText);
      setLinkKind(detectLinkKind(initialHref));
      setSearchQuery('');
      setShowInternalPages(false);
      setValidationError('');
      
      // Focus sur l'input après un court délai
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    }
  }, [isOpen, initialHref, initialText]);

  // Mettre à jour le type de lien quand href change
  useEffect(() => {
    const kind = detectLinkKind(href);
    setLinkKind(kind);
    setValidationError(''); // Effacer les erreurs précédentes
  }, [href]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!href.trim()) {
      onSave(null); // Supprimer le lien
      onClose();
      return;
    }

    // Validation supplémentaire
    if (!text.trim()) {
      setValidationError('Le texte du lien est requis');
      return;
    }

    const normalized = normalizeHref(href);
    if (normalized.kind === 'invalid') {
      setValidationError('URL invalide. Veuillez entrer une URL valide.');
      return;
    }

    // Validation spécifique pour les liens internes
    if (normalized.kind === 'internal' && !normalized.href.startsWith('/')) {
      setValidationError('Les liens internes doivent commencer par /');
      return;
    }

    onSave({
      href: normalized.href,
      target: normalized.target,
      rel: normalized.rel
    });
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  const selectInternalPage = (page) => {
    setHref(page.value);
    setShowInternalPages(false);
    setSearchQuery('');
    setValidationError('');
  };

  const handleHrefChange = (e) => {
    const newHref = e.target.value;
    setHref(newHref);
    setValidationError(''); // Effacer les erreurs quand l'utilisateur tape
  };

  const handleTextChange = (e) => {
    const newText = e.target.value;
    setText(newText);
    setValidationError(''); // Effacer les erreurs quand l'utilisateur tape
  };

  const filteredPages = filterInternalPages(searchQuery);

  if (!isOpen) return null;

  // Utiliser un portail pour éviter les conflits de styles
  return createPortal(
    <div 
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)'
      }}
    >
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 className="text-lg font-semibold mb-4">
          {initialHref ? 'Modifier le lien' : 'Ajouter un lien'}
        </h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texte du lien *
            </label>
            <input
              type="text"
              value={text}
              onChange={handleTextChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Texte du lien"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL *
            </label>
            <input
              ref={inputRef}
              type="text"
              value={href}
              onChange={handleHrefChange}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="https://example.com ou /page"
              required
            />
            
            {/* Indicateur de type de lien */}
            {href && (
              <div className="mt-2 text-sm">
                <span className={`px-2 py-1 rounded ${
                  linkKind === 'internal' ? 'bg-blue-100 text-blue-700' :
                  linkKind === 'external' ? 'bg-green-100 text-green-700' :
                  linkKind === 'anchor' ? 'bg-purple-100 text-purple-700' :
                  linkKind === 'mailto' ? 'bg-orange-100 text-orange-700' :
                  linkKind === 'tel' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {linkKind === 'internal' ? 'Lien interne (navigation classique)' :
                   linkKind === 'external' ? 'Lien externe (nouvelle fenêtre)' :
                   linkKind === 'anchor' ? 'Ancre de page' :
                   linkKind === 'mailto' ? 'Email' :
                   linkKind === 'tel' ? 'Téléphone' :
                   'URL invalide'}
                </span>
              </div>
            )}

            {/* Message d'erreur de validation */}
            {validationError && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                {validationError}
              </div>
            )}
          </div>

          {/* Pages internes suggérées */}
          {linkKind === 'internal' && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowInternalPages(!showInternalPages)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {showInternalPages ? 'Masquer' : 'Voir'} les pages disponibles
              </button>
              
              {showInternalPages && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher une page..."
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
                  />
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded">
                    {filteredPages.length > 0 ? (
                      filteredPages.map((page) => (
                        <button
                          key={page.value}
                          type="button"
                          onClick={() => selectInternalPage(page)}
                          className="block w-full text-left px-2 py-1 text-sm hover:bg-gray-100 rounded"
                        >
                          {page.label} ({page.value})
                        </button>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-sm text-gray-500">
                        Aucune page trouvée
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            {initialHref && (
              <button
                type="button"
                onClick={() => onSave(null)}
                className="px-4 py-2 text-red-600 hover:text-red-800"
              >
                Supprimer
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!href.trim() || !text.trim()}
            >
              {initialHref ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default LinkDialog; 