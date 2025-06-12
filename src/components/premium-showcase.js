import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Card, Button, Divider } from "@heroui/react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { useTheme } from "@heroui/use-theme";
const features = [
    {
        id: "design",
        title: "Elegant Design",
        description: "Meticulously crafted with attention to every detail, delivering a premium visual experience.",
        icon: "lucide:sparkles"
    },
    {
        id: "performance",
        title: "Exceptional Performance",
        description: "Optimized for speed and efficiency, ensuring a smooth and responsive user experience.",
        icon: "lucide:zap"
    },
    {
        id: "innovation",
        title: "Innovative Technology",
        description: "Cutting-edge features that push the boundaries of what's possible in digital experiences.",
        icon: "lucide:lightbulb"
    }
];
export function PremiumShowcase() {
    const { theme, setTheme } = useTheme();
    const [activeFeature, setActiveFeature] = React.useState("design");
    const [isHovering, setIsHovering] = React.useState(false);
    const toggleTheme = () => {
        setTheme(theme === "light" ? "dark" : "light");
    };
    return (_jsx("div", { className: "w-full py-16 md:py-24", children: _jsxs("div", { className: "container mx-auto px-4", children: [_jsx("div", { className: "flex justify-end mb-8", children: _jsx(Button, { isIconOnly: true, variant: "light", "aria-label": "Toggle theme", onPress: toggleTheme, className: "rounded-full", children: _jsx(Icon, { icon: theme === "light" ? "lucide:moon" : "lucide:sun", width: 24, height: 24, className: "text-foreground" }) }) }), _jsxs("div", { className: "flex flex-col items-center text-center mb-16", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }, className: "mb-4", children: _jsx("span", { className: "text-primary font-medium tracking-wide", children: "INTRODUCING" }) }), _jsxs(motion.h1, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }, className: "text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6", children: ["A New Era of ", _jsx("span", { className: "text-primary", children: "Premium" }), " Experience"] }), _jsx(motion.p, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }, className: "text-xl text-default-600 max-w-3xl", children: "Discover a meticulously crafted interface that combines beauty, functionality, and innovation to deliver an unparalleled digital experience." })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-5 gap-8 mb-16", children: [_jsx("div", { className: "lg:col-span-2", children: _jsx("div", { className: "sticky top-8 space-y-6", children: features.map((feature) => (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }, whileHover: { x: 5 }, className: "cursor-pointer", onClick: () => setActiveFeature(feature.id), children: _jsxs("div", { className: `flex items-start p-4 rounded-xl transition-all duration-300 ${activeFeature === feature.id
                                            ? "bg-primary/10 border-l-4 border-primary"
                                            : "hover:bg-default-100"}`, children: [_jsx("div", { className: `mr-4 p-3 rounded-full ${activeFeature === feature.id
                                                    ? "bg-primary text-white"
                                                    : "bg-default-100"}`, children: _jsx(Icon, { icon: feature.icon, width: 24, height: 24 }) }), _jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold mb-1", children: feature.title }), _jsx("p", { className: "text-default-600", children: feature.description })] })] }) }, feature.id))) }) }), _jsx("div", { className: "lg:col-span-3", children: _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }, children: _jsxs(Card, { className: "overflow-hidden", onMouseEnter: () => setIsHovering(true), onMouseLeave: () => setIsHovering(false), children: [_jsx(motion.div, { className: "relative h-[400px] bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center", animate: {
                                                backgroundPosition: isHovering ? "100% 100%" : "0% 0%"
                                            }, transition: { duration: 3, ease: "easeInOut" }, children: _jsxs(motion.div, { animate: {
                                                    y: isHovering ? -10 : 0,
                                                    scale: isHovering ? 1.05 : 1
                                                }, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }, className: "p-8", children: [_jsx("div", { className: "flex justify-center mb-6", children: _jsx("div", { className: "p-4 rounded-full bg-primary/20 backdrop-blur-md", children: _jsx(Icon, { icon: features.find(f => f.id === activeFeature)?.icon || "lucide:sparkles", width: 48, height: 48, className: "text-primary" }) }) }), _jsxs("div", { className: "text-center", children: [_jsx("h2", { className: "text-3xl font-bold mb-2", children: features.find(f => f.id === activeFeature)?.title }), _jsx("p", { className: "text-default-600 mb-6", children: features.find(f => f.id === activeFeature)?.description }), _jsx(Button, { color: "primary", size: "lg", className: "font-medium", endContent: _jsx(Icon, { icon: "lucide:arrow-right" }), children: "Learn More" })] })] }) }), _jsx(Divider, {}), _jsx("div", { className: "p-6", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-xl font-semibold", children: "Ready to experience it?" }), _jsx("p", { className: "text-default-600", children: "Join thousands of satisfied users today." })] }), _jsx(Button, { color: "primary", variant: "flat", endContent: _jsx(Icon, { icon: "lucide:external-link" }), children: "Get Started" })] }) })] }) }, activeFeature) })] }), _jsx(motion.div, { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }, viewport: { once: true }, className: "bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8 md:p-12", children: _jsxs("div", { className: "flex flex-col md:flex-row items-center gap-8", children: [_jsx("div", { className: "md:w-1/3 flex justify-center", children: _jsx("div", { className: "w-24 h-24 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-4xl font-bold", children: _jsx(Icon, { icon: "lucide:quote", width: 48, height: 48 }) }) }), _jsxs("div", { className: "md:w-2/3", children: [_jsx("p", { className: "text-xl md:text-2xl font-medium italic mb-6", children: "\"This premium interface has completely transformed our digital experience. The attention to detail and thoughtful design elements create a truly exceptional product that stands out from everything else on the market.\"" }), _jsxs("div", { children: [_jsx("p", { className: "font-semibold", children: "Sarah Johnson" }), _jsx("p", { className: "text-default-600", children: "Chief Design Officer, TechCorp" })] })] })] }) })] }) }));
}
