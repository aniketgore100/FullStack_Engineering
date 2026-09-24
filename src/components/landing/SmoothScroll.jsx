import { ReactLenis } from "lenis/react";
import "lenis/dist/lenis.css";

// Buttery page scrolling for the landing page only (Lenis takes over the
// window scroll while it's mounted and lets go when you leave the page).
// Skipped for people who ask their system for reduced motion.
const reduced =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function SmoothScroll({ children }) {
  if (reduced) return children;

  return (
    <ReactLenis root options={{ lerp: 0.09, wheelMultiplier: 0.95, anchors: true }}>
      {children}
    </ReactLenis>
  );
}
