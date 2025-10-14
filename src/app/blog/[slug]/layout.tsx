import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Métadonnées de base pour les articles de blog
  return {
    title: `${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} — ${SITE_NAME}`,
    description: `Article de blog : ${slug.replace(/-/g, ' ')}`,
    openGraph: {
      title: `${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      description: `Article de blog : ${slug.replace(/-/g, ' ')}`,
      type: "article",
      siteName: SITE_NAME,
    },
    twitter: {
      card: "summary_large_image",
      title: `${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
      description: `Article de blog : ${slug.replace(/-/g, ' ')}`,
    },
  };
}

export default function BlogLayout({ children }: Props) {
  return children;
} 