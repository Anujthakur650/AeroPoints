import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Card, CardBody, CardHeader, Input, Button, Divider, Select, SelectItem } from "@heroui/react";
import { Icon } from "@iconify/react";
const airlines = [
    { key: "delta", label: "Delta SkyMiles" },
    { key: "united", label: "United MileagePlus" },
    { key: "american", label: "American AAdvantage" },
    { key: "british", label: "British Airways Avios" },
    { key: "emirates", label: "Emirates Skywards" }
];
export function PointsCalculator() {
    const [selectedAirline, setSelectedAirline] = React.useState("delta");
    const [points, setPoints] = React.useState("50000");
    const handleCalculate = () => {
        console.log("Calculating value for", points, "points on", selectedAirline);
    };
    return (_jsxs(Card, { className: "w-full shadow-md", children: [_jsxs(CardHeader, { className: "flex gap-3", children: [_jsx(Icon, { icon: "lucide:calculator", className: "text-primary", width: 24, height: 24 }), _jsxs("div", { className: "flex flex-col", children: [_jsx("p", { className: "text-lg font-bold", children: "Points Value Calculator" }), _jsx("p", { className: "text-small text-default-500", children: "Estimate the value of your reward points" })] })] }), _jsx(Divider, {}), _jsx(CardBody, { className: "p-4", children: _jsxs("div", { className: "space-y-4", children: [_jsx(Select, { label: "Select Reward Program", selectedKeys: [selectedAirline], onSelectionChange: (keys) => {
                                const selected = Array.from(keys)[0];
                                setSelectedAirline(selected);
                            }, children: airlines.map((item) => (_jsx(SelectItem, { value: item.key, children: item.label }, item.key))) }), _jsx(Input, { type: "number", label: "Points Amount", placeholder: "Enter points amount", value: points, onValueChange: setPoints, startContent: _jsx("div", { className: "pointer-events-none flex items-center", children: _jsx(Icon, { icon: "lucide:award", className: "text-default-400" }) }) }), _jsx(Button, { color: "primary", fullWidth: true, onPress: handleCalculate, children: "Calculate Value" }), _jsxs("div", { className: "bg-default-100 p-3 rounded-lg mt-4", children: [_jsx("p", { className: "text-center text-sm text-default-600", children: "Estimated Value" }), _jsx("p", { className: "text-center text-xl font-bold", children: "$750 - $950" }), _jsx("p", { className: "text-center text-xs text-default-500", children: "Based on current redemption rates" })] })] }) })] }));
}
