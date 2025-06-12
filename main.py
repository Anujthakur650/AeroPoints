from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import json
import logging
import os
import sys
import httpx
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import asyncio
import random
import uuid

# Add the backend directory to the path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

# Check for the seats.aero API key
SEATS_AERO_API_KEY = os.getenv("SEATS_AERO_API_KEY")
if not SEATS_AERO_API_KEY:
    print("WARNING: SEATS_AERO_API_KEY environment variable is not set.")
    print("Flight search functionality will not work without a valid API key.")
    print("Please set the environment variable with your seats.aero Partner API key.")
    print("You can get an API key from: https://seats.aero/partner-api")

# Import the airport service
try:
    from backend.airport_service import airport_service
    print(f"Successfully imported airport service with {len(airport_service.airports_by_iata)} airports")
except ImportError as e:
    print(f"Error importing airport service: {e}")
    raise

# Import authentication routes
try:
    from backend.routes.auth import router as auth_router
    print("Successfully imported authentication routes")
    auth_enabled = True
except ImportError as e:
    print(f"Error importing authentication routes: {e}")
    auth_enabled = False

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler("flight_search_api.log", mode='a'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Create the FastAPI app
app = FastAPI(title="AeroPoints Flight Search API", description="Premium award flight search and user management")

# Configure CORS - allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,  # 24 hours
)

# Include authentication routes
if auth_enabled:
    app.include_router(auth_router, prefix="/api")

@app.get("/")
async def root():
    """Root endpoint"""
    logger.info("Root endpoint accessed")
    return {"message": "Flight Search API is running"}

@app.get("/health")
async def health():
    """Health check endpoint"""
    logger.info("Health check called")
    return {"status": "healthy", "message": "API is running"}

@app.get("/api/airports/search")
async def search_airports(
    q: str = Query(..., description="Search query (airport code, city, etc.)", min_length=2),
    limit: int = Query(10, description="Maximum number of results to return", ge=1, le=50)
):
    """
    Search for airports by IATA code, city, or name
    
    Args:
        q: Search query string
        limit: Maximum number of results to return
        
    Returns:
        List of matching airports
    """
    logger.info(f"Searching for airports with query: {q}, limit: {limit}")
    
    try:
        # Search for airports
        results = airport_service.search_airports(q, limit)
        logger.info(f"Found {len(results)} results for query: {q}")
        
        # Return the results
        return {
            "status": "success", 
            "count": len(results), 
            "data": results
        }
    except Exception as e:
        logger.error(f"Error searching airports: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

def map_seats_aero_flights(raw_flights: list, cabin_class: str = "economy") -> list:
    """
    Map raw seats.aero flight data to our internal format
    Uses actual API data without generating fake times
    """
    mapped_flights = []
    
    # Cabin code mapping for seats.aero API
    cabin_codes = {
        "economy": "Y",
        "premium-economy": "W", 
        "business": "J",
        "first": "F"
    }
    
    cabin_code = cabin_codes.get(cabin_class, "Y")
    
    for index, flight in enumerate(raw_flights):
        try:
            flight_id = flight.get("ID", "")
            route = flight.get("Route", {})
            source = route.get("Source", "unknown")
            
            # Determine airline from source
            airline_map = {
                "american": "American Airlines",
                "delta": "Delta Air Lines", 
                "united": "United Airlines",
                "alaska": "Alaska Airlines",
                "jetblue": "JetBlue",
                "southwest": "Southwest Airlines",
                "etihad": "Etihad Airways",
                "smiles": "Smiles (GOL)",
                "lifemiles": "LifeMiles (Avianca)"
            }
            airline = airline_map.get(source, source.title())
            
            # Get route info from Route object (per API docs)
            origin = route.get("OriginAirport", "")
            destination = route.get("DestinationAirport", "")
            distance = route.get("Distance", 0)
            
            # Get cabin-specific data using API field names
            available_key = f"{cabin_code}Available"
            cost_key = f"{cabin_code}MileageCost"
            taxes_key = f"{cabin_code}TotalTaxes"
            seats_key = f"{cabin_code}RemainingSeats"
            direct_key = f"{cabin_code}Direct"
            airlines_key = f"{cabin_code}Airlines"
            
            is_available = flight.get(available_key, False)
            mileage_cost = int(flight.get(cost_key, 0) or 0)
            total_taxes = int(flight.get(taxes_key, 0) or 0)
            remaining_seats = int(flight.get(seats_key, 1) or 1)
            is_direct = flight.get(direct_key, False)
            airlines_list = flight.get(airlines_key, "")
            
            # Enhanced availability filtering
            if not is_available and cabin_class != 'economy':
                continue
                
            if not is_available and cabin_class == 'economy':
                # For economy, check if any cabin is available
                if not any([flight.get("YAvailable"), flight.get("WAvailable"), 
                           flight.get("JAvailable"), flight.get("FAvailable")]):
                    continue
            
            # Calculate cash cost (convert from cents to dollars per API docs)
            cash_cost = round(total_taxes / 100) if total_taxes > 0 else 0
            
            # Extract date information
            flight_date = flight.get("Date", "")
            parsed_date = flight.get("ParsedDate", "")
            
            # Don't generate fake times - let frontend handle missing data
            mapped_flight = {
                "id": flight_id,
                "airline": airline,
                "flightNumber": f"{airline[:2].upper()}{100 + index}",
                "origin": origin,
                "destination": destination,
                "departureTime": None,  # No fake times - let UI handle gracefully
                "arrivalTime": None,    # No fake times - let UI handle gracefully
                "duration": None,       # No fake duration - let UI handle gracefully
                "cabinClass": cabin_class,
                "points": mileage_cost,
                "cash": cash_cost,
                "seatsAvailable": remaining_seats,
                "realTimeData": True,
                "lastUpdated": flight_date,
                "route_distance": distance,
                "is_direct": is_direct,
                "operating_airlines": airlines_list,
                "source_program": source,
                "availability_id": flight_id  # For trip details lookup
            }
            
            mapped_flights.append(mapped_flight)
            
        except Exception as e:
            logger.error(f"Error mapping flight {index}: {str(e)}")
            continue
    
    logger.info(f"Mapped {len(mapped_flights)} flights from {len(raw_flights)} raw flights")
    return mapped_flights

# Create a mock data function for award flight searches with more realistic mock data
async def fetch_award_flights(
    origin: str, 
    destination: str, 
    date: str, 
    cabin_class: str = "economy", 
    passengers: int = 1,
    source_filter: Optional[str] = None,
    max_results: int = 50
) -> Dict[str, Any]:
    """
    Fetch award flights from the seats.aero API
    Enhanced with full API documentation compliance
    """
    logger.info(f"Fetching award flights: {origin} to {destination} on {date}, cabin: {cabin_class}, passengers: {passengers}")
    if source_filter:
        logger.info(f"Filtering by source: {source_filter}")
    
    try:
        # Get API key from environment variable
        api_key = os.getenv("SEATS_AERO_API_KEY")
        if not api_key:
            logger.error("Missing SEATS_AERO_API_KEY environment variable")
            return {
                "status": "error",
                "message": "Missing API key for seats.aero",
                "flights": []
            }
        
        # Prepare parameters for API call according to seats.aero documentation
        params = {
            "origin_airport": origin,
            "destination_airport": destination,
            "start_date": date,
            "end_date": date  # API requires both start and end dates
        }
        
        # Add cabin class mapping for seats.aero API
        if cabin_class:
            cabin_map = {
                "economy": "economy",
                "premium-economy": "premium",
                "business": "business",
                "first": "first"
            }
            params["cabin"] = cabin_map.get(cabin_class.lower(), "economy")
        
        # Add source filter if specified (for mileage program filtering)
        if source_filter:
            params["source"] = source_filter.lower()
        
        # Set up headers with API key
        headers = {
            "Partner-Authorization": api_key,
            "Accept": "application/json"
        }
        
        # Log the API request (masking the API key)
        url = "https://seats.aero/partnerapi/search"
        logger.info(f"API Request - URL: {url}")
        logger.info(f"API Request - Headers: {json.dumps({k: '***' if k == 'Partner-Authorization' else v for k, v in headers.items()})}")
        logger.info(f"API Request - Params: {json.dumps(params)}")
        
        # Make the request to seats.aero API
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url,
                    params=params,
                    headers=headers,
                    timeout=30.0
                )
                
                # Log response info
                logger.info(f"API Response - Status: {response.status_code}")
                logger.info(f"API Response - Headers: {json.dumps(dict(response.headers))}")
                logger.info(f"API Response - URL: {response.url}")
                
                # Handle API rate limiting and errors per documentation
                if response.status_code != 200:
                    error_message = response.text
                    if response.status_code == 401:
                        error_message = "The seats.aero API subscription has expired or the API key is invalid. Please contact support."
                    elif response.status_code == 403:
                        error_message = "Access to seats.aero API is forbidden. Please check the API key permissions."
                    elif response.status_code == 429:
                        # Check X-RateLimit headers if available
                        rate_limit_reset = response.headers.get("x-ratelimit-reset")
                        error_message = f"Rate limit exceeded. Reset in {rate_limit_reset} seconds." if rate_limit_reset else "Too many requests to seats.aero API. Please try again later."
                    elif response.status_code >= 500:
                        error_message = "The seats.aero API is currently experiencing issues. Please try again later."
                    
                    logger.error(f"API request failed with status {response.status_code}: {response.text}")
                    return {
                        "status": "error",
                        "message": error_message,
                        "flights": []
                    }
                
                # Parse the response
                data = response.json()
                logger.info(f"API Response - Data: {json.dumps(data)[:500]}...")
                
                # Check if we received pagination cursor for large result sets
                cursor = data.get("cursor")
                if cursor:
                    logger.info(f"Response includes pagination cursor: {cursor}")
                
                # Handle empty results by trying expanded date range
                if data.get("count", 0) == 0 and len(data.get("data", [])) == 0:
                    logger.info("No results found with specific date, trying a date range")
                    
                    try:
                        from datetime import datetime, timedelta
                        original_date = datetime.strptime(date, "%Y-%m-%d")
                        
                        # Create a range from the date to 7 days later per API best practices
                        end_date = (original_date + timedelta(days=7)).strftime("%Y-%m-%d")
                        
                        # Update the params with the new end date
                        params["end_date"] = end_date
                        
                        logger.info(f"Retrying with date range: {date} to {end_date}")
                        
                        # Retry the API call with the date range
                        response = await client.get(
                            url,
                            params=params,
                            headers=headers,
                            timeout=30.0
                        )
                        
                        if response.status_code == 200:
                            data = response.json()
                            logger.info(f"Range API Response - Data: {json.dumps(data)[:500]}...")
                        else:
                            logger.error(f"Range API request failed: {response.status_code}")
                    except Exception as date_err:
                        logger.error(f"Error creating date range: {str(date_err)}")
                
                # Process the seats.aero response according to API documentation
                if "data" in data and isinstance(data["data"], list):
                    # Limit results to prevent overwhelming the frontend
                    raw_flights = data["data"][:max_results]
                    
                    # Map the seats.aero flights to our expected format
                    mapped_flights = map_seats_aero_flights(raw_flights, cabin_class)
                    
                    return {
                        "status": "success",
                        "count": len(mapped_flights),
                        "flights": mapped_flights,
                        "api_count": data.get("count", len(raw_flights)),
                        "has_more": len(data.get("data", [])) > max_results,
                        "cursor": cursor
                    }
                else:
                    # Return empty results if data format is unexpected
                    logger.warning("Unexpected API response format")
                    return {
                        "status": "success",
                        "count": 0,
                        "flights": [],
                        "api_count": 0
                    }
                    
            except httpx.TimeoutException:
                logger.error("API request timed out")
                return {
                    "status": "error",
                    "message": "API request timed out. The seats.aero API may be experiencing high load.",
                    "flights": []
                }
            except httpx.ConnectError:
                logger.error("Failed to connect to seats.aero API")
                return {
                    "status": "error", 
                    "message": "Failed to connect to seats.aero API. Please check your internet connection.",
                    "flights": []
                }
    except Exception as e:
        logger.error(f"Error fetching award flights: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return {
            "status": "error",
            "message": str(e),
            "flights": []
        }

@app.get("/api/search-awards")
async def search_award_flights(
    origin: str = Query(..., description="Origin airport code"),
    destination: str = Query(..., description="Destination airport code"),
    date: str = Query(..., description="Departure date (YYYY-MM-DD)"),
    cabin_class: str = Query("economy", description="Cabin class"),
    passengers: int = Query(1, description="Number of passengers", ge=1, le=9),
    return_date: Optional[str] = Query(None, description="Return date for round trips"),
    airline: Optional[str] = Query(None, description="Preferred airline"),
    origin_city: Optional[str] = Query(None, description="Origin city"),
    destination_city: Optional[str] = Query(None, description="Destination city"),
    origin_country: Optional[str] = Query(None, description="Origin country"),
    destination_country: Optional[str] = Query(None, description="Destination country"),
    user_id: Optional[str] = Query(None, description="User ID for search history tracking")
):
    """
    Search for award flights
    
    Args:
        origin: Origin airport code
        destination: Destination airport code
        date: Departure date (YYYY-MM-DD)
        cabin_class: Cabin class (economy, business, first)
        passengers: Number of passengers
        return_date: Return date for round trips
        airline: Preferred airline
        
    Returns:
        List of matching flights
    """
    logger.info(f"Searching for award flights: {origin} to {destination} on {date}")
    logger.info(f"Additional parameters: cabin={cabin_class}, passengers={passengers}, return_date={return_date}, airline={airline}")
    logger.info(f"City info: origin_city={origin_city}, destination_city={destination_city}")
    
    try:
        # Log the parameters for debugging
        logger.info(f"Flight search parameters: {locals()}")
        
        # Call the seats.aero API to get flights
        flights = await fetch_award_flights(
            origin=origin,
            destination=destination,
            date=date,
            cabin_class=cabin_class,
            passengers=passengers
        )
        
        # Check if the API call was successful
        if flights.get("status") == "error":
            logger.error(f"Failed to fetch outbound flights: {flights.get('message')}")
            raise HTTPException(status_code=500, detail=flights.get("message", "Failed to fetch flights"))
        
        logger.info(f"Found {flights.get('count', 0)} outbound flights")
        
        # If we have a return date, also get return flights
        if return_date:
            logger.info(f"Also searching for return flights on {return_date}")
            return_flights = await fetch_award_flights(
                origin=destination,
                destination=origin,
                date=return_date,
                cabin_class=cabin_class,
                passengers=passengers
            )
            
            # Check if the return flights API call was successful
            if return_flights.get("status") == "error":
                logger.error(f"Failed to fetch return flights: {return_flights.get('message')}")
                raise HTTPException(status_code=500, detail=return_flights.get("message", "Failed to fetch return flights"))
            
            logger.info(f"Found {return_flights.get('count', 0)} return flights")
            
            # Combine the results
            flights["flights"] = {
                "outbound": flights.get("flights", []),
                "return": return_flights.get("flights", [])
            }
            flights["count"] = len(flights.get("flights", {}).get("outbound", [])) + len(flights.get("flights", {}).get("return", []))
            logger.info(f"Combined {flights.get('count', 0)} total flights (round-trip)")
        
        # Add search to history if user is logged in
        if user_id:
            try:
                from backend.db.users import add_search_to_history
                from backend.models.user import SearchHistory, CabinClass
                
                # Map cabin class string to enum
                cabin_enum_map = {
                    "economy": CabinClass.economy,
                    "premium_economy": CabinClass.premium_economy,
                    "business": CabinClass.business,
                    "first": CabinClass.first
                }
                cabin_enum = cabin_enum_map.get(cabin_class, CabinClass.economy)
                
                search_history = SearchHistory(
                    id=str(uuid.uuid4()),
                    origin=origin,
                    destination=destination,
                    departure_date=date,
                    return_date=return_date,
                    cabin_class=cabin_enum,
                    passengers=passengers,
                    search_timestamp=datetime.utcnow(),
                    results_found=flights.get("count", 0)
                )
                
                await add_search_to_history(user_id, search_history)
                logger.info(f"Added search to history for user {user_id}")
            except Exception as e:
                logger.warning(f"Failed to add search to history: {e}")
        
        return flights
    except Exception as e:
        logger.error(f"Error searching award flights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trips/{trip_id}")
async def get_trip_details(trip_id: str):
    """
    Get detailed trip information from seats.aero API including real flight times
    Enhanced with full API documentation compliance
    """
    logger.info(f"Fetching trip details for ID: {trip_id}")
    
    try:
        # Get API key from environment variable
        api_key = os.getenv("SEATS_AERO_API_KEY")
        if not api_key:
            logger.error("Missing SEATS_AERO_API_KEY environment variable")
            raise HTTPException(status_code=500, detail="Missing API key for seats.aero")
        
        # Set up headers with API key
        headers = {
            "Partner-Authorization": api_key,
            "Accept": "application/json"
        }
        
        # Make request to seats.aero trips API
        url = f"https://seats.aero/partnerapi/trips/{trip_id}"
        logger.info(f"Trip Details API Request - URL: {url}")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url,
                    headers=headers,
                    timeout=30.0
                )
                
                logger.info(f"Trip Details API Response - Status: {response.status_code}")
                
                if response.status_code != 200:
                    if response.status_code == 404:
                        raise HTTPException(status_code=404, detail=f"Trip details not found for ID: {trip_id}")
                    elif response.status_code == 401:
                        raise HTTPException(status_code=401, detail="Invalid API key or subscription expired")
                    elif response.status_code == 429:
                        rate_limit_reset = response.headers.get("x-ratelimit-reset")
                        detail = f"Rate limit exceeded. Reset in {rate_limit_reset} seconds." if rate_limit_reset else "Too many requests"
                        raise HTTPException(status_code=429, detail=detail)
                    else:
                        raise HTTPException(status_code=response.status_code, detail=f"API error: {response.text}")
                
                trip_data = response.json()
                logger.info(f"Trip Details Response: {json.dumps(trip_data)[:1000]}...")
                
                # Process trip data according to API documentation
                if "data" in trip_data and len(trip_data["data"]) > 0:
                    trip = trip_data["data"][0]
                    
                    # Extract availability segments with real flight information
                    segments = trip.get("AvailabilitySegments", [])
                    
                    # Build detailed trip information
                    trip_details = {
                        "id": trip.get("ID"),
                        "route_id": trip.get("RouteID"),
                        "availability_id": trip.get("AvailabilityID"),
                        "total_duration": trip.get("TotalDuration", 0),  # in minutes
                        "stops": trip.get("Stops", 0),
                        "carriers": trip.get("Carriers", ""),
                        "remaining_seats": trip.get("RemainingSeats", 0),
                        "mileage_cost": trip.get("MileageCost", 0),
                        "total_taxes": trip.get("TotalTaxes", 0),
                        "taxes_currency": trip.get("TaxesCurrency", ""),
                        "cabin": trip.get("Cabin", ""),
                        "flight_numbers": trip.get("FlightNumbers", ""),
                        "departs_at": trip.get("DepartsAt", ""),
                        "arrives_at": trip.get("ArrivesAt", ""),
                        "segments": []
                    }
                    
                    # Process each flight segment
                    for segment in segments:
                        segment_details = {
                            "id": segment.get("ID"),
                            "flight_number": segment.get("FlightNumber"),
                            "origin_airport": segment.get("OriginAirport"),
                            "destination_airport": segment.get("DestinationAirport"),
                            "departs_at": segment.get("DepartsAt"),
                            "arrives_at": segment.get("ArrivesAt"),
                            "distance": segment.get("Distance", 0),
                            "fare_class": segment.get("FareClass"),
                            "aircraft_name": segment.get("AircraftName"),
                            "aircraft_code": segment.get("AircraftCode"),
                            "order": segment.get("Order", 0)
                        }
                        trip_details["segments"].append(segment_details)
                    
                    # Sort segments by order
                    trip_details["segments"].sort(key=lambda x: x["order"])
                    
                    logger.info(f"Successfully processed trip details with {len(segments)} segments")
                    
                    return {
                        "status": "success",
                        "data": trip_details
                    }
                else:
                    logger.warning(f"No trip data found for ID: {trip_id}")
                    raise HTTPException(status_code=404, detail=f"No trip data found for ID: {trip_id}")
                
            except httpx.TimeoutException:
                logger.error("Trip details API request timed out")
                raise HTTPException(status_code=504, detail="Request timed out")
            except httpx.ConnectError:
                logger.error("Failed to connect to seats.aero trips API")
                raise HTTPException(status_code=503, detail="Failed to connect to seats.aero API")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching trip details: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/bulk-availability")
async def get_bulk_availability(
    source: str = Query(..., description="The mileage program to search (e.g., 'united', 'delta', 'alaska')"),
    cabin_class: str = Query("economy", description="Cabin class"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    origin_region: Optional[str] = Query(None, description="Origin region filter (e.g., 'North America')"),
    destination_region: Optional[str] = Query(None, description="Destination region filter (e.g., 'Europe')"),
    skip: int = Query(0, description="Number of results to skip for pagination", ge=0),
    limit: int = Query(50, description="Maximum number of results to return", ge=1, le=500),
    cursor: Optional[str] = Query(None, description="Pagination cursor from previous response")
):
    """
    Get bulk availability data from seats.aero API for exploring large datasets
    Enhanced with full API documentation compliance including pagination
    """
    logger.info(f"Fetching bulk availability for source: {source}, cabin: {cabin_class}")
    if origin_region:
        logger.info(f"Origin region filter: {origin_region}")
    if destination_region:
        logger.info(f"Destination region filter: {destination_region}")
    if start_date and end_date:
        logger.info(f"Date range: {start_date} to {end_date}")
    
    try:
        # Get API key from environment variable
        api_key = os.getenv("SEATS_AERO_API_KEY")
        if not api_key:
            logger.error("Missing SEATS_AERO_API_KEY environment variable")
            raise HTTPException(status_code=500, detail="Missing API key for seats.aero")
        
        # Validate source parameter against known mileage programs
        valid_sources = {
            'american', 'delta', 'united', 'alaska', 'jetblue', 'qantas', 'saudia', 
            'smiles', 'etihad', 'qatar', 'aeroplan', 'virgin_atlantic', 'aeromexico',
            'emirates', 'velocity', 'connectmiles', 'azul', 'flyingblue', 'turkish',
            'singapore', 'ethiopian', 'eurobonus'
        }
        
        if source.lower() not in valid_sources:
            logger.warning(f"Invalid source: {source}. Valid sources: {', '.join(sorted(valid_sources))}")
            # Continue anyway as new sources may be added
        
        # Prepare parameters for bulk availability API
        params = {
            "source": source.lower()
        }
        
        # Add optional filters
        if cabin_class:
            cabin_map = {
                "economy": "economy",
                "premium-economy": "premium",
                "business": "business",
                "first": "first"
            }
            params["cabin"] = cabin_map.get(cabin_class.lower(), "economy")
            
        if start_date:
            params["start_date"] = start_date
        if end_date:
            params["end_date"] = end_date
        if origin_region:
            params["origin_region"] = origin_region
        if destination_region:
            params["destination_region"] = destination_region
        
        # Add pagination parameters per API documentation
        if skip > 0:
            params["skip"] = skip
        if cursor:
            params["cursor"] = cursor
        
        # Set up headers with API key
        headers = {
            "Partner-Authorization": api_key,
            "Accept": "application/json"
        }
        
        # Make request to seats.aero bulk availability API
        url = "https://seats.aero/partnerapi/availability"
        logger.info(f"Bulk Availability API Request - URL: {url}")
        logger.info(f"Request params: {json.dumps(params)}")
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url,
                    params=params,
                    headers=headers,
                    timeout=60.0  # Longer timeout for bulk requests
                )
                
                logger.info(f"Bulk Availability API Response - Status: {response.status_code}")
                
                if response.status_code != 200:
                    if response.status_code == 400:
                        raise HTTPException(status_code=400, detail="Invalid request parameters")
                    elif response.status_code == 401:
                        raise HTTPException(status_code=401, detail="Invalid API key or subscription expired")
                    elif response.status_code == 429:
                        rate_limit_reset = response.headers.get("x-ratelimit-reset")
                        detail = f"Rate limit exceeded. Reset in {rate_limit_reset} seconds." if rate_limit_reset else "Too many requests"
                        raise HTTPException(status_code=429, detail=detail)
                    else:
                        raise HTTPException(status_code=response.status_code, detail=f"API error: {response.text}")
                
                bulk_data = response.json()
                logger.info(f"Bulk Availability Response: count={bulk_data.get('count', 0)}")
                
                # Process bulk availability data according to API documentation
                if "data" in bulk_data and isinstance(bulk_data["data"], list):
                    # Limit results if no limit was applied server-side
                    raw_availability = bulk_data["data"][:limit] if len(bulk_data["data"]) > limit else bulk_data["data"]
                    
                    # Extract pagination info
                    response_cursor = bulk_data.get("cursor")
                    total_count = bulk_data.get("count", len(raw_availability))
                    
                    # Process each availability object
                    processed_availability = []
                    for avail in raw_availability:
                        processed_item = {
                            "id": avail.get("ID"),
                            "route": {
                                "id": avail.get("Route", {}).get("ID"),
                                "origin_airport": avail.get("Route", {}).get("OriginAirport"),
                                "destination_airport": avail.get("Route", {}).get("DestinationAirport"),
                                "origin_region": avail.get("Route", {}).get("OriginRegion"),
                                "destination_region": avail.get("Route", {}).get("DestinationRegion"),
                                "distance": avail.get("Route", {}).get("Distance", 0),
                                "source": avail.get("Route", {}).get("Source")
                            },
                            "date": avail.get("Date"),
                            "parsed_date": avail.get("ParsedDate"),
                            "economy": {
                                "available": avail.get("YAvailable", False),
                                "direct": avail.get("YDirect", False),
                                "mileage_cost": avail.get("YMileageCost"),
                                "remaining_seats": avail.get("YRemainingSeats", 0),
                                "airlines": avail.get("YAirlines", "")
                            },
                            "premium_economy": {
                                "available": avail.get("WAvailable", False),
                                "direct": avail.get("WDirect", False),
                                "mileage_cost": avail.get("WMileageCost"),
                                "remaining_seats": avail.get("WRemainingSeats", 0),
                                "airlines": avail.get("WAirlines", "")
                            },
                            "business": {
                                "available": avail.get("JAvailable", False),
                                "direct": avail.get("JDirect", False),
                                "mileage_cost": avail.get("JMileageCost"),
                                "remaining_seats": avail.get("JRemainingSeats", 0),
                                "airlines": avail.get("JAirlines", "")
                            },
                            "first": {
                                "available": avail.get("FAvailable", False),
                                "direct": avail.get("FDirect", False),
                                "mileage_cost": avail.get("FMileageCost"),
                                "remaining_seats": avail.get("FRemainingSeats", 0),
                                "airlines": avail.get("FAirlines", "")
                            },
                            "source": avail.get("Source")
                        }
                        processed_availability.append(processed_item)
                    
                    logger.info(f"Successfully processed {len(processed_availability)} availability objects")
                    
                    return {
                        "status": "success", 
                        "count": len(processed_availability),
                        "total_count": total_count,
                        "data": processed_availability,
                        "has_more": len(bulk_data.get("data", [])) > len(processed_availability),
                        "cursor": response_cursor,
                        "skip": skip,
                        "limit": limit
                    }
                else:
                    logger.warning("No bulk availability data found")
                    return {
                        "status": "success",
                        "count": 0,
                        "total_count": 0,
                        "data": [],
                        "has_more": False,
                        "cursor": None
                    }
                
            except httpx.TimeoutException:
                logger.error("Bulk availability API request timed out")
                raise HTTPException(status_code=504, detail="Request timed out")
            except httpx.ConnectError:
                logger.error("Failed to connect to seats.aero bulk availability API")
                raise HTTPException(status_code=503, detail="Failed to connect to seats.aero API")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching bulk availability: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/api/routes")
async def get_routes(
    source: str = Query(..., description="The mileage program to get routes for (e.g., 'united', 'delta')")
):
    """
    Get available routes for a specific mileage program
    
    This endpoint returns all available routes for a specific mileage program,
    which can be used to identify which origin/destination pairs might have availability.
    
    Args:
        source: The mileage program (e.g., "united", "delta")
        
    Returns:
        JSON object with route data
    """
    logger.info(f"Getting routes for source: {source}")
    
    try:
        # Get API key from environment variable
        api_key = os.getenv("SEATS_AERO_API_KEY")
        if not api_key:
            logger.error("Missing SEATS_AERO_API_KEY environment variable")
            raise HTTPException(status_code=500, detail="Missing API key for seats.aero")
        
        # Prepare parameters
        params = {
            "source": source
        }
        
        # Set up headers
        headers = {
            "Partner-Authorization": api_key,
            "Accept": "application/json"
        }
        
        # Log the API request
        url = f"https://seats.aero/partnerapi/routes"
        logger.info(f"API Request - URL: {url}")
        logger.info(f"API Request - Headers: {json.dumps({k: '***' if k == 'Partner-Authorization' else v for k, v in headers.items()})}")
        logger.info(f"API Request - Params: {json.dumps(params)}")
        
        # Make the request to seats.aero API
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url,
                    params=params,
                    headers=headers,
                    timeout=30.0
                )
                
                # Log the response
                logger.info(f"API Response - Status: {response.status_code}")
                
                # Handle errors
                if response.status_code != 200:
                    error_message = "API request failed"
                    try:
                        error_data = response.json()
                        if "message" in error_data:
                            error_message = error_data["message"]
                    except:
                        error_message = f"API request failed: {response.reason_phrase}"
                    
                    logger.error(f"API request failed with status {response.status_code}: {response.text}")
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=error_message
                    )
                
                # Parse the response
                try:
                    routes_data = response.json()
                    
                    # Handle different response formats
                    routes = []
                    if isinstance(routes_data, list):
                        routes = routes_data
                    elif isinstance(routes_data, dict) and "data" in routes_data:
                        routes = routes_data.get("data", [])
                    
                    logger.info(f"API Response - Data summary: Found {len(routes)} routes")
                    
                    # Return the data
                    return {
                        "status": "success", 
                        "count": len(routes),
                        "data": routes
                    }
                except Exception as e:
                    logger.error(f"Error parsing routes response: {str(e)}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to parse API response: {str(e)}"
                    )
                
            except httpx.TimeoutException:
                logger.error("Routes API request timed out")
                raise HTTPException(
                    status_code=504,
                    detail="API request timed out"
                )
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error getting routes: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/test-api-key")
async def test_api_key():
    """
    Test the seats.aero API key to verify integration
    
    This endpoint attempts to connect to seats.aero with the configured API key
    and returns status information about the connection.
    
    Returns:
        JSON object with API key status and capabilities
    """
    logger.info("Testing seats.aero API key")
    
    try:
        # Get API key from environment variable
        api_key = os.getenv("SEATS_AERO_API_KEY")
        if not api_key:
            logger.error("Missing SEATS_AERO_API_KEY environment variable")
            return {
                "status": "error",
                "message": "Missing API key - SEATS_AERO_API_KEY environment variable is not set"
            }
        
        # Mask the API key for display
        masked_key = f"{api_key[:4]}...{api_key[-4:]}" if len(api_key) > 8 else "***"
        
        # Verify key format
        if not api_key.startswith("sk_") or len(api_key) < 20:
            logger.error("API key does not match expected format")
            return {
                "status": "warning",
                "message": f"API key format may be invalid: {masked_key}",
                "details": "Expected format: sk_... (at least 20 characters)"
            }
        
        # Set up headers
        headers = {
            "Partner-Authorization": api_key,
            "Accept": "application/json"
        }
        
        # Make a simple request to test the key - try to get routes for united
        url = f"https://seats.aero/partnerapi/routes"
        params = {"source": "united"}
        
        logger.info(f"Testing API key with request to: {url}")
        
        results = {}
        
        # Make the request to seats.aero API
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url,
                    params=params,
                    headers=headers,
                    timeout=15.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    # Check if we got valid data
                    if isinstance(data, list) or (isinstance(data, dict) and "data" in data):
                        route_count = len(data) if isinstance(data, list) else len(data.get("data", []))
                        logger.info(f"API key test successful - found {route_count} routes")
                        results["routes_test"] = {
                            "status": "success",
                            "count": route_count
                        }
                    else:
                        logger.warning(f"API key test: unexpected data format: {type(data)}")
                        results["routes_test"] = {
                            "status": "warning",
                            "message": f"Unexpected data format: {type(data)}"
                        }
                else:
                    error_message = f"API request failed with status {response.status_code}"
                    try:
                        error_data = response.json()
                        if "message" in error_data:
                            error_message = error_data["message"]
                    except:
                        pass
                    
                    logger.error(f"API key test failed: {error_message}")
                    results["routes_test"] = {
                        "status": "error",
                        "message": error_message,
                        "status_code": response.status_code
                    }
                    
            except httpx.TimeoutException:
                logger.error("API request timed out during API key test")
                results["routes_test"] = {
                    "status": "error",
                    "message": "Request timed out"
                }
            except Exception as e:
                logger.error(f"Error during API key test: {str(e)}")
                results["routes_test"] = {
                    "status": "error",
                    "message": str(e)
                }
        
        # Overall status
        if any(test.get("status") == "error" for test in results.values()):
            status = "error"
        elif any(test.get("status") == "warning" for test in results.values()):
            status = "warning"
        else:
            status = "success"
            
        return {
            "status": status,
            "api_key": masked_key,
            "tests": results,
            "message": "API connection successful" if status == "success" else "API connection issues detected"
        }
            
    except Exception as e:
        logger.error(f"Error testing API key: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return {
            "status": "error",
            "message": str(e)
        }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print(f"Starting Flight Search API server on {host}:{port}...")
    uvicorn.run(app, host=host, port=port) 