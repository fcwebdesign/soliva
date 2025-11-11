"use client";
import React from 'react';
import { Link } from 'next-view-transitions';
import { getTypographyConfig, getTypographyClasses, getCustomColor, defaultTypography } from '@/utils/typography';

type Article = {
  id?: string;
  slug?: string;
  title?: string;
  status?: 'draft' | 'published';
};

export default function BlogPearl({ content, fullContent }: { 
  content?: { hero?: { title?: string; subtitle?: string }; description?: string; articles?: Article[] };
  fullContent?: any;
}) {
  const title = content?.hero?.title || 'Journal';
  const subtitle = content?.hero?.subtitle || content?.description || '';
  const articles: Article[] = Array.isArray((content as any)?.articles) ? ((content as any)?.articles as Article[]) : [];

  const visibleArticles = articles.filter(a => (a.status === 'published' || !a.status));

  // Récupérer les styles typographiques
  const typoConfig = getTypographyConfig(fullContent || {});
  const h1Classes = getTypographyClasses('h1', typoConfig, defaultTypography.h1);
  const pClasses = getTypographyClasses('p', typoConfig, defaultTypography.p);
  const h1CustomColor = getCustomColor('h1', typoConfig);
  const pCustomColor = getCustomColor('p', typoConfig);

  return (
    <section>
      <div className="py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          {/* Titre à gauche */}
          <div className="text-left">
        <h1 
          className={h1Classes}
          style={h1CustomColor ? { color: h1CustomColor } : undefined}
        >
          {title}
        </h1>
          </div>
          
          {/* Description à droite, alignée à droite et en bas */}
        {subtitle && (
            <div className="text-left md:text-right">
              <div
                className={`max-w-2xl md:ml-auto ${pClasses}`}
                style={pCustomColor ? { color: pCustomColor } : { color: 'var(--foreground)' }}
                dangerouslySetInnerHTML={{ __html: subtitle }}
              />
            </div>
        )}
        </div>
      </div>

      {visibleArticles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">Aucun article pour l'instant.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {visibleArticles.map((article) => {
            const articleHref = `/blog/${article.slug || article.id}`;
            
            return (
              <article key={article.slug || article.id} data-view-transition-name={`article-preview-${article.slug || article.id}`}>
                <h2 className="text-xl font-semibold text-foreground">
                  <Link 
                    href={articleHref}
                    className="hover:text-muted-foreground"
                    data-view-transition-name={`article-link-${article.slug || article.id}`}
                  >
                    {article.title || 'Article'}
                  </Link>
                </h2>
                <hr className="mt-4 border-border" />
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}


