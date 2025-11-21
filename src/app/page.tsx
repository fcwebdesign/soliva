import React from "react";
import { loadTemplateMetadata } from '@/lib/load-template-metadata';
import HomeClient from './home-client';
import BlockRenderer from '@/blocks/BlockRenderer';
import PageHeader from '@/components/PageHeader';

export default async function Home() {
  // ✅ OPTIMISATION : Utiliser loadTemplateMetadata au lieu de readContent (41 MB → ~100 Ko)
  const content = await loadTemplateMetadata();

  // Support de l'alias de page d'accueil: content.pages.home = { mode: 'system' | 'custom', id?: string }
  const homeSel = (content as any)?.pages?.home as { mode?: 'system' | 'custom'; id?: string } | undefined;
  const customPages = (content as any)?.pages?.pages as any[] | undefined;

  if (homeSel?.mode === 'custom' && homeSel.id && Array.isArray(customPages)) {
    const page = customPages.find(p => p.id === homeSel.id);
    if (page) {
      const title = page.title || '';
      const description = page.description || '';
      const blocks = page.blocks || [];
      return (
        <div className="project-page">
          <div className="col">
            <PageHeader
              title={title}
              description={description}
              titleClassName="work-header"
              sticky={true}
              stickyTop="top-32"
            />
          </div>
          <div className="col">
            <div className="project-content">
              {Array.isArray(blocks) && blocks.length > 0 ? (
                <BlockRenderer blocks={blocks} />
              ) : (
                <div className="project-description">
                  <p>Cette page n'a pas encore de contenu.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
  }

  // Fallback vers la home système
  return <HomeClient content={content.home} />;
}

