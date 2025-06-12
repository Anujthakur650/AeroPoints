import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useSpring, animated } from "react-spring";
function StatCard({ icon, label, value, prefix = "", suffix = "", color, delay = 0 }) {
    const { number } = useSpring({
        from: { number: 0 },
        to: { number: value },
        delay: 500 + delay,
        config: { mass: 1, tension: 20, friction: 10 }
    });
    return (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: delay / 1000 }, viewport: { once: true }, children: _jsx(Card, { className: "backdrop-blur-md border border-white/10", children: _jsxs(CardBody, { className: "flex items-center gap-4", children: [_jsx("div", { className: `p-3 rounded-xl ${color}`, children: _jsx(Icon, { icon: icon, className: "text-white", width: 24, height: 24 }) }), _jsxs("div", { children: [_jsx("p", { className: "text-default-500 text-sm", children: label }), _jsxs("p", { className: "text-2xl font-bold", children: [prefix, _jsx(animated.span, { children: number.to(n => Math.floor(n).toLocaleString()) }), suffix] })] })] }) }) }));
}
export function AnimatedStats() {
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(StatCard, { icon: "lucide:award", label: "Total Points", value: 125000, color: "bg-primary", delay: 0 }), _jsx(StatCard, { icon: "lucide:plane", label: "Flights Booked", value: 24, color: "bg-secondary", delay: 200 }), _jsx(StatCard, { icon: "lucide:map", label: "Destinations", value: 15, color: "bg-success-500", delay: 400 }), _jsx(StatCard, { icon: "lucide:trending-up", label: "Points Growth", value: 32, suffix: "%", color: "bg-warning-500", delay: 600 })] }));
}
