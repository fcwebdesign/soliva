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
  category?: string;
}

interface TemplateContent {
  _template: string;
  site: any;
  nav: any;
  [key: string]: any;
}

export default function TemplateEditorPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [templateContent, setTemplateContent] = useState<TemplateContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTemplates();
    
    // Vérifier s'il y a un template dans l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const templateFromUrl = urlParams.get('template');
    if (templateFromUrl) {
      setSelectedTemplate(templateFromUrl);
    }
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      loadTemplateContent(selectedTemplate);
    }
  }, [selectedTemplate]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/templates');
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      } else {
        toast.error('Erreur lors du chargement des templates');
      }
    } catch (error) {
      console.error('Erreur chargement templates:', error);
      toast.error('Erreur lors du chargement des templates');
    } finally {
      setIsLoading(false);
    }
  };

  const loadTemplateContent = async (templateKey: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/templates/${templateKey}/content`);
      if (response.ok) {
        const data = await response.json();
        setTemplateContent(data.content);
      } else {
        toast.error(`Erreur lors du chargement du contenu du template "${templateKey}"`);
      }
    } catch (error) {
      console.error('Erreur chargement contenu template:', error);
      toast.error('Erreur lors du chargement du contenu du template');
    } finally {
      setIsLoading(false);
    }
  };

  const saveTemplateContent = async () => {
    if (!selectedTemplate || !templateContent) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/admin/templates/${selectedTemplate}/content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: templateContent }),
      });

      if (response.ok) {
        toast.success('Contenu sauvegardé avec succès !');
      } else {
        throw new Error('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du contenu');
    } finally {
      setIsSaving(false);
    }
  };

  const updateContent = (path: string, value: any) => {
    if (!templateContent) return;
    
    const keys = path.split('.');
    const newContent = { ...templateContent };
    let current = newContent;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setTemplateContent(newContent);
  };

  const selectedTemplateData = templates.find(t => t.key === selectedTemplate);

  return (
    <AdminPageLayout
      title="Éditeur de Templates"
      description="Gère le contenu spécifique à chaque template"
      currentPage="template-editor"
      loading={isLoading}
    >
      <div className="space-y-6">
        {/* Sélecteur de template */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">🎨 Sélectionner un Template</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Template à éditer
              </label>
              <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisissez un template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.key} value={template.key}>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                        {template.category && (
                          <span className="inline-block mt-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                            {template.category}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedTemplate && (
              <div className="flex gap-2">
                <button
                  onClick={saveTemplateContent}
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Sauvegarde...' : '💾 Sauvegarder'}
                </button>
                <a
                  href={`/?template=${selectedTemplate}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  👁️ Preview
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Éditeur de contenu */}
        {selectedTemplate && templateContent && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">
              ✏️ Éditer le contenu - {selectedTemplateData?.name}
            </h2>
            
            <div className="space-y-6">
              {/* Informations générales */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Informations générales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Titre du site
                    </label>
                    <input
                      type="text"
                      value={templateContent.site?.title || ''}
                      onChange={(e) => updateContent('site.title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={templateContent.site?.description || ''}
                      onChange={(e) => updateContent('site.description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Pages du template */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Pages du template</h3>
                <div className="space-y-4">
                  {Object.keys(templateContent).filter(key => 
                    key !== '_template' && key !== 'site' && key !== 'nav'
                  ).map((pageKey) => (
                    <div key={pageKey} className="border rounded p-3">
                      <h4 className="font-medium mb-2 capitalize">{pageKey}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Titre
                          </label>
                          <input
                            type="text"
                            value={templateContent[pageKey]?.title || ''}
                            onChange={(e) => updateContent(`${pageKey}.title`, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <input
                            type="text"
                            value={templateContent[pageKey]?.description || ''}
                            onChange={(e) => updateContent(`${pageKey}.description`, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions rapides */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">⚡ Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/admin/template-manager"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold mb-2">🎨 Template Manager</h3>
              <p className="text-gray-600 text-sm">
                Gérer et générer de nouveaux templates
              </p>
            </a>
            
            <a
              href="/admin?page=templates"
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <h3 className="font-semibold mb-2">📋 Admin Principal</h3>
              <p className="text-gray-600 text-sm">
                Retour à l'admin principal
              </p>
            </a>
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}
