import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
export function AnimatedBackground() {
    return (_jsxs("div", { className: "fixed inset-0 -z-10 overflow-hidden", children: [_jsx(motion.div, { className: "absolute inset-0 opacity-20", animate: {
                    backgroundPosition: ["0% 0%", "100% 100%"],
                }, transition: {
                    duration: 20,
                    repeat: Infinity,
                    repeatType: "reverse",
                }, style: {
                    backgroundImage: "linear-gradient(45deg, #0070F3 25%, transparent 25%, transparent 75%, #0070F3 75%, #0070F3), linear-gradient(45deg, #0070F3 25%, transparent 25%, transparent 75%, #0070F3 75%, #0070F3)",
                    backgroundSize: "60px 60px",
                    backgroundPosition: "0 0, 30px 30px",
                } }), [...Array(3)].map((_, i) => (_jsx(motion.div, { className: "absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20", animate: {
                    opacity: [0.1, 0.2, 0.1],
                    scale: [1, 1.1, 1],
                }, transition: {
                    duration: 8,
                    repeat: Infinity,
                    delay: i * 2,
                } }, i)))] }));
}
