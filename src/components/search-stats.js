import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardFooter, Divider, Chip, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import searchHistoryService from '../services/search-history';
export const SearchStats = () => {
    const [topDestinations, setTopDestinations] = useState([]);
    const [topOrigins, setTopOrigins] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [totalSearches, setTotalSearches] = useState(0);
    // Load stats on mount
    useEffect(() => {
        calculateStats();
        // Set up interval to refresh stats every 60 seconds
        const interval = setInterval(() => {
            calculateStats();
        }, 60000);
        return () => clearInterval(interval);
    }, []);
    // Calculate search statistics
    const calculateStats = () => {
        const history = searchHistoryService.getFlightHistory();
        setTotalSearches(history.length);
        if (history.length === 0) {
            setTopDestinations([]);
            setTopOrigins([]);
            setRecentActivity([]);
            return;
        }
        // Set recent activity (last 3 searches)
        setRecentActivity(history.slice(0, 3));
        // Calculate top destinations
        const destinationCounts = {};
        const originCounts = {};
        history.forEach(search => {
            // Track destinations
            if (!destinationCounts[search.destination]) {
                destinationCounts[search.destination] = {
                    code: search.destination,
                    city: search.destinationCity,
                    count: 0
                };
            }
            destinationCounts[search.destination].count++;
            // Track origins
            if (!originCounts[search.origin]) {
                originCounts[search.origin] = {
                    code: search.origin,
                    city: search.originCity,
                    count: 0
                };
            }
            originCounts[search.origin].count++;
        });
        // Sort and limit to top 5
        const sortedDestinations = Object.values(destinationCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        const sortedOrigins = Object.values(originCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        setTopDestinations(sortedDestinations);
        setTopOrigins(sortedOrigins);
    };
    // Format date for display
    const formatDate = (timestamp) => {
        try {
            const date = new Date(timestamp);
            return date.toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
        catch (e) {
            return 'Unknown date';
        }
    };
    // If no search history, don't show stats
    if (totalSearches === 0) {
        return null;
    }
    return (_jsxs(Card, { className: "w-full", children: [_jsx(CardHeader, { className: "flex gap-3", children: _jsxs("div", { className: "flex flex-col", children: [_jsx("p", { className: "text-md font-semibold", children: "Your Search Statistics" }), _jsxs("p", { className: "text-small text-default-500", children: ["Based on ", totalSearches, " searches"] })] }) }), _jsx(Divider, {}), _jsxs(CardBody, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold mb-2", children: "Top Destinations" }), _jsx("div", { className: "space-y-2", children: topDestinations.length > 0 ? (topDestinations.map((destination, index) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsxs("span", { className: "text-default-500 text-xs mr-2", children: [index + 1, "."] }), _jsx(Chip, { color: "primary", variant: "flat", size: "sm", children: destination.code }), _jsx("span", { className: "ml-2 text-sm", children: destination.city || destination.code })] }), _jsxs(Chip, { color: "default", variant: "flat", size: "sm", children: [destination.count, " search", destination.count !== 1 ? 'es' : ''] })] }, destination.code)))) : (_jsx("p", { className: "text-sm text-default-500", children: "No destination data yet" })) })] }), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-semibold mb-2", children: "Top Origins" }), _jsx("div", { className: "space-y-2", children: topOrigins.length > 0 ? (topOrigins.map((origin, index) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center", children: [_jsxs("span", { className: "text-default-500 text-xs mr-2", children: [index + 1, "."] }), _jsx(Chip, { color: "success", variant: "flat", size: "sm", children: origin.code }), _jsx("span", { className: "ml-2 text-sm", children: origin.city || origin.code })] }), _jsxs(Chip, { color: "default", variant: "flat", size: "sm", children: [origin.count, " search", origin.count !== 1 ? 'es' : ''] })] }, origin.code)))) : (_jsx("p", { className: "text-sm text-default-500", children: "No origin data yet" })) })] })] }), _jsxs("div", { className: "mt-4", children: [_jsx("h3", { className: "text-sm font-semibold mb-2", children: "Recent Search Activity" }), _jsx("div", { className: "space-y-2", children: recentActivity.map((search, index) => (_jsxs("div", { className: "flex items-center text-sm", children: [_jsx(Icon, { icon: "lucide:search", className: "mr-2 text-default-500" }), _jsx("span", { className: "font-semibold", children: search.origin }), _jsx(Icon, { icon: "lucide:arrow-right", className: "mx-1" }), _jsx("span", { className: "font-semibold", children: search.destination }), _jsx("span", { className: "text-default-500 ml-2 text-xs", children: formatDate(search.timestamp) })] }, `activity-${index}`))) })] })] }), _jsx(Divider, {}), _jsx(CardFooter, { className: "justify-end", children: _jsx(Button, { variant: "flat", size: "sm", color: "danger", startContent: _jsx(Icon, { icon: "lucide:trash-2" }), onPress: () => {
                        searchHistoryService.clearFlightHistory();
                        calculateStats();
                    }, children: "Clear History" }) })] }));
};
export default SearchStats;
