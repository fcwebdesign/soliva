"use client";

const MinimalisteFeatured = ({ content }) => {
  // Debug: log des données reçues
  console.log('🎯 MinimalisteFeatured: Données reçues', content);

  return (
    <section aria-label="Featured" className="border-y border-black/5">
      <div className="container py-10 md:py-14">
        <div className="aspect-[21/9] w-full overflow-hidden">
          <img 
            src={content?.image?.src || content?.src || "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=2000&auto=format&fit=crop"} 
            alt={content?.image?.alt || content?.alt || "Projet en vedette"} 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>
    </section>
  );
};

export default MinimalisteFeatured; 