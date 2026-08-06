import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Icosahedron } from "@react-three/drei";
import { useMouseParallax } from "../../hooks/useMouseParallax";

function Orb() {
  const ref = useRef(null);
  const parallax = useMouseParallax(0.4);

  useFrame((state, delta) => {
    if (!ref.current) return;
    ref.current.rotation.x += delta * 0.15;
    ref.current.rotation.y += delta * 0.22;
    ref.current.position.x = parallax.x * 0.4;
    ref.current.position.y = -parallax.y * 0.3;
  });

  return (
    <Icosahedron ref={ref} args={[1.6, 4]}>
      <MeshDistortMaterial
        color="#22d3ee"
        distort={0.45}
        speed={2}
        roughness={0.1}
        metalness={0.8}
        wireframe
      />
    </Icosahedron>
  );
}

/** Small dedicated canvas placed inside the hero — distinct from the global Scene3D backdrop. */
export default function HeroOrb() {
  return (
    <div className="pointer-events-none absolute -right-10 top-0 h-[420px] w-[420px] opacity-90 sm:right-0 md:h-[520px] md:w-[520px]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }} dpr={[1, 1.5]}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <pointLight position={[3, 3, 3]} intensity={30} color="#a855f7" />
          <Orb />
        </Suspense>
      </Canvas>
    </div>
  );
}