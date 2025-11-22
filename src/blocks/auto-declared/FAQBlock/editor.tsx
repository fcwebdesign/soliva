'use client';

import React, { useState } from 'react';
import { HelpCircle, GripVertical, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQBlockData {
  title?: string;
  items?: FAQItem[];
  theme?: 'light' | 'dark' | 'auto';
}

interface FAQBlockEditorProps {
  data: FAQBlockData;
  onChange: (data: FAQBlockData) => void;
  compact?: boolean;
}

// Composant sortable pour chaque item FAQ
function SortableFAQItem({ 
  item, 
  index, 
  isOpen,
  onToggle,
  onUpdate,
  onRemove
}: {
  item: FAQItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (field: 'question' | 'answer', value: string) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? 'none' : 'transform 200ms ease',
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-200 rounded overflow-hidden"
    >
      {/* Header collapsible - clic rapide = toggle, clic maintenu = drag */}
      <div
        className="flex items-center gap-1 py-1 px-2 group hover:bg-gray-50 transition-colors cursor-pointer"
        onClick={onToggle}
        {...attributes}
        {...listeners}
      >
        <div className="w-3 h-3 flex items-center justify-center flex-shrink-0">
          {isOpen ? (
            <ChevronDown className="w-3 h-3 text-gray-400" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-400" />
          )}
        </div>
        <GripVertical className="w-3 h-3 text-gray-400 flex-shrink-0" />
        <HelpCircle className="w-3 h-3 text-gray-400 flex-shrink-0" />
        <span className="text-xs text-gray-500 flex-shrink-0">
          {index + 1}.
        </span>
        <span className="text-sm text-gray-700 truncate flex-1">
          {item.question || 'Question sans titre'}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-gray-400 hover:text-red-500 hover:bg-gray-100 transition-all flex-shrink-0"
          title="Supprimer"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Contenu éditable */}
      {isOpen && (
        <div className="px-2 pb-2 space-y-2 bg-white border-t border-gray-100">
          <div>
            <label className="block text-[10px] text-gray-400 mb-1 mt-2">Question</label>
            <input
              type="text"
              value={item.question}
              onChange={(e) => onUpdate('question', e.target.value)}
              placeholder="Votre question..."
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] text-gray-400 mb-1">Réponse</label>
            <textarea
              value={item.answer.replace(/<[^>]*>/g, '')}
              onChange={(e) => onUpdate('answer', `<p>${e.target.value}</p>`)}
              placeholder="Réponse..."
              rows={2}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded focus:border-blue-400 focus:outline-none resize-none transition-colors"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function FAQBlockEditor({ data, onChange, compact = false }: FAQBlockEditorProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  
  const toggleItem = (id: string) => {
    const newOpen = new Set(openItems);
    if (newOpen.has(id)) {
      newOpen.delete(id);
    } else {
      newOpen.add(id);
    }
    setOpenItems(newOpen);
  };
  const title = data.title || '';
  const items = data.items || [];
  const theme = data.theme || 'auto';

  // Configuration des capteurs pour dnd-kit
  // Delay pour différencier clic (toggle) vs clic maintenu (drag)
  const mouseSensor = useSensor(PointerSensor, {
    activationConstraint: { 
      delay: 150, // 150ms pour activer le drag
      tolerance: 5, // Tolérance de mouvement pendant le délai
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  const sensors = useSensors(mouseSensor, keyboardSensor);

  // Fonction de gestion du drag & drop
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);

      const newItems = arrayMove(items, oldIndex, newIndex);
      onChange({
        ...data,
        items: newItems
      });
    }
  };

  const addItem = () => {
    const newItem: FAQItem = {
      id: `faq-${Date.now()}`,
      question: 'Nouvelle question ?',
      answer: '<p>Réponse à la question...</p>'
    };
    
    onChange({
      ...data,
      items: [...items, newItem]
    });
  };

  const updateItem = (id: string, field: 'question' | 'answer', value: string) => {
    onChange({
      ...data,
      items: items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    });
  };

  const removeItem = (id: string) => {
    onChange({
      ...data,
      items: items.filter(item => item.id !== id)
    });
  };

  // Version compacte pour l'éditeur visuel
  if (compact) {
    return (
      <div className="space-y-3">
        {/* Titre */}
        <div>
          <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">Titre</label>
          <input
            type="text"
            value={title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Questions fréquentes"
            className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:border-blue-400 focus:outline-none transition-colors"
          />
        </div>

        {/* Liste des Q&A */}
        <div>
          <label className="block text-[11px] uppercase tracking-wide text-gray-500 mb-1.5">
            Questions ({items.length})
          </label>
          <div className="space-y-1">
            {items.length === 0 ? (
              <div className="text-center py-4 text-xs text-gray-400 border border-dashed border-gray-200 rounded">
                Aucune question
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((item, index) => (
                    <SortableFAQItem
                      key={item.id}
                      item={item}
                      index={index}
                      isOpen={openItems.has(item.id)}
                      onToggle={() => toggleItem(item.id)}
                      onUpdate={(field, value) => updateItem(item.id, field, value)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
            
            {/* Bouton ajouter */}
            <button
              type="button"
              onClick={addItem}
              className="w-full px-2 py-1.5 text-xs border border-dashed border-gray-300 rounded text-gray-500 hover:text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              + Ajouter
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Version normale pour le BO classique
  return (
    <div className="block-editor">
      <div className="space-y-4">
        {/* Titre de la section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre de la section
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            placeholder="Ex: Questions fréquentes"
            className="block-input"
          />
        </div>

        {/* Sélecteur de thème */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Thème de fond
          </label>
          <select
            value={theme}
            onChange={(e) => onChange({ ...data, theme: e.target.value as any })}
            className="block-input"
          >
            <option value="auto">Automatique (suit le thème global)</option>
            <option value="light">Thème clair forcé</option>
            <option value="dark">Thème sombre forcé</option>
          </select>
        </div>

        {/* Liste des questions/réponses */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Questions / Réponses ({items.length})
          </label>
          <div className="space-y-3">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                Aucune question. Cliquez sur "Ajouter une Q&A" pour commencer.
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  {/* En-tête avec contrôles */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-600">
                      Question {index + 1}
                    </span>
                    <div className="flex items-center gap-2">
                      {/* Bouton supprimer */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>

                  {/* Question */}
                  <div className="mb-2">
                    <input
                      type="text"
                      value={item.question}
                      onChange={(e) => updateItem(item.id, 'question', e.target.value)}
                      placeholder="Votre question ici..."
                      className="block-input"
                    />
                  </div>

                  {/* Réponse */}
                  <div>
                    <textarea
                      value={item.answer.replace(/<[^>]*>/g, '')}
                      onChange={(e) => updateItem(item.id, 'answer', `<p>${e.target.value}</p>`)}
                      placeholder="Réponse à la question..."
                      rows={4}
                      className="block-input"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      HTML supporté. Le texte sera automatiquement enveloppé dans un paragraphe.
                    </p>
                  </div>
                </div>
              ))
            )}
            
            {/* Bouton Ajouter standardisé (comme ServicesBlock) */}
            <button
              type="button"
              onClick={addItem}
              className="w-full px-3 py-2 border border-gray-300 border-dashed rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors"
            >
              + Ajouter une Q&A
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

