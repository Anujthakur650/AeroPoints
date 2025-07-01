#!/usr/bin/env python3
"""
Start Airport Search Service - Simple startup script for the airport search functionality
"""

import sys
import time
from airport_api import AirportSearchAPI

def main():
    """Start and test the airport search service"""
    
    print("🚀 STARTING AUTO AIRPORT SEARCH SERVICE")
    print("=" * 50)
    
    try:
        # Initialize the service
        print("📡 Initializing Airport Search API...")
        api = AirportSearchAPI()
        
        # Get and display stats
        stats = api.get_stats()
        
        print("✅ Service Started Successfully!")
        print()
        print("📊 Service Statistics:")
        print(f"   • Total Airports: {stats['database_stats']['total_airports']:,}")
        print(f"   • IATA Airports: {stats['database_stats']['iata_airports']:,}")
        print(f"   • ICAO Airports: {stats['database_stats']['icao_airports']:,}")
        print(f"   • City Mappings: {stats['database_stats']['city_mappings']}")
        print()
        
        print("🔧 Available Features:")
        for feature in stats['features']:
            print(f"   ✅ {feature}")
        print()
        
        # Quick functionality test
        print("🔍 Quick Functionality Test:")
        print("-" * 30)
        
        test_queries = [
            ("LAX", "Los Angeles International"),
            ("JFK", "New York JFK"),
            ("BOM", "Mumbai"),
            ("London", "London metro area")
        ]
        
        for query, description in test_queries:
            print(f"Testing {description}...")
            result = api.search(query, limit=1)
            
            if result['success'] and result['airports']:
                airport = result['airports'][0]
                iata = airport.get('iata_code', 'N/A')
                name = airport.get('name', 'Unknown')
                city = airport.get('city', 'Unknown')
                print(f"   ✅ {iata}: {name} in {city}")
            else:
                print(f"   ❌ Failed: {result.get('message', 'Unknown error')}")
        
        print()
        print("🎉 AUTO AIRPORT SEARCH SERVICE IS READY!")
        print("=" * 50)
        print()
        print("📡 Service Status: RUNNING")
        print("🌐 Coverage: Worldwide (36,000+ airports)")
        print("⚡ Search Types: Code, City, Name, Metro Areas")
        print("🔗 API Ready: Use AirportSearchAPI class")
        print()
        print("💡 Usage Examples:")
        print("   • api.search('LAX')")
        print("   • api.search('New York')")
        print("   • api.get_airport_by_code('BOM')")
        print("   • api.get_city_airports('London')")
        print()
        
        # Keep service alive if run as standalone
        if len(sys.argv) > 1 and sys.argv[1] == '--keep-alive':
            print("🔄 Service running... (Ctrl+C to stop)")
            try:
                while True:
                    time.sleep(1)
            except KeyboardInterrupt:
                print("\n👋 Airport Search Service stopped.")
        
        return True
        
    except Exception as e:
        print(f"❌ Error starting service: {e}")
        print(f"Details: {str(e)}")
        return False

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1) 