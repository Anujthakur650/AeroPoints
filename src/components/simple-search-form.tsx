import React, { useState } from "react";
import { Card, CardBody, Input, Button, Select, SelectItem, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { DatePicker } from "./calendar";
import apiService, { FlightSearchParams, Flight, GroupedFlight, BookingOption } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { AirportAutocomplete, type Airport } from "./AirportAutocomplete";

// Define the SearchFormProps interface
interface SimpleSearchFormProps {
  onSearchResults?: (results: Flight[]) => void;
  onGroupedSearchResults?: (results: GroupedFlight[]) => void;
  onSearchStart?: () => void;
}

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

export function SimpleSearchForm({ onSearchResults, onGroupedSearchResults, onSearchStart }: SimpleSearchFormProps) {
  // Form state - Award flight focused
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [originAirport, setOriginAirport] = useState<Airport | null>(null);
  const [destinationAirport, setDestinationAirport] = useState<Airport | null>(null);
  const [cabinClass, setCabinClass] = useState<string>("economy");
  const [passengers, setPassengers] = useState<string>("1");
  const [mileageProgram, setMileageProgram] = useState("united");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  // Single date for award flight searches
  const [travelDate, setTravelDate] = useState<Date | null>(new Date());

  // Format date for API (YYYY-MM-DD)
  const formatDateForApi = (date: Date | null): string | undefined => {
    if (!date) return undefined;
    return date.toISOString().split('T')[0];
  };

  // Format date for display (MM/DD/YYYY)
  const formatDateForDisplay = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString('en-US');
  };

  // Get formatted travel date display
  const getTravelDateDisplay = (): string => {
    if (!travelDate) return "Select date";
    return formatDateForDisplay(travelDate);
  };

  // Handle airport selection
  const handleOriginChange = (airportCode: string, airport?: Airport) => {
    setOrigin(airportCode);
    setOriginAirport(airport || null);
  };

  const handleDestinationChange = (airportCode: string, airport?: Airport) => {
    setDestination(airportCode);
    setDestinationAirport(airport || null);
  };

  const handleSearch = async () => {
    // Enhanced validation with specific field feedback
    let validationErrors = [];
    
    if (!origin || origin.length < 3) {
      validationErrors.push("Please enter a valid departure airport (e.g., LAX, JFK, Los Angeles)");
    }
    
    if (!destination || destination.length < 3) {
      validationErrors.push("Please enter a valid destination airport (e.g., LHR, Tokyo, New York)");
    }
    
    if (origin && destination && origin.toUpperCase() === destination.toUpperCase()) {
      validationErrors.push("Departure and destination airports must be different");
    }

    if (!travelDate) {
      validationErrors.push("Please select your travel date");
    } else {
      const selectedDate = new Date(travelDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        validationErrors.push("Travel date cannot be in the past");
      }
    }
    
    if (validationErrors.length > 0) {
      setError(validationErrors.join(". "));
      // Scroll to error message
      setTimeout(() => {
        const errorElement = document.querySelector('[data-error-display]');
        if (errorElement) {
          errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return;
    }

    // Clear previous errors
    setError("");
    setIsLoading(true);
    
    if (onSearchStart) {
      onSearchStart();
    }

    try {
      // Prepare search parameters for award flight
      const searchParams = {
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        date: formatDateForApi(travelDate),
        cabin_class: cabinClass,
        passengers: parseInt(passengers)
      };
      
      console.log('Award flight search parameters:', searchParams);
      
      // Call both search APIs for regular and grouped results
      const [response, groupedResponse] = await Promise.all([
        apiService.searchFlights(searchParams),
        apiService.searchFlightsGrouped(searchParams)
      ]);
      
      const results = response.flights || [];
      const groupedResults = groupedResponse.groupedFlights || [];
      
      console.log('Regular search results:', results);
      console.log('Grouped search results:', groupedResults);
      
      // Show success feedback
      if (results.length > 0 || groupedResults.length > 0) {
        // Brief success indication before showing results
        setError("");
        setTimeout(() => {
          if (onSearchResults) {
            onSearchResults(results);
          }
          if (onGroupedSearchResults) {
            onGroupedSearchResults(groupedResults);
          }
        }, 300);
      } else {
        setError(`No flights found for ${origin} to ${destination} on ${formatDateForDisplay(travelDate)}. Try different dates or airports.`);
      }
      
      // Pass results to parent components
      if (onSearchResults) {
        onSearchResults(results);
      }
      if (onGroupedSearchResults) {
        onGroupedSearchResults(groupedResults);
      }
      
    } catch (error: any) {
      console.error('Search failed:', error);
      setError(error.message || 'Search failed. Please try again.');
    } finally {
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

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-full"
            style={{
              background: 'rgba(255, 215, 0, 0.08)',
              backdropFilter: 'blur(20px)',
              border: '2px solid rgba(255, 215, 0, 0.2)',
              boxShadow: '0 8px 32px rgba(255, 215, 0, 0.1)'
            }}
          >
            <Icon icon="lucide:search" className="text-[#FFD700] text-xl" />
            <span className="text-[#FFD700] font-semibold uppercase tracking-wider text-sm">Award Flight Search</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontFamily: 'Playfair Display, serif',
              textShadow: '0 4px 8px rgba(255, 215, 0, 0.3)'
            }}
          >
            Find Your Perfect Flight
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-gray-300 text-lg max-w-2xl mx-auto"
          >
            Experience luxury travel with our premium award flight search
          </motion.p>
        </div>

        {/* Main Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card 
            className="shadow-2xl border relative overflow-hidden"
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(30px)',
              borderColor: 'rgba(255, 215, 0, 0.15)',
              borderWidth: '1px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 100px rgba(255, 215, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Gold accent border animation */}
            <div 
              className="absolute inset-0 rounded-xl opacity-30"
              style={{
                background: 'linear-gradient(45deg, transparent, rgba(255, 215, 0, 0.1), transparent)',
                animation: 'shimmer 3s ease-in-out infinite'
              }}
            />
            
            <CardBody className="p-8 md:p-10 relative z-10">
              <div className="space-y-8">
                {/* Award Flight Branding */}
                <div className="text-center space-y-3">
                  <motion.h3
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                    className="text-3xl md:text-4xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontFamily: 'Playfair Display, serif',
                      textShadow: '0 4px 8px rgba(255, 215, 0, 0.3)'
                    }}
                  >
                    AWARD FLIGHTS
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 1.0 }}
                    className="text-gray-300 text-base font-medium"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Find your perfect award journey
                  </motion.p>
                </div>

                {/* Airport Selection Row - Enhanced alignment and spacing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  {/* From Airport */}
                  <div className="space-y-3 group relative">
                    <AirportAutocomplete
                      label="Departure"
                      placeholder="Search airports (e.g., LAX, Los Angeles)"
                      value={origin}
                      onChange={handleOriginChange}
                      icon="lucide:plane-takeoff"
                      type="origin"
                    />
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center md:mb-3">
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 180 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={handleSwap}
                      className="p-4 rounded-full transition-all duration-300 group focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                      style={{
                        background: 'rgba(255, 215, 0, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                        boxShadow: '0 8px 25px rgba(255, 215, 0, 0.2)'
                      }}
                      aria-label="Swap departure and destination airports"
                      title="Swap airports"
                    >
                      <Icon icon="lucide:arrow-left-right" className="text-[#FFD700] text-xl group-hover:text-white transition-colors duration-300" aria-hidden="true" />
                    </motion.button>
                  </div>

                  {/* To Airport */}
                  <div className="space-y-3 group relative">
                    <AirportAutocomplete
                      label="Arrival"
                      placeholder="Search airports (e.g., JFK, New York)"
                      value={destination}
                      onChange={handleDestinationChange}
                      icon="lucide:plane-landing"
                      type="destination"
                    />
                  </div>
                </div>

                {/* Date and Options Row - Enhanced UI/UX with improved alignment and spacing */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  {/* Travel Date */}
                  <div className="space-y-2 group">
                    <label className="block text-sm font-semibold text-gray-200 mb-2 transition-colors duration-300 group-hover:text-[#FFD700]">
                      <Icon icon="lucide:calendar" className="inline mr-2 text-[#FFD700] text-lg" />
                      Travel Date
                    </label>
                    
                    {/* Single Date Input */}
                    <div className="relative">
                      <DatePicker
                        value={travelDate}
                        onChange={setTravelDate}
                        label=""
                        placeholder="Select travel date"
                        minDate={new Date()}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Loyalty Program */}
                  <div className="space-y-2 group relative">
                    <label className="block text-sm font-semibold text-gray-200 mb-2 transition-colors duration-300 group-hover:text-[#FFD700]">
                      <Icon icon="lucide:award" className="inline mr-2 text-[#FFD700] text-lg" />
                      Loyalty Program
                    </label>
                    <Select
                      selectedKeys={[mileageProgram]}
                      onSelectionChange={(keys) => setMileageProgram(Array.from(keys)[0] as string)}
                      className="w-full"
                      classNames={{
                        trigger: [
                          "!bg-slate-800",
                          "backdrop-blur-lg",
                          "border",
                          "!border-slate-600",
                          "hover:!bg-slate-700",
                          "hover:border-[#FFD700]/30",
                          "focus-within:border-[#FFD700]",
                          "focus-within:!bg-slate-700",
                          "transition-all",
                          "duration-300",
                          "rounded-xl",
                          "h-12",
                          "min-h-[48px]",
                          "group-hover:shadow-lg",
                          "group-hover:shadow-[#FFD700]/20"
                        ].join(" "),
                        value: "text-white text-base font-medium",
                        popoverContent: "bg-slate-800/95 backdrop-blur-lg border border-yellow-400/40 shadow-2xl rounded-xl",
                        listbox: "bg-slate-800/95"
                      }}
                      listboxProps={{
                        itemClasses: {
                          base: "text-white hover:bg-white/10 data-[hover=true]:bg-white/10 data-[selectable=true]:focus:bg-white/10 rounded-lg transition-colors",
                          selectedIcon: "text-[#FFD700]"
                        }
                      }}
                      popoverProps={{
                        placement: "bottom-start",
                        offset: 8,
                        classNames: {
                          base: "before:bg-gray-900/95",
                          content: "p-0 border-small border-white/20 bg-gray-900/95 backdrop-blur-lg shadow-2xl rounded-xl overflow-hidden max-w-[220px]"
                        },
                        containerPadding: 24,
                        shouldFlip: true,
                        crossOffset: 0
                      }}
                      size="md"
                    >
                      {mileagePrograms.map((program) => (
                        <SelectItem 
                          key={program.key}
                        >
                          {program.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Passengers */}
                  <div className="space-y-2 group relative">
                    <label className="block text-sm font-semibold text-gray-200 mb-2 transition-colors duration-300 group-hover:text-[#FFD700]">
                      <Icon icon="lucide:users" className="inline mr-2 text-[#FFD700] text-lg" />
                      Travelers
                    </label>
                    <Select
                      selectedKeys={[passengers]}
                      onSelectionChange={(keys) => setPassengers(Array.from(keys)[0] as string)}
                      className="w-full"
                      classNames={{
                        trigger: [
                          "!bg-slate-800",
                          "backdrop-blur-lg",
                          "border",
                          "!border-slate-600",
                          "hover:!bg-slate-700",
                          "hover:border-[#FFD700]/30",
                          "focus-within:border-[#FFD700]",
                          "focus-within:!bg-slate-700",
                          "transition-all",
                          "duration-300",
                          "rounded-xl",
                          "h-12",
                          "min-h-[48px]",
                          "group-hover:shadow-lg",
                          "group-hover:shadow-[#FFD700]/20"
                        ].join(" "),
                        value: "text-white text-base font-medium",
                        popoverContent: "bg-slate-800/95 backdrop-blur-lg border border-yellow-400/40 shadow-2xl rounded-xl",
                        listbox: "bg-slate-800/95"
                      }}
                      listboxProps={{
                        itemClasses: {
                          base: "text-white hover:bg-white/10 data-[hover=true]:bg-white/10 data-[selectable=true]:focus:bg-white/10 rounded-lg transition-colors",
                          selectedIcon: "text-[#FFD700]"
                        }
                      }}
                      popoverProps={{
                        placement: "bottom-start",
                        offset: 8,
                        classNames: {
                          base: "before:bg-gray-900/95",
                          content: "p-0 border-small border-white/20 bg-gray-900/95 backdrop-blur-lg shadow-2xl rounded-xl overflow-hidden max-w-[200px]"
                        },
                        containerPadding: 24,
                        shouldFlip: true,
                        crossOffset: 0
                      }}
                      size="md"
                    >
                      {passengerCounts.map((count) => (
                        <SelectItem 
                          key={count.key}
                        >
                          {count.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Cabin Class - Enhanced positioning to prevent boundary overflow */}
                  <div className="space-y-2 group relative">
                    <label className="block text-sm font-semibold text-gray-200 mb-2 transition-colors duration-300 group-hover:text-[#FFD700]">
                      <Icon icon="lucide:armchair" className="inline mr-2 text-[#FFD700] text-lg" />
                      Cabin Class
                    </label>
                    <Select
                      selectedKeys={[cabinClass]}
                      onSelectionChange={(keys) => setCabinClass(Array.from(keys)[0] as string)}
                      className="w-full"
                      classNames={{
                        trigger: [
                          "!bg-slate-800",
                          "backdrop-blur-lg",
                          "border",
                          "!border-slate-600",
                          "hover:!bg-slate-700",
                          "hover:border-[#FFD700]/30",
                          "focus-within:border-[#FFD700]",
                          "focus-within:!bg-slate-700",
                          "transition-all",
                          "duration-300",
                          "rounded-xl",
                          "h-12",
                          "min-h-[48px]",
                          "group-hover:shadow-lg",
                          "group-hover:shadow-[#FFD700]/20"
                        ].join(" "),
                        value: "text-white text-base font-medium",
                        popoverContent: "bg-slate-800/95 backdrop-blur-lg border border-yellow-400/40 shadow-2xl rounded-xl",
                        listbox: "bg-slate-800/95"
                      }}
                      listboxProps={{
                        itemClasses: {
                          base: "text-white hover:bg-white/10 data-[hover=true]:bg-white/10 data-[selectable=true]:focus:bg-white/10 rounded-lg transition-colors",
                          selectedIcon: "text-[#FFD700]"
                        }
                      }}
                      popoverProps={{
                        placement: "bottom-end",
                        offset: 8,
                        classNames: {
                          base: "before:bg-gray-900/95 z-[9999]",
                          content: "p-0 border-small border-white/20 bg-gray-900/95 backdrop-blur-lg shadow-2xl rounded-xl overflow-hidden max-w-[200px] z-[9999]"
                        },
                        containerPadding: 40,
                        shouldFlip: true,
                        shouldCloseOnBlur: true,
                        crossOffset: -30
                      }}
                      size="md"
                    >
                      {cabinClasses.map((cabin) => (
                        <SelectItem 
                          key={cabin.key}
                        >
                          {cabin.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Enhanced Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    data-error-display
                    className="p-6 rounded-xl relative overflow-hidden border-l-4 border-red-400"
                    style={{
                      background: 'rgba(239, 68, 68, 0.15)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15)'
                    }}
                    role="alert"
                    aria-live="polite"
                  >
                    <div className="flex items-start gap-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
                      >
                        <Icon icon="lucide:alert-triangle" className="text-red-400 text-2xl mt-0.5" />
                      </motion.div>
                      <div className="flex-1">
                        <h4 className="text-red-300 font-semibold mb-2">Please check your search details:</h4>
                        <p className="text-red-200 leading-relaxed">{error}</p>
                      </div>
                      <button
                        onClick={() => setError("")}
                        className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-full hover:bg-red-500/20"
                        aria-label="Dismiss error"
                      >
                        <Icon icon="lucide:x" className="text-lg" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Search Button - Enhanced with better spacing and visual consistency */}
                <div className="flex justify-center pt-8 pb-2">
                  <Button
                    onPress={handleSearch}
                    isLoading={isLoading}
                    isDisabled={isLoading}
                    className="font-bold px-12 md:px-16 py-4 md:py-6 rounded-2xl text-lg md:text-xl transition-all duration-500 transform hover:scale-105 focus:scale-105 relative overflow-hidden focus:ring-4 focus:ring-yellow-400/50 focus:outline-none min-w-[200px]"
                    size="lg"
                    style={{
                      background: isLoading 
                        ? 'rgba(255, 215, 0, 0.6)' 
                        : 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)',
                      color: '#1f2937',
                      boxShadow: isLoading ? 'none' : '0 25px 50px -12px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.2)',
                      border: '2px solid rgba(255, 215, 0, 0.3)'
                    }}
                    aria-label={isLoading ? "Searching for premium flights" : "Search for premium flights"}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-gray-900 mr-3" aria-hidden="true"></div>
                        Searching Premium Flights...
                      </>
                    ) : (
                      <>
                        <Icon icon="lucide:search" className="mr-3 text-2xl" aria-hidden="true" />
                        Find Flights
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

      </motion.div>
    </div>
  );
}