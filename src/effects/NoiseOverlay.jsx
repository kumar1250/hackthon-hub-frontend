import { memo } from "react";

/**
 * Ultra-subtle film-grain noise layered over the whole app.
 * Purely decorative — keeps large flat gradient areas from looking sterile/plasticky.
 */
function NoiseOverlay() {
  return (
    <svg
      className="noise-overlay"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <filter id="noiseFilter">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.85"
          numOctaves="2"
          stitchTiles="stitch"
        />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noiseFilter)" />
    </svg>
  );
}

export default memo(NoiseOverlay);
