"use client";
import Image from 'next/image';

interface MinimalisteFeaturedProps {
  content: {
    image?: {
      src?: string;
      alt?: string;
    };
    src?: string;
    alt?: string;
  };
}

const MinimalisteFeatured: React.FC<MinimalisteFeaturedProps> = ({ content }) => {
  // Debug: log des données reçues
  console.log('🎯 MinimalisteFeatured: Données reçues', content);

  const imageSrc = content?.image?.src || content?.src || "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=2000&auto=format&fit=crop";
  const imageAlt = content?.image?.alt || content?.alt || "Projet en vedette";

  return (
    <section aria-label="Featured" className="border-y border-black/5">
      <div className="container py-10 md:py-14">
        <div className="aspect-[21/9] w-full overflow-hidden">
          <Image 
            src={imageSrc}
            alt={imageAlt}
            width={2000}
            height={857}
            className="w-full h-full object-cover"
            priority
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
          />
        </div>
      </div>
    </section>
  );
};

export default MinimalisteFeatured;
