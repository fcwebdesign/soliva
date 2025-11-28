'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export type AspectRatioValue = 
  | 'auto' 
  | '1:1' 
  | '1:2' 
  | '2:3' 
  | '3:4' 
  | '4:5' 
  | '9:16' 
  | '3:2' 
  | '4:3' 
  | '5:4' 
  | '16:9' 
  | '2:1' 
  | '4:1' 
  | '8:1' 
  | 'stretch';

interface AspectRatioSelectProps {
  /** Valeur actuelle du ratio */
  value?: AspectRatioValue | string;
  /** Callback quand le ratio change */
  onValueChange: (value: AspectRatioValue) => void;
  /** Contrôle l'ouverture du select (pour gérer plusieurs selects) */
  open?: boolean;
  /** Callback quand l'ouverture change */
  onOpenChange?: (open: boolean) => void;
  /** Taille du trigger (compact ou normal) */
  size?: 'compact' | 'normal';
  /** Empêcher la propagation des événements */
  stopPropagation?: boolean;
}

/**
 * Composant réutilisable pour sélectionner un ratio d'aspect
 */
export default function AspectRatioSelect({
  value = 'auto',
  onValueChange,
  open,
  onOpenChange,
  size = 'compact',
  stopPropagation = true,
}: AspectRatioSelectProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (stopPropagation) {
      e.stopPropagation();
    }
  };

  const triggerClassName = size === 'compact'
    ? 'w-[75px] h-[32px] px-1.5 py-1 text-[12px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors shadow-none'
    : 'w-full h-[32px] px-2 py-1 text-[12px] border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors shadow-none';

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      open={open}
      onOpenChange={onOpenChange}
    >
      <SelectTrigger
        className={triggerClassName}
        onClick={handleClick}
        onPointerDown={handlePointerDown}
      >
        <SelectValue placeholder="Ratio" />
      </SelectTrigger>
      <SelectContent
        className="shadow-none border rounded w-[200px]"
        onClick={handleClick}
      >
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
  );
}

