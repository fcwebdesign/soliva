import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import { readContent } from "@/lib/content";
import { draftMode } from 'next/headers';
import { SITE_NAME, SITE_URL, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { ReactNode } from "react";

import NavWrapper from "@/components/NavWrapper";
import ConditionalFooter from "@/components/ConditionalFooter";
import { getActiveTemplate } from "@/templates/get-active-template";
import { TemplateRenderer } from "@/templates/TemplateRenderer";
import { TemplateProvider } from "@/templates/context";
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
  const isAutonomous = !!activeTemplate?.autonomous;
  const templateKey = activeTemplate?.key ?? 'default';
  
  return (
    <ViewTransitions>
      <html lang="fr" className={`${isDraftMode ? 'preview-mode' : ''}`} data-template={templateKey}>
        <head>
          <meta name="cache-control" content="no-cache, no-store, must-revalidate" />
          <meta name="pragma" content="no-cache" />
          <meta name="expires" content="0" />
        </head>
        <body className={`site ${isDraftMode ? 'preview-mode' : ''}`}>
          {/* Preloader */}
          <Preloader />
          
          <TemplateProvider value={{ key: templateKey }}>
            {isAutonomous ? (
              // DÉLÉGATION TOTALE AU TEMPLATE
              <TemplateRenderer keyName={activeTemplate.key} />
            ) : (
                              // SHELL GLOBAL PAR DÉFAUT
              <>
                <NavWrapper initialContent={content.nav} />
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
