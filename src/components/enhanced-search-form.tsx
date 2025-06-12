import React from "react";
import { Card, CardBody, RadioGroup, Radio, Input, Button, Select, SelectItem, Tabs, Tab, Divider, Tooltip, Chip, Slider, Checkbox, CheckboxGroup } from "@heroui/react";
import { Icon } from "@iconify/react";
import { DateRangePicker, DatePicker } from "@heroui/react";
import { parseDate, getLocalTimeZone, CalendarDate } from "@internationalized/date";
import { useDateFormatter } from "@react-aria/i18n";
import { motion, AnimatePresence } from "framer-motion";
import type { RangeValue } from "@react-types/shared";
import type { DateValue } from "@react-types/datepicker";
import apiService, { FlightSearchParams, Flight } from "../services/api";
import { useAuth } from "../contexts/AuthContext";

// Define props interface for the component
interface EnhancedSearchFormProps {
  onSearchResults: (flights: Flight[]) => void;
  onSearchStart?: () => void;
}

// Cabin class options
const cabinClasses = [
  { key: "economy", label: "Economy" },
  { key: "premium-economy", label: "Premium Economy" },
  { key: "business", label: "Business" },
  { key: "first", label: "First Class" }
];

// Airlines options
const airlines = [
  { key: "all", label: "All Airlines" },
  { key: "delta", label: "Delta Air Lines" },
  { key: "united", label: "United Airlines" },
  { key: "american", label: "American Airlines" },
  { key: "lufthansa", label: "Lufthansa" },
  { key: "emirates", label: "Emirates" },
  { key: "british", label: "British Airways" },
  { key: "qatar", label: "Qatar Airways" },
  { key: "singapore", label: "Singapore Airlines" },
  { key: "ana", label: "ANA" }
];

// Popular destinations for autocomplete
const popularDestinations = [
  // Major USA Airports by City
  // New York Area
  { city: "New York", code: "JFK", airport: "John F. Kennedy International Airport", country: "United States" },
  { city: "New York", code: "LGA", airport: "LaGuardia Airport", country: "United States" },
  { city: "New York", code: "EWR", airport: "Newark Liberty International Airport", country: "United States" },
  
  // Los Angeles Area
  { city: "Los Angeles", code: "LAX", airport: "Los Angeles International Airport", country: "United States" },
  { city: "Los Angeles", code: "BUR", airport: "Hollywood Burbank Airport", country: "United States" },
  { city: "Los Angeles", code: "SNA", airport: "John Wayne Airport", country: "United States" },
  { city: "Los Angeles", code: "ONT", airport: "Ontario International Airport", country: "United States" },
  
  // Chicago Area
  { city: "Chicago", code: "ORD", airport: "O'Hare International Airport", country: "United States" },
  { city: "Chicago", code: "MDW", airport: "Chicago Midway International Airport", country: "United States" },
  
  // San Francisco Bay Area
  { city: "San Francisco", code: "SFO", airport: "San Francisco International Airport", country: "United States" },
  { city: "Oakland", code: "OAK", airport: "Oakland International Airport", country: "United States" },
  { city: "San Jose", code: "SJC", airport: "San Jose International Airport", country: "United States" },
  
  // Dallas/Fort Worth Area
  { city: "Dallas", code: "DFW", airport: "Dallas/Fort Worth International Airport", country: "United States" },
  { city: "Dallas", code: "DAL", airport: "Dallas Love Field", country: "United States" },
  
  // Other Major US Cities
  { city: "Atlanta", code: "ATL", airport: "Hartsfield-Jackson Atlanta International Airport", country: "United States" },
  { city: "Boston", code: "BOS", airport: "Boston Logan International Airport", country: "United States" },
  { city: "Denver", code: "DEN", airport: "Denver International Airport", country: "United States" },
  { city: "Houston", code: "IAH", airport: "George Bush Intercontinental Airport", country: "United States" },
  { city: "Houston", code: "HOU", airport: "William P. Hobby Airport", country: "United States" },
  { city: "Las Vegas", code: "LAS", airport: "Harry Reid International Airport", country: "United States" },
  { city: "Miami", code: "MIA", airport: "Miami International Airport", country: "United States" },
  { city: "Miami", code: "FLL", airport: "Fort Lauderdale-Hollywood International Airport", country: "United States" },
  { city: "Minneapolis", code: "MSP", airport: "Minneapolis–Saint Paul International Airport", country: "United States" },
  { city: "Orlando", code: "MCO", airport: "Orlando International Airport", country: "United States" },
  { city: "Philadelphia", code: "PHL", airport: "Philadelphia International Airport", country: "United States" },
  { city: "Phoenix", code: "PHX", airport: "Phoenix Sky Harbor International Airport", country: "United States" },
  { city: "San Diego", code: "SAN", airport: "San Diego International Airport", country: "United States" },
  { city: "Seattle", code: "SEA", airport: "Seattle-Tacoma International Airport", country: "United States" },
  { city: "Washington DC", code: "IAD", airport: "Dulles International Airport", country: "United States" },
  { city: "Washington DC", code: "DCA", airport: "Ronald Reagan Washington National Airport", country: "United States" },
  { city: "Washington DC", code: "BWI", airport: "Baltimore/Washington International Airport", country: "United States" },
  
  // International Popular Destinations
  { city: "London", code: "LHR", airport: "Heathrow Airport", country: "United Kingdom" },
  { city: "London", code: "LGW", airport: "Gatwick Airport", country: "United Kingdom" },
  { city: "Tokyo", code: "HND", airport: "Haneda Airport", country: "Japan" },
  { city: "Tokyo", code: "NRT", airport: "Narita International Airport", country: "Japan" },
  { city: "Paris", code: "CDG", airport: "Charles de Gaulle Airport", country: "France" },
  { city: "Paris", code: "ORY", airport: "Orly Airport", country: "France" },
  { city: "Dubai", code: "DXB", airport: "Dubai International Airport", country: "United Arab Emirates" },
  { city: "Singapore", code: "SIN", airport: "Singapore Changi Airport", country: "Singapore" },
  { city: "Hong Kong", code: "HKG", airport: "Hong Kong International Airport", country: "China" },
  { city: "Sydney", code: "SYD", airport: "Sydney Airport", country: "Australia" },
  { city: "Toronto", code: "YYZ", airport: "Toronto Pearson International Airport", country: "Canada" },
  { city: "Vancouver", code: "YVR", airport: "Vancouver International Airport", country: "Canada" }
];

// Enhanced date utilities
const formatDateForAPI = (date: DateValue | null): string | undefined => {
  if (!date) return undefined;
  
  // Ensure we have a valid date and format it consistently
  if (date instanceof CalendarDate) {
    const year = date.year.toString().padStart(4, '0');
    const month = date.month.toString().padStart(2, '0');
    const day = date.day.toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  // Fallback to toString method
  return date.toString();
};

const validateDateRange = (start: DateValue | null, end: DateValue | null, tripType: string): string | null => {
  if (!start) {
    return "Please select a departure date";
  }
  
  const today = new Date();
  const currentDate = parseDate(today.toISOString().split('T')[0]);
  
  // Check if departure date is in the past
  if (start.compare(currentDate) < 0) {
    return "Departure date cannot be in the past";
  }
  
  // Check if departure date is too far in the future (more than 330 days)
  const maxFutureDate = today.setDate(today.getDate() + 330);
  const maxDate = parseDate(new Date(maxFutureDate).toISOString().split('T')[0]);
  if (start.compare(maxDate) > 0) {
    return "Departure date cannot be more than 330 days in the future";
  }
  
  // For round trips, validate return date
  if (tripType !== "one-way") {
    if (!end) {
      return "Please select a return date for round trip";
    }
    
    // Return date should be after departure date
    if (end.compare(start) <= 0) {
      return "Return date must be after departure date";
    }
    
    // Check if return date is too far in the future
    if (end.compare(maxDate) > 0) {
      return "Return date cannot be more than 330 days in the future";
    }
  }
  
  return null;
};

const getDefaultDateRange = (): RangeValue<DateValue> => {
  const today = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  return {
    start: parseDate(today.toISOString().split('T')[0]),
    end: parseDate(nextWeek.toISOString().split('T')[0])
  };
};

export function EnhancedSearchForm({ onSearchResults, onSearchStart }: EnhancedSearchFormProps) {
  const { isAuthenticated } = useAuth();
  const [tripType, setTripType] = React.useState("round-trip");
  const [cabinClass, setCabinClass] = React.useState("economy");
  const [passengers, setPassengers] = React.useState({
    adults: 1,
    children: 0,
    infants: 0
  });
  const [airline, setAirline] = React.useState("all");
  const [fromQuery, setFromQuery] = React.useState("");
  const [toQuery, setToQuery] = React.useState("");
  const [showFromSuggestions, setShowFromSuggestions] = React.useState(false);
  const [showToSuggestions, setShowToSuggestions] = React.useState(false);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = React.useState(false);
  const [pointsRange, setPointsRange] = React.useState([20000, 100000]);
  const [selectedAmenities, setSelectedAmenities] = React.useState(new Set([]));
  const [origin, setOrigin] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [dateRange, setDateRange] = React.useState<RangeValue<DateValue>>(getDefaultDateRange());
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [searchComplete, setSearchComplete] = React.useState(false);
  const dateFormatter = useDateFormatter();
  const useAwardTravel = tripType === "round-trip" || tripType === "multi-city";
  const [showPassengerSelector, setShowPassengerSelector] = React.useState(false);

  // Handler for the DateRangePicker to fix type issues
  const handleDateRangeChange = (value: RangeValue<DateValue>) => {
    setDateRange(value);
    
    // Clear any existing date-related errors when user changes dates
    if (error && (error.includes('date') || error.includes('Date'))) {
      setError("");
    }
  };

  const amenities = [
    "Wi-Fi",
    "Lie-flat Seats",
    "Direct Aisle Access",
    "Private Suite",
    "Lounge Access",
    "Gourmet Dining",
    "Premium Beverages"
  ];

  const handleSearch = async () => {
    // Reset error
    setError("");
    
    // Validate inputs
    if (!origin) {
      setError("Please select an origin airport");
      return;
    }
    
    if (!destination) {
      setError("Please select a destination airport");
      return;
    }
    
    if (origin === destination) {
      setError("Origin and destination cannot be the same");
      return;
    }

    // Enhanced date validation
    const dateValidationError = validateDateRange(dateRange.start, dateRange.end, tripType);
    if (dateValidationError) {
      setError(dateValidationError);
      return;
    }

    setIsSearching(true);
    if (onSearchStart) {
      onSearchStart();
    }

    // Enhanced date formatting for API
    const departureDate = formatDateForAPI(dateRange.start);
    const returnDate = tripType === "one-way" ? undefined : formatDateForAPI(dateRange.end);
    
    console.log("Formatted dates for API:", { departureDate, returnDate });

    const params: FlightSearchParams = {
      origin,
      destination,
      date: departureDate, // Use 'date' field for better API compatibility
      departureDate: departureDate, // Keep both for backwards compatibility
      returnDate: returnDate,
      return_date: returnDate, // API expects return_date
      cabinClass,
      cabin_class: cabinClass, // API expects cabin_class
      airline: airline === 'all' ? undefined : airline,
      pointsMin: pointsRange[0],
      pointsMax: pointsRange[1],
      tripType,
      trip_type: tripType, // API expects trip_type
      passengers: {
        adults: passengers.adults,
        children: passengers.children,
        infants: passengers.infants
      },
      numPassengers: passengers.adults + passengers.children + passengers.infants,
      useAwardTravel: useAwardTravel
    };

    console.log("Search parameters:", params);

    try {
      const response = await apiService.searchFlights(params);
      
      // Process the response to extract flights array from the { flights: [] } structure
      const flights = response.flights || [];
      
      console.log(`Flight search completed: ${flights.length} flights found`);
      
      // Save search results to localStorage for later reference
      const saveSearchResults = () => {
        try {
          // Get existing searches
          const existingSearchesJSON = localStorage.getItem('recentSearchResults');
          let existingSearches = existingSearchesJSON ? JSON.parse(existingSearchesJSON) : [];
          
          // Add current search to the front
          existingSearches.unshift({
            ...response,
            searchParams: params,
            timestamp: new Date().toISOString()
          });
          
          // Keep only the 5 most recent searches
          existingSearches = existingSearches.slice(0, 5);
          
          // Save back to localStorage
          localStorage.setItem('recentSearchResults', JSON.stringify(existingSearches));
        } catch (e) {
          console.error('Error saving search results to localStorage:', e);
          // Non-critical error, don't show to user
        }
      };
      
      // Save the results
      saveSearchResults();
      
      // Track search history for authenticated users
      if (isAuthenticated) {
        try {
          await apiService.addSearchToHistory({
            origin,
            destination,
            departure_date: departureDate || '',
            cabin_class: cabinClass,
            passengers: passengers.adults + passengers.children + passengers.infants,
            return_date: returnDate,
            results_found: flights.length
          });
        } catch (historyError) {
          console.warn('Failed to save search to history:', historyError);
          // Don't show error to user as this is not critical
        }
      }
      
      setSearchComplete(true);
      onSearchResults(flights);
    } catch (error) {
      console.error("Error searching flights:", error);
      let errorMessage = "An error occurred while searching for flights. Please try again.";
      
      // Enhanced error handling
      if (error instanceof Error) {
        if (error.message.includes('401')) {
          errorMessage = "API authentication failed. Please check your API key.";
        } else if (error.message.includes('400')) {
          errorMessage = "Invalid search parameters. Please check your dates and try again.";
        } else if (error.message.includes('500')) {
          errorMessage = "Server error. Please try again in a moment.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  // Add function to swap origin and destination
  const handleSwapOriginDestination = () => {
    const tempOrigin = origin;
    const tempDestination = destination;
    const tempFromQuery = fromQuery;
    const tempToQuery = toQuery;
    
    setOrigin(tempDestination);
    setDestination(tempOrigin);
    setFromQuery(tempToQuery);
    setToQuery(tempFromQuery);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <Card className="w-full max-w-4xl mx-auto shadow-xl backdrop-blur-lg border border-white/10 bg-gradient-to-b from-background/80 to-background/40 overflow-hidden">
        <CardBody className="p-6">
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-danger-50/20 backdrop-blur-sm border border-danger-200/30 rounded-lg text-danger-700 shadow-lg"
            >
              <div className="flex items-center gap-2">
                <Icon icon="lucide:alert-circle" className="flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </div>
            </motion.div>
          )}
          <Tabs 
            aria-label="Search Options" 
            color="primary" 
            variant="underlined" 
            className="mb-6"
            classNames={{
              tabList: "gap-6",
              cursor: "w-full bg-primary",
              tab: "max-w-fit px-0 h-12 font-medium"
            }}
          >
            <Tab key="points" title={
              <div className="flex items-center gap-2">
                <Icon icon="lucide:award" />
                <span>Search with Points</span>
              </div>
            }/>
            <Tab key="cash" title={
              <div className="flex items-center gap-2">
                <Icon icon="lucide:credit-card" />
                <span>Search with Cash</span>
              </div>
            }/>
          </Tabs>
          
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block flex items-center gap-2">
              <Icon icon="lucide:map" className="text-primary" width={14} height={14} />
              <span>Trip Type</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {[
                { value: "round-trip", label: "Round Trip", icon: "lucide:repeat" },
                { value: "one-way", label: "One Way", icon: "lucide:arrow-right" },
                { value: "multi-city", label: "Multi-City", icon: "lucide:route" }
              ].map(option => (
                <motion.div
                  key={option.value}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex-1 py-3 px-4 flex items-center justify-center gap-2 rounded-xl cursor-pointer transition-all duration-200 min-w-[100px]
                    ${tripType === option.value 
                      ? 'bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary/30 text-primary shadow-lg shadow-primary/10' 
                      : 'bg-default-100/10 border border-default-200/20 hover:bg-default-100/20 hover:border-primary/20'
                    }
                  `}
                  onClick={() => setTripType(option.value)}
                >
                  <Icon 
                    icon={option.icon} 
                    className={`transition-colors duration-300 ${tripType === option.value ? "text-primary" : "text-default-500"}`} 
                  />
                  <span className="font-medium">{option.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 relative">
            <div className="relative">
              <label className="flex items-center gap-2 mb-1.5 text-sm font-medium">
                <Icon icon="lucide:plane-takeoff" className="text-primary" width={14} height={14} />
                <span>From</span>
              </label>
              <Input
                placeholder="City or Airport"
                value={fromQuery}
                onValueChange={setFromQuery}
                onFocus={() => setShowFromSuggestions(true)}
                onBlur={() => setTimeout(() => setShowFromSuggestions(false), 200)}
                startContent={<Icon icon="lucide:map-pin" className="text-default-400" />}
                endContent={
                  fromQuery && (
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      className="text-default-400 hover:text-default-600" 
                      onClick={() => {
                        setFromQuery('');
                        setOrigin('');
                      }}
                    >
                      <Icon icon="lucide:x" width={16} height={16} />
                    </motion.button>
                  )
                }
                classNames={{
                  base: "max-w-full",
                  mainWrapper: "h-12",
                  inputWrapper: "h-12 bg-default-100/20 hover:bg-default-100/30 border-default-200/30 hover:border-primary/40 data-[focused=true]:border-primary rounded-xl transition-all duration-200",
                  input: "placeholder:text-default-400/50 text-default-800",
                }}
                className="transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01]"
              />
              <AnimatePresence>
                {showFromSuggestions && fromQuery.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 w-full mt-1 bg-background/95 backdrop-blur-md border border-default-200/30 rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="p-2 border-b border-default-200/30">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-xs text-default-500">Popular Destinations</span>
                        <span className="text-xs text-primary cursor-pointer hover:underline">View All</span>
                      </div>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto">
                      {popularDestinations.filter(dest => 
                        dest.city.toLowerCase().includes(fromQuery.toLowerCase()) || 
                        dest.code.toLowerCase().includes(fromQuery.toLowerCase()) ||
                        dest.country.toLowerCase().includes(fromQuery.toLowerCase())
                      ).slice(0, 6).map((dest, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center p-3 hover:bg-default-100/30 cursor-pointer"
                          onClick={() => {
                            setFromQuery(`${dest.city} (${dest.code})`);
                            setOrigin(dest.code);
                            setShowFromSuggestions(false);
                          }}
                        >
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Icon icon="lucide:map-pin" className="text-primary" size={14} />
                                <p className="font-medium">{dest.city}</p>
                              </div>
                              <Chip size="sm" variant="flat" className="bg-default-100/50">{dest.code}</Chip>
                            </div>
                            <p className="text-xs text-default-400 mt-0.5">{dest.airport}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Add Swap Button */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 360 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.5 }}
                onClick={handleSwapOriginDestination}
                className="w-10 h-10 bg-primary/10 hover:bg-primary/20 text-primary rounded-full flex items-center justify-center shadow-md border border-primary/20"
                aria-label="Swap origin and destination"
              >
                <Icon icon="lucide:repeat" width={18} height={18} />
              </motion.button>
            </div>
            
            <div className="relative">
              <label className="flex items-center gap-2 mb-1.5 text-sm font-medium">
                <Icon icon="lucide:plane-landing" className="text-primary" width={14} height={14} />
                <span>To</span>
              </label>
              <Input
                placeholder="City or Airport"
                value={toQuery}
                onValueChange={setToQuery}
                onFocus={() => setShowToSuggestions(true)}
                onBlur={() => setTimeout(() => setShowToSuggestions(false), 200)}
                startContent={<Icon icon="lucide:map-pin" className="text-default-400" />}
                endContent={
                  toQuery && (
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      className="text-default-400 hover:text-default-600" 
                      onClick={() => {
                        setToQuery('');
                        setDestination('');
                      }}
                    >
                      <Icon icon="lucide:x" width={16} height={16} />
                    </motion.button>
                  )
                }
                classNames={{
                  base: "max-w-full",
                  mainWrapper: "h-12",
                  inputWrapper: "h-12 bg-default-100/20 hover:bg-default-100/30 border-default-200/30 hover:border-primary/40 data-[focused=true]:border-primary rounded-xl transition-all duration-200",
                  input: "placeholder:text-default-400/50 text-default-800",
                }}
                className="transition-all duration-300 hover:scale-[1.01] focus-within:scale-[1.01]"
              />
              <AnimatePresence>
                {showToSuggestions && toQuery.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-50 w-full mt-1 bg-background/95 backdrop-blur-md border border-default-200/30 rounded-xl shadow-lg overflow-hidden"
                  >
                    <div className="p-2 border-b border-default-200/30">
                      <div className="flex justify-between items-center px-2">
                        <span className="text-xs text-default-500">Popular Destinations</span>
                        <span className="text-xs text-primary cursor-pointer hover:underline">View All</span>
                      </div>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto">
                      {popularDestinations.filter(dest => 
                        dest.city.toLowerCase().includes(toQuery.toLowerCase()) || 
                        dest.code.toLowerCase().includes(toQuery.toLowerCase()) ||
                        dest.country.toLowerCase().includes(toQuery.toLowerCase())
                      ).slice(0, 6).map((dest, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                          className="flex items-center p-3 hover:bg-default-100/30 cursor-pointer"
                          onClick={() => {
                            setToQuery(`${dest.city} (${dest.code})`);
                            setDestination(dest.code);
                            setShowToSuggestions(false);
                          }}
                        >
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Icon icon="lucide:map-pin" className="text-primary" size={14} />
                                <p className="font-medium">{dest.city}</p>
                              </div>
                              <Chip size="sm" variant="flat" className="bg-default-100/50">{dest.code}</Chip>
                            </div>
                            <p className="text-xs text-default-400 mt-0.5">{dest.airport}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="flex items-center gap-2 mb-1.5 text-sm font-medium">
              <Icon icon="lucide:calendar" className="text-primary" width={14} height={14} />
              <span>Travel Dates</span>
            </label>
            <div className="bg-default-100/20 hover:bg-default-100/30 border border-default-200/30 hover:border-primary/40 rounded-xl p-1 transition-all duration-200 flex justify-center">
              {tripType === "one-way" ? (
                <div className="w-full">
                  <DatePicker
                    value={dateRange.start}
                    onChange={(date) => {
                      if (date) {
                        setDateRange({
                          start: date,
                          end: date // Set the same date for end to satisfy type requirements
                        });
                      }
                    }}
                    minValue={parseDate(new Date().toISOString().split('T')[0])}
                    className="w-full"
                  />
                </div>
              ) : (
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  minValue={parseDate(new Date().toISOString().split('T')[0])}
                  className="w-full"
                />
              )}
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-default-500">
              <Icon icon="lucide:info" width={12} height={12} />
              <span>Tip: Flexible dates may show better point values</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="flex items-center gap-2 mb-1.5 text-sm font-medium">
                <Icon icon="lucide:armchair" className="text-primary" width={14} height={14} />
                <span>Cabin Class</span>
              </label>
              <Select 
                selectedKeys={[cabinClass]} 
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setCabinClass(selected);
                }}
                classNames={{
                  base: "max-w-full",
                  trigger: "h-12 bg-default-100/20 hover:bg-default-100/30 border-default-200/30 hover:border-primary/40 data-[focused=true]:border-primary rounded-xl transition-all duration-200",
                  value: "text-default-800",
                  popover: "bg-background/95 backdrop-blur-lg border border-default-200/30 rounded-xl shadow-xl"
                }}
                listboxProps={{
                  itemClasses: {
                    base: "text-default-800 data-[hover=true]:bg-default-100/50 data-[hover=true]:text-default-900 rounded-lg transition-colors",
                    selectedIcon: "text-primary"
                  }
                }}
                popoverProps={{
                  classNames: {
                    content: "p-1 overflow-hidden"
                  }
                }}
                renderValue={(items) => {
                  return items.map(item => (
                    <div key={item.key} className="flex items-center gap-2">
                      {item.key === "economy" && <Icon icon="lucide:armchair" className="text-default-600" width={16} height={16} />}
                      {item.key === "premium-economy" && <Icon icon="lucide:armchair" className="text-default-600" width={16} height={16} />}
                      {item.key === "business" && <Icon icon="lucide:briefcase" className="text-default-600" width={16} height={16} />}
                      {item.key === "first" && <Icon icon="lucide:trophy" className="text-default-600" width={16} height={16} />}
                      <span>{item.textValue}</span>
                    </div>
                  ));
                }}
              >
                {cabinClasses.map((item) => (
                  <SelectItem 
                    key={item.key} 
                    textValue={item.label}
                    startContent={
                      <>
                        {item.key === "economy" && <Icon icon="lucide:armchair" className="text-default-600" width={16} height={16} />}
                        {item.key === "premium-economy" && <Icon icon="lucide:armchair" className="text-default-600" width={16} height={16} />}
                        {item.key === "business" && <Icon icon="lucide:briefcase" className="text-default-600" width={16} height={16} />}
                        {item.key === "first" && <Icon icon="lucide:trophy" className="text-default-600" width={16} height={16} />}
                      </>
                    }
                  >
                    {item.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
            
            <div>
              <label className="flex items-center gap-2 mb-1.5 text-sm font-medium">
                <Icon icon="lucide:users" className="text-primary" width={14} height={14} />
                <span>Passengers</span>
              </label>
              <div className="h-12 px-3 flex items-center gap-2 bg-default-100/20 hover:bg-default-100/30 border border-default-200/30 hover:border-primary/40 rounded-xl transition-all duration-200 cursor-pointer" onClick={() => setShowPassengerSelector(!showPassengerSelector)}>
                <div className="flex-1 flex items-center gap-3">
                  <Icon icon="lucide:users" className="text-default-600" width={18} height={18} />
                  <span className="text-default-800">
                    {passengers.adults} Adult{passengers.adults > 1 ? 's' : ''}
                    {passengers.children > 0 && `, ${passengers.children} Child${passengers.children > 1 ? 'ren' : ''}`}
                    {passengers.infants > 0 && `, ${passengers.infants} Infant${passengers.infants > 1 ? 's' : ''}`}
                  </span>
                </div>
                <Icon icon="lucide:chevron-down" className={`text-default-500 transition-transform duration-200 ${showPassengerSelector ? 'rotate-180' : ''}`} width={18} height={18} />
              </div>
              
              <AnimatePresence>
                {showPassengerSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute z-40 mt-1 w-72 bg-background/95 backdrop-blur-md border border-default-200/30 rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="p-3 space-y-3">
                      {[
                        { type: 'adults', label: 'Adults', description: '12+ years', min: 1, max: 9 },
                        { type: 'children', label: 'Children', description: '2-11 years', min: 0, max: 9 },
                        { type: 'infants', label: 'Infants', description: 'Under 2 years', min: 0, max: 9 }
                      ].map((item) => (
                        <div key={item.type} className="flex justify-between items-center py-2">
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-xs text-default-500">{item.description}</p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              disabled={passengers[item.type] <= item.min}
                              className={`w-8 h-8 rounded-full flex items-center justify-center 
                                ${passengers[item.type] > item.min 
                                  ? 'bg-default-200 text-default-800 hover:bg-default-300' 
                                  : 'bg-default-100 text-default-400 cursor-not-allowed'
                                } transition-colors duration-200`}
                              onClick={() => setPassengers(prev => ({
                                ...prev,
                                [item.type]: Math.max(item.min, passengers[item.type] - 1)
                              }))}
                            >
                              <Icon icon="lucide:minus" width={16} height={16} />
                            </motion.button>
                            
                            <span className="w-5 text-center text-default-800">{passengers[item.type]}</span>
                            
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              disabled={passengers[item.type] >= item.max}
                              className={`w-8 h-8 rounded-full flex items-center justify-center 
                                ${passengers[item.type] < item.max 
                                  ? 'bg-default-200 text-default-800 hover:bg-default-300' 
                                  : 'bg-default-100 text-default-400 cursor-not-allowed'
                                } transition-colors duration-200`}
                              onClick={() => setPassengers(prev => ({
                                ...prev,
                                [item.type]: Math.min(item.max, passengers[item.type] + 1)
                              }))}
                            >
                              <Icon icon="lucide:plus" width={16} height={16} />
                            </motion.button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 border-t border-default-200/30 flex justify-end">
                      <Button 
                        color="primary" 
                        size="sm" 
                        onPress={() => setShowPassengerSelector(false)}
                      >
                        Done
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div>
              <label className="flex items-center gap-2 mb-1.5 text-sm font-medium">
                <Icon icon="lucide:plane" className="text-primary" size={14} />
                <span>Preferred Airline</span>
              </label>
              <Select 
                selectedKeys={[airline]} 
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;
                  setAirline(selected);
                }}
                classNames={{
                  base: "max-w-full",
                  trigger: "h-12 bg-default-100/20 hover:bg-default-100/30 border-default-200/30 hover:border-primary/40 data-[focused=true]:border-primary rounded-xl transition-all duration-200",
                  value: "text-default-800",
                  popover: "bg-background/95 backdrop-blur-lg border border-default-200/30 rounded-xl shadow-xl"
                }}
                listboxProps={{
                  itemClasses: {
                    base: "text-default-800 data-[hover=true]:bg-default-100/50 data-[hover=true]:text-default-900 rounded-lg transition-colors",
                    selectedIcon: "text-primary"
                  }
                }}
                popoverProps={{
                  classNames: {
                    content: "p-1 overflow-hidden"
                  }
                }}
              >
                {airlines.map((item) => (
                  <SelectItem key={item.key} textValue={item.label}>
                    {item.label}
                  </SelectItem>
                ))}
              </Select>
            </div>
          </div>
          
          <motion.div
            initial={false}
            animate={{ height: showAdvancedFilters ? "auto" : 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="space-y-6 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Points Range</label>
                <Slider 
                  label="Points"
                  step={1000}
                  minValue={0}
                  maxValue={200000}
                  value={pointsRange}
                  onChange={setPointsRange as any}
                  className="max-w-md"
                  showSteps={true}
                  marks={[
                    { value: 0, label: "0" },
                    { value: 100000, label: "100k" },
                    { value: 200000, label: "200k" }
                  ]}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Amenities</label>
                <CheckboxGroup
                  orientation="horizontal"
                  value={Array.from(selectedAmenities)}
                  onValueChange={setSelectedAmenities as any}
                >
                  {amenities.map((amenity) => (
                    <Checkbox key={amenity} value={amenity}>{amenity}</Checkbox>
                  ))}
                </CheckboxGroup>
              </div>
            </div>
          </motion.div>
          
          <Divider className="my-6" />
          
          <div className="flex justify-between items-center">
            <Button
              variant="light"
              onPress={() => setShowAdvancedFilters(!showAdvancedFilters)}
              endContent={
                <Icon 
                  icon={showAdvancedFilters ? "lucide:chevron-up" : "lucide:chevron-down"} 
                  className="transition-transform duration-300"
                />
              }
            >
              Advanced Filters
            </Button>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                color="primary"
                size="lg"
                className="w-full mt-4"
                isDisabled={isSearching}
                isLoading={isSearching}
                onClick={handleSearch}
                startContent={!isSearching && <Icon icon="lucide:search" />}
              >
                {isSearching ? "Searching..." : "Search Flights"}
              </Button>
            </motion.div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
}