'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import AdminPageLayout from '../components/AdminPageLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Template {
  key: string;
  name: string;
  description?: string;
  autonomous: boolean;
}

const TEMPLATE_CATEGORIES = [
  { value: 'portfolio', label: 'Portfolio', description: 'Sites vitrine pour créatifs et artistes' },
  { value: 'agency', label: 'Agence', description: 'Sites corporate pour agences et entreprises' },
  { value: 'blog', label: 'Blog', description: 'Sites de contenu et articles' },
  { value: 'ecommerce', label: 'E-commerce', description: 'Boutiques en ligne et ventes' },
  { value: 'landing', label: 'Landing Page', description: 'Pages d\'atterrissage et conversions' },
  { value: 'corporate', label: 'Corporate', description: 'Sites institutionnels et entreprises' },
  { value: 'creative', label: 'Créatif', description: 'Designs innovants et artistiques' },
  { value: 'minimal', label: 'Minimaliste', description: 'Designs épurés et sobres' },
];

export default function TemplateManagerPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    loadTemplates();
    loadCurrentTemplate();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Erreur chargement templates:', error);
      toast.error('Erreur lors du chargement des templates');
    } finally {
      setIsLoading(false);
    }
  };

  const loadCurrentTemplate = async () => {
    try {
      const response = await fetch('/api/content', { cache: 'no-store' });
      if (response.ok) {
        const content = await response.json();
        setCurrentTemplate(content._template || 'soliva');
      }
    } catch (error) {
      console.error('Erreur chargement template actuel:', error);
    }
  };

  const generateNewTemplate = async () => {
    if (!selectedCategory) {
      toast.error('Veuillez sélectionner une catégorie');
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('/api/admin/templates/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${selectedCategory}-template`,
          category: selectedCategory,
          useAI: true,
          description: `Template ${selectedCategory} généré avec l'IA`,
          autonomous: true,
          styles: {
            primaryColor: '#3B82F6',
            secondaryColor: '#1E40AF',
            fontFamily: 'Inter'
          },
          blocks: [
            { type: 'hero', content: 'Hero section' },
            { type: 'services', content: 'Services section' },
            { type: 'projects', content: 'Projects section' },
            { type: 'contact', content: 'Contact section' }
          ],
          pages: ['home', 'work', 'studio', 'blog', 'contact']
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Template "${result.templateName}" généré avec succès !`);
        loadTemplates(); // Recharger la liste des templates
        setSelectedCategory(''); // Reset la sélection
      } else {
        throw new Error('Erreur lors de la génération');
      }
    } catch (error) {
      console.error('Erreur génération:', error);
      toast.error('Erreur lors de la génération du template');
    } finally {
      setIsGenerating(false);
    }
  };

  const applyTemplate = async (templateKey: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/templates/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId: templateKey }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentTemplate(templateKey);
        toast.success(`Template "${templateKey}" appliqué avec succès !`);
        setTimeout(() => window.location.reload(), 1000);
      } else {
        throw new Error('Erreur lors de l\'application du template');
      }
    } catch (error) {
      console.error('Erreur application template:', error);
      toast.error('Erreur lors de l\'application du template');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AdminPageLayout
      title="Template Manager"
      description="Gère tes templates et configure leur contenu"
      currentPage="template-manager"
      loading={isLoading}
    >
      <div className="space-y-6">
        {/* Génération de nouveaux templates */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">🤖 Générer un Nouveau Template</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie du template
              </label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sélectionnez une catégorie..." />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div>
                        <div className="font-medium">{category.label}</div>
                        <div className="text-sm text-gray-500">{category.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <button
              onClick={generateNewTemplate}
              disabled={isGenerating || !selectedCategory}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {isGenerating ? 'Génération...' : '🚀 Générer'}
            </button>
          </div>
        </div>

        {/* Templates disponibles */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">📋 Templates Disponibles</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Chargement des templates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template, index) => (
                <div
                  key={`${template.key}-${template.category || 'static'}-${index}`}
                  className={`border rounded-lg p-4 transition-colors ${
                    currentTemplate === template.key
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{template.name}</h3>
                      {template.category && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                          {template.category}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm">{template.description}</p>
                    {currentTemplate === template.key && (
                      <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        Actuel
                      </span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => applyTemplate(template.key)}
                      disabled={isLoading || currentTemplate === template.key}
                      className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {currentTemplate === template.key ? 'Actif' : 'Appliquer'}
                    </button>
                    <a
                      href={`/?template=${template.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      👁️
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">⚡ Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/admin?page=home"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold mb-2">✏️ Éditer le Contenu</h3>
              <p className="text-gray-600 text-sm">
                Gérer le contenu de la page d'accueil
              </p>
            </a>
            
            <a
              href="/admin?page=templates"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold mb-2">🎨 Gestion Templates</h3>
              <p className="text-gray-600 text-sm">
                Gérer les templates dans l'admin principal
              </p>
            </a>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}