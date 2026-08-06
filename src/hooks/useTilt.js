import { useRef } from "react";

/** Attach to a card ref for a magnetic 3D tilt-on-hover effect. */
export function useTilt(maxTilt = 10) {
  const ref = useRef(null);

  function onMouseMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${px * maxTilt}deg) rotateX(${-py * maxTilt}deg) translateZ(0)`;
  }

  function onMouseLeave() {
    if (ref.current) ref.current.style.transform = "perspective(800px) rotateY(0) rotateX(0)";
  }

  return { ref, onMouseMove, onMouseLeave };
}