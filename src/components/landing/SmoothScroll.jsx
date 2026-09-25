import { ReactLenis } from "lenis/react";

// Lenis smooth scrolling for the marketing page only (the app shell scrolls
// inside its own containers). `anchors` makes #section links glide too.
export default function SmoothScroll({ children }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.1,
        anchors: { offset: -72 }, // clear the fixed navbar
      }}
    >
      {children}
    </ReactLenis>
  );
}
