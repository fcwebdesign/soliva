"use client";
import React, { useState } from 'react';

interface Logo {
  src: string;
  alt: string;
}

const LogoDragDropDemo = () => {
  const [logos, setLogos] = useState<Logo[]>([
    { src: '/api/placeholder/150/150?text=Logo+1', alt: 'Logo 1' },
    { src: '/api/placeholder/150/150?text=Logo+2', alt: 'Logo 2' },
    { src: '/api/placeholder/150/150?text=Logo+3', alt: 'Logo 3' },
    { src: '/api/placeholder/150/150?text=Logo+4', alt: 'Logo 4' },
  ]);
  
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    document.body.classList.add('dragging');
    
    const target = e.currentTarget as HTMLElement;
    target.classList.add('dragging');
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newLogos = [...logos];
    const [draggedLogo] = newLogos.splice(draggedIndex, 1);
    newLogos.splice(dropIndex, 0, draggedLogo);
    
    setLogos(newLogos);
    setDraggedIndex(null);
    setDragOverIndex(null);
    document.body.classList.remove('dragging');
  };

  const handleDragEnd = () => {
    document.querySelectorAll('.logo-drag-item.dragging').forEach(el => {
      el.classList.remove('dragging');
    });
    
    setDraggedIndex(null);
    setDragOverIndex(null);
    document.body.classList.remove('dragging');
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Démonstration Drag & Drop - Logos Clients
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {logos.map((logo, index) => (
          <div 
            key={index}
            data-logo-index={index}
            className={`logo-drop-zone p-3 border border-gray-200 rounded-lg transition-all duration-200 ${
              draggedIndex === index ? 'dragging' : ''
            } ${
              dragOverIndex === index && draggedIndex !== index 
                ? 'drag-over' 
                : ''
            }`}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragLeave={(e) => {
              // S'assurer que la zone de drop se désactive quand on quitte
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverIndex(null);
              }
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div 
                className="logo-drag-item flex items-center gap-2"
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
              >
                <span className="logo-drag-handle text-xs">⋮⋮</span>
                <span className="text-xs font-medium text-gray-600">{logo.alt}</span>
              </div>
            </div>
            
            {/* Indicateur de drop */}
            <div className="logo-drop-indicator">
              Déposer ici
            </div>
            
            <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-xs text-gray-500">{logo.alt}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>💡 <strong>Instructions :</strong></p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Cliquez et glissez sur les icônes ⋮⋮ pour réorganiser les logos</li>
          <li>Les zones de drop s'illuminent quand vous survolez avec un élément</li>
          <li>L'élément en cours de déplacement devient semi-transparent</li>
          <li>Relâchez pour déposer l'élément à sa nouvelle position</li>
        </ul>
      </div>
    </div>
  );
};

export default LogoDragDropDemo; 