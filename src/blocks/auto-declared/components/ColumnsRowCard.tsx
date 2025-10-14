'use client';

import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Label } from '../../../components/ui/label';
import { Plus, ArrowUpDown } from 'lucide-react';
import ColumnListItem from './ColumnListItem';
import ColumnDrawer from './ColumnDrawer';
import { ColumnsRowCardProps, Column, ColumnType } from '../types/columns';

const generateColumnId = () => `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createDefaultColumn = (type: ColumnType = 'text-only'): Column => ({
  id: generateColumnId(),
  type,
  label: `Nouvelle colonne`,
  status: 'incomplete',
  props: {}
});

export default function ColumnsRowCard({
  row,
  onChange,
  onOpenColumn,
  onSwap,
  onDuplicate,
  onRemove
}: ColumnsRowCardProps) {
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const currentColumnIndex = row.columns.findIndex(col => col.id === selectedColumnId);
  const currentColumn = selectedColumnId ? row.columns[currentColumnIndex] : null;

  const handleColumnCountChange = (newCount: string) => {
    const count = parseInt(newCount);
    const newColumns = [...row.columns];

    if (count > newColumns.length) {
      // Ajouter des colonnes
      while (newColumns.length < count) {
        newColumns.push(createDefaultColumn());
      }
    } else if (count < newColumns.length) {
      // Supprimer des colonnes
      newColumns.splice(count);
    }

    onChange({
      ...row,
      columns: newColumns
    });
  };

  const handleOpenColumn = (columnId: string) => {
    setSelectedColumnId(columnId);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedColumnId(null);
  };

  const handleSaveColumn = (updatedColumn: Column) => {
    const newColumns = row.columns.map(col => 
      col.id === updatedColumn.id ? updatedColumn : col
    );
    
    onChange({
      ...row,
      columns: newColumns
    });
  };

  const handleNavigateColumn = (direction: 'prev' | 'next') => {
    if (!currentColumn) return;
    
    const newIndex = direction === 'prev' 
      ? currentColumnIndex - 1 
      : currentColumnIndex + 1;
    
    if (newIndex >= 0 && newIndex < row.columns.length) {
      setSelectedColumnId(row.columns[newIndex].id);
    }
  };

  const handleAddColumn = () => {
    if (row.columns.length < 4) {
      const newColumn = createDefaultColumn();
      const newColumns = [...row.columns, newColumn];
      
      onChange({
        ...row,
        columns: newColumns
      });
    }
  };

  const handleDuplicateColumn = (columnId: string) => {
    const columnToDuplicate = row.columns.find(col => col.id === columnId);
    if (columnToDuplicate) {
      const duplicatedColumn = {
        ...columnToDuplicate,
        id: generateColumnId(),
        label: `${columnToDuplicate.label} (copie)`
      };
      
      const columnIndex = row.columns.findIndex(col => col.id === columnId);
      const newColumns = [...row.columns];
      newColumns.splice(columnIndex + 1, 0, duplicatedColumn);
      
      onChange({
        ...row,
        columns: newColumns
      });
    }
  };

  const handleToggleColumnVisibility = (columnId: string) => {
    const newColumns = row.columns.map(col => 
      col.id === columnId 
        ? { ...col, status: col.status === 'hidden' ? 'incomplete' : 'hidden' }
        : col
    );
    
    onChange({
      ...row,
      columns: newColumns
    });
  };

  const handleSwapColumns = (columnId: string, direction: 'up' | 'down') => {
    const columnIndex = row.columns.findIndex(col => col.id === columnId);
    const newIndex = direction === 'up' ? columnIndex - 1 : columnIndex + 1;
    
    if (newIndex >= 0 && newIndex < row.columns.length) {
      const newColumns = [...row.columns];
      [newColumns[columnIndex], newColumns[newIndex]] = [newColumns[newIndex], newColumns[columnIndex]];
      
      onChange({
        ...row,
        columns: newColumns
      });
    }
  };

  const handleDeleteColumn = (columnId: string) => {
    if (row.columns.length > 2) {
      const confirmed = window.confirm('Supprimer cette colonne ? Cette action est définitive.');
      if (confirmed) {
        const newColumns = row.columns.filter(col => col.id !== columnId);
        onChange({
          ...row,
          columns: newColumns
        });
      }
    }
  };

  const isInlineMode = row.columns.length === 2;

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Rangée de colonnes</h3>
        <div className="flex items-center gap-2">
          <Label htmlFor="column-count">Colonnes:</Label>
          <Select
            value={row.columns.length.toString()}
            onValueChange={handleColumnCountChange}
          >
            <SelectTrigger id="column-count" className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
              <SelectItem value="4">4</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Options de la rangée */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="gutter">Gouttière</Label>
          <Select
            value={row.gutter || 'md'}
            onValueChange={(value) => onChange({ ...row, gutter: value as any })}
          >
            <SelectTrigger id="gutter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Aucune</SelectItem>
              <SelectItem value="sm">Petite</SelectItem>
              <SelectItem value="md">Moyenne</SelectItem>
              <SelectItem value="lg">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="align">Alignement</Label>
          <Select
            value={row.align || 'start'}
            onValueChange={(value) => onChange({ ...row, align: value as any })}
          >
            <SelectTrigger id="align">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="start">Début</SelectItem>
              <SelectItem value="center">Centre</SelectItem>
              <SelectItem value="end">Fin</SelectItem>
              <SelectItem value="stretch">Étirer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddColumn}
            disabled={row.columns.length >= 4}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une colonne
          </Button>
        </div>
      </div>

      {/* Mini-grille pour 3-4 colonnes */}
      {!isInlineMode && (
        <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 rounded-lg">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className={`h-16 rounded border-2 border-dashed flex items-center justify-center text-sm font-medium ${
                i < row.columns.length
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-400'
              }`}
            >
              {i < row.columns.length ? `Col ${i + 1}` : 'Vide'}
            </div>
          ))}
        </div>
      )}

      {/* Liste des colonnes (3-4 colonnes) ou édition inline (2 colonnes) */}
      {isInlineMode ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Mode édition inline pour 2 colonnes
          </p>
          {/* Ici on pourrait ajouter l'édition inline si nécessaire */}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Cliquez sur une colonne pour l'éditer
          </p>
          {row.columns.map((column, index) => (
            <ColumnListItem
              key={column.id}
              column={column}
              index={index}
              onEdit={() => handleOpenColumn(column.id)}
              onDuplicate={() => handleDuplicateColumn(column.id)}
              onToggleVisibility={() => handleToggleColumnVisibility(column.id)}
              onSwap={(direction) => handleSwapColumns(column.id, direction)}
              onDelete={() => handleDeleteColumn(column.id)}
              canMoveUp={index > 0}
              canMoveDown={index < row.columns.length - 1}
            />
          ))}
        </div>
      )}

      {/* Drawer pour l'édition des colonnes */}
      <ColumnDrawer
        column={currentColumn}
        columnIndex={currentColumnIndex}
        totalColumns={row.columns.length}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        onSave={handleSaveColumn}
        onNavigate={handleNavigateColumn}
        hasUnsavedChanges={false} // TODO: implémenter la détection des changements
      />
    </div>
  );
}
