import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import { readContent } from "@/lib/content";
import { draftMode } from 'next/headers';

import NavWrapper from "@/components/NavWrapper";
import ConditionalFooter from "@/components/ConditionalFooter";
import { getActiveTemplate } from "@/templates/get-active-template";
import { TemplateRenderer } from "@/templates/TemplateRenderer";
import { TemplateProvider } from "@/templates/context";

export async function generateMetadata() {
  const content = await readContent();
  return {
    title: content.metadata.title,
    description: content.metadata.description,
  };
}

export default async function RootLayout({ children }) {
  const content = await readContent();
  const { isEnabled: isDraftMode } = await draftMode();
  const activeTemplate = await getActiveTemplate();
  const isAutonomous = !!activeTemplate?.autonomous;
  const templateKey = activeTemplate?.key ?? 'default';
  
  console.log('🔍 Layout Debug:', {
    isDraftMode,
    activeTemplate: activeTemplate?.key || 'none',
    autonomous: activeTemplate?.autonomous || false,
    isAutonomous,
    contentTemplate: content._template || 'none'
  });
  
  return (
    <ViewTransitions>
      <html lang="fr" className={isDraftMode ? 'preview-mode' : ''} data-template={templateKey}>
        <head>
          <meta name="cache-control" content="no-cache, no-store, must-revalidate" />
          <meta name="pragma" content="no-cache" />
          <meta name="expires" content="0" />
        </head>
        <body className={isDraftMode ? 'preview-mode' : ''}>
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
              </>
            )}
          </TemplateProvider>
        </body>
      </html>
    </ViewTransitions>
  );
} 