import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
const data = [
    { month: "Jan", points: 45000 },
    { month: "Feb", points: 52000 },
    { month: "Mar", points: 48000 },
    { month: "Apr", points: 61000 },
    { month: "May", points: 55000 },
    { month: "Jun", points: 67000 },
    { month: "Jul", points: 72000 },
    { month: "Aug", points: 69000 },
    { month: "Sep", points: 78000 },
    { month: "Oct", points: 85000 },
    { month: "Nov", points: 91000 },
    { month: "Dec", points: 95000 }
];
export function PointsAnalytics() {
    return (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }, viewport: { once: true }, children: _jsxs(Card, { className: "backdrop-blur-md border border-white/10", children: [_jsxs(CardHeader, { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-bold", children: "Points Analytics" }), _jsx("p", { className: "text-default-500", children: "Your points growth over time" })] }), _jsx(Button, { variant: "light", color: "primary", endContent: _jsx(Icon, { icon: "lucide:download" }), children: "Export Data" })] }), _jsx(CardBody, { className: "h-[400px]", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: data, children: [_jsx("defs", { children: _jsxs("linearGradient", { id: "pointsGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#0d8de3", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#0d8de3", stopOpacity: 0 })] }) }), _jsx(CartesianGrid, { strokeDasharray: "3 3", opacity: 0.1 }), _jsx(XAxis, { dataKey: "month", stroke: "#888888", fontSize: 12 }), _jsx(YAxis, { stroke: "#888888", fontSize: 12, tickFormatter: (value) => `${value.toLocaleString()}` }), _jsx(Tooltip, { contentStyle: {
                                        backgroundColor: "rgba(255, 255, 255, 0.1)",
                                        backdropFilter: "blur(10px)",
                                        border: "1px solid rgba(255, 255, 255, 0.1)",
                                        borderRadius: "8px"
                                    }, labelStyle: { color: "#888888" } }), _jsx(Area, { type: "monotone", dataKey: "points", stroke: "#0d8de3", fillOpacity: 1, fill: "url(#pointsGradient)" })] }) }) })] }) }));
}
