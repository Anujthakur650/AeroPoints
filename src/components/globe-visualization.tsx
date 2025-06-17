import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";

function Globe() {
  const globeRef = React.useRef<THREE.Mesh>(null);
  
  React.useEffect(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });

  return (
    <mesh
      ref={globeRef}
      rotation={[0, 0, 0]}
    >
      <sphereGeometry args={[2, 64, 64]} />
      <meshPhongMaterial
        map={new THREE.TextureLoader().load('https://i.imgur.com/xPYUbDX.jpg')}
        bumpMap={new THREE.TextureLoader().load('https://i.imgur.com/xPYUbDX.jpg')}
        bumpScale={0.05}
        specularMap={new THREE.TextureLoader().load('https://i.imgur.com/xPYUbDX.jpg')}
        specular={new THREE.Color('grey')}
        shininess={5}
      />
    </mesh>
  );
}

export function GlobeVisualization() {
  const [rotation, setRotation] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.002);
    }, 16);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      className="h-[600px] w-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <Canvas camera={{ position: [0, 0, 6] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
        <group rotation={[0, rotation, 0]}>
          <Globe />
        </group>
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          minPolarAngle={Math.PI / 2}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
    </motion.div>
  );
}