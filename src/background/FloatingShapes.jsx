import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Ring } from "@react-three/drei";

function Sphere({ position, color, scale = 1, speed = 1 }) {
  const ref = useRef(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.4;
    }
  });
  return (
    <Float speed={speed} rotationIntensity={0.4} floatIntensity={0.6}>
      <mesh ref={ref} position={position} scale={scale}>
        <sphereGeometry args={[1, 64, 64]} />
        <MeshDistortMaterial
          color={color}
          distort={0.35}
          speed={1.4}
          roughness={0.1}
          metalness={0.25}
          transparent
          opacity={0.55}
        />
      </mesh>
    </Float>
  );
}

/** Glassy, colorful floating spheres + rings — tuned for a bright canvas backdrop. */
export default function FloatingShapes() {
  return (
    <group>
      <Sphere position={[-4, 1.5, -3]} color="#38bdf8" scale={1.6} speed={0.6} />
      <Sphere position={[4.5, -1, -5]} color="#a855f7" scale={2.1} speed={0.4} />
      <Sphere position={[0, -2.5, -6]} color="#ff7a59" scale={1.3} speed={0.8} />
      <Sphere position={[-2.5, -2, -4]} color="#34d399" scale={0.9} speed={0.9} />

      <Float speed={0.5} rotationIntensity={1} floatIntensity={1}>
        <Ring args={[2.2, 2.35, 64]} position={[3, 2, -4]} rotation={[1.4, 0.2, 0]}>
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.5} side={2} />
        </Ring>
      </Float>
      <Float speed={0.7} rotationIntensity={0.8} floatIntensity={0.8}>
        <Ring args={[1.4, 1.5, 64]} position={[-3.5, -1.8, -4]} rotation={[0.8, -0.4, 0]}>
          <meshBasicMaterial color="#ec4899" transparent opacity={0.45} side={2} />
        </Ring>
      </Float>
    </group>
  );
}
