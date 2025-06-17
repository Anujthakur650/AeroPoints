import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, Environment, Text3D } from "@react-three/drei";
import * as THREE from "three";
function PointsSphere() {
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
    return (_jsxs("group", { children: [_jsxs("points", { children: [_jsx("bufferGeometry", { children: _jsx("bufferAttribute", { attach: "attributes-position", count: points.length / 3, array: points, itemSize: 3 }) }), _jsx("pointsMaterial", { size: 0.02, color: "#0070F3", transparent: true, opacity: 0.8, sizeAttenuation: true, depthWrite: false })] }), _jsx(Float, { speed: 2, rotationIntensity: 0.5, floatIntensity: 1, children: _jsxs(Text3D, { font: "/fonts/inter_bold.json", size: 0.5, height: 0.1, position: [-2, 0, 0], children: ["125K", _jsx("meshStandardMaterial", { color: "#0070F3", metalness: 0.8, roughness: 0.2 })] }) })] }));
}
function AnimatedRings() {
    return (_jsx("group", { rotation: [Math.PI / 2, 0, 0], children: [...Array(3)].map((_, i) => (_jsxs("mesh", { position: [0, 0, i * 0.5], children: [_jsx("ringGeometry", { args: [2 - i * 0.2, 2.1 - i * 0.2, 64] }), _jsx("meshStandardMaterial", { color: "#0070F3", transparent: true, opacity: 0.2, side: THREE.DoubleSide })] }, i))) }));
}
export function PointsVisualization() {
    return (_jsxs("div", { className: "relative h-[600px] w-full", children: [_jsxs(Canvas, { camera: { position: [0, 0, 6], fov: 50 }, children: [_jsx("ambientLight", { intensity: 0.5 }), _jsx("spotLight", { position: [10, 10, 10], angle: 0.15, penumbra: 1 }), _jsx("pointLight", { position: [-10, -10, -10] }), _jsxs("group", { rotation: [0, 0, Math.PI / 4], children: [_jsx(PointsSphere, {}), _jsx(AnimatedRings, {})] }), _jsx(Environment, { preset: "city" })] }), _jsx(motion.div, { className: "absolute inset-0 pointer-events-none", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5 }, children: [...Array(20)].map((_, i) => (_jsx(motion.div, { className: "absolute w-1 h-1 bg-primary rounded-full", style: {
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`
                    }, animate: {
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.7, 0.3],
                    }, transition: {
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: Math.random() * 2,
                    } }, i))) }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none" })] }));
}
