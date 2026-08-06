import { useEffect, useState } from "react";

/** Returns normalized [-1, 1] pointer offset from viewport center, for ambient parallax layers. */
export function useMouseParallax(strength = 1) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function onMove(e) {
      const x = (e.clientX / window.innerWidth - 0.5) * 2 * strength;
      const y = (e.clientY / window.innerHeight - 0.5) * 2 * strength;
      setOffset({ x, y });
    }
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [strength]);

  return offset;
}