import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Canvas } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
function Plane() {
    const planeRef = React.useRef(null);
    React.useEffect(() => {
        if (planeRef.current) {
            planeRef.current.rotation.y = Math.PI / 4;
        }
    }, []);
    return (_jsx(Float, { speed: 1.5, rotationIntensity: 0.5, floatIntensity: 0.5, children: _jsxs("mesh", { ref: planeRef, scale: [0.4, 0.4, 0.4], children: [_jsx("boxGeometry", { args: [3, 0.5, 2] }), _jsx("meshStandardMaterial", { color: "#0d8de3", metalness: 0.8, roughness: 0.2 }), _jsxs("mesh", { position: [1.6, 0, 0], children: [_jsx("coneGeometry", { args: [0.5, 2, 32], rotation: [0, 0, -Math.PI / 2] }), _jsx("meshStandardMaterial", { color: "#0d8de3", metalness: 0.8, roughness: 0.2 })] }), _jsxs("mesh", { position: [0, 0.4, 0], children: [_jsx("boxGeometry", { args: [1, 0.1, 5] }), _jsx("meshStandardMaterial", { color: "#0d8de3", metalness: 0.8, roughness: 0.2 })] })] }) }));
}
export function FloatingPlane() {
    return (_jsx("div", { className: "h-[400px] w-full relative", children: _jsxs(Canvas, { camera: { position: [0, 0, 10], fov: 50 }, children: [_jsx("ambientLight", { intensity: 0.5 }), _jsx("spotLight", { position: [10, 10, 10], angle: 0.15, penumbra: 1 }), _jsx("pointLight", { position: [-10, -10, -10] }), _jsx(Plane, {}), _jsx(Environment, { preset: "city" })] }) }));
}
