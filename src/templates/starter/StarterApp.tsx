"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
// Important: utiliser le BlockRenderer branché sur le registry par template
import BlockRenderer from '@/blocks/BlockRenderer';
import FormattedText from '@/components/FormattedText';
import Image from 'next/image';
import { normalizeHref } from '@/utils/linkUtils';

type AnyObj = Record<string, any>;

function useSiteContent() {
  const [content, setContent] = useState<AnyObj | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch('/api/content', { cache: 'no-store' });
        const data = await res.json();
        if (mounted) setContent(data);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);
  return { content, loading } as const;
}

function StarterShell({ content, children }: { content: AnyObj; children: React.ReactNode }) {
  const search = useSearchParams();
  const withTpl = (href: string) => {
    const tpl = search?.get('template');
    if (!tpl) return href;
    return `${href}${href.includes('?') ? '&' : '?'}template=${tpl}`;
  };
  const items = Array.isArray(content?.nav?.items) && content.nav.items.length
    ? content.nav.items
    : ['home','work','studio','blog','contact'];
  const labelFor = (key: string) => {
    const entry = content?.nav?.pageLabels?.[key];
    if (!entry) return key;
    return typeof entry === 'string' ? entry : (entry.title || key);
  };
  const urlFor = (key: string) => (key === 'home' ? '/' : `/${key}`);

  // navAdapter: résout href/target en tenant compte de customUrl/target
  const navAdapter = (key: string) => {
    const meta = content?.nav?.pageLabels?.[key];
    // Si un objet avec customUrl est défini, on le normalise
    if (meta && typeof meta === 'object' && meta.customUrl) {
      const norm = normalizeHref(String(meta.customUrl));
      const isInternal = norm.kind === 'internal';
      const isAnchor = norm.kind === 'anchor';
      const href = isInternal ? withTpl(norm.href) : norm.href; // ne pas altérer les ancres
      const target = meta.target || norm.target; // priorité au choix admin
      const rel = target === '_blank' ? (norm.rel || 'noopener noreferrer') : undefined;
      return { href, target, rel } as { href: string; target?: string; rel?: string };
    }
    // Sinon URL interne par défaut
    return { href: withTpl(urlFor(key)) } as { href: string; target?: string; rel?: string };
  };

  return (
    <div className="starter-template font-sans text-gray-900">
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur border-b border-black/10">
        <div className="container mx-auto px-5 h-[68px] flex items-center justify-between">
          <a href={withTpl('/')} className="tracking-tight font-semibold">
            {content?.nav?.logo || 'STARTER'}
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-black/70">
            {items.map((key: string) => {
              const { href, target, rel } = navAdapter(key);
              return (
                <a key={key} href={href} target={target} rel={rel} className="hover:text-black transition-colors">
                  {labelFor(key)}
                </a>
              );
            })}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <Footer content={content?.footer} />
    </div>
  );
}

function Section({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-5">
        <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mb-6">{title}</h1>
        {children}
      </div>
    </section>
  );
}

export default function StarterApp() {
  const pathname = usePathname() || '/';
  const { content, loading } = useSiteContent();
  const search = useSearchParams();
  const withTpl = (href: string) => {
    const tpl = search?.get('template');
    if (!tpl) return href;
    return `${href}${href.includes('?') ? '&' : '?'}template=${tpl}`;
  };

  const route = useMemo(() => {
    if (pathname === '/') return 'home';
    if (pathname === '/work') return 'work';
    if (pathname.startsWith('/work/')) return 'work-slug';
    if (pathname === '/blog') return 'blog';
    if (pathname.startsWith('/blog/')) return 'blog-slug';
    if (pathname === '/studio') return 'studio';
    if (pathname === '/contact') return 'contact';
    return 'custom';
  }, [pathname]);

  if (loading || !content) return <div className="container mx-auto px-5 py-20">Chargement…</div>;

  const renderRich = (blocks?: any[], html?: string) => {
    if (Array.isArray(blocks) && blocks.length > 0) {
      return <BlockRenderer blocks={blocks} />;
    }
    if (html) {
      return (
        <div className="prose max-w-none">
          <FormattedText>{html}</FormattedText>
        </div>
      );
    }
    // Pas de fallback visuel: si rien n'est fourni, ne rien afficher
    return null;
  };

  const WorkList = ({ withTitle = false }: { withTitle?: boolean }) => {
    const projects = (content?.work?.adminProjects || content?.work?.projects || []) as any[];
    const Grid = (
      <div className="grid md:grid-cols-2 gap-8">
        {projects.map((p, i) => (
          <a key={i} href={(p.slug ? withTpl(`/work/${p.slug}`) : '#')} className="group">
            {p.image ? (
              <Image
                src={p.image}
                alt={p.alt || p.title || 'image projet'}
                width={1200}
                height={800}
                className="w-full h-auto rounded-lg object-cover aspect-[16/10]"
              />
            ) : (
              <div className="aspect-[16/10] bg-gray-100 rounded" />
            )}
            <div className="mt-3 flex items-center justify-between">
              <h3 className="font-medium text-lg">{p.title}</h3>
              {p.category && (
                <span className="text-xs text-black/50">{p.category}</span>
              )}
            </div>
            {(p.excerpt || p.description) && (
              <p className="text-sm text-black/60 mt-1">{p.excerpt || p.description}</p>
            )}
          </a>
        ))}
      </div>
    );
    return withTitle ? (
      <Section title={content?.work?.hero?.title || 'selected work'}>{Grid}</Section>
    ) : (
      // Sans titre, on garde un conteneur + marge verticale
      <section className="pt-0 pb-16">
        <div className="container mx-auto px-5">
          {Grid}
        </div>
      </section>
    );
  };

  const BlogList = () => (
    <Section title={content?.blog?.hero?.title || 'Blog'}>
      <div className="space-y-6">
        {(content?.blog?.articles || []).map((a: any, i: number) => (
          <a key={i} href={withTpl(`/blog/${a.slug || a.id}`)} className="block group">
            <h3 className="text-xl font-medium group-hover:underline">{a.title}</h3>
          </a>
        ))}
      </div>
    </Section>
  );

  const Project = () => {
    const slug = pathname.split('/').filter(Boolean)[1];
    const p = (content?.work?.adminProjects || content?.work?.projects || []).find((x: any) => x.slug === slug || x.id === slug);
    if (!p) return <Section title="Projet">Introuvable</Section>;
    return (
      <Section title={p.title}>
        <p className="text-black/70">{p.category}</p>
        <div className="mt-6">
          {renderRich(p.blocks, p.content || p.description || p.excerpt)}
        </div>
      </Section>
    );
  };

  const Article = () => {
    const slug = pathname.split('/').filter(Boolean)[1];
    const a = (content?.blog?.articles || []).find((x: any) => x.slug === slug || x.id === slug);
    if (!a) return <Section title="Article">Introuvable</Section>;
    return (
      <Section title={a.title}>
        <div className="mt-6">
          {renderRich(a.blocks, a.content || a.excerpt)}
        </div>
      </Section>
    );
  };

  const CustomPage = () => {
    const slug = pathname.split('/').filter(Boolean)[0];
    const pg = (content?.pages?.pages || []).find((x: any) => x.slug === slug || x.id === slug);
    return (
      <Section title={pg?.title || slug}>
        <div className="mt-6">
          {renderRich(pg?.blocks, pg?.content || pg?.description)}
        </div>
      </Section>
    );
  };

  return (
    <StarterShell content={content}>
      {route === 'home' && (
        <Section title={content?.hero?.title || 'Home'}>
          <div className="mt-4">
            {renderRich(content?.home?.blocks, content?.hero?.subtitle)}
          </div>
        </Section>
      )}
      {route === 'work' && (
        <>
          <Section title={content?.work?.hero?.title || 'Work'}>
            <div className="mt-4">
              {renderRich(content?.work?.blocks, content?.work?.description)}
            </div>
          </Section>
          {(() => {
            const hasProjectsInWork = Array.isArray(content?.work?.blocks) && content.work.blocks.some((b: any) => b?.type === 'projects');
            return hasProjectsInWork ? null : <WorkList withTitle={false} />;
          })()}
        </>
      )}
      {route === 'work-slug' && <Project />}
      {route === 'blog' && <BlogList />}
      {route === 'blog-slug' && <Article />}
      {route === 'studio' && (
        <Section title={content?.studio?.hero?.title || 'Studio'}>
          <div className="mt-6">
            {renderRich(content?.studio?.blocks, content?.studio?.description || content?.studio?.content?.description)}
          </div>
        </Section>
      )}
      {route === 'contact' && (
        <Section title={content?.contact?.hero?.title || 'Contact'}>
          <div className="mt-6">
            {renderRich(content?.contact?.blocks, content?.contact?.description)}
          </div>
        </Section>
      )}
      {route === 'custom' && <CustomPage />}
    </StarterShell>
  );
}

function Footer({ content }: { content: any }) {
  const search = useSearchParams();
  const description = content?.description;
  const links = Array.isArray(content?.links) ? content.links : [];
  const socials = content?.socialLinks || content?.socials || [];
  const copyright = content?.copyright || `© ${new Date().getFullYear()} — Starter`;
  const bottomLinks = Array.isArray(content?.bottomLinks) ? content.bottomLinks : [];
  const labelsMap = content?.legalPageLabels || {};

  // Revenir à la normalisation simple (comme avant)
  const normalizeHref = (url?: string) => {
    if (!url) return '#';
    if (url.startsWith('http')) return url;
    return url.startsWith('/') ? url : `/${url}`;
  };
  const withTpl = (href: string) => {
    const tpl = search?.get('template');
    if (!tpl) return href;
    // Conserver le template uniquement pour les liens internes
    if (!href || !href.startsWith('/')) return href;
    return `${href}${href.includes('?') ? '&' : '?'}template=${tpl}`;
  };
  const labelFor = (slug: string) => {
    const meta = labelsMap?.[slug];
    if (!meta) return String(slug).replace(/[-_]/g, ' ');
    return typeof meta === 'string' ? meta : (meta.title || slug);
  };

  return (
    <footer className="border-t border-black/10 mt-16">
      <div className="container mx-auto px-5 py-6 text-sm text-black/70">
        {/* Ligne principale: description + liens */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 min-w-0">
            {description && <p className="max-w-[60ch]">{description}</p>}
          </div>
          {!!links.length && (
            <nav className="flex items-center gap-4 flex-wrap">
              {links.map((l: any, i: number) => (
                <a key={i} href={withTpl(normalizeHref(l.url))} className="hover:text-black transition-colors">
                  {l.title || labelFor(l.url)}
                </a>
              ))}
            </nav>
          )}
        </div>

        {/* Bas de page: copyright + mentions (bottomLinks) */}
        <div className="mt-4 flex items-center justify-between text-xs text-black/60">
          <p>{copyright}</p>
          {!!bottomLinks.length && (
            <div className="flex items-center gap-4 flex-wrap">
              {bottomLinks.map((entry: any, i: number) => {
                if (typeof entry === 'string') {
                  return (
                    <a key={i} href={withTpl(normalizeHref(entry))} className="hover:text-black transition-colors">
                      {labelFor(entry)}
                    </a>
                  );
                }
                // objet { id, label, url }
                return (
                  <a key={entry.id || i} href={withTpl(normalizeHref(entry.url))} className="hover:text-black transition-colors">
                    {entry.label || labelFor(entry.url)}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Réseaux sociaux */}
        {!!socials.length && (
          <div className="mt-3 flex items-center justify-end gap-4">
            {socials.map((s: any, i: number) => (
              <a key={i} href={normalizeHref(s.url)} target={s.target || '_blank'} className="hover:text-black capitalize">
                {s.platform}
              </a>
            ))}
          </div>
        )}
      </div>
    </footer>
  );
}
