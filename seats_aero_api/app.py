from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import Optional
from dotenv import load_dotenv
import os

# Import our API client functions
from utils.seats_aero_client import search_award_flights, get_available_routes

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure CORS
CORS(app)

@app.route('/api/routes', methods=['GET'])
def routes():
    """
    Get all available routes from Seats.aero.
    """
    result = get_available_routes()
    
    # Check if there was an error
    if "error" in result:
        error = result["error"]
        return jsonify({
            "error": error.get("message", "An unknown error occurred")
        }), error.get("status_code", 500)
    
    return jsonify({"data": result})

@app.route('/api/search-awards', methods=['GET'])
def search_awards():
    """
    Search for award flight availability between airports.
    """
    # Get parameters from request
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    date = request.args.get('date')
    return_date = request.args.get('return_date')
    
    try:
        passengers = int(request.args.get('passengers', 1))
    except (ValueError, TypeError):
        passengers = 1
        
    cabin_class = request.args.get('cabin_class')
    
    # Validate required parameters
    if not all([origin, destination, date]):
        return jsonify({
            "error": {
                "status_code": 400,
                "message": "Missing required parameters: origin, destination, and date"
            }
        }), 400
    
    # Call the API client function
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
        return jsonify({
            "error": error.get("message", "An unknown error occurred")
        }), error.get("status_code", 500)
    
    return jsonify({"data": result})

@app.route('/api/search-awards', methods=['POST'])
def search_awards_post():
    """
    Search for award flight availability using POST request.
    """
    # Get data from JSON body
    data = request.get_json()
    
    if not data:
        return jsonify({
            "error": {
                "status_code": 400,
                "message": "Invalid JSON body"
            }
        }), 400
    
    # Extract and validate required parameters
    origin = data.get('origin')
    destination = data.get('destination')
    date = data.get('date')
    
    if not all([origin, destination, date]):
        return jsonify({
            "error": {
                "status_code": 400,
                "message": "Missing required parameters: origin, destination, and date"
            }
        }), 400
    
    # Call the API client function
    result = search_award_flights(
        origin=origin,
        destination=destination,
        date=date,
        return_date=data.get('return_date'),
        passengers=data.get('passengers', 1),
        cabin_class=data.get('cabin_class')
    )
    
    # Check if there was an error
    if "error" in result:
        error = result["error"]
        return jsonify({
            "error": error.get("message", "An unknown error occurred")
        }), error.get("status_code", 500)
    
    return jsonify({"data": result})

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

# Run the app with: python app.py
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True) 