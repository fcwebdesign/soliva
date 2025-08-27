import { ContactBlock } from '../types';

export default function Contact(props: ContactBlock) {
  const { title, ctaText, ctaLink } = props;
  
  if (!title && !ctaText && !ctaLink) {
    return null;
  }

  return (
    <div className="contact-block bg-gray-50 dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-2 h-8 bg-black dark:bg-white mr-4"></div>
          <h3 className="text-lg font-medium text-black dark:text-white">{title || ''}</h3>
        </div>
        <a 
          href={ctaLink || '#'} 
          className="px-6 py-3 rounded-lg font-medium transition-colors contact-button"
        >
          {ctaText || 'Contact'}
        </a>
      </div>
    </div>
  );
} 