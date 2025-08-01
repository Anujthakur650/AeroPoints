// Updated to show real flight times from Seats.aero API
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, Button, Chip, Select, SelectItem, Skeleton, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FlightDetailModal } from "./flight-detail-modal";
import { Flight, GroupedFlight, BookingOption } from "../services/api";
import { formatCurrency, formatNumber } from "../utils/formatters";
import { formatFlightTime, formatFlightDate, isNextDay, formatDuration, calculateLayoverDuration, getTimePeriod } from "../utils/flightFormatters";
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

// Enhanced AirlineLogo component with comprehensive airline code mapping
function AirlineLogo({ airline }: { airline: string }) {
  // Comprehensive airline code mapping for better logo support
  // This mapping is synchronized with the API service AIRLINE_CODES
  const getAirlineCode = (airlineName: string): string => {
    const airlineMap: Record<string, string> = {
      // North American Airlines
      'Delta Air Lines': 'DL',
      'American Airlines': 'AA',
      'United Airlines': 'UA',
      'Southwest Airlines': 'WN',
      'JetBlue Airways': 'B6',
      'Alaska Airlines': 'AS',
      'Hawaiian Airlines': 'HA',
      'Frontier Airlines': 'F9',
      'Spirit Airlines': 'NK',
      'Air Canada': 'AC',
      'WestJet': 'WS',
      
      // European Airlines
      'British Airways': 'BA',
      'Lufthansa': 'LH',
      'Air France': 'AF',
      'KLM Royal Dutch Airlines': 'KL',
      'KLM': 'KL',
      'Virgin Atlantic': 'VS',
      'Aer Lingus': 'EI',
      'Iberia': 'IB',
      'TAP Air Portugal': 'TP',
      'SAS Scandinavian Airlines': 'SK',
      'Finnair': 'AY',
      'LOT Polish Airlines': 'LO',
      'Austrian Airlines': 'OS',
      'Swiss International Air Lines': 'LX',
      'Brussels Airlines': 'SN',
      'Air Europa': 'UX',
      'Turkish Airlines': 'TK',
      
      // Middle Eastern Airlines
      'Emirates': 'EK',
      'Etihad Airways': 'EY',
      'Qatar Airways': 'QR',
      'EgyptAir': 'MS',
      'Royal Jordanian': 'RJ',
      
      // Asian/Pacific Airlines
      'Singapore Airlines': 'SQ',
      'Cathay Pacific': 'CX',
      'Japan Airlines': 'JL',
      'ANA (All Nippon Airways)': 'NH',
      'ANA': 'NH',
      'Thai Airways': 'TG',
      'Malaysia Airlines': 'MH',
      'Garuda Indonesia': 'GA',
      'China Airlines': 'CI',
      'EVA Air': 'BR',
      'Korean Air': 'KE',
      'Asiana Airlines': 'OZ',
      'Air India': 'AI',
      'Qantas': 'QF',
      'Virgin Australia': 'VA',
      'Jetstar Airways': 'JQ',
      'Air New Zealand': 'NZ',
      
      // South American Airlines
      'LATAM Airlines': 'LA',
      'Avianca': 'AV',
      'GOL Linhas Aéreas': 'G3',
      'GOL Airlines': 'G3',
      'Azul Brazilian Airlines': 'AD',
      'Aerolíneas Argentinas': 'AR',
      
      // African Airlines
      'South African Airways': 'SA',
      'Ethiopian Airlines': 'ET',
      'Kenya Airways': 'KQ',
      'Royal Air Maroc': 'AT'
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

  const getAirlineInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getAirlineColor = (airlineName: string): string => {
    // Color mapping based on airline or type
    const colorMap: Record<string, string> = {
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
    } else {
      setShowFallback(true);
    }
  };

  if (showFallback) {
    return (
      <div className={`relative w-full h-full flex items-center justify-center bg-gradient-to-r ${getAirlineColor(airline)} text-white rounded-lg font-bold text-sm shadow-lg`}>
        {getAirlineInitials(airline)}
      </div>
    );
  }
  
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <img 
        src={logoSources[currentSource]}
        alt={`${airline} logo`} 
        className="max-w-full max-h-full object-contain rounded"
        onError={handleImageError}
        onLoad={() => setCurrentSource(currentSource)} // Reset error state on successful load
      />
    </div>
  );
}

// Interface for seats.aero flight data
interface Layover {
  airport?: string;
  code?: string;
  duration?: string;
  [key: string]: any;
}

interface SeatsAeroFlight {
  ID?: string;
  RouteID?: string;
  Route?: {
    ID?: string;
    OriginAirport?: string;
    OriginRegion?: string;
    DestinationAirport?: string;
    DestinationRegion?: string;
    NumDaysOut?: number;
    Distance?: number;
    Source?: string;
  };
  Date?: string;
  ParsedDate?: string;
  YAvailable?: boolean;
  WAvailable?: boolean;
  JAvailable?: boolean;
  FAvailable?: boolean;
  YMileageCost?: number;
  WMileageCost?: number;
  JMileageCost?: number;
  FMileageCost?: number;
  YTaxesFees?: number;
  WTaxesFees?: number;
  JTaxesFees?: number;
  FTaxesFees?: number;
  UpdatedAt?: string;
  CreatedAt?: string;
  
  // Added properties from Flight interface
  id?: string;
  airline?: string;
  flightNumber?: string;
  origin?: string;
  destination?: string;
  departureTime?: string;
  arrivalTime?: string;
  duration?: string;
  cabinClass?: string;
  cabin?: string;
  points?: number;
  cash?: number;
  seatsAvailable?: number;
  stops?: number; // Add stops field
  layovers?: Layover[];
  segments?: any[]; // Add segments field
  realTimeData?: boolean;
  lastUpdated?: string;
  departureDate?: string;
  searchDate?: string; // Add searchDate property to store the original search date
}

// Error Boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("React Error Boundary caught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          padding: '20px', 
          margin: '20px', 
          backgroundColor: '#ffdddd', 
          border: '1px solid #ff0000',
          borderRadius: '5px'
        }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Show Error Details</summary>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      );
    }
    return this.props.children;
  }
}

// Helper functions
const getMileageCost = (flight: SeatsAeroFlight, cabinClass: string): number => {
  if (!flight) return 0;
  
  // Direct access to points property if available
  if (typeof flight.points === 'number') return flight.points;
  
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

const getTaxesFees = (flight: SeatsAeroFlight, cabinClass: string): number => {
  if (!flight) return 0;
  
  // Direct access to cash property if available
  if (typeof flight.cash === 'number') return flight.cash;
  
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

const isAvailable = (flight: SeatsAeroFlight, cabinClass: string): boolean => {
  if (!flight) return false;
  
  // If seatsAvailable is set directly, use that
  if (typeof flight.seatsAvailable === 'number') return flight.seatsAvailable > 0;
  
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
const convertFlightToSeatsAeroFormat = (flight: Flight): SeatsAeroFlight => {
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
    stops: flight.stops, // Include stops field
    layovers: flight.layovers || [],
    segments: flight.segments || [], // Include segments field
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

interface SearchParams {
  origin: string;
  destination: string;
  date?: string;
  cabinClass?: string;
}

interface FlightResultsProps {
  flights: Flight[];
  isLoading: boolean;
  searchParams: SearchParams;
  onFlightSelect?: (flight: Flight) => void;
}

interface GroupedFlightResultsProps {
  groupedFlights: GroupedFlight[];
  isLoading: boolean;
  searchParams: SearchParams;
  onFlightSelect?: (flight: Flight) => void;
  onBookingOptionSelect?: (groupedFlight: GroupedFlight, bookingOption: BookingOption) => void;
}

export function FlightResults({ flights, isLoading, searchParams, onFlightSelect }: FlightResultsProps) {
  const [sortBy, setSortBy] = useState<'points' | 'airline' | 'departure' | 'duration'>('points');
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);

  const sortedFlights = useMemo(() => {
    if (!flights || flights.length === 0) return [];
    
    const sorted = [...flights].sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return (a.points || 0) - (b.points || 0);
        case 'airline':
          return (a.airline || '').localeCompare(b.airline || '');
        case 'departure':
          // Sort by earliest departure time
          const aTime = new Date(a.departureTime || 0).getTime();
          const bTime = new Date(b.departureTime || 0).getTime();
          return aTime - bTime;
        case 'duration':
          // Sort by shortest journey time
          const aDuration = typeof a.durationMinutes === 'number' ? a.durationMinutes : (typeof a.duration === 'number' ? a.duration : 0);
          const bDuration = typeof b.durationMinutes === 'number' ? b.durationMinutes : (typeof b.duration === 'number' ? b.duration : 0);
          return aDuration - bDuration;
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [flights, sortBy]);

  const getCabinIcon = (cabinClass: string) => {
    switch (cabinClass?.toLowerCase()) {
      case 'first': return 'lucide:crown';
      case 'business': return 'lucide:briefcase';
      case 'premium-economy': return 'lucide:star';
      default: return 'lucide:plane';
    }
  };

  const getCabinColor = (cabinClass: string) => {
    switch (cabinClass?.toLowerCase()) {
      case 'first': return 'text-yellow-400';
      case 'business': return 'text-blue-400';
      case 'premium-economy': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };



  if (isLoading) {
    return (
      <div className="space-luxury">
        <div className="max-w-4xl mx-auto">
          <div className="card-premium flex flex-col items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-6"
            >
              <Icon icon="lucide:plane" className="text-6xl text-yellow-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-4">Searching Premium Flights</h3>
            <p className="text-gray-300 text-center max-w-md">
              We're scanning our exclusive network of luxury partners to find the best award availability for your journey.
            </p>
            <Spinner size="lg" className="mt-6" color="warning" />
          </div>
        </div>
      </div>
    );
  }

  if (flights.length === 0) {
    return (
      <div className="space-luxury">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card-premium text-center py-16"
          >
            <Icon icon="lucide:search-x" className="text-6xl text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">No Flights Found</h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              We couldn't find any flights matching your criteria. Try adjusting your search parameters or dates.
            </p>
            <Button
              className="btn-luxury"
              onPress={() => window.location.reload()}
            >
              <Icon icon="lucide:refresh-cw" className="mr-2" />
              Try Different Dates
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-luxury">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-luxury)' }}>
              Available Flights
            </h2>
            <p className="text-gray-300">
              {flights.length} premium options from {searchParams.origin} to {searchParams.destination}
            </p>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {[
              { key: 'points', label: 'Lowest Points', icon: 'lucide:award' },
              { key: 'departure', label: 'Earliest Departure', icon: 'lucide:clock' },
              { key: 'duration', label: 'Shortest Journey', icon: 'lucide:timer' },
              { key: 'airline', label: 'By Airline', icon: 'lucide:plane' }
            ].map((sort) => (
              <button
                key={sort.key}
                onClick={() => setSortBy(sort.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  sortBy === sort.key
                    ? 'bg-yellow-400 text-gray-900'
                    : 'glass-card text-gray-300 hover:text-white'
                }`}
              >
                <Icon icon={sort.icon} className="text-sm" />
                {sort.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Flight Cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {sortedFlights.map((flight, index) => (
              <motion.div
                key={flight.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
                className={`
                  relative group cursor-pointer
                  ${selectedFlight === flight.id ? 'ring-2 ring-yellow-400/50' : ''}
                `}
                onClick={() => {
                  setSelectedFlight(flight.id);
                  onFlightSelect?.(flight);
                }}
              >
                <Card 
                  className={`
                    bg-gradient-to-r from-gray-900/80 to-gray-800/80 
                    backdrop-blur-xl border-0 overflow-hidden
                    hover:shadow-2xl transition-all duration-300
                    ${selectedFlight === flight.id ? 'shadow-yellow-400/20 shadow-2xl' : ''}
                  `}
                  style={{
                    border: selectedFlight === flight.id ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <CardBody className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-center">
                       {/* Operating Airline & Flight Info */}
                       <div className="lg:col-span-4">
                         <div className="flex items-center gap-4 mb-3">
                           <div className="glass-card p-2 rounded-lg w-16 h-16 bg-white/95 border border-white/20">
                             <AirlineLogo airline={flight.airline} />
                           </div>
                           <div className="flex-1">
                             {/* Operating Airline (Primary) */}
                             <div className="font-semibold text-white text-lg">{flight.airline}</div>
                             <div className="text-sm text-gray-400 mb-1">{flight.flightNumber}</div>
                             
                             {/* Booking Program (Secondary) */}
                             {flight.bookingProgram && (
                               <div className="flex items-center gap-1 mb-2">
                                 <Icon icon="lucide:credit-card" className="text-xs text-yellow-400" />
                                 <span className="text-xs text-yellow-400">
                                   Available with {flight.bookingProgram}
                                 </span>
                               </div>
                             )}
                             
                             <div className="flex items-center gap-2">
                               <Icon icon={getCabinIcon(flight.cabinClass)} className={`text-sm ${getCabinColor(flight.cabinClass)}`} />
                               <span className="text-sm text-gray-300 capitalize">{flight.cabinClass}</span>
                             </div>
                           </div>
                         </div>
                       </div>

                      {/* Route Information with Times */}
                      <div className="lg:col-span-3">
                        <div className="flex items-center justify-between gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{flight.origin}</div>
                            <div className="text-lg text-white mt-1">
                              {formatFlightTime(flight.departureTime)}
                            </div>
                            <div className="text-sm text-gray-400">
                              {formatFlightDate(flight.departureTime)}
                            </div>
                          </div>
                          
                          <div className="flex-1 px-2">
                            <div className="flex items-center justify-center gap-2 mb-1">
                              <div className="flex-1 border-t border-dashed border-gray-400"></div>
                              <Icon icon="lucide:plane" className="text-yellow-400 text-lg transform rotate-90" />
                              <div className="flex-1 border-t border-dashed border-gray-400"></div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-gray-300">
                                {formatDuration(flight.duration || flight.durationMinutes)}
                              </div>
                              <div className="text-xs text-gray-400 mt-1">
                                {flight.stops !== undefined && flight.stops > 0 ? (
                                  <span className="text-yellow-400">
                                    {flight.stops} stop{flight.stops > 1 ? 's' : ''}
                                  </span>
                                ) : flight.layovers && flight.layovers.length > 0 ? (
                                  <span className="text-yellow-400">
                                    {flight.layovers.length} stop{flight.layovers.length > 1 ? 's' : ''}
                                  </span>
                                ) : (
                                  <span className="text-green-400">Non-stop</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-center">
                            <div className="text-2xl font-bold text-white">{flight.destination}</div>
                            <div className="text-lg text-white mt-1">
                              {formatFlightTime(flight.arrivalTime)}
                              {isNextDay(flight.departureTime, flight.arrivalTime) && (
                                <span className="text-sm text-yellow-400 ml-1">+1</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-400">
                              {formatFlightDate(flight.arrivalTime)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="lg:col-span-3">
                        <div className="text-center lg:text-right">
                          <div className="text-2xl font-bold text-gradient-gold">
                            {flight.points?.toLocaleString() || 'N/A'} {flight.bookingProgramCurrency || 'pts'}
                          </div>
                          <div className="text-sm text-gray-400">
                            + ${flight.cash?.toLocaleString() || '0'} taxes
                          </div>
                          <div className="mt-3 flex justify-center lg:justify-end">
                            <Chip
                              size="sm"
                              className={`${
                                flight.seatsAvailable > 4
                                  ? 'bg-green-500/20 text-green-400'
                                  : flight.seatsAvailable > 1
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {flight.seatsAvailable} seat{flight.seatsAvailable !== 1 ? 's' : ''} left
                            </Chip>
                          </div>
                        </div>
                      </div>

                      {/* Action */}
                      <div className="lg:col-span-1">
                        <Button
                          className="btn-luxury w-full group-hover:scale-105 transition-transform duration-300"
                          size="lg"
                        >
                          <Icon icon="lucide:bookmark" className="mr-2" />
                          Select
                        </Button>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {selectedFlight === flight.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 pt-6 border-t border-white/10"
                      >
                        {/* Segment Details for Connecting Flights */}
                        {flight.segments && flight.segments.length > 1 && (
                          <div className="mb-6">
                            <h4 className="font-semibold text-white mb-4">Flight Segments</h4>
                            <div className="space-y-3">
                              {flight.segments.map((segment: any, idx: number) => (
                                <div key={idx} className="glass-card p-4 rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="font-medium text-white">
                                        {segment.FlightNumber} - {segment.AircraftName || 'Aircraft'}
                                      </div>
                                      <div className="text-sm text-gray-400 mt-1">
                                        {segment.OriginAirport} → {segment.DestinationAirport}
                                      </div>
                                      <div className="text-sm text-gray-400">
                                        {formatFlightTime(segment.DepartsAt)} - {formatFlightTime(segment.ArrivesAt)}
                                        {isNextDay(segment.DepartsAt, segment.ArrivesAt) && (
                                          <span className="text-yellow-400 ml-1">+1</span>
                                        )}
                                      </div>
                                    </div>
                                    {idx < flight.segments.length - 1 && (
                                      <div className="text-right">
                                        <div className="text-xs text-yellow-400">Layover</div>
                                        <div className="text-sm text-gray-300">
                                          {calculateLayoverDuration(
                                            segment.ArrivesAt,
                                            flight.segments[idx + 1].DepartsAt
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="font-semibold text-white mb-2">Aircraft</h4>
                            <p className="text-gray-300">
                              {flight.aircraft && flight.aircraft.length > 0 
                                ? flight.aircraft.join(', ')
                                : 'Information not available'
                              }
                            </p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white mb-2">Booking Class</h4>
                            <p className="text-gray-300 capitalize">{flight.cabinClass}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white mb-2">Data Source</h4>
                            <p className="text-gray-300">
                              {flight.realTimeData ? (
                                <span className="flex items-center gap-1">
                                  <Icon icon="lucide:check-circle" className="text-green-400" />
                                  Real-time data
                                </span>
                              ) : (
                                'Historical data'
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex justify-end mt-6">
                          <Button
                            className="btn-luxury"
                            size="lg"
                            endContent={<Icon icon="lucide:external-link" />}
                          >
                            Book Now
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </CardBody>
                </Card>

                {/* Best Value Badge */}
                {index === 0 && sortBy === 'points' && (
                  <div className="absolute -top-3 left-6 z-10">
                    <Chip
                      size="sm"
                      color="warning"
                      variant="solid"
                      className="font-semibold"
                    >
                      Best Value
                    </Chip>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="card-premium p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-luxury)' }}>
              Need Help Booking?
            </h3>
            <p className="text-gray-300 mb-6">
              Our premium travel concierge team is available 24/7 to assist with complex bookings and special requests.
            </p>
            <Button
              className="btn-luxury"
              size="lg"
              endContent={<Icon icon="lucide:phone" />}
            >
              Contact Concierge
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// GroupedFlightResults Component for displaying grouped flights with multiple booking options
export function GroupedFlightResults({ groupedFlights, isLoading, searchParams, onFlightSelect, onBookingOptionSelect }: GroupedFlightResultsProps) {
  const [sortBy, setSortBy] = useState<'points' | 'airline' | 'departure' | 'duration'>('points');
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const [expandedBookingOptions, setExpandedBookingOptions] = useState<Set<string>>(new Set());

  const sortedGroupedFlights = useMemo(() => {
    if (!groupedFlights || groupedFlights.length === 0) return [];
    
    const sorted = [...groupedFlights].sort((a, b) => {
      switch (sortBy) {
        case 'points':
          const aMinPoints = Math.min(...a.bookingOptions.map(opt => opt.points || 0));
          const bMinPoints = Math.min(...b.bookingOptions.map(opt => opt.points || 0));
          return aMinPoints - bMinPoints;
        case 'airline':
          return (a.airline || '').localeCompare(b.airline || '');
        case 'departure':
          // Sort by earliest departure time
          const aTime = new Date(a.departureTime || 0).getTime();
          const bTime = new Date(b.departureTime || 0).getTime();
          return aTime - bTime;
        case 'duration':
          // Sort by shortest journey time
          const aDuration = typeof a.durationMinutes === 'number' ? a.durationMinutes : (typeof a.duration === 'number' ? a.duration : 0);
          const bDuration = typeof b.durationMinutes === 'number' ? b.durationMinutes : (typeof b.duration === 'number' ? b.duration : 0);
          return aDuration - bDuration;
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [groupedFlights, sortBy]);

  const toggleBookingOptions = (flightId: string) => {
    const newExpanded = new Set(expandedBookingOptions);
    if (newExpanded.has(flightId)) {
      newExpanded.delete(flightId);
    } else {
      newExpanded.add(flightId);
    }
    setExpandedBookingOptions(newExpanded);
  };

  const getCabinIcon = (cabinClass: string) => {
    switch (cabinClass?.toLowerCase()) {
      case 'first': return 'lucide:crown';
      case 'business': return 'lucide:briefcase';
      case 'premium-economy': return 'lucide:star';
      default: return 'lucide:plane';
    }
  };

  const getCabinColor = (cabinClass: string) => {
    switch (cabinClass?.toLowerCase()) {
      case 'first': return 'text-yellow-400';
      case 'business': return 'text-blue-400';
      case 'premium-economy': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="space-luxury">
        <div className="max-w-4xl mx-auto">
          <div className="card-premium flex flex-col items-center justify-center py-16">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="mb-6"
            >
              <Icon icon="lucide:plane" className="text-6xl text-yellow-400" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-4">Searching Premium Flights</h3>
            <p className="text-gray-300 text-center max-w-md">
              We're scanning our exclusive network of luxury partners to find the best award availability for your journey.
            </p>
            <Spinner size="lg" className="mt-6" color="warning" />
          </div>
        </div>
      </div>
    );
  }

  if (groupedFlights.length === 0) {
    return (
      <div className="space-luxury">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="card-premium text-center py-16"
          >
            <Icon icon="lucide:search-x" className="text-6xl text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">No Flights Found</h3>
            <p className="text-gray-300 mb-6 max-w-md mx-auto">
              We couldn't find any flights matching your criteria. Try adjusting your search parameters or dates.
            </p>
            <Button
              className="btn-luxury"
              onPress={() => window.location.reload()}
            >
              <Icon icon="lucide:refresh-cw" className="mr-2" />
              Try Different Dates
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-luxury">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8"
        >
          <div>
            <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-luxury)' }}>
              Grouped Flight Options
            </h2>
            <p className="text-gray-300">
              {groupedFlights.length} unique flights from {searchParams.origin} to {searchParams.destination}
            </p>
          </div>

          {/* Sort Options */}
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            {[
              { key: 'points', label: 'Lowest Points', icon: 'lucide:award' },
              { key: 'departure', label: 'Earliest Departure', icon: 'lucide:clock' },
              { key: 'duration', label: 'Shortest Journey', icon: 'lucide:timer' },
              { key: 'airline', label: 'By Airline', icon: 'lucide:plane' }
            ].map((sort) => (
              <button
                key={sort.key}
                onClick={() => setSortBy(sort.key as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                  sortBy === sort.key
                    ? 'bg-yellow-400 text-gray-900'
                    : 'glass-card text-gray-300 hover:text-white'
                }`}
              >
                <Icon icon={sort.icon} className="text-sm" />
                {sort.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grouped Flight Cards */}
        <div className="space-y-4">
          <AnimatePresence>
            {sortedGroupedFlights.map((groupedFlight, index) => {
              const isExpanded = expandedBookingOptions.has(groupedFlight.id);
              const bestOption = groupedFlight.bookingOptions.reduce((best, current) => 
                (current.points || 0) < (best.points || 0) ? current : best
              );
              
              return (
                <motion.div
                  key={groupedFlight.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -2 }}
                  className={`
                    relative group cursor-pointer
                    ${selectedFlight === groupedFlight.id ? 'ring-2 ring-yellow-400/50' : ''}
                  `}
                >
                  <Card 
                    className={`
                      bg-gradient-to-r from-gray-900/80 to-gray-800/80 
                      backdrop-blur-xl border-0 overflow-hidden
                      hover:shadow-2xl transition-all duration-300
                      ${selectedFlight === groupedFlight.id ? 'shadow-yellow-400/20 shadow-2xl' : ''}
                    `}
                    style={{
                      border: selectedFlight === groupedFlight.id ? '1px solid rgba(212, 175, 55, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                  >
                    <CardBody className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-center">
                        {/* Operating Airline & Flight Info */}
                        <div className="lg:col-span-4">
                          <div className="flex items-center gap-4 mb-3">
                            <div className="glass-card p-2 rounded-lg w-16 h-16 bg-white/95 border border-white/20">
                              <AirlineLogo airline={groupedFlight.airline} />
                            </div>
                            <div className="flex-1">
                              {/* Operating Airline (Primary) */}
                              <div className="font-semibold text-white text-lg">{groupedFlight.airline}</div>
                              <div className="text-sm text-gray-400 mb-1">{groupedFlight.flightNumber}</div>
                              
                              {/* Booking Programs Available */}
                              <div className="flex items-center gap-1 mb-2">
                                <Icon icon="lucide:credit-card" className="text-xs text-yellow-400" />
                                <span className="text-xs text-yellow-400">
                                  {groupedFlight.bookingOptions.length} booking option{groupedFlight.bookingOptions.length > 1 ? 's' : ''}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <Icon icon={getCabinIcon(groupedFlight.cabinClass)} className={`text-sm ${getCabinColor(groupedFlight.cabinClass)}`} />
                                <span className="text-sm text-gray-300 capitalize">{groupedFlight.cabinClass}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Route Information with Times */}
                        <div className="lg:col-span-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">{groupedFlight.origin}</div>
                              <div className="text-lg text-white mt-1">
                                {formatFlightTime(groupedFlight.departureTime)}
                              </div>
                              <div className="text-sm text-gray-400">
                                {formatFlightDate(groupedFlight.departureTime)}
                              </div>
                            </div>
                            
                            <div className="flex-1 px-2">
                              <div className="flex items-center justify-center gap-2 mb-1">
                                <div className="flex-1 border-t border-dashed border-gray-400"></div>
                                <Icon icon="lucide:plane" className="text-yellow-400 text-lg transform rotate-90" />
                                <div className="flex-1 border-t border-dashed border-gray-400"></div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm text-gray-300">
                                  {formatDuration(groupedFlight.duration)}
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  <span className="text-green-400">Non-stop</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-center">
                              <div className="text-2xl font-bold text-white">{groupedFlight.destination}</div>
                              <div className="text-lg text-white mt-1">
                                {formatFlightTime(groupedFlight.arrivalTime)}
                                {isNextDay(groupedFlight.departureTime, groupedFlight.arrivalTime) && (
                                  <span className="text-sm text-yellow-400 ml-1">+1</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-400">
                                {formatFlightDate(groupedFlight.arrivalTime)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Best Pricing */}
                        <div className="lg:col-span-2">
                          <div className="text-center lg:text-right">
                            <div className="text-sm text-gray-400 mb-1">Starting from</div>
                            <div className="text-2xl font-bold text-gradient-gold">
                              {bestOption.points?.toLocaleString() || 'N/A'} {bestOption.bookingProgramCurrency || 'pts'}
                            </div>
                            <div className="text-sm text-gray-400">
                              + ${bestOption.cash?.toLocaleString() || '0'} taxes
                            </div>
                            <div className="mt-2">
                              <Chip
                                size="sm"
                                className="bg-green-500/20 text-green-400"
                              >
                                {groupedFlight.bookingOptions.length} option{groupedFlight.bookingOptions.length > 1 ? 's' : ''}
                              </Chip>
                            </div>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="lg:col-span-1">
                          <Button
                            className="btn-luxury w-full group-hover:scale-105 transition-transform duration-300"
                            size="lg"
                            onPress={() => toggleBookingOptions(groupedFlight.id)}
                          >
                            <Icon icon={isExpanded ? "lucide:chevron-up" : "lucide:chevron-down"} className="mr-2" />
                            {isExpanded ? 'Hide' : 'View'}
                          </Button>
                        </div>
                      </div>

                      {/* Expandable Booking Options */}
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-6 pt-6 border-t border-white/10"
                        >
                          <h4 className="font-semibold text-white mb-4">Booking Options</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {groupedFlight.bookingOptions.map((option, optionIndex) => (
                              <motion.div
                                key={`${option.bookingProgram}-${optionIndex}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: optionIndex * 0.1 }}
                                className="glass-card p-4 rounded-lg hover:bg-white/10 transition-all duration-300"
                              >
                                <div className="flex justify-between items-start mb-3">
                                  <div>
                                    <div className="font-medium text-white">{option.bookingProgram}</div>
                                    <div className="text-sm text-gray-400">{option.bookingProgramCurrency}</div>
                                  </div>
                                  {option === bestOption && (
                                    <Chip size="sm" color="warning" variant="solid" className="text-xs">
                                      Best Value
                                    </Chip>
                                  )}
                                </div>
                                
                                <div className="mb-3">
                                  <div className="text-xl font-bold text-gradient-gold">
                                    {option.points?.toLocaleString() || 'N/A'} {option.bookingProgramCurrency || 'pts'}
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    + ${option.cash?.toLocaleString() || '0'} taxes
                                  </div>
                                </div>
                                
                                <div className="mb-3">
                                  <Chip
                                    size="sm"
                                    className={`${
                                      option.seatsAvailable > 4
                                        ? 'bg-green-500/20 text-green-400'
                                        : option.seatsAvailable > 1
                                        ? 'bg-yellow-500/20 text-yellow-400'
                                        : 'bg-red-500/20 text-red-400'
                                    }`}
                                  >
                                    {option.seatsAvailable} seat{option.seatsAvailable !== 1 ? 's' : ''} left
                                  </Chip>
                                </div>
                                
                                <Button
                                  className="btn-luxury w-full"
                                  size="sm"
                                  onPress={() => {
                                    setSelectedFlight(groupedFlight.id);
                                    // Convert GroupedFlight to Flight for the callback
                                    const flightForCallback: Flight = {
                                      ...groupedFlight,
                                      points: option.points,
                                      cash: option.cash,
                                      seatsAvailable: option.seatsAvailable,
                                      bookingProgram: option.bookingProgram,
                                      bookingProgramCurrency: option.bookingProgramCurrency
                                    };
                                    onFlightSelect?.(flightForCallback);
                                    onBookingOptionSelect?.(groupedFlight, option);
                                  }}
                                >
                                  <Icon icon="lucide:bookmark" className="mr-2" />
                                  Book with {option.bookingProgram}
                                </Button>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </CardBody>
                  </Card>

                  {/* Best Value Badge */}
                  {index === 0 && sortBy === 'points' && (
                    <div className="absolute -top-3 left-6 z-10">
                      <Chip
                        size="sm"
                        color="warning"
                        variant="solid"
                        className="font-semibold"
                      >
                        Best Value
                      </Chip>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="card-premium p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-luxury)' }}>
              Need Help Booking?
            </h3>
            <p className="text-gray-300 mb-6">
              Our premium travel concierge team is available 24/7 to assist with complex bookings and special requests.
            </p>
            <Button
              className="btn-luxury"
              size="lg"
              endContent={<Icon icon="lucide:phone" />}
            >
              Contact Concierge
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}