import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import { readContent } from "@/lib/content";
import { draftMode, headers } from 'next/headers';
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { ReactNode } from "react";

import NavWrapper from "@/components/NavWrapper";
import ConditionalFooter from "@/components/ConditionalFooter";
import { getActiveTemplate } from "@/templates/get-active-template";
import { TemplateRenderer } from "@/templates/TemplateRenderer";
import { TemplateProvider } from "@/templates/context";
import ThemeTransitions from "@/templates/ThemeTransitions";
import { Toaster } from "@/components/ui/sonner";
import Preloader from "@/components/Preloader";


interface RootLayoutProps {
  children: ReactNode;
}

export async function generateMetadata() {
  const content = await readContent();
  return {
    metadataBase: new URL(SITE_URL),
    title: { 
      default: content.metadata.title || SITE_NAME, 
      template: `%s — ${SITE_NAME}` 
    },
    description: content.metadata.description || "Site officiel de " + SITE_NAME,
    alternates: { canonical: SITE_URL },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      images: [DEFAULT_OG_IMAGE],
      url: SITE_URL,
      locale: "fr_FR"
    },
    twitter: { 
      card: "summary_large_image" 
    }
  };
}

export default async function RootLayout({ children }: RootLayoutProps) {
  const content = await readContent();
  const { isEnabled: isDraftMode } = await draftMode();
  const activeTemplate = await getActiveTemplate();
  
  // Vérifier si on est sur une route d'admin
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';
  const isAdminRoute = pathname.startsWith('/admin') || 
                      pathname.startsWith('/debug-template') || 
                      pathname.startsWith('/apply-template');
  
  // Ne pas utiliser de template autonome sur les routes d'admin
  const isAutonomous = !!activeTemplate?.autonomous && !isAdminRoute;
  const templateKey = activeTemplate?.key ?? 'default';
  
  // Forcer le shell global pour l'admin
  if (isAdminRoute) {
    return (
      <ViewTransitions>
        <html lang="fr" className={`${isDraftMode ? 'preview-mode' : ''}`} data-template="soliva">
          <head>
            <meta name="cache-control" content="no-cache, no-store, must-revalidate" />
            <meta name="pragma" content="no-cache" />
            <meta name="expires" content="0" />
          </head>
          <body className={`site ${isDraftMode ? 'preview-mode' : ''}`}>
            <Preloader />
            <TemplateProvider value={{ key: 'soliva' }}>
              {/* Per-template page transitions (no-op for admin since key=soliva) */}
              <ThemeTransitions />
              <NavWrapper initialContent={{...content.nav, hiddenSystem: (content as any)?.pages?.hiddenSystem || []}} />
              {children}
              <ConditionalFooter initialContent={content.footer} />
            </TemplateProvider>
            <Toaster 
              position="top-center"
              toastOptions={{
                style: {
                  marginTop: '-10px',
                  backgroundColor: '#1f2937',
                  color: '#ffffff',
                  border: '1px solid #374151'
                },
                className: 'text-white',
                duration: 4000
              }}
              theme="dark"
            />
          </body>
        </html>
      </ViewTransitions>
    );
  }
  
  return (
    <ViewTransitions>
      <html lang="fr" className={`${isDraftMode ? 'preview-mode' : ''}`} data-template={templateKey}>
        <head>
          <meta name="cache-control" content="no-cache, no-store, must-revalidate" />
          <meta name="pragma" content="no-cache" />
          <meta name="expires" content="0" />
        </head>
        <body className={`${templateKey === 'pearl' ? '' : 'site'} ${isDraftMode ? 'preview-mode' : ''}`}>
          {/* Preloader */}
          <Preloader />
          
          <TemplateProvider value={{ key: templateKey }}>
            {/* Per-template page transitions */}
            <ThemeTransitions />
            {isAutonomous ? (
              // DÉLÉGATION TOTALE AU TEMPLATE
              <TemplateRenderer keyName={activeTemplate.key} />
            ) : (
                              // SHELL GLOBAL PAR DÉFAUT
              <>
                <NavWrapper initialContent={{...content.nav, hiddenSystem: (content as any)?.pages?.hiddenSystem || []}} />
                {children}
                <ConditionalFooter initialContent={content.footer} />
                
                {/* JSON-LD Organization */}
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "Organization",
                      name: SITE_NAME,
                      url: SITE_URL,
                      logo: `${SITE_URL}${DEFAULT_OG_IMAGE}`
                    })
                  }}
                />
                
                {/* JSON-LD WebSite */}
                <script
                  type="application/ld+json"
                  dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "WebSite",
                      name: SITE_NAME,
                      url: SITE_URL,
                      potentialAction: {
                        "@type": "SearchAction",
                        target: `${SITE_URL}/recherche?q={query}`,
                        "query-input": "required name=query"
                      }
                    })
                  }}
                />
              </>
            )}
          </TemplateProvider>
          <Toaster 
            position="top-center"
            toastOptions={{
              style: {
                marginTop: '-10px',
                backgroundColor: '#1f2937',
                color: '#ffffff',
                border: '1px solid #374151'
              },
              className: 'text-white',
              duration: 4000
            }}
            theme="dark"
          />
        </body>
      </html>
    </ViewTransitions>
  );
} 
