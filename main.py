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
app = FastAPI(title="Flight Search API")

# Configure CORS - allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=86400,  # 24 hours
)

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
    Map seats.aero API response to our Flight interface format
    Enhanced with full API documentation compliance
    """
    mapped_flights = []
    
    # Enhanced airline mapping based on seats.aero sources
    airline_map = {
        'american': 'American Airlines',
        'delta': 'Delta Air Lines', 
        'united': 'United Airlines',
        'alaska': 'Alaska Airlines',
        'jetblue': 'JetBlue Airways',
        'qantas': 'Qantas',
        'saudia': 'Saudia',
        'smiles': 'Smiles (Gol)',
        'etihad': 'Etihad Airways',
        'qatar': 'Qatar Airways',
        'lufthansa': 'Lufthansa',
        'aeroplan': 'Air Canada Aeroplan',
        'virgin_atlantic': 'Virgin Atlantic',
        'aeromexico': 'Aeromexico',
        'emirates': 'Emirates',
        'velocity': 'Virgin Australia',
        'connectmiles': 'Copa Airlines',
        'azul': 'Azul Brazilian Airlines',
        'flyingblue': 'Air France/KLM',
        'turkish': 'Turkish Airlines',
        'singapore': 'Singapore Airlines',
        'ethiopian': 'Ethiopian Airlines',
        'eurobonus': 'SAS'
    }
    
    # Cabin class mapping according to seats.aero API
    cabin_map = {
        'economy': 'Y',
        'premium-economy': 'W',
        'business': 'J', 
        'first': 'F'
    }
    
    cabin_code = cabin_map.get(cabin_class, 'Y')
    
    for index, flight in enumerate(raw_flights):
        try:
            # Extract basic info - following API documentation structure
            flight_id = flight.get("ID", f"flight-{index}")
            route = flight.get("Route", {})
            source = route.get("Source") or flight.get("Source", "unknown")
            airline = airline_map.get(source.lower(), source.title())
            
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
            
            # Estimate duration based on distance (rough calculation)
            estimated_duration = "Direct" if is_direct else "1+ stops"
            if distance > 0:
                # Rough estimate: 500 mph average speed
                hours = max(1, round(distance / 500))
                minutes = round((distance / 500 - hours) * 60)
                estimated_duration = f"{hours}h {minutes}m" + (" direct" if is_direct else "")
            
            mapped_flight = {
                "id": flight_id,
                "airline": airline,
                "flightNumber": f"{airline[:2].upper()}{100 + index}",
                "origin": origin,
                "destination": destination,
                "departureTime": "08:00 AM",  # Basic API doesn't provide times, use trip details API for actual times
                "arrivalTime": "11:30 AM",    # Use getTripDetails API for actual flight times
                "duration": estimated_duration,
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
    passengers: int = 1
) -> Dict[str, Any]:
    """
    Fetch award flights from the seats.aero API
    """
    logger.info(f"Fetching award flights: {origin} to {destination} on {date}, cabin: {cabin_class}, passengers: {passengers}")
    
    try:
        # Get API key from environment variable
        api_key = os.getenv("SEATS_AERO_API_KEY")
        if not api_key:
            logger.error("Missing SEATS_AERO_API_KEY environment variable")
            return {
                "status": "error",
                "message": "Missing API key for seats.aero",
                "data": []
            }
        
        # Prepare parameters for API call according to seats.aero documentation
        params = {
            "origin_airport": origin,
            "destination_airport": destination,
            "start_date": date,
            "end_date": date  # API requires both start and end dates
        }
        
        # Add cabin class if provided - map to the format expected by the API
        if cabin_class:
            cabin_map = {
                "economy": "economy",
                "premium-economy": "premium",
                "business": "business",
                "first": "first"
            }
            params["cabin"] = cabin_map.get(cabin_class.lower(), "economy")
        
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
                
                # Handle errors
                if response.status_code != 200:
                    error_message = response.text
                    if response.status_code == 401:
                        error_message = "The seats.aero API subscription has expired. Please contact support to renew the subscription."
                    elif response.status_code == 403:
                        error_message = "Access to seats.aero API is forbidden. Please check the API key permissions."
                    elif response.status_code == 429:
                        error_message = "Too many requests to seats.aero API. Please try again later."
                    elif response.status_code >= 500:
                        error_message = "The seats.aero API is currently experiencing issues. Please try again later."
                    
                    logger.error(f"API request failed with status {response.status_code}: {response.text}")
                    return {
                        "status": "error",
                        "message": error_message,
                        "data": []
                    }
                
                # Parse the response
                data = response.json()
                logger.info(f"API Response - Data: {json.dumps(data)[:500]}...")
                
                # If no results and the date is specific, try a 7-day range
                if data.get("count", 0) == 0 and len(data.get("data", [])) == 0:
                    logger.info("No results found with specific date, trying a date range")
                    
                    # Parse the original date
                    try:
                        from datetime import datetime, timedelta
                        original_date = datetime.strptime(date, "%Y-%m-%d")
                        
                        # Create a range from the date to 7 days later
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
                        
                        # Log response info
                        logger.info(f"Range API Response - Status: {response.status_code}")
                        
                        if response.status_code == 200:
                            data = response.json()
                            logger.info(f"Range API Response - Data: {json.dumps(data)[:500]}...")
                        else:
                            logger.error(f"Range API request failed: {response.status_code}")
                    except Exception as date_err:
                        logger.error(f"Error creating date range: {str(date_err)}")
                
                # Format the response to match our expected structure
                if "data" in data and isinstance(data["data"], list):
                    # Map the seats.aero flights to our expected format
                    mapped_flights = map_seats_aero_flights(data["data"], cabin_class)
                    return {
                        "status": "success",
                        "count": len(mapped_flights),
                        "flights": mapped_flights
                    }
                else:
                    # Return the original response if it doesn't match our expected format
                    mapped_flights = map_seats_aero_flights(data.get("data", []), cabin_class)
                    return {
                        "status": "success",
                        "count": len(mapped_flights),
                        "flights": mapped_flights
                    }
            except httpx.TimeoutException:
                logger.error("API request timed out")
                return {
                    "status": "error",
                    "message": "API request timed out. The seats.aero API may be experiencing high load.",
                    "data": []
                }
    except Exception as e:
        logger.error(f"Error fetching award flights: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return {
            "status": "error",
            "message": str(e),
            "data": []
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
    destination_country: Optional[str] = Query(None, description="Destination country")
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
        
        return flights
    except Exception as e:
        logger.error(f"Error searching award flights: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/trips/{trip_id}")
async def get_trip_details(trip_id: str):
    """
    Get detailed trip information from the seats.aero API
    
    Args:
        trip_id: The trip ID from a previous search
        
    Returns:
        Dictionary with trip details
    """
    logger.info(f"Getting trip details for ID: {trip_id}")
    
    try:
        # Get API key from environment variable
        api_key = os.getenv("SEATS_AERO_API_KEY")
        if not api_key:
            logger.error("Missing SEATS_AERO_API_KEY environment variable")
            raise HTTPException(status_code=500, detail="Missing API key for seats.aero")
        
        # Set up headers
        headers = {
            "Partner-Authorization": api_key,
            "Accept": "application/json"
        }
        
        # Log the API request
        url = f"https://seats.aero/partnerapi/trips/{trip_id}"
        logger.info(f"API Request - URL: {url}")
        logger.info(f"API Request - Headers: {json.dumps({k: '***' if k == 'Partner-Authorization' else v for k, v in headers.items()})}")
        
        # Make the request to seats.aero API
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(
                    url,
                    headers=headers,
                    timeout=30.0
                )
                
                # Log the response
                logger.info(f"API Response - Status: {response.status_code}")
                logger.info(f"API Response - Headers: {json.dumps(dict(response.headers))}")
                logger.info(f"API Response - URL: {response.url}")
                
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
                data = response.json()
                logger.info(f"API Response - Data: {json.dumps(data)[:500]}...")
                
                # Check if data is empty
                if not data or (isinstance(data, dict) and not data.get("data")):
                    logger.warning(f"No trip details found for ID: {trip_id}")
                    raise HTTPException(status_code=404, detail=f"No trip details found for ID: {trip_id}")
                
                # Return the data
                return data
                
            except httpx.TimeoutException:
                logger.error(f"API request timed out for trip ID: {trip_id}")
                raise HTTPException(
                    status_code=504,
                    detail="API request timed out. The seats.aero API may be experiencing high load."
                )
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error getting trip details: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bulk-availability")
async def get_bulk_availability(
    source: str = Query(..., description="The mileage program to search (e.g., 'united', 'delta')"),
    cabin_class: str = Query("economy", description="Cabin class"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    origin_region: Optional[str] = Query(None, description="Origin region filter (e.g., 'North America')")
):
    """
    Get bulk availability data from a specific mileage program
    
    This endpoint allows for querying large amounts of availability data across regions
    or date ranges from a specific mileage program.
    
    Args:
        source: The mileage program (e.g., "united", "delta")
        cabin_class: Cabin class preference (economy, premium, business, first)
        start_date: Optional start date in YYYY-MM-DD format
        end_date: Optional end date in YYYY-MM-DD format
        origin_region: Optional region filter (e.g., "North America")
        
    Returns:
        JSON object with availability data
    """
    logger.info(f"Getting bulk availability for source: {source}, cabin: {cabin_class}")
    
    try:
        # Get API key from environment variable
        api_key = os.getenv("SEATS_AERO_API_KEY")
        if not api_key:
            logger.error("Missing SEATS_AERO_API_KEY environment variable")
            raise HTTPException(status_code=500, detail="Missing API key for seats.aero")
        
        # Prepare parameters according to seats.aero documentation
        params = {
            "source": source
        }
        
        # Add optional parameters if provided
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
        
        # Set up headers
        headers = {
            "Partner-Authorization": api_key,
            "Accept": "application/json"
        }
        
        # Log the API request
        url = f"https://seats.aero/partnerapi/availability"
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
                    timeout=45.0  # Longer timeout for bulk operations
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
                data = response.json()
                logger.info(f"API Response - Data summary: Found {len(data.get('data', []))} results")
                
                # Return the data
                return {
                    "status": "success", 
                    "count": len(data.get("data", [])),
                    "data": data.get("data", [])
                }
                
            except httpx.TimeoutException:
                logger.error("Bulk availability API request timed out")
                raise HTTPException(
                    status_code=504,
                    detail="API request timed out. Bulk availability requests may take longer to process."
                )
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error getting bulk availability: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

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