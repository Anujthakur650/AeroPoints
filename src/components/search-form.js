import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardBody, Button, Select, SelectItem, Divider, Spinner } from "@heroui/react";
import { DateRangePicker, DatePicker } from "@heroui/react";
import { parseDate, getLocalTimeZone, today } from "@internationalized/date";
import { useDateFormatter } from "@react-aria/i18n";
import apiService from "../services/api";
import AirportAutocomplete from "./AirportAutocomplete";
import searchHistoryService from "../services/search-history";
import SearchHistory from "./search-history";
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
// Cabin class options
const cabinClasses = [
    { key: "economy", label: "Economy" },
    { key: "premium-economy", label: "Premium Economy" },
    { key: "business", label: "Business" },
    { key: "first", label: "First Class" }
];
// Passenger count options
const passengerCounts = Array.from({ length: 9 }, (_, i) => ({
    key: `${i + 1}`,
    label: `${i + 1} ${i === 0 ? "Passenger" : "Passengers"}`
}));
// Mileage program options
const mileagePrograms = [
    { key: "united", label: "United MileagePlus" },
    { key: "delta", label: "Delta SkyMiles" },
    { key: "americanairlines", label: "American AAdvantage" },
    { key: "aircanada", label: "Air Canada Aeroplan" },
    { key: "ana", label: "ANA Mileage Club" },
    { key: "virginatlantic", label: "Virgin Atlantic Flying Club" },
    { key: "airfrance", label: "Air France/KLM Flying Blue" },
    { key: "avianca", label: "Avianca LifeMiles" },
    { key: "emirates", label: "Emirates Skywards" },
    { key: "british", label: "British Airways Avios" }
];
export function SearchForm({ onSearchResults, onSearchStart }) {
    // Form state
    const [tripType, setTripType] = useState("round-trip");
    const [cabinClass, setCabinClass] = useState("economy");
    const [passengers, setPassengers] = useState("1");
    const [mileageProgram, setMileageProgram] = useState("united");
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [selectedOriginAirport, setSelectedOriginAirport] = useState(null);
    const [selectedDestinationAirport, setSelectedDestinationAirport] = useState(null);
    // Search results and loading state
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [debug, setDebug] = useState(null);
    // Create today and next week dates
    const todayDate = today(getLocalTimeZone());
    const nextWeek = todayDate.copy();
    nextWeek.add({ days: 7 });
    const [dateRange, setDateRange] = useState({
        start: todayDate,
        end: nextWeek
    });
    const formatter = useDateFormatter({ dateStyle: "medium" });
    // Apply a saved search from history
    const handleApplySearch = (search) => {
        console.log('Applying saved search:', search);
        // Set form values from the saved search
        setOrigin(search.origin);
        setDestination(search.destination);
        // Set dates if available
        try {
            const startDate = parseDate(search.departureDate);
            if (search.returnDate) {
                // If we have a return date, set up round trip
                const endDate = parseDate(search.returnDate);
                setDateRange({ start: startDate, end: endDate });
                setTripType("round-trip");
            }
            else {
                // For one-way trips, use today's date + 7 days as placeholder end date
                // but set trip type to one-way
                const placeholderEndDate = today(getLocalTimeZone());
                placeholderEndDate.add({ days: 7 });
                setDateRange({ start: startDate, end: placeholderEndDate });
                setTripType("one-way");
            }
        }
        catch (e) {
            console.error('Error parsing dates from saved search:', e);
        }
        // Set other values
        setCabinClass(search.cabinClass);
        setPassengers(search.passengers.toString());
        // Clear any previous results and errors
        setSearchResults([]);
        setError("");
    };
    const handleSearch = async () => {
        // Validate inputs
        if (!origin || !destination) {
            setError("Please select both origin and destination airports.");
            setIsLoading(false);
            return;
        }
        // Validate dates
        if (!dateRange.start) {
            setError("Please select a departure date.");
            setIsLoading(false);
            return;
        }
        if (tripType === "round-trip" && !dateRange.end) {
            setError("Please select a return date for round trips.");
            setIsLoading(false);
            return;
        }
        // Optional: Add validation for date range (start before end)
        if (tripType === "round-trip" && dateRange.end && dateRange.start.compare(dateRange.end) > 0) {
            setError("Return date must be after the departure date.");
            setIsLoading(false);
            return;
        }
        // Clear previous errors and results
        setError("");
        setSearchResults([]);
        setIsLoading(true);
        setDebug(null);
        if (onSearchStart) {
            onSearchStart();
        }
        console.log("Starting flight search with parameters:", {
            origin,
            destination,
            departureDate: dateRange.start ? dateRange.start.toString() : 'N/A',
            returnDate: tripType === 'round-trip' && dateRange.end ? dateRange.end.toString() : 'N/A',
            cabinClass,
            mileageProgram,
            passengers,
            tripType,
            selectedOriginAirport,
            selectedDestinationAirport
        });
        try {
            // Check API connection explicitly before search
            console.log('Checking API connection before flight search...');
            const isConnected = await apiService.checkApiConnection();
            console.log("API connection status:", isConnected);
            if (!isConnected) {
                setError("Cannot connect to the flight search API. Please ensure the backend is running on port 8000.");
                setIsLoading(false);
                return;
            }
            // Prepare search parameters using the correct date formatting
            const searchParams = {
                origin: origin,
                destination: destination,
                date: formatDateForApi(dateRange.start),
                returnDate: tripType === 'round-trip' ? formatDateForApi(dateRange.end) : undefined,
                cabin_class: cabinClass,
                passengers: parseInt(passengers),
                airline: mileageProgram // Use mileage program as the source filter
            };
            console.log('Final search parameters:', searchParams);
            // Call the search API
            const response = await apiService.searchFlights(searchParams);
            console.log('Search results received:', response);
            // Extract flights from response
            const results = response.flights || [];
            // Store search in history
            const searchItem = {
                origin,
                destination,
                departureDate: formatDateForApi(dateRange.start),
                returnDate: tripType === 'round-trip' ? formatDateForApi(dateRange.end) : undefined,
                cabinClass,
                passengers: parseInt(passengers),
                mileageProgram,
                timestamp: Date.now()
            };
            searchHistoryService.addFlightSearchToHistory(searchItem);
            setSearchResults(results);
            if (onSearchResults) {
                onSearchResults(results);
            }
        }
        catch (error) {
            console.error('Search failed:', error);
            setError(error.message || 'Search failed. Please try again.');
            setDebug(error); // Store error details for debugging
        }
        finally {
            setIsLoading(false);
        }
    };
    // Format date for API (YYYY-MM-DD)
    const formatDateForApi = (dateValue) => {
        if (!dateValue)
            return '';
        // Convert DateValue to a proper date string
        const year = dateValue.year;
        const month = String(dateValue.month).padStart(2, '0');
        const day = String(dateValue.day).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const handleOriginChange = (value, airport) => {
        setOrigin(airport?.iata || airport?.icao || value);
        setSelectedOriginAirport(airport);
        console.log('Origin changed:', { value, airport, selected: airport?.iata || airport?.icao || value });
    };
    const handleDestinationChange = (value, airport) => {
        setDestination(airport?.iata || airport?.icao || value);
        setSelectedDestinationAirport(airport);
        console.log('Destination changed:', { value, airport, selected: airport?.iata || airport?.icao || value });
    };
    const handleSwap = () => {
        const tempOrigin = origin;
        const tempOriginAirport = selectedOriginAirport;
        setOrigin(destination);
        setSelectedOriginAirport(selectedDestinationAirport);
        setDestination(tempOrigin);
        setSelectedDestinationAirport(tempOriginAirport);
    };
    return (_jsx("div", { className: "w-full max-w-7xl mx-auto px-4 py-8", children: _jsxs(motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, className: "space-y-8", children: [_jsxs("div", { className: "text-center space-y-4", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.2 }, className: "inline-flex items-center gap-3 glass-card px-6 py-3 rounded-full", children: [_jsx(Icon, { icon: "lucide:search", className: "text-yellow-400" }), _jsx("span", { className: "text-yellow-400 font-medium uppercase tracking-wide", children: "Award Flight Search" })] }), _jsx(motion.h2, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.4 }, className: "text-4xl md:text-5xl font-bold text-gradient-luxury", style: { fontFamily: 'var(--font-luxury)' }, children: "Find Your Perfect Flight" })] }), _jsx(motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.6 }, children: _jsx(Card, { className: "card-premium", children: _jsx(CardBody, { className: "p-8", children: _jsxs("div", { className: "space-y-8", children: [_jsx("div", { className: "flex justify-center", children: _jsxs("div", { className: "glass-card p-2 rounded-full inline-flex", children: [_jsxs("button", { onClick: () => setTripType("round-trip"), className: `px-6 py-3 rounded-full font-medium transition-all duration-300 ${tripType === "round-trip"
                                                        ? "bg-yellow-400 text-gray-900 shadow-lg"
                                                        : "text-gray-300 hover:text-white hover:bg-white/10"}`, children: [_jsx(Icon, { icon: "lucide:repeat", className: "inline mr-2" }), "Round Trip"] }), _jsxs("button", { onClick: () => setTripType("one-way"), className: `px-6 py-3 rounded-full font-medium transition-all duration-300 ${tripType === "one-way"
                                                        ? "bg-yellow-400 text-gray-900 shadow-lg"
                                                        : "text-gray-300 hover:text-white hover:bg-white/10"}`, children: [_jsx(Icon, { icon: "lucide:arrow-right", className: "inline mr-2" }), "One Way"] })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6 items-end", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: [_jsx(Icon, { icon: "lucide:plane-takeoff", className: "inline mr-2 text-yellow-400" }), "From"] }), _jsx(AirportAutocomplete, { label: "From", value: selectedOriginAirport?.name || origin || "", onChange: handleOriginChange, placeholder: "Departure airport", icon: "lucide:plane-takeoff", type: "origin" })] }), _jsx("div", { className: "flex justify-center", children: _jsx(Button, { isIconOnly: true, variant: "light", className: "text-yellow-400 hover:bg-yellow-400/10 h-12 w-12 rounded-full", onPress: handleSwap, children: _jsx(Icon, { icon: "lucide:arrow-left-right", className: "text-xl" }) }) }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: [_jsx(Icon, { icon: "lucide:plane-landing", className: "inline mr-2 text-yellow-400" }), "To"] }), _jsx(AirportAutocomplete, { value: selectedDestinationAirport?.name || destination || "", onSelectionChange: handleDestinationChange, placeholder: "Arrival airport", className: "w-full", inputProps: {
                                                            classNames: {
                                                                input: "text-white text-lg",
                                                                inputWrapper: "bg-white/5 border border-white/20 hover:border-yellow-400/50 focus:border-yellow-400 rounded-xl h-14"
                                                            }
                                                        } })] })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-6", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: [_jsx(Icon, { icon: "lucide:calendar", className: "inline mr-2 text-yellow-400" }), tripType === "round-trip" ? "Dates" : "Departure Date"] }), tripType === "round-trip" ? (_jsx(DateRangePicker, { value: dateRange, onChange: setDateRange, className: "w-full", classNames: {
                                                            base: "w-full",
                                                            inputWrapper: "bg-white/5 border border-white/20 hover:border-yellow-400/50 focus:border-yellow-400 rounded-xl h-14",
                                                            input: "text-white text-lg"
                                                        } })) : (_jsx(DatePicker, { value: dateRange.start, onChange: (date) => setDateRange({ ...dateRange, start: date }), className: "w-full", classNames: {
                                                            base: "w-full",
                                                            inputWrapper: "bg-white/5 border border-white/20 hover:border-yellow-400/50 focus:border-yellow-400 rounded-xl h-14",
                                                            input: "text-white text-lg"
                                                        } }))] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: [_jsx(Icon, { icon: "lucide:credit-card", className: "inline mr-2 text-yellow-400" }), "Mileage Program"] }), _jsx(Select, { selectedKeys: [mileageProgram], onSelectionChange: (keys) => setMileageProgram(Array.from(keys)[0]), className: "w-full", classNames: {
                                                            trigger: "bg-white/5 border border-white/20 hover:border-yellow-400/50 focus:border-yellow-400 rounded-xl h-14",
                                                            value: "text-white text-lg",
                                                            popover: "bg-gray-900 border border-white/20"
                                                        }, children: mileagePrograms.map((program) => (_jsx(SelectItem, { value: program.key, className: "text-white hover:bg-white/10", children: program.label }, program.key))) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: [_jsx(Icon, { icon: "lucide:users", className: "inline mr-2 text-yellow-400" }), "Passengers"] }), _jsx(Select, { selectedKeys: [passengers], onSelectionChange: (keys) => setPassengers(Array.from(keys)[0]), className: "w-full", classNames: {
                                                            trigger: "bg-white/5 border border-white/20 hover:border-yellow-400/50 focus:border-yellow-400 rounded-xl h-14",
                                                            value: "text-white text-lg",
                                                            popover: "bg-gray-900 border border-white/20"
                                                        }, children: passengerCounts.map((count) => (_jsx(SelectItem, { value: count.key, className: "text-white hover:bg-white/10", children: count.label }, count.key))) })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("label", { className: "block text-sm font-medium text-gray-300 mb-2", children: [_jsx(Icon, { icon: "lucide:armchair", className: "inline mr-2 text-yellow-400" }), "Cabin Class"] }), _jsx(Select, { selectedKeys: [cabinClass], onSelectionChange: (keys) => setCabinClass(Array.from(keys)[0]), className: "w-full", classNames: {
                                                            trigger: "bg-white/5 border border-white/20 hover:border-yellow-400/50 focus:border-yellow-400 rounded-xl h-14",
                                                            value: "text-white text-lg",
                                                            popover: "bg-gray-900 border border-white/20"
                                                        }, children: cabinClasses.map((cabin) => (_jsx(SelectItem, { value: cabin.key, className: "text-white hover:bg-white/10", children: cabin.label }, cabin.key))) })] })] }), error && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "p-4 bg-red-500/10 border border-red-500/20 rounded-xl", children: _jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Icon, { icon: "lucide:alert-circle", className: "text-red-400 text-xl" }), _jsx("p", { className: "text-red-300", children: error })] }) })), _jsx("div", { className: "flex justify-center pt-4", children: _jsx(Button, { onPress: handleSearch, isLoading: isLoading, className: "bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold px-12 py-4 rounded-xl text-lg hover:shadow-2xl hover:shadow-yellow-400/25 transition-all duration-300 transform hover:scale-105", size: "lg", children: isLoading ? (_jsxs(_Fragment, { children: [_jsx(Spinner, { size: "sm", className: "mr-2" }), "Searching..."] })) : (_jsxs(_Fragment, { children: [_jsx(Icon, { icon: "lucide:search", className: "mr-2 text-xl" }), "Find Flights"] })) }) })] }) }) }) }), _jsxs(motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.8 }, className: "space-y-6", children: [_jsx(Divider, { className: "bg-white/10" }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-xl font-bold text-white flex items-center gap-3", children: [_jsx(Icon, { icon: "lucide:clock", className: "text-yellow-400" }), "Recent Searches"] }), _jsx(SearchHistory, { onApplySearch: handleApplySearch })] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("h3", { className: "text-xl font-bold text-white flex items-center gap-3", children: [_jsx(Icon, { icon: "lucide:bar-chart", className: "text-yellow-400" }), "Search Statistics"] }), _jsx(Card, { className: "card-premium", children: _jsx(CardBody, { className: "p-6", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-300", children: "Total Searches" }), _jsx("span", { className: "text-yellow-400 font-bold", children: searchHistoryService.getSearchHistory().length })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-300", children: "Average Results" }), _jsx("span", { className: "text-yellow-400 font-bold", children: Math.round(searchHistoryService
                                                                        .getSearchHistory()
                                                                        .reduce((sum, search) => sum + (search.resultsCount || 0), 0) /
                                                                        Math.max(searchHistoryService.getSearchHistory().length, 1)) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-gray-300", children: "Most Popular Route" }), _jsx("span", { className: "text-yellow-400 font-bold text-sm", children: (() => {
                                                                        const routes = searchHistoryService.getSearchHistory();
                                                                        if (routes.length === 0)
                                                                            return "N/A";
                                                                        const routeCounts = routes.reduce((acc, search) => {
                                                                            const route = `${search.origin}-${search.destination}`;
                                                                            acc[route] = (acc[route] || 0) + 1;
                                                                            return acc;
                                                                        }, {});
                                                                        const mostPopular = Object.entries(routeCounts).sort(([, a], [, b]) => b - a)[0];
                                                                        return mostPopular ? mostPopular[0] : "N/A";
                                                                    })() })] })] }) }) })] })] })] })] }) }));
}
