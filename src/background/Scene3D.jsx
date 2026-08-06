import { Suspense, memo } from "react";
import { Canvas } from "@react-three/fiber";
import FloatingShapes from "./FloatingShapes";
import ParticleField from "./ParticleField";

/** Full-viewport animated 3D backdrop. Fixed, non-interactive, behind all content. */
function Scene3D() {
  return (
    <div className="fixed inset-0 -z-10 h-screen w-screen">
      <Canvas
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 8], fov: 55 }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.9} />
          <pointLight position={[5, 5, 5]} intensity={60} color="#22d3ee" />
          <pointLight position={[-5, -3, -2]} intensity={50} color="#a855f7" />
          <pointLight position={[0, -4, 3]} intensity={40} color="#ff7a59" />
          <ParticleField />
          <FloatingShapes />
        </Suspense>
      </Canvas>
      {/* CSS mesh-gradient glow layered above the canvas, below content — adds color depth on the bright base */}
      <div
        className="absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(circle at 12% 18%, rgba(56,189,248,0.16), transparent 42%), radial-gradient(circle at 85% 12%, rgba(168,85,247,0.15), transparent 45%), radial-gradient(circle at 50% 95%, rgba(255,122,89,0.14), transparent 48%), radial-gradient(circle at 90% 80%, rgba(52,211,153,0.12), transparent 40%)",
        }}
      />
    </div>
  );
}

export default memo(Scene3D);
