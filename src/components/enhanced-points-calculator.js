import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Card, CardBody, CardHeader, Input, Button, Divider, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
const airlines = [
    { key: "delta", label: "Delta SkyMiles", icon: "logos:delta-airlines" },
    { key: "united", label: "United MileagePlus", icon: "logos:united-airlines" },
    { key: "american", label: "American AAdvantage", icon: "logos:american-airlines" },
    { key: "british", label: "British Airways Avios", icon: "logos:british-airways" },
    { key: "emirates", label: "Emirates Skywards", icon: "logos:emirates" }
];
export function EnhancedPointsCalculator() {
    const [selectedAirline, setSelectedAirline] = React.useState("delta");
    const [points, setPoints] = React.useState("50000");
    const [isCalculating, setIsCalculating] = React.useState(false);
    const [showResult, setShowResult] = React.useState(false);
    const handleCalculate = () => {
        setIsCalculating(true);
        setTimeout(() => {
            setIsCalculating(false);
            setShowResult(true);
        }, 1000);
    };
    return (_jsx("div", { className: "container mx-auto px-4", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }, viewport: { once: true }, className: "max-w-3xl mx-auto", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx(motion.div, { initial: { width: 0 }, whileInView: { width: "80px" }, transition: { duration: 1.2, ease: "easeOut" }, viewport: { once: true }, className: "h-1 bg-primary mb-4 mx-auto" }), _jsx("h2", { className: "text-3xl font-bold mb-3", style: { fontFamily: 'var(--font-heading)' }, children: "Points Value Calculator" }), _jsx("p", { className: "text-default-500 max-w-lg mx-auto", children: "Discover the true value of your reward points and make informed decisions about your next redemption" })] }), _jsxs(Card, { className: "shadow-xl backdrop-blur-card bg-background/80 border border-white/10 hover-lift", style: { boxShadow: 'var(--card-shadow)' }, children: [_jsxs(CardHeader, { className: "px-6 py-5 flex gap-4 items-center", children: [_jsx("div", { className: "p-3 rounded-full bg-primary/10", children: _jsx(Icon, { icon: "lucide:calculator", className: "text-primary", width: 24, height: 24 }) }), _jsxs("div", { className: "flex flex-col", children: [_jsx("p", { className: "text-xl font-bold", style: { fontFamily: 'var(--font-heading)' }, children: "Estimate Your Points Value" }), _jsx("p", { className: "text-small text-default-500", children: "Get an accurate valuation based on current market rates" })] })] }), _jsx(Divider, { className: "opacity-20" }), _jsx(CardBody, { className: "px-6 py-5", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsxs("label", { className: "flex items-center gap-2 mb-1.5 text-sm font-medium", children: [_jsx(Icon, { icon: "lucide:award", className: "text-primary", width: 14, height: 14 }), _jsx("span", { children: "Reward Program" })] }), _jsx(Select, { selectedKeys: [selectedAirline], onSelectionChange: (keys) => {
                                                    const selected = Array.from(keys)[0];
                                                    setSelectedAirline(selected);
                                                    setShowResult(false);
                                                }, className: "transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01]", classNames: {
                                                    base: "max-w-full",
                                                    trigger: "h-12 bg-default-100/20 hover:bg-default-100/30 border-default-200/30 hover:border-primary/40 data-[focused=true]:border-primary rounded-xl transition-all duration-200",
                                                    value: "text-default-800",
                                                    popover: "bg-background/95 backdrop-blur-lg border border-default-200/30 rounded-xl shadow-xl"
                                                }, listboxProps: {
                                                    itemClasses: {
                                                        base: "text-default-800 data-[hover=true]:bg-default-100/50 data-[hover=true]:text-default-900 rounded-lg transition-colors",
                                                        selectedIcon: "text-primary"
                                                    }
                                                }, popoverProps: {
                                                    classNames: {
                                                        content: "p-1 overflow-hidden"
                                                    }
                                                }, startContent: _jsx("div", { className: "pointer-events-none flex items-center", children: _jsx(Icon, { icon: "lucide:award", className: "text-default-400" }) }), renderValue: (items) => {
                                                    const item = items[0];
                                                    const airline = airlines.find(a => a.key === item.key);
                                                    return (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Icon, { icon: airline?.icon || "lucide:award", width: 20, height: 20 }), _jsx("span", { children: item.textValue })] }));
                                                }, children: airlines.map((item) => (_jsx(SelectItem, { value: item.key, startContent: _jsx(Icon, { icon: item.icon, width: 20, height: 20 }), children: item.label }, item.key))) })] }), _jsxs("div", { children: [_jsxs("label", { className: "flex items-center gap-2 mb-1.5 text-sm font-medium", children: [_jsx(Icon, { icon: "lucide:trending-up", className: "text-primary", width: 14, height: 14 }), _jsx("span", { children: "Points Amount" })] }), _jsx(Input, { type: "number", placeholder: "Enter points amount", value: points, onValueChange: (value) => {
                                                    setPoints(value);
                                                    setShowResult(false);
                                                }, startContent: _jsx("div", { className: "pointer-events-none flex items-center", children: _jsx(Icon, { icon: "lucide:trending-up", className: "text-default-400" }) }), classNames: {
                                                    base: "max-w-full",
                                                    mainWrapper: "h-12",
                                                    inputWrapper: "h-12 bg-default-100/20 hover:bg-default-100/30 border-default-200/30 hover:border-primary/40 data-[focused=true]:border-primary rounded-xl transition-all duration-200",
                                                    input: "placeholder:text-default-400/50 text-default-800",
                                                }, className: "transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01]" })] }), _jsx(motion.div, { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: _jsx(Button, { color: "primary", fullWidth: true, onPress: handleCalculate, isLoading: isCalculating, className: "h-12 rounded-xl font-medium bg-gradient-to-r from-primary-500 to-primary-600 shadow-lg shadow-primary-500/20", startContent: !isCalculating && _jsx(Icon, { icon: "lucide:calculator", width: 18, height: 18 }), children: isCalculating ? "Calculating..." : "Calculate Value" }) }), showResult && (_jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5 }, className: "p-6 rounded-xl border border-primary/20 bg-gradient-to-br from-primary-500/10 to-primary-600/5 backdrop-blur-sm", children: [_jsxs("div", { className: "flex justify-between items-center mb-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-full bg-primary/20", children: _jsx(Icon, { icon: "lucide:dollar-sign", className: "text-primary", width: 20, height: 20 }) }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-default-500", children: "Estimated Cash Value" }), _jsx("p", { className: "text-2xl font-bold text-primary", children: "$750 - $950" })] })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-xs text-default-400", children: "Value per 1,000 points" }), _jsxs("p", { className: "text-lg font-semibold", children: ["$", (850 / (parseInt(points) / 1000)).toFixed(2)] })] })] }), _jsxs("p", { className: "text-xs text-default-500 mt-2 flex items-center gap-1", children: [_jsx(Icon, { icon: "lucide:info", width: 12, height: 12 }), _jsx("span", { children: "Based on current redemption rates and market conditions" })] })] }))] }) })] })] }) }));
}
