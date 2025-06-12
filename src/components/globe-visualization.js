import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { motion } from "framer-motion";
import * as THREE from "three";
function Globe() {
    const globeRef = React.useRef(null);
    React.useEffect(() => {
        if (globeRef.current) {
            globeRef.current.rotation.y += 0.001;
        }
    });
    return (_jsxs("mesh", { ref: globeRef, rotation: [0, 0, 0], children: [_jsx("sphereGeometry", { args: [2, 64, 64] }), _jsx("meshPhongMaterial", { map: new THREE.TextureLoader().load('https://i.imgur.com/xPYUbDX.jpg'), bumpMap: new THREE.TextureLoader().load('https://i.imgur.com/xPYUbDX.jpg'), bumpScale: 0.05, specularMap: new THREE.TextureLoader().load('https://i.imgur.com/xPYUbDX.jpg'), specular: new THREE.Color('grey'), shininess: 5 })] }));
}
export function GlobeVisualization() {
    const [rotation, setRotation] = React.useState(0);
    React.useEffect(() => {
        const interval = setInterval(() => {
            setRotation(prev => prev + 0.002);
        }, 16);
        return () => clearInterval(interval);
    }, []);
    return (_jsxs(motion.div, { className: "h-[600px] w-full relative", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1 }, children: [_jsxs(Canvas, { camera: { position: [0, 0, 6] }, children: [_jsx("ambientLight", { intensity: 0.5 }), _jsx("pointLight", { position: [10, 10, 10] }), _jsx(Stars, { radius: 100, depth: 50, count: 5000, factor: 4, fade: true }), _jsx("group", { rotation: [0, rotation, 0], children: _jsx(Globe, {}) }), _jsx(OrbitControls, { enableZoom: false, enablePan: false, minPolarAngle: Math.PI / 2, maxPolarAngle: Math.PI / 2 })] }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" })] }));
}
