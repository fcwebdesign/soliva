"use client";
import { usePathname } from 'next/navigation';
import FooterWrapper from './FooterWrapper';

interface ConditionalFooterProps {
  initialContent: any;
}

const ConditionalFooter: React.FC<ConditionalFooterProps> = ({ initialContent }) => {
  const pathname = usePathname();
  
  // Ne pas afficher le footer dans l'admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return <FooterWrapper initialContent={initialContent} />;
};

export default ConditionalFooter; 