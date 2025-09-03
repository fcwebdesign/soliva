import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/seo";

type Props = {
  children: React.ReactNode;
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug;
  
  // Transformer le slug en titre lisible
  const title = slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Métadonnées pour les pages custom
  return {
    title: `${title} — ${SITE_NAME}`,
    description: `Page ${title.toLowerCase()} du site ${SITE_NAME}`,
    openGraph: {
      title: title,
      description: `Page ${title.toLowerCase()} du site ${SITE_NAME}`,
      type: "website",
      siteName: SITE_NAME,
      url: `/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: `Page ${title.toLowerCase()} du site ${SITE_NAME}`,
    },
    alternates: {
      canonical: `/${slug}`,
    },
  };
}

export default function CustomPageLayout({ children }: Props) {
  return children;
} 