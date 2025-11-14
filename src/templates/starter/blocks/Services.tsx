import React from 'react';

type Offering = {
  id?: string;
  title?: string;
  description?: string;
  icon?: string;
};

type ServicesData = {
  title?: string;
  subtitle?: string;
  offerings?: Offering[];
  layout?: 'grid-2' | 'grid-3' | 'grid-4';
  columns?: number; // alias direct si fourni par l'admin
};

export default function ServicesBlockStarter({ title, subtitle, offerings = [], layout, columns }: ServicesData) {
  const items = offerings || [];
  const cols = Math.max(1, Math.min(4,
    columns ?? (layout === 'grid-4' ? 4 : layout === 'grid-2' ? 2 : 3)
  ));

  return (
    <section className="starter-services" data-block-type="services">
      <div className="container mx-auto px-5">
        {(title || subtitle) && (
          <header className="mb-8">
            {title && (
              <h2 className="title text-3xl md:text-5xl font-semibold tracking-tight">{title}</h2>
            )}
            {subtitle && (
              <p className="mt-2 text-black/60">{subtitle}</p>
            )}
          </header>
        )}

        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {items.map((it, i) => (
            <article key={it.id || i} className="p-6 border rounded-lg bg-white">
              {it.icon && (
                <div className="mb-3 text-2xl" aria-hidden>
                  {it.icon}
                </div>
              )}
              {it.title && (
                <h3 className="text-lg font-medium mb-2">{it.title}</h3>
              )}
              {it.description && (
                <div
                  className="prose max-w-none text-black/70"
                  dangerouslySetInnerHTML={{ __html: it.description }}
                />
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
