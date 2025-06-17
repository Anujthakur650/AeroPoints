import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import { Card, CardBody, CardHeader, Progress, Tabs, Tab, Divider, Button, Badge } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
const pointsHistory = [
    { month: "Jan", earned: 5000, redeemed: 0 },
    { month: "Feb", earned: 3500, redeemed: 0 },
    { month: "Mar", earned: 4200, redeemed: 10000 },
    { month: "Apr", earned: 6500, redeemed: 0 },
    { month: "May", earned: 7800, redeemed: 0 },
    { month: "Jun", earned: 4500, redeemed: 25000 },
];
const upcomingTrips = [
    {
        id: "1",
        destination: "Tokyo, Japan",
        departureDate: "Aug 15, 2024",
        airline: "ANA",
        status: "confirmed"
    },
    {
        id: "2",
        destination: "Paris, France",
        departureDate: "Oct 22, 2024",
        airline: "Air France",
        status: "pending"
    }
];
export function UserDashboard() {
    const [activeTab, setActiveTab] = React.useState("overview");
    const totalPoints = 125000;
    const eliteStatus = "Gold";
    const eliteProgress = 75;
    // Calculate points trend
    const totalEarned = pointsHistory.reduce((sum, month) => sum + month.earned, 0);
    const totalRedeemed = pointsHistory.reduce((sum, month) => sum + month.redeemed, 0);
    const netChange = totalEarned - totalRedeemed;
    return (_jsxs("div", { className: "my-12", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }, viewport: { once: true }, children: _jsx("h2", { className: "text-2xl font-bold mb-6", children: "Your Rewards Dashboard" }) }), _jsxs(Tabs, { "aria-label": "Dashboard Tabs", color: "primary", variant: "underlined", selectedKey: activeTab, onSelectionChange: (key) => setActiveTab(key), classNames: {
                    tabList: "gap-6",
                    cursor: "w-full bg-primary",
                    tab: "max-w-fit px-0 h-12"
                }, children: [_jsx(Tab, { title: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Icon, { icon: "lucide:layout-dashboard" }), _jsx("span", { children: "Overview" })] }), children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mt-6", children: [_jsx(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }, viewport: { once: true }, children: _jsxs(Card, { className: "bg-gradient-to-br from-primary-900/80 to-primary-800 text-white backdrop-blur-md border border-white/10 overflow-hidden", children: [_jsx("div", { className: "absolute top-0 right-0 opacity-10", children: _jsx(Icon, { icon: "lucide:award", width: 120, height: 120 }) }), _jsxs(CardBody, { className: "p-6", children: [_jsx("h3", { className: "text-lg font-medium text-white/80", children: "Total Points Balance" }), _jsxs("div", { className: "flex items-end gap-2 mt-2", children: [_jsx("p", { className: "text-4xl font-bold", children: totalPoints.toLocaleString() }), _jsx("div", { className: `text-sm mb-1 ${netChange >= 0 ? 'text-success-300' : 'text-danger-300'}`, children: _jsxs("span", { className: "flex items-center", children: [netChange >= 0 ? (_jsx(Icon, { icon: "lucide:trending-up", className: "mr-1" })) : (_jsx(Icon, { icon: "lucide:trending-down", className: "mr-1" })), Math.abs(netChange).toLocaleString(), " pts"] }) })] }), _jsx("p", { className: "text-white/60 text-sm mt-1", children: "Last updated: Today" }), _jsx(Divider, { className: "my-4 bg-white/20" }), _jsxs("div", { children: [_jsxs("div", { className: "flex justify-between mb-1", children: [_jsxs("span", { className: "text-sm text-white/80", children: ["Elite Status: ", eliteStatus] }), _jsxs("span", { className: "text-sm text-white/80", children: [eliteProgress, "%"] })] }), _jsx(Progress, { value: eliteProgress, color: "success", size: "sm", radius: "full", classNames: {
                                                                    track: "bg-white/20",
                                                                    indicator: "bg-gradient-to-r from-success-400 to-success-300"
                                                                } }), _jsx("p", { className: "text-xs text-white/60 mt-2", children: "25,000 more points needed for Platinum status" })] })] })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }, viewport: { once: true }, className: "md:col-span-2", children: _jsxs(Card, { className: "backdrop-blur-md border border-white/10 h-full", children: [_jsxs(CardHeader, { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-bold", children: "Upcoming Reward Trips" }), _jsx(Button, { size: "sm", variant: "flat", color: "primary", endContent: _jsx(Icon, { icon: "lucide:plus" }), children: "Book New Trip" })] }), _jsx(CardBody, { className: "p-4", children: upcomingTrips.length > 0 ? (_jsx("div", { className: "space-y-4", children: upcomingTrips.map((trip) => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg bg-default-50 dark:bg-default-100/50", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "p-2 rounded-full bg-primary/10 text-primary", children: _jsx(Icon, { icon: "lucide:plane", width: 20, height: 20 }) }), _jsxs("div", { children: [_jsx("p", { className: "font-medium", children: trip.destination }), _jsxs("p", { className: "text-sm text-default-500", children: [trip.departureDate, " \u2022 ", trip.airline] })] })] }), _jsx(Badge, { color: trip.status === "confirmed"
                                                                    ? "success"
                                                                    : trip.status === "pending"
                                                                        ? "warning"
                                                                        : "default", variant: "flat", children: trip.status.charAt(0).toUpperCase() + trip.status.slice(1) })] }, trip.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx("p", { className: "text-default-500", children: "No upcoming trips" }), _jsx(Button, { color: "primary", variant: "flat", size: "sm", className: "mt-2", children: "Book a trip with your points" })] })) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }, viewport: { once: true }, className: "md:col-span-3", children: _jsxs(Card, { className: "backdrop-blur-md border border-white/10", children: [_jsxs(CardHeader, { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-bold", children: "Points Activity" }), _jsx(Button, { size: "sm", variant: "light", color: "primary", endContent: _jsx(Icon, { icon: "lucide:download" }), children: "Export" })] }), _jsxs(CardBody, { className: "p-4", children: [_jsx("div", { className: "h-64 w-full", children: _jsx("div", { className: "flex h-full", children: pointsHistory.map((month, index) => (_jsxs("div", { className: "flex-1 flex flex-col justify-end items-center gap-2", children: [_jsxs("div", { className: "w-full flex flex-col items-center gap-1", children: [_jsx("div", { className: "w-4/5 bg-success-500/80 rounded-t-md", style: { height: `${(month.earned / 10000) * 100}px` }, title: `Earned: ${month.earned} points` }), month.redeemed > 0 && (_jsx("div", { className: "w-4/5 bg-danger-500/80 rounded-t-md", style: { height: `${(month.redeemed / 10000) * 100}px` }, title: `Redeemed: ${month.redeemed} points` }))] }), _jsx("span", { className: "text-xs text-default-500", children: month.month })] }, index))) }) }), _jsxs("div", { className: "flex justify-center gap-6 mt-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 bg-success-500 rounded-full" }), _jsx("span", { className: "text-sm", children: "Points Earned" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 bg-danger-500 rounded-full" }), _jsx("span", { className: "text-sm", children: "Points Redeemed" })] })] })] })] }) })] }) }, "overview"), _jsx(Tab, { title: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Icon, { icon: "lucide:activity" }), _jsx("span", { children: "Activity" })] }), children: _jsx("div", { className: "p-4 text-center", children: _jsx("p", { className: "text-default-500", children: "Detailed activity history will appear here." }) }) }, "activity"), _jsx(Tab, { title: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Icon, { icon: "lucide:gift" }), _jsx("span", { children: "Rewards" })] }), children: _jsx("div", { className: "p-4 text-center", children: _jsx("p", { className: "text-default-500", children: "Available rewards and redemption options will appear here." }) }) }, "rewards"), _jsx(Tab, { title: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Icon, { icon: "lucide:settings" }), _jsx("span", { children: "Preferences" })] }), children: _jsx("div", { className: "p-4 text-center", children: _jsx("p", { className: "text-default-500", children: "Account preferences and settings will appear here." }) }) }, "preferences")] })] }));
}
