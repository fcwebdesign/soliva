'use client';
import React from 'react';
import { FieldConfig, FieldType } from '@/blocks/auto-declared/types/fields';

interface GenericBlockEditorProps {
  blockData: any;
  fields: Record<string, FieldConfig>;
  onChange: (field: string, value: any) => void;
}

export default function GenericBlockEditor({ blockData, fields, onChange }: GenericBlockEditorProps) {
  
  const renderField = (fieldName: string, config: FieldConfig) => {
    const value = blockData[fieldName] ?? config.defaultValue ?? '';
    
    switch (config.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(fieldName, e.target.value)}
            placeholder={config.placeholder}
            className="w-full p-2 border rounded"
            required={config.required}
          />
        );
        
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => onChange(fieldName, e.target.value)}
            placeholder={config.placeholder}
            className="w-full p-2 border rounded h-24"
            required={config.required}
          />
        );
        
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(fieldName, parseInt(e.target.value))}
            min={config.min}
            max={config.max}
            className="w-full p-2 border rounded"
            required={config.required}
          />
        );
        
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => onChange(fieldName, e.target.value)}
            className="w-full p-2 border rounded"
            required={config.required}
          >
            {config.options?.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );
        
      case 'toggle':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(fieldName, e.target.checked)}
              className="rounded"
            />
            <span>Activé</span>
          </label>
        );
        
      case 'color':
        return (
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(fieldName, e.target.value)}
            className="w-16 h-10 border rounded"
          />
        );
        
      case 'image':
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={value?.src || ''}
              onChange={(e) => onChange(fieldName, { ...value, src: e.target.value })}
              placeholder="URL de l'image"
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              value={value?.alt || ''}
              onChange={(e) => onChange(fieldName, { ...value, alt: e.target.value })}
              placeholder="Texte alternatif"
              className="w-full p-2 border rounded"
            />
          </div>
        );
        
      default:
        return (
          <div className="text-gray-500 italic">
            Type de champ non supporté : {config.type}
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {Object.entries(fields).map(([fieldName, config]) => (
        <div key={fieldName} className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">
            {config.label}
            {config.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {renderField(fieldName, config)}
        </div>
      ))}
    </div>
  );
}
