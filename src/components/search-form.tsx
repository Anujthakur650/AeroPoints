import React, { useState, useEffect } from "react";
import { Card, CardBody, RadioGroup, Radio, Input, Button, Select, SelectItem, Divider, Spinner } from "@heroui/react";
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { DatePicker, DateRangePicker, DateRange } from "./calendar";
import apiService, { Flight, FlightSearchParams, GroupedFlight, BookingOption } from "../services/api";
import { FlightResults, GroupedFlightResults } from "./flight-results";
import AirportAutocomplete, { Airport } from "./AirportAutocomplete";
import searchHistoryService from "../services/search-history";
import SearchHistory from "./search-history";
import { FlightSearchItem } from "../services/search-history";

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

// Define the SearchFormProps interface
interface SearchFormProps {
  onSearchResults?: (results: any[]) => void;
  onSearchStart?: () => void;
}

export function SearchForm({ onSearchResults, onSearchStart }: SearchFormProps) {
  // Form state
  const [tripType, setTripType] = useState<string>("round-trip");
  const [cabinClass, setCabinClass] = useState<string>("economy");
  const [passengers, setPassengers] = useState<string>("1");
  const [mileageProgram, setMileageProgram] = useState("united");
  const [origin, setOrigin] = useState<string>("");
  const [destination, setDestination] = useState<string>("");
  const [selectedOriginAirport, setSelectedOriginAirport] = useState<any>(null);
  const [selectedDestinationAirport, setSelectedDestinationAirport] = useState<any>(null);
  
  // Search results and loading state
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [groupedSearchResults, setGroupedSearchResults] = useState<GroupedFlight[]>([]);
  const [useGroupedView, setUseGroupedView] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [debug, setDebug] = useState<any>(null);
  
  // Create today and next week dates
  const todayDate = new Date();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  
  const [dateRange, setDateRange] = useState<DateRange>({
    start: todayDate,
    end: nextWeek
  });

  // Apply a saved search from history
  const handleApplySearch = (search: FlightSearchItem) => {
    console.log('Applying saved search:', search);
    
    // Set form values from the saved search
    setOrigin(search.origin);
    setDestination(search.destination);
    
    // Set dates if available
    try {
      const startDate = new Date(search.departureDate);
      
      if (search.returnDate) {
        // If we have a return date, set up round trip
        const endDate = new Date(search.returnDate);
        setDateRange({ start: startDate, end: endDate });
        setTripType("round-trip");
      } else {
        // For one-way trips, use today's date + 7 days as placeholder end date
        // but set trip type to one-way
        const placeholderEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        setDateRange({ start: startDate, end: placeholderEndDate });
        setTripType("one-way");
      }
    } catch (e) {
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
    // Validate inputs with clear, actionable messages
    if (!origin || !destination) {
      setError("Please select both departure and destination airports");
      setIsLoading(false);
      return;
    }
    
    if (origin === destination) {
      setError("Departure and arrival airports cannot be the same.");
      setIsLoading(false);
      return;
    }

    // Validate dates using native Date objects
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to start of day for comparison
    
    if (tripType === 'round-trip') {
      if (!dateRange?.start || !dateRange?.end) {
        setError("Please select both departure and return dates");
        setIsLoading(false);
        return;
      }
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      
      if (startDate < currentDate) {
        setError("Departure date cannot be in the past");
        setIsLoading(false);
        return;
      }
      if (endDate < startDate) {
        setError("Return date must be after departure date");
        setIsLoading(false);
        return;
      }
    } else {
      if (!dateRange?.start) {
        setError("Please select a departure date");
        setIsLoading(false);
        return;
      }
      const depDate = new Date(dateRange.start);
      depDate.setHours(0, 0, 0, 0);
      
      if (depDate < currentDate) {
        setError("Departure date cannot be in the past");
        setIsLoading(false);
        return;
      }
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
      departureDate: dateRange.start ? dateRange.start.toISOString().split('T')[0] : 'N/A',
      returnDate: tripType === 'round-trip' && dateRange.end ? dateRange.end.toISOString().split('T')[0] : 'N/A',
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
        date: dateRange.start ? dateRange.start.toISOString().split('T')[0] : '',
        returnDate: tripType === 'round-trip' ? dateRange.end.toISOString().split('T')[0] : undefined,
        cabin_class: cabinClass,
        passengers: parseInt(passengers),
        airline: mileageProgram // Use mileage program as the source filter
      };
      
      console.log('Final search parameters:', searchParams);
      
      // Call both search APIs for regular and grouped results
      const [response, groupedResponse] = await Promise.all([
        apiService.searchFlights(searchParams),
        apiService.searchFlightsGrouped(searchParams)
      ]);
      
      console.log('Search results received:', response);
      console.log('Grouped search results received:', groupedResponse);
      
      // Extract flights from response
      const results = response.flights || [];
      const groupedResults = groupedResponse.groupedFlights || [];
      
      // Store search in history
      const searchItem: FlightSearchItem = {
        origin,
        destination,
        departureDate: dateRange.start ? dateRange.start.toISOString().split('T')[0] : '',
        returnDate: tripType === 'round-trip' ? dateRange.end.toISOString().split('T')[0] : undefined,
        cabinClass,
        passengers: parseInt(passengers),
        mileageProgram,
        timestamp: Date.now()
      };
      
      searchHistoryService.addFlightSearchToHistory(searchItem);
      
      // Update both regular and grouped results
      setSearchResults(results);
      setGroupedSearchResults(groupedResults);
      
      if (onSearchResults) {
        onSearchResults(results);
      }
      
    } catch (error: any) {
      console.error('Search failed:', error);
      setError(error.message || 'Search failed. Please try again.');
      setDebug(error); // Store error details for debugging
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for API (YYYY-MM-DD)
  const formatDateForApi = (date: Date | null): string => {
    if (!date) return '';
    
    // Convert Date to YYYY-MM-DD format
    return date.toISOString().split('T')[0];
  };

  const handleOriginChange = (value: string, airport?: Airport) => {
    setOrigin(airport?.iata || airport?.icao || value);
    setSelectedOriginAirport(airport);
    console.log('Origin changed:', { value, airport, selected: airport?.iata || airport?.icao || value });
  };

  const handleDestinationChange = (value: string, airport?: Airport) => {
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
            className="inline-flex items-center gap-3 glass-card px-6 py-3 rounded-full"
          >
            <Icon icon="lucide:search" className="text-yellow-400" />
            <span className="text-yellow-400 font-medium uppercase tracking-wide">Award Flight Search</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold text-gradient-luxury"
            style={{ fontFamily: 'var(--font-luxury)' }}
          >
            Find Your Perfect Flight
          </motion.h2>
        </div>

        {/* Main Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Card className="card-premium">
            <CardBody className="p-8">
              <div className="space-y-8">
                {/* Trip Type Toggle - At the top as requested */}
                <div className="flex justify-center">
                  <div className="glass-card p-2 rounded-full inline-flex">
                    <button
                      onClick={() => setTripType("round-trip")}
                      className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                        tripType === "round-trip"
                          ? "bg-yellow-400 text-gray-900 shadow-lg"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon icon="lucide:repeat" className="inline mr-2" />
                      Round Trip
                    </button>
                    <button
                      onClick={() => setTripType("one-way")}
                      className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                        tripType === "one-way"
                          ? "bg-yellow-400 text-gray-900 shadow-lg"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <Icon icon="lucide:arrow-right" className="inline mr-2" />
                      One Way
                    </button>
                  </div>
                </div>

                {/* Airport Selection Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                  {/* From Airport */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Icon icon="lucide:plane-takeoff" className="inline mr-2 text-yellow-400" />
                      Departure
                    </label>
                    <AirportAutocomplete
                      label="Departure"
                      value={selectedOriginAirport?.name || origin || ""}
                      onChange={handleOriginChange}
                      placeholder="Enter departure city or airport code"
                      icon="lucide:plane-takeoff"
                      type="origin"
                    />
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center">
                    <Button
                      isIconOnly
                      variant="light"
                      className="text-yellow-400 hover:bg-yellow-400/10 h-12 w-12 rounded-full"
                      onPress={handleSwap}
                    >
                      <Icon icon="lucide:arrow-left-right" className="text-xl" />
                    </Button>
                  </div>

                  {/* To Airport */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Icon icon="lucide:plane-landing" className="inline mr-2 text-yellow-400" />
                      Arrival
                    </label>
                    <AirportAutocomplete
                      label="Arrival"
                      value={selectedDestinationAirport?.name || destination || ""}
                      onChange={handleDestinationChange}
                      placeholder="Enter arrival city or airport code"
                      icon="lucide:plane-landing"
                      type="destination"
                    />
                  </div>
                </div>

                {/* Date and Options Row - Enhanced with better alignment and spacing */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                  {/* Dates */}
                  <div className="space-y-3 relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Icon icon="lucide:calendar" className="inline mr-2 text-yellow-400" />
                      Travel Date
                    </label>
                    <div className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                      <Icon icon="lucide:info" className="w-3 h-3" />
                      Format: MM/DD/YYYY
                    </div>
                    {tripType === "round-trip" ? (
                      <DateRangePicker
                        label="Travel Dates"
                        value={dateRange}
                        onChange={setDateRange}
                        className="w-full"
                      />
                    ) : (
                      <DatePicker
                        label="Departure Date"
                        value={dateRange.start}
                        onChange={(date) => setDateRange({...dateRange, start: date})}
                        className="w-full"
                      />
                    )}
                  </div>

                  {/* Mileage Program */}
                  <div className="space-y-3 relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Icon icon="lucide:credit-card" className="inline mr-2 text-yellow-400" />
                      Loyalty Program
                    </label>
                    <Select
                      selectedKeys={[mileageProgram]}
                      onSelectionChange={(keys) => setMileageProgram(Array.from(keys)[0] as string)}
                      className="w-full"
                      classNames={{
                        trigger: "bg-white/5 border border-white/20 hover:border-yellow-400/50 focus:border-yellow-400 rounded-xl h-14 min-h-[56px]",
                        value: "text-white text-lg",
                        popoverContent: "bg-gray-900 border border-white/20 max-w-[280px]"
                      }}
                      popoverProps={{
                        placement: "bottom-start",
                        offset: 8,
                        containerPadding: 16,
                        shouldFlip: true,
                        crossOffset: 0
                      }}
                    >
                      {mileagePrograms.map((program) => (
                        <SelectItem 
                          key={program.key}
                          className="text-white hover:bg-white/10"
                        >
                          {program.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Passengers */}
                  <div className="space-y-3 relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Icon icon="lucide:users" className="inline mr-2 text-yellow-400" />
                      Travelers
                    </label>
                    <Select
                      selectedKeys={[passengers]}
                      onSelectionChange={(keys) => setPassengers(Array.from(keys)[0] as string)}
                      className="w-full"
                      classNames={{
                        trigger: "bg-white/5 border border-white/20 hover:border-yellow-400/50 focus:border-yellow-400 rounded-xl h-14 min-h-[56px]",
                        value: "text-white text-lg",
                        popoverContent: "bg-gray-900 border border-white/20 max-w-[280px]"
                      }}
                      popoverProps={{
                        placement: "bottom-start",
                        offset: 8,
                        containerPadding: 16,
                        shouldFlip: true,
                        crossOffset: 0
                      }}
                    >
                      {passengerCounts.map((count) => (
                        <SelectItem 
                          key={count.key} 
                          value={count.key}
                          className="text-white hover:bg-white/10"
                        >
                          {count.label}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Cabin Class */}
                  <div className="space-y-3 relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Icon icon="lucide:armchair" className="inline mr-2 text-yellow-400" />
                      Cabin Class
                    </label>
                    <Select
                      selectedKeys={[cabinClass]}
                      onSelectionChange={(keys) => setCabinClass(Array.from(keys)[0] as string)}
                      className="w-full"
                      classNames={{
                        trigger: "bg-white/5 border border-white/20 hover:border-yellow-400/50 focus:border-yellow-400 rounded-xl h-14 min-h-[56px]",
                        value: "text-white text-lg",
                        popoverContent: "bg-gray-900 border border-white/20 max-w-[280px]"
                      }}
                      popoverProps={{
                        placement: "bottom-start",
                        offset: 8,
                        containerPadding: 16,
                        shouldFlip: true,
                        crossOffset: 0
                      }}
                    >
                      {cabinClasses.map((cabin) => (
                        <SelectItem 
                          key={cabin.key} 
                          value={cabin.key}
                          className="text-white hover:bg-white/10"
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
                    className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <Icon icon="lucide:alert-circle" className="text-red-400 text-xl" />
                      <p className="text-red-300">{error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Search Button - Centered below all fields */}
                <div className="flex justify-center pt-4">
                  <Button
                    onPress={handleSearch}
                    isLoading={isLoading}
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 font-bold px-12 py-4 rounded-xl text-lg hover:shadow-2xl hover:shadow-yellow-400/25 transition-all duration-300 transform hover:scale-105"
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Icon icon="lucide:search" className="mr-2 text-xl" />
                        Find Flights
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
          className="space-y-6"
        >
          <Divider className="bg-white/10" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Searches */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Icon icon="lucide:clock" className="text-yellow-400" />
                Recent Searches
              </h3>
              <SearchHistory onApplySearch={handleApplySearch} />
            </div>

            {/* Search Statistics */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-3">
                <Icon icon="lucide:bar-chart" className="text-yellow-400" />
                Search Statistics
              </h3>
              <Card className="card-premium">
                <CardBody className="p-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Total Searches</span>
                      <span className="text-yellow-400 font-bold">
                        {searchHistoryService.getFlightHistory().length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Average Results</span>
                      <span className="text-yellow-400 font-bold">
                        {Math.round(
                          searchHistoryService
                            .getFlightHistory()
                            .reduce((sum, search) => sum + (search.resultsCount || 0), 0) /
                            Math.max(searchHistoryService.getFlightHistory().length, 1)
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Most Popular Route</span>
                      <span className="text-yellow-400 font-bold text-sm">
                        {(() => {
                          const routes = searchHistoryService.getFlightHistory();
                          if (routes.length === 0) return "N/A";
                          
                          const routeCounts = routes.reduce((acc, search) => {
                            const route = `${search.origin}-${search.destination}`;
                            acc[route] = (acc[route] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                          
                          const mostPopular = Object.entries(routeCounts).sort(([,a], [,b]) => b - a)[0];
                          return mostPopular ? mostPopular[0] : "N/A";
                        })()}
                      </span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}