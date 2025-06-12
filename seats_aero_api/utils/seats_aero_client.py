import os
import requests
import json
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv()

# Get API key securely
SEATS_AERO_API_KEY = os.getenv("SEATS_AERO_API_KEY")
if not SEATS_AERO_API_KEY:
    raise ValueError("Missing SEATS_AERO_API_KEY environment variable")

# Base URL for the Seats.aero API
BASE_URL = "https://seats.aero/partnerapi"

def fetch_seats_aero_data(
    endpoint: str,
    params: Optional[Dict[str, Any]] = None,
    timeout: int = 30
) -> Dict[str, Any]:
    """
    Makes a request to the Seats.aero Partner API.
    
    Args:
        endpoint: API endpoint path (e.g., "/routes", "/search")
        params: Dictionary of query parameters
        timeout: Request timeout in seconds
        
    Returns:
        Parsed JSON response
        
    Raises:
        ValueError: If API key is missing or request parameters are invalid
        requests.RequestException: For network-related errors
    """
    # Construct the full URL
    url = f"{BASE_URL}/{endpoint.lstrip('/')}"
    
    # Set headers with API key and JSON response format
    headers = {
        "Partner-Authorization": SEATS_AERO_API_KEY,
        "Accept": "application/json"
    }
    
    # Print debug information
    print(f"API Request - URL: {url}")
    print(f"API Request - Headers: {json.dumps({k: '***' if k == 'Partner-Authorization' else v for k, v in headers.items()})}")
    print(f"API Request - Params: {json.dumps(params)}")
    
    try:
        # Make the API request
        response = requests.get(
            url,
            params=params,
            headers=headers,
            timeout=timeout
        )
        
        # Print debug information about the response
        print(f"API Response - Status: {response.status_code}")
        print(f"API Response - Headers: {json.dumps(dict(response.headers))}")
        print(f"API Response - URL: {response.url}")
        
        # Check if the request was successful
        response.raise_for_status()
        
        # Parse and return the JSON response
        response_data = response.json()
        print(f"API Response - Data: {json.dumps(response_data)[:500]}...")
        return response_data
        
    except requests.exceptions.HTTPError as e:
        # Handle HTTP errors (e.g., 404, 500)
        status_code = e.response.status_code
        try:
            error_data = e.response.json()
            print(f"API Error - Response JSON: {json.dumps(error_data)}")
            error_message = error_data.get("message", str(e))
        except ValueError:
            error_text = e.response.text
            print(f"API Error - Response Text: {error_text}")
            error_message = error_text or str(e)
            
        # Format a useful error message
        error = {
            "status_code": status_code,
            "message": f"API request failed: {error_message}",
            "url": e.response.url,
            "response_text": e.response.text
        }
        
        # Log the error
        print(f"Seats.aero API error: {json.dumps(error)}")
        return {"error": error}
        
    except requests.exceptions.RequestException as e:
        # Handle network errors, timeouts, etc.
        error = {
            "status_code": 500,
            "message": f"Request failed: {str(e)}"
        }
        
        # Log the error
        print(f"Seats.aero API connection error: {json.dumps(error)}")
        return {"error": error}

def search_award_flights(
    origin: str,
    destination: str,
    date: str,
    return_date: Optional[str] = None,
    passengers: int = 1,
    cabin_class: Optional[str] = None
) -> Dict[str, Any]:
    """
    Search for award flight availability between origin and destination.
    
    Args:
        origin: Origin airport code (e.g., "JFK")
        destination: Destination airport code (e.g., "LHR")
        date: Departure date in YYYY-MM-DD format
        return_date: Optional return date in YYYY-MM-DD format
        passengers: Number of passengers
        cabin_class: Optional cabin class preference
        
    Returns:
        Dictionary with search results or error information
    """
    # Format date to YYYY-MM-DD if it's not already in that format
    # This handles formats like "4/23/2025", "04/23/2025", etc.
    try:
        # Try to parse the date - check if it's in YYYY-MM-DD format already
        if "-" in date and len(date.split("-")) == 3:
            # Already in YYYY-MM-DD format
            formatted_date = date
        else:
            # Try to parse as MM/DD/YYYY or similar
            try:
                parsed_date = datetime.strptime(date, "%m/%d/%Y")
                formatted_date = parsed_date.strftime("%Y-%m-%d")
            except ValueError:
                # Try other common formats
                try:
                    parsed_date = datetime.strptime(date, "%d/%m/%Y")
                    formatted_date = parsed_date.strftime("%Y-%m-%d")
                except ValueError:
                    # If all else fails, keep original (API might reject it)
                    formatted_date = date
    except Exception as e:
        print(f"Error formatting date: {e}")
        formatted_date = date
        
    # Format return date the same way
    formatted_return_date = None
    if return_date:
        try:
            if "-" in return_date and len(return_date.split("-")) == 3:
                formatted_return_date = return_date
            else:
                try:
                    parsed_return_date = datetime.strptime(return_date, "%m/%d/%Y")
                    formatted_return_date = parsed_return_date.strftime("%Y-%m-%d")
                except ValueError:
                    try:
                        parsed_return_date = datetime.strptime(return_date, "%d/%m/%Y")
                        formatted_return_date = parsed_return_date.strftime("%Y-%m-%d")
                    except ValueError:
                        formatted_return_date = return_date
        except Exception as e:
            print(f"Error formatting return date: {e}")
            formatted_return_date = return_date
    
    # Construct parameters based on Seats.aero API documentation
    params = {
        "origin_airport": origin,
        "destination_airport": destination,
        "start_date": formatted_date,
        # The Seats.aero API requires both start_date and end_date
        # If return_date is provided, use it as end_date; otherwise, use the same date as start_date
        "end_date": formatted_return_date if formatted_return_date else formatted_date
    }
    
    # Add optional parameters if provided
    if cabin_class:
        # Map our cabin classes to their expected values
        cabin_map = {
            "economy": "economy",
            "premium-economy": "premium",
            "business": "business",
            "first": "first"
        }
        params["cabin"] = cabin_map.get(cabin_class.lower(), "economy")
    
    print(f"Searching flights from {origin} to {destination} on {formatted_date}")
    
    # Based on Seats.aero documentation, the endpoint is 'search' for cached search
    result = fetch_seats_aero_data("search", params)
    
    # Check for error
    if "error" in result:
        print(f"Seats.aero API search error: {result}")
        return result
    
    # If no error but empty results, still return the API response
    # Don't add mock data, just return what the API gave us
    if "data" not in result:
        result["data"] = []
    
    # Return the unmodified API response
    return result

def get_available_routes(source: str = "all"):
    """
    Fetch available routes from the Seats.aero API.
    This is useful to get a list of supported routes for award searches.
    
    Args:
        source: The mileage program to filter by (e.g., "united", "delta")
        
    Returns:
        Dictionary with available routes information
    """
    # Per documentation, 'source' is a required parameter
    params = {"source": source}
    return fetch_seats_aero_data("routes", params)

def get_bulk_availability(
    source: str,
    cabin_class: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    origin_region: Optional[str] = None
) -> Dict[str, Any]:
    """
    Fetch bulk availability data from a specific mileage program.
    
    Args:
        source: The mileage program (e.g., "united", "delta")
        cabin_class: Optional cabin class preference
        start_date: Optional start date in YYYY-MM-DD format
        end_date: Optional end date in YYYY-MM-DD format
        origin_region: Optional region filter (e.g., "North America")
        
    Returns:
        Dictionary with bulk availability data
    """
    params = {"source": source}
    
    # Format dates to YYYY-MM-DD if provided
    if start_date:
        try:
            if "-" in start_date and len(start_date.split("-")) == 3:
                formatted_start_date = start_date
            else:
                try:
                    parsed_date = datetime.strptime(start_date, "%m/%d/%Y")
                    formatted_start_date = parsed_date.strftime("%Y-%m-%d")
                except ValueError:
                    try:
                        parsed_date = datetime.strptime(start_date, "%d/%m/%Y")
                        formatted_start_date = parsed_date.strftime("%Y-%m-%d")
                    except ValueError:
                        formatted_start_date = start_date
            params["start_date"] = formatted_start_date
        except Exception as e:
            print(f"Error formatting start date: {e}")
            params["start_date"] = start_date
        
    if end_date:
        try:
            if "-" in end_date and len(end_date.split("-")) == 3:
                formatted_end_date = end_date
            else:
                try:
                    parsed_date = datetime.strptime(end_date, "%m/%d/%Y")
                    formatted_end_date = parsed_date.strftime("%Y-%m-%d")
                except ValueError:
                    try:
                        parsed_date = datetime.strptime(end_date, "%d/%m/%Y")
                        formatted_end_date = parsed_date.strftime("%Y-%m-%d")
                    except ValueError:
                        formatted_end_date = end_date
            params["end_date"] = formatted_end_date
        except Exception as e:
            print(f"Error formatting end date: {e}")
            params["end_date"] = end_date
    
    # Add optional parameters
    if cabin_class:
        cabin_map = {
            "economy": "economy",
            "premium-economy": "premium",
            "business": "business",
            "first": "first"
        }
        params["cabin"] = cabin_map.get(cabin_class.lower(), "economy")
        
    if origin_region:
        params["origin_region"] = origin_region
        
    return fetch_seats_aero_data("availability", params)

def get_trip_details(trip_id: str) -> Dict[str, Any]:
    """
    Get detailed flight information for a specific trip.
    
    Args:
        trip_id: The ID of the availability object
        
    Returns:
        Dictionary with trip details
    """
    return fetch_seats_aero_data(f"trips/{trip_id}") 