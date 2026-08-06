import { useEffect, useRef } from "react";

/** Custom glow cursor with magnetic lag. Disabled on touch devices via CSS (see index.css). */
export default function CursorGlow() {
  const dotRef = useRef(null);
  const glowRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (window.matchMedia("(hover: none)").matches) return;

    function onMove(e) {
      target.current.x = e.clientX;
      target.current.y = e.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    }

    let raf;
    function tick() {
      pos.current.x += (target.current.x - pos.current.x) * 0.12;
      pos.current.y += (target.current.y - pos.current.y) * 0.12;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    }

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[999] hidden md:block" aria-hidden="true">
      <div
        ref={glowRef}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 340,
          height: 340,
          background:
            "radial-gradient(circle, rgba(56,189,248,0.16), rgba(168,85,247,0.10) 40%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />
      <div
        ref={dotRef}
        className="absolute -translate-x-1/2 -translate-y-1/2 h-2 w-2 rounded-full bg-purple"
        style={{ boxShadow: "0 0 12px 3px rgba(168,85,247,0.7)" }}
      />
    </div>
  );
}