"use client";
import { motion } from "framer-motion";

const MinimalisteHero = ({ content }) => {
  // Debug: log des données reçues
  console.log('🎯 MinimalisteHero: Données reçues', content);

  return (
    <section id="home" className="py-[calc(var(--section)*1.2)]">
      <div className="container">
        <motion.h1 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ duration: 0.6 }} 
          className="title text-[clamp(48px,10vw,120px)] leading-[0.95] font-semibold tracking-tight"
        >
          {content?.title || "Design minimal. Impact maximal."}
        </motion.h1>
        {content?.subtitle && (
          <motion.p 
            initial={{ y: 8, opacity: 0 }} 
            animate={{ y: 0, opacity: 1 }} 
            transition={{ delay: 0.2, duration: 0.6 }} 
            className="mt-6 max-w-[56ch] text-[15px] md:text-base text-black/65"
          >
            {content.subtitle}
          </motion.p>
        )}
        <div className="mt-10 flex items-center gap-6 text-sm">
          <a href="#work" className="link">Voir les projets</a>
          <a href="#contact" className="link">Parler d'un projet</a>
        </div>
      </div>
    </section>
  );
};

export default MinimalisteHero; 