"use client";

import { useTransitionRouter } from "next-view-transitions";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef } from "react";

const Nav = () => {
  const router = useTransitionRouter();
  const pathname = usePathname();
  const logoRef = useRef();

  const isSafari = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("safari") && !ua.includes("chrome");
  };

  const isBasicTransition = () => {
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes("firefox") || isSafari();
  };

  // Remplace dynamiquement le "o" par un cercle pour éviter les erreurs SSR/CSR
  useEffect(() => {
    if (logoRef.current) {
      logoRef.current.innerHTML = 's<span class="logo-dot" aria-hidden="true"></span>liva';
    }
  }, []);

  // Crée un rideau bleu si besoin (Firefox/Safari)
  useEffect(() => {
    if (!isBasicTransition()) return;
    if (document.getElementById("curtain")) return;

    const curtain = document.createElement("div");
    curtain.id = "curtain";
    curtain.style.cssText = `
      position: fixed;
      inset: 0;
      background: var(--accent);
      transform: translateY(-100%);
      z-index: 9999;
      transition: transform 0.6s ease;
      pointer-events: none;
    `;
    document.body.appendChild(curtain);
  }, []);

  function triggerPageTransition(path) {
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

  const handleNavigation = (path) => (e) => {
    if (path === pathname) {
      e.preventDefault();
      return;
    }

    e.preventDefault();

    if (isBasicTransition()) {
      triggerPageTransition(path);
    } else {
      router.push(path, {
        onTransitionReady: () => triggerPageTransition(path),
      });
    }
  };

  // Replie le rideau après navigation
  useEffect(() => {
    if (!isBasicTransition()) return;
    const curtain = document.getElementById("curtain");
    if (!curtain) return;

    curtain.style.transform = "translateY(-100%)";
  }, [pathname]);

  return (
    <div className="nav">
      <div className="col">
        <div className="nav-logo">
          <Link onClick={handleNavigation("/")} href="/">
            <span ref={logoRef}>soliva</span>
          </Link>
        </div>
      </div>

      <div className="col">
        <div className="nav-items">
          {["work", "studio", "contact"].map((item) => (
            <div key={item} className="nav-item">
              <Link onClick={handleNavigation(`/${item}`)} href={`/${item}`}>
                {item}
              </Link>
            </div>
          ))}
        </div>
        <div className="nav-copy">
          <p>paris, le havre</p>
        </div>
      </div>
    </div>
  );
};

export default Nav;
