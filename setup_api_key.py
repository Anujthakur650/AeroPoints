#!/usr/bin/env python3
"""
Seats.aero API Key Setup

This script helps configure the seats.aero Partner API key by
adding it to the .env file for use by the flight search application.
"""

import os
import sys
import getpass

def setup_api_key():
    """
    Setup the seats.aero API key by prompting the user and saving to .env file
    """
    print("="*80)
    print(" Seats.aero API Key Setup")
    print("="*80)
    print()
    print("This script will help you configure the seats.aero Partner API key")
    print("for use with the flight search application.")
    print()
    print("You can get an API key from: https://seats.aero/partner-api")
    print()
    
    # Check if .env file exists
    env_file = os.path.join(os.path.dirname(os.path.abspath(__file__)), '.env')
    env_vars = {}
    
    if os.path.exists(env_file):
        print(f"Found existing .env file at: {env_file}")
        # Read existing variables
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    env_vars[key.strip()] = value.strip()
        
        if 'SEATS_AERO_API_KEY' in env_vars:
            current_key = env_vars['SEATS_AERO_API_KEY']
            masked_key = current_key[:4] + '*' * (len(current_key) - 8) + current_key[-4:] if len(current_key) > 8 else '****'
            print(f"Current API key found: {masked_key}")
            change = input("Would you like to change it? (y/n): ").lower()
            if change != 'y':
                print("Keeping existing API key.")
                return
    else:
        print(f"No existing .env file found. Will create a new one at: {env_file}")
    
    # Prompt for the API key
    print()
    print("Please enter your seats.aero Partner API key.")
    print("Note: The key will not be displayed as you type.")
    api_key = getpass.getpass("API Key: ")
    
    if not api_key.strip():
        print("No API key entered. Aborting.")
        return
    
    # Save to .env file
    env_vars['SEATS_AERO_API_KEY'] = api_key
    
    # Write back to file
    with open(env_file, 'w') as f:
        for key, value in env_vars.items():
            f.write(f"{key}={value}\n")
    
    print()
    print(f"API key successfully saved to {env_file}")
    print("You can now run the flight search application and use the seats.aero API.")
    print()
    
    # Verify the key was saved correctly
    if 'SEATS_AERO_API_KEY' in os.environ:
        # Update the environment variable in the current process
        os.environ['SEATS_AERO_API_KEY'] = api_key
        print("Environment variable updated for the current session.")
    else:
        print("NOTE: You'll need to restart your terminal or run:")
        print(f"  export SEATS_AERO_API_KEY={api_key}")
        print("to make the API key available to the current terminal session.")

if __name__ == "__main__":
    setup_api_key() 