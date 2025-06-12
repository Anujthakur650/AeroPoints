#!/usr/bin/env python3
"""
Award Flight API Client
Connects to a real flight data API to get award flight information
"""

import os
import json
import requests
import logging
import time
from datetime import datetime
import traceback
import random
import importlib.util
import asyncio
import threading
import uuid

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    handlers=[
        logging.FileHandler("logs/award_flight_api.log", mode='a'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class AwardFlightAPI:
    """Client for fetching real award flight data"""
    
    def __init__(self):
        self.api_key = os.environ.get('AWARD_FLIGHT_API_KEY', '')
        self.base_url = "https://api.flightavailability.io/v1"
        
        # Get the current directory
        self.current_dir = os.path.dirname(os.path.abspath(__file__))
        self.project_root = os.path.abspath(os.path.join(self.current_dir, '..'))
        
        # Use absolute paths
        self.cache_dir = os.path.join(self.project_root, "data/cache")
        self.data_dir = os.path.join(self.project_root, "data")
        
        # Create all necessary directories
        os.makedirs(self.cache_dir, exist_ok=True)
        os.makedirs(self.data_dir, exist_ok=True)
        
        logger.info(f"Initialized AwardFlightAPI with data_dir: {self.data_dir}")
    
    async def get_award_flights(self, origin, destination, date, airline=None, cabin_class=None, force_crawl=False):
        """Get award flight data for a specific route and date"""
        # Create cache directory if it doesn't exist
        os.makedirs(self.cache_dir, exist_ok=True)
        
        # Check if there's a current united_flight_data.json file
        united_file = os.path.join(self.data_dir, "united_flight_data.json")
        
        # Continue with the regular flow if the above fails
        # Create directories for this specific route if they don't exist
        dest_dir = os.path.join(self.data_dir, f"flight_data_{origin}_{destination}_{date.replace('/', '_')}")
        os.makedirs(dest_dir, exist_ok=True)
        
        # Check if data exists in cache first
        cache_key = f"{origin}-{destination}-{date}"
        if airline:
            cache_key += f"-{airline}"
        if cabin_class:
            cache_key += f"-{cabin_class}"
        
        cache_file = os.path.join(self.cache_dir, f"{cache_key}.json")
        
        # Check for fresh data (less than 30 minutes old)
        if os.path.exists(cache_file):
            file_age = time.time() - os.path.getmtime(cache_file)
            if file_age < 1800:  # 30 minutes in seconds
                logger.info(f"Found cached data for {cache_key}, file age: {file_age:.1f} seconds")
                try:
                    with open(cache_file, 'r') as f:
                        flights = json.load(f)
                    
                    if flights and len(flights) > 0 and flights[0].get("realTimeData", False):
                        logger.info(f"Using cached real-time data with {len(flights)} flights")
                        return flights
                    else:
                        logger.info("Cached data exists but not using it (not real-time data)")
                except Exception as e:
                    logger.error(f"Error reading cached data: {str(e)}")
        
        # Generate fresh data
        logger.info(f"Generating fresh real-time data for {cache_key}")
        
        # Use seats.aero API for flight data
        logger.info("Using seats.aero API for real-time flight data")
        
        try:
            # Get API key from environment variable
            api_key = os.getenv("SEATS_AERO_API_KEY")
            if not api_key:
                logger.error("Missing SEATS_AERO_API_KEY environment variable")
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
            
            # Make the API request using requests
            response = requests.get(url, headers=headers, params=params, timeout=30.0)
            
            # Log response info
            logger.info(f'API Response - Status: {response.status_code}')
            
            if response.status_code != 200:
                logger.error(f'API request failed: {response.status_code} {response.reason}')
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
            
            # Cache the results only if they are real-time data
            if mapped_flights and len(mapped_flights) > 0:
                logger.info(f"Caching {len(mapped_flights)} flights to {cache_file}")
                try:
                    os.makedirs(os.path.dirname(cache_file), exist_ok=True)
                    with open(cache_file, 'w') as f:
                        json.dump(mapped_flights, f, indent=2)
                except Exception as e:
                    logger.error(f"Error caching data: {str(e)}")
            
            logger.info(f'Successfully mapped {len(mapped_flights)} flights from seats.aero API')
            return mapped_flights
            
        except Exception as e:
            logger.error(f'Error fetching flights from seats.aero: {str(e)}')
            logger.error(traceback.format_exc())
            return []
    
# Create singleton instance
award_flight_api = AwardFlightAPI()