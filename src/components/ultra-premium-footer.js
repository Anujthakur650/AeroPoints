import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
export function UltraPremiumFooter() {
    const footerSections = [
        {
            title: "Company",
            links: [
                { text: "About Us", href: "/about", icon: "lucide:building" },
                { text: "Careers", href: "/careers", icon: "lucide:briefcase" },
                { text: "Press", href: "/press", icon: "lucide:newspaper" },
                { text: "Partners", href: "/partners", icon: "lucide:handshake" },
                { text: "Contact", href: "/contact", icon: "lucide:mail" }
            ]
        },
        {
            title: "Resources",
            links: [
                { text: "Points Guide", href: "/guide", icon: "lucide:book-open" },
                { text: "Airline Partners", href: "/airlines", icon: "lucide:plane" },
                { text: "Travel Blog", href: "/blog", icon: "lucide:pen-tool" },
                { text: "FAQ", href: "/faq", icon: "lucide:help-circle" },
                { text: "Help Center", href: "/help", icon: "lucide:life-buoy" }
            ]
        },
        {
            title: "Legal",
            links: [
                { text: "Terms of Service", href: "/terms", icon: "lucide:file-text" },
                { text: "Privacy Policy", href: "/privacy", icon: "lucide:shield" },
                { text: "Cookie Policy", href: "/cookies", icon: "lucide:cookie" },
                { text: "Accessibility", href: "/accessibility", icon: "lucide:eye" },
                { text: "Security", href: "/security", icon: "lucide:lock" }
            ]
        }
    ];
    const socialIcons = [
        { icon: "lucide:facebook", label: "Facebook", href: "#" },
        { icon: "lucide:twitter", label: "Twitter", href: "#" },
        { icon: "lucide:instagram", label: "Instagram", href: "#" },
        { icon: "lucide:linkedin", label: "LinkedIn", href: "#" }
    ];
    return (_jsx("footer", { className: "premium-footer", children: _jsxs("div", { className: "footer-content", children: [_jsxs("div", { className: "footer-main", children: [_jsxs(motion.div, { initial: { opacity: 0, x: -30 }, whileInView: { opacity: 1, x: 0 }, transition: { duration: 0.8 }, viewport: { once: true }, className: "footer-description", children: [_jsx("h3", { children: "AeroPoints Premium Travel" }), _jsx("p", { children: "Discover luxury travel experiences with our premium award flight booking platform. Transform your points into extraordinary journeys." }), _jsx("div", { className: "social-links", children: socialIcons.map((item, i) => (_jsx(motion.a, { href: item.href, "aria-label": item.label, whileHover: { scale: 1.2, y: -3 }, children: _jsx(Icon, { icon: item.icon, width: 18, height: 18 }) }, i))) })] }), _jsx("div", { className: "footer-links-grid", children: footerSections.map((section, sectionIndex) => (_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: sectionIndex * 0.1 }, viewport: { once: true }, className: "footer-section", children: [_jsx("h3", { className: "footer-section-title", children: section.title }), _jsx("ul", { className: "footer-links", children: section.links.map((link, i) => (_jsx("li", { children: _jsxs("a", { href: link.href, className: "footer-link", children: [_jsx(Icon, { icon: link.icon, width: 14, height: 14 }), link.text] }) }, i))) })] }, section.title))) })] }), _jsxs("div", { className: "footer-bottom", children: [_jsxs("p", { className: "copyright-text", children: ["\u00A9 ", new Date().getFullYear(), " AeroPoints. All rights reserved."] }), _jsxs("div", { className: "partner-logos", children: [_jsx("div", { className: "partner-logo", children: "Visa" }), _jsx("div", { className: "partner-logo", children: "Mastercard" }), _jsx("div", { className: "partner-logo", children: "Amex" }), _jsx("div", { className: "partner-logo", children: "PayPal" })] })] })] }) }));
}
