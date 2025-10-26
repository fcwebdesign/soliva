"use client";
import { useTemplate } from "@/templates/context";

export default function ThemeTransitions() {
  const { key } = useTemplate();

  // Add per-template page transition styles here
  switch (key) {
    case "pearl":
      return (
        <style jsx global>{`
          /* Pearl: visible slide+fade transition and shared brand element */
          html::view-transition-old(root),
          html::view-transition-new(root) {
            animation-duration: 420ms;
            animation-timing-function: cubic-bezier(0.22, 0.61, 0.36, 1);
          }
          html::view-transition-old(root) { animation-name: vt-pearl-out; }
          html::view-transition-new(root) { animation-name: vt-pearl-in; }

          @keyframes vt-pearl-in { 
            from { opacity: 0; transform: translateY(-8px) }
            to   { opacity: 1; transform: translateY(0) }
          }
          @keyframes vt-pearl-out { 
            from { opacity: 1; transform: translateY(0) }
            to   { opacity: 0; transform: translateY(12px) }
          }

          /* Shared element for brand (logo/text) */
          .vt-brand { view-transition-name: pearl-brand; }
        `}</style>
      );
    default:
      return null;
  }
}
