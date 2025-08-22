"use client";
import { motion } from "framer-motion";
import PreviewBar from "@/components/PreviewBar";
import "./styles.css";

const MinimalisteLayout = ({ 
  children, 
  content, 
  isPreviewMode = false,
  activePage = "home" 
}) => {
  const navItems = [
    { label: "Accueil", href: "/", page: "home" },
    { label: "Réalisations", href: "/work", page: "work" },
    { label: "Studio", href: "/studio", page: "studio" },
    { label: "Contact", href: "/contact", page: "contact" },
    { label: "Blog", href: "/blog", page: "blog" }
  ];

  return (
    <div className="template-minimaliste-premium font-sans">
      {isPreviewMode && <PreviewBar />}
      
      {/* Header standard */}
      <header className="header">
        <div className="container header-content">
          <a href="/" className="logo title">
            {content?.nav?.logo || "STUDIO"}
          </a>
          <nav className="nav">
            {navItems.map((item) => (
              <a 
                key={item.page}
                href={item.href}
                className={activePage === item.page ? "active" : ""}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>
      
      {/* Contenu principal */}
      <main>
        {children}
      </main>
      
      {/* Footer standard */}
      <footer className="footer">
        <div className="container footer-content">
          <p className="font-medium">
            © {new Date().getFullYear()} Studio — Tous droits réservés
          </p>
          <div className="footer-socials">
            {content?.footer?.socials?.map((social, index) => (
              <a 
                key={index} 
                href={social.url || "#"} 
                target={social.target || "_blank"}
              >
                {social.platform}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MinimalisteLayout; 