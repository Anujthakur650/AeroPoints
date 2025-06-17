import React from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, Float, Environment } from "@react-three/drei";
import { motion } from "framer-motion-3d";
import * as THREE from "three";

function Plane() {
  const planeRef = React.useRef<THREE.Mesh>(null);
  
  React.useEffect(() => {
    if (planeRef.current) {
      planeRef.current.rotation.y = Math.PI / 4;
    }
  }, []);

  return (
    <Float
      speed={1.5}
      rotationIntensity={0.5}
      floatIntensity={0.5}
    >
      <mesh
        ref={planeRef}
        scale={[0.4, 0.4, 0.4]}
      >
        <boxGeometry args={[3, 0.5, 2]} />
        <meshStandardMaterial color="#0d8de3" metalness={0.8} roughness={0.2} />
        <mesh position={[1.6, 0, 0]}>
          <coneGeometry args={[0.5, 2, 32]} rotation={[0, 0, -Math.PI / 2]} />
          <meshStandardMaterial color="#0d8de3" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.4, 0]}>
          <boxGeometry args={[1, 0.1, 5]} />
          <meshStandardMaterial color="#0d8de3" metalness={0.8} roughness={0.2} />
        </mesh>
      </mesh>
    </Float>
  );
}

export function FloatingPlane() {
  return (
    <div className="h-[400px] w-full relative">
      <Canvas camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
        <Plane />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
}