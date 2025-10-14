"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Globe, 
  FileText, 
  Image, 
  Code, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Zap,
  Shield,
  DollarSign,
  ArrowRight,
  Info
} from 'lucide-react';

interface StaticExportManagerProps {
  content: any;
}

export default function StaticExportManager({ content }: StaticExportManagerProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleGenerateExport = async () => {
    setIsGenerating(true);
    setExportStatus('generating');

    try {
      const response = await fetch('/api/admin/export/static', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération de l\'export');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      setDownloadUrl(url);
      setExportStatus('success');
    } catch (error) {
      console.error('Erreur:', error);
      setExportStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `soliva-export-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const exportFeatures = [
    {
      icon: <FileText className="w-5 h-5" />,
      title: "Pages HTML statiques",
      description: "Toutes vos pages converties en HTML optimisé",
      included: true
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "CSS & JavaScript",
      description: "Styles et scripts optimisés pour la performance",
      included: true
    },
    {
      icon: <Image className="w-5 h-5" />,
      title: "Images & Assets",
      description: "Toutes vos images et fichiers optimisés",
      included: true
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "SEO préservé",
      description: "Métadonnées et schémas JSON-LD conservés",
      included: true
    }
  ];

  const exportLimitations = [
    {
      icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
      title: "Plus d'administration",
      description: "Aucune interface de gestion du contenu"
    },
    {
      icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
      title: "Contenu figé",
      description: "Impossible d'ajouter de nouveaux projets/articles"
    },
    {
      icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
      title: "Pas d'IA",
      description: "Fonctionnalités d'intelligence artificielle supprimées"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Export Statique
        </h1>
        <p className="text-lg text-gray-600">
          Récupérez votre site sous forme d'export statique
        </p>
      </div>

      {/* Alert d'information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-900">
              Qu'est-ce qu'un export statique ?
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Un export statique est une version "figée" de votre site, prête à être hébergée sur n'importe quel serveur web. 
              C'est parfait si vous quittez Soliva mais souhaitez conserver votre site.
            </p>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Avantages */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Ce qui est inclus</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Votre site complet avec toutes ses fonctionnalités
            </p>
          </div>
          <div className="space-y-4">
            {exportFeatures.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="text-green-600 mt-0.5">
                  {feature.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Limitations */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span>Limitations</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Ce qui ne fonctionnera plus après l'export
            </p>
          </div>
          <div className="space-y-4">
            {exportLimitations.map((limitation, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="text-orange-500 mt-0.5">
                  {limitation.icon}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{limitation.title}</h4>
                  <p className="text-sm text-gray-600">{limitation.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Options d'export */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Options d'export</h3>
          <p className="text-sm text-gray-600 mt-1">
            Choisissez le niveau de service qui vous convient
          </p>
        </div>
        <div>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Export basique */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-900">Export Basique</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">Gratuit</p>
                <p className="text-sm text-gray-600">Pour les clients Soliva</p>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Site statique complet</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Instructions de déploiement</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Support par email</span>
                </li>
              </ul>
            </div>

            {/* Export premium */}
            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-900">Export Premium</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">299€</p>
                <p className="text-sm text-gray-600">Recommandé</p>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Site statique complet</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Déploiement sur Netlify/Vercel</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Configuration du nom de domaine</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Formation de 1h</span>
                </li>
              </ul>
            </div>

            {/* Export + migration */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold text-gray-900">Export + Migration</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">599€</p>
                <p className="text-sm text-gray-600">Solution complète</p>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Export premium inclus</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Migration vers WordPress</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Formation complète</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Support 1 mois</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Générer l'export</h3>
          <p className="text-sm text-gray-600 mt-1">
            Commencez par télécharger l'export basique gratuit
          </p>
        </div>
        <div>
          <div className="space-y-4">
            {/* Status */}
            {exportStatus === 'generating' && (
              <div className="flex items-center space-x-2 text-blue-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Génération de l'export en cours...</span>
              </div>
            )}

            {exportStatus === 'success' && (
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="w-4 h-4" />
                <span>Export généré avec succès !</span>
              </div>
            )}

            {exportStatus === 'error' && (
              <div className="flex items-center space-x-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span>Erreur lors de la génération</span>
              </div>
            )}

            {/* Boutons */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleGenerateExport}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Download className="w-4 h-4 mr-2" />
                {isGenerating ? 'Génération...' : 'Télécharger l\'export basique'}
              </Button>

              {downloadUrl && (
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger le fichier
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => window.open('mailto:contact@soliva.com?subject=Export Premium&body=Bonjour, je souhaite commander un export premium pour mon site.', '_blank')}
                className="border-orange-600 text-orange-600 hover:bg-orange-50"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Commander l'export premium
              </Button>
            </div>

            {/* Informations supplémentaires */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Prochaines étapes</h4>
              <ol className="text-sm text-gray-600 space-y-1">
                <li>1. Téléchargez l'export basique pour voir le résultat</li>
                <li>2. Si satisfait, contactez-nous pour l'export premium</li>
                <li>3. Nous nous occupons du déploiement et de la configuration</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
