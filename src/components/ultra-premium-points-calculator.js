import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
const airlines = [
    { key: "delta", label: "Delta SkyMiles", icon: "logos:delta-airlines", multiplier: 1.2 },
    { key: "united", label: "United MileagePlus", icon: "logos:united-airlines", multiplier: 1.1 },
    { key: "american", label: "American AAdvantage", icon: "logos:american-airlines", multiplier: 1.15 },
    { key: "british", label: "British Airways Avios", icon: "logos:british-airways", multiplier: 1.3 },
    { key: "emirates", label: "Emirates Skywards", icon: "logos:emirates", multiplier: 1.4 }
];
export function UltraPremiumPointsCalculator() {
    const [selectedAirline, setSelectedAirline] = React.useState("delta");
    const [points, setPoints] = React.useState("50000");
    const [isCalculating, setIsCalculating] = React.useState(false);
    const [showResult, setShowResult] = React.useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const selectedAirlineData = airlines.find(airline => airline.key === selectedAirline);
    const baseValue = parseInt(points) || 0;
    const estimatedValue = Math.round(baseValue * 0.015 * (selectedAirlineData?.multiplier || 1));
    const valueRange = {
        low: Math.round(estimatedValue * 0.8),
        high: Math.round(estimatedValue * 1.2)
    };
    const handleCalculate = () => {
        if (!points || parseInt(points) <= 0)
            return;
        setIsCalculating(true);
        setTimeout(() => {
            setIsCalculating(false);
            setShowResult(true);
        }, 1500);
    };
    const handlePointsChange = (e) => {
        const value = e.target.value.replace(/[^\d]/g, '');
        setPoints(value);
        setShowResult(false);
    };
    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-US').format(num);
    };
    return (_jsx("div", { className: "calculator-section", children: _jsxs("div", { className: "max-w-4xl mx-auto px-4 py-16", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, viewport: { once: true }, className: "text-center mb-12", children: [_jsxs("div", { className: "inline-flex items-center gap-3 glass-badge mb-6", children: [_jsx(Icon, { icon: "lucide:calculator", className: "text-gold-primary" }), _jsx("span", { className: "text-gold-primary font-medium uppercase tracking-wide", children: "Points Calculator" })] }), _jsx("h2", { className: "calculator-main-title", children: "Discover Your Points Value" }), _jsx("p", { className: "calculator-subtitle", children: "Calculate the true value of your reward points with our premium estimation tool." })] }), _jsx(motion.div, { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.2 }, viewport: { once: true }, className: "calculator-container", children: _jsxs("div", { className: "calculator-content", children: [_jsxs("div", { className: "calculator-header", children: [_jsxs("h3", { className: "calculator-title", children: [_jsx(Icon, { icon: "lucide:calculator", className: "calculator-icon" }), "Premium Points Estimator"] }), _jsx("p", { className: "calculator-subtitle", children: "Get accurate valuations based on current market rates" })] }), _jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "form-label", children: [_jsx(Icon, { icon: "lucide:award", className: "form-label-icon" }), "Select Reward Program"] }), _jsx("select", { value: selectedAirline, onChange: (e) => {
                                                    setSelectedAirline(e.target.value);
                                                    setShowResult(false);
                                                }, className: "reward-program-dropdown", children: airlines.map((airline) => (_jsx("option", { value: airline.key, children: airline.label }, airline.key))) })] }), _jsxs("div", { className: "form-group", children: [_jsxs("label", { className: "form-label", children: [_jsx(Icon, { icon: "lucide:coins", className: "form-label-icon" }), "Points Amount"] }), _jsx("input", { type: "text", value: points ? formatNumber(parseInt(points)) : '', onChange: handlePointsChange, placeholder: "Enter your points amount", className: "points-input" })] }), _jsx(motion.button, { onClick: handleCalculate, disabled: !points || parseInt(points) <= 0 || isCalculating, className: "calculate-button", whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: isCalculating ? (_jsxs("div", { className: "flex items-center justify-center gap-3", children: [_jsx(Icon, { icon: "lucide:loader-2", className: "animate-spin" }), _jsx("span", { children: "Calculating Value..." })] })) : (_jsxs("div", { className: "flex items-center justify-center gap-3", children: [_jsx(Icon, { icon: "lucide:calculator", className: "button-icon" }), _jsx("span", { children: "Calculate Points Value" })] })) }), showResult && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "results-container", children: [_jsx("div", { className: "results-header", children: _jsxs("div", { className: "flex items-center gap-3 mb-4", children: [_jsx(Icon, { icon: "lucide:dollar-sign", className: "text-emerald-400 text-2xl" }), _jsxs("div", { children: [_jsx("h4", { className: "results-title", children: "Estimated Cash Value" }), _jsx("p", { className: "results-subtitle", children: "Based on current market rates" })] })] }) }), _jsxs("div", { className: "value-display", children: [_jsxs("div", { className: "primary-value", children: [_jsx("span", { className: "currency-symbol", children: "$" }), _jsx("span", { className: "value-amount", children: formatNumber(valueRange.low) }), _jsx("span", { className: "value-separator", children: " - " }), _jsx("span", { className: "value-amount", children: formatNumber(valueRange.high) })] }), _jsxs("div", { className: "value-per-point", children: [(estimatedValue / parseInt(points) * 1000).toFixed(2), "\u00A2 per point"] })] }), _jsxs("div", { className: "results-disclaimer", children: [_jsx(Icon, { icon: "lucide:info", width: 16, height: 16 }), _jsx("span", { children: "Values are estimates based on current redemption rates and may vary." })] })] }))] })] }) })] }) }));
}
