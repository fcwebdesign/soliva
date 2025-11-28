'use client';

import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ImageThumbnail, useImageUpload, AspectRatioSelect, AspectRatioValue } from '../components';

interface TwoImagesData {
  id?: string;
  type?: string;
  reversed?: boolean; // Pour inverser gauche/droite
  leftImage?: {
    src?: string;
    alt?: string;
    aspectRatio?: AspectRatioValue | string;
    alignHorizontal?: 'left' | 'center' | 'right';
    alignVertical?: 'top' | 'center' | 'bottom';
  };
  rightImage?: {
    src?: string;
    alt?: string;
    aspectRatio?: AspectRatioValue | string;
    alignHorizontal?: 'left' | 'center' | 'right';
    alignVertical?: 'top' | 'center' | 'bottom';
  };
  theme?: 'light' | 'dark' | 'auto';
}

export default function TwoImagesBlockEditor({ 
  data, 
  onChange, 
  compact = false, 
  context, 
  initialOpenColumn, 
  initialOpenBlockId 
}: { 
  data: TwoImagesData; 
  onChange: (updates: any) => void; 
  compact?: boolean;
  context?: any;
  initialOpenColumn?: any;
  initialOpenBlockId?: any;
}) {
  const [openSelect, setOpenSelect] = useState<string | null>(null);
  const [isLeftImageOpen, setIsLeftImageOpen] = useState(false);
  const [isRightImageOpen, setIsRightImageOpen] = useState(false);
  const leftUpload = useImageUpload({
    onSuccess: (url) => {
      onChange({
        ...data,
        leftImage: {
          ...(data.leftImage || {}),
          src: url,
        },
      });
    },
    onError: (error) => {
      alert(error.message || 'Échec de l\'upload de l\'image.');
    },
  });

  const rightUpload = useImageUpload({
    onSuccess: (url) => {
      onChange({
        ...data,
        rightImage: {
          ...(data.rightImage || {}),
          src: url,
        },
      });
    },
    onError: (error) => {
      alert(error.message || 'Échec de l\'upload de l\'image.');
    },
  });

  const handleLeftFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await leftUpload.uploadImage(file);
    }
  };

  const handleRightFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await rightUpload.uploadImage(file);
    }
  };

  if (compact) {
    return (
      <div className="block-editor space-y-2">
        {/* Option d'inversion */}
        <div className="flex items-center gap-2 py-1 px-2 border border-gray-200 rounded bg-white">
          <label className="text-[11px] text-gray-500 flex-1">Inverser les images</label>
          <Select
            value={data.reversed ? 'reversed' : 'normal'}
            onValueChange={(value) => {
              onChange({
                ...data,
                reversed: value === 'reversed',
              });
            }}
          >
            <SelectTrigger className="w-[100px] h-[28px] px-2 py-1 text-[12px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors shadow-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="shadow-none border rounded">
              <SelectItem value="normal" className="text-[13px] py-1.5">Gauche → Droite</SelectItem>
              <SelectItem value="reversed" className="text-[13px] py-1.5">Droite → Gauche</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Image gauche */}
        <div className="border border-gray-200 rounded overflow-hidden bg-white">
          <div className="flex items-center gap-2 py-1 px-2 bg-white border-b border-gray-200 group">
            <div
              className="w-3 h-3 flex items-center justify-center flex-shrink-0 cursor-pointer"
              onClick={() => setIsLeftImageOpen(!isLeftImageOpen)}
            >
              {isLeftImageOpen ? (
                <ChevronDown className="w-3 h-3 text-gray-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-400" />
              )}
            </div>
            <ImageThumbnail
              currentUrl={data.leftImage?.src}
              alt={data.leftImage?.alt || 'Image gauche'}
              size={8}
              onUpload={(url) => {
                onChange({
                  ...data,
                  leftImage: {
                    ...(data.leftImage || {}),
                    src: url,
                  },
                });
              }}
              onRemove={() => {
                onChange({
                  ...data,
                  leftImage: undefined,
                });
              }}
              stopPropagation={true}
            />
            <input
              type="text"
              value={data.leftImage?.alt || ''}
              onChange={(e) => {
                onChange({
                  ...data,
                  leftImage: {
                    ...(data.leftImage || {}),
                    alt: e.target.value,
                  },
                });
              }}
              placeholder="Description (alt text)"
              className="flex-1 min-w-0 px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            />
            <AspectRatioSelect
              value={data.leftImage?.aspectRatio || 'auto'}
              onValueChange={(value) => {
                onChange({
                  ...data,
                  leftImage: {
                    ...(data.leftImage || {}),
                    aspectRatio: value,
                  },
                });
              }}
              open={openSelect === 'left-aspect'}
              onOpenChange={(open) => {
                setOpenSelect(open ? 'left-aspect' : null);
              }}
              size="compact"
              stopPropagation={true}
            />
          </div>
          {isLeftImageOpen && (
            <div className="px-2 pb-2 space-y-2 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-400 mb-1">Horizontal</label>
                  <Select
                    value={data.leftImage?.alignHorizontal || 'left'}
                    onValueChange={(value) => {
                      onChange({
                        ...data,
                        leftImage: {
                          ...(data.leftImage || {}),
                          alignHorizontal: value as 'left' | 'center' | 'right',
                        },
                      });
                    }}
                    open={openSelect === 'left-horizontal'}
                    onOpenChange={(open) => {
                      setOpenSelect(open ? 'left-horizontal' : null);
                    }}
                  >
                    <SelectTrigger
                      className="w-full h-[32px] px-2 py-1 text-[12px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors shadow-none"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className="shadow-none border rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectItem value="left" className="text-[13px] py-1.5">Gauche</SelectItem>
                      <SelectItem value="center" className="text-[13px] py-1.5">Centre</SelectItem>
                      <SelectItem value="right" className="text-[13px] py-1.5">Droite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-400 mb-1">Vertical</label>
                  <Select
                    value={data.leftImage?.alignVertical || 'center'}
                    onValueChange={(value) => {
                      onChange({
                        ...data,
                        leftImage: {
                          ...(data.leftImage || {}),
                          alignVertical: value as 'top' | 'center' | 'bottom',
                        },
                      });
                    }}
                    open={openSelect === 'left-vertical'}
                    onOpenChange={(open) => {
                      setOpenSelect(open ? 'left-vertical' : null);
                    }}
                  >
                    <SelectTrigger
                      className="w-full h-[32px] px-2 py-1 text-[12px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors shadow-none"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className="shadow-none border rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectItem value="top" className="text-[13px] py-1.5">Haut</SelectItem>
                      <SelectItem value="center" className="text-[13px] py-1.5">Centre</SelectItem>
                      <SelectItem value="bottom" className="text-[13px] py-1.5">Bas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <input
            ref={leftUpload.fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLeftFileSelect}
            className="hidden"
          />
        </div>

        {/* Image droite */}
        <div className="border border-gray-200 rounded overflow-hidden bg-white">
          <div className="flex items-center gap-2 py-1 px-2 bg-white border-b border-gray-200 group">
            <div
              className="w-3 h-3 flex items-center justify-center flex-shrink-0 cursor-pointer"
              onClick={() => setIsRightImageOpen(!isRightImageOpen)}
            >
              {isRightImageOpen ? (
                <ChevronDown className="w-3 h-3 text-gray-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-400" />
              )}
            </div>
            <ImageThumbnail
              currentUrl={data.rightImage?.src}
              alt={data.rightImage?.alt || 'Image droite'}
              size={8}
              onUpload={(url) => {
                onChange({
                  ...data,
                  rightImage: {
                    ...(data.rightImage || {}),
                    src: url,
                  },
                });
              }}
              onRemove={() => {
                onChange({
                  ...data,
                  rightImage: undefined,
                });
              }}
              stopPropagation={true}
            />
            <input
              type="text"
              value={data.rightImage?.alt || ''}
              onChange={(e) => {
                onChange({
                  ...data,
                  rightImage: {
                    ...(data.rightImage || {}),
                    alt: e.target.value,
                  },
                });
              }}
              placeholder="Description (alt text)"
              className="flex-1 min-w-0 px-2 py-1.5 text-[13px] leading-normal font-normal border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            />
            <AspectRatioSelect
              value={data.rightImage?.aspectRatio || 'auto'}
              onValueChange={(value) => {
                onChange({
                  ...data,
                  rightImage: {
                    ...(data.rightImage || {}),
                    aspectRatio: value,
                  },
                });
              }}
              open={openSelect === 'right-aspect'}
              onOpenChange={(open) => {
                setOpenSelect(open ? 'right-aspect' : null);
              }}
              size="compact"
              stopPropagation={true}
            />
          </div>
          {isRightImageOpen && (
            <div className="px-2 pb-2 space-y-2 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-400 mb-1">Horizontal</label>
                  <Select
                    value={data.rightImage?.alignHorizontal || 'center'}
                    onValueChange={(value) => {
                      onChange({
                        ...data,
                        rightImage: {
                          ...(data.rightImage || {}),
                          alignHorizontal: value as 'left' | 'center' | 'right',
                        },
                      });
                    }}
                    open={openSelect === 'right-horizontal'}
                    onOpenChange={(open) => {
                      setOpenSelect(open ? 'right-horizontal' : null);
                    }}
                  >
                    <SelectTrigger
                      className="w-full h-[32px] px-2 py-1 text-[12px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors shadow-none"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className="shadow-none border rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectItem value="left" className="text-[13px] py-1.5">Gauche</SelectItem>
                      <SelectItem value="center" className="text-[13px] py-1.5">Centre</SelectItem>
                      <SelectItem value="right" className="text-[13px] py-1.5">Droite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] text-gray-400 mb-1">Vertical</label>
                  <Select
                    value={data.rightImage?.alignVertical || 'center'}
                    onValueChange={(value) => {
                      onChange({
                        ...data,
                        rightImage: {
                          ...(data.rightImage || {}),
                          alignVertical: value as 'top' | 'center' | 'bottom',
                        },
                      });
                    }}
                    open={openSelect === 'right-vertical'}
                    onOpenChange={(open) => {
                      setOpenSelect(open ? 'right-vertical' : null);
                    }}
                  >
                    <SelectTrigger
                      className="w-full h-[32px] px-2 py-1 text-[12px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors shadow-none"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent
                      className="shadow-none border rounded"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <SelectItem value="top" className="text-[13px] py-1.5">Haut</SelectItem>
                      <SelectItem value="center" className="text-[13px] py-1.5">Centre</SelectItem>
                      <SelectItem value="bottom" className="text-[13px] py-1.5">Bas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <input
            ref={rightUpload.fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleRightFileSelect}
            className="hidden"
          />
        </div>
      </div>
    );
  }

  // Mode normal (BO classique)
  return (
    <div className="block-editor space-y-6">
      <div>
        <Label>Image gauche (petite)</Label>
        <div className="mt-2 space-y-2">
          <ImageThumbnail
            currentUrl={data.leftImage?.src}
            alt={data.leftImage?.alt || 'Image gauche'}
            size={16}
            onUpload={(url) => {
              onChange({
                ...data,
                leftImage: {
                  ...(data.leftImage || {}),
                  src: url,
                },
              });
            }}
            onRemove={() => {
              onChange({
                ...data,
                leftImage: undefined,
              });
            }}
            stopPropagation={false}
          />
          <input
            ref={leftUpload.fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLeftFileSelect}
            className="hidden"
          />
          <input
            type="text"
            value={data.leftImage?.alt || ''}
            onChange={(e) => {
              onChange({
                ...data,
                leftImage: {
                  ...(data.leftImage || {}),
                  alt: e.target.value,
                },
              });
            }}
            placeholder="Texte alternatif"
            className="block-input"
          />
          <div>
            <Label className="text-xs text-gray-500 mb-1">Ratio d'aspect</Label>
            <AspectRatioSelect
              value={data.leftImage?.aspectRatio || 'auto'}
              onValueChange={(value) => {
                onChange({
                  ...data,
                  leftImage: {
                    ...(data.leftImage || {}),
                    aspectRatio: value,
                  },
                });
              }}
              size="normal"
              stopPropagation={false}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs text-gray-500 mb-1">Alignement horizontal</Label>
              <Select
                value={data.leftImage?.alignHorizontal || 'left'}
                onValueChange={(value) => {
                  onChange({
                    ...data,
                    leftImage: {
                      ...(data.leftImage || {}),
                      alignHorizontal: value as 'left' | 'center' | 'right',
                    },
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Gauche</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="right">Droite</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1">Alignement vertical</Label>
              <Select
                value={data.leftImage?.alignVertical || 'center'}
                onValueChange={(value) => {
                  onChange({
                    ...data,
                    leftImage: {
                      ...(data.leftImage || {}),
                      alignVertical: value as 'top' | 'center' | 'bottom',
                    },
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="top">Haut</SelectItem>
                  <SelectItem value="center">Centre</SelectItem>
                  <SelectItem value="bottom">Bas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div>
        <Label>Image droite (grande)</Label>
        <div className="mt-2 space-y-2">
          <ImageThumbnail
            currentUrl={data.rightImage?.src}
            alt={data.rightImage?.alt || 'Image droite'}
            size={16}
            onUpload={(url) => {
              onChange({
                ...data,
                rightImage: {
                  ...(data.rightImage || {}),
                  src: url,
                },
              });
            }}
            onRemove={() => {
              onChange({
                ...data,
                rightImage: undefined,
              });
            }}
            stopPropagation={false}
          />
          <input
            ref={rightUpload.fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleRightFileSelect}
            className="hidden"
          />
          <input
            type="text"
            value={data.rightImage?.alt || ''}
            onChange={(e) => {
              onChange({
                ...data,
                rightImage: {
                  ...(data.rightImage || {}),
                  alt: e.target.value,
                },
              });
            }}
            placeholder="Texte alternatif"
            className="block-input"
          />
          <div>
            <Label className="text-xs text-gray-500 mb-1">Ratio d'aspect</Label>
            <AspectRatioSelect
              value={data.rightImage?.aspectRatio || 'auto'}
              onValueChange={(value) => {
                onChange({
                  ...data,
                  rightImage: {
                    ...(data.rightImage || {}),
                    aspectRatio: value,
                  },
                });
              }}
              size="normal"
              stopPropagation={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

