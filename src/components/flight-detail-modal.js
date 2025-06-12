import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import apiService from '../services/api';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { InteractiveSeatMap } from './interactive-seat-map';
import { Icon } from '@iconify/react';
export function FlightDetailModal({ flightId, flight, onClose }) {
    const [flightDetails, setFlightDetails] = useState(null);
    const [tripInfo, setTripInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showSeatMap, setShowSeatMap] = useState(false);
    // Add animation state
    const [isVisible, setIsVisible] = useState(false);
    useEffect(() => {
        // Trigger entrance animation after component mounts
        setTimeout(() => setIsVisible(true), 50);
        async function loadFlightDetails() {
            setLoading(true);
            setError('');
            try {
                // If flight is directly provided, use that instead of fetching
                if (flight) {
                    console.log('Using provided flight details:', flight);
                    // If the flight is in SeatsAeroFlight format, convert it to Flight format
                    if (flight.ID && flight.Route) {
                        const seatsAeroFlight = flight;
                        const cabinClass = flight.cabin || 'economy';
                        // Determine which price and availability fields to use based on cabin class
                        let points, cash, seatsAvailable;
                        switch (cabinClass.toLowerCase()) {
                            case 'economy':
                                points = seatsAeroFlight.YMileageCost;
                                cash = seatsAeroFlight.YTaxesFees;
                                seatsAvailable = seatsAeroFlight.YAvailable ? 1 : 0;
                                break;
                            case 'premium-economy':
                                points = seatsAeroFlight.WMileageCost;
                                cash = seatsAeroFlight.WTaxesFees;
                                seatsAvailable = seatsAeroFlight.WAvailable ? 1 : 0;
                                break;
                            case 'business':
                                points = seatsAeroFlight.JMileageCost;
                                cash = seatsAeroFlight.JTaxesFees;
                                seatsAvailable = seatsAeroFlight.JAvailable ? 1 : 0;
                                break;
                            case 'first':
                                points = seatsAeroFlight.FMileageCost;
                                cash = seatsAeroFlight.FTaxesFees;
                                seatsAvailable = seatsAeroFlight.FAvailable ? 1 : 0;
                                break;
                            default:
                                points = seatsAeroFlight.YMileageCost;
                                cash = seatsAeroFlight.YTaxesFees;
                                seatsAvailable = seatsAeroFlight.YAvailable ? 1 : 0;
                        }
                        // Create a Flight object from the SeatsAeroFlight
                        const convertedFlight = {
                            id: seatsAeroFlight.ID,
                            airline: seatsAeroFlight.Route.Source || 'Unknown Airline',
                            flightNumber: 'N/A', // This info might not be available in SeatsAeroFlight
                            origin: seatsAeroFlight.Route.OriginAirport,
                            destination: seatsAeroFlight.Route.DestinationAirport,
                            departureTime: '10:00 AM', // These are placeholders since SeatsAero doesn't provide exact times
                            arrivalTime: '12:00 PM',
                            duration: '2h 0m', // Could calculate based on distance if available
                            cabinClass: cabinClass,
                            points: points || 0,
                            cash: cash || 0,
                            seatsAvailable: seatsAvailable,
                            realTimeData: true,
                            lastUpdated: seatsAeroFlight.UpdatedAt,
                            layovers: [], // Not available in SeatsAeroFlight
                            rawTripData: seatsAeroFlight // Store the original data
                        };
                        setFlightDetails(convertedFlight);
                        // Extract additional trip info from SeatsAeroFlight
                        const tripInfo = {
                            mileageProgram: seatsAeroFlight.Route.Source
                        };
                        setTripInfo(tripInfo);
                    }
                    else {
                        // Already in Flight format, use directly
                        setFlightDetails(flight);
                        // Extract trip info if available
                        if (flight.rawTripData) {
                            const rawData = flight.rawTripData;
                            const tripInfo = {
                                aircraftType: rawData.AircraftType || rawData.aircraftType,
                                fareClass: rawData.FareClass || rawData.fareClass,
                                bookingClass: rawData.BookingClass || rawData.bookingClass,
                                mileageProgram: rawData.MileageProgram || rawData.mileageProgram || rawData.Source,
                                partnerAirline: rawData.PartnerAirline || rawData.partnerAirline
                            };
                            setTripInfo(tripInfo);
                        }
                    }
                }
                else if (flightId) {
                    // If only flightId is provided, fetch details from API
                    console.log('Loading flight details for ID:', flightId);
                    const details = await apiService.getFlightDetails(flightId);
                    if (details) {
                        console.log('Flight details loaded:', details);
                        setFlightDetails(details);
                        // Extract additional trip info if available from raw trip data
                        if (details.rawTripData) {
                            const rawData = details.rawTripData;
                            const tripInfo = {
                                aircraftType: rawData.AircraftType || rawData.aircraftType,
                                fareClass: rawData.FareClass || rawData.fareClass,
                                bookingClass: rawData.BookingClass || rawData.bookingClass,
                                mileageProgram: rawData.MileageProgram || rawData.mileageProgram || rawData.Source,
                                partnerAirline: rawData.PartnerAirline || rawData.partnerAirline
                            };
                            console.log('Extracted trip info:', tripInfo);
                            setTripInfo(tripInfo);
                        }
                    }
                    else {
                        setError('Flight details not found');
                    }
                }
                else {
                    setError('No flight ID or flight data provided');
                }
            }
            catch (err) {
                console.error('Error loading flight details:', err);
                setError('Failed to load flight details');
            }
            finally {
                setLoading(false);
            }
        }
        loadFlightDetails();
        // Add cleanup to handle modal closing animation
        return () => {
            setIsVisible(false);
        };
    }, [flightId, flight]);
    // Handle close with animation
    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => onClose(), 300); // Wait for animation to complete
    };
    return (_jsx("div", { className: "fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-300", style: { opacity: isVisible ? 1 : 0 }, onClick: (e) => {
            if (e.target === e.currentTarget)
                handleClose();
        }, children: _jsxs("div", { className: "bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 rounded-xl p-8 max-w-3xl w-full max-h-[90vh] overflow-auto relative border border-gray-700/50 shadow-2xl transition-all duration-300", style: {
                transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(20px)',
                opacity: isVisible ? 1 : 0,
                backgroundImage: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.1), transparent 400px)'
            }, children: [_jsx("button", { className: "absolute top-4 right-4 text-3xl font-light text-gray-400 hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800/50", onClick: handleClose, children: "\u00D7" }), _jsx("h3", { className: "text-2xl font-bold text-white mb-8 bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent inline-block", children: "Flight Details" }), loading && (_jsxs("div", { className: "flex flex-col items-center justify-center py-16", children: [_jsx("div", { className: "w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-6" }), _jsx("div", { className: "text-gray-400 font-medium", children: "Loading flight details..." })] })), error && (_jsx("div", { className: "bg-red-900/30 border border-red-700 rounded-lg p-6 text-red-300 font-medium", children: error })), flightDetails && !loading && (_jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { className: "flex gap-4 items-center", children: [_jsx("div", { className: "w-14 h-14 rounded-xl overflow-hidden bg-black/80 flex items-center justify-center p-2 border border-gray-700/40", children: _jsx(Icon, { icon: "ph:airplane-tilt-bold", className: "text-blue-400", width: 30 }) }), _jsxs("div", { children: [_jsx("span", { className: "text-2xl font-bold text-white", children: flightDetails.airline }), _jsxs("div", { className: "text-gray-400 mt-1 font-medium", children: ["Flight ", flightDetails.flightNumber] })] })] }), _jsxs("div", { className: "px-5 py-3 rounded-lg bg-blue-600/20 text-blue-300 border border-blue-700/30 font-medium", children: [flightDetails.cabinClass.charAt(0).toUpperCase() + flightDetails.cabinClass.slice(1), " Class"] })] }), _jsxs("div", { className: "bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-6 border border-gray-700/40 shadow-inner", children: [_jsxs("div", { className: "text-4xl font-extrabold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent", children: [formatNumber(flightDetails.points), " points"] }), _jsxs("div", { className: "text-gray-400 mt-2 font-medium", children: ["+ ", formatCurrency(flightDetails.cash), " taxes & fees"] }), flightDetails.seatsAvailable > 0 && (_jsxs("div", { className: "mt-3 text-green-400 text-sm flex items-center", children: [_jsx(Icon, { icon: "lucide:check-circle", className: "mr-2", width: 18 }), flightDetails.seatsAvailable, " ", flightDetails.seatsAvailable === 1 ? 'seat' : 'seats', " available"] }))] }), _jsx("div", { className: "bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700/30", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-400 mb-2", children: "Departure" }), _jsx("div", { className: "text-2xl font-bold text-white", children: flightDetails.departureTime }), _jsx("div", { className: "mt-2 text-xl font-medium text-blue-400", children: flightDetails.origin })] }), _jsxs("div", { className: "flex-1 px-6 flex flex-col items-center", children: [_jsx("div", { className: "text-gray-400 text-sm mb-2 font-medium", children: flightDetails.duration }), _jsxs("div", { className: "w-full flex items-center", children: [_jsx("div", { className: "w-3 h-3 rounded-full bg-blue-500" }), _jsx("div", { className: "flex-1 h-1 bg-gradient-to-r from-blue-500 via-blue-300/20 to-blue-500 animate-pulse" }), _jsx("div", { className: "w-3 h-3 rounded-full bg-blue-500" })] }), flightDetails.layovers && flightDetails.layovers.length > 0 && (_jsx("div", { className: "mt-3 text-amber-400 text-sm font-medium", children: flightDetails.layovers.length === 1
                                                    ? `1 stop (${flightDetails.layovers[0].airport})`
                                                    : `${flightDetails.layovers.length} stops` }))] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-sm text-gray-400 mb-2", children: "Arrival" }), _jsx("div", { className: "text-2xl font-bold text-white", children: flightDetails.arrivalTime }), _jsx("div", { className: "mt-2 text-xl font-medium text-blue-400", children: flightDetails.destination })] })] }) }), flightDetails.layovers && flightDetails.layovers.length > 0 && (_jsxs("div", { className: "mt-4", children: [_jsx("h4", { className: "text-lg font-bold text-white mb-3", children: "Layover Information" }), _jsx("div", { className: "space-y-3", children: flightDetails.layovers.map((layover, index) => (_jsx("div", { className: "bg-gray-800/50 p-4 rounded-xl border border-gray-700/40 hover:border-blue-500/30 transition-colors", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("div", { className: "font-medium text-blue-400", children: layover.airport }), _jsxs("div", { className: "text-sm text-gray-400", children: ["Duration: ", layover.duration] })] }) }, index))) })] })), tripInfo && (_jsxs("div", { className: "bg-gray-800/40 p-6 rounded-xl border border-gray-700/40", children: [_jsx("h4", { className: "text-lg font-bold text-white mb-4", children: "Additional Information" }), _jsxs("div", { className: "grid grid-cols-2 gap-6", children: [tripInfo.aircraftType && (_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-400 mb-1", children: "Aircraft" }), _jsx("div", { className: "text-white font-medium", children: tripInfo.aircraftType })] })), tripInfo.fareClass && (_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-400 mb-1", children: "Fare Class" }), _jsx("div", { className: "text-white font-medium", children: tripInfo.fareClass })] })), tripInfo.bookingClass && (_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-400 mb-1", children: "Booking Class" }), _jsx("div", { className: "text-white font-medium", children: tripInfo.bookingClass })] })), tripInfo.mileageProgram && (_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-400 mb-1", children: "Mileage Program" }), _jsx("div", { className: "text-white font-medium", children: tripInfo.mileageProgram })] })), tripInfo.partnerAirline && (_jsxs("div", { children: [_jsx("div", { className: "text-sm text-gray-400 mb-1", children: "Partner Airline" }), _jsx("div", { className: "text-white font-medium", children: tripInfo.partnerAirline })] }))] })] })), flightDetails.realTimeData && (_jsxs("div", { className: "mt-4 text-sm text-gray-500", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Icon, { icon: "lucide:info", className: "h-4 w-4 mr-2" }), "Real-time data from Seats.aero"] }), flightDetails.lastUpdated && (_jsxs("div", { className: "mt-1 ml-6", children: ["Last updated: ", new Date(flightDetails.lastUpdated).toLocaleString()] }))] })), _jsxs("div", { className: "flex justify-center gap-6 mt-10", children: [_jsxs("button", { className: "px-6 py-3 bg-gray-800/80 text-white font-semibold rounded-lg shadow-lg hover:bg-gray-700/80 transition-all flex items-center border border-gray-700/40 hover:border-gray-600/60 group", onClick: () => setShowSeatMap(true), children: [_jsx(Icon, { icon: "lucide:layout-grid", className: "h-5 w-5 mr-2 text-blue-400 transition-transform duration-300 group-hover:scale-110" }), "View Seat Map"] }), _jsxs("button", { className: "px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all relative overflow-hidden group", onClick: () => window.alert('Booking functionality will be implemented in a future update!'), children: [_jsxs("span", { className: "relative z-10 flex items-center", children: [_jsx(Icon, { icon: "lucide:credit-card", className: "h-5 w-5 mr-2 transition-transform duration-300 group-hover:scale-110" }), "Book this Flight"] }), _jsx("span", { className: "absolute inset-0 h-full w-full bg-gradient-to-r from-blue-700 to-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" })] })] })] })), showSeatMap && (_jsxs("div", { className: "mt-8 animate-fadeIn", children: [_jsxs("div", { className: "mb-4 flex justify-between items-center", children: [_jsx("h3", { className: "text-xl font-bold text-white", children: "Select Your Seat" }), _jsx("button", { className: "text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-800/50 w-8 h-8 flex items-center justify-center", onClick: () => setShowSeatMap(false), children: _jsx(Icon, { icon: "lucide:x", className: "h-5 w-5" }) })] }), _jsx(InteractiveSeatMap, { flightId: flightDetails?.id || flightId || '', onClose: () => setShowSeatMap(false) })] }))] }) }));
}
