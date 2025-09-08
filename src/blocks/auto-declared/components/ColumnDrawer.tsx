'use client';

import React, { useState, useEffect } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '../../../components/ui/drawer';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Textarea } from '../../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Save, 
  AlertTriangle 
} from 'lucide-react';
import { ColumnDrawerProps, Column, ColumnType } from '../types/columns';

const getTypeLabel = (type: ColumnType) => {
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

export default function ColumnDrawer({
  column,
  columnIndex,
  totalColumns,
  isOpen,
  onClose,
  onSave,
  onNavigate,
  hasUnsavedChanges
}: ColumnDrawerProps) {
  const [editedColumn, setEditedColumn] = useState<Column | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialiser les données de la colonne
  useEffect(() => {
    if (column) {
      setEditedColumn({ ...column });
      setHasChanges(false);
    }
  }, [column]);

  // Détecter les changements
  useEffect(() => {
    if (column && editedColumn) {
      const changed = JSON.stringify(column) !== JSON.stringify(editedColumn);
      setHasChanges(changed);
    }
  }, [column, editedColumn]);

  const handleSave = () => {
    if (editedColumn) {
      onSave(editedColumn);
      setHasChanges(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'Vous avez des modifications non sauvegardées. Voulez-vous vraiment fermer ?'
      );
      if (!confirmed) return;
    }
    onClose();
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (hasChanges) {
      const confirmed = window.confirm(
        'Vous avez des modifications non sauvegardées. Voulez-vous vraiment changer de colonne ?'
      );
      if (!confirmed) return;
    }
    onNavigate(direction);
  };

  const updateColumnProp = (key: string, value: string) => {
    if (editedColumn) {
      setEditedColumn({
        ...editedColumn,
        props: {
          ...editedColumn.props,
          [key]: value
        }
      });
    }
  };

  if (!column || !editedColumn) return null;

  return (
    <Drawer open={isOpen} onOpenChange={handleClose}>
      <DrawerContent className="h-[70vh] max-h-[600px]">
        <DrawerHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate('prev')}
              disabled={columnIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <DrawerTitle>
              Colonne #{columnIndex + 1} — {getTypeLabel(editedColumn.type)}
            </DrawerTitle>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate('next')}
              disabled={columnIndex === totalColumns - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Contenu</TabsTrigger>
              <TabsTrigger value="media">Média/Lien</TabsTrigger>
              <TabsTrigger value="advanced">Avancé</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="column-label">Label de la colonne</Label>
                <Input
                  id="column-label"
                  value={editedColumn.label || ''}
                  onChange={(e) => setEditedColumn({
                    ...editedColumn,
                    label: e.target.value
                  })}
                  placeholder="Nom de la colonne"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="column-type">Type de colonne</Label>
                <Select
                  value={editedColumn.type}
                  onValueChange={(value: ColumnType) => setEditedColumn({
                    ...editedColumn,
                    type: value
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="icon-title-text">Icône + Titre + Texte</SelectItem>
                    <SelectItem value="image-title-cta">Image + Titre + CTA</SelectItem>
                    <SelectItem value="stat">Statistique</SelectItem>
                    <SelectItem value="logo">Logo</SelectItem>
                    <SelectItem value="text-only">Texte seul</SelectItem>
                    <SelectItem value="image-only">Image seule</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Champs spécifiques au type */}
              {editedColumn.type === 'icon-title-text' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      value={editedColumn.props.title || ''}
                      onChange={(e) => updateColumnProp('title', e.target.value)}
                      placeholder="Titre de la colonne"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="text">Texte</Label>
                    <Textarea
                      id="text"
                      value={editedColumn.props.text || ''}
                      onChange={(e) => updateColumnProp('text', e.target.value)}
                      placeholder="Description ou contenu"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {editedColumn.type === 'image-title-cta' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Titre</Label>
                    <Input
                      id="title"
                      value={editedColumn.props.title || ''}
                      onChange={(e) => updateColumnProp('title', e.target.value)}
                      placeholder="Titre de la colonne"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cta-text">Texte du bouton</Label>
                    <Input
                      id="cta-text"
                      value={editedColumn.props.ctaText || ''}
                      onChange={(e) => updateColumnProp('ctaText', e.target.value)}
                      placeholder="En savoir plus"
                    />
                  </div>
                </>
              )}

              {editedColumn.type === 'stat' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="stat-value">Valeur</Label>
                    <Input
                      id="stat-value"
                      value={editedColumn.props.statValue || ''}
                      onChange={(e) => updateColumnProp('statValue', e.target.value)}
                      placeholder="100%"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stat-label">Label</Label>
                    <Input
                      id="stat-label"
                      value={editedColumn.props.statLabel || ''}
                      onChange={(e) => updateColumnProp('statLabel', e.target.value)}
                      placeholder="Satisfaction client"
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="image-url">URL de l'image</Label>
                <Input
                  id="image-url"
                  value={editedColumn.props.image || ''}
                  onChange={(e) => updateColumnProp('image', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">Icône</Label>
                <Input
                  id="icon"
                  value={editedColumn.props.icon || ''}
                  onChange={(e) => updateColumnProp('icon', e.target.value)}
                  placeholder="🚀 ou nom d'icône"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cta-link">Lien CTA</Label>
                <Input
                  id="cta-link"
                  value={editedColumn.props.ctaLink || ''}
                  onChange={(e) => updateColumnProp('ctaLink', e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="status">Statut</Label>
                <Select
                  value={editedColumn.status || 'incomplete'}
                  onValueChange={(value) => setEditedColumn({
                    ...editedColumn,
                    status: value as any
                  })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ok">🟢 OK</SelectItem>
                    <SelectItem value="incomplete">🟡 À compléter</SelectItem>
                    <SelectItem value="hidden">⚪️ Masquée</SelectItem>
                    <SelectItem value="locked">🔒 Verrouillée</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DrawerFooter className="flex flex-row justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {hasChanges && (
              <>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Modifications non sauvegardées
              </>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-2" />
              Enregistrer
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
