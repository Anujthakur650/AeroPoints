#!/usr/bin/env python3
"""
Airport Search API Test Script
This script tests the airport search API with various types of queries.
"""

import requests
import json
import sys
from termcolor import colored
import time

BASE_URL = "http://localhost:8000"

def print_header(message):
    """Print a formatted header message."""
    print("\n" + "=" * 80)
    print(colored(f" {message} ", "white", "on_blue", attrs=["bold"]))
    print("=" * 80)

def print_result(test_name, success, message="", data=None):
    """Print a formatted test result."""
    if success:
        print(colored(f"✓ {test_name}: PASS", "green"))
    else:
        print(colored(f"✗ {test_name}: FAIL - {message}", "red"))
        
    if data and not success:
        print(colored("  Response data:", "yellow"))
        if isinstance(data, dict) or isinstance(data, list):
            print(json.dumps(data, indent=2))
        else:
            print(f"  {data}")

def test_health_endpoint():
    """Test the health endpoint to ensure the API is running."""
    print_header("Testing Health Endpoint")
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            if data.get("status") == "healthy":
                print_result("Health Check", True)
                return True
            else:
                print_result("Health Check", False, "Status is not 'healthy'", data)
        else:
            print_result("Health Check", False, f"Status code {response.status_code}", response.text)
    except Exception as e:
        print_result("Health Check", False, str(e))
    return False

def test_airport_search(query, expected_count=None, test_name=None):
    """Test the airport search endpoint with the given query."""
    if not test_name:
        test_name = f"Search for '{query}'"
    print(f"\n> Testing: {test_name}")
    
    try:
        url = f"{BASE_URL}/api/airports/search?q={query}&limit=5"
        print(f"  Request: GET {url}")
        
        start_time = time.time()
        response = requests.get(url)
        elapsed = time.time() - start_time
        
        print(f"  Response time: {elapsed:.3f} seconds")
        
        if response.status_code == 200:
            data = response.json()
            actual_count = data.get("count", 0)
            
            # Check if expected count was provided and matches
            if expected_count is not None and actual_count != expected_count:
                print_result(test_name, False, 
                             f"Expected {expected_count} results, got {actual_count}", data)
                return False
            
            # Print summary of results
            print(f"  Found {actual_count} results:")
            if actual_count > 0:
                for i, airport in enumerate(data.get("data", [])[:5]):
                    print(f"  {i+1}. {airport.get('iata', 'N/A')} - "
                          f"{airport.get('city', 'N/A')}, {airport.get('country', 'N/A')} "
                          f"({airport.get('name', 'N/A')})")
            
            print_result(test_name, True)
            return True
        else:
            print_result(test_name, False, f"Status code {response.status_code}", response.text)
    except Exception as e:
        print_result(test_name, False, str(e))
    return False

def run_tests():
    """Run all tests."""
    # First check if the server is running
    if not test_health_endpoint():
        print(colored("\nERROR: API server does not appear to be running. Please start it first.", "red"))
        sys.exit(1)
    
    print_header("Testing Airport Search API")
    
    # Test exact IATA code match
    test_airport_search("SFO", test_name="Exact IATA code (SFO)")
    
    # Test city search
    test_airport_search("New York", test_name="City name search (New York)")
    
    # Test multi-word search
    test_airport_search("San Francisco", test_name="Multi-word city search (San Francisco)")
    
    # Test partial search
    test_airport_search("frank", test_name="Partial match (frank) for Frankfurt")
    
    # Test case insensitivity
    test_airport_search("PARIS", test_name="Case insensitive search (PARIS)")
    
    # Test special characters
    test_airport_search("São Paulo", test_name="Special characters (São Paulo)")
    
    # Test with minimum characters (should return results)
    test_airport_search("LA", test_name="Minimum character search (LA)")
    
    # Test with fewer than minimum characters (should not return results)
    test_airport_search("A", test_name="Too short query (A) - should be rejected")
    
    print("\nAll tests completed!")

if __name__ == "__main__":
    run_tests() 