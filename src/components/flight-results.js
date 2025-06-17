import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, Button, Chip, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
// Removed unused import
// Define animation keyframes
const fadeInUp = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
const float = `
  @keyframes float {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-5px);
    }
    100% {
      transform: translateY(0px);
    }
  }
`;
// Define CSS for best value badge
const bestValueStyle = `
  .best-value-badge {
    position: absolute;
    top: -1px;
    right: 20px;
    background: linear-gradient(135deg, #34d399 0%, #3b82f6 100%);
    color: white;
    padding: 0.25rem 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    border-radius: 0 0 8px 8px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    z-index: 10;
    transform-origin: top right;
    animation: badgePulse 2s infinite alternate ease-in-out;
  }

  @keyframes badgePulse {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(1.05);
    }
  }
`;
// Enhanced AirlineLogo component
function AirlineLogo({ airline }) {
    // Comprehensive airline code mapping for better logo support
    const getAirlineCode = (airlineName) => {
        const airlineMap = {
            // Major US Airlines
            'American Airlines': 'AA',
            'Delta Air Lines': 'DL',
            'United Airlines': 'UA',
            'Southwest Airlines': 'WN',
            'JetBlue': 'B6',
            'Alaska Airlines': 'AS',
            'Hawaiian Airlines': 'HA',
            'Frontier Airlines': 'F9',
            'Spirit Airlines': 'NK',
            // International Airlines
            'Emirates': 'EK',
            'Etihad Airways': 'EY',
            'Qatar Airways': 'QR',
            'British Airways': 'BA',
            'Virgin Atlantic': 'VS',
            'Air France': 'AF',
            'Air France-KLM': 'AF',
            'KLM': 'KL',
            'Lufthansa': 'LH',
            'Swiss International': 'LX',
            'Turkish Airlines': 'TK',
            'Singapore Airlines': 'SQ',
            'Cathay Pacific': 'CX',
            'Japan Airlines': 'JL',
            'ANA': 'NH',
            'Air Canada': 'AC',
            'Qantas': 'QF',
            'Virgin Australia': 'VA',
            // South American & Award Programs
            'LATAM': 'LA',
            'Avianca': 'AV',
            'GOL Airlines': 'G3',
            'Smiles (GOL)': 'G3',
            'Azul Brazilian Airlines': 'AD',
            'LifeMiles (Avianca)': 'AV',
            // Additional Airlines from backend API
            'Iberia': 'IB',
            'TAP Air Portugal': 'TP',
            'SAS': 'SK',
            'Air Europa': 'UX',
            'Aer Lingus': 'EI',
            'Finnair': 'AY',
            'LOT Polish Airlines': 'LO',
            'Austrian Airlines': 'OS',
            'Brussels Airlines': 'SN',
            'Air India': 'AI',
            'Thai Airways': 'TG',
            'Malaysia Airlines': 'MH',
            'Garuda Indonesia': 'GA',
            'China Airlines': 'CI',
            'EVA Air': 'BR',
            'Korean Air': 'KE',
            'Asiana Airlines': 'OZ'
        };
        return airlineMap[airlineName] || airlineName.substring(0, 2).toUpperCase();
    };
    const airlineCode = getAirlineCode(airline);
    // Try multiple logo sources for better coverage
    const logoSources = [
        `https://images.kiwi.com/airlines/64x64/${airlineCode}.png`,
        `https://content.airhex.com/content/logos/airlines_${airlineCode}_64_64_t.png`,
        `https://img.logo.dev/${airline.toLowerCase().replace(/\s+/g, '')}.com?size=64`,
    ];
    const getAirlineInitials = (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();
    };
    const getAirlineColor = (airlineName) => {
        // Color mapping based on airline or type
        const colorMap = {
            'American Airlines': 'from-blue-600 to-red-600',
            'Delta Air Lines': 'from-blue-500 to-blue-700',
            'United Airlines': 'from-blue-600 to-blue-800',
            'Southwest Airlines': 'from-orange-500 to-red-600',
            'JetBlue': 'from-blue-400 to-blue-600',
            'Alaska Airlines': 'from-blue-800 to-green-600',
            'Emirates': 'from-red-600 to-orange-600',
            'Etihad Airways': 'from-orange-500 to-yellow-600',
            'Qatar Airways': 'from-purple-600 to-red-600',
            'British Airways': 'from-blue-800 to-red-600',
            'Lufthansa': 'from-yellow-500 to-blue-600',
            'Air France': 'from-blue-600 to-red-500',
            'KLM': 'from-blue-500 to-cyan-500',
            'Singapore Airlines': 'from-blue-700 to-yellow-600',
            'Virgin Atlantic': 'from-red-500 to-pink-600',
            'Turkish Airlines': 'from-red-600 to-orange-600'
        };
        return colorMap[airlineName] || 'from-blue-500 to-purple-600';
    };
    const [currentSource, setCurrentSource] = React.useState(0);
    const [showFallback, setShowFallback] = React.useState(false);
    const handleImageError = () => {
        if (currentSource < logoSources.length - 1) {
            setCurrentSource(currentSource + 1);
        }
        else {
            setShowFallback(true);
        }
    };
    if (showFallback) {
        return (_jsx("div", { className: `relative w-full h-full flex items-center justify-center bg-gradient-to-r ${getAirlineColor(airline)} text-white rounded-lg font-bold text-sm shadow-lg`, children: getAirlineInitials(airline) }));
    }
    return (_jsx("div", { className: "relative w-full h-full flex items-center justify-center", children: _jsx("img", { src: logoSources[currentSource], alt: `${airline} logo`, className: "max-w-full max-h-full object-contain rounded", onError: handleImageError, onLoad: () => setCurrentSource(currentSource) }) }));
}
// Error Boundary component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error("React Error Boundary caught error:", error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            return (_jsxs("div", { style: {
                    padding: '20px',
                    margin: '20px',
                    backgroundColor: '#ffdddd',
                    border: '1px solid #ff0000',
                    borderRadius: '5px'
                }, children: [_jsx("h2", { children: "Something went wrong." }), _jsxs("details", { style: { whiteSpace: 'pre-wrap' }, children: [_jsx("summary", { children: "Show Error Details" }), this.state.error && this.state.error.toString()] })] }));
        }
        return this.props.children;
    }
}
// Helper functions
const getMileageCost = (flight, cabinClass) => {
    if (!flight)
        return 0;
    // Direct access to points property if available
    if (typeof flight.points === 'number')
        return flight.points;
    // Otherwise extract from cabin-specific fields
    switch (cabinClass.toLowerCase()) {
        case 'economy':
            return flight.YMileageCost || 0;
        case 'premium':
        case 'premium-economy':
            return flight.WMileageCost || 0;
        case 'business':
            return flight.JMileageCost || 0;
        case 'first':
            return flight.FMileageCost || 0;
        default:
            return flight.YMileageCost || 0;
    }
};
const getTaxesFees = (flight, cabinClass) => {
    if (!flight)
        return 0;
    // Direct access to cash property if available
    if (typeof flight.cash === 'number')
        return flight.cash;
    // Otherwise extract from cabin-specific fields
    switch (cabinClass.toLowerCase()) {
        case 'economy':
            return flight.YTaxesFees || 0;
        case 'premium':
        case 'premium-economy':
            return flight.WTaxesFees || 0;
        case 'business':
            return flight.JTaxesFees || 0;
        case 'first':
            return flight.FTaxesFees || 0;
        default:
            return flight.YTaxesFees || 0;
    }
};
const isAvailable = (flight, cabinClass) => {
    if (!flight)
        return false;
    // If seatsAvailable is set directly, use that
    if (typeof flight.seatsAvailable === 'number')
        return flight.seatsAvailable > 0;
    // Otherwise check cabin-specific availability
    switch (cabinClass.toLowerCase()) {
        case 'economy':
            return !!flight.YAvailable;
        case 'premium':
        case 'premium-economy':
            return !!flight.WAvailable;
        case 'business':
            return !!flight.JAvailable;
        case 'first':
            return !!flight.FAvailable;
        default:
            return !!flight.YAvailable;
    }
};
// Convert Flight to SeatsAeroFlight format
const convertFlightToSeatsAeroFormat = (flight) => {
    return {
        id: flight.id,
        ID: flight.id,
        RouteID: flight.id,
        Route: {
            ID: flight.id,
            OriginAirport: flight.origin,
            DestinationAirport: flight.destination,
            Source: flight.airline,
            Distance: 0
        },
        airline: flight.airline,
        flightNumber: flight.flightNumber,
        origin: flight.origin,
        destination: flight.destination,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        duration: flight.duration,
        cabinClass: flight.cabinClass,
        cabin: flight.cabinClass,
        points: flight.points,
        cash: flight.cash,
        seatsAvailable: flight.seatsAvailable,
        layovers: flight.layovers || [],
        realTimeData: flight.realTimeData,
        lastUpdated: flight.lastUpdated,
        Date: flight.lastUpdated || new Date().toISOString(),
        departureDate: flight.lastUpdated?.split('T')[0] || new Date().toISOString().split('T')[0],
        // Set cabin-specific fields
        YAvailable: flight.cabinClass === 'economy' && flight.seatsAvailable > 0,
        WAvailable: flight.cabinClass === 'premium-economy' && flight.seatsAvailable > 0,
        JAvailable: flight.cabinClass === 'business' && flight.seatsAvailable > 0,
        FAvailable: flight.cabinClass === 'first' && flight.seatsAvailable > 0,
        YMileageCost: flight.cabinClass === 'economy' ? flight.points : undefined,
        WMileageCost: flight.cabinClass === 'premium-economy' ? flight.points : undefined,
        JMileageCost: flight.cabinClass === 'business' ? flight.points : undefined,
        FMileageCost: flight.cabinClass === 'first' ? flight.points : undefined,
        YTaxesFees: flight.cabinClass === 'economy' ? flight.cash : undefined,
        WTaxesFees: flight.cabinClass === 'premium-economy' ? flight.cash : undefined,
        JTaxesFees: flight.cabinClass === 'business' ? flight.cash : undefined,
        FTaxesFees: flight.cabinClass === 'first' ? flight.cash : undefined
    };
};
export function FlightResults({ flights, isLoading, searchParams, onFlightSelect }) {
    const [sortBy, setSortBy] = useState('points');
    const [selectedFlight, setSelectedFlight] = useState(null);
    const sortedFlights = useMemo(() => {
        if (!flights || flights.length === 0)
            return [];
        const sorted = [...flights].sort((a, b) => {
            switch (sortBy) {
                case 'points':
                    return (a.points || 0) - (b.points || 0);
                case 'airline':
                    return (a.airline || '').localeCompare(b.airline || '');
                default:
                    return 0;
            }
        });
        return sorted;
    }, [flights, sortBy]);
    const getCabinIcon = (cabinClass) => {
        switch (cabinClass?.toLowerCase()) {
            case 'first': return 'lucide:crown';
            case 'business': return 'lucide:briefcase';
            case 'premium-economy': return 'lucide:star';
            default: return 'lucide:plane';
        }
    };
    const getCabinColor = (cabinClass) => {
        switch (cabinClass?.toLowerCase()) {
            case 'first': return 'text-yellow-400';
            case 'business': return 'text-blue-400';
            case 'premium-economy': return 'text-purple-400';
            default: return 'text-gray-400';
        }
    };

    if (isLoading) {
        return (_jsx("div", { className: "space-luxury", children: _jsx("div", { className: "max-w-4xl mx-auto", children: _jsxs("div", { className: "card-premium flex flex-col items-center justify-center py-16", children: [_jsx(motion.div, { animate: { rotate: 360 }, transition: { duration: 2, repeat: Infinity, ease: "linear" }, className: "mb-6", children: _jsx(Icon, { icon: "lucide:plane", className: "text-6xl text-yellow-400" }) }), _jsx("h3", { className: "text-2xl font-bold text-white mb-4", children: "Searching Premium Flights" }), _jsx("p", { className: "text-gray-300 text-center max-w-md", children: "We're scanning our exclusive network of luxury partners to find the best award availability for your journey." }), _jsx(Spinner, { size: "lg", className: "mt-6", color: "warning" })] }) }) }));
    }
    if (flights.length === 0) {
        return (_jsx("div", { className: "space-luxury", children: _jsx("div", { className: "max-w-4xl mx-auto", children: _jsxs(motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "card-premium text-center py-16", children: [_jsx(Icon, { icon: "lucide:search-x", className: "text-6xl text-gray-400 mx-auto mb-6" }), _jsx("h3", { className: "text-2xl font-bold text-white mb-4", children: "No Flights Found" }), _jsx("p", { className: "text-gray-300 mb-6 max-w-md mx-auto", children: "We couldn't find any flights matching your criteria. Try adjusting your search parameters or dates." }), _jsxs(Button, { className: "btn-luxury", onPress: () => window.location.reload(), children: [_jsx(Icon, { icon: "lucide:refresh-cw", className: "mr-2" }), "Try Different Dates"] })] }) }) }));
    }
    return (_jsx("div", { className: "space-luxury", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6 }, className: "flex flex-col md:flex-row justify-between items-start md:items-center mb-8", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-3xl font-bold text-white mb-2", style: { fontFamily: 'var(--font-luxury)' }, children: "Available Flights" }), _jsxs("p", { className: "text-gray-300", children: [flights.length, " premium options from ", searchParams.origin, " to ", searchParams.destination] })] }), _jsx("div", { className: "flex gap-2 mt-4 md:mt-0", children: [
                                { key: 'points', label: 'Best Value', icon: 'lucide:award' },
                                { key: 'airline', label: 'Airline', icon: 'lucide:plane' }
                            ].map((sort) => (_jsxs("button", { onClick: () => setSortBy(sort.key), className: `flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${sortBy === sort.key
                                    ? 'bg-yellow-400 text-gray-900'
                                    : 'glass-card text-gray-300 hover:text-white'}`, children: [_jsx(Icon, { icon: sort.icon, className: "text-sm" }), sort.label] }, sort.key))) })] }), _jsx("div", { className: "space-y-4", children: _jsx(AnimatePresence, { children: sortedFlights.map((flight, index) => (_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay: index * 0.1 }, whileHover: { y: -2 }, className: `
                  relative group cursor-pointer
                  ${selectedFlight === flight.id ? 'ring-2 ring-yellow-400/50' : ''}
                `, onClick: () => {
                                setSelectedFlight(flight.id);
                                onFlightSelect?.(flight);
                            }, children: [_jsx(Card, { className: `
                    bg-gradient-to-r from-gray-900/80 to-gray-800/80 
                    backdrop-blur-xl border-0 overflow-hidden
                    hover:shadow-2xl transition-all duration-300
                    ${selectedFlight === flight.id ? 'shadow-yellow-400/20 shadow-2xl' : ''}
                  `, style: {
                                        border: selectedFlight === flight.id ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                                    }, children: _jsxs(CardBody, { className: "p-6", children: [                        _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-10 gap-6 items-center", children: [_jsxs("div", { className: "lg:col-span-4", children: [_jsxs("div", { className: "flex items-center gap-4 mb-3", children: [_jsx("div", { className: "glass-card p-2 rounded-lg w-16 h-16 bg-white/95 border border-white/20", children: _jsx(AirlineLogo, { airline: flight.airline }) }), _jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-semibold text-white text-lg", children: flight.airline }), _jsx("div", { className: "text-sm text-gray-400 mb-2", children: flight.flightNumber }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Icon, { icon: getCabinIcon(flight.cabinClass), className: `text-sm ${getCabinColor(flight.cabinClass)}` }), _jsx("span", { className: "text-sm text-gray-300 capitalize", children: flight.cabinClass })] })] })] })] }), _jsx("div", { className: "lg:col-span-2", children: _jsx("div", { className: "flex items-center justify-center", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-bold text-white", children: flight.origin }), _jsxs("div", { className: "flex items-center gap-2 my-2", children: [_jsx("div", { className: "w-8 border-t border-dashed border-gray-400" }), _jsx(Icon, { icon: "lucide:plane", className: "text-yellow-400 text-lg" }), _jsx("div", { className: "w-8 border-t border-dashed border-gray-400" })] }), _jsx("div", { className: "text-lg font-bold text-white", children: flight.destination }), _jsx("div", { className: "mt-2", children: flight.layovers && flight.layovers.length > 0 ? (_jsxs("span", { className: "text-xs text-yellow-400 px-2 py-1 rounded-full bg-yellow-400/10", children: [flight.layovers.length, " stop", flight.layovers.length > 1 ? 's' : ''] })) : (_jsx("span", { className: "text-xs text-green-400 px-2 py-1 rounded-full bg-green-400/10", children: "Non-stop" })) })] }) }) }), _jsx("div", { className: "lg:col-span-3", children: _jsxs("div", { className: "text-center lg:text-right", children: [_jsxs("div", { className: "text-2xl font-bold text-gradient-gold", children: [flight.points?.toLocaleString() || 'N/A', " pts"] }), _jsxs("div", { className: "text-sm text-gray-400", children: ["+ $", flight.cash?.toLocaleString() || '0', " taxes"] }), _jsx("div", { className: "mt-3 flex justify-center lg:justify-end", children: _jsxs(Chip, { size: "sm", className: `${flight.seatsAvailable > 4
                                                                            ? 'bg-green-500/20 text-green-400'
                                                                            : flight.seatsAvailable > 1
                                                                                ? 'bg-yellow-500/20 text-yellow-400'
                                                                                : 'bg-red-500/20 text-red-400'}`, children: [flight.seatsAvailable, " seat", flight.seatsAvailable !== 1 ? 's' : '', " left"] }) })] }) }), _jsx("div", { className: "lg:col-span-1", children: _jsxs(Button, { className: "btn-luxury w-full group-hover:scale-105 transition-transform duration-300", size: "lg", children: [_jsx(Icon, { icon: "lucide:bookmark", className: "mr-2" }), "Select"] }) })] }), selectedFlight === flight.id && (_jsxs(motion.div, { initial: { opacity: 0, height: 0 }, animate: { opacity: 1, height: 'auto' }, exit: { opacity: 0, height: 0 }, transition: { duration: 0.3 }, className: "mt-6 pt-6 border-t border-white/10", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-white mb-2", children: "Aircraft" }), _jsxs("p", { className: "text-gray-300", children: [flight.airline, " Boeing 777-300ER"] })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-white mb-2", children: "Booking Class" }), _jsx("p", { className: "text-gray-300", children: flight.cabinClass })] }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-white mb-2", children: "Last Updated" }), _jsx("p", { className: "text-gray-300", children: flight.lastUpdated ? new Date(flight.lastUpdated).toLocaleDateString() : 'N/A' })] })] }), _jsx("div", { className: "flex justify-end mt-6", children: _jsx(Button, { className: "btn-luxury", size: "lg", endContent: _jsx(Icon, { icon: "lucide:external-link" }), children: "Book Now" }) })] }))] }) }), index === 0 && sortBy === 'points' && (_jsx("div", { className: "absolute -top-3 left-6 z-10", children: _jsx(Chip, { size: "sm", color: "warning", variant: "solid", className: "font-semibold", children: "Best Value" }) }))] }, flight.id))) }) }), _jsx(motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.5 }, className: "mt-12 text-center", children: _jsxs("div", { className: "card-premium p-8 max-w-2xl mx-auto", children: [_jsx("h3", { className: "text-2xl font-bold text-white mb-4", style: { fontFamily: 'var(--font-luxury)' }, children: "Need Help Booking?" }), _jsx("p", { className: "text-gray-300 mb-6", children: "Our premium travel concierge team is available 24/7 to assist with complex bookings and special requests." }), _jsx(Button, { className: "btn-luxury", size: "lg", endContent: _jsx(Icon, { icon: "lucide:phone" }), children: "Contact Concierge" })] }) })] }) }));
}
