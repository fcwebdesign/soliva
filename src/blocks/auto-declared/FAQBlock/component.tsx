'use client';

import React, { useState } from 'react';
import { useTheme } from '../../../hooks/useTheme';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

interface FAQBlockData {
  items?: FAQItem[];
  theme?: 'light' | 'dark' | 'auto';
}

export default function FAQBlock({ data }: { data: FAQBlockData }) {
  const { mounted } = useTheme();
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  if (!mounted) {
    return <div className="min-h-[200px]" />;
  }

  const items = data.items || [];
  const theme = data.theme || 'auto';

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (items.length === 0) {
    return (
      <div className="py-12 px-4 text-center opacity-50">
        <p>Aucune question pour le moment.</p>
      </div>
    );
  }

  return (
    <div 
      className="faq-block py-12 px-4 lg:px-6"
      data-theme={theme}
    >
      <div className="max-w-4xl mx-auto space-y-4">
        {items.map((item) => {
          const isOpen = openItems.has(item.id);
          
          return (
            <div
              key={item.id}
              className="faq-item border-b border-current/10 last:border-0"
            >
              <button
                onClick={() => toggleItem(item.id)}
                className="w-full py-6 flex items-start justify-between text-left gap-4 hover:opacity-70 transition-opacity duration-300"
                aria-expanded={isOpen}
              >
                <span className="text-lg font-medium flex-1">
                  {item.question}
                </span>
                <span 
                  className="text-2xl font-light transition-transform duration-300 flex-shrink-0"
                  style={{
                    transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)'
                  }}
                >
                  +
                </span>
              </button>
              
              <div
                className="overflow-hidden transition-all duration-300 ease-in-out"
                style={{
                  maxHeight: isOpen ? '1000px' : '0px',
                  opacity: isOpen ? 1 : 0
                }}
              >
                <div 
                  className="pb-6 prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: item.answer }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

