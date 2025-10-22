"use client";
import React from 'react';
import { UserPen } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import MediaUploader from '../MediaUploader';

interface IdentitySectionProps {
  footerData: {
    logo: string;
    logoImage: string;
    description: string;
  };
  logoType: 'text' | 'image';
  onLogoTypeChange: (type: 'text' | 'image') => void;
  onLogoChange: (value: string) => void;
  onLogoImageChange: (url: string) => void;
  onDescriptionChange: (value: string) => void;
}

const IdentitySection: React.FC<IdentitySectionProps> = ({
  footerData,
  logoType,
  onLogoTypeChange,
  onLogoChange,
  onLogoImageChange,
  onDescriptionChange
}) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
        <UserPen className="w-6 h-6 inline mr-2 text-gray-600" />
        Identité
      </h3>
      
      {/* Logo - Texte et Image */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Logo
        </label>
      
        {/* Type de logo */}
        <div className="mb-4">
          <RadioGroup
            value={logoType}
            onValueChange={(value: string) => {
              onLogoTypeChange(value as 'text' | 'image');
              if (value === 'text') {
                onLogoImageChange('');
              } else {
                onLogoChange('soliva');
              }
            }}
            className="flex items-center gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="text" id="footer-text" />
              <Label htmlFor="footer-text" className="text-sm">Logo texte</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="image" id="footer-image" />
              <Label htmlFor="footer-image" className="text-sm">Logo image</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Logo texte */}
        {logoType === 'text' && (
          <input
            type="text"
            value={footerData.logo}
            onChange={(e) => onLogoChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="soliva"
          />
        )}

        {/* Logo image */}
        {logoType === 'image' && (
          <div>
            <MediaUploader
              currentUrl={footerData.logoImage}
              onUpload={onLogoImageChange}
            />
            <p className="text-xs text-gray-500 mt-1">
              Formats acceptés : JPG, PNG, SVG. Taille recommandée : 200x60px
            </p>
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={footerData.description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Description du footer..."
        />
      </div>
    </div>
  );
};

export default IdentitySection;
