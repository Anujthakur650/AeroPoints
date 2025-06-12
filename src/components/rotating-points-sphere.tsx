import React from "react";
import { Canvas } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

function PointSphere() {
  const points = React.useMemo(() => {
    const p = new Float32Array(2000 * 3);
    for (let i = 0; i < p.length; i += 3) {
      const radius = 2;
      const theta = THREE.MathUtils.randFloatSpread(360);
      const phi = THREE.MathUtils.randFloatSpread(360);
      
      p[i] = radius * Math.sin(theta) * Math.cos(phi);
      p[i + 1] = radius * Math.sin(theta) * Math.sin(phi);
      p[i + 2] = radius * Math.cos(theta);
    }
    return p;
  }, []);

  return (
    <Points positions={points}>
      <PointMaterial
        transparent
        color="#0d8de3"
        size={0.02}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

export function RotatingPointsSphere() {
  return (
    <div className="h-[400px] w-full relative">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <group rotation={[0, 0, Math.PI / 4]}>
          <PointSphere />
        </group>
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
    </div>
  );
}