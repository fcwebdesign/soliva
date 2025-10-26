"use client";
import { useTemplate } from "@/templates/context";

export default function ThemeTransitions() {
  const { key } = useTemplate();

  // Add per-template page transition styles here
  switch (key) {
    case "pearl":
      return (
        <style jsx global>{`
          /* Pearl: subtle cross-fade between pages */
          @media (prefers-reduced-motion: no-preference) {
            html::view-transition-old(root),
            html::view-transition-new(root) {
              animation-duration: 280ms;
              animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
            }
            html::view-transition-old(root) { animation-name: vt-fade-out; }
            html::view-transition-new(root) { animation-name: vt-fade-in; }

            @keyframes vt-fade-in { from { opacity: 0.02 } to { opacity: 1 } }
            @keyframes vt-fade-out { from { opacity: 1 } to { opacity: 0.02 } }
          }
        `}</style>
      );
    default:
      return null;
  }
}

