"use client";
import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const StorytellingSection = ({ block }) => {
  const sectionRef = useRef(null);
  const stepsRef = useRef(null);

  useGSAP(() => {
    if (!sectionRef.current || !stepsRef.current) return;

    const steps = stepsRef.current.children;

    // Animation des étapes au scroll
    gsap.utils.toArray(steps).forEach((step, index) => {
      const start = index / steps.length;
      const end = (index + 1) / steps.length;

      gsap.fromTo(step,
        { 
          opacity: 0.2, 
          y: 20 
        },
        {
          opacity: 1,
          y: 0,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: `top+=${start * 100}% center`,
            end: `top+=${end * 100}% center`,
            scrub: 1
          }
        }
      );
    });
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative border-t border-white/10 bg-[rgb(8,8,10)] text-white">
      <div className="container mx-auto px-5 py-24 md:py-32 max-w-6xl">
        <div className="grid md:grid-cols-12 gap-10 items-start">
          {/* Titre sticky */}
          <div className="md:col-span-4 sticky top-24 self-start">
            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight mb-3">
              Manifesto — Scroll Story
            </h2>
            <p className="text-white/70">
              Fais défiler pour lire. Chaque étape s'anime et laisse place à la suivante.
            </p>
          </div>

          {/* Étapes */}
          <div className="md:col-span-8">
            <ul ref={stepsRef} className="space-y-20">
              {(block.steps || [
                { id: 'step-1', number: '01', title: 'Manifesto', description: 'Moins d\'effets, plus d\'intentions.' },
                { id: 'step-2', number: '02', title: 'Matière', description: 'Typo vivante, rythme, espace qui respire.' },
                { id: 'step-3', number: '03', title: 'Mouvement', description: 'Transitions nettes, scroll signifiant.' },
                { id: 'step-4', number: '04', title: 'Mesure', description: 'Perf 95+, accessibilité, SEO propre.' }
              ]).map((step) => (
                <li key={step.id} className="border border-white/10 p-6">
                  <div className="text-sm text-white/60">{step.number}</div>
                  <div className="mt-2 text-xl md:text-2xl font-medium">{step.title}</div>
                  <p className="mt-2 text-sm md:text-base text-white/75">{step.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorytellingSection; 