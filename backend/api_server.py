#!/usr/bin/env python3
"""
API Server for Award Flight Data
Serves real-time flight data using the seats.aero API
"""

import os
import json
import random
from datetime import datetime
import logging
import time
import asyncio
import uvicorn
from fastapi import FastAPI, Query, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import traceback
import httpx
from dotenv import load_dotenv

# Load environment variables from parent directory
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(parent_dir, '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
    print(f"Loaded environment variables from {env_path}")
else:
    # Try loading from current directory
    load_dotenv()
    print("Loaded environment variables from current directory")

# Fix the relative import
from award_flight_api import award_flight_api
# Fix the other relative import
from airport_service import airport_service
# Import auth router
from routes.auth import router as auth_router
# Import database initialization
from db.users import init_db

# Set default port
PORT = 8000

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler("logs/api_server.log", mode='a'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize database on startup
logger.info("Initializing database...")
init_db()
logger.info("Database initialized successfully")

# Initialize FastAPI app
app = FastAPI(title="Award Flight API Server")

# Include routers
app.include_router(auth_router)

# Configure CORS for mobile and tunnel environments
def get_allowed_origins():
    """Dynamically determine allowed origins for CORS"""
    origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        # Current tunnel URLs
        "https://shaggy-drinks-join.loca.lt",
        "https://afraid-otters-start.loca.lt",
        # Allow all localtunnel subdomains
        "https://*.loca.lt",
        # Allow ngrok and other common tunneling services
        "https://*.ngrok.io",
        "https://*.ngrok-free.app",
        "https://*.tunnel.app",
        # Production domains
        "https://aeropoints.com",
        "https://www.aeropoints.com",
        "https://staging.aeropoints.com"
    ]
    
    # Add environment-specific origins
    env_origin = os.getenv('FRONTEND_URL')
    if env_origin:
        origins.append(env_origin)
    
    return origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_allowed_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "X-CSRFToken",
        "User-Agent",
        "Referer",
        "Origin"
    ],
    expose_headers=["*"],
    allow_origin_regex=r"https://.*\.loca\.lt|https://.*\.ngrok\.io|https://.*\.ngrok-free\.app"
)

# Ensure data directory exists
os.makedirs("data", exist_ok=True)
os.makedirs("data/cache", exist_ok=True)
os.makedirs("logs", exist_ok=True)

class FlightResponse(BaseModel):
    flights: List[Dict[str, Any]]
    total_flights: int
    real_time_data: bool
    last_updated: str

@app.get("/", tags=["Status"])
async def root():
    """Check if the API is running"""
    logger.info("Root endpoint accessed")
    return {
        "status": "online",
        "message": "Award Flight API server is running",
        "version": "1.0.0"
    }

@app.get("/health", tags=["Status"])
async def health_check():
    """Check if the API is healthy"""
    logger.info("Health check endpoint accessed")
    return {
        "status": "healthy",
        "message": "API is running"
    }

@app.get("/api/airports/search", tags=["Airports"])
async def search_airports(
    q: str = Query(..., description="Search query - airport code, name, or city", min_length=2),
    limit: int = Query(10, description="Maximum number of results to return", ge=1, le=50)
):
    """
    Search for airports by code, name, or city.
    
    Returns a list of matching airports sorted by relevance.
    """
    logger.info(f"Airport search: query='{q}', limit={limit}")
    try:
        # Search for airports using the airport service
        results = airport_service.search_airports(q, limit)
        
        # Log the results
        logger.info(f"Found {len(results)} airports matching '{q}'")
        if results:
            logger.info(f"First result: {results[0]}")
        
        # Return the results
        return {
            "status": "success",
            "count": len(results),
            "data": results
        }
    except Exception as e:
        logger.error(f"Error searching airports: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500,
            detail=f"Error searching airports: {str(e)}"
        )

@app.get("/api/search-awards", tags=["Flights"])
async def search_awards(
    origin: str,
    destination: str, 
    date: str,
    airline: str = None,
    cabin_class: str = None,
    passengers: int = 1
):
    """
    Search for award flights using seats.aero API
    This is the main endpoint used by the frontend search form
    """
    return await serve_flights(origin, destination, date, airline, cabin_class)

@app.get("/api/flights", tags=["Flights"])
async def serve_flights(
    origin: str,
    destination: str, 
    date: str,
    airline: str = None,
    cabin_class: str = None
):
    """
    Serve flight data for a specific route and date
    Uses seats.aero API to get real-time award flight availability data
    """
    logger.info(f"Serving flights: {origin} to {destination} on {date}")
    logger.info(f"Request parameters: airline={airline}, cabin_class={cabin_class}")
    
    try:
        try:
            # Get flights from award_flight_api which now uses seats.aero API
            logger.info("Calling award_flight_api.get_award_flights for fresh data")
            flights = await award_flight_api.get_award_flights(
                origin, 
                destination, 
                date, 
                airline, 
                cabin_class
            )
            
            if not flights or len(flights) == 0:
                # If no flights found or if there was an error, try direct seats.aero API
                logger.info("No flights from award_flight_api, trying direct seats.aero API")
                flights = await fetch_from_seats_aero(origin, destination, date, cabin_class)
        except Exception as api_error:
            logger.error(f"Error with award_flight_api: {str(api_error)}")
            # Fallback to direct seats.aero API
            logger.info("Falling back to direct seats.aero API due to error")
            flights = await fetch_from_seats_aero(origin, destination, date, cabin_class)
        
        # Log results
        logger.info(f"Returning {len(flights)} flights")
        if len(flights) > 0:
            logger.info(f"Sample flight: {flights[0]}")
            logger.info(f"Real-time data flag: {flights[0].get('realTimeData', False)}")
        else:
            logger.warning("No flights found for this route and date")
        
        # Format response
        response = {
            "flights": flights,
            "total_flights": len(flights),
            "real_time_data": flights[0].get('realTimeData', False) if len(flights) > 0 else False,
            "last_updated": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        
        return response
    
    except Exception as e:
        logger.error(f"Error serving flights: {str(e)}")
        logger.error(traceback.format_exc())
        raise HTTPException(
            status_code=500, 
            detail=f"Error fetching flight data: {str(e)}"
        )

# Helper function to fetch flights directly from seats.aero API
async def fetch_trip_details(availability_id, api_key):
    """Fetch detailed trip information for a given availability ID"""
    try:
        url = f'https://seats.aero/partnerapi/trips/{availability_id}'
        headers = {
            'Partner-Authorization': api_key,
            'Accept': 'application/json'
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, timeout=30.0)
            
            if response.status_code != 200:
                logger.error(f'Trip details API request failed: {response.status_code}')
                return []
            
            trip_data = response.json()
            return trip_data.get('data', [])
    except Exception as e:
        logger.error(f'Error fetching trip details: {str(e)}')
        return []

async def fetch_from_seats_aero(origin, destination, date, cabin_class=None):
    """Fetch flights directly from seats.aero API with trip details"""
    try:
        # Get API key from environment
        api_key = os.getenv('SEATS_AERO_API_KEY')
        if not api_key:
            logger.error('Missing SEATS_AERO_API_KEY environment variable')
            return []
            
        # Prepare request parameters
        url = 'https://seats.aero/partnerapi/search'
        headers = {
            'Partner-Authorization': api_key,
            'Accept': 'application/json'
        }
        params = {
            'origin_airport': origin,
            'destination_airport': destination,
            'start_date': date,
            'end_date': date  # Required by seats.aero API
        }
        
        # Map cabin class to expected format
        if cabin_class:
            cabin_map = {
                'economy': 'economy',
                'premium-economy': 'premium',
                'business': 'business',
                'first': 'first'
            }
            params['cabin'] = cabin_map.get(cabin_class.lower(), 'economy')
        
        logger.info(f'Requesting flights from seats.aero: {origin} to {destination} on {date}')
        logger.info(f'API Request - URL: {url}')
        logger.info(f'API Request - Headers: {json.dumps({k: "***" if k == "Partner-Authorization" else v for k, v in headers.items()})}')
        logger.info(f'API Request - Params: {json.dumps(params)}')
        
        # Make the API request using httpx
        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params, timeout=30.0)
            
            # Log response info
            logger.info(f'API Response - Status: {response.status_code}')
            
            if response.status_code != 200:
                logger.error(f'API request failed: {response.status_code} {response.reason_phrase}')
                return []
            
            # Parse the response
            data = response.json()
            flights_data = data.get('data', [])
            
            logger.info(f'Found {len(flights_data)} flights in seats.aero API response')
            
            # Now fetch trip details for each availability ID
            all_trip_details = []
            for flight in flights_data:
                availability_id = flight.get('ID')
                if availability_id:
                    source = flight.get('Source', 'unknown')
                    airline_name = airline_map.get(source.lower(), source)
                    logger.info(f'Fetching trip details for availability ID: {availability_id} ({airline_name})')
                    trip_details = await fetch_trip_details(availability_id, api_key)
                    
                    # Add basic flight info to each trip detail
                    for trip in trip_details:
                        trip['availability_data'] = flight
                    all_trip_details.extend(trip_details)
                    
                    logger.info(f'Found {len(trip_details)} trip options for {availability_id}')
            
            logger.info(f'Fetched {len(all_trip_details)} total trip details')
            
            # Map the trip details to our Flight structure
            mapped_flights = []
            airline_map = {
                'united': 'United Airlines',
                'delta': 'Delta Air Lines',
                'american': 'American Airlines',
                'aeroplan': 'Air Canada',
                'alaska': 'Alaska Airlines',
                'british': 'British Airways',
                'flyingblue': 'Air France-KLM',
                'iberia': 'Iberia',
                'virginatlantic': 'Virgin Atlantic',
                'emirates': 'Emirates',
                'etihad': 'Etihad Airways',
                'qatar': 'Qatar Airways',
                'qantas': 'Qantas',
                'jetblue': 'JetBlue',
                'smiles': 'GOL (Smiles)',
                'turkish': 'Turkish Airlines',
                'singapore': 'Singapore Airlines',
                'cathay': 'Cathay Pacific',
                'ana': 'ANA',
                'jal': 'Japan Airlines',
                'klm': 'KLM',
                'airfrance': 'Air France',
                'lufthansa': 'Lufthansa',
                'swiss': 'Swiss',
                'austrian': 'Austrian Airlines',
                'finnair': 'Finnair',
                'tap': 'TAP Air Portugal',
                'avianca': 'Avianca',
                'aeromexico': 'Aeromexico',
                'velocity': 'Virgin Australia'
            }
            
            for trip in all_trip_details:
                try:
                    # Skip if cabin doesn't match requested
                    if cabin_class and trip.get('Cabin', '').lower() != cabin_class.lower():
                        continue
                    
                    availability_data = trip.get('availability_data', {})
                    source = availability_data.get('Source', 'unknown')
                    
                    # Format duration from minutes to hours and minutes
                    duration_minutes = trip.get('TotalDuration', 0)
                    hours = duration_minutes // 60
                    minutes = duration_minutes % 60
                    duration_str = f"{hours}h {minutes}m" if duration_minutes > 0 else "N/A"
                    
                    # Parse segments for layover information
                    segments = trip.get('AvailabilitySegments', [])
                    layovers = []
                    if len(segments) > 1:
                        for i in range(len(segments) - 1):
                            current_arrival = segments[i].get('ArrivesAt', '')
                            next_departure = segments[i + 1].get('DepartsAt', '')
                            layover_duration = 'N/A'
                            
                            # Calculate layover duration if times are available
                            if current_arrival and next_departure:
                                try:
                                    arr_time = datetime.fromisoformat(current_arrival.replace('Z', '+00:00'))
                                    dep_time = datetime.fromisoformat(next_departure.replace('Z', '+00:00'))
                                    duration_delta = dep_time - arr_time
                                    hours = int(duration_delta.total_seconds() // 3600)
                                    minutes = int((duration_delta.total_seconds() % 3600) // 60)
                                    layover_duration = f"{hours}h {minutes}m"
                                except Exception as e:
                                    logger.debug(f"Error calculating layover duration: {e}")
                            
                            layovers.append({
                                'airport': segments[i].get('DestinationAirport', ''),
                                'duration': layover_duration
                            })
                    
                    # Format the flight for our API
                    mapped_flight = {
                        'id': trip.get('ID', ''),
                        'airline': airline_map.get(source.lower(), trip.get('Carriers', source)),
                        'flightNumber': trip.get('FlightNumbers', ''),
                        'origin': trip.get('OriginAirport', origin),
                        'destination': trip.get('DestinationAirport', destination),
                        'departureTime': trip.get('DepartsAt', ''),
                        'arrivalTime': trip.get('ArrivesAt', ''),
                        'duration': duration_str,
                        'durationMinutes': duration_minutes,
                        'cabinClass': trip.get('Cabin', cabin_class or 'economy'),
                        'points': trip.get('MileageCost', 0),
                        'cash': trip.get('TotalTaxes', 0) / 100 if trip.get('TotalTaxes') else 0,
                        'seatsAvailable': trip.get('RemainingSeats', 1),
                        'realTimeData': True,
                        'lastUpdated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                        'layovers': layovers,
                        'stops': trip.get('Stops', 0) or len(segments) - 1 if segments else 0,
                        'aircraft': trip.get('Aircraft', []),
                        'segments': segments
                    }
                    mapped_flights.append(mapped_flight)
                except Exception as mapping_error:
                    logger.error(f'Error mapping trip: {str(mapping_error)}')
                    continue
                    
            logger.info(f'Successfully mapped {len(mapped_flights)} flights from seats.aero API')
            return mapped_flights
        
    except Exception as e:
        logger.error(f'Error fetching flights from seats.aero: {str(e)}')
        logger.error(traceback.format_exc())
        return []

if __name__ == "__main__":
    # Print debug info
    print("Starting API server...")
    print(f"Airport service loaded with {len(airport_service.airports_by_iata)} airports")
    print("Available endpoints:")
    print("  - / (root): API status")
    print("  - /health: Health check")
    print("  - /api/airports/search: Search for airports")
    print("  - /api/flights: Get flight data")
    
    # Run the server
    uvicorn.run("api_server:app", host="0.0.0.0", port=PORT, reload=True)
