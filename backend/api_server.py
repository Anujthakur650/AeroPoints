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

# Fix the relative import
from award_flight_api import award_flight_api
# Fix the other relative import
from airport_service import airport_service

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

# Initialize FastAPI app
app = FastAPI(title="Award Flight API Server")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, limit to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
async def fetch_from_seats_aero(origin, destination, date, cabin_class=None):
    """Fetch flights directly from seats.aero API"""
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
            
            # Map the seats.aero response to our Flight structure
            mapped_flights = []
            for flight in flights_data:
                try:
                    # Extract basic flight information
                    flight_id = flight.get('ID', f'{origin}-{destination}-{len(mapped_flights)}')
                    source = flight.get('Source', 'unknown')
                    
                    # Map airline name from source code
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
                        'etihad': 'Etihad Airways'
                    }
                    airline = airline_map.get(source.lower(), source)
                    
                    # Extract cabin-specific price information
                    cabin_indicator = {
                        'economy': 'Y',
                        'premium-economy': 'W',
                        'business': 'J', 
                        'first': 'F'
                    }.get(cabin_class.lower() if cabin_class else 'economy', 'Y')
                    
                    available = flight.get(f'{cabin_indicator}Available', False)
                    
                    # Skip unavailable flights for the selected cabin
                    if not available:
                        continue
                        
                    points = flight.get(f'{cabin_indicator}MileageCost', 0)
                    taxes = (flight.get(f'{cabin_indicator}TotalTaxes', 0) or 0) / 100  # Convert cents to dollars
                    seats = flight.get(f'{cabin_indicator}RemainingSeats', 1)
                    
                    # Flight details
                    flight_number = flight.get('FlightNumber', f'{airline[:2]}{100 + len(mapped_flights)}')
                    route = flight.get('Route', {})
                    
                    # Get origin/destination from route if available
                    origin_code = route.get('OriginAirport', origin)
                    dest_code = route.get('DestinationAirport', destination)
                    
                    # Format the flight for our API
                    mapped_flight = {
                        'id': flight_id,
                        'airline': airline,
                        'flightNumber': flight_number,
                        'origin': origin_code,
                        'destination': dest_code,
                        'departureTime': '10:00 AM',  # Placeholder times
                        'arrivalTime': '12:00 PM',    # seats.aero basic API doesn't provide times
                        'duration': '2h 0m',          # Placeholder duration
                        'cabinClass': cabin_class or 'economy',
                        'points': points,
                        'cash': taxes,
                        'seatsAvailable': seats,
                        'realTimeData': True,
                        'lastUpdated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                        'layovers': []
                    }
                    mapped_flights.append(mapped_flight)
                except Exception as mapping_error:
                    logger.error(f'Error mapping flight: {str(mapping_error)}')
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
