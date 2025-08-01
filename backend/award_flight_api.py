#!/usr/bin/env python3
"""
Award Flight API Client
Connects to Seats.aero API to get real-time award flight availability
"""

import os
import json
import requests
import logging
import time
from datetime import datetime
import traceback
from dotenv import load_dotenv

# Load environment variables from parent directory
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(parent_dir, '.env')
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    # Try loading from current directory
    load_dotenv()

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
    
    async def fetch_trip_details(self, availability_id, api_key):
        """Fetch detailed trip information for a given availability ID"""
        try:
            url = f'https://seats.aero/partnerapi/trips/{availability_id}'
            headers = {
                'Partner-Authorization': api_key,
                'Accept': 'application/json'
            }
            
            response = requests.get(url, headers=headers, timeout=30.0)
            
            if response.status_code != 200:
                logger.error(f'Trip details API request failed: {response.status_code}')
                return []
            
            trip_data = response.json()
            return trip_data.get('data', [])
        except Exception as e:
            logger.error(f'Error fetching trip details: {str(e)}')
            return []
    
    async def get_award_flights(self, origin, destination, date, airline=None, cabin_class=None):
        """Get award flight data for a specific route and date"""
        # Create cache directory if it doesn't exist
        os.makedirs(self.cache_dir, exist_ok=True)
        
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
            
            logger.info(f'Found {len(flights_data)} availability results in seats.aero API response')
            
            # Map the seats.aero response to our Flight structure
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
            
            # Fetch trip details for each availability ID and create individual flight objects
            for availability in flights_data:
                try:
                    availability_id = availability.get('ID')
                    source = availability.get('Source', 'unknown')
                    airline_name = airline_map.get(source.lower(), source)
                    
                    # Get basic availability data
                    route = availability.get('Route', {})
                    origin_code = route.get('OriginAirport', origin)
                    dest_code = route.get('DestinationAirport', destination)
                    
                    # Check if requested airline matches (if airline filter is specified)
                    if airline and source.lower() != airline.lower():
                        continue
                    
                    # Check cabin availability
                    cabin_indicator = {
                        'economy': 'Y',
                        'premium-economy': 'W',
                        'business': 'J', 
                        'first': 'F'
                    }.get(cabin_class.lower() if cabin_class else 'economy', 'Y')
                    
                    # Get price info from availability data
                    base_points = availability.get(f'{cabin_indicator}MileageCost', 0)
                    base_taxes = (availability.get(f'{cabin_indicator}TotalTaxes', 0) or 0) / 100
                    base_seats = availability.get(f'{cabin_indicator}RemainingSeats', 1)
                    
                    # Skip if not available for requested cabin
                    if cabin_class and not availability.get(f'{cabin_indicator}Available', False):
                        continue
                    
                    # Fetch trip details
                    if availability_id:
                        logger.info(f'Fetching trip details for availability ID: {availability_id} ({airline_name})')
                        trip_details = await self.fetch_trip_details(availability_id, api_key)
                        logger.info(f'Found {len(trip_details)} trip options for {availability_id}')
                        
                        # Create a flight object for EACH trip option
                        for trip in trip_details:
                            try:
                                # Skip if cabin doesn't match requested
                                if cabin_class and trip.get('Cabin', '').lower() != cabin_class.lower():
                                    continue
                                
                                # Format duration
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
                                        
                                        if current_arrival and next_departure:
                                            try:
                                                arr_dt = datetime.fromisoformat(current_arrival.replace('Z', '+00:00'))
                                                dep_dt = datetime.fromisoformat(next_departure.replace('Z', '+00:00'))
                                                duration_delta = dep_dt - arr_dt
                                                hours = int(duration_delta.total_seconds() // 3600)
                                                minutes = int((duration_delta.total_seconds() % 3600) // 60)
                                                layover_duration = f"{hours}h {minutes}m"
                                            except Exception as e:
                                                logger.debug(f"Error calculating layover: {e}")
                                        
                                        layovers.append({
                                            'airport': segments[i].get('DestinationAirport', ''),
                                            'duration': layover_duration
                                        })
                                
                                # Use trip-specific pricing if available, otherwise use base pricing
                                trip_points = trip.get('MileageCost', base_points)
                                trip_taxes = trip.get('TotalTaxes', base_taxes * 100) / 100 if trip.get('TotalTaxes') is not None else base_taxes
                                trip_seats = trip.get('RemainingSeats', base_seats)
                                
                                # Create flight object
                                mapped_flight = {
                                    'id': trip.get('ID', ''),
                                    'availabilityId': availability_id,
                                    'airline': airline_name,
                                    'flightNumber': trip.get('FlightNumbers', ''),
                                    'origin': trip.get('OriginAirport', origin_code),
                                    'destination': trip.get('DestinationAirport', dest_code),
                                    'departureTime': trip.get('DepartsAt', ''),
                                    'arrivalTime': trip.get('ArrivesAt', ''),
                                    'duration': duration_str,
                                    'durationMinutes': duration_minutes,
                                    'cabinClass': trip.get('Cabin', cabin_class or 'economy'),
                                    'points': trip_points,
                                    'cash': trip_taxes,
                                    'seatsAvailable': trip_seats,
                                    'realTimeData': True,
                                    'lastUpdated': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                                    'layovers': layovers,
                                    'stops': trip.get('Stops', 0) or len(segments) - 1 if segments else 0,
                                    'aircraft': trip.get('Aircraft', []),
                                    'segments': segments,
                                    'source': source
                                }
                                
                                mapped_flights.append(mapped_flight)
                                
                            except Exception as trip_error:
                                logger.error(f'Error mapping trip: {str(trip_error)}')
                                continue
                    
                except Exception as availability_error:
                    logger.error(f'Error processing availability: {str(availability_error)}')
                    continue
            
            # Sort flights by points (best value first)
            mapped_flights.sort(key=lambda x: x.get('points', float('inf')))
            
            # Cache the results
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

award_flight_api = AwardFlightAPI()
