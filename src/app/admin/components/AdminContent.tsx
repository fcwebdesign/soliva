"use client";
import React from 'react';
import BlockEditor from './BlockEditor';
import TemplateManager from './TemplateManager';
import HeaderManager from './HeaderManager';
import FooterManager from './FooterManager';
import MinimalisteManager from './MinimalisteManager';
import RevealSection from './sections/RevealSection';
import TypographySection from './sections/TypographySection';
import SpacingSection from './sections/SpacingSection';
import ColorPaletteSection from './sections/ColorPaletteSection';
import ScrollAnimationsSection from './sections/ScrollAnimationsSection';
import SeoBlock from '@/components/admin/SeoBlock';
import SchemaScript from '@/components/SchemaScript';
import { generateAllSchemas } from '@/lib/schema';
import type { Content } from '@/types/content';
import AISettings from './AISettings';

interface AdminContentProps {
  currentPage: string;
  currentPageConfig: {
    label: string;
    path: string | null;
    icon: string;
  } | null;
  content: Content | null;
  currentPageData: any;
  onUpdate: (updates: any) => void;
  onShowArticleGenerator: () => void;
  onTemplateChange: (newContent: Content) => void;
  onSave: (newContent: Content) => void;
  onUpdateContent: (newContent: Content) => void;
}

const AdminContent: React.FC<AdminContentProps> = ({
  currentPage,
  currentPageConfig,
  content,
  currentPageData,
  onUpdate,
  onShowArticleGenerator,
  onTemplateChange,
  onSave,
  onUpdate: onUpdateContent
}) => {
  const renderContent = () => {
    // Debug
    console.log('🔍 AdminContent - currentPage:', currentPage, 'content:', !!content);
    
    if (currentPage === 'ai') {
      return <AISettings />;
    }
    
    if (currentPage === 'templates') {
      return (
        <TemplateManager
          onTemplateChange={onTemplateChange}
        />
      );
    }
    
    if (currentPage === 'home' && content?._template === 'starter') {
      return (
        <MinimalisteManager
          content={content}
          onSave={onSave}
          onUpdate={onUpdateContent}
        />
      );
    }
    
    if (currentPage === 'nav') {
      return (
        <HeaderManager
          content={content}
          onSave={onSave}
        />
      );
    }
    
    if (currentPage === 'reveal') {
      return (
        <RevealSection
          localData={content || {}}
          updateField={(path, value) => {
            const keys = path.split('.');
            const newContent = { ...content };
            let current = newContent as any;
            
            for (let i = 0; i < keys.length - 1; i++) {
              if (!current[keys[i]]) current[keys[i]] = {};
              current = current[keys[i]];
            }
            
            current[keys[keys.length - 1]] = value;
            onUpdateContent(newContent as Content);
          }}
        />
      );
    }
    
    if (currentPage === 'typography') {
      return (
        <TypographySection
          localData={content || {}}
          updateField={(path, value) => {
            const keys = path.split('.');
            const newContent = { ...content };
            let current = newContent as any;

            for (let i = 0; i < keys.length - 1; i++) {
              if (!current[keys[i]]) current[keys[i]] = {};
              current = current[keys[i]];
            }

            // FIX CRITIQUE : Si on sauvegarde typography, utiliser la fonction de nettoyage centralisée
            if (keys[keys.length - 1] === 'typography' && typeof value === 'object' && value !== null) {
              // Utiliser la fonction de nettoyage centralisée
              const { cleanTypography } = require('@/utils/clean-typography');
              current[keys[keys.length - 1]] = cleanTypography(value);
            } else {
            current[keys[keys.length - 1]] = value;
            }
            
            onUpdateContent(newContent as Content);
          }}
        />
      );
    }

    if (currentPage === 'spacing') {
      return (
        <SpacingSection
          localData={content || {}}
          updateField={(path, value) => {
            const keys = path.split('.');
            const newContent = { ...content } as any;
            let current = newContent;

            for (let i = 0; i < keys.length - 1; i++) {
              if (!current[keys[i]]) current[keys[i]] = {};
              current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            onUpdateContent(newContent);
          }}
        />
      );
    }
    
    if (currentPage === 'colors') {
      return (
        <ColorPaletteSection
          localData={content || {}}
          updateField={(path, value) => {
            const keys = path.split('.');
            const newContent = { ...content };
            let current = newContent as any;

            for (let i = 0; i < keys.length - 1; i++) {
              if (!current[keys[i]]) current[keys[i]] = {};
              current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            onUpdateContent(newContent as Content);
          }}
        />
      );
    }

    if (currentPage === 'scroll-animations') {
      return (
        <ScrollAnimationsSection
          localData={content || {}}
          updateField={(path, value) => {
            const keys = path.split('.');
            const newContent = { ...content } as any;
            let current = newContent;

            for (let i = 0; i < keys.length - 1; i++) {
              if (!current[keys[i]]) current[keys[i]] = {};
              current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            onUpdateContent(newContent);
          }}
        />
      );
    }
    
    if (currentPage === 'footer') {
      return (
        <FooterManager
          content={content}
          onSave={onSave}
          onUpdate={(updates) => onUpdate(updates)}
        />
      );
    }
    
    return (
      <div>
        <BlockEditor
          pageData={currentPageData}
          pageKey={currentPage}
          onUpdate={onUpdate}
          onShowArticleGenerator={onShowArticleGenerator}
        />
        
        {/* Bloc SEO pour les pages principales */}
        {['home', 'studio', 'contact', 'work', 'blog'].includes(currentPage) && (
          <div className="mt-8">
            <SeoBlock
              content={{
                id: currentPage,
                type: 'page',
                title: (currentPageData as any)?.hero?.title || (currentPageData as any)?.title || `${currentPageConfig?.label} - Soliva`,
                slug: currentPageConfig?.path || `/${currentPage}`,
                contentHtml: (currentPageData as any)?.blocks || (currentPageData as any)?.content || (currentPageData as any)?.description || '',
                excerpt: (currentPageData as any)?.description || (currentPageData as any)?.hero?.subtitle || '',
                category: currentPage === 'blog' ? 'Blog' : currentPage === 'work' ? 'Portfolio' : 'Page',
                tags: [],
                publishedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                seo: (currentPageData as any)?.seo || {}
              }}
              seoFields={(currentPageData as any)?.seo || {}}
              onSeoChange={(seo) => {
                onUpdate({ seo });
              }}
            />
          </div>
        )}
        
        {/* Scripts de schéma pour les pages principales - TODO: Implémenter la génération de schémas */}
      </div>
    );
  };

  return (
    <main className="flex-1 p-6">
      <div className="w-full">
        {currentPageConfig && renderContent()}
      </div>
    </main>
  );
};

export default AdminContent;
