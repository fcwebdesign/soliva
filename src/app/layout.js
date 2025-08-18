import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import { readContent } from "@/lib/content";

import Nav from "@/components/Nav";

export async function generateMetadata() {
  const content = await readContent();
  return {
    title: content.metadata.title,
    description: content.metadata.description,
  };
}

export default async function RootLayout({ children }) {
  const content = await readContent();
  
  return (
    <ViewTransitions>
      <html lang="en">
        <body>
          <Nav content={content.nav} />
          {children}
        </body>
      </html>
    </ViewTransitions>
  );
}
