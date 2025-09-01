import React from 'react';

interface ServicesBlockProps {
  id: string;
  type: string;
  title?: string;
  offerings: Array<{
    id: string;
    title: string;
    description: string;
    icon?: string;
  }>;
  theme?: 'light' | 'dark' | 'auto';
}

export default function ServicesBlock({ title = "OUR CORE OFFERINGS", offerings }: ServicesBlockProps) {
  return (
    <section className="service-offerings-section py-28">
      <div className="container mx-auto">
        {title && (
          <div className="mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {title}
            </h2>
          </div>
        )}
        
        <div className="space-y-0">
          {offerings.map((offering, index) => (
            <div 
              key={offering.id || index}
              className="service-offering-block border-b border-black/10 py-8 last:border-b-0 is-visible"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                <div className="md:col-span-5">
                  {offering.icon && (
                    <div className="mb-2">
                      <span className="text-blue-400 text-lg">{offering.icon}</span>
                    </div>
                  )}
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {offering.title}
                  </h3>
                </div>
                
                <div className="md:col-span-5 flex justify-end">
                  <div 
                    className="max-w-[68ch]"
                    dangerouslySetInnerHTML={{ __html: offering.description || '' }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
