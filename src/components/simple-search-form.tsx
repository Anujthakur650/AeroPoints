import { useState } from "react";
import { Card, CardBody, Input, Button, Select, SelectItem, Divider } from "@heroui/react";
import { DateRangePicker, DatePicker } from "@heroui/react";
import { getLocalTimeZone, today } from "@internationalized/date";
import type { RangeValue } from "@react-types/shared";
import type { DateValue } from "@react-types/datepicker";
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import apiService from "../services/api";
import type { Flight } from "../services/api";
import { AirportAutocomplete, type Airport } from "./AirportAutocomplete";

// Define the SearchFormProps interface
interface SimpleSearchFormProps {
  onSearchResults?: (results: Flight[]) => void;
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

export function SimpleSearchForm({ onSearchResults, onSearchStart }: SimpleSearchFormProps) {
  // Form state
  const [tripType, setTripType] = useState<string>("round-trip");
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [originAirport, setOriginAirport] = useState<Airport | null>(null);
  const [destinationAirport, setDestinationAirport] = useState<Airport | null>(null);
  const [cabinClass, setCabinClass] = useState<string>("economy");
  const [passengers, setPassengers] = useState<string>("1");
  const [mileageProgram, setMileageProgram] = useState("united");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  // Create today and next week dates
  const todayDate = today(getLocalTimeZone());
  const nextWeek = todayDate.add({ days: 7 });
  
  const [dateRange, setDateRange] = useState<RangeValue<DateValue>>({
    start: todayDate,
    end: nextWeek
  });

  // Format date for API (YYYY-MM-DD)
  const formatDateForApi = (dateValue: DateValue): string => {
    const year = dateValue.year;
    const month = String(dateValue.month).padStart(2, '0');
    const day = String(dateValue.day).padStart(2, '0');
    return `${year}-${month}-${day}`;
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
            
            <CardBody className="p-10 relative z-10">
              <div className="space-y-10">
                {/* Trip Type Toggle - At the top as requested */}
                <div className="flex justify-center">
                  <div 
                    className="p-2 rounded-full inline-flex relative"
                    style={{
                      background: 'rgba(255, 215, 0, 0.05)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                      boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <button
                      onClick={() => setTripType("round-trip")}
                      className={`px-8 py-4 rounded-full font-semibold transition-all duration-500 relative overflow-hidden ${
                        tripType === "round-trip"
                          ? "text-gray-900 shadow-xl"
                          : "text-gray-300 hover:text-white hover:bg-white/5"
                      }`}
                      style={tripType === "round-trip" ? {
                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                        boxShadow: '0 10px 25px rgba(255, 215, 0, 0.4)'
                      } : {}}
                    >
                      <Icon icon="lucide:repeat" className="inline mr-2" />
                      Round Trip
                    </button>
                    <button
                      onClick={() => setTripType("one-way")}
                      className={`px-8 py-4 rounded-full font-semibold transition-all duration-500 relative overflow-hidden ${
                        tripType === "one-way"
                          ? "text-gray-900 shadow-xl"
                          : "text-gray-300 hover:text-white hover:bg-white/5"
                      }`}
                      style={tripType === "one-way" ? {
                        background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                        boxShadow: '0 10px 25px rgba(255, 215, 0, 0.4)'
                      } : {}}
                    >
                      <Icon icon="lucide:arrow-right" className="inline mr-2" />
                      One Way
                    </button>
                  </div>
                </div>

                {/* Airport Selection Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
                  {/* From Airport */}
                  <div className="space-y-4 group">
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
                      className="p-4 rounded-full transition-all duration-300 group"
                      style={{
                        background: 'rgba(255, 215, 0, 0.1)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 215, 0, 0.3)',
                        boxShadow: '0 8px 25px rgba(255, 215, 0, 0.2)'
                      }}
                    >
                      <Icon icon="lucide:arrow-left-right" className="text-[#FFD700] text-xl group-hover:text-white transition-colors duration-300" />
                    </motion.button>
                  </div>

                  {/* To Airport */}
                  <div className="space-y-4 group">
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

                {/* Date and Options Row */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  {/* Dates */}
                  <div className="space-y-4 group">
                    <label className="block text-sm font-semibold text-gray-200 mb-3 transition-colors duration-300 group-hover:text-[#FFD700]">
                      <Icon icon="lucide:calendar" className="inline mr-2 text-[#FFD700] text-lg" />
                      {tripType === "round-trip" ? "Travel Dates" : "Departure Date"}
                    </label>
                    {tripType === "round-trip" ? (
                      <DateRangePicker
                        value={dateRange}
                        onChange={setDateRange}
                        className="w-full date-picker-dark-theme"
                      />
                    ) : (
                      <DatePicker
                        value={dateRange.start}
                        onChange={(date) => setDateRange({...dateRange, start: date!})}
                        className="w-full date-picker-dark-theme"
                      />
                    )}
                  </div>

                  {/* Mileage Program */}
                  <div className="space-y-4 group">
                    <label className="block text-sm font-semibold text-gray-200 mb-3 transition-colors duration-300 group-hover:text-[#FFD700]">
                      <Icon icon="lucide:credit-card" className="inline mr-2 text-[#FFD700] text-lg" />
                      Loyalty Program
                    </label>
                    <Select
                      selectedKeys={[mileageProgram]}
                      onSelectionChange={(keys) => setMileageProgram(Array.from(keys)[0] as string)}
                      className="w-full"
                      classNames={{
                        trigger: "bg-white/5 border-white/20 hover:bg-white/10 hover:border-[#FFD700]/30 backdrop-blur-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#FFD700]/20",
                        value: "text-white",
                        popoverContent: "bg-gray-900/95 backdrop-blur-lg border border-white/20 shadow-2xl",
                        listbox: "bg-gray-900/95"
                      }}
                      listboxProps={{
                        itemClasses: {
                          base: "text-white hover:bg-white/10 data-[hover=true]:bg-white/10 data-[selectable=true]:focus:bg-white/10 rounded-lg transition-colors",
                          selectedIcon: "text-[#FFD700]"
                        }
                      }}
                      popoverProps={{
                        classNames: {
                          base: "before:bg-gray-900/95",
                          content: "p-0 border-small border-white/20 bg-gray-900/95 backdrop-blur-lg shadow-2xl rounded-xl overflow-hidden"
                        }
                      }}
                      size="lg"
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
                  <div className="space-y-4 group">
                    <label className="block text-sm font-semibold text-gray-200 mb-3 transition-colors duration-300 group-hover:text-[#FFD700]">
                      <Icon icon="lucide:users" className="inline mr-2 text-[#FFD700] text-lg" />
                      Travelers
                    </label>
                    <Select
                      selectedKeys={[passengers]}
                      onSelectionChange={(keys) => setPassengers(Array.from(keys)[0] as string)}
                      className="w-full"
                      classNames={{
                        trigger: "bg-white/5 border-white/20 hover:bg-white/10 hover:border-[#FFD700]/30 backdrop-blur-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#FFD700]/20",
                        value: "text-white",
                        popoverContent: "bg-gray-900/95 backdrop-blur-lg border border-white/20 shadow-2xl",
                        listbox: "bg-gray-900/95"
                      }}
                      listboxProps={{
                        itemClasses: {
                          base: "text-white hover:bg-white/10 data-[hover=true]:bg-white/10 data-[selectable=true]:focus:bg-white/10 rounded-lg transition-colors",
                          selectedIcon: "text-[#FFD700]"
                        }
                      }}
                      popoverProps={{
                        classNames: {
                          base: "before:bg-gray-900/95",
                          content: "p-0 border-small border-white/20 bg-gray-900/95 backdrop-blur-lg shadow-2xl rounded-xl overflow-hidden"
                        }
                      }}
                      size="lg"
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

                  {/* Cabin Class */}
                  <div className="space-y-4 group">
                    <label className="block text-sm font-semibold text-gray-200 mb-3 transition-colors duration-300 group-hover:text-[#FFD700]">
                      <Icon icon="lucide:armchair" className="inline mr-2 text-[#FFD700] text-lg" />
                      Cabin Class
                    </label>
                    <Select
                      selectedKeys={[cabinClass]}
                      onSelectionChange={(keys) => setCabinClass(Array.from(keys)[0] as string)}
                      className="w-full"
                      classNames={{
                        trigger: "bg-white/5 border-white/20 hover:bg-white/10 hover:border-[#FFD700]/30 backdrop-blur-lg transition-all duration-300 group-hover:shadow-lg group-hover:shadow-[#FFD700]/20",
                        value: "text-white",
                        popoverContent: "bg-gray-900/95 backdrop-blur-lg border border-white/20 shadow-2xl",
                        listbox: "bg-gray-900/95"
                      }}
                      listboxProps={{
                        itemClasses: {
                          base: "text-white hover:bg-white/10 data-[hover=true]:bg-white/10 data-[selectable=true]:focus:bg-white/10 rounded-lg transition-colors",
                          selectedIcon: "text-[#FFD700]"
                        }
                      }}
                      popoverProps={{
                        classNames: {
                          base: "before:bg-gray-900/95",
                          content: "p-0 border-small border-white/20 bg-gray-900/95 backdrop-blur-lg shadow-2xl rounded-xl overflow-hidden"
                        }
                      }}
                      size="lg"
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

                {/* Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl relative overflow-hidden"
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      backdropFilter: 'blur(15px)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)'
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <Icon icon="lucide:alert-circle" className="text-red-400 text-2xl" />
                      <p className="text-red-300 font-medium">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Search Button - Centered below all fields */}
                <div className="flex justify-center pt-6">
                  <Button
                    onPress={handleSearch}
                    isLoading={isLoading}
                    className="font-bold px-16 py-6 rounded-2xl text-xl transition-all duration-500 transform hover:scale-105 relative overflow-hidden"
                    size="lg"
                    style={{
                      background: isLoading 
                        ? 'rgba(255, 215, 0, 0.6)' 
                        : 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)',
                      color: '#1f2937',
                      boxShadow: isLoading ? 'none' : '0 25px 50px -12px rgba(255, 215, 0, 0.4), 0 0 60px rgba(255, 215, 0, 0.2)',
                      border: '2px solid rgba(255, 215, 0, 0.3)'
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-gray-900 mr-3"></div>
                        Searching Premium Flights...
                      </>
                    ) : (
                      <>
                        <Icon icon="lucide:search" className="mr-3 text-2xl" />
                        Find Luxury Flights
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Recent Searches and Search Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="space-y-8"
        >
          <div 
            className="h-px w-full"
            style={{ 
              background: 'linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.3), transparent)' 
            }}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Recent Searches */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-4">
                <Icon icon="lucide:clock" className="text-[#FFD700] text-2xl" />
                <span style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Recent Searches
                </span>
              </h3>
              <Card 
                className="shadow-xl border relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(25px)',
                  borderColor: 'rgba(255, 215, 0, 0.1)',
                  boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                }}
              >
                <CardBody className="p-8">
                  <p className="text-gray-300 text-center font-medium">No recent searches yet</p>
                </CardBody>
              </Card>
            </div>

            {/* Search Statistics */}
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-4">
                <Icon icon="lucide:bar-chart" className="text-[#FFD700] text-2xl" />
                <span style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Search Insights
                </span>
              </h3>
              <Card 
                className="shadow-xl border relative overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  backdropFilter: 'blur(25px)',
                  borderColor: 'rgba(255, 215, 0, 0.1)',
                  boxShadow: '0 20px 40px -12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                }}
              >
                <CardBody className="p-8">
                  <p className="text-gray-300 text-center font-medium">Premium statistics coming soon</p>
                </CardBody>
              </Card>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 