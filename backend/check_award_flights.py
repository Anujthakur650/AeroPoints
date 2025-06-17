#!/usr/bin/env python3
"""
Award Flight Data Checker
Utility to check real-time award flight data
"""

import os
import sys
import json
import logging
import argparse
from datetime import datetime, timedelta

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s: %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def check_award_flights(origin, destination, date=None, airline=None, cabin_class=None):
    """Check award flight availability using the API"""
    
    # Set default date to tomorrow if not provided
    if not date:
        tomorrow = datetime.now() + timedelta(days=1)
        date = tomorrow.strftime("%Y-%m-%d")
    
    try:
        # Import the award flight API module
        import importlib.util
        
        # Find the API module
        api_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'award_flight_api.py')
        if not os.path.exists(api_path):
            logger.error(f"Award flight API module not found at {api_path}")
            return False
        
        # Dynamically import the module
        spec = importlib.util.spec_from_file_location("award_flight_api", api_path)
        award_flight_api_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(award_flight_api_module)
        
        # Get the API client
        api_client = award_flight_api_module.award_flight_api
        
        # Call the API to get flight data
        logger.info(f"Checking award flights for {origin} to {destination} on {date}")
        if airline:
            logger.info(f"Filtering by airline: {airline}")
        if cabin_class:
            logger.info(f"Filtering by cabin class: {cabin_class}")
        
        flights = api_client.get_award_flights(
            origin=origin,
            destination=destination,
            date=date,
            airline=airline,
            cabin_class=cabin_class
        )
        
        if not flights or len(flights) == 0:
            logger.warning("No award flights found")
            return False
        
        # Print summary of flights found
        logger.info(f"Found {len(flights)} award flights:")
        
        # Group by airline
        airlines = {}
        for flight in flights:
            airline_name = flight["airline"]
            if airline_name not in airlines:
                airlines[airline_name] = []
            airlines[airline_name].append(flight)
        
        # Print summary by airline
        for airline_name, airline_flights in airlines.items():
            logger.info(f"  {airline_name}: {len(airline_flights)} flights")
            
            # Group by cabin class
            cabins = {}
            for flight in airline_flights:
                cabin = flight["cabinClass"]
                if cabin not in cabins:
                    cabins[cabin] = []
                cabins[cabin].append(flight)
            
            # Print summary by cabin class
            for cabin, cabin_flights in cabins.items():
                logger.info(f"    {cabin}: {len(cabin_flights)} flights")
                
                # Calculate average points
                avg_points = sum(flight["points"] for flight in cabin_flights) / len(cabin_flights)
                logger.info(f"      Avg. Points: {int(avg_points)}")
                
                # Print earliest and latest flight times
                times = sorted([flight["departureTime"] for flight in cabin_flights])
                logger.info(f"      Flight times: {times[0]} to {times[-1]}")
        
        # Save the data to a file
        os.makedirs("data", exist_ok=True)
        output_file = f"data/award_flights_{origin}_{destination}_{date}.json"
        with open(output_file, "w") as f:
            json.dump({"flights": flights}, f, indent=2)
        
        logger.info(f"Flight data saved to {output_file}")
        return True
        
    except Exception as e:
        logger.error(f"Error checking award flights: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return False

if __name__ == "__main__":
    # Parse command line arguments
    parser = argparse.ArgumentParser(description="Check award flight availability")
    parser.add_argument("--origin", "-o", required=True, help="Origin airport code (e.g., SFO)")
    parser.add_argument("--destination", "-d", required=True, help="Destination airport code (e.g., JFK)")
    parser.add_argument("--date", "-t", help="Flight date in YYYY-MM-DD format (default: tomorrow)")
    parser.add_argument("--airline", "-a", help="Filter by airline code (e.g., UA)")
    parser.add_argument("--cabin", "-c", help="Filter by cabin class (economy, business, first)")
    
    args = parser.parse_args()
    
    # Run the check
    check_award_flights(
        origin=args.origin,
        destination=args.destination,
        date=args.date,
        airline=args.airline,
        cabin_class=args.cabin
    ) 