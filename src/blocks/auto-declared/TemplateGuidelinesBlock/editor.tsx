'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2, GripVertical, ImagePlus, Eye, EyeOff, ChevronDown, ChevronRight } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import WysiwygEditorWrapper from '../../../components/WysiwygEditorWrapper';

type TemplateDetail = {
  id: string;
  title?: string;
  summary?: string;
  content?: string;
  alt?: string;
  aspectRatio?: string;
  image?: { src?: string; alt?: string; aspectRatio?: string };
  hidden?: boolean;
  link?: string;
};

type TemplateData = {
  theme?: 'light' | 'dark' | 'auto';
  layout?: 'stacked' | 'split';
  title?: string;
  subtitle?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  image?: { src?: string; alt?: string; aspectRatio?: string; hidden?: boolean };
  details?: TemplateDetail[];
  featureToggle?: boolean;
};

type EditorProps = {
  data: TemplateData;
  onChange: (data: TemplateData) => void;
  compact?: boolean;
};

function HeroStyleImageField({
  image,
  onChange,
  compact = false,
}: {
  image: { src?: string; alt?: string; aspectRatio?: string; hidden?: boolean };
  onChange: (img: { src?: string; alt?: string; aspectRatio?: string; hidden?: boolean }) => void;
  compact?: boolean;
}) {
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
      if (!response.ok) throw new Error('Upload failed');
      const result = await response.json();
      onChange({ ...image, src: result.url });
    } catch (error) {
      console.error('Error uploading image:', error);
      alert("Échec de l'upload de l'image.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const thumbSize = 'w-10 h-10';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 group">
        <div
          className={`${thumbSize} border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 relative overflow-hidden cursor-pointer hover:border-blue-400 transition-colors`}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {image.src ? <img src={image.src} alt={image.alt || 'Image'} className="w-full h-full object-cover" /> : <ImagePlus className="w-4 h-4 text-gray-400" />}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="hidden"
        />

        <input
          type="text"
          value={image.alt || ''}
          onChange={(e) => onChange({ ...image, alt: e.target.value })}
          placeholder="Description (alt text)"
          className="flex-1 min-w-0 px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
        />

        <Select
          value={image.aspectRatio || 'auto'}
          onValueChange={(value) => onChange({ ...image, aspectRatio: value })}
          open={openSelect === 'aspect'}
          onOpenChange={(open) => setOpenSelect(open ? 'aspect' : null)}
        >
          <SelectTrigger
            className="w-[80px] h-[34px] px-1.5 py-1 text-[12px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors shadow-none"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <SelectValue placeholder="Ratio" />
          </SelectTrigger>
          <SelectContent className="shadow-none border rounded w-[220px]" onClick={(e) => e.stopPropagation()}>
            <SelectItem value="auto" className="text-[13px] py-1.5">Auto</SelectItem>
            <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase">Square</div>
            <SelectItem value="1:1" className="text-[13px] py-1.5">1:1</SelectItem>
            <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase">Portrait</div>
            <div className="grid grid-cols-2 gap-0 px-1">
              <SelectItem value="1:2" className="text-[13px] py-1.5">1:2</SelectItem>
              <SelectItem value="2:3" className="text-[13px] py-1.5">2:3</SelectItem>
              <SelectItem value="3:4" className="text-[13px] py-1.5">3:4</SelectItem>
              <SelectItem value="4:5" className="text-[13px] py-1.5">4:5</SelectItem>
              <SelectItem value="9:16" className="text-[13px] py-1.5">9:16</SelectItem>
            </div>
            <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase">Landscape</div>
            <div className="grid grid-cols-2 gap-0 px-1">
              <SelectItem value="3:2" className="text-[13px] py-1.5">3:2</SelectItem>
              <SelectItem value="4:3" className="text-[13px] py-1.5">4:3</SelectItem>
              <SelectItem value="5:4" className="text-[13px] py-1.5">5:4</SelectItem>
              <SelectItem value="16:9" className="text-[13px] py-1.5">16:9</SelectItem>
              <SelectItem value="2:1" className="text-[13px] py-1.5">2:1</SelectItem>
              <SelectItem value="4:1" className="text-[13px] py-1.5">4:1</SelectItem>
              <SelectItem value="8:1" className="text-[13px] py-1.5">8:1</SelectItem>
            </div>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 text-gray-600">
          <button
            type="button"
            className="text-gray-400 hover:text-blue-500"
            onClick={(e) => {
              e.stopPropagation();
              onChange({ ...image, hidden: !image.hidden });
            }}
            aria-label={image.hidden ? 'Afficher' : 'Masquer'}
          >
            {image.hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
          <button
            type="button"
            className="text-gray-400 hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onChange({ src: '', alt: '', aspectRatio: image.aspectRatio });
            }}
            aria-label="Supprimer l'image"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function TemplateGuidelinesEditor({ data, onChange, compact = false }: EditorProps) {
  const details = useMemo(() => (Array.isArray(data.details) ? data.details : []), [data.details]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 120, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const [openDetailId, setOpenDetailId] = useState<string | null>(null);
  const detailsFileInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingDetails, setIsUploadingDetails] = useState(false);
  const [replacingDetailId, setReplacingDetailId] = useState<string | null>(null);
  const [availablePages, setAvailablePages] = useState<Array<{ key: string; label: string; path: string }>>([]);

  useEffect(() => {
    fetch('/api/admin/content')
      .then((res) => res.json())
      .then((content) => {
        const pages = [
          { key: 'home', label: 'Accueil', path: '/' },
          { key: 'work', label: 'Réalisations', path: '/work' },
          { key: 'studio', label: 'Studio', path: '/studio' },
          { key: 'blog', label: 'Journal', path: '/blog' },
          { key: 'contact', label: 'Contact', path: '/contact' },
          ...(content?.pages?.pages || []).map((page: any) => ({
            key: page.slug || page.id,
            label: page.title || 'Page personnalisée',
            path: `/${page.slug || page.id}`,
          })),
        ];
        setAvailablePages(pages);
      })
      .catch((err) => console.error('Erreur chargement pages:', err));
  }, []);

  const update = (patch: Partial<TemplateData>) => onChange({ ...data, ...patch });
  const updateDetails = (next: TemplateDetail[]) => update({ details: next });

  const addDetailsFromFiles = async (files: FileList) => {
    const fileArray = Array.from(files || []);
    if (fileArray.length === 0) return;

    const uploadedDetails: TemplateDetail[] = [];

    setIsUploadingDetails(true);
    try {
      for (let idx = 0; idx < fileArray.length; idx++) {
        const file = fileArray[idx];
        const baseName = file.name.split('.').slice(0, -1).join('.') || file.name;

        try {
          const formData = new FormData();
          formData.append('file', file);
          const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
          if (!response.ok) throw new Error('Upload failed');
          const result = await response.json();

          uploadedDetails.push({
            id: `detail-${Date.now()}-${idx}`,
            title: '',
            summary: '',
            content: '',
            alt: baseName,
            aspectRatio: '16:9',
            image: { src: result.url, alt: baseName, aspectRatio: '16:9' },
            hidden: false,
          });
        } catch (e) {
          console.error('Erreur upload fichier:', e);
        }
      }

      if (uploadedDetails.length === 0) return;
      updateDetails([...details, ...uploadedDetails]);
      setOpenDetailId(uploadedDetails[uploadedDetails.length - 1]?.id || null);
    } finally {
      setIsUploadingDetails(false);
    }
  };

  const handleAddImagesClick = () => {
    detailsFileInputRef.current?.click();
  };

  const handleDetailsFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await addDetailsFromFiles(files);
    }
    if (detailsFileInputRef.current) detailsFileInputRef.current.value = '';
  };

  function SortableDetailRow({
    detail,
    isOpen,
    onToggle,
    onToggleHidden,
    onRemove,
    onRatioChange,
    onUpdateTitle,
    onUpdateAlt,
    onUpdateSummary,
    onUpdateContent,
    onReplaceImage,
    isReplacing,
    onUpdateLink,
  }: {
    detail: TemplateDetail;
    isOpen: boolean;
    onToggle: () => void;
    onToggleHidden: () => void;
    onRemove: () => void;
    onRatioChange: (value: string) => void;
    onUpdateTitle: (val: string) => void;
    onUpdateAlt: (val: string) => void;
    onUpdateSummary: (val: string) => void;
    onUpdateContent: (val: string) => void;
    onReplaceImage: (file: File | null) => void;
    isReplacing: boolean;
    onUpdateLink: (val: string) => void;
  }) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({ id: detail.id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
    const thumbFileInput = React.useRef<HTMLInputElement>(null);

    const handleThumbSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      onReplaceImage(file);
      if (thumbFileInput.current) thumbFileInput.current.value = '';
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        className="border border-gray-200 rounded bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-gray-50 transition-colors group cursor-pointer"
          onClick={onToggle}
        >
          {isOpen ? <ChevronDown className="w-3 h-3 text-gray-500" /> : <ChevronRight className="w-3 h-3 text-gray-500" />}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div
                className="w-10 h-10 border border-gray-200 rounded flex items-center justify-center bg-gray-50 flex-shrink-0 overflow-hidden cursor-pointer hover:border-blue-400 transition-colors relative"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {isReplacing ? (
                  <span className="text-[12px] text-gray-500">...</span>
                ) : detail.image?.src ? (
                  <div
                    className="absolute inset-0 w-full h-full bg-center bg-cover"
                    style={{ backgroundImage: `url(${detail.image.src})` }}
                    aria-label={detail.image.alt || detail.title || ''}
                  />
                ) : (
                  <ImagePlus className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44 shadow-none border rounded">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  thumbFileInput.current?.click();
                }}
                className="text-[13px] text-gray-700 hover:text-gray-900"
              >
                <ImagePlus className="w-3 h-3 mr-2" />
                Remplacer
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onReplaceImage(null);
                }}
                className="text-[13px] text-red-600 focus:text-red-600"
              >
                <Trash2 className="w-3 h-3 mr-2" />
                Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <input
            ref={thumbFileInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleThumbSelect}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600"
            {...attributes}
            {...listeners}
            aria-label="Déplacer"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3 h-3" />
          </button>
          <span className="text-[12px] text-gray-700 truncate flex-1">
            {detail.title || 'Sans titre'}
          </span>
          <div onClick={(e) => e.stopPropagation()}>
            <Select value={detail.aspectRatio || detail.image?.aspectRatio || '16:9'} onValueChange={(value) => onRatioChange(value)}>
              <SelectTrigger className="w-[90px] h-[32px] px-1.5 py-1 text-[12px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors shadow-none">
                <SelectValue placeholder="Ratio" />
              </SelectTrigger>
              <SelectContent className="shadow-none border rounded w-[220px]">
                <SelectItem value="auto" className="text-[13px] py-1.5">Auto</SelectItem>
                <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase">Square</div>
                <SelectItem value="1:1" className="text-[13px] py-1.5">1:1</SelectItem>
                <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase">Portrait</div>
                <div className="grid grid-cols-2 gap-0 px-1">
                  <SelectItem value="1:2" className="text-[13px] py-1.5">1:2</SelectItem>
                  <SelectItem value="2:3" className="text-[13px] py-1.5">2:3</SelectItem>
                  <SelectItem value="3:4" className="text-[13px] py-1.5">3:4</SelectItem>
                  <SelectItem value="4:5" className="text-[13px] py-1.5">4:5</SelectItem>
                  <SelectItem value="9:16" className="text-[13px] py-1.5">9:16</SelectItem>
                </div>
                <div className="px-2 py-1 text-[10px] font-semibold text-gray-500 uppercase">Landscape</div>
                <div className="grid grid-cols-2 gap-0 px-1">
                  <SelectItem value="3:2" className="text-[13px] py-1.5">3:2</SelectItem>
                  <SelectItem value="4:3" className="text-[13px] py-1.5">4:3</SelectItem>
                  <SelectItem value="5:4" className="text-[13px] py-1.5">5:4</SelectItem>
                  <SelectItem value="16:9" className="text-[13px] py-1.5">16:9</SelectItem>
                  <SelectItem value="2:1" className="text-[13px] py-1.5">2:1</SelectItem>
                  <SelectItem value="4:1" className="text-[13px] py-1.5">4:1</SelectItem>
                  <SelectItem value="8:1" className="text-[13px] py-1.5">8:1</SelectItem>
                </div>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              className="text-gray-400 hover:text-blue-500"
              onClick={(e) => {
                e.stopPropagation();
                onToggleHidden();
              }}
              aria-label={detail.hidden ? 'Afficher' : 'Masquer'}
            >
              {detail.hidden ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            </button>
            <button
              type="button"
              className="text-gray-400 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              aria-label="Supprimer"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="px-3 py-3 space-y-2 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Titre</label>
                <input
                  type="text"
                  value={detail.title || ''}
                  onChange={(e) => onUpdateTitle(e.target.value)}
                  className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Alt</label>
                <input
                  type="text"
                  value={detail.alt || ''}
                  onChange={(e) => onUpdateAlt(e.target.value)}
                  className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-400 mb-1">Page de destination</label>
                <Select value={detail.link || ''} onValueChange={(value) => onUpdateLink(value)}>
                  <SelectTrigger className="w-full h-auto px-2 py-1.5 text-[13px] leading-normal font-normal shadow-none rounded border border-gray-200">
                    <SelectValue placeholder="Sélectionner une page" />
                  </SelectTrigger>
                  <SelectContent className="shadow-none border rounded">
                    {availablePages.map((page) => (
                      <SelectItem key={page.key} value={page.path} className="text-[13px] py-1.5">
                        {page.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Résumé (textarea)</label>
              <textarea
                value={detail.summary || ''}
                onChange={(e) => onUpdateSummary(e.target.value)}
                rows={2}
                className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] text-gray-400 mb-1">Contenu (WYSIWYG)</label>
              <WysiwygEditorWrapper
                value={detail.content || ''}
                onChange={(content) => onUpdateContent(content)}
                compact={compact}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  const handleDetailDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = details.findIndex((i) => i.id === active.id);
      const newIndex = details.findIndex((i) => i.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        updateDetails(arrayMove(details, oldIndex, newIndex));
      }
    }
  };

  const commonFields = (
    <>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Titre</label>
          <input
            type="text"
            value={data.title || ''}
            onChange={(e) => update({ title: e.target.value })}
            className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Sous-titre</label>
          <input
            type="text"
            value={data.subtitle || ''}
            onChange={(e) => update({ subtitle: e.target.value })}
            className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] text-gray-400 mb-1">Description</label>
        <textarea
          value={data.description || ''}
          onChange={(e) => update({ description: e.target.value })}
          rows={3}
          className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">CTA texte</label>
          <input
            type="text"
            value={data.ctaText || ''}
            onChange={(e) => update({ ctaText: e.target.value })}
            className="w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">CTA lien (page de destination)</label>
          <Select
            value={availablePages.find((p) => p.path === data.ctaHref)?.path || (data.ctaHref ? '__custom' : '')}
            onValueChange={(value) => {
              if (value === '__custom') {
                update({ ctaHref: '' });
              } else {
                update({ ctaHref: value });
              }
            }}
          >
            <SelectTrigger className="w-full h-[36px] px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none shadow-none">
              <SelectValue placeholder="Sélectionner une page" />
            </SelectTrigger>
            <SelectContent className="shadow-none border rounded w-full max-h-64">
              {availablePages.map((page) => (
                <SelectItem key={page.key} value={page.path} className="text-[13px] py-1.5">
                  {page.label}
                </SelectItem>
              ))}
              <SelectItem value="__custom" className="text-[13px] py-1.5 text-gray-500">
                URL personnalisée
              </SelectItem>
            </SelectContent>
          </Select>
          {(data.ctaHref && !availablePages.find((p) => p.path === data.ctaHref)) && (
            <input
              type="text"
              value={data.ctaHref}
              onChange={(e) => update({ ctaHref: e.target.value })}
              placeholder="https://..."
              className="mt-2 w-full px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none"
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Thème</label>
          <Select
            value={data.theme || 'auto'}
            onValueChange={(value) => update({ theme: value as TemplateData['theme'] })}
          >
            <SelectTrigger className="w-full h-[36px] px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none shadow-none">
              <SelectValue placeholder="Auto" />
            </SelectTrigger>
            <SelectContent className="shadow-none border rounded w-full">
              <SelectItem value="auto" className="text-[13px] py-1.5">Auto</SelectItem>
              <SelectItem value="light" className="text-[13px] py-1.5">Clair</SelectItem>
              <SelectItem value="dark" className="text-[13px] py-1.5">Sombre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-[10px] text-gray-400 mb-1">Layout</label>
          <Select
            value={data.layout || 'split'}
            onValueChange={(value) => update({ layout: value as TemplateData['layout'] })}
          >
            <SelectTrigger className="w-full h-[36px] px-2 py-1.5 text-[13px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none shadow-none">
              <SelectValue placeholder="Split" />
            </SelectTrigger>
            <SelectContent className="shadow-none border rounded w-full">
              <SelectItem value="split" className="text-[13px] py-1.5">Split (texte + image)</SelectItem>
              <SelectItem value="stacked" className="text-[13px] py-1.5">Stacked (texte puis image)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center justify-between border border-gray-200 rounded px-2 py-1.5">
        <div className="text-[12px]">
          <div className="text-gray-700">Option (toggle)</div>
          <div className="text-[11px] text-gray-400">Exemple de Switch shadcn pour une option booléenne</div>
        </div>
        <Switch checked={!!data.featureToggle} onCheckedChange={(checked) => update({ featureToggle: checked })} />
      </div>
    </>
  );

  const detailsList = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] text-gray-400">Notes détaillées ({details.length})</label>
        <div className="flex items-center gap-2">
          <input
            ref={detailsFileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleDetailsFileChange}
          />
          <button
            type="button"
            onClick={handleAddImagesClick}
            className="px-2 py-1 text-[11px] bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center gap-1 disabled:opacity-60"
            disabled={isUploadingDetails}
          >
            {isUploadingDetails ? (
              '...'
            ) : (
              <>
                <Plus className="h-3 w-3" />
                Add images
              </>
            )}
          </button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDetailDragEnd}>
        <SortableContext items={details.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {details.map((detail) => {
              const isOpen = openDetailId === detail.id;

              return (
                <SortableDetailRow
                  key={detail.id}
                  detail={detail}
                  isOpen={isOpen}
                  onToggle={() => setOpenDetailId(isOpen ? null : detail.id)}
                  onToggleHidden={() =>
                    updateDetails(details.map((d) => (d.id === detail.id ? { ...d, hidden: !d.hidden } : d)))
                  }
                  onRemove={() => updateDetails(details.filter((d) => d.id !== detail.id))}
                  onRatioChange={(value) =>
                    updateDetails(
                      details.map((d) =>
                        d.id === detail.id
                          ? { ...d, aspectRatio: value, image: d.image ? { ...d.image, aspectRatio: value } : d.image }
                          : d
                      )
                    )
                  }
                  onUpdateTitle={(val) =>
                    updateDetails(details.map((d) => (d.id === detail.id ? { ...d, title: val } : d)))
                  }
                  onUpdateAlt={(val) =>
                    updateDetails(
                      details.map((d) =>
                        d.id === detail.id
                          ? { ...d, alt: val, image: d.image ? { ...d.image, alt: val } : d.image }
                          : d
                      )
                    )
                  }
                  onUpdateSummary={(val) =>
                    updateDetails(details.map((d) => (d.id === detail.id ? { ...d, summary: val } : d)))
                  }
                  onUpdateContent={(val) =>
                    updateDetails(details.map((d) => (d.id === detail.id ? { ...d, content: val } : d)))
                  }
                  onUpdateLink={(val) =>
                    updateDetails(details.map((d) => (d.id === detail.id ? { ...d, link: val } : d)))
                  }
                  onReplaceImage={async (file) => {
                    if (!file) {
                      updateDetails(
                        details.map((d) => (d.id === detail.id ? { ...d, image: undefined, aspectRatio: d.aspectRatio } : d))
                      );
                      return;
                    }
                    try {
                      setReplacingDetailId(detail.id);
                      const formData = new FormData();
                      formData.append('file', file);
                      const response = await fetch('/api/admin/upload', { method: 'POST', body: formData });
                      if (!response.ok) throw new Error('Upload failed');
                      const result = await response.json();
                      updateDetails(
                        details.map((d) =>
                          d.id === detail.id
                            ? {
                                ...d,
                                image: { ...(d.image || {}), src: result.url, alt: d.alt || file.name, aspectRatio: d.aspectRatio || '16:9' },
                              }
                            : d
                        )
                      );
                    } catch (e) {
                      console.error('Erreur upload fichier:', e);
                    } finally {
                      setReplacingDetailId(null);
                    }
                  }}
                  isReplacing={replacingDetailId === detail.id}
                />
              );
            })}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-3 text-[12px]">
        {commonFields}
        <HeroStyleImageField
          image={data.image || { src: '', alt: '', aspectRatio: '16:9' }}
          onChange={(image) => update({ image })}
          compact
        />
        {detailsList}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {commonFields}
      <div>
        <label className="block text-[10px] text-gray-400 mb-1">Image (UI Hero Floating Gallery)</label>
        <HeroStyleImageField
          image={data.image || { src: '', alt: '', aspectRatio: '16:9' }}
          onChange={(image) => update({ image })}
          compact={false}
        />
      </div>
      {detailsList}
    </div>
  );
}
