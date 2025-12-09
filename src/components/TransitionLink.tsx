"use client";
import Link from 'next/link';
import { usePageTransitions } from '@/hooks/usePageTransitions';

interface TransitionLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  [key: string]: any; // Pour passer d'autres props
}

export default function TransitionLink({ 
  href, 
  children, 
  className, 
  target, 
  onClick,
  ...props 
}: TransitionLinkProps) {
  const { handleLinkClick } = usePageTransitions();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Appeler le onClick personnalisé s'il existe
    if (onClick) {
      onClick(e);
    }

    // Appliquer les transitions pour les liens internes
    handleLinkClick(href, e);
  };

  return (
    <Link
      href={href}
      target={target}
      className={className}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
