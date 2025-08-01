/**
 * API Service for Award Flight Frontend
 * Handles all communication with the backend API
 */

import config from '../config/environment';

// Types for flight search parameters
export interface FlightSearchParams {
  origin: string;
  destination: string;
  date?: string;
  return_date?: string;
  cabin_class?: string;
  source?: string;
  passengers?: number | {
    adults: number;
    children: number;
    infants: number;
  };
  origin_city?: string;
  destination_city?: string;
  origin_country?: string;
  destination_country?: string;
  trip_type?: string;
  departureDate?: string;
  returnDate?: string;
  cabinClass?: string;
  airline?: string;
  useAwardTravel?: boolean;
  pointsMin?: number;
  pointsMax?: number;
  numPassengers?: number;
  tripType?: string;
  originDetails?: {
    city?: string;
    country?: string;
    name?: string;
  };
  destinationDetails?: {
    city?: string;
    country?: string;
    name?: string;
  };
}

// Types for bulk availability parameters
export interface BulkAvailabilityParams {
  source: string;
  cabinClass?: string;
  startDate?: string;
  endDate?: string;
  originRegion?: string;
}

// Types for flight data
// Booking option for a specific flight through a particular program
export interface BookingOption {
  id: string;
  bookingProgram: string; // Program name (e.g., "Virgin Atlantic Flying Club")
  bookingProgramCurrency: string; // Currency type (e.g., "points", "miles", "avios")
  points: number;
  cash: number;
  seatsAvailable: number;
  source: string; // Original source identifier
  bookingLink?: string;
}

// Grouped flight representing the same operating flight available through multiple booking programs
export interface GroupedFlight {
  id: string;
  airline: string; // Operating airline name (e.g., "Delta Air Lines")
  airlineCode: string; // Operating airline code (e.g., "DL", "AA")
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  cabinClass: string;
  stops?: number; // Number of stops
  layovers?: {
    airport: string;
    duration: string;
  }[];
  segments?: any[]; // Flight segments for multi-leg flights
  realTimeData?: boolean;
  lastUpdated?: string;
  rawTripData?: any;
  departureDate?: string;
  flightType?: string;
  aircraftType?: string;
  aircraft?: string[];
  durationMinutes?: number;
  // Multiple booking options for the same flight
  bookingOptions: BookingOption[];
  // Best option details for quick reference
  bestPoints: number;
  bestCash: number;
  totalSeatsAvailable: number;
}

export interface Flight {
  id: string;
  airline: string; // Operating airline name (e.g., "Delta Air Lines")
  flightNumber: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  cabinClass: string;
  points: number;
  cash: number;
  seatsAvailable: number;
  stops?: number; // Number of stops
  layovers?: {
    airport: string;
    duration: string;
  }[];
  segments?: any[]; // Flight segments for multi-leg flights
  realTimeData?: boolean;  // Indicates if this is real-time data
  lastUpdated?: string;    // Timestamp when data was last updated
  rawTripData?: any;       // Any additional trip data
  // Additional properties required by mapSeatsAeroFlights
  source?: string;
  departureDate?: string;
  flightType?: string;
  aircraftType?: string;
  aircraft?: string[]; // Aircraft types for each segment
  bookingLink?: string;
  durationMinutes?: number; // Duration in minutes
  // NEW: Booking program information (separate from operating airline)
  airlineCode?: string; // Operating airline code (e.g., "DL", "AA")
  bookingProgram?: string; // Booking program name (e.g., "Virgin Atlantic Flying Club")
  bookingProgramCurrency?: string; // Currency type (e.g., "points", "miles", "avios")
}

// Types for route data
export interface Route {
  origin: string;
  destination: string;
  source: string;
}

// Authentication types
export interface User {
  id: string;
  email: string;
  full_name: string;
  points_balance: number;
  created_at: string;
  updated_at: string;
  is_admin: boolean;
  preferred_airport?: string;
  frequent_flyer_programs: Array<{
    airline: string;
    program_name: string;
    member_number: string;
    tier_status?: string;
  }>;
  flight_preferences?: {
    preferred_cabin: string;
    preferred_airlines: string[];
    preferred_airports: string[];
    max_stops: number;
    avoid_red_eye: boolean;
  };
  saved_searches: any[];
  search_history: any[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

class ApiService {
  private baseUrl = config.API_BASE_URL;
  // Remove token storage - now using httpOnly cookies
  private isAuthenticated: boolean = false;

  constructor() {
    // Debug: Log the configuration being used
    console.log('🔧 ApiService Configuration:');
    console.log('📍 Base URL:', this.baseUrl);
    console.log('🌍 Environment:', config.NODE_ENV);
    console.log('🔧 Is Development:', config.IS_DEVELOPMENT);
    console.log('🔧 Is Production:', config.IS_PRODUCTION);
    console.log('🍪 Using secure httpOnly cookies for authentication');
    
    // Check authentication status on initialization
    this.checkAuthStatus();
  }

  /**
   * Check authentication status by attempting to get current user
   */
  private async checkAuthStatus(): Promise<void> {
    try {
      await this.getCurrentUser();
      this.isAuthenticated = true;
    } catch (error) {
      this.isAuthenticated = false;
    }
  }

  /**
   * Detect if running on mobile device
   */
  private isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Enhanced fetch method with mobile optimizations and retry logic
   */
  private async fetch(endpoint: string, options: RequestInit = {}, retryCount = 0): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': navigator.userAgent,
      ...(options.headers as Record<string, string> || {}),
    };

    // No need to add Authorization header - cookies are sent automatically

    // Mobile-specific timeout settings
    const isMobileDevice = this.isMobile();
    const timeoutMs = isMobileDevice ? 15000 : 8000; // Longer timeout for mobile
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.warn(`[MOBILE API] Request timeout after ${timeoutMs}ms for ${endpoint}`);
      controller.abort();
    }, timeoutMs);

    try {
      console.log(`[MOBILE API] ${options.method || 'GET'} ${url} (Mobile: ${isMobileDevice}, Retry: ${retryCount})`);
      const startTime = performance.now();

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
        signal: controller.signal,
      });

      const endTime = performance.now();
      console.log(`[MOBILE API] Response received in ${Math.round(endTime - startTime)}ms (Status: ${response.status})`);

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Request failed: ${response.status}`;
        
        // Mobile-specific retry logic for network issues
        if (isMobileDevice && retryCount < 2 && (response.status >= 500 || response.status === 0)) {
          console.log(`[MOBILE API] Retrying request due to server error (attempt ${retryCount + 1}/3)`);
          await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 1000));
          return this.fetch(endpoint, options, retryCount + 1);
        }
        
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      // Handle specific mobile network errors
      if (error instanceof Error) {
        console.error(`[MOBILE API] Error for ${endpoint}:`, error.message);
        
        // Mobile-specific retry for network errors
        if (isMobileDevice && retryCount < 2) {
          if (error.name === 'AbortError' || 
              error.message.includes('network') || 
              error.message.includes('fetch') ||
              error.message.includes('timeout')) {
            console.log(`[MOBILE API] Retrying due to network error (attempt ${retryCount + 1}/3)`);
            await new Promise(resolve => setTimeout(resolve, (retryCount + 1) * 2000));
            return this.fetch(endpoint, options, retryCount + 1);
          }
        }
        
        // Enhanced error messages for mobile debugging
        if (error.name === 'AbortError') {
          throw new Error(`Request timeout (${timeoutMs}ms) - check your network connection`);
        } else if (error.message.includes('CORS')) {
          throw new Error('Cross-origin request blocked - API configuration issue');
        } else if (error.message.includes('fetch')) {
          throw new Error('Network connection failed - check your internet connection');
        }
      }
      
      throw error;
    }
  }

  /**
   * Check the API connection
   */
  async checkApiConnection(): Promise<boolean> {
    try {
      console.log("DEBUG: Testing API connection for flight search");
      // Check the flight search API health endpoint on port 8000
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      console.log("DEBUG: Flight search API health response status:", response.status);
      
      if (!response.ok) {
        console.error('Flight search API health check failed:', response.statusText);
        return false;
      }
      
      const data = await response.json();
      console.log("DEBUG: Flight search API health check response:", data);
      return true;
    } catch (error) {
      console.error('Flight search API connection check error:', error);
      // More detailed error logging
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network error: The flight search API server might not be running on port 8000');
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        console.error('Timeout: The flight search API health check timed out');
      }
      return false;
    }
  }

  /**
   * Search for flights using the enhanced seats.aero API
   */
  async searchFlights(params: FlightSearchParams, retryCount = 0): Promise<{ flights: Flight[] }> {
    try {
      console.log('Searching for flights with enhanced API params:', params);
      
      // Build the query parameters for the API call
      const queryParams = new URLSearchParams();
      queryParams.append('origin', params.origin);
      queryParams.append('destination', params.destination);
      queryParams.append('date', params.date || params.departureDate || '');
      queryParams.append('cabin_class', params.cabin_class || params.cabinClass || 'economy');
      queryParams.append('passengers', '1');
      
      if (params.return_date || params.returnDate) {
        queryParams.append('return_date', params.return_date || params.returnDate || '');
      }
      if (params.airline) {
        queryParams.append('airline', params.airline);
      }

      const url = `${this.baseUrl}/api/search-awards?${queryParams.toString()}`;
      console.log('Making enhanced API request to:', url);

      const response = await fetch(url);
      console.log('Enhanced API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Enhanced API request failed:', errorText);
        throw new Error(`Failed to search flights: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Enhanced flight search response:', data);
      
      // Handle the enhanced backend response format
      if (data.status === "error") {
        throw new Error(data.message || "Flight search failed");
      }
      
      // Extract flights from the flights property (now with enhanced data)
      const flights = data.flights || [];
      console.log(`Found ${flights.length} enhanced flights from API`);
      
      // Log additional metadata from enhanced API
      if (data.api_count) {
        console.log(`Total available results: ${data.api_count}`);
      }
      if (data.has_more) {
        console.log('More results available via pagination');
      }
      if (data.cursor) {
        console.log('Pagination cursor available:', data.cursor);
      }

      // Map the enhanced backend flights directly (they're already in the correct format)
      const mappedFlights = flights.map((flight: any, index: number): Flight => {
        return {
          id: flight.id,
          airline: flight.airline,
          flightNumber: flight.flightNumber,
          origin: flight.origin,
          destination: flight.destination,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          duration: flight.duration,
          cabinClass: flight.cabinClass,
          points: flight.points,
          cash: flight.cash,
          seatsAvailable: flight.seatsAvailable,
          realTimeData: flight.realTimeData || true,
          lastUpdated: flight.lastUpdated,
          // Include stops and layovers data
          stops: flight.stops,
          layovers: flight.layovers || [],
          // Include segments data
          segments: flight.segments || [],
          // Enhanced fields from new API integration
          rawTripData: {
            route_distance: flight.route_distance,
            is_direct: flight.is_direct,
            operating_airlines: flight.operating_airlines,
            source_program: flight.source_program,
            availability_id: flight.availability_id
          },
          source: flight.source,
          departureDate: flight.departureDate,
          flightType: flight.flightType,
          aircraftType: flight.aircraftType,
          bookingLink: flight.bookingLink,
          // Include additional fields for proper display
          durationMinutes: flight.durationMinutes
        };
      });
      
      console.log(`Mapped ${mappedFlights.length} enhanced flights successfully`);
      
      return {
        flights: mappedFlights
      };
    } catch (error) {
      console.error('Error searching for enhanced flights:', error);
      
      if (retryCount < 2) {
        console.log(`Retrying enhanced flight search (attempt ${retryCount + 1}/2)...`);
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(this.searchFlights(params, retryCount + 1));
          }, 1000);
        });
      }
      
      throw error;
    }
  }

  /**
   * Search for flights and return them grouped by operating details
   * This consolidates identical flights from different booking programs
   */
  async searchFlightsGrouped(params: FlightSearchParams, retryCount = 0): Promise<{ groupedFlights: GroupedFlight[] }> {
    try {
      console.log('Searching for flights with grouping enabled:', params);
      
      // First get all individual flights
      const { flights } = await this.searchFlights(params, retryCount);
      
      // Then group them by operating details
      const groupedFlights = this.groupFlightsByOperatingDetails(flights);
      
      console.log(`Grouped ${flights.length} individual flights into ${groupedFlights.length} flight groups`);
      
      return {
        groupedFlights
      };
    } catch (error) {
      console.error('Error searching for grouped flights:', error);
      throw error;
    }
  }

  /**
   * Get enhanced trip details from the API including real flight times
   */
  async getTripDetails(tripId: string): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/trips/${tripId}`;
      console.log("DEBUG: Requesting enhanced trip details URL:", url);
      
      const response = await fetch(url);
      console.log("DEBUG: Enhanced trip details response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Enhanced trip details request failed:", errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("DEBUG: Received enhanced trip details from API:", tripId);
      
      // Handle the enhanced API response format
      if (data.status === "success" && data.data) {
        const tripDetails = data.data;
        
        console.log(`DEBUG: Enhanced trip has ${tripDetails.segments?.length || 0} segments`);
        console.log(`DEBUG: Trip duration: ${tripDetails.total_duration} minutes`);
        console.log(`DEBUG: Number of stops: ${tripDetails.stops}`);
        console.log(`DEBUG: Mileage cost: ${tripDetails.mileage_cost}`);
        console.log(`DEBUG: Total taxes: ${tripDetails.total_taxes} ${tripDetails.taxes_currency}`);
        
        // Log enhanced segment information
        if (tripDetails.segments && tripDetails.segments.length > 0) {
          tripDetails.segments.forEach((segment: any, index: number) => {
            console.log(`DEBUG: Enhanced Segment ${index + 1}:`, 
                       `Flight ${segment.flight_number}`,
                       `from ${segment.origin_airport} to ${segment.destination_airport}`,
                       `Departs: ${segment.departs_at}`,
                       `Arrives: ${segment.arrives_at}`,
                       `Aircraft: ${segment.aircraft_name} (${segment.aircraft_code})`,
                       `Distance: ${segment.distance} miles`);
          });
        }
        
        // Log overall trip times
        if (tripDetails.departs_at) {
          console.log(`DEBUG: Enhanced trip departs at: ${tripDetails.departs_at}`);
        }
        if (tripDetails.arrives_at) {
          console.log(`DEBUG: Enhanced trip arrives at: ${tripDetails.arrives_at}`);
        }
        
        return tripDetails;
      }
      
      throw new Error("Invalid trip details response format");
      
    } catch (error) {
      console.error('Error getting enhanced trip details:', error);
      throw error;
    }
  }

  /**
   * Get bulk availability data from seats.aero API 
   */
  async getBulkAvailability(params: BulkAvailabilityParams & { 
    skip?: number; 
    limit?: number; 
    cursor?: string;
    destination_region?: string;
  }): Promise<any> {
    try {
      console.log("DEBUG: Enhanced bulk availability params:", JSON.stringify(params, null, 2));
      
      // Format the request parameters
      const queryParams = new URLSearchParams({
        source: params.source,
        ...(params.cabinClass ? { cabin_class: params.cabinClass } : {}),
        ...(params.startDate ? { start_date: params.startDate } : {}),
        ...(params.endDate ? { end_date: params.endDate } : {}),
        ...(params.originRegion ? { origin_region: params.originRegion } : {}),
        ...(params.destination_region ? { destination_region: params.destination_region } : {}),
        ...(params.skip ? { skip: params.skip.toString() } : {}),
        ...(params.limit ? { limit: params.limit.toString() } : {}),
        ...(params.cursor ? { cursor: params.cursor } : {})
      });
      
      const url = `${this.baseUrl}/api/bulk-availability?${queryParams}`;
      console.log("DEBUG: Requesting enhanced bulk availability URL:", url);
      
      // Make request to the enhanced bulk availability API
      const response = await fetch(url);
      console.log("DEBUG: Enhanced bulk availability response status:", response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Enhanced bulk availability request failed:", errorText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("DEBUG: Received enhanced bulk availability response");
      console.log(`DEBUG: Count: ${data.count}, Total: ${data.total_count}, Has more: ${data.has_more}`);
      
      if (data.cursor) {
        console.log(`DEBUG: Pagination cursor: ${data.cursor}`);
      }
      
      return data;
      
    } catch (error) {
      console.error('Error getting enhanced bulk availability:', error);
      throw error;
    }
  }
  
  /**
   * Map Seats.aero flight data to our Flight interface
   */
  private mapSeatsAeroFlights(flights: any[], params: FlightSearchParams): Flight[] {
    console.log("DEBUG: Mapping flight data, count:", flights.length);
    
    if (flights.length === 0) {
      console.log("DEBUG: No flights to map");
      return [];
    }
    
    // Show sample of the flight data for debugging
    console.log("DEBUG: Sample flight structure:", JSON.stringify(flights[0], null, 2).substring(0, 1000) + "...");
    
    return flights.map((flight, index) => {
      console.log(`DEBUG: Mapping flight ${index + 1}/${flights.length}, ID:`, flight.ID || "unknown");
      
      try {
        // Extract OPERATING airline from flight number (NOT booking program)
        const operatingAirline = this.getOperatingAirlineFromFlightNumber(flight.FlightNumber);
        const bookingProgram = this.getBookingProgramFromSource(flight.Source || (flight.Route && flight.Route.Source));
        
        // Use operating airline as the primary airline display
        const airline = operatingAirline.name;
        
        // Log the distinction for debugging
        console.log(`DEBUG: Flight ${flight.FlightNumber} - Operating: ${operatingAirline.name}, Booking Program: ${bookingProgram.name}`);
        
        // Store both operating airline and booking program info for display
        const airlineCode = operatingAirline.code;
        const bookingProgramName = bookingProgram.name;
        const bookingProgramCurrency = bookingProgram.currency;
        
        // Generate a unique ID
        const id = flight.ID || `flight-${index}`;
        
        // Determine cabin class from params or default to economy
        const cabinClass = params.cabinClass || "economy";
        
        // Extract cabin-specific data based on selected cabin
        let mileageCost = 0;
        let totalTaxes = 0;
        let remainingSeats = 0;
        let isAvailable = false;
        
        // Map cabin class to Seats.aero API's cabin indicators
        // Y = Economy, W = Premium Economy, J = Business, F = First
        if (cabinClass === "economy" && flight.YAvailable) {
          mileageCost = parseInt(flight.YMileageCost?.toString() || "0", 10);
          totalTaxes = (flight.YTotalTaxes || 0) / 100; // Convert cents to dollars
          remainingSeats = flight.YRemainingSeats || 1;
          isAvailable = true;
        } else if (cabinClass === "premium-economy" && flight.WAvailable) {
          mileageCost = parseInt(flight.WMileageCost?.toString() || "0", 10);
          totalTaxes = (flight.WTotalTaxes || 0) / 100; // Convert cents to dollars
          remainingSeats = flight.WRemainingSeats || 1;
          isAvailable = true;
        } else if (cabinClass === "business" && flight.JAvailable) {
          mileageCost = parseInt(flight.JMileageCost?.toString() || "0", 10);
          totalTaxes = (flight.JTotalTaxes || 0) / 100; // Convert cents to dollars
          remainingSeats = flight.JRemainingSeats || 1;
          isAvailable = true;
        } else if (cabinClass === "first" && flight.FAvailable) {
          mileageCost = parseInt(flight.FMileageCost?.toString() || "0", 10);
          totalTaxes = (flight.FTotalTaxes || 0) / 100; // Convert cents to dollars
          remainingSeats = flight.FRemainingSeats || 1;
          isAvailable = true;
        } else {
          // Default to economy if available
          if (flight.YAvailable) {
            mileageCost = parseInt(flight.YMileageCost?.toString() || "0", 10);
            totalTaxes = (flight.YTotalTaxes || 0) / 100;
            remainingSeats = flight.YRemainingSeats || 1;
            isAvailable = true;
          }
        }
        
        // Extract origin and destination from Route object
        const origin = flight.Route?.OriginAirport || params.origin || "";
        const destination = flight.Route?.DestinationAirport || params.destination || "";
        
        // Use actual flight times from API if available
        const departureTime = flight.DepartsAt || "";
        const arrivalTime = flight.ArrivesAt || "";
        const flightDuration = flight.TotalDuration || 0;
        
        // Log available time data for debugging
        console.log(`DEBUG: Flight ${id} raw times - Departure: ${departureTime}, Arrival: ${arrivalTime}, Duration: ${flightDuration}`);
        
        // Format the times correctly from ISO format to display format
        const formattedDepartureTime = departureTime ? this.formatAPITime(departureTime) : this.generateFakeTime();
        const formattedArrivalTime = arrivalTime ? this.formatAPITime(arrivalTime) : this.generateFakeTime(true);
        
        // Format duration in minutes to "Xh Ym" format or make a reasonable guess based on distance
        let durationFormatted = "";
        if (flightDuration) {
          const hours = Math.floor(flightDuration / 60);
          const minutes = flightDuration % 60;
          durationFormatted = `${hours}h ${minutes}m`;
        } else {
          // Fallback: Generate a reasonable duration based on route distance if available
          const distance = flight.Route?.Distance || 0;
          if (distance > 0) {
            durationFormatted = this.formatDuration(distance);
          } else {
            durationFormatted = "2h 30m"; // Default fallback
          }
        }
        
        // Parse flight dates
        const flightDate = flight.ParsedDate || flight.Date || new Date().toISOString().split('T')[0];
        
        // Create a Flight object with operating airline as primary and booking program as secondary
        return {
          id,
          airline, // Operating airline name (e.g., "Delta Air Lines")
          flightNumber: flight.FlightNumber || `${airlineCode}${100 + index}`,
          origin,
          destination,
          departureTime: formattedDepartureTime,
          arrivalTime: formattedArrivalTime,
          duration: durationFormatted,
          cabinClass: cabinClass,
          points: mileageCost,
          cash: totalTaxes,
          seatsAvailable: remainingSeats,
          layovers: [], // Seats.aero doesn't provide layover info in top-level response
          source: flight.Source || (flight.Route && flight.Route.Source) || "unknown",
          departureDate: flightDate,
          flightType: "one-way", // Default
          aircraftType: flight.AircraftType || "Unknown",
          bookingLink: "",
          realTimeData: true,
          lastUpdated: new Date().toISOString(),
          rawTripData: {},
          // NEW: Include booking program information
          airlineCode, // Operating airline code (e.g., "DL")
          bookingProgram: bookingProgramName, // Booking program name
          bookingProgramCurrency // Currency type
        };
      } catch (err) {
        console.error(`Error mapping flight ${index}:`, err);
        // Return a fallback flight object with error information
        return {
          id: `error-flight-${index}`,
          airline: "Error",
          flightNumber: "ERR123",
          origin: params.origin || "",
          destination: params.destination || "",
          departureTime: "00:00",
          arrivalTime: "00:00",
          duration: "0h 0m",
          points: 0,
          cash: 0,
          seatsAvailable: 0,
          layovers: [],
          source: "error",
          cabinClass: "economy",
          departureDate: new Date().toISOString().split('T')[0],
          flightType: "one-way",
          aircraftType: "Unknown",
          bookingLink: "",
          realTimeData: false,
          lastUpdated: new Date().toISOString(),
          rawTripData: {}
        };
      }
    });
  }

  /**
   * Group flights by operating airline, flight number, departure time, and route
   * This consolidates identical flights available through different booking programs
   */
  groupFlightsByOperatingDetails(flights: Flight[]): GroupedFlight[] {
    console.log('DEBUG: Grouping flights by operating details, total flights:', flights.length);
    
    const flightGroups = new Map<string, Flight[]>();
    
    // Group flights by their operating characteristics
    flights.forEach(flight => {
      // Create a unique key for grouping based on operating flight details
      const groupKey = [
        flight.airlineCode || this.getOperatingAirlineFromFlightNumber(flight.flightNumber).code,
        flight.flightNumber,
        flight.origin,
        flight.destination,
        flight.departureTime,
        flight.departureDate,
        flight.cabinClass
      ].join('|');
      
      if (!flightGroups.has(groupKey)) {
        flightGroups.set(groupKey, []);
      }
      flightGroups.get(groupKey)!.push(flight);
    });
    
    console.log('DEBUG: Created', flightGroups.size, 'flight groups from', flights.length, 'individual flights');
    
    // Convert groups to GroupedFlight objects
    const groupedFlights: GroupedFlight[] = [];
    
    flightGroups.forEach((groupFlights, groupKey) => {
      // Use the first flight as the base for operating details
      const baseFlight = groupFlights[0];
      const operatingAirline = this.getOperatingAirlineFromFlightNumber(baseFlight.flightNumber);
      
      // Create booking options from all flights in the group
      const bookingOptions: BookingOption[] = groupFlights.map((flight, index) => {
        const bookingProgram = this.getBookingProgramFromSource(flight.source);
        return {
          id: `${baseFlight.id}-option-${index}`,
          bookingProgram: bookingProgram.name,
          bookingProgramCurrency: bookingProgram.currency,
          points: flight.points,
          cash: flight.cash,
          seatsAvailable: flight.seatsAvailable,
          source: flight.source || 'unknown',
          bookingLink: flight.bookingLink
        };
      });
      
      // Sort booking options by points (ascending) to show best deals first
      bookingOptions.sort((a, b) => a.points - b.points);
      
      // Calculate aggregated data
      const bestPoints = Math.min(...bookingOptions.map(opt => opt.points));
      const bestCash = Math.min(...bookingOptions.map(opt => opt.cash));
      const totalSeatsAvailable = Math.max(...bookingOptions.map(opt => opt.seatsAvailable));
      
      const groupedFlight: GroupedFlight = {
        id: `grouped-${baseFlight.id}`,
        airline: operatingAirline.name,
        airlineCode: operatingAirline.code,
        flightNumber: baseFlight.flightNumber,
        origin: baseFlight.origin,
        destination: baseFlight.destination,
        departureTime: baseFlight.departureTime,
        arrivalTime: baseFlight.arrivalTime,
        duration: baseFlight.duration,
        cabinClass: baseFlight.cabinClass,
        stops: baseFlight.stops,
        layovers: baseFlight.layovers,
        segments: baseFlight.segments,
        realTimeData: baseFlight.realTimeData,
        lastUpdated: baseFlight.lastUpdated,
        rawTripData: baseFlight.rawTripData,
        departureDate: baseFlight.departureDate,
        flightType: baseFlight.flightType,
        aircraftType: baseFlight.aircraftType,
        aircraft: baseFlight.aircraft,
        durationMinutes: baseFlight.durationMinutes,
        bookingOptions,
        bestPoints,
        bestCash,
        totalSeatsAvailable
      };
      
      groupedFlights.push(groupedFlight);
      
      console.log(`DEBUG: Grouped flight ${baseFlight.flightNumber} with ${bookingOptions.length} booking options:`, 
        bookingOptions.map(opt => `${opt.bookingProgram} (${opt.points} ${opt.bookingProgramCurrency})`).join(', '));
    });
    
    console.log('DEBUG: Final grouped flights count:', groupedFlights.length);
    return groupedFlights;
  }
  
  /**
   * Generate a fake time for display purposes
   * Used when the API doesn't provide real departure/arrival times
   */
  private generateFakeTime(isArrival: boolean = false): string {
    // Base departure time between 6am and 6pm
    const hour = 6 + Math.floor(Math.random() * 12);
    const minute = Math.floor(Math.random() * 12) * 5; // 5-minute intervals
    
    // For arrivals, add 2-4 hours to the departure time
    let arrivalHour = hour;
    let arrivalMinute = minute;
    
    if (isArrival) {
      arrivalHour = hour + 2 + Math.floor(Math.random() * 3);
      arrivalMinute = Math.floor(Math.random() * 12) * 5;
      
      // Handle overflow
      if (arrivalHour >= 24) {
        arrivalHour -= 24;
      }
    }
    
    const timeToFormat = isArrival ? 
      `${arrivalHour.toString().padStart(2, '0')}:${arrivalMinute.toString().padStart(2, '0')}` :
      `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    
    // Format to 12-hour time
    const formattedHour = parseInt(timeToFormat.split(':')[0]);
    const formattedMinute = timeToFormat.split(':')[1];
    const period = formattedHour >= 12 ? 'PM' : 'AM';
    const hour12 = formattedHour % 12 || 12;
    
    return `${hour12}:${formattedMinute} ${period}`;
  }

  /**
   * Parse and format an ISO time string considering API response format
   * Seats.aero API returns times in ISO format, but they represent airport local times
   */
  private parseAndFormatISOTime(isoTimeStr: string): string {
    try {
      if (!isoTimeStr) return "";
      
      console.log(`DEBUG: Parsing ISO time: ${isoTimeStr}`);
      
      // Parse the ISO 8601 time string
      const date = new Date(isoTimeStr);
      if (isNaN(date.getTime())) {
        console.log(`DEBUG: Unable to parse ISO date: ${isoTimeStr}`);
        
        // Try to extract time components manually if the API returns a non-standard format
        const timeMatch = isoTimeStr.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?(?:\s*(AM|PM))?/i);
        if (timeMatch) {
          let [_, hours, minutes, seconds, ampm] = timeMatch;
          let hour = parseInt(hours, 10);
          
          // Convert to 24-hour format if AM/PM is specified
          if (ampm) {
            if (ampm.toUpperCase() === 'PM' && hour < 12) hour += 12;
            if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
          }
          
          // Format to 12-hour time
          const formattedHour = hour % 12 || 12;
          const period = hour >= 12 ? 'PM' : 'AM';
          const formattedTime = `${formattedHour}:${minutes.padStart(2, '0')} ${period}`;
          
          console.log(`DEBUG: Manually parsed time: ${formattedTime}`);
          return formattedTime;
        }
        
        return isoTimeStr; // Return original if we can't parse it
      }
      
      // Format to 12-hour time with AM/PM
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'}`;
      
      console.log(`DEBUG: Formatted ISO time: ${isoTimeStr} → ${formattedTime}`);
      return formattedTime;
    } catch (e) {
      console.error('Error parsing ISO time:', e);
      return isoTimeStr;
    }
  }

  /**
   * Format API time (ISO string) to display format (12h AM/PM)
   * This method delegates to parseAndFormatISOTime for more robust handling
   */
  private formatAPITime(isoTime: string): string {
    try {
      console.log(`DEBUG: Formatting time from API: ${isoTime}`);
      
      // Check if we have a valid string
      if (!isoTime || typeof isoTime !== 'string') {
        console.log(`DEBUG: Invalid time format, not a string: ${isoTime}`);
        return "";
      }
      
      return this.parseAndFormatISOTime(isoTime);
    } catch (e) {
      console.error('Error formatting time:', e);
      return isoTime;
    }
  }
  
  /**
   * Comprehensive airline code mapping for operating airline detection
   */
  private static readonly AIRLINE_CODES: Record<string, { name: string; logo?: string; region: string }> = {
    // North American Airlines
    'DL': { name: 'Delta Air Lines', region: 'US' },
    'AA': { name: 'American Airlines', region: 'US' },
    'UA': { name: 'United Airlines', region: 'US' },
    'WN': { name: 'Southwest Airlines', region: 'US' },
    'B6': { name: 'JetBlue Airways', region: 'US' },
    'AS': { name: 'Alaska Airlines', region: 'US' },
    'HA': { name: 'Hawaiian Airlines', region: 'US' },
    'F9': { name: 'Frontier Airlines', region: 'US' },
    'NK': { name: 'Spirit Airlines', region: 'US' },
    'AC': { name: 'Air Canada', region: 'CA' },
    'WS': { name: 'WestJet', region: 'CA' },
    
    // European Airlines
    'BA': { name: 'British Airways', region: 'EU' },
    'LH': { name: 'Lufthansa', region: 'EU' },
    'AF': { name: 'Air France', region: 'EU' },
    'KL': { name: 'KLM Royal Dutch Airlines', region: 'EU' },
    'VS': { name: 'Virgin Atlantic', region: 'EU' },
    'EI': { name: 'Aer Lingus', region: 'EU' },
    'IB': { name: 'Iberia', region: 'EU' },
    'TP': { name: 'TAP Air Portugal', region: 'EU' },
    'SK': { name: 'SAS Scandinavian Airlines', region: 'EU' },
    'AY': { name: 'Finnair', region: 'EU' },
    'LO': { name: 'LOT Polish Airlines', region: 'EU' },
    'OS': { name: 'Austrian Airlines', region: 'EU' },
    'LX': { name: 'Swiss International Air Lines', region: 'EU' },
    'SN': { name: 'Brussels Airlines', region: 'EU' },
    'UX': { name: 'Air Europa', region: 'EU' },
    'TK': { name: 'Turkish Airlines', region: 'EU' },
    
    // Middle Eastern Airlines
    'EK': { name: 'Emirates', region: 'ME' },
    'EY': { name: 'Etihad Airways', region: 'ME' },
    'QR': { name: 'Qatar Airways', region: 'ME' },
    'MS': { name: 'EgyptAir', region: 'ME' },
    'RJ': { name: 'Royal Jordanian', region: 'ME' },
    
    // Asian/Pacific Airlines
    'SQ': { name: 'Singapore Airlines', region: 'ASIA' },
    'CX': { name: 'Cathay Pacific', region: 'ASIA' },
    'JL': { name: 'Japan Airlines', region: 'ASIA' },
    'NH': { name: 'ANA (All Nippon Airways)', region: 'ASIA' },
    'TG': { name: 'Thai Airways', region: 'ASIA' },
    'MH': { name: 'Malaysia Airlines', region: 'ASIA' },
    'GA': { name: 'Garuda Indonesia', region: 'ASIA' },
    'CI': { name: 'China Airlines', region: 'ASIA' },
    'BR': { name: 'EVA Air', region: 'ASIA' },
    'KE': { name: 'Korean Air', region: 'ASIA' },
    'OZ': { name: 'Asiana Airlines', region: 'ASIA' },
    'AI': { name: 'Air India', region: 'ASIA' },
    'QF': { name: 'Qantas', region: 'OCEANIA' },
    'VA': { name: 'Virgin Australia', region: 'OCEANIA' },
    'JQ': { name: 'Jetstar Airways', region: 'OCEANIA' },
    'NZ': { name: 'Air New Zealand', region: 'OCEANIA' },
    
    // South American Airlines
    'LA': { name: 'LATAM Airlines', region: 'SA' },
    'AV': { name: 'Avianca', region: 'SA' },
    'G3': { name: 'GOL Linhas Aéreas', region: 'SA' },
    'AD': { name: 'Azul Brazilian Airlines', region: 'SA' },
    'AR': { name: 'Aerolíneas Argentinas', region: 'SA' },
    
    // African Airlines
    'SA': { name: 'South African Airways', region: 'AF' },
    'ET': { name: 'Ethiopian Airlines', region: 'AF' },
    'KQ': { name: 'Kenya Airways', region: 'AF' },
    'AT': { name: 'Royal Air Maroc', region: 'AF' }
  };

  /**
   * Comprehensive booking program mapping
   */
  private static readonly BOOKING_PROGRAMS: Record<string, { name: string; currency: string; icon?: string }> = {
    'virginatlantic': { name: 'Virgin Atlantic Flying Club', currency: 'points' },
    'united': { name: 'United MileagePlus', currency: 'miles' },
    'delta': { name: 'Delta SkyMiles', currency: 'miles' },
    'american': { name: 'American AAdvantage', currency: 'miles' },
    'alaska': { name: 'Alaska Mileage Plan', currency: 'miles' },
    'aeroplan': { name: 'Air Canada Aeroplan', currency: 'points' },
    'turkish': { name: 'Turkish Airlines Miles&Smiles', currency: 'miles' },
    'emirates': { name: 'Emirates Skywards', currency: 'miles' },
    'etihad': { name: 'Etihad Guest', currency: 'miles' },
    'qantas': { name: 'Qantas Frequent Flyer', currency: 'points' },
    'velocity': { name: 'Virgin Australia Velocity', currency: 'points' },
    'flyingblue': { name: 'Air France-KLM Flying Blue', currency: 'miles' },
    'jetblue': { name: 'JetBlue TrueBlue', currency: 'points' },
    'aeromexico': { name: 'Aeromexico Club Premier', currency: 'points' },
    'azul': { name: 'Azul TudoAzul', currency: 'points' },
    'smiles': { name: 'Smiles (GOL)', currency: 'miles' },
    'lifemiles': { name: 'LifeMiles (Avianca)', currency: 'miles' },
    'latampass': { name: 'LATAM Pass', currency: 'points' },
    'britishairways': { name: 'British Airways Executive Club', currency: 'avios' },
    'iberia': { name: 'Iberia Plus', currency: 'avios' },
    'singapore': { name: 'Singapore Airlines KrisFlyer', currency: 'miles' },
    'cathay': { name: 'Cathay Pacific Asia Miles', currency: 'miles' },
    'ana': { name: 'ANA Mileage Club', currency: 'miles' },
    'jal': { name: 'JAL Mileage Bank', currency: 'miles' }
  };

  /**
   * Extract operating airline from flight number
   */
  private getOperatingAirlineFromFlightNumber(flightNumber?: string): { name: string; code: string } {
    if (!flightNumber) {
      return { name: 'Unknown Airline', code: 'XX' };
    }

    // Extract airline code from flight number (first 2-3 characters)
    const airlineCodeMatch = flightNumber.match(/^([A-Z]{2,3})/);
    if (!airlineCodeMatch) {
      return { name: 'Unknown Airline', code: 'XX' };
    }

    const airlineCode = airlineCodeMatch[1];
    const airlineInfo = ApiService.AIRLINE_CODES[airlineCode];
    
    if (airlineInfo) {
      return { name: airlineInfo.name, code: airlineCode };
    }

    // Fallback: return formatted airline code
    return { name: `${airlineCode} Airlines`, code: airlineCode };
  }

  /**
   * Get booking program information from source
   */
  private getBookingProgramFromSource(source?: string): { name: string; currency: string } {
    if (!source) {
      return { name: 'Unknown Program', currency: 'points' };
    }
    
    const program = ApiService.BOOKING_PROGRAMS[source.toLowerCase()];
    return program || { name: source, currency: 'points' };
  }

  /**
   * @deprecated Use getOperatingAirlineFromFlightNumber instead
   * Get airline name from source (booking program)
   */
  private getAirlineFromSource(source?: string): string {
    console.warn('getAirlineFromSource is deprecated - this shows booking program, not operating airline');
    if (!source) return "Unknown Airline";
    
    // Map source to booking program name (NOT operating airline)
    const sourceMap: Record<string, string> = {
      'united': 'United MileagePlus Program',
      'delta': 'Delta SkyMiles Program', 
      'american': 'American AAdvantage Program',
      'alaska': 'Alaska Mileage Plan',
      'aeroplan': 'Air Canada Aeroplan',
      'turkish': 'Turkish Miles&Smiles',
      'emirates': 'Emirates Skywards',
      'etihad': 'Etihad Guest',
      'qantas': 'Qantas Frequent Flyer',
      'velocity': 'Virgin Australia Velocity',
      'virginatlantic': 'Virgin Atlantic Flying Club',
      'flyingblue': 'Air France-KLM Flying Blue',
      'jetblue': 'JetBlue TrueBlue',
      'aeromexico': 'Aeromexico Club Premier',
      'azul': 'Azul TudoAzul',
      'smiles': 'Smiles (GOL)'
    };
    
    return sourceMap[source.toLowerCase()] || source;
  }
  
  /**
   * Format flight duration based on distance
   */
  private formatDuration(distance: number): string {
    // Calculate approximate duration based on distance
    // Assuming average speed of 500 miles per hour
    if (distance <= 0) {
      return "2h 0m"; // Default minimal duration
    }
    
    const hours = Math.floor(distance / 500);
    const minutes = Math.floor((distance % 500) / 500 * 60);
    
    return `${Math.max(1, hours)}h ${minutes}m`;
  }

  /**
   * Get available routes from Seats.aero API
   */
  async getAvailableRoutes(source: string = "all"): Promise<Route[]> {
    try {
      const url = `${this.baseUrl}/routes?source=${source}`;
      console.log("DEBUG: Requesting routes URL:", url);
      
      const response = await fetch(url);
      console.log("DEBUG: Routes response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("DEBUG: Received routes response with data count:", data.data ? data.data.length : 0);
      
      // Map the response to a more structured format
      const routes = data.data ? data.data.map((route: any) => ({
        origin: route.origin || route.Origin || "",
        destination: route.destination || route.Destination || "",
        source: route.source || route.Source || source
      })) : [];
      
      return routes;
    } catch (error) {
      console.error('Error getting available routes:', error);
      throw error;
    }
  }

  /**
   * Get flight details by ID
   */
  async getFlightDetails(flightId: string): Promise<Flight & { rawTripData?: any } | null> {
    try {
      console.log("DEBUG: Getting flight details for ID:", flightId);
      
      // For all IDs, we use the trips endpoint
      try {
        const tripDetails = await this.getTripDetails(flightId);
        if (tripDetails) {
          // Map the trip details to a Flight object
          console.log("DEBUG: Found trip details from API");
          const flightData = this.mapTripToFlight(tripDetails);
          
          // Include the raw trip data for components that need additional details
          return {
            ...flightData,
            rawTripData: tripDetails
          };
        }
      } catch (error) {
        console.error('Error fetching trip details from API:', error);
      }
      
      console.log("DEBUG: Flight not found in API");
      return null;
    } catch (error) {
      console.error('Error getting flight details:', error);
      throw error;
    }
  }
  
  /**
   * Map trip details to Flight interface
   */
  private mapTripToFlight(tripDetails: any): Flight {
    console.log("DEBUG: Mapping trip to flight:", tripDetails.ID);
    
    // Determine cabin class
    let cabinClass = tripDetails.Cabin || "economy";
    // Normalize cabin class names
    if (cabinClass === "premium") cabinClass = "premium-economy";
    
    // Extract cost information
    const mileageCost = parseInt(tripDetails.MileageCost || "0", 10);
    const totalTaxes = (tripDetails.TotalTaxes || 0) / 100; // Convert cents to dollars
    const remainingSeats = tripDetails.RemainingSeats || 1;
    
    // Use the actual departure, arrival times and duration directly from the API
    const departureTime = tripDetails.DepartsAt;
    const arrivalTime = tripDetails.ArrivesAt;
    const totalDuration = tripDetails.TotalDuration; // in minutes
    
    console.log(`DEBUG: Trip times - Departure: ${departureTime}, Arrival: ${arrivalTime}, Duration: ${totalDuration} minutes`);
    
    // Format the times correctly from ISO format to display format
    const formattedDepartureTime = departureTime ? this.formatAPITime(departureTime) : "";
    const formattedArrivalTime = arrivalTime ? this.formatAPITime(arrivalTime) : "";
    
    // Format duration in minutes to "Xh Ym" format
    let durationFormatted = "";
    if (totalDuration) {
      const hours = Math.floor(totalDuration / 60);
      const minutes = totalDuration % 60;
      durationFormatted = `${hours}h ${minutes}m`;
      console.log(`DEBUG: Formatted duration: ${durationFormatted}`);
    }
    
    // Extract flight number(s)
    let flightNumber = tripDetails.FlightNumber || tripDetails.FlightNumbers || "";
    
    // If we have segments, use those for more accurate information
    if (tripDetails.AvailabilitySegments && tripDetails.AvailabilitySegments.length > 0) {
      // For multiple segments, concatenate flight numbers
      if (tripDetails.AvailabilitySegments.length > 1 && !flightNumber) {
        flightNumber = tripDetails.AvailabilitySegments
          .map((segment: any) => segment.FlightNumber)
          .join(", ");
      } 
      // For single segment, use the flight number if not already set
      else if (!flightNumber && tripDetails.AvailabilitySegments[0].FlightNumber) {
        flightNumber = tripDetails.AvailabilitySegments[0].FlightNumber;
      }
    }
    
    // Extract operating airline and booking program info
    const operatingAirline = this.getOperatingAirlineFromFlightNumber(tripDetails.FlightNumber);
    const bookingProgram = this.getBookingProgramFromSource(tripDetails.Source);
    
    // Debug logging to verify the fix is working
    console.log(`🔍 AIRLINE FIX DEBUG:`);
    console.log(`  Flight Number: ${tripDetails.FlightNumber}`);
    console.log(`  Source (Booking Program): ${tripDetails.Source}`);
    console.log(`  Operating Airline: ${operatingAirline.name} (${operatingAirline.code})`);
    console.log(`  Booking Program: ${bookingProgram.name}`);
    console.log(`  Currency: ${bookingProgram.currency}`);
    
    // Initialize the Flight object with data from the trip
    const flight: Flight = {
      id: tripDetails.ID || String(Date.now()),
      airline: operatingAirline.name, // Operating airline (e.g., "Delta Air Lines")
      airlineCode: operatingAirline.code, // Operating airline code (e.g., "DL")
      bookingProgram: bookingProgram.name, // Booking program (e.g., "Virgin Atlantic Flying Club")
      bookingProgramCurrency: bookingProgram.currency, // Currency type (e.g., "points")
      flightNumber,
      origin: tripDetails.OriginAirport || (tripDetails.AvailabilitySegments && tripDetails.AvailabilitySegments[0]?.OriginAirport) || "Unknown",
      destination: tripDetails.DestinationAirport || (tripDetails.AvailabilitySegments && tripDetails.AvailabilitySegments[tripDetails.AvailabilitySegments.length - 1]?.DestinationAirport) || "Unknown",
      departureTime: formattedDepartureTime,
      arrivalTime: formattedArrivalTime,
      duration: durationFormatted,
      cabinClass,
      points: mileageCost,
      cash: totalTaxes,
      seatsAvailable: remainingSeats,
      realTimeData: true,
      lastUpdated: tripDetails.UpdatedAt || new Date().toISOString(),
      layovers: [], // Initialize with empty array
      rawTripData: {}
    };
    
    // Add layovers based on availability segments
    if (tripDetails.AvailabilitySegments && tripDetails.AvailabilitySegments.length > 1) {
      // Create layovers for multi-segment trips
      flight.layovers = tripDetails.AvailabilitySegments.slice(0, -1).map((segment: any, index: number) => {
        const nextSegment = tripDetails.AvailabilitySegments[index + 1];
        const layoverAirport = segment.DestinationAirport;
        
        // Calculate layover duration between segments
        let layoverDuration = "Unknown";
        if (segment.ArrivesAt && nextSegment.DepartsAt) {
          try {
            const arrivalTime = new Date(segment.ArrivesAt).getTime();
            const departureTime = new Date(nextSegment.DepartsAt).getTime();
            const durationMinutes = Math.round((departureTime - arrivalTime) / (60 * 1000));
            layoverDuration = `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`;
          } catch (e) {
            console.error('Error calculating layover duration:', e);
          }
        }
        
        return {
          airport: layoverAirport,
          duration: layoverDuration
        };
      });
    } 
    // If explicit layovers are provided, use those
    else if (tripDetails.Layovers && Array.isArray(tripDetails.Layovers) && tripDetails.Layovers.length > 0) {
      flight.layovers = tripDetails.Layovers.map((layover: any) => ({
        airport: layover.Airport || layover.airport,
        duration: layover.Duration || layover.duration
      }));
    }
    
    console.log("DEBUG: Mapped trip to flight:", flight.id, "Departure:", flight.departureTime, "Arrival:", flight.arrivalTime, "Duration:", flight.duration);
    return flight;
  }

  /**
   * Helper method to summarize an object structure without printing all data
   */
  private summarizeObject(obj: any, depth = 1): string {
    if (!obj || typeof obj !== 'object') return String(obj);
    
    if (Array.isArray(obj)) {
      return `Array(${obj.length})${depth > 0 ? ` [${obj.length > 0 ? this.summarizeObject(obj[0], depth - 1) : 'empty'}]` : ''}`;
    }
    
    const keys = Object.keys(obj);
    if (depth <= 0 || keys.length === 0) return `Object(${keys.length} keys)`;
    
    return `Object(${keys.join(', ')})`;
  }

  /**
   * Search for airports using the backend Airport Service API
   */
  async searchAirports(query: string, limit: number = 10): Promise<any> {
    console.log("DEBUG: Searching for airports with query:", query);
    
    try {
      // Call the backend airport search API
      const queryParams = new URLSearchParams({
        q: query,
        limit: limit.toString()
      });
      
      const response = await fetch(`${this.baseUrl}/api/airports/search?${queryParams}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Airport search API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`DEBUG: Backend airport search returned ${data.count || 0} results:`, data);
      
      // Return the airports data from the backend response
      return data.data || [];
      
    } catch (error) {
      console.error('Error searching airports via backend API:', error);
      
      // Use fallback airports in case of backend API error
      console.log('DEBUG: Using fallback airport data due to API error');
      const fallbackAirports = [
        { iata: 'JFK', icao: 'KJFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'US' },
        { iata: 'LAX', icao: 'KLAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'US' },
        { iata: 'SFO', icao: 'KSFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'US' },
        { iata: 'ORD', icao: 'KORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'US' },
        { iata: 'ATL', icao: 'KATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'US' },
        { iata: 'DEN', icao: 'KDEN', name: 'Denver International Airport', city: 'Denver', country: 'US' },
        { iata: 'LHR', icao: 'EGLL', name: 'Heathrow Airport', city: 'London', country: 'GB' },
        { iata: 'CDG', icao: 'LFPG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'FR' },
        { iata: 'DXB', icao: 'OMDB', name: 'Dubai International Airport', city: 'Dubai', country: 'AE' },
        { iata: 'HKG', icao: 'VHHH', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'HK' },
        { iata: 'SYD', icao: 'YSSY', name: 'Sydney Airport', city: 'Sydney', country: 'AU' }
      ].filter(airport => 
        airport.iata.toLowerCase().includes(query.toLowerCase()) || 
        airport.city.toLowerCase().includes(query.toLowerCase()) ||
        airport.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, limit);
      
      return fallbackAirports;
    }
  }

  /**
   * User Authentication
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Backend expects JSON data with email and password
      const response = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Login failed: ${response.status}`);
      }
      
      const rawData = await response.json();
      
      // Map backend response to frontend format
      const data: AuthResponse = {
        access_token: rawData.access_token,
        token_type: rawData.token_type || 'bearer',
        user: {
          id: rawData.user.id.toString(),
          email: rawData.user.email,
          full_name: rawData.user.name, // Backend returns 'name', frontend expects 'full_name'
          points_balance: rawData.user.points || 0,
          created_at: rawData.user.created_at || new Date().toISOString(),
          updated_at: rawData.user.updated_at || new Date().toISOString(),
          is_admin: false,
          frequent_flyer_programs: [],
          saved_searches: [],
          search_history: []
        }
      };
      
      // Cookies are set automatically by the server
      // Update authentication status
      this.isAuthenticated = true;
      
      return data;
    } catch (error: any) {
      console.error('Login API error:', error);
      throw new Error(error.message || 'Failed to login');
    }
  }

  async register(userData: {
    full_name: string;
    email: string;
    password: string;
    preferred_airport?: string;
    frequent_flyer_programs?: Array<{
      airline: string;
      program_name: string;
      member_number: string;
      tier_status?: string;
    }>;
  }): Promise<AuthResponse> {
    try {
      console.log('🚀 Starting registration process...');
      console.log('📍 Base URL:', this.baseUrl);
      console.log('📝 User data:', { ...userData, password: '[HIDDEN]' });
  
  const url = `${this.baseUrl}/api/auth/register`;
  console.log('🌐 Full registration URL:', url);
  
  const headers = {
    'Content-Type': 'application/json',
  };
  console.log('📋 Request headers:', headers);
  
  // Map full_name to name for backend compatibility
  const backendUserData = {
    email: userData.email,
    password: userData.password,
    name: userData.full_name, // Backend expects 'name' field
    preferred_airport: userData.preferred_airport,
    frequent_flyer_programs: userData.frequent_flyer_programs
  };
  
  const body = JSON.stringify(backendUserData);
  console.log('📦 Request body length:', body.length);
  
  console.log('📡 Making registration request...');
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
    credentials: 'include',
  });
  
  console.log('✅ Response received!');
  console.log('📊 Response status:', response.status, response.statusText);
  console.log('📋 Response headers:', Object.fromEntries(response.headers.entries()));
  
  if (!response.ok) {
    console.log('❌ Response not OK, attempting to parse error...');
    let errorData;
    try {
      errorData = await response.json();
      console.log('📄 Error data:', errorData);
    } catch (parseError) {
      console.log('⚠️ Could not parse error response as JSON:', parseError);
      const errorText = await response.text();
      console.log('📄 Error text:', errorText);
      errorData = { detail: errorText };
    }
    throw new Error(errorData.detail || `Registration failed: ${response.status} ${response.statusText}`);
  }
  
  console.log('✅ Registration successful, parsing response...');
  const rawData = await response.json();
  console.log('📦 Raw response data:', { ...rawData, token: rawData.token ? '[TOKEN_RECEIVED]' : 'NO_TOKEN' });
  
  // Map backend response to frontend format
  const data: AuthResponse = {
    access_token: rawData.token, // Backend returns 'token', frontend expects 'access_token'
    token_type: 'bearer',
    user: {
      id: rawData.user.id.toString(),
      email: rawData.user.email,
      full_name: rawData.user.name, // Backend returns 'name', frontend expects 'full_name'
      points_balance: rawData.user.points || 0,
      created_at: rawData.user.created_at || new Date().toISOString(),
      updated_at: rawData.user.updated_at || new Date().toISOString(),
      is_admin: false,
      frequent_flyer_programs: [],
      saved_searches: [],
      search_history: []
    }
  };
  
  // Cookies are set automatically by the server
  // Update authentication status
  this.isAuthenticated = true;
  
  console.log('🎉 Registration completed successfully!');
  return data;
} catch (error: any) {
  console.error('💥 Registration API error:', error);
  console.error('📚 Error stack:', error.stack);
  
  // Additional network error diagnostics
  if (error instanceof TypeError && error.message.includes('fetch')) {
    console.error('🌐 Network error detected - backend might be down or CORS issue');
    throw new Error('Connection failed: Unable to reach the server. Please check if the backend is running.');
  } else if (error.name === 'AbortError') {
    console.error('⏱️ Request timeout detected');
    throw new Error('Request timeout: The server took too long to respond.');
  }
  
  throw new Error(error.message || 'Failed to register');
}
}

  async forgotPassword(email: string, captchaToken?: string): Promise<{ message: string; success: boolean }> {
    try {
      const requestBody: any = { email };
      if (captchaToken) {
        requestBody.captcha_token = captchaToken;
      }
      
      const response = await fetch(`${this.baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Failed to send reset email: ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Forgot password API error:', error);
      throw new Error(error.message || 'Failed to send reset email');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          new_password: newPassword 
        }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Password reset failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error: any) {
      console.error('Reset password API error:', error);
      throw new Error(error.message || 'Failed to reset password');
    }
  }

  async getCurrentUser(): Promise<User> {
    try {
      const response = await this.fetch('/api/auth/me');
      return response as User;
    } catch (error: any) {
      console.error('Get current user error:', error);
      throw new Error(error.message || 'Failed to get user data');
    }
  }

  async logout(): Promise<void> {
    try {
      await this.fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Don't throw error for logout - still clear local data
      console.warn('Logout API call failed, but clearing local data anyway');
    } finally {
      // Clear authentication status
      this.isAuthenticated = false;
    }
  }

  async getGoogleAuthStatus(): Promise<{ available: boolean; auth_url?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/google/status`);
      if (!response.ok) {
        console.warn('Google auth status check failed');
        return { available: false };
      }
      return await response.json();
    } catch (error) {
      console.warn('Failed to check Google auth status:', error);
      return { available: false };
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      const statusResponse = await this.getGoogleAuthStatus();
      if (!statusResponse.available || !statusResponse.auth_url) {
        throw new Error('Google authentication is not available');
      }
      
      // Redirect to Google OAuth URL
      window.location.href = statusResponse.auth_url;
    } catch (error: any) {
      console.error('Google login error:', error);
      throw new Error(error.message || 'Failed to initiate Google login');
    }
  }

  async handleGoogleCallback(code: string, state?: string): Promise<AuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/google/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Google authentication failed');
      }
      
      const data: AuthResponse = await response.json();
      
      // Cookies are set automatically by the server
      // Update authentication status
      this.isAuthenticated = true;
      
      return data;
    } catch (error: any) {
      console.error('Google callback error:', error);
      throw new Error(error.message || 'Failed to complete Google authentication');
    }
  }

  /**
   * Add search to user's search history
   */
  async addSearchToHistory(searchData: any): Promise<void> {
    try {
      // This would be implemented when backend supports it
      console.log('Search history:', searchData);
    } catch (error) {
      console.error('Error adding search to history:', error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(updates: any): Promise<User> {
    try {
      const response = await this.fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      return response;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Get Google OAuth URL
   */
  async getGoogleAuthUrl(): Promise<{ auth_url: string }> {
    try {
      const response = await this.fetch('/api/auth/google');
      return response;
    } catch (error) {
      console.error('Error getting Google auth URL:', error);
      throw error;
    }
  }

  /**
   * Authenticate with Google
   */
  async authenticateWithGoogle(code: string, state?: string): Promise<AuthResponse> {
    try {
      const response = await this.fetch('/api/auth/google/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state }),
      });
      return response;
    } catch (error) {
      console.error('Error authenticating with Google:', error);
      throw error;
    }
  }

  /**
   * Get user search history
   */
  async getSearchHistory(): Promise<any[]> {
    try {
      const response = await this.fetch('/api/users/search-history');
      return response.data || [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService;