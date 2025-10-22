import { useEffect } from 'react';
import { TRANSITION_CONFIG } from '@/config';
import { useGSAP } from "@gsap/react";
import gsap from 'gsap';
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);
CustomEase.create("hop", "0.9, 0, 0.1, 1");

export const useTransition = (): void => {
  useGSAP(() => {
    // Si le mode est 'curtain', on anime le revealer exactement comme avant
    if (TRANSITION_CONFIG.mode === 'curtain') {
      gsap.to(".revealer", {
        scaleY: 0,
        duration: 1.25,
        delay: 1,
        ease: "hop",
      });
    }
  }, []);
};
