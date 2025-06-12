from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from dotenv import load_dotenv
import os

# Import our API client functions
from utils.seats_aero_client import search_award_flights, get_available_routes, get_bulk_availability, get_trip_details

# Load environment variables
load_dotenv()

# Print a startup message for debugging
print("Starting Seats.aero API proxy server...")
print(f"API Key exists: {bool(os.getenv('SEATS_AERO_API_KEY'))}")

# Initialize FastAPI app
app = FastAPI(
    title="Award Flight Search API",
    description="API for searching award flight availability using Seats.aero",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Specify your frontend domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class SearchRequest(BaseModel):
    origin: str
    destination: str
    date: str
    return_date: Optional[str] = None
    passengers: int = 1
    cabin_class: Optional[str] = None

class BulkAvailabilityRequest(BaseModel):
    source: str
    cabin_class: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    origin_region: Optional[str] = None

# Response models
class ErrorResponse(BaseModel):
    status_code: int
    message: str

class SearchResponse(BaseModel):
    data: Dict[str, Any]

# GET endpoint for available routes
@app.get("/api/routes", response_model=Dict[str, Any])
async def routes(
    source: str = Query("all", description="The mileage program to filter by (e.g., 'united', 'delta')")
):
    """
    Get available routes from Seats.aero.
    """
    result = get_available_routes(source)
    
    # Check if there was an error
    if "error" in result:
        error = result["error"]
        raise HTTPException(
            status_code=error.get("status_code", 500),
            detail=error.get("message", "An unknown error occurred")
        )
    
    return {"data": result}

# GET endpoint for cached search
@app.get("/api/search-awards")
async def search_awards(
    origin: str = Query(..., min_length=3, max_length=3, description="Origin airport code"),
    destination: str = Query(..., min_length=3, max_length=3, description="Destination airport code"),
    date: str = Query(..., description="Departure date (YYYY-MM-DD)"),
    return_date: Optional[str] = Query(None, description="Return date (YYYY-MM-DD)"),
    passengers: int = Query(1, ge=1, le=9, description="Number of passengers"),
    cabin_class: Optional[str] = Query(None, description="Cabin class preference")
):
    """
    Search for award flight availability between airports.
    """
    # Validate airports and dates
    if origin == destination:
        raise HTTPException(
            status_code=400,
            detail="Origin and destination airports cannot be the same"
        )
    
    # Proceed with the search
    result = search_award_flights(
        origin=origin,
        destination=destination,
        date=date,
        return_date=return_date,
        passengers=passengers,
        cabin_class=cabin_class
    )
    
    # Check if there was an error
    if "error" in result:
        error = result["error"]
        
        # Create a more user-friendly error message
        error_message = error.get("message", "An unknown error occurred")
        status_code = error.get("status_code", 500)
        
        # Add specific error handling for common Seats.aero API errors
        response_text = error.get("response_text", "")
        if "invalid_start_date" in response_text or "invalid_end_date" in response_text:
            error_message = f"Invalid date format: {response_text}. Please use YYYY-MM-DD format."
            status_code = 400
        
        raise HTTPException(
            status_code=status_code,
            detail=error_message
        )
    
    # If we got empty results, return them properly
    if "data" in result and isinstance(result["data"], list) and len(result["data"]) == 0:
        return {
            "data": {
                "data": [],
                "count": 0,
                "hasMore": False,
                "cursor": result.get("cursor", 0)
            },
            "count": 0,
            "hasMore": False
        }
    
    # Return the results from Seats.aero API
    return {
        "data": result,
        "count": len(result.get("data", [])),
        "hasMore": result.get("hasMore", False)
    }

# POST endpoint for cached search
@app.post("/api/search-awards")
async def search_awards_post(request: SearchRequest):
    """
    Search for award flight availability using POST request.
    """
    # Validate airports and dates
    if request.origin == request.destination:
        raise HTTPException(
            status_code=400,
            detail="Origin and destination airports cannot be the same"
        )
    
    # Proceed with the search
    result = search_award_flights(
        origin=request.origin,
        destination=request.destination,
        date=request.date,
        return_date=request.return_date,
        passengers=request.passengers,
        cabin_class=request.cabin_class
    )
    
    # Check if there was an error
    if "error" in result:
        error = result["error"]
        
        # Create a more user-friendly error message
        error_message = error.get("message", "An unknown error occurred")
        status_code = error.get("status_code", 500)
        
        # Add specific error handling for common Seats.aero API errors
        response_text = error.get("response_text", "")
        if "invalid_start_date" in response_text or "invalid_end_date" in response_text:
            error_message = f"Invalid date format: {response_text}. Please use YYYY-MM-DD format."
            status_code = 400
        
        raise HTTPException(
            status_code=status_code,
            detail=error_message
        )
    
    # If we got empty results, return them properly
    if "data" in result and isinstance(result["data"], list) and len(result["data"]) == 0:
        return {
            "data": {
                "data": [],
                "count": 0,
                "hasMore": False,
                "cursor": result.get("cursor", 0)
            },
            "count": 0,
            "hasMore": False
        }
    
    # Return the results from Seats.aero API
    return {
        "data": result,
        "count": len(result.get("data", [])),
        "hasMore": result.get("hasMore", False)
    }

# GET endpoint for bulk availability
@app.get("/api/bulk-availability")
async def bulk_availability(
    source: str = Query(..., description="The mileage program (e.g., 'united', 'delta')"),
    cabin_class: Optional[str] = Query(None, description="Cabin class preference"),
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    origin_region: Optional[str] = Query(None, description="Origin region filter")
):
    """
    Get bulk availability data from a specific mileage program.
    """
    result = get_bulk_availability(
        source=source,
        cabin_class=cabin_class,
        start_date=start_date,
        end_date=end_date,
        origin_region=origin_region
    )
    
    # Check if there was an error
    if "error" in result:
        error = result["error"]
        raise HTTPException(
            status_code=error.get("status_code", 500),
            detail=error.get("message", "An unknown error occurred")
        )
    
    return {"data": result}

# POST endpoint for bulk availability
@app.post("/api/bulk-availability")
async def bulk_availability_post(request: BulkAvailabilityRequest):
    """
    Get bulk availability data using POST request.
    """
    result = get_bulk_availability(
        source=request.source,
        cabin_class=request.cabin_class,
        start_date=request.start_date,
        end_date=request.end_date,
        origin_region=request.origin_region
    )
    
    # Check if there was an error
    if "error" in result:
        error = result["error"]
        raise HTTPException(
            status_code=error.get("status_code", 500),
            detail=error.get("message", "An unknown error occurred")
        )
    
    return {"data": result}

# GET endpoint for trip details
@app.get("/api/trips/{trip_id}")
async def trip_details(trip_id: str):
    """
    Get detailed flight information for a specific trip.
    """
    result = get_trip_details(trip_id)
    
    # Check if there was an error
    if "error" in result:
        error = result["error"]
        raise HTTPException(
            status_code=error.get("status_code", 500),
            detail=error.get("message", "An unknown error occurred")
        )
    
    return {"data": result}

# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint to verify the API is running properly.
    """
    print("Health check called")
    return {"status": "healthy", "message": "API is running"}

# Run the app with: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 