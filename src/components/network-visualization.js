import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
const popularRoutes = [
    {
        from: "New York",
        to: "London",
        points: 85000,
        airline: "British Airways",
        popularity: 95
    },
    {
        from: "Los Angeles",
        to: "Tokyo",
        points: 95000,
        airline: "ANA",
        popularity: 90
    },
    {
        from: "Dubai",
        to: "Singapore",
        points: 75000,
        airline: "Emirates",
        popularity: 88
    },
    {
        from: "Paris",
        to: "Sydney",
        points: 120000,
        airline: "Qantas",
        popularity: 85
    }
];
export function NetworkVisualization() {
    return (_jsxs(Card, { className: "backdrop-blur-md border border-white/10", children: [_jsxs(CardHeader, { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-xl font-bold", children: "Popular Flight Routes" }), _jsx("p", { className: "text-default-500", children: "Most redeemed reward flights worldwide" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 bg-success-500 rounded-full animate-pulse" }), _jsx("span", { className: "text-sm text-default-500", children: "Live Updates" })] })] }), _jsx(CardBody, { className: "p-6", children: _jsx("div", { className: "grid gap-4", children: popularRoutes.map((route, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { delay: index * 0.1 }, className: "relative bg-default-50 dark:bg-default-100/50 rounded-xl p-4 overflow-hidden", children: [_jsx("div", { className: "absolute top-0 left-0 h-full bg-success-500/10", style: { width: `${route.popularity}%` } }), _jsxs("div", { className: "relative z-10", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Icon, { icon: "lucide:plane-takeoff", className: "text-primary mr-2" }), _jsx("span", { className: "font-semibold", children: route.from })] }), _jsx("div", { className: "flex-1 h-[2px] bg-default-200 dark:bg-default-700 mx-2 relative", children: _jsx(motion.div, { className: "absolute top-1/2 -translate-y-1/2", animate: {
                                                                x: ["0%", "100%"],
                                                                scale: [1, 0.8, 1]
                                                            }, transition: {
                                                                duration: 2,
                                                                repeat: Infinity,
                                                                ease: "linear"
                                                            }, children: _jsx(Icon, { icon: "lucide:plane", className: "text-primary transform -translate-y-1/2" }) }) }), _jsxs("div", { className: "flex items-center", children: [_jsx(Icon, { icon: "lucide:plane-landing", className: "text-primary mr-2" }), _jsx("span", { className: "font-semibold", children: route.to })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-bold text-xl", children: route.points.toLocaleString() }), _jsx("div", { className: "text-sm text-default-500", children: "points" })] })] }), _jsxs("div", { className: "flex justify-between items-center text-sm text-default-500", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Icon, { icon: "lucide:briefcase", size: 16 }), _jsx("span", { children: route.airline })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Icon, { icon: "lucide:trending-up", size: 16 }), _jsxs("span", { children: [route.popularity, "% popularity"] })] })] })] })] }, index))) }) })] }));
}
