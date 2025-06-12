import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function NewAirportSearch({ value, onChange, label, placeholder }) {
    return (_jsxs("div", { children: [_jsx("label", { children: label }), _jsx("input", { type: "text", value: value, onChange: (e) => onChange(e.target.value), placeholder: placeholder })] }));
}
