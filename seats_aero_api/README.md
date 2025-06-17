# Seats.aero API Integration

This is a backend API for accessing award flight availability data from Seats.aero's Partner API. It provides a secure way to interact with Seats.aero's data and serves it to your frontend application.

## Features

- Secure API key handling using environment variables
- Routes for searching award flights
- Error handling for API requests
- CORS support for frontend integration
- Health check endpoint

## Setup

1. Make sure you have Python 3.8+ installed

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Create a `.env` file in the project root with your API key:
   ```
   SEATS_AERO_API_KEY=your_api_key_here
   ```

4. Start the API server:
   ```bash
   uvicorn main:app --reload
   ```

5. The API will be available at http://localhost:8000

## API Endpoints

### GET /health
Health check endpoint to verify the API is running.

### GET /api/routes
Get all available routes from Seats.aero.

### GET /api/search-awards
Search for award flight availability with query parameters:
- `origin`: Origin airport code (e.g., "JFK")
- `destination`: Destination airport code (e.g., "LHR")
- `date`: Departure date in YYYY-MM-DD format
- `return_date`: (Optional) Return date in YYYY-MM-DD format
- `passengers`: (Optional) Number of passengers (default: 1)
- `cabin_class`: (Optional) Preferred cabin class

Example:
```
GET /api/search-awards?origin=JFK&destination=LHR&date=2023-12-25
```

### POST /api/search-awards
Search for award flight availability with a JSON request body:

Example request body:
```json
{
  "origin": "JFK",
  "destination": "LHR",
  "date": "2023-12-25",
  "return_date": "2024-01-05",
  "passengers": 2,
  "cabin_class": "business"
}
```

## Frontend Integration

Your frontend can make requests to these endpoints. For example:

```javascript
// Example using fetch API
const searchFlights = async (origin, destination, date) => {
  try {
    const response = await fetch(
      `http://localhost:8000/api/search-awards?origin=${origin}&destination=${destination}&date=${date}`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch flight data');
    }
    
    const data = await response.json();
    return data.data; // The actual flight search results
  } catch (error) {
    console.error('Error searching flights:', error);
    throw error;
  }
};
```

## Notes

- The Seats.aero API has a limit of 1,000 calls per day
- The API is for non-commercial use only unless you have explicit written permission from Seats.aero
- This API integration is designed to be used with your existing frontend application

## API Documentation

Once the server is running, you can access the interactive API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc 