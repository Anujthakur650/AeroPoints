import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Card, CardBody } from "@heroui/react";
import { motion } from "framer-motion";
export function AnimatedCard({ children, delay = 0 }) {
    const [mousePosition, setMousePosition] = React.useState({ x: 0, y: 0 });
    const cardRef = React.useRef(null);
    const handleMouseMove = (e) => {
        if (cardRef.current) {
            const rect = cardRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            setMousePosition({ x, y });
        }
    };
    return (_jsx(motion.div, { ref: cardRef, initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }, viewport: { once: true }, onMouseMove: handleMouseMove, style: {
            position: "relative",
            transformStyle: "preserve-3d",
            perspective: "1000px"
        }, whileHover: { scale: 1.02 }, children: _jsxs(Card, { className: "backdrop-blur-md border border-white/10 overflow-hidden", children: [_jsx("div", { className: "absolute inset-0 bg-gradient-to-br from-primary-500/10 to-secondary-500/10 opacity-0 transition-opacity duration-300 hover:opacity-100", style: {
                        background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(255,255,255,0.1) 0%, transparent 50%)`
                    } }), _jsx(CardBody, { children: children })] }) }));
}
