#!/usr/bin/env python3
"""
Simple script to test the Seats.aero API client directly.
Usage: python test_client.py
"""

import json
from utils.seats_aero_client import get_available_routes, search_award_flights

def pretty_print_json(data):
    """Print JSON data in a readable format."""
    print(json.dumps(data, indent=2))

def test_routes():
    """Test fetching available routes."""
    print("Fetching available routes...")
    routes = get_available_routes()
    
    if "error" in routes:
        print("Error fetching routes:")
        pretty_print_json(routes["error"])
        return False
    
    print("Successfully fetched routes:")
    pretty_print_json(routes)
    return True

def test_search():
    """Test searching for award flights."""
    # Example search parameters
    origin = "JFK"
    destination = "LHR"
    date = "2023-12-25"  # Use a future date in YYYY-MM-DD format
    
    print(f"Searching for award flights from {origin} to {destination} on {date}...")
    results = search_award_flights(
        origin=origin,
        destination=destination,
        date=date
    )
    
    if "error" in results:
        print("Error searching for flights:")
        pretty_print_json(results["error"])
        return False
    
    print("Successfully fetched flight results:")
    pretty_print_json(results)
    return True

if __name__ == "__main__":
    print("Testing Seats.aero API client...")
    
    # Test getting routes
    routes_success = test_routes()
    
    print("\n" + "-" * 50 + "\n")
    
    # Test searching for flights
    if routes_success:
        search_success = test_search()
    else:
        print("Skipping search test due to route fetch failure.")
    
    print("\nTests completed.") 