"use client";
import { useTransitionRouter } from "next-view-transitions";
import { useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import Link from "next/link";
import { detectLinkKind } from "@/utils/linkUtils";
import { usePageTransitions } from '@/hooks/usePageTransitions';

interface FormattedTextProps {
  children: string;
  className?: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ children, className = "" }) => {
  const router = useTransitionRouter();
  const ref = useRef<HTMLDivElement>(null);
  const { handleLinkClick } = usePageTransitions();

  if (!children) return null;


  // Vérifier si c'est du HTML ou du Markdown
  const isHtml = children.includes('<') && children.includes('>');

  useEffect(() => {
    const el = ref.current;
    if (!el || !isHtml) return undefined;

    // Utiliser le hook pour les transitions
    const onClick = (e: MouseEvent): void => {
      const target = e.target as HTMLElement;
      const a = target.closest("a[href]") as HTMLAnchorElement;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      
      handleLinkClick(href, e as any);
    };

    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, [router, isHtml]);

  if (isHtml) {
    return (
      <div 
        ref={ref}
        className={`formatted-content ${className}`}
        dangerouslySetInnerHTML={{ __html: children }}
      />
    );
  }

  return (
    <div className={`formatted-content ${className}`}>
      <ReactMarkdown>{children}</ReactMarkdown>
    </div>
  );
};

export default FormattedText;
