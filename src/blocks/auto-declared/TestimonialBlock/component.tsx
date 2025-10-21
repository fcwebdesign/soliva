import React from 'react';
import Image from 'next/image';

interface TestimonialData {
  testimonial: string;
  author: string;
  company: string;
  role?: string;
  avatar?: {
    src: string;
    alt: string;
  };
  rating?: number;
  theme: 'light' | 'dark' | 'auto';
}

export default function TestimonialBlock({ data }: { data: TestimonialData }) {
  const getThemeClasses = () => {
    if (data.theme === 'light') {
      return {
        container: 'bg-gray-50 text-gray-900',
        card: 'bg-white border-gray-200',
        text: 'text-gray-700',
        meta: 'text-gray-500',
        star: 'text-yellow-400'
      };
    }
    if (data.theme === 'dark') {
      return {
        container: 'bg-gray-900 text-white',
        card: 'bg-gray-800 border-gray-700',
        text: 'text-gray-300',
        meta: 'text-gray-400',
        star: 'text-yellow-500'
      };
    }
    // Auto - sera surchargé par CSS
    return {
      container: 'bg-gray-50 text-gray-900',
      card: 'bg-white border-gray-200',
      text: 'text-gray-700',
      meta: 'text-gray-500',
      star: 'text-yellow-400'
    };
  };

  const themeClasses = getThemeClasses();

  // Génération des étoiles
  const renderStars = () => {
    if (!data.rating || data.rating <= 0) return null;
    
    return (
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <span
            key={i}
            className={`text-lg ${
              i < data.rating! ? themeClasses.star : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  return (
    <div 
      className={`py-12 px-4 ${themeClasses.container} transition-colors`}
      data-block-type="testimonial"
      data-block-theme={data.theme}
    >
      <div className="max-w-4xl mx-auto">
        <div className={`${themeClasses.card} border rounded-2xl p-8 shadow-sm`}>
          {/* Rating */}
          {renderStars()}

          {/* Testimonial Text */}
          <div className={`text-lg leading-relaxed mb-6 ${themeClasses.text}`}>
            <span className="text-4xl leading-none text-gray-400">"</span>
            {data.testimonial}
            <span className="text-4xl leading-none text-gray-400">"</span>
          </div>

          {/* Author Info */}
          <div className="flex items-center gap-4">
            {data.avatar && (
              <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={data.avatar.src}
                  alt={data.avatar.alt}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            
            <div>
              <div className="font-semibold text-lg">{data.author}</div>
              <div className={`text-sm ${themeClasses.meta}`}>
                {data.role && `${data.role}, `}{data.company}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

