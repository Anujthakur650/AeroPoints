import React, { useState, useEffect } from "react";
import { Card, CardBody, Input, Button, Select, SelectItem, Chip, Divider, Modal, ModalContent, ModalHeader, ModalBody, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";
import { DateRangePicker, DatePicker } from "@heroui/react";
import { parseDate, getLocalTimeZone } from "@internationalized/date";
import { motion, AnimatePresence } from "framer-motion";
import type { RangeValue } from "@react-types/shared";
import type { DateValue } from "@react-types/datepicker";
import apiService, { FlightSearchParams, Flight } from "../services/api";
import { AirportAutocomplete } from "./AirportAutocomplete";

// Premium interface definition
interface UltraPremiumSearchFormProps {
  onSearchResults: (flights: Flight[]) => void;
  onSearchStart?: () => void;
  onSearchError?: (error: string) => void;
}

// Luxury cabin classes with descriptions
const luxuryCabinClasses = [
  { 
    key: "economy", 
    label: "Economy", 
    icon: "lucide:armchair",
    description: "Comfortable seating with essential amenities",
    points: "From 15,000 points"
  },
  { 
    key: "premium-economy", 
    label: "Premium Economy", 
    icon: "lucide:star",
    description: "Enhanced comfort with priority boarding",
    points: "From 30,000 points"
  },
  { 
    key: "business", 
    label: "Business Class", 
    icon: "lucide:briefcase",
    description: "Lie-flat seats with gourmet dining",
    points: "From 60,000 points"
  },
  { 
    key: "first", 
    label: "First Class", 
    icon: "lucide:crown",
    description: "Private suites with personal concierge",
    points: "From 100,000 points"
  }
];

// Premium airline options
const premiumAirlines = [
  { key: "all", label: "All Airlines", alliance: "Multiple" },
  { key: "emirates", label: "Emirates", alliance: "Skyteam" },
  { key: "singapore", label: "Singapore Airlines", alliance: "Star Alliance" },
  { key: "qatar", label: "Qatar Airways", alliance: "Oneworld" },
  { key: "lufthansa", label: "Lufthansa", alliance: "Star Alliance" },
  { key: "ana", label: "ANA", alliance: "Star Alliance" },
  { key: "british", label: "British Airways", alliance: "Oneworld" },
  { key: "cathay", label: "Cathay Pacific", alliance: "Oneworld" },
  { key: "swiss", label: "Swiss International", alliance: "Star Alliance" },
];

// Elite destinations with imagery and descriptions
const eliteDestinations = [
  { 
    city: "Tokyo", 
    code: "NRT", 
    airport: "Narita International Airport", 
    country: "Japan",
    description: "Experience the pinnacle of Japanese hospitality",
    category: "Asia-Pacific"
  },
  { 
    city: "Dubai", 
    code: "DXB", 
    airport: "Dubai International Airport", 
    country: "United Arab Emirates",
    description: "Gateway to luxury in the Middle East",
    category: "Middle East"
  },
  { 
    city: "London", 
    code: "LHR", 
    airport: "Heathrow Airport", 
    country: "United Kingdom",
    description: "The epitome of British elegance",
    category: "Europe"
  },
  { 
    city: "Singapore", 
    code: "SIN", 
    airport: "Singapore Changi Airport", 
    country: "Singapore",
    description: "World's best airport experience",
    category: "Asia-Pacific"
  },
  { 
    city: "New York", 
    code: "JFK", 
    airport: "John F. Kennedy International Airport", 
    country: "United States",
    description: "The city that never sleeps",
    category: "Americas"
  },
  { 
    city: "Paris", 
    code: "CDG", 
    airport: "Charles de Gaulle Airport", 
    country: "France",
    description: "City of lights and luxury",
    category: "Europe"
  },
  { 
    city: "Los Angeles", 
    code: "LAX", 
    airport: "Los Angeles International Airport", 
    country: "United States",
    description: "Entertainment capital of the world",
    category: "Americas"
  },
  { 
    city: "Sydney", 
    code: "SYD", 
    airport: "Sydney Airport", 
    country: "Australia",
    description: "Harbour city sophistication",
    category: "Oceania"
  }
];

export function UltraPremiumSearchForm({ onSearchResults, onSearchStart, onSearchError }: UltraPremiumSearchFormProps) {
  // Premium state management
  const [searchMode, setSearchMode] = useState<"points" | "cash">("points");
  const [tripType, setTripType] = useState("round-trip");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originQuery, setOriginQuery] = useState("");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [showOriginSuggestions, setShowOriginSuggestions] = useState(false);
  const [showDestinationSuggestions, setShowDestinationSuggestions] = useState(false);
  const [cabinClass, setCabinClass] = useState("business");
  const [airline, setAirline] = useState("all");
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 });
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Date range state
  const [dateRange, setDateRange] = useState<RangeValue<DateValue>>({
    start: parseDate(new Date().toISOString().split('T')[0]),
    end: parseDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  });

  // Advanced filter state
  const [pointsRange, setPointsRange] = useState([25000, 100000]);
  const [flexibleDates, setFlexibleDates] = useState(false);
  const [preferredTimes, setPreferredTimes] = useState<string[]>([]);
  const [maxLayovers, setMaxLayovers] = useState(2);
  const [loungeAccess, setLoungeAccess] = useState(false);
  
  const { isOpen: isAdvancedOpen, onOpen: onAdvancedOpen, onClose: onAdvancedClose } = useDisclosure();

  // Premium search function with enhanced error handling
  const handleLuxurySearch = async () => {
    setError("");
    
    // Elegant validation
    if (!origin) {
      setError("Please select your departure destination");
      return;
    }
    
    if (!destination) {
      setError("Please choose your arrival destination");
      return;
    }
    
    if (origin === destination) {
      setError("Your journey requires different departure and arrival destinations");
      return;
    }
    
    if (!dateRange.start) {
      setError("Please select your preferred travel dates");
      return;
    }

    setIsSearching(true);
    if (onSearchStart) {
      onSearchStart();
    }

    const searchParams: FlightSearchParams = {
      origin,
      destination,
      departureDate: dateRange.start.toString(),
      returnDate: tripType === "one-way" ? undefined : dateRange.end?.toString(),
      cabinClass,
      airline: airline === "all" ? undefined : airline,
      passengers: passengers.adults,
      tripType,
      useAwardTravel: searchMode === "points"
    };

    try {
      const response = await apiService.searchFlights(searchParams);
      const flights = response.flights || [];
      
      // Save to premium search history
      const searchHistory = {
        ...searchParams,
        timestamp: new Date().toISOString(),
        resultsCount: flights.length
      };
      
      const existingHistory = JSON.parse(localStorage.getItem('premiumSearchHistory') || '[]');
      existingHistory.unshift(searchHistory);
      localStorage.setItem('premiumSearchHistory', JSON.stringify(existingHistory.slice(0, 10)));
      
      onSearchResults(flights);
    } catch (error) {
      console.error("Premium search error:", error);
      const errorMessage = "We encountered an issue while searching for your premium flights. Our concierge team has been notified.";
      setError(errorMessage);
      if (onSearchError) {
        onSearchError(errorMessage);
      }
    } finally {
      setIsSearching(false);
    }
  };

  // Elegant swap function
  const handleSwapDestinations = () => {
    const tempOrigin = origin;
    const tempDestination = destination;
    const tempOriginQuery = originQuery;
    const tempDestinationQuery = destinationQuery;
    
    setOrigin(tempDestination);
    setDestination(tempOrigin);
    setOriginQuery(tempDestinationQuery);
    setDestinationQuery(tempOriginQuery);
  };

  return (
    <div className="relative">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 via-transparent to-navy-500/5 rounded-3xl" />
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent rounded-3xl" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative"
      >
        <Card className="ultra-premium-card overflow-hidden border-0 shadow-luxury">
          <CardBody className="p-8 lg:p-12">
            {/* Luxury Header */}
            <div className="text-center mb-10">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-gold-100/20 to-gold-200/20 backdrop-blur-sm px-6 py-3 rounded-full border border-gold-300/30 mb-6"
              >
                <Icon icon="lucide:sparkles" className="text-gold-600" width={20} height={20} />
                <span className="text-gold-700 font-medium tracking-wide">Elite Travel Search</span>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-navy-800 via-navy-700 to-charcoal-700 bg-clip-text text-transparent mb-4"
                style={{ fontFamily: 'var(--font-luxury)' }}
              >
                Discover Extraordinary Journeys
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="text-charcoal-600 text-lg max-w-2xl mx-auto leading-relaxed"
              >
                Experience luxury travel redefined with our exclusive award search platform
              </motion.p>
            </div>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.95 }}
                  className="mb-8 p-4 bg-gradient-to-r from-red-50 to-red-100/50 border border-red-200/50 rounded-2xl backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <Icon icon="lucide:alert-triangle" className="text-red-600 flex-shrink-0" width={20} height={20} />
                    <p className="text-red-700 font-medium">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Search Mode Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex justify-center mb-10"
            >
              <div className="premium-toggle-container">
                <button
                  onClick={() => setSearchMode("points")}
                  className={`premium-toggle-btn ${searchMode === "points" ? "active" : ""}`}
                >
                  <Icon icon="lucide:award" className="mr-2" width={18} height={18} />
                  Award Travel
                </button>
                <button
                  onClick={() => setSearchMode("cash")}
                  className={`premium-toggle-btn ${searchMode === "cash" ? "active" : ""}`}
                >
                  <Icon icon="lucide:credit-card" className="mr-2" width={18} height={18} />
                  Cash Fares
                </button>
              </div>
            </motion.div>

            {/* Trip Type Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="mb-8"
            >
              <label className="premium-label">
                <Icon icon="lucide:route" className="text-gold-600 mr-2" width={16} height={16} />
                Journey Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                {[
                  { value: "round-trip", label: "Round Trip", icon: "lucide:repeat", desc: "Complete journey" },
                  { value: "one-way", label: "One Way", icon: "lucide:arrow-right", desc: "Single direction" },
                  { value: "multi-city", label: "Multi-City", icon: "lucide:map-pin", desc: "Complex itinerary" }
                ].map((option) => (
                  <motion.button
                    key={option.value}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setTripType(option.value)}
                    className={`premium-option-card ${tripType === option.value ? "selected" : ""}`}
                  >
                    <Icon icon={option.icon} className="mb-2" width={24} height={24} />
                    <h4 className="font-semibold text-sm">{option.label}</h4>
                    <p className="text-xs text-charcoal-500">{option.desc}</p>
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Destination Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.2 }}
              className="mb-8"
            >
              <label className="premium-label">
                <Icon icon="lucide:map-pin" className="text-gold-600 mr-2" width={16} height={16} />
                Destinations
              </label>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                <AirportAutocomplete
                  label="Origin Airport"
                  placeholder="Search origin airport"
                  value={originQuery}
                  onChange={(value, airport) => {
                    setOriginQuery(value);
                    setOrigin(airport?.iata || "");
                  }}
                  icon="lucide:plane-takeoff"
                />
                <AirportAutocomplete
                  label="Destination Airport"
                  placeholder="Search destination airport"
                  value={destinationQuery}
                  onChange={(value, airport) => {
                    setDestinationQuery(value);
                    setDestination(airport?.iata || "");
                  }}
                  icon="lucide:plane-landing"
                />
              </div>
            </motion.div>

            {/* Date Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.4 }}
              className="mb-8"
            >
              <label className="premium-label">
                <Icon icon="lucide:calendar" className="text-gold-600 mr-2" width={16} height={16} />
                Travel Dates
              </label>
              <div className="premium-date-container">
                {tripType === "one-way" ? (
                  <DatePicker
                    value={dateRange.start}
                    onChange={(date) => {
                      if (date) {
                        setDateRange({ start: date, end: date });
                      }
                    }}
                    minValue={parseDate(new Date().toISOString().split('T')[0])}
                    className="premium-date-picker"
                  />
                ) : (
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    minValue={parseDate(new Date().toISOString().split('T')[0])}
                    className="premium-date-picker"
                  />
                )}
              </div>
              <p className="text-sm text-charcoal-500 mt-2 flex items-center">
                <Icon icon="lucide:info" className="mr-1" width={14} height={14} />
                Flexible dates may reveal better award availability
              </p>
            </motion.div>

            {/* Travel Preferences */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.6 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
            >
              {/* Cabin Class */}
              <div>
                <label className="premium-label">
                  <Icon icon="lucide:star" className="text-gold-600 mr-2" width={16} height={16} />
                  Cabin Experience
                </label>
                <Select 
                  selectedKeys={[cabinClass]}
                  onSelectionChange={(keys) => setCabinClass(Array.from(keys)[0] as string)}
                  className="premium-select"
                  classNames={{
                    trigger: "premium-select-trigger",
                    value: "premium-select-value",
                    popover: "premium-select-popover"
                  }}
                >
                  {luxuryCabinClasses.map((cabin) => (
                    <SelectItem key={cabin.key} textValue={cabin.label}>
                      <div className="flex items-center justify-between w-full py-2">
                        <div className="flex items-center gap-3">
                          <Icon icon={cabin.icon} className="text-gold-600" width={18} height={18} />
                          <div>
                            <p className="font-semibold">{cabin.label}</p>
                            <p className="text-xs text-charcoal-500">{cabin.description}</p>
                          </div>
                        </div>
                        <span className="text-xs text-gold-600 font-medium">{cabin.points}</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Airline Preference */}
              <div>
                <label className="premium-label">
                  <Icon icon="lucide:plane" className="text-gold-600 mr-2" width={16} height={16} />
                  Preferred Airline
                </label>
                <Select 
                  selectedKeys={[airline]}
                  onSelectionChange={(keys) => setAirline(Array.from(keys)[0] as string)}
                  className="premium-select"
                  classNames={{
                    trigger: "premium-select-trigger",
                    value: "premium-select-value",
                    popover: "premium-select-popover"
                  }}
                >
                  {premiumAirlines.map((airline) => (
                    <SelectItem key={airline.key} textValue={airline.label}>
                      <div className="flex items-center justify-between w-full py-2">
                        <p className="font-semibold">{airline.label}</p>
                        <span className="text-xs text-charcoal-500">{airline.alliance}</span>
                      </div>
                    </SelectItem>
                  ))}
                </Select>
              </div>

              {/* Passengers */}
              <div>
                <label className="premium-label">
                  <Icon icon="lucide:users" className="text-gold-600 mr-2" width={16} height={16} />
                  Travelers
                </label>
                <div className="premium-passenger-display">
                  <span className="font-medium">
                    {passengers.adults} Adult{passengers.adults > 1 ? 's' : ''}
                    {passengers.children > 0 && `, ${passengers.children} Child${passengers.children > 1 ? 'ren' : ''}`}
                    {passengers.infants > 0 && `, ${passengers.infants} Infant${passengers.infants > 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>
            </motion.div>

            <Divider className="my-8" />

            {/* Advanced Filters & Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.8 }}
              className="flex flex-col lg:flex-row items-center justify-between gap-6"
            >
              <Button
                variant="light"
                onPress={onAdvancedOpen}
                startContent={<Icon icon="lucide:sliders-horizontal" width={18} height={18} />}
                className="premium-filter-button"
              >
                Advanced Filters
              </Button>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full lg:w-auto"
              >
                <Button
                  size="lg"
                  isDisabled={isSearching}
                  isLoading={isSearching}
                  onPress={handleLuxurySearch}
                  className="premium-search-button w-full lg:w-auto min-w-[200px]"
                  startContent={!isSearching && <Icon icon="lucide:search" width={20} height={20} />}
                >
                  {isSearching ? "Searching Elite Options..." : "Search Premium Flights"}
                </Button>
              </motion.div>
            </motion.div>
          </CardBody>
        </Card>

        {/* Advanced Filters Modal */}
        <Modal
          isOpen={isAdvancedOpen}
          onClose={onAdvancedClose}
          size="2xl"
          classNames={{
            backdrop: "backdrop-blur-md bg-navy-900/20",
            base: "premium-modal",
            header: "premium-modal-header",
            body: "premium-modal-body"
          }}
        >
          <ModalContent>
            <ModalHeader className="text-2xl font-bold text-navy-800">
              <Icon icon="lucide:settings" className="mr-3" width={24} height={24} />
              Elite Search Preferences
            </ModalHeader>
            <ModalBody className="pb-8">
              <div className="space-y-8">
                {/* Points Range */}
                <div>
                  <h4 className="premium-modal-section-title">Award Points Range</h4>
                  <div className="bg-gradient-to-r from-gold-50 to-gold-100/50 p-4 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-charcoal-700">
                        {pointsRange[0].toLocaleString()} - {pointsRange[1].toLocaleString()} points
                      </span>
                      <Chip size="sm" className="bg-gold-200 text-gold-800">
                        Premium Range
                      </Chip>
                    </div>
                  </div>
                </div>

                {/* Travel Preferences */}
                <div>
                  <h4 className="premium-modal-section-title">Travel Preferences</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="premium-preference-card">
                      <Icon icon="lucide:calendar-check" className="text-gold-600 mb-2" width={20} height={20} />
                      <h5 className="font-semibold text-charcoal-800">Flexible Dates</h5>
                      <p className="text-sm text-charcoal-600">Find better award availability</p>
                    </div>
                    <div className="premium-preference-card">
                      <Icon icon="lucide:crown" className="text-gold-600 mb-2" width={20} height={20} />
                      <h5 className="font-semibold text-charcoal-800">Lounge Access</h5>
                      <p className="text-sm text-charcoal-600">Priority lounge eligibility</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-4">
                  <Button variant="light" onPress={onAdvancedClose}>
                    Cancel
                  </Button>
                  <Button 
                    className="bg-gradient-to-r from-gold-500 to-gold-600 text-white"
                    onPress={onAdvancedClose}
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      </motion.div>
    </div>
  );
} 