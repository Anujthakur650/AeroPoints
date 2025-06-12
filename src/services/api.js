/**
 * API Service for Award Flight Frontend
 * Handles all communication with the backend API
 */
import config from '../config/environment';
class ApiService {
    constructor() {
        Object.defineProperty(this, "baseUrl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config.API_BASE_URL
        });
        Object.defineProperty(this, "token", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: localStorage.getItem('token')
        });
    }
    /**
     * Private method to make authenticated requests
     */
    async fetch(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Request failed: ${response.status}`);
        }
        return response.json();
    }
    /**
     * Check the API connection
     */
    async checkApiConnection() {
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
        }
        catch (error) {
            console.error('Flight search API connection check error:', error);
            // More detailed error logging
            if (error instanceof TypeError && error.message.includes('fetch')) {
                console.error('Network error: The flight search API server might not be running on port 8000');
            }
            else if (error instanceof DOMException && error.name === 'AbortError') {
                console.error('Timeout: The flight search API health check timed out');
            }
            return false;
        }
    }
    /**
     * Search for flights using the enhanced seats.aero API
     */
    async searchFlights(params, retryCount = 0) {
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
            const mappedFlights = flights.map((flight, index) => {
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
                    bookingLink: flight.bookingLink
                };
            });
            console.log(`Mapped ${mappedFlights.length} enhanced flights successfully`);
            return {
                flights: mappedFlights
            };
        }
        catch (error) {
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
     * Get enhanced trip details from the API including real flight times
     */
    async getTripDetails(tripId) {
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
                    tripDetails.segments.forEach((segment, index) => {
                        console.log(`DEBUG: Enhanced Segment ${index + 1}:`, `Flight ${segment.flight_number}`, `from ${segment.origin_airport} to ${segment.destination_airport}`, `Departs: ${segment.departs_at}`, `Arrives: ${segment.arrives_at}`, `Aircraft: ${segment.aircraft_name} (${segment.aircraft_code})`, `Distance: ${segment.distance} miles`);
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
        }
        catch (error) {
            console.error('Error getting enhanced trip details:', error);
            throw error;
        }
    }
    /**
     * Get bulk availability data from seats.aero API
     */
    async getBulkAvailability(params) {
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
        }
        catch (error) {
            console.error('Error getting enhanced bulk availability:', error);
            throw error;
        }
    }
    /**
     * Map Seats.aero flight data to our Flight interface
     */
    mapSeatsAeroFlights(flights, params) {
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
                // Extract airline from source or route
                let airline = "Unknown";
                if (flight.Source) {
                    airline = this.getAirlineFromSource(flight.Source);
                }
                else if (flight.Route && flight.Route.Source) {
                    airline = this.getAirlineFromSource(flight.Route.Source);
                }
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
                }
                else if (cabinClass === "premium-economy" && flight.WAvailable) {
                    mileageCost = parseInt(flight.WMileageCost?.toString() || "0", 10);
                    totalTaxes = (flight.WTotalTaxes || 0) / 100; // Convert cents to dollars
                    remainingSeats = flight.WRemainingSeats || 1;
                    isAvailable = true;
                }
                else if (cabinClass === "business" && flight.JAvailable) {
                    mileageCost = parseInt(flight.JMileageCost?.toString() || "0", 10);
                    totalTaxes = (flight.JTotalTaxes || 0) / 100; // Convert cents to dollars
                    remainingSeats = flight.JRemainingSeats || 1;
                    isAvailable = true;
                }
                else if (cabinClass === "first" && flight.FAvailable) {
                    mileageCost = parseInt(flight.FMileageCost?.toString() || "0", 10);
                    totalTaxes = (flight.FTotalTaxes || 0) / 100; // Convert cents to dollars
                    remainingSeats = flight.FRemainingSeats || 1;
                    isAvailable = true;
                }
                else {
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
                }
                else {
                    // Fallback: Generate a reasonable duration based on route distance if available
                    const distance = flight.Route?.Distance || 0;
                    if (distance > 0) {
                        durationFormatted = this.formatDuration(distance);
                    }
                    else {
                        durationFormatted = "2h 30m"; // Default fallback
                    }
                }
                // Parse flight dates
                const flightDate = flight.ParsedDate || flight.Date || new Date().toISOString().split('T')[0];
                // Create a Flight object
                return {
                    id,
                    airline,
                    flightNumber: flight.FlightNumber || `${airline.substring(0, 2)}${100 + index}`,
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
                    rawTripData: {}
                };
            }
            catch (err) {
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
     * Generate a fake time for display purposes
     * Used when the API doesn't provide real departure/arrival times
     */
    generateFakeTime(isArrival = false) {
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
    parseAndFormatISOTime(isoTimeStr) {
        try {
            if (!isoTimeStr)
                return "";
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
                        if (ampm.toUpperCase() === 'PM' && hour < 12)
                            hour += 12;
                        if (ampm.toUpperCase() === 'AM' && hour === 12)
                            hour = 0;
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
        }
        catch (e) {
            console.error('Error parsing ISO time:', e);
            return isoTimeStr;
        }
    }
    /**
     * Format API time (ISO string) to display format (12h AM/PM)
     * This method delegates to parseAndFormatISOTime for more robust handling
     */
    formatAPITime(isoTime) {
        try {
            console.log(`DEBUG: Formatting time from API: ${isoTime}`);
            // Check if we have a valid string
            if (!isoTime || typeof isoTime !== 'string') {
                console.log(`DEBUG: Invalid time format, not a string: ${isoTime}`);
                return "";
            }
            return this.parseAndFormatISOTime(isoTime);
        }
        catch (e) {
            console.error('Error formatting time:', e);
            return isoTime;
        }
    }
    /**
     * Get airline name from source
     */
    getAirlineFromSource(source) {
        if (!source)
            return "Unknown Airline";
        // Map source to airline name
        const sourceMap = {
            'united': 'United Airlines',
            'delta': 'Delta Air Lines',
            'american': 'American Airlines',
            'alaska': 'Alaska Airlines',
            'aeroplan': 'Air Canada',
            'turkish': 'Turkish Airlines',
            'emirates': 'Emirates',
            'etihad': 'Etihad Airways',
            'qantas': 'Qantas',
            'velocity': 'Virgin Australia',
            'virginatlantic': 'Virgin Atlantic',
            'flyingblue': 'Air France-KLM',
            'jetblue': 'JetBlue',
            'aeromexico': 'AeroMexico',
            'azul': 'Azul Brazilian Airlines',
            'smiles': 'GOL Airlines'
        };
        return sourceMap[source.toLowerCase()] || source;
    }
    /**
     * Format flight duration based on distance
     */
    formatDuration(distance) {
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
    async getAvailableRoutes(source = "all") {
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
            const routes = data.data ? data.data.map((route) => ({
                origin: route.origin || route.Origin || "",
                destination: route.destination || route.Destination || "",
                source: route.source || route.Source || source
            })) : [];
            return routes;
        }
        catch (error) {
            console.error('Error getting available routes:', error);
            throw error;
        }
    }
    /**
     * Get flight details by ID
     */
    async getFlightDetails(flightId) {
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
            }
            catch (error) {
                console.error('Error fetching trip details from API:', error);
            }
            console.log("DEBUG: Flight not found in API");
            return null;
        }
        catch (error) {
            console.error('Error getting flight details:', error);
            throw error;
        }
    }
    /**
     * Map trip details to Flight interface
     */
    mapTripToFlight(tripDetails) {
        console.log("DEBUG: Mapping trip to flight:", tripDetails.ID);
        // Determine cabin class
        let cabinClass = tripDetails.Cabin || "economy";
        // Normalize cabin class names
        if (cabinClass === "premium")
            cabinClass = "premium-economy";
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
                    .map((segment) => segment.FlightNumber)
                    .join(", ");
            }
            // For single segment, use the flight number if not already set
            else if (!flightNumber && tripDetails.AvailabilitySegments[0].FlightNumber) {
                flightNumber = tripDetails.AvailabilitySegments[0].FlightNumber;
            }
        }
        // Initialize the Flight object with data from the trip
        const flight = {
            id: tripDetails.ID || String(Date.now()),
            airline: this.getAirlineFromSource(tripDetails.Source),
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
            flight.layovers = tripDetails.AvailabilitySegments.slice(0, -1).map((segment, index) => {
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
                    }
                    catch (e) {
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
            flight.layovers = tripDetails.Layovers.map((layover) => ({
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
    summarizeObject(obj, depth = 1) {
        if (!obj || typeof obj !== 'object')
            return String(obj);
        if (Array.isArray(obj)) {
            return `Array(${obj.length})${depth > 0 ? ` [${obj.length > 0 ? this.summarizeObject(obj[0], depth - 1) : 'empty'}]` : ''}`;
        }
        const keys = Object.keys(obj);
        if (depth <= 0 || keys.length === 0)
            return `Object(${keys.length} keys)`;
        return `Object(${keys.join(', ')})`;
    }
    /**
     * Search for airports using the backend Airport Service API
     */
    async searchAirports(query, limit = 10) {
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
        }
        catch (error) {
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
            ].filter(airport => airport.iata.toLowerCase().includes(query.toLowerCase()) ||
                airport.city.toLowerCase().includes(query.toLowerCase()) ||
                airport.name.toLowerCase().includes(query.toLowerCase())).slice(0, limit);
            return fallbackAirports;
        }
    }
    /**
     * User Authentication
     */
    async login(email, password) {
        try {
            // Backend expects OAuth2PasswordRequestForm which requires form data
            const formData = new FormData();
            formData.append('username', email); // OAuth2 uses 'username' field for email
            formData.append('password', password);
            const response = await fetch(`${this.baseUrl}/api/auth/token`, {
                method: 'POST',
                body: formData,
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Login failed: ${response.status}`);
            }
            const data = await response.json();
            // Store token in localStorage
            if (data.access_token) {
                localStorage.setItem('token', data.access_token);
                this.token = data.access_token;
            }
            return data;
        }
        catch (error) {
            console.error('Login API error:', error);
            throw new Error(error.message || 'Failed to login');
        }
    }
    async register(userData) {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
                credentials: 'include',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || `Registration failed: ${response.status}`);
            }
            const data = await response.json();
            // Store token in localStorage
            if (data.access_token) {
                localStorage.setItem('token', data.access_token);
                this.token = data.access_token;
            }
            return data;
        }
        catch (error) {
            console.error('Registration API error:', error);
            throw new Error(error.message || 'Failed to register');
        }
    }
    async getCurrentUser() {
        try {
            const response = await this.fetch('/api/auth/me');
            return response;
        }
        catch (error) {
            console.error('Get current user error:', error);
            throw new Error(error.message || 'Failed to get user data');
        }
    }
    async logout() {
        try {
            await this.fetch('/api/auth/logout', { method: 'POST' });
        }
        catch (error) {
            // Don't throw error for logout - still clear local data
            console.warn('Logout API call failed, but clearing local data anyway');
        }
        finally {
            // Always clear local authentication data
            localStorage.removeItem('token');
            this.token = null;
        }
    }
    async getGoogleAuthStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/api/auth/google/status`);
            if (!response.ok) {
                console.warn('Google auth status check failed');
                return { available: false };
            }
            return await response.json();
        }
        catch (error) {
            console.warn('Failed to check Google auth status:', error);
            return { available: false };
        }
    }
    async loginWithGoogle() {
        try {
            const statusResponse = await this.getGoogleAuthStatus();
            if (!statusResponse.available || !statusResponse.auth_url) {
                throw new Error('Google authentication is not available');
            }
            // Redirect to Google OAuth URL
            window.location.href = statusResponse.auth_url;
        }
        catch (error) {
            console.error('Google login error:', error);
            throw new Error(error.message || 'Failed to initiate Google login');
        }
    }
    async handleGoogleCallback(code, state) {
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
            const data = await response.json();
            // Store token in localStorage
            if (data.access_token) {
                localStorage.setItem('token', data.access_token);
                this.token = data.access_token;
            }
            return data;
        }
        catch (error) {
            console.error('Google callback error:', error);
            throw new Error(error.message || 'Failed to complete Google authentication');
        }
    }
    /**
     * Add search to user's search history
     */
    async addSearchToHistory(searchData) {
        try {
            // This would be implemented when backend supports it
            console.log('Search history:', searchData);
        }
        catch (error) {
            console.error('Error adding search to history:', error);
        }
    }
    /**
     * Update user profile
     */
    async updateProfile(updates) {
        try {
            const response = await this.fetch('/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });
            return response;
        }
        catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }
    /**
     * Get Google OAuth URL
     */
    async getGoogleAuthUrl() {
        try {
            const response = await this.fetch('/api/auth/google');
            return response;
        }
        catch (error) {
            console.error('Error getting Google auth URL:', error);
            throw error;
        }
    }
    /**
     * Authenticate with Google
     */
    async authenticateWithGoogle(code, state) {
        try {
            const response = await this.fetch('/api/auth/google/callback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, state }),
            });
            return response;
        }
        catch (error) {
            console.error('Error authenticating with Google:', error);
            throw error;
        }
    }
    /**
     * Get user search history
     */
    async getSearchHistory() {
        try {
            const response = await this.fetch('/api/users/search-history');
            return response.data || [];
        }
        catch (error) {
            console.error('Error getting search history:', error);
            return [];
        }
    }
}
// Create singleton instance
const apiService = new ApiService();
export default apiService;
