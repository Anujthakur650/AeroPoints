import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Card } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Canvas } from "@react-three/fiber";
import { Float, Environment } from "@react-three/drei";
function Airplane() {
    return (_jsx(Float, { speed: 2, rotationIntensity: 0.5, floatIntensity: 1, children: _jsxs("group", { scale: [0.4, 0.4, 0.4], rotation: [0, Math.PI / 4, 0], children: [_jsxs("mesh", { children: [_jsx("boxGeometry", { args: [3, 0.5, 2] }), _jsx("meshStandardMaterial", { color: "#0070F3", metalness: 0.8, roughness: 0.2 })] }), _jsxs("mesh", { position: [1.6, 0, 0], children: [_jsx("coneGeometry", { args: [0.5, 2, 32], rotation: [0, 0, -Math.PI / 2] }), _jsx("meshStandardMaterial", { color: "#0070F3", metalness: 0.8, roughness: 0.2 })] }), _jsxs("mesh", { position: [0, 0.4, 0], children: [_jsx("boxGeometry", { args: [1, 0.1, 5] }), _jsx("meshStandardMaterial", { color: "#0070F3", metalness: 0.8, roughness: 0.2 })] })] }) }));
}
export function PremiumTravel() {
    return (_jsx("div", { className: "container mx-auto px-4 py-20", children: _jsx(Card, { className: "bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-lg border-none shadow-2xl", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-16 p-12", children: [_jsxs(motion.div, { initial: { opacity: 0, scale: 0.95 }, whileInView: { opacity: 1, scale: 1 }, transition: { duration: 0.8 }, viewport: { once: true }, className: "relative h-[400px]", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 rounded-3xl" }), _jsxs(Canvas, { camera: { position: [0, 0, 10], fov: 50 }, children: [_jsx("ambientLight", { intensity: 0.5 }), _jsx("spotLight", { position: [10, 10, 10], angle: 0.15, penumbra: 1 }), _jsx("pointLight", { position: [-10, -10, -10] }), _jsx(Airplane, {}), _jsx(Environment, { preset: "city" })] }), _jsx(motion.div, { className: "absolute inset-0 pointer-events-none", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.5 }, children: [...Array(3)].map((_, i) => (_jsx(motion.div, { className: "absolute w-2 h-2 bg-primary rounded-full", style: {
                                        left: `${20 + i * 30}%`,
                                        top: `${30 + i * 20}%`
                                    }, animate: {
                                        scale: [1, 1.5, 1],
                                        opacity: [0.5, 1, 0.5],
                                    }, transition: {
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.5,
                                    } }, i))) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.2 }, viewport: { once: true }, className: "space-y-8", children: [_jsxs("div", { children: [_jsx(motion.div, { initial: { width: 0 }, whileInView: { width: "100px" }, transition: { duration: 0.8 }, className: "h-1 bg-primary mb-6" }), _jsx("h2", { className: "text-4xl font-bold tracking-tight mb-4", children: "Experience Premium Travel" }), _jsx("p", { className: "text-default-600 text-lg leading-relaxed", children: "Unlock exclusive rewards and travel benefits with our premium membership. Enjoy priority booking, lounge access, and personalized travel assistance." })] }), _jsx("div", { className: "grid grid-cols-2 gap-4", children: [
                                    { icon: "lucide:crown", text: "Priority Booking" },
                                    { icon: "lucide:coffee", text: "Lounge Access" },
                                    { icon: "lucide:headphones", text: "24/7 Support" },
                                    { icon: "lucide:upgrade", text: "Free Upgrades" }
                                ].map((item, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: 0.4 + index * 0.1 }, whileHover: { scale: 1.05 }, className: "flex items-center gap-3 p-4 rounded-xl bg-default-100/50 backdrop-blur-sm", children: [_jsx("div", { className: "p-2 rounded-lg bg-primary/10", children: _jsx(Icon, { icon: item.icon, className: "text-primary", width: 24, height: 24 }) }), _jsx("span", { className: "font-medium", children: item.text })] }, index))) })] })] }) }) }));
}
