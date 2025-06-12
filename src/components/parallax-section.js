import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
export function ParallaxSection({ children, offset = 50 }) {
    const ref = React.useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);
    const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.6, 1, 0.6]);
    return (_jsx(motion.div, { ref: ref, style: { y, opacity }, className: "relative", children: children }));
}
