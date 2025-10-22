"use client";
import React from 'react';
import { CircleFadingPlus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SocialSectionProps {
  footerData: {
    socialLinks: Array<{
      id?: string;
      platform: string;
      url: string;
    }>;
  };
  availableSocials: Array<{
    key: string;
    label: string;
    icon: string;
  }>;
  onAddSocialLink: () => void;
  onUpdateSocialLink: (index: number, field: string, value: string) => void;
  onRemoveSocialLink: (index: number) => void;
}

const SocialSection: React.FC<SocialSectionProps> = ({
  footerData,
  availableSocials,
  onAddSocialLink,
  onUpdateSocialLink,
  onRemoveSocialLink
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
        <CircleFadingPlus className="w-6 h-6 inline mr-2 text-gray-600" />
        Réseaux sociaux
      </h3>
      
      <div className="flex items-center justify-between mb-3">
        <Button
          onClick={onAddSocialLink}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </div>
      
      <div className="space-y-2">
        {footerData.socialLinks.map((social, index) => (
          <div key={index} className="p-3 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-2 gap-2">
              <select
                value={social.platform}
                onChange={(e) => onUpdateSocialLink(index, 'platform', e.target.value)}
                className="px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
              >
                <option value="">Sélectionner un réseau</option>
                {Array.isArray(availableSocials) && availableSocials.map(socialOption => (
                  <option key={socialOption.key} value={socialOption.key}>
                    {socialOption.icon} {socialOption.label}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={social.url}
                  onChange={(e) => onUpdateSocialLink(index, 'url', e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-500"
                  placeholder="URL du profil"
                />
                <Button
                  onClick={() => onRemoveSocialLink(index)}
                  size="sm"
                  variant="outline"
                  className="text-red-600 hover:bg-red-50 hover:text-red-700"
                  title="Supprimer ce réseau social"
                >
                  <Trash2 className="w-3 h-3 mr-0" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SocialSection;
