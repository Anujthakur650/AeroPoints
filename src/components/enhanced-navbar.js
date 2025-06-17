import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link, Button, Avatar, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { ThemeToggle } from "./theme-toggle";
export function EnhancedNavbar() {
    const navItemVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.1 * i,
                duration: 0.5,
                ease: [0.16, 1, 0.3, 1]
            }
        })
    };
    return (_jsxs(Navbar, { className: "bg-background/80 backdrop-blur-md border-b border-divider", children: [_jsxs(NavbarBrand, { as: motion.div, initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.5 }, children: [_jsx(Icon, { icon: "lucide:plane", className: "text-primary", width: 28, height: 28 }), _jsx("p", { className: "font-bold text-inherit ml-2", children: "HeroUI" })] }), _jsx(NavbarContent, { className: "hidden sm:flex gap-4", justify: "center", children: ["Search Flights", "My Points", "Deals", "Partners"].map((item, i) => (_jsx(NavbarItem, { children: _jsx(motion.div, { custom: i, variants: navItemVariants, initial: "hidden", animate: "visible", children: _jsxs(Link, { color: "foreground", href: "#", className: "relative group", children: [item, _jsx("span", { className: "absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" })] }) }) }, item))) }), _jsxs(NavbarContent, { justify: "end", children: [_jsx(NavbarItem, { children: _jsx(ThemeToggle, {}) }), _jsx(NavbarItem, { className: "hidden lg:flex", children: _jsx(Button, { color: "primary", variant: "flat", startContent: _jsx(Icon, { icon: "lucide:bell" }), className: "transition-transform hover:scale-105", children: "Alerts" }) }), _jsxs(Dropdown, { placement: "bottom-end", children: [_jsx(DropdownTrigger, { children: _jsx(Avatar, { isBordered: true, as: "button", className: "transition-transform hover:scale-105", color: "primary", name: "Jason Smith", size: "sm", src: "https://i.pravatar.cc/150?u=a042581f4e29026704d" }) }), _jsxs(DropdownMenu, { "aria-label": "Profile Actions", variant: "flat", children: [_jsxs(DropdownItem, { className: "h-14 gap-2", children: [_jsx("p", { className: "font-semibold", children: "Signed in as" }), _jsx("p", { className: "font-semibold", children: "jason@example.com" })] }, "profile"), _jsx(DropdownItem, { children: "My Profile" }, "settings"), _jsx(DropdownItem, { children: "My Points (125,000)" }, "points"), _jsx(DropdownItem, { children: "My Trips" }, "trips"), _jsx(DropdownItem, { children: "Settings" }, "settings"), _jsx(DropdownItem, { children: "Help & Feedback" }, "help_and_feedback"), _jsx(DropdownItem, { color: "danger", children: "Log Out" }, "logout")] })] })] })] }));
}
