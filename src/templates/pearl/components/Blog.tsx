"use client";
import React from 'react';

type Article = {
  id?: string;
  slug?: string;
  title?: string;
  status?: 'draft' | 'published';
};

export default function BlogPearl({ content }: { content?: { hero?: { title?: string; subtitle?: string }; description?: string; articles?: Article[] } }) {
  const title = content?.hero?.title || 'Journal';
  const subtitle = content?.hero?.subtitle || content?.description || '';
  const articles: Article[] = Array.isArray(content?.articles) ? (content?.articles as Article[]) : [];

  const visibleArticles = articles.filter(a => (a.status === 'published' || !a.status));

  return (
    <section>
      <div className="text-center py-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">{title}</h1>
        {subtitle && <p className="mt-3 text-gray-600 max-w-2xl mx-auto">{subtitle}</p>}
      </div>

      {visibleArticles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Aucun article pour l’instant.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {visibleArticles.map((article) => (
            <article key={article.slug || article.id}>
              <h2 className="text-xl font-semibold text-gray-900">
                <a href={`/blog/${article.slug || article.id}`} className="hover:text-gray-700">{article.title || 'Article'}</a>
              </h2>
              <hr className="mt-4 border-gray-200" />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}


