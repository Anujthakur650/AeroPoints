import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
function Earth() {
    const earthTexture = React.useMemo(() => {
        const loader = new THREE.TextureLoader();
        return loader.load("https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg");
    }, []);
    return (_jsxs("mesh", { children: [_jsx("sphereGeometry", { args: [1, 32, 32] }), _jsx("meshStandardMaterial", { map: earthTexture })] }));
}
function FlightPath({ start, end, progress }) {
    const curve = React.useMemo(() => {
        const startVec = new THREE.Vector3(Math.cos(start.lat) * Math.sin(start.lng), Math.sin(start.lat), Math.cos(start.lat) * Math.cos(start.lng));
        const endVec = new THREE.Vector3(Math.cos(end.lat) * Math.sin(end.lng), Math.sin(end.lat), Math.cos(end.lat) * Math.cos(end.lng));
        const control = startVec.clone().add(endVec).multiplyScalar(0.5);
        control.normalize().multiplyScalar(1.5);
        return new THREE.QuadraticBezierCurve3(startVec, control, endVec);
    }, [start, end]);
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return (_jsxs("group", { children: [_jsx("line", { geometry: geometry, children: _jsx("lineBasicMaterial", { color: "#4f46e5", opacity: 0.5, transparent: true }) }), _jsxs("mesh", { position: curve.getPoint(progress), children: [_jsx("sphereGeometry", { args: [0.02, 16, 16] }), _jsx("meshBasicMaterial", { color: "#4f46e5" })] })] }));
}
const flightRoutes = [
    {
        id: 1,
        start: { lat: 40.7128, lng: -74.0060 }, // New York
        end: { lat: 51.5074, lng: -0.1278 }, // London
        label: "NYC → LHR"
    },
    {
        id: 2,
        start: { lat: 35.6762, lng: 139.6503 }, // Tokyo
        end: { lat: 1.3521, lng: 103.8198 }, // Singapore
        label: "TYO → SIN"
    },
    {
        id: 3,
        start: { lat: 25.2048, lng: 55.2708 }, // Dubai
        end: { lat: -33.8688, lng: 151.2093 }, // Sydney
        label: "DXB → SYD"
    }
];
export function FlightMap() {
    const [progress, setProgress] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    }, []);
    React.useEffect(() => {
        const animate = () => {
            setProgress((prev) => (prev >= 1 ? 0 : prev + 0.002));
        };
        const interval = setInterval(animate, 16);
        return () => clearInterval(interval);
    }, []);
    return (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }, viewport: { once: true }, className: "my-12", children: _jsxs(Card, { className: "backdrop-blur-md border border-white/10", children: [_jsxs(CardHeader, { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold", children: "Live Flight Routes" }), _jsx("p", { className: "text-default-500", children: "Popular reward flight routes worldwide" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 bg-primary rounded-full animate-pulse" }), _jsx("span", { className: "text-sm text-default-500", children: "Live Updates" })] })] }), _jsxs(CardBody, { className: "p-0 h-[600px] relative overflow-hidden", children: [isLoading ? (_jsx("div", { className: "absolute inset-0 flex items-center justify-center bg-default-100/50 backdrop-blur-sm", children: _jsxs("div", { className: "flex flex-col items-center gap-2", children: [_jsx(Spinner, { color: "primary" }), _jsx("p", { className: "text-sm text-default-600", children: "Loading flight map..." })] }) })) : (_jsxs(Canvas, { camera: { position: [0, 0, 2.5], fov: 45 }, children: [_jsx("ambientLight", { intensity: 0.5 }), _jsx("pointLight", { position: [10, 10, 10] }), _jsx(Stars, { radius: 100, depth: 50, count: 5000, factor: 4, saturation: 0, fade: true, speed: 1 }), _jsx(Earth, {}), flightRoutes.map((route) => (_jsx(FlightPath, { start: route.start, end: route.end, progress: progress }, route.id))), _jsx(OrbitControls, { enableZoom: true, enablePan: true, enableRotate: true, autoRotate: true, autoRotateSpeed: 0.5 })] })), _jsxs("div", { className: "absolute bottom-4 left-4 bg-background/70 backdrop-blur-md p-3 rounded-lg border border-white/10", children: [_jsx("div", { className: "text-sm font-medium mb-1", children: "Active Routes" }), _jsx("div", { className: "flex flex-col gap-1 text-xs", children: flightRoutes.map((route) => (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-primary" }), _jsx("span", { children: route.label })] }, route.id))) })] })] })] }) }));
}
