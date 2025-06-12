import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardBody } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useSpring, animated } from "react-spring";
function StatCard({ icon, label, value, prefix = "", suffix = "", gradient, delay = 0 }) {
    const { number } = useSpring({
        from: { number: 0 },
        to: { number: value },
        delay: 500 + delay,
        config: { mass: 1, tension: 20, friction: 10 }
    });
    return (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: delay / 1000 }, viewport: { once: true }, whileHover: { y: -5 }, children: _jsx(Card, { className: "border-none shadow-lg overflow-hidden", children: _jsx(CardBody, { className: `p-6 bg-gradient-to-br ${gradient}`, children: _jsxs("div", { className: "flex flex-col", children: [_jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx("div", { className: "p-2 rounded-lg bg-white/10", children: _jsx(Icon, { icon: icon, className: "text-white", width: 24, height: 24 }) }), _jsx("p", { className: "text-lg text-white/90", children: label })] }), _jsx("div", { className: "flex items-baseline gap-1", children: _jsxs("p", { className: "text-3xl font-bold text-white", children: [prefix, _jsx(animated.span, { children: number.to(n => Math.floor(n).toLocaleString()) }), suffix] }) })] }) }) }) }));
}
export function StatsDashboard() {
    return (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(StatCard, { icon: "lucide:award", label: "Total Points", value: 125000, gradient: "from-blue-500 to-blue-600", delay: 0 }), _jsx(StatCard, { icon: "lucide:plane", label: "Flights Booked", value: 24, gradient: "from-purple-500 to-purple-600", delay: 200 }), _jsx(StatCard, { icon: "lucide:map", label: "Destinations", value: 15, gradient: "from-emerald-500 to-emerald-600", delay: 400 }), _jsx(StatCard, { icon: "lucide:trending-up", label: "Points Growth", value: 32, suffix: "%", gradient: "from-amber-500 to-amber-600", delay: 600 })] }));
}
