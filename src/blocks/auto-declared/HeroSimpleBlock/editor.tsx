'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Trash2, ImageIcon, Upload } from 'lucide-react';
import { resolvePaletteFromContent } from '@/utils/palette-resolver';

interface HeroSimpleData {
  supertitle?: string; // Surtitre au-dessus du titre
  title?: string;
  subtitle?: string;
  buttonText?: string; // Texte du bouton
  buttonLink?: string; // Lien du bouton (page, article, projet)
  backgroundImage?: string;
  contentPosition?: 'top' | 'center' | 'bottom';
  contentAlignment?: 'start' | 'center' | 'end';
  theme?: 'light' | 'dark' | 'auto';
  textColor?: string;
  transparentHeader?: boolean;
  parallax?: {
    enabled?: boolean;
    speed?: number; // 0-1
  };
}

export default function HeroSimpleEditor({
  data,
  onChange,
  compact = false,
  context,
}: {
  data: HeroSimpleData;
  onChange: (data: HeroSimpleData) => void;
  compact?: boolean;
  context?: any;
}) {
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [availableLinks, setAvailableLinks] = useState<Array<{ key: string; label: string; path: string; category: string }>>([]);

  // Charger les liens disponibles (pages, articles, projets)
  useEffect(() => {
    const loadLinks = async () => {
      try {
        const response = await fetch('/api/admin/content');
        const content = await response.json();
        
        const links: Array<{ key: string; label: string; path: string; category: string }> = [];
        
        // Pages système
        links.push(
          { key: 'home', label: 'Accueil', path: '/', category: 'Pages' },
          { key: 'work', label: 'Réalisations', path: '/work', category: 'Pages' },
          { key: 'studio', label: 'Studio', path: '/studio', category: 'Pages' },
          { key: 'blog', label: 'Journal', path: '/blog', category: 'Pages' },
          { key: 'contact', label: 'Contact', path: '/contact', category: 'Pages' }
        );
        
        // Pages personnalisées
        if (content?.pages?.pages) {
          content.pages.pages.forEach((page: any) => {
            links.push({
              key: `page-${page.slug || page.id}`,
              label: page.title || 'Page personnalisée',
              path: `/${page.slug || page.id}`,
              category: 'Pages'
            });
          });
        }
        
        // Articles de blog
        if (content?.blog?.articles) {
          content.blog.articles.forEach((article: any) => {
            links.push({
              key: `article-${article.slug || article.id}`,
              label: article.title || 'Article',
              path: `/blog/${article.slug || article.id}`,
              category: 'Articles'
            });
          });
        }
        
        // Projets
        const projects = content?.work?.adminProjects || content?.work?.projects || [];
        projects.forEach((project: any) => {
          if (project.status === 'published' || !project.status) {
            links.push({
              key: `project-${project.slug || project.id}`,
              label: project.title || 'Projet',
              path: `/work/${project.slug || project.id}`,
              category: 'Projets'
            });
          }
        });
        
        setAvailableLinks(links);
      } catch (error) {
        console.error('Erreur chargement liens:', error);
      }
    };
    
    loadLinks();
  }, []);

  // Récupérer la palette actuelle depuis le contexte
  const currentPalette = useMemo(() => {
    if (!context) return null;
    try {
      return resolvePaletteFromContent(context);
    } catch {
      return null;
    }
  }, [context]);

  // Obtenir la couleur de fond de la palette
  const paletteBackgroundColor = currentPalette?.background || '#ffffff';

  const updateField = (field: keyof HeroSimpleData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      updateField('backgroundImage', result.url);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Échec de l\'upload de l\'image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Composant ToggleGroup personnalisé
  const ToggleGroup = ({ 
    label, 
    value, 
    options, 
    onChange 
  }: { 
    label: string; 
    value: string; 
    options: { value: string; label: string }[]; 
    onChange: (value: string) => void;
  }) => (
    <div className="flex items-center justify-between">
      <label className="text-[11px] font-medium text-gray-700">{label}</label>
      <div className="flex gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-md transition-colors ${
              value === option.value
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="block-editor">
        <div className="space-y-2">
          {/* Option transparent header */}
          <div className="flex items-center justify-between py-2 border-b border-gray-200">
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Header transparent
              </label>
              <p className="text-[10px] text-gray-500">
                Active uniquement si ce bloc est le premier. Le header devient transparent pour un effet hero.
              </p>
            </div>
            <Switch
              checked={data.transparentHeader || false}
              onCheckedChange={(checked) => updateField('transparentHeader', checked)}
              className="ml-4"
            />
          </div>

          <div className="grid grid-cols-1 gap-2 mb-4">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Surtitre</label>
              <input
                type="text"
                value={data.supertitle || ''}
                onChange={(e) => updateField('supertitle', e.target.value)}
                placeholder="Surtitre (optionnel)"
                className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Titre</label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Titre hero"
                className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Sous-titre</label>
              <input
                type="text"
                value={data.subtitle || ''}
                onChange={(e) => updateField('subtitle', e.target.value)}
                placeholder="Sous-titre hero"
                className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Texte du bouton</label>
                <input
                  type="text"
                  value={data.buttonText || ''}
                  onChange={(e) => updateField('buttonText', e.target.value)}
                  placeholder="Découvrir"
                  className="w-full px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Lien du bouton</label>
                <Select 
                  value={data.buttonLink || ''} 
                  onValueChange={(value) => updateField('buttonLink', value)}
                  open={openSelect === 'buttonLink'}
                  onOpenChange={(open) => setOpenSelect(open ? 'buttonLink' : null)}
                >
                  <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded border">
                    <SelectValue placeholder="Sélectionner un lien" />
                  </SelectTrigger>
                  <SelectContent className="shadow-none border rounded max-h-[300px]">
                    {['Pages', 'Articles', 'Projets'].map((category) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-[11px] font-semibold text-gray-500 bg-gray-50 sticky top-0">
                          {category}
                        </div>
                        {availableLinks
                          .filter(link => link.category === category)
                          .map(link => (
                            <SelectItem key={link.key} value={link.path} className="text-[13px]">
                              {link.label}
                            </SelectItem>
                          ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Options de positionnement */}
          <div className="space-y-3 mb-4">
            <ToggleGroup
              label="Content position"
              value={data.contentPosition || 'center'}
              options={[
                { value: 'top', label: 'Top' },
                { value: 'center', label: 'Center' },
                { value: 'bottom', label: 'Bottom' },
              ]}
              onChange={(value) => updateField('contentPosition', value as any)}
            />
            <ToggleGroup
              label="Content alignment"
              value={data.contentAlignment || 'center'}
              options={[
                { value: 'start', label: 'Start' },
                { value: 'center', label: 'Center' },
                { value: 'end', label: 'End' },
              ]}
              onChange={(value) => updateField('contentAlignment', value as any)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">
                Couleur du texte
                {currentPalette && (
                  <span className="ml-1 text-[9px] text-gray-500">
                    (Palette: {currentPalette.name})
                  </span>
                )}
              </label>
              <Select
                value={data.textColor || 'auto'}
                onValueChange={(value) => updateField('textColor', value === 'auto' ? undefined : value)}
                open={openSelect === 'textColor'}
                onOpenChange={(open) => setOpenSelect(open ? 'textColor' : null)}
              >
                <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="shadow-none border rounded">
                  <SelectItem value="auto" className="text-[13px]">
                    Auto (Palette)
                  </SelectItem>
                  <SelectItem value="#ffffff" className="text-[13px]">Blanc</SelectItem>
                  <SelectItem value="#000000" className="text-[13px]">Noir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Parallax (scroll)</label>
              <div className="flex items-center gap-2">
                <Switch
                  checked={!!data.parallax?.enabled}
                  onCheckedChange={(checked) => updateField('parallax', { ...(data.parallax || {}), enabled: checked })}
                />
                <div className="flex-1 -mx-2 px-2">
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={[data.parallax?.speed ?? 0.25]}
                    onValueChange={(values) =>
                      updateField('parallax', { ...(data.parallax || {}), enabled: true, speed: values[0] })
                    }
                    disabled={!data.parallax?.enabled}
                  />
                </div>
                <span className="text-[11px] text-gray-500 text-right flex-shrink-0 w-12">
                  {(data.parallax?.speed ?? 0.25).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Image de fond */}
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Image de fond</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {data.backgroundImage ? (
              <div className="space-y-2">
                <div className="relative w-full h-24 border border-gray-200 rounded overflow-hidden bg-gray-50">
                  <img
                    src={data.backgroundImage}
                    alt="Background"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="flex-1 text-[12px]"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    {isUploading ? 'Upload...' : 'Remplacer'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => updateField('backgroundImage', '')}
                    className="text-[12px] text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full text-[12px]"
              >
                <ImageIcon className="h-3 w-3 mr-1" />
                {isUploading ? 'Upload...' : 'Ajouter une image'}
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="block-editor space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label className="text-sm font-medium text-gray-700">Surtitre</Label>
          <Input
            type="text"
            value={data.supertitle || ''}
            onChange={(e) => updateField('supertitle', e.target.value)}
            placeholder="Surtitre (optionnel)"
            className="w-full mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Titre</Label>
          <Input
            type="text"
            value={data.title || ''}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Titre hero"
            className="w-full mt-2"
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Sous-titre</Label>
          <Input
            type="text"
            value={data.subtitle || ''}
            onChange={(e) => updateField('subtitle', e.target.value)}
            placeholder="Sous-titre hero"
            className="w-full mt-2"
          />
        </div>

        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium text-gray-700">Texte du bouton</Label>
            <Input
              type="text"
              value={data.buttonText || ''}
              onChange={(e) => updateField('buttonText', e.target.value)}
              placeholder="Découvrir"
              className="w-full mt-2"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">Lien du bouton</Label>
            <Select 
              value={data.buttonLink || ''} 
              onValueChange={(value) => updateField('buttonLink', value)}
              open={openSelect === 'buttonLink-full'}
              onOpenChange={(open) => setOpenSelect(open ? 'buttonLink-full' : null)}
            >
              <SelectTrigger className="w-full mt-2">
                <SelectValue placeholder="Sélectionner un lien" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {['Pages', 'Articles', 'Projets'].map((category) => (
                  <div key={category}>
                    <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                      {category}
                    </div>
                    {availableLinks
                      .filter(link => link.category === category)
                      .map(link => (
                        <SelectItem key={link.key} value={link.path}>
                          {link.label}
                        </SelectItem>
                      ))}
                  </div>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Options de positionnement */}
        <div className="md:col-span-2 space-y-4">
          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Content position</Label>
            <div className="flex gap-2">
              {(['top', 'center', 'bottom'] as const).map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => updateField('contentPosition', pos)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    (data.contentPosition || 'center') === pos
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {pos.charAt(0).toUpperCase() + pos.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700 mb-2 block">Content alignment</Label>
            <div className="flex gap-2">
              {(['start', 'center', 'end'] as const).map((align) => (
                <button
                  key={align}
                  type="button"
                  onClick={() => updateField('contentAlignment', align)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    (data.contentAlignment || 'center') === align
                      ? 'bg-white text-gray-900 shadow-sm border border-gray-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Couleur du texte</Label>
          <Select
            value={data.textColor || 'auto'}
            onValueChange={(value) => updateField('textColor', value === 'auto' ? undefined : value)}
            open={openSelect === 'textColor-full'}
            onOpenChange={(open) => setOpenSelect(open ? 'textColor-full' : null)}
          >
            <SelectTrigger className="w-full mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Auto (Palette)</SelectItem>
              <SelectItem value="#ffffff">Blanc</SelectItem>
              <SelectItem value="#000000">Noir</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Parallax (scroll)</Label>
          <div className="flex items-center gap-3 mt-2">
            <Switch
              checked={!!data.parallax?.enabled}
              onCheckedChange={(checked) => updateField('parallax', { ...(data.parallax || {}), enabled: checked })}
            />
            <div className="flex-1 -mx-2 px-2">
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={[data.parallax?.speed ?? 0.25]}
                onValueChange={(values) =>
                  updateField('parallax', { ...(data.parallax || {}), enabled: true, speed: values[0] })
                }
                disabled={!data.parallax?.enabled}
              />
            </div>
            <span className="text-xs text-gray-500 w-12 text-right flex-shrink-0">
              {(data.parallax?.speed ?? 0.25).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div>
            <Label className="text-sm">Header transparent</Label>
            <p className="text-[11px] text-gray-500 leading-snug">Force le header en overlay (fix first block).</p>
          </div>
          <Switch
            checked={!!data.transparentHeader}
            onCheckedChange={(checked) => updateField('transparentHeader', checked)}
          />
        </div>

        <div>
          <Label className="text-sm font-medium text-gray-700">Image de fond</Label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          {data.backgroundImage ? (
            <div className="space-y-3 mt-2">
              <div className="relative w-full h-32 border border-gray-200 rounded overflow-hidden bg-gray-50">
                <img
                  src={data.backgroundImage}
                  alt="Background"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isUploading ? 'Upload...' : 'Remplacer'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => updateField('backgroundImage', '')}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="w-full mt-2"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {isUploading ? 'Upload...' : 'Ajouter une image de fond'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
