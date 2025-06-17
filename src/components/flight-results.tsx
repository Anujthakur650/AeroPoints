import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, Button, Chip, Select, SelectItem, Skeleton, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FlightDetailModal } from "./flight-detail-modal";
import { Flight } from "../services/api";
import { formatCurrency, formatNumber } from "../utils/formatters";
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
function AirlineLogo({ airline }: { airline: string }) {
  // Comprehensive airline code mapping for better logo support
  const getAirlineCode = (airlineName: string): string => {
    const airlineMap: Record<string, string> = {
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
  layovers?: Layover[];
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

export function FlightResults({ flights, isLoading, searchParams, onFlightSelect }: FlightResultsProps) {
  const [sortBy, setSortBy] = useState<'points' | 'airline'>('points');
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);

  const sortedFlights = useMemo(() => {
    if (!flights || flights.length === 0) return [];
    
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
          <div className="flex gap-2 mt-4 md:mt-0">
            {[
              { key: 'points', label: 'Best Value', icon: 'lucide:award' },
              { key: 'airline', label: 'Airline', icon: 'lucide:plane' }
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
                      {/* Airline & Flight Info */}
                      <div className="lg:col-span-4">
                        <div className="flex items-center gap-4 mb-3">
                          <div className="glass-card p-2 rounded-lg w-16 h-16 bg-white/95 border border-white/20">
                            <AirlineLogo airline={flight.airline} />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-white text-lg">{flight.airline}</div>
                            <div className="text-sm text-gray-400 mb-2">{flight.flightNumber}</div>
                            <div className="flex items-center gap-2">
                              <Icon icon={getCabinIcon(flight.cabinClass)} className={`text-sm ${getCabinColor(flight.cabinClass)}`} />
                              <span className="text-sm text-gray-300 capitalize">{flight.cabinClass}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Route Information */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center justify-center">
                          <div className="text-center">
                            <div className="text-lg font-bold text-white">{flight.origin}</div>
                            <div className="flex items-center gap-2 my-2">
                              <div className="w-8 border-t border-dashed border-gray-400"></div>
                                                             <Icon icon="lucide:plane" className="text-yellow-400 text-lg" />
                              <div className="w-8 border-t border-dashed border-gray-400"></div>
                            </div>
                            <div className="text-lg font-bold text-white">{flight.destination}</div>
                            <div className="mt-2">
                              {flight.layovers && flight.layovers.length > 0 ? (
                                <span className="text-xs text-yellow-400 px-2 py-1 rounded-full bg-yellow-400/10">
                                  {flight.layovers.length} stop{flight.layovers.length > 1 ? 's' : ''}
                                </span>
                              ) : (
                                <span className="text-xs text-green-400 px-2 py-1 rounded-full bg-green-400/10">
                                  Non-stop
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Pricing */}
                      <div className="lg:col-span-3">
                        <div className="text-center lg:text-right">
                          <div className="text-2xl font-bold text-gradient-gold">
                            {flight.points?.toLocaleString() || 'N/A'} pts
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          <div>
                            <h4 className="font-semibold text-white mb-2">Aircraft</h4>
                            <p className="text-gray-300">{flight.airline} Boeing 777-300ER</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white mb-2">Booking Class</h4>
                            <p className="text-gray-300">{flight.cabinClass}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-white mb-2">Last Updated</h4>
                            <p className="text-gray-300">{flight.lastUpdated ? new Date(flight.lastUpdated).toLocaleDateString() : 'N/A'}</p>
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