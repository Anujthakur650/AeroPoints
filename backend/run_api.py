#!/usr/bin/env python3
"""
API Server Starter for Award Flight Frontend
This script starts the API server for the Award Flight Frontend application.
"""

import os
import sys
import subprocess
import threading
import socket
import uvicorn
import importlib.util
from dotenv import load_dotenv
import time

# Get the directory of this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)

# Load environment variables from all possible .env files
load_dotenv(os.path.join(SCRIPT_DIR, '.env'))  # Backend .env
load_dotenv(os.path.join(PROJECT_ROOT, '.env'))  # Project root .env

# Check if the SEATS_AERO_API_KEY is loaded
seats_aero_key = os.getenv('SEATS_AERO_API_KEY')
if seats_aero_key:
    print(f"Successfully loaded SEATS_AERO_API_KEY: {seats_aero_key[:5]}...")
else:
    print("WARNING: SEATS_AERO_API_KEY environment variable is not set!")
    print("Real-time flight data may not be available.")
    sys.exit(1)  # Exit if no API key is available

def is_port_in_use(port):
    """Check if a port is already in use"""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def run_api_server():
    """Run the API server"""
    api_server_path = os.path.join(SCRIPT_DIR, "api_server.py")
    
    # Check if the API server file exists
    if not os.path.exists(api_server_path):
        print(f"Error: API server file not found at {api_server_path}")
        sys.exit(1)
    
    # Create logs directory
    os.makedirs("logs", exist_ok=True)
    
    # Always use port 8000 for consistency with frontend
    fixed_port = 8000
    
    # Check if port 8000 is already in use
    if is_port_in_use(fixed_port):
        print(f"Warning: Port {fixed_port} is already in use.")
        print(f"Attempting to kill any existing processes on port {fixed_port}...")
        
        # Try to kill any processes using the port on Unix-like systems
        try:
            subprocess.run(f"lsof -i:{fixed_port} -t | xargs kill -9", shell=True)
            print(f"Any processes on port {fixed_port} have been terminated.")
        except Exception as e:
            print(f"Error killing processes: {e}")
            print(f"Please manually free port {fixed_port} and try again.")
            sys.exit(1)
            
        # Wait a moment for the port to be freed
        time.sleep(1)
        
        # Check again if the port is available
        if is_port_in_use(fixed_port):
            print(f"Error: Port {fixed_port} is still in use. Cannot start the API server.")
            print("The frontend expects the API to be running on port 8000.")
            sys.exit(1)
    
    try:
        print(f"Using port {fixed_port} for API server")
        
        # Import and run the API server
        print("Starting API server with FastAPI/Uvicorn...")
        
        # Use the module name to run uvicorn
        module_name = "api_server:app"
        os.chdir(SCRIPT_DIR)  # Change to the script directory
        uvicorn.run(
            module_name,
            host="0.0.0.0", 
            port=fixed_port,
            reload=True
        )
        
    except Exception as e:
        print(f"Error starting API server: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("API server stopped.")

if __name__ == "__main__":
    run_api_server() 