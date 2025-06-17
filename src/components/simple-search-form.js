import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardBody, Button, Select, SelectItem } from "@heroui/react";
import { DateRangePicker, DatePicker } from "@heroui/react";
import { getLocalTimeZone, today } from "@internationalized/date";
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import apiService from "../services/api";
import { AirportAutocomplete } from "./AirportAutocomplete";
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
export function SimpleSearchForm({ onSearchResults, onSearchStart }) {
    // Form state
    const [tripType, setTripType] = useState("round-trip");
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [originAirport, setOriginAirport] = useState(null);
    const [destinationAirport, setDestinationAirport] = useState(null);
    const [cabinClass, setCabinClass] = useState("economy");
    const [passengers, setPassengers] = useState("1");
    const [mileageProgram, setMileageProgram] = useState("united");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    // Create today and next week dates
    const todayDate = today(getLocalTimeZone());
    const nextWeek = todayDate.add({ days: 7 });
    const [dateRange, setDateRange] = useState({
        start: todayDate,
        end: nextWeek
    });
    // Format date for API (YYYY-MM-DD)
    const formatDateForApi = (dateValue) => {
        const year = dateValue.year;
        const month = String(dateValue.month).padStart(2, '0');
        const day = String(dateValue.day).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    // Handle airport selection
    const handleOriginChange = (airportCode, airport) => {
        setOrigin(airportCode);
        setOriginAirport(airport || null);
    };
    const handleDestinationChange = (airportCode, airport) => {
        setDestination(airportCode);
        setDestinationAirport(airport || null);
    };
    const handleSearch = async () => {
        // Validate inputs
        if (!origin || !destination) {
            setError("Please enter both origin and destination airports (e.g., LAX, JFK).");
            return;
        }
        if (!dateRange.start) {
            setError("Please select a departure date.");
            return;
        }
        if (tripType === "round-trip" && !dateRange.end) {
            setError("Please select a return date for round trips.");
            return;
        }
        // Clear previous errors
        setError("");
        setIsLoading(true);
        if (onSearchStart) {
            onSearchStart();
        }
        try {
            // Prepare search parameters
            const searchParams = {
                origin: origin.toUpperCase(),
                destination: destination.toUpperCase(),
                date: formatDateForApi(dateRange.start),
                returnDate: tripType === 'round-trip' && dateRange.end ? formatDateForApi(dateRange.end) : undefined,
                cabin_class: cabinClass,
                passengers: parseInt(passengers)
            };
            console.log('Search parameters:', searchParams);
            // Call the search API
            const response = await apiService.searchFlights(searchParams);
            const results = response.flights || [];
            if (onSearchResults) {
                onSearchResults(results);
            }
        }
        catch (error) {
            console.error('Search failed:', error);
            setError(error.message || 'Search failed. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleSwap = () => {
        const tempOrigin = origin;
        const tempOriginAirport = originAirport;
        setOrigin(destination);
        setOriginAirport(destinationAirport);
        setDestination(tempOrigin);
        setDestinationAirport(tempOriginAirport);
    };
    return (_jsx("div", { className: "w-full max-w-7xl mx-auto px-4 py-8", children: _jsxs(motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, className: "space-y-8", children: [_jsxs("div", { className: "text-center space-y-4", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.2 }, className: "inline-flex items-center gap-3 px-8 py-4 rounded-full", style: {
                                background: 'rgba(255, 215, 0, 0.08)',
                                backdropFilter: 'blur(20px)',
                                border: '2px solid rgba(255, 215, 0, 0.2)',
                                boxShadow: '0 8px 32px rgba(255, 215, 0, 0.1)'
                            }, children: [_jsx(Icon, { icon: "lucide:search", className: "text-[#FFD700] text-xl" }), _jsx("span", { className: "text-[#FFD700] font-semibold uppercase tracking-wider text-sm", children: "Award Flight Search" })] }), _jsx(motion.h2, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.4 }, className: "text-4xl md:text-5xl font-bold", style: {
                                background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontFamily: 'Playfair Display, serif',
                                textShadow: '0 4px 8px rgba(255, 215, 0, 0.3)'
                            }, children: "Find Your Perfect Flight" }), _jsx(motion.p, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.6 }, className: "text-gray-300 text-lg max-w-2xl mx-auto", children: "Experience luxury travel with our premium award flight search" })] }), _jsx(motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.6 }, children: _jsxs(Card, { className: "shadow-2xl border relative overflow-hidden", style: {
                            background: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(30px)',
                            borderColor: 'rgba(255, 215, 0, 0.15)',
                            borderWidth: '1px',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(255, 215, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                        }, children: [_jsx("div", { className: "absolute inset-0 rounded-xl opacity-30", style: {
                                    background: 'linear-gradient(45deg, transparent, rgba(255, 215, 0, 0.1), transparent)',
                                    animation: 'shimmer 3s ease-in-out infinite'
                                } }), _jsx(CardBody, { className: "p-10 relative z-10", children: _jsxs("div", { className: "space-y-10", children: [_jsx("div", { className: "flex justify-center", children: _jsxs("div", { className: "p-2 rounded-full inline-flex relative", style: {
                                                    background: 'rgba(255, 215, 0, 0.05)',
                                                    backdropFilter: 'blur(15px)',
                                                    border: '1px solid rgba(255, 215, 0, 0.2)',
                                                    boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                                                }, children: [_jsxs("button", { onClick: () => setTripType("round-trip"), className: `px-8 py-4 rounded-full font-semibold transition-all duration-500 relative overflow-hidden ${tripType === "round-trip"
                                                            ? "text-gray-900 shadow-xl"
                                                            : "text-gray-300 hover:text-white hover:bg-white/5"}`, style: tripType === "round-trip" ? {
                                                            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                                            boxShadow: '0 10px 25px rgba(255, 215, 0, 0.4)'
                                                        } : {}, children: [_jsx(Icon, { icon: "lucide:repeat", className: "inline mr-2" }), "Round Trip"] }), _jsxs("button", { onClick: () => setTripType("one-way"), className: `px-8 py-4 rounded-full font-semibold transition-all duration-500 relative overflow-hidden ${tripType === "one-way"
                                                            ? "text-gray-900 shadow-xl"
                                                            : "text-gray-300 hover:text-white hover:bg-white/5"}`, style: tripType === "one-way" ? {
                                                            background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                                            boxShadow: '0 10px 25px rgba(255, 215, 0, 0.4)'
                                                        } : {}, children: [_jsx(Icon, { icon: "lucide:arrow-right", className: "inline mr-2" }), "One Way"] })] }) }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 items-end", children: [_jsx("div", { className: "space-y-4 group", children: _jsx(AirportAutocomplete, { label: "Departure", placeholder: "Search airports (e.g., LAX, Los Angeles)", value: origin, onChange: handleOriginChange, icon: "lucide:plane-takeoff", type: "origin" }) }), _jsx("div", { className: "flex justify-center md:mb-3", children: _jsx(motion.button, { whileHover: { scale: 1.1, rotate: 180 }, whileTap: { scale: 0.9 }, onClick: handleSwap, className: "p-4 rounded-full transition-all duration-300 group", style: {
                                                            background: 'rgba(255, 215, 0, 0.1)',
                                                            backdropFilter: 'blur(10px)',
                                                            border: '1px solid rgba(255, 215, 0, 0.3)',
                                                            boxShadow: '0 8px 25px rgba(255, 215, 0, 0.2)'
                                                        }, children: _jsx(Icon, { icon: "lucide:arrow-left-right", className: "text-[#FFD700] text-xl group-hover:text-white transition-colors duration-300" }) }) }), _jsx("div", { className: "space-y-4 group", children: _jsx(AirportAutocomplete, { label: "Arrival", placeholder: "Search airports (e.g., JFK, New York)", value: destination, onChange: handleDestinationChange, icon: "lucide:plane-landing", type: "destination" }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-8", children: [_jsxs("div", { className: "space-y-4 group", children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-200 mb-3 transition-colors duration-300 group-hover:text-[#FFD700]", children: [_jsx(Icon, { icon: "lucide:calendar", className: "inline mr-2 text-[#FFD700] text-lg" }), tripType === "round-trip" ? "Travel Dates" : "Departure Date"] }), tripType === "round-trip" ? (_jsx(DateRangePicker, { value: dateRange, onChange: setDateRange, className: "w-full bg-white/5 border-white/20 hover:bg-white/10 hover:border-[#FFD700]/30 backdrop-blur-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#FFD700]/20" })) : (_jsx(DatePicker, { value: dateRange.start, onChange: (date) => setDateRange({ ...dateRange, start: date }), className: "w-full bg-white/5 border-white/20 hover:bg-white/10 hover:border-[#FFD700]/30 backdrop-blur-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#FFD700]/20" }))] }), _jsxs("div", { className: "space-y-4 group", children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-200 mb-3 transition-colors duration-300 group-hover:text-[#FFD700]", children: [_jsx(Icon, { icon: "lucide:credit-card", className: "inline mr-2 text-[#FFD700] text-lg" }), "Loyalty Program"] }), _jsx(Select, { selectedKeys: [mileageProgram], onSelectionChange: (keys) => setMileageProgram(Array.from(keys)[0]), className: "w-full", classNames: {
                                                                trigger: "bg-white/5 border-white/20 hover:bg-white/10 hover:border-[#FFD700]/30 backdrop-blur-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#FFD700]/20",
                                                                value: "text-white"
                                                            }, size: "lg", children: mileagePrograms.map((program) => (_jsx(SelectItem, { children: program.label }, program.key))) })] }), _jsxs("div", { className: "space-y-4 group", children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-200 mb-3 transition-colors duration-300 group-hover:text-[#FFD700]", children: [_jsx(Icon, { icon: "lucide:users", className: "inline mr-2 text-[#FFD700] text-lg" }), "Travelers"] }), _jsx(Select, { selectedKeys: [passengers], onSelectionChange: (keys) => setPassengers(Array.from(keys)[0]), className: "w-full", classNames: {
                                                                trigger: "bg-white/5 border-white/20 hover:bg-white/10 hover:border-[#FFD700]/30 backdrop-blur-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#FFD700]/20",
                                                                value: "text-white"
                                                            }, size: "lg", children: passengerCounts.map((count) => (_jsx(SelectItem, { children: count.label }, count.key))) })] }), _jsxs("div", { className: "space-y-4 group", children: [_jsxs("label", { className: "block text-sm font-semibold text-gray-200 mb-3 transition-colors duration-300 group-hover:text-[#FFD700]", children: [_jsx(Icon, { icon: "lucide:armchair", className: "inline mr-2 text-[#FFD700] text-lg" }), "Cabin Class"] }), _jsx(Select, { selectedKeys: [cabinClass], onSelectionChange: (keys) => setCabinClass(Array.from(keys)[0]), className: "w-full", classNames: {
                                                                trigger: "bg-white/5 border-white/20 hover:bg-white/10 hover:border-[#FFD700]/30 backdrop-blur-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#FFD700]/20",
                                                                value: "text-white"
                                                            }, size: "lg", children: cabinClasses.map((cabin) => (_jsx(SelectItem, { children: cabin.label }, cabin.key))) })] })] }), error && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "p-6 rounded-xl relative overflow-hidden", style: {
                                                background: 'rgba(239, 68, 68, 0.1)',
                                                backdropFilter: 'blur(15px)',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)'
                                            }, children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(Icon, { icon: "lucide:alert-circle", className: "text-red-400 text-2xl" }), _jsx("p", { className: "text-red-300 font-medium", children: error })] }) })), _jsx("div", { className: "flex justify-center pt-6", children: _jsx(Button, { onPress: handleSearch, isLoading: isLoading, className: "font-bold px-16 py-6 rounded-2xl text-xl transition-all duration-500 transform hover:scale-105 relative overflow-hidden", size: "lg", style: {
                                                    background: isLoading
                                                        ? 'rgba(255, 215, 0, 0.6)'
                                                        : 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)',
                                                    color: '#1f2937',
                                                    boxShadow: isLoading ? 'none' : '0 25px 50px -12px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.2)',
                                                    border: '2px solid rgba(255, 215, 0, 0.3)'
                                                }, children: isLoading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-6 w-6 border-t-2 border-gray-900 mr-3" }), "Searching Premium Flights..."] })) : (_jsxs(_Fragment, { children: [_jsx(Icon, { icon: "lucide:search", className: "mr-3 text-2xl" }), "Find Luxury Flights"] })) }) })] }) })] }) }), _jsxs(motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.8 }, className: "space-y-8", children: [_jsx("div", { className: "h-px w-full", style: {
                                background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent)'
                            } }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-10", children: [_jsxs("div", { className: "space-y-6", children: [_jsxs("h3", { className: "text-2xl font-bold text-white flex items-center gap-4", children: [_jsx(Icon, { icon: "lucide:clock", className: "text-[#FFD700] text-2xl" }), _jsx("span", { style: {
                                                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent'
                                                    }, children: "Recent Searches" })] }), _jsx(Card, { className: "shadow-xl border relative overflow-hidden", style: {
                                                background: 'rgba(255, 255, 255, 0.02)',
                                                backdropFilter: 'blur(25px)',
                                                borderColor: 'rgba(255, 215, 0, 0.1)',
                                                boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                            }, children: _jsx(CardBody, { className: "p-8", children: _jsx("p", { className: "text-gray-300 text-center font-medium", children: "No recent searches yet" }) }) })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("h3", { className: "text-2xl font-bold text-white flex items-center gap-4", children: [_jsx(Icon, { icon: "lucide:bar-chart", className: "text-[#FFD700] text-2xl" }), _jsx("span", { style: {
                                                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                                                        WebkitBackgroundClip: 'text',
                                                        WebkitTextFillColor: 'transparent'
                                                    }, children: "Search Insights" })] }), _jsx(Card, { className: "shadow-xl border relative overflow-hidden", style: {
                                                background: 'rgba(255, 255, 255, 0.02)',
                                                backdropFilter: 'blur(25px)',
                                                borderColor: 'rgba(255, 215, 0, 0.1)',
                                                boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                                            }, children: _jsx(CardBody, { className: "p-8", children: _jsx("p", { className: "text-gray-300 text-center font-medium", children: "Premium statistics coming soon" }) }) })] })] })] })] }) }));
}
