#!/usr/bin/env python3
"""Test script for seats.aero API"""

import httpx
import json
import asyncio
import os

async def test_seats_aero_api():
    """Test the seats.aero API directly"""
    print("Testing seats.aero API...")
    
    # Use the API key
    api_key = "pro_2vBhuwUREHzehxX0XIIV4cei95s"
    
    # Set up headers
    headers = {
        "Partner-Authorization": api_key,
        "Accept": "application/json"
    }
    
    try:
        # Create a client for all requests
        async with httpx.AsyncClient() as client:
            # First try to get routes
            url = "https://seats.aero/partnerapi/routes"
            params = {
                "source": "united"  # Try just getting routes for United Airlines
            }
            
            print(f"Making request to {url} with params: {params}")
            
            response = await client.get(
                url,
                params=params,
                headers=headers,
                timeout=30.0
            )
            
            # Print the response status
            print(f"Response status: {response.status_code}")
            
            # If successful, process the routes data
            if response.status_code == 200:
                data = response.json()
                print(f"Raw data type: {type(data)}")
                
                # Print a sample of the response to see its structure
                print("Sample of routes response:")
                print(json.dumps(data, indent=2)[:1000] + "...")
                
                # Try to extract routes based on the actual structure
                routes = []
                if isinstance(data, dict) and 'data' in data:
                    routes = data['data']
                elif isinstance(data, list):
                    routes = data
                    
                print(f"Extracted {len(routes)} routes")
                
                # Print the first 5 routes if any
                if routes and len(routes) > 0:
                    print("\nFirst 5 routes:")
                    for i, route in enumerate(routes[:5]):
                        origin = route.get('OriginAirport', route.get('origin', ''))
                        dest = route.get('DestinationAirport', route.get('destination', ''))
                        print(f"{i+1}. {origin} → {dest}")
                    
                    print("\nNow trying to search for a popular route from the list...")
                    
                    # Try some routes that are likely to have availability
                    test_routes = [
                        # Try some popular domestic US routes
                        {"origin": "SFO", "destination": "LAX"},
                        {"origin": "JFK", "destination": "LAX"},
                        {"origin": "ORD", "destination": "DFW"},
                        # Try some international routes
                        {"origin": "JFK", "destination": "LHR"},
                        {"origin": "SFO", "destination": "NRT"}
                    ]
                    
                    # First try some predefined popular routes
                    for route_pair in test_routes:
                        origin = route_pair["origin"]
                        dest = route_pair["destination"]
                        
                        # Now search for flights on this route
                        search_params = {
                            "origin_airport": origin,
                            "destination_airport": dest,
                            "start_date": "2024-07-01",
                            "end_date": "2024-07-31",  # Try a whole month
                            "cabin": "economy"
                        }
                        
                        search_url = "https://seats.aero/partnerapi/search"
                        print(f"Searching for flights: {origin} → {dest}")
                        
                        search_response = await client.get(
                            search_url,
                            params=search_params,
                            headers=headers,
                            timeout=30.0
                        )
                        
                        print(f"Search response status: {search_response.status_code}")
                        
                        if search_response.status_code == 200:
                            search_data = search_response.json()
                            flights = search_data.get('data', [])
                            print(f"Found {len(flights)} flights")
                            if len(flights) > 0:
                                print(json.dumps(search_data, indent=2)[:1000] + "...")
                                return  # Exit if we found flights
                else:
                    print("No routes found.")
            else:
                print(f"Error: {response.text}")
                
    except Exception as e:
        import traceback
        print(f"Error making request: {str(e)}")
        print(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(test_seats_aero_api()) 