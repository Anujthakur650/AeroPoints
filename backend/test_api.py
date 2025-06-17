#!/usr/bin/env python3
import asyncio
import os
import json
from award_flight_api import award_flight_api

async def test_get_flights():
    """Test the get_award_flights method"""
    print("Testing award_flight_api.get_award_flights")
    
    # Call the get_award_flights method
    flights = await award_flight_api.get_award_flights(
        "SFO", 
        "JFK", 
        "2025-05-15", 
        "united", 
        "economy"
    )
    
    # Print the results
    print(f"Got {len(flights)} flights")
    if flights:
        print("\nSample flight:")
        print(json.dumps(flights[0], indent=2))
        
        # Print miles values statistics
        print("\nPoints (miles) distribution:")
        miles_counts = {}
        for flight in flights:
            miles = flight.get('points', 0)
            if miles in miles_counts:
                miles_counts[miles] += 1
            else:
                miles_counts[miles] = 1
        
        for miles, count in sorted(miles_counts.items()):
            print(f"  {miles} miles: {count} flights")
        
        # Print if data is real-time or simulated
        is_real_time = flights[0].get('realTimeData', False)
        print(f"\nData is {'real-time' if is_real_time else 'simulated'}")
    else:
        print("No flights returned")

if __name__ == "__main__":
    asyncio.run(test_get_flights()) 