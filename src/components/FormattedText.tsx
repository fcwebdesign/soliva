"use client";
import { useTransitionRouter } from "next-view-transitions";
import { useEffect, useRef } from "react";
import ReactMarkdown from 'react-markdown';
import Link from "next/link";
import { detectLinkKind } from "@/utils/linkUtils";

interface FormattedTextProps {
  children: string;
  className?: string;
}

const FormattedText: React.FC<FormattedTextProps> = ({ children, className = "" }) => {
  const router = useTransitionRouter();
  const ref = useRef<HTMLDivElement>(null);

  if (!children) return null;


  // Vérifier si c'est du HTML ou du Markdown
  const isHtml = children.includes('<') && children.includes('>');

  useEffect(() => {
    const el = ref.current;
    if (!el || !isHtml) return undefined;

    const isSafari = (): boolean => {
      const ua = navigator.userAgent.toLowerCase();
      return ua.includes("safari") && !ua.includes("chrome");
    };

    const isBasicTransition = (): boolean => {
      const ua = navigator.userAgent.toLowerCase();
      return ua.includes("firefox") || isSafari();
    };

    function triggerPageTransition(path: string): void {
      if (isBasicTransition()) {
        const curtain = document.getElementById("curtain");
        if (!curtain) return;

        curtain.style.transform = "translateY(0%)";

        const delay = isSafari() ? 1000 : 600;

        setTimeout(() => {
          router.push(path);
        }, delay);

        return;
      }

      // Chrome → animation native via clipPath avec cercle
      document.documentElement.animate(
        [
          {
            // Étape 1 : cercle très petit au centre
            clipPath: "circle(0% at 50% 50%)"
          },
          {
            // Étape 2 : cercle qui s'agrandit pour couvrir tout l'écran
            clipPath: "circle(150% at 50% 50%)",
          },
        ],
        {
          duration: 2000,
          easing: "cubic-bezier(0.9, 0, 0.1, 1)",
          pseudoElement: "::view-transition-new(root)",
        }
      );
    }

    const onClick = (e: MouseEvent): void => {
      const target = e.target as HTMLElement;
      const a = target.closest("a[href]") as HTMLAnchorElement;
      if (!a) return;
      const href = a.getAttribute("href") || "";
      const isInternal = href.startsWith("/") || href.startsWith("#");
      const withMod = e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;

      // ⬇️ Toujours SPA pour l'interne (on ignore target _blank hérité par erreur)
      if (isInternal && !withMod) {
        e.preventDefault();
        if (href.startsWith("#")) {
          document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
        } else {
          // Utiliser le système de transitions personnalisé
          if (isBasicTransition()) {
            triggerPageTransition(href);
          } else {
            router.push(href, {
              onTransitionReady: () => triggerPageTransition(href),
            });
          }
        }
      }
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
