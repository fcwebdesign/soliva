'use client';

import React from 'react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '../../../components/ui/dropdown-menu';
import { 
  Edit, 
  Copy, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Trash2, 
  MoreVertical,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { ColumnListItemProps } from '../types/columns';

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'ok':
      return <Badge variant="default" className="bg-green-100 text-green-800">🟢 OK</Badge>;
    case 'incomplete':
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">🟡 À compléter</Badge>;
    case 'hidden':
      return <Badge variant="outline" className="bg-gray-100 text-gray-600">⚪️ Masquée</Badge>;
    case 'locked':
      return <Badge variant="destructive" className="bg-red-100 text-red-800">🔒 Verrouillée</Badge>;
    default:
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">🟡 À compléter</Badge>;
  }
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'icon-title-text':
      return '📝';
    case 'image-title-cta':
      return '🖼️';
    case 'stat':
      return '📊';
    case 'logo':
      return '🏢';
    case 'text-only':
      return '📄';
    case 'image-only':
      return '🖼️';
    default:
      return '📝';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'icon-title-text':
      return 'Icône + Titre + Texte';
    case 'image-title-cta':
      return 'Image + Titre + CTA';
    case 'stat':
      return 'Statistique';
    case 'logo':
      return 'Logo';
    case 'text-only':
      return 'Texte seul';
    case 'image-only':
      return 'Image seule';
    default:
      return 'Type inconnu';
  }
};

export default function ColumnListItem({
  column,
  index,
  onEdit,
  onDuplicate,
  onToggleVisibility,
  onSwap,
  onDelete,
  canMoveUp,
  canMoveDown
}: ColumnListItemProps) {
  const isHidden = column.status === 'hidden';
  const truncatedLabel = column.label && column.label.length > 30 
    ? `${column.label.substring(0, 30)}...` 
    : column.label || `Colonne ${index + 1}`;

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
      {/* Numéro de colonne */}
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
        #{index + 1}
      </div>

      {/* Icône et type */}
      <div className="flex-shrink-0 text-lg">
        {getTypeIcon(column.type)}
      </div>

      {/* Contenu principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm truncate">
            {truncatedLabel}
          </span>
          {getStatusBadge(column.status)}
        </div>
        <p className="text-xs text-gray-500 truncate">
          {getTypeLabel(column.type)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="default"
          onClick={onEdit}
          className="h-8 px-3"
        >
          <Edit className="h-3 w-3 mr-1" />
          Éditer
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
              <MoreVertical className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={onDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Dupliquer
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={onToggleVisibility}>
              {isHidden ? (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Afficher
                </>
              ) : (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Masquer
                </>
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem 
              onClick={() => onSwap('up')} 
              disabled={!canMoveUp}
            >
              <ChevronUp className="h-4 w-4 mr-2" />
              Monter
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => onSwap('down')} 
              disabled={!canMoveDown}
            >
              <ChevronDown className="h-4 w-4 mr-2" />
              Descendre
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem 
              onClick={onDelete}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
