import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return (_jsx(Points, { positions: points, children: _jsx(PointMaterial, { transparent: true, color: "#0d8de3", size: 0.02, sizeAttenuation: true, depthWrite: false }) }));
}
export function RotatingPointsSphere() {
    return (_jsxs("div", { className: "h-[400px] w-full relative", children: [_jsxs(Canvas, { camera: { position: [0, 0, 5] }, children: [_jsx("ambientLight", { intensity: 0.5 }), _jsx("pointLight", { position: [10, 10, 10] }), _jsx("group", { rotation: [0, 0, Math.PI / 4], children: _jsx(PointSphere, {}) })] }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" })] }));
}
