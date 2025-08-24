import FormattedText from './FormattedText';
import HeroSignature from './HeroSignature';
import StorytellingSection from './StorytellingSection';

const BlockRenderer = ({ blocks = [] }) => {
  const renderBlock = (block) => {
    switch (block.type) {
      case 'content':
        return (
          <div key={block.id} className="block-content">
            <FormattedText>
              {block.content}
            </FormattedText>
          </div>
        );
      
      case 'h2':
        return (
          <h2 key={block.id} className="block-h2">
            {block.content}
          </h2>
        );
      
      case 'h3':
        return (
          <h3 key={block.id} className="block-h3">
            {block.content}
          </h3>
        );
      
      case 'image':
        return (
          <div key={block.id} className="block-image">
            <img 
              src={block.image?.src} 
              alt={block.image?.alt || ''} 
              className="w-full h-auto"
            />
          </div>
        );
      
      case 'cta':
        return (
          <div key={block.id} className="block-cta">
            <button className="cta-button">
              {block.ctaText || block.content}
            </button>
          </div>
        );
      
      case 'hero-signature':
        return (
          <HeroSignature key={block.id} block={block} />
        );
      
      case 'storytelling':
        return (
          <StorytellingSection key={block.id} block={block} />
        );
      
      case 'services':
        return (
          <section key={block.id} className="service-offerings-section py-16">
            <div className="container mx-auto">
              {/* Titre de la section */}
              {block.title && (
                <div className="mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {block.title}
                  </h2>
                </div>
              )}
              
              {/* Liste des offres de service */}
              <div className="space-y-0">
                {(block.offerings || []).map((offering, index) => (
                  <div 
                    key={offering.id || index}
                    className="service-offering-block border-b border-black/10 py-8 last:border-b-0"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      {/* Colonne de gauche - Titre */}
                      <div className="md:col-span-7">
                        {offering.icon && (
                          <div className="mb-2">
                            <span className="text-blue-400 text-lg">{offering.icon}</span>
                          </div>
                        )}
                        <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                          {offering.title}
                        </h3>
                      </div>
                      
                      {/* Colonne de droite - Description */}
                      <div className="md:col-span-5 flex justify-end">
                        <p className="max-w-[68ch]">
                          {offering.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      
      default:
        return (
          <div key={block.id} className="block-unknown">
            <p>Type de bloc non reconnu: {block.type}</p>
          </div>
        );
    }
  };

  return (
    <div className="blocks-container">
      {blocks.map(renderBlock)}
    </div>
  );
};

export default BlockRenderer; 