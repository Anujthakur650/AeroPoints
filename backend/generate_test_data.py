#!/usr/bin/env python3
"""
Generate Test Flight Data
Creates realistic flight data for testing the frontend
"""

import os
import json
import random
import logging
from datetime import datetime, timedelta
import sys

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(levelname)s - %(message)s',
    datefmt='%H:%M:%S',
    handlers=[logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

# Constants
AIRLINES = ["United Airlines"]
AIRCRAFT = ["Boeing 737", "Boeing 787", "Airbus A320"]
FARE_CLASSES = ["Economy", "Business", "First"]
OUTPUT_FILE = "../data/united_flight_data.json"

def generate_flight_times(date_str):
    """Generate realistic departure and arrival times for flights"""
    # Create time slots throughout the day
    departure_hours = [
        "00:10", "05:04", "06:00", "09:00", "10:35", "11:35", 
        "13:05", "13:30", "15:15", "16:20", "17:55", "18:45",
        "21:10", "21:25", "23:00", "23:20", "23:40"
    ]
    
    # Pick a random departure time
    departure_time = random.choice(departure_hours)
    
    # Calculate arrival time (flight duration between 4h 30m and 6h 30m for transcontinental)
    dep_hour, dep_min = map(int, departure_time.split(':'))
    flight_duration_mins = random.randint(270, 390)  # 4h30m to 6h30m
    
    # Calculate arrival time
    arrival_mins = (dep_hour * 60 + dep_min + flight_duration_mins) % (24 * 60)
    arr_hour, arr_min = divmod(arrival_mins, 60)
    arrival_time = f"{arr_hour:02d}:{arr_min:02d}"
    
    # Calculate duration string
    hours, mins = divmod(flight_duration_mins, 60)
    duration = f"{hours}h {mins:02d}m"
    
    return departure_time, arrival_time, duration

def generate_flight_number(airline):
    """Generate a realistic flight number"""
    if airline == "United Airlines":
        return f"UA{random.randint(1, 9999):04d}"
    return None

def generate_miles_amount():
    """Generate a realistic miles amount for award flights"""
    # Distribution of miles based on actual United MileagePlus award pricing
    miles_options = [
        (5000, 0.25),   # Saver Economy
        (6000, 0.1),
        (7000, 0.05),
        (8000, 0.15),
        (9000, 0.15),
        (15000, 0.1),   # Standard Economy
        (22000, 0.05),
        (25000, 0.05),
        (30000, 0.05),  # Business/First
        (50000, 0.05)   # Premium Business/First
    ]
    
    miles_values, weights = zip(*miles_options)
    return random.choices(miles_values, weights=weights, k=1)[0]

def generate_flights(origin, destination, date_str, num_flights=20):
    """Generate a list of flight data for testing"""
    flights = []
    
    for _ in range(num_flights):
        airline = "United Airlines"  # We're focusing on United
        flight_number = generate_flight_number(airline)
        departure_time, arrival_time, duration = generate_flight_times(date_str)
        stops = random.choices([0, 1], weights=[0.7, 0.3], k=1)[0]  # 70% nonstop, 30% one-stop
        connecting_airport = None
        
        if stops > 0:
            connecting_options = ["ORD", "IAH", "DEN", "EWR"] 
            connecting_airport = random.choice(connecting_options)
        
        miles = generate_miles_amount()
        formatted_miles = f"{miles} miles" if miles < 10000 else f"{miles//1000}K miles"
        
        flight = {
            "airline": airline,
            "flightNumber": flight_number,
            "aircraft": random.choice(AIRCRAFT),
            "fareClass": "Economy",  # Focusing on economy
            "departure": {
                "airport": origin,
                "city": "San Francisco" if origin == "SFO" else origin,
                "time": departure_time,
                "date": date_str
            },
            "arrival": {
                "airport": destination,
                "city": "New York" if destination == "JFK" else destination,
                "time": arrival_time,
                "date": date_str
            },
            "price": {
                "amount": miles,
                "currency": "miles",
                "type": "miles",
                "formatted": formatted_miles,
                "taxes": {
                    "amount": round(5.6, 2),
                    "currency": "USD",
                    "formatted": f"${5.6:.1f}"
                }
            },
            "duration": duration,
            "stops": stops,
            "seatsAvailable": random.randint(1, 9),
            "connectingAirport": connecting_airport
        }
        
        flights.append(flight)
    
    # Sort flights by departure time
    flights.sort(key=lambda x: x["departure"]["time"])
    
    return flights

def main():
    """Main function to generate and save flight data"""
    try:
        # Default parameters
        origin = "SFO"
        destination = "JFK"
        date_str = "2025-05-15"
        num_flights = 22
        
        # Override with command line arguments if provided
        if len(sys.argv) > 1:
            origin = sys.argv[1]
        if len(sys.argv) > 2:
            destination = sys.argv[2]
        if len(sys.argv) > 3:
            date_str = sys.argv[3]
        if len(sys.argv) > 4:
            num_flights = int(sys.argv[4])
        
        logger.info(f"Generating {num_flights} flights from {origin} to {destination} on {date_str}")
        
        # Generate flight data
        flights = generate_flights(origin, destination, date_str, num_flights)
        
        # Ensure the data directory exists
        os.makedirs(os.path.dirname(os.path.abspath(OUTPUT_FILE)), exist_ok=True)
        
        # Save to JSON file
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            json.dump(flights, f, indent=2)
        
        logger.info(f"Successfully generated {len(flights)} flights and saved to {OUTPUT_FILE}")
        
        # Show sample
        logger.info(f"Sample flight: {json.dumps(flights[0], indent=2)}")
        
        # Show distribution of miles
        miles_counts = {}
        for flight in flights:
            miles = flight["price"]["amount"]
            miles_counts[miles] = miles_counts.get(miles, 0) + 1
        
        logger.info("Miles distribution:")
        for miles, count in sorted(miles_counts.items()):
            logger.info(f"  {miles} miles: {count} flights")
        
        return 0
    
    except Exception as e:
        logger.error(f"Error generating flight data: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main()) 