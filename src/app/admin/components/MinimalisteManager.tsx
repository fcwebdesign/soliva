"use client";
import { useState, useEffect } from 'react';
import MediaUploader from './MediaUploader';
import { Target, Briefcase, Mail, Image, User, Hand } from 'lucide-react';

interface MinimalisteManagerProps {
  content: any;
  onSave: (data: any) => void;
  onUpdate: (data: any) => void;
}

interface TemplateData {
  hero: {
    title: string;
    subtitle: string;
  };
  featured: {
    image: string;
    alt: string;
  };
  work: {
    title: string;
    subtitle: string;
  };
  about: {
    title: string;
    description: string;
  };
  contact: {
    title: string;
    email: string;
  };
}

const MinimalisteManager = ({ content, onSave, onUpdate }: MinimalisteManagerProps): React.JSX.Element => {
  const [templateData, setTemplateData] = useState<TemplateData>({
    hero: {
      title: 'Design minimal. Impact maximal.',
      subtitle: 'Identités, sites et produits. Sobriété, précision, résultats.'
    },
    featured: {
      image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=2000&auto=format&fit=crop',
      alt: 'Projet en vedette'
    },
    work: {
      title: 'Travaux sélectionnés',
      subtitle: 'Peu de pièces, beaucoup d\'impact.'
    },
    about: {
      title: 'À propos',
      description: 'Studio indépendant. Nous concevons des expériences sobres et utiles. Peu d\'éléments, beaucoup d\'impact. Chaque décision sert la lisibilité, la vitesse et la conversion.'
    },
    contact: {
      title: 'Travaillons ensemble',
      email: 'hello@studio.fr'
    }
  });

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('hero');

  // Charger les données du template depuis content
  useEffect(() => {
    if (content) {
      setTemplateData({
        hero: content.hero || templateData.hero,
        featured: content.featured || templateData.featured,
        work: content.work || templateData.work,
        about: content.about || templateData.about,
        contact: content.contact || templateData.contact
      });
    }
  }, [content]);

  const updateSection = (section, data) => {
    const newTemplateData = {
      ...templateData,
      [section]: { ...templateData[section], ...data }
    };
    
    setTemplateData(newTemplateData);
    
    // Utiliser onUpdate pour déclencher hasUnsavedChanges
    if (onUpdate) {
      onUpdate({
        ...content,
        [section]: { ...templateData[section], ...data }
      });
    }
  };

  const sections = [
    { key: 'hero', label: 'Hero', icon: Target },
    { key: 'featured', label: 'Image vedette', icon: Image },
    { key: 'work', label: 'Projets', icon: Briefcase },
    { key: 'about', label: 'À propos', icon: User },
    { key: 'contact', label: 'Contact', icon: Mail }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Template Minimaliste Premium
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-1.5 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700"
          >
            {isEditing ? 'Fermer' : 'Modifier'}
          </button>
          <button
            onClick={() => window.open('/?template=starter', '_blank')}
            className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            Aperçu
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-6">
          {/* Navigation des sections */}
          <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
            {sections.map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  activeSection === section.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <section.icon className="w-4 h-4 mr-2" /> {section.label}
              </button>
            ))}
          </div>

          {/* Section Hero */}
          {activeSection === 'hero' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <Target className="w-5 h-5 text-gray-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">Section Hero</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre principal
                  </label>
                  <input
                    type="text"
                    value={templateData.hero.title}
                    onChange={(e) => updateSection('hero', { title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Design minimal. Impact maximal."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-titre
                  </label>
                  <textarea
                    value={templateData.hero.subtitle}
                    onChange={(e) => updateSection('hero', { subtitle: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Identités, sites et produits..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section Featured */}
          {activeSection === 'featured' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4">🖼️ Image vedette</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image
                  </label>
                  <MediaUploader
                    currentUrl={templateData.featured.image}
                    onUpload={(url) => updateSection('featured', { image: url })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Texte alternatif
                  </label>
                  <input
                    type="text"
                    value={templateData.featured.alt}
                    onChange={(e) => updateSection('featured', { alt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Description de l'image"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section Work */}
          {activeSection === 'work' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <Briefcase className="w-5 h-5 text-gray-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">Section Projets</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de la section
                  </label>
                  <input
                    type="text"
                    value={templateData.work.title}
                    onChange={(e) => updateSection('work', { title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Travaux sélectionnés"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sous-titre
                  </label>
                  <input
                    type="text"
                    value={templateData.work.subtitle}
                    onChange={(e) => updateSection('work', { subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Peu de pièces, beaucoup d'impact."
                  />
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💡 <strong>Info :</strong> Les projets affichés proviennent de votre gestion de projets existante. 
                    Gérez vos projets dans la section "Work" de l'admin principal.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section About */}
          {activeSection === 'about' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h4 className="text-lg font-medium text-gray-900 mb-4">👋 Section À propos</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={templateData.about.title}
                    onChange={(e) => updateSection('about', { title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="À propos"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={templateData.about.description}
                    onChange={(e) => updateSection('about', { description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Studio indépendant. Nous concevons..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section Contact */}
          {activeSection === 'contact' && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <div className="flex items-center mb-4">
                <Mail className="w-5 h-5 text-gray-600 mr-2" />
                <h4 className="text-lg font-medium text-gray-900">Section Contact</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre
                  </label>
                  <input
                    type="text"
                    value={templateData.contact.title}
                    onChange={(e) => updateSection('contact', { title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Travaillons ensemble"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={templateData.contact.email}
                    onChange={(e) => updateSection('contact', { email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="hello@studio.fr"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Mode aperçu
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Target className="w-4 h-4 text-gray-600 mr-2" />
                <h4 className="font-medium text-gray-900">Hero</h4>
              </div>
              <p className="text-sm text-gray-600 mb-1"><strong>Titre :</strong> {templateData.hero.title}</p>
              <p className="text-sm text-gray-600"><strong>Sous-titre :</strong> {templateData.hero.subtitle}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">🖼️ Image vedette</h4>
              <p className="text-sm text-gray-600 mb-2"><strong>Alt :</strong> {templateData.featured.alt}</p>
              {templateData.featured.image && (
                <img src={templateData.featured.image} alt={templateData.featured.alt} className="w-full h-20 object-cover rounded" />
              )}
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Briefcase className="w-4 h-4 text-gray-600 mr-2" />
                <h4 className="font-medium text-gray-900">Projets</h4>
              </div>
              <p className="text-sm text-gray-600 mb-1"><strong>Titre :</strong> {templateData.work.title}</p>
              <p className="text-sm text-gray-600"><strong>Sous-titre :</strong> {templateData.work.subtitle}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center mb-2">
                <Mail className="w-4 h-4 text-gray-600 mr-2" />
                <h4 className="font-medium text-gray-900">Contact</h4>
              </div>
              <p className="text-sm text-gray-600 mb-1"><strong>Titre :</strong> {templateData.contact.title}</p>
              <p className="text-sm text-gray-600"><strong>Email :</strong> {templateData.contact.email}</p>
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">👋 À propos</h4>
            <p className="text-sm text-gray-600"><strong>Titre :</strong> {templateData.about.title}</p>
            <p className="text-sm text-gray-600 mt-2">{templateData.about.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MinimalisteManager; 