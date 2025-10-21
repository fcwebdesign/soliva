'use client';
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check, TrendingUp, X } from 'lucide-react';
import { toast } from 'sonner';

interface ArticleSuggestion {
  title: string;
  keyword: string;
  angle: string;
  estimatedWords: number;
}

interface ArticleGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArticleGenerated: (article: any) => void;
}

export default function ArticleGeneratorModal({ 
  isOpen, 
  onClose, 
  onArticleGenerated 
}: ArticleGeneratorModalProps) {
  const [step, setStep] = useState<'suggestions' | 'generating' | 'success'>('suggestions');
  const [suggestions, setSuggestions] = useState<ArticleSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<ArticleSuggestion | null>(null);

  // Charger les suggestions au montage
  React.useEffect(() => {
    if (isOpen && suggestions.length === 0) {
      loadSuggestions();
    }
  }, [isOpen]);

  const loadSuggestions = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/ai/suggest-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des suggestions');
      }

      const data = await response.json();
      setSuggestions(data.suggestions || []);
      
      toast.success('Suggestions générées', {
        description: `${data.suggestions.length} idées d'articles proposées`
      });

    } catch (error) {
      console.error('Erreur suggestions:', error);
      toast.error('Erreur', {
        description: 'Impossible de charger les suggestions'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateArticle = async (suggestion: ArticleSuggestion) => {
    try {
      setSelectedSuggestion(suggestion);
      setStep('generating');
      
      toast.info('Génération en cours...', {
        description: 'Cela peut prendre 30-60 secondes'
      });

      const response = await fetch('/api/ai/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: suggestion.title,
          keyword: suggestion.keyword
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération');
      }

      const data = await response.json();
      
      setStep('success');
      
      toast.success('Article généré !', {
        description: 'Vous pouvez maintenant l\'éditer et le publier',
        duration: 5000
      });

      // Passer l'article au parent après un court délai
      setTimeout(() => {
        onArticleGenerated(data.article);
        handleClose();
      }, 2000);

    } catch (error) {
      console.error('Erreur génération:', error);
      toast.error('Erreur', {
        description: 'Impossible de générer l\'article'
      });
      setStep('suggestions');
    }
  };

  const handleClose = () => {
    setStep('suggestions');
    setSelectedSuggestion(null);
    onClose();
  };

  if (!isOpen) {
    return null;
  }
  
  return createPortal(
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(2px)'
      }}
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-2xl font-semibold">
                <Sparkles className="w-6 h-6 text-purple-500" />
                {step === 'suggestions' && 'Idées d\'articles IA'}
                {step === 'generating' && 'Génération en cours...'}
                {step === 'success' && 'Article créé !'}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {step === 'suggestions' && 'Choisissez une idée d\'article, l\'IA le rédigera pour vous dans le ton Soliva'}
                {step === 'generating' && 'L\'IA rédige votre article complet avec SEO optimisé...'}
                {step === 'success' && 'Votre article est prêt à être édité et publié !'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">

        {/* Étape 1 : Suggestions */}
        {step === 'suggestions' && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                <span className="ml-3 text-gray-600">Analyse de votre blog...</span>
              </div>
            ) : (
              <>
                {suggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">Aucune suggestion disponible</p>
                    <button 
                      onClick={loadSuggestions} 
                      className="mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Recharger
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => generateArticle(suggestion)}
                        className="text-left p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all duration-200 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg group-hover:text-purple-600 transition-colors">
                              {suggestion.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {suggestion.angle}
                            </p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {suggestion.keyword}
                              </span>
                              <span>
                                ~{suggestion.estimatedWords} mots
                              </span>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <span className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-purple-500 rounded-lg group-hover:bg-purple-600 transition-colors">
                              Générer
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="text-sm text-gray-500">
                    💡 L'IA analyse votre blog et propose des sujets pertinents pour votre SEO
                  </p>
                  <Button onClick={handleClose} variant="ghost">
                    Fermer
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Étape 2 : Génération */}
        {step === 'generating' && selectedSuggestion && (
          <div className="py-12 text-center space-y-6">
            <div className="flex justify-center">
              <Loader2 className="w-16 h-16 animate-spin text-purple-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{selectedSuggestion.title}</h3>
              <p className="text-gray-600">L'IA rédige actuellement...</p>
            </div>
            <div className="space-y-2 text-sm text-gray-500">
              <p>✅ Structure des sections H2</p>
              <p>✅ Rédaction du contenu (~2000 mots)</p>
              <p>✅ FAQ si pertinent</p>
              <p>✅ Optimisation SEO complète</p>
            </div>
            <p className="text-xs text-gray-400">
              Cela prend généralement 30-60 secondes
            </p>
          </div>
        )}

        {/* Étape 3 : Succès */}
        {step === 'success' && selectedSuggestion && (
          <div className="py-12 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-green-600">Article généré avec succès !</h3>
              <p className="text-gray-600">{selectedSuggestion.title}</p>
            </div>
            <p className="text-sm text-gray-500">
              Redirection vers l'éditeur...
            </p>
          </div>
        )}
        </div>
      </div>
    </div>,
    document.body
  );
}

