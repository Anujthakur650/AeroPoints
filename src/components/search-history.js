import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import searchHistoryService from '../services/search-history';
export const SearchHistory = ({ onSelectSearch }) => {
    const [searchHistory, setSearchHistory] = useState([]);
    // Load search history on mount
    useEffect(() => {
        loadSearchHistory();
    }, []);
    // Load search history from service
    const loadSearchHistory = () => {
        const history = searchHistoryService.getFlightHistory();
        setSearchHistory(history);
    };
    // Clear search history
    const handleClearHistory = (e) => {
        e.stopPropagation();
        searchHistoryService.clearFlightHistory();
        setSearchHistory([]);
    };
    // Format date for display
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }
        catch (e) {
            return dateString;
        }
    };
    // Calculate how long ago a search was performed
    const getTimeAgo = (timestamp) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) {
            return 'just now';
        }
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) {
            return `${minutes}m ago`;
        }
        const hours = Math.floor(minutes / 60);
        if (hours < 24) {
            return `${hours}h ago`;
        }
        const days = Math.floor(hours / 24);
        if (days < 7) {
            return `${days}d ago`;
        }
        const weeks = Math.floor(days / 7);
        return `${weeks}w ago`;
    };
    // If no search history, don't render anything
    if (searchHistory.length === 0) {
        return null;
    }
    return (_jsxs(Dropdown, { children: [_jsx(DropdownTrigger, { children: _jsx(Button, { variant: "flat", size: "sm", startContent: _jsx(Icon, { icon: "lucide:history" }), endContent: _jsx(Icon, { icon: "lucide:chevron-down", className: "text-xs" }), className: "min-w-0", children: "Recent Searches" }) }), _jsxs(DropdownMenu, { "aria-label": "Search History", className: "min-w-[300px]", variant: "flat", children: [_jsx(DropdownSection, { title: "Recent Searches", showDivider: true, children: searchHistory.map((search, index) => (_jsx(DropdownItem, { textValue: `${search.origin} to ${search.destination}`, onClick: () => onSelectSearch(search), startContent: _jsx(Icon, { icon: "lucide:search", className: "text-default-500" }), endContent: _jsx("span", { className: "text-xs text-default-400", children: getTimeAgo(search.timestamp) }), description: `${formatDate(search.departureDate)}${search.returnDate ? ` - ${formatDate(search.returnDate)}` : ''} · ${search.cabinClass} · ${search.passengers} passenger${search.passengers !== 1 ? 's' : ''}`, className: "py-2", children: _jsxs("div", { className: "flex items-center text-sm", children: [_jsx("span", { className: "font-semibold", children: search.origin }), _jsx(Icon, { icon: "lucide:arrow-right", className: "mx-1" }), _jsx("span", { className: "font-semibold", children: search.destination })] }) }, `search-${index}`))) }), _jsx(DropdownSection, { children: _jsx(DropdownItem, { textValue: "Clear Search History", onClick: handleClearHistory, startContent: _jsx(Icon, { icon: "lucide:trash-2", className: "text-danger" }), className: "text-danger", children: "Clear Search History" }, "clear-history") })] })] }));
};
export default SearchHistory;
