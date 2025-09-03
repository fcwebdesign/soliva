import BlogArticle from './page-client';

// Composant serveur qui rend le composant client
export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  return <BlogArticle />;
} 