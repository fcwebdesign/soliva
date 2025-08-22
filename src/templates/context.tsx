'use client';
import { createContext, useContext } from 'react';

const TemplateContext = createContext<{ key: string }>({ key: 'default' });

export const useTemplate = () => useContext(TemplateContext);

export function TemplateProvider({
  value, 
  children,
}: { 
  value: { key: string }; 
  children: React.ReactNode;
}) {
  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
} 