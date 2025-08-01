#!/usr/bin/env python3
"""
Airport Search API - Simple standalone API for airport search functionality
Can be used independently or integrated with the main FastAPI server
"""

import sys
import json
from typing import List, Dict, Any, Optional
from airport_service import AirportService

class AirportSearchAPI:
    """Simple API wrapper for airport search functionality"""
    
    def __init__(self):
        """Initialize the airport search API"""
        self.service = AirportService()
        
    def search(self, query: str, limit: int = 10) -> Dict[str, Any]:
        """
        Search for airports
        
        Args:
            query: Search query (airport code, city name, airport name)
            limit: Maximum number of results (default: 10)
            
        Returns:
            Dictionary with search results and metadata
        """
        try:
            results = self.service.search_airports(query, limit)
            
            return {
                "success": True,
                "query": query,
                "limit": limit,
                "total_results": len(results),
                "airports": results,
                "message": f"Found {len(results)} airports for '{query}'"
            }
            
        except Exception as e:
            return {
                "success": False,
                "query": query,
                "limit": limit,
                "total_results": 0,
                "airports": [],
                "error": str(e),
                "message": f"Error searching for '{query}': {str(e)}"
            }
    
    def get_airport_by_code(self, code: str) -> Dict[str, Any]:
        """
        Get specific airport by IATA or ICAO code
        
        Args:
            code: IATA or ICAO airport code
            
        Returns:
            Airport information or error
        """
        try:
            code = code.upper().strip()
            
            # Check IATA first
            if code in self.service.airports_by_iata:
                airport = self.service.airports_by_iata[code]
                formatted = self.service._format_airport(airport, code)
                return {
                    "success": True,
                    "code": code,
                    "type": "IATA",
                    "airport": formatted
                }
            
            # Check ICAO
            if code in self.service.airports_by_icao:
                airport = self.service.airports_by_icao[code]
                formatted = self.service._format_airport(airport, icao_code=code)
                return {
                    "success": True,
                    "code": code,
                    "type": "ICAO", 
                    "airport": formatted
                }
            
            return {
                "success": False,
                "code": code,
                "error": "Airport code not found",
                "message": f"No airport found with code '{code}'"
            }
            
        except Exception as e:
            return {
                "success": False,
                "code": code,
                "error": str(e),
                "message": f"Error looking up airport code '{code}': {str(e)}"
            }
    
    def get_city_airports(self, city: str) -> Dict[str, Any]:
        """
        Get all airports for a specific city/metropolitan area
        
        Args:
            city: City name or city code (e.g., 'New York', 'NYC', 'London')
            
        Returns:
            List of airports in the city/area
        """
        try:
            # Normalize city name
            city_upper = city.upper().strip()
            
            # Check city code mappings
            if city_upper in self.service.city_code_mappings:
                airports = []
                codes = self.service.city_code_mappings[city_upper]
                
                for code in codes:
                    if code in self.service.airports_by_iata:
                        airport = self.service.airports_by_iata[code]
                        formatted = self.service._format_airport(airport, code)
                        airports.append(formatted)
                
                return {
                    "success": True,
                    "city": city,
                    "city_code": city_upper if city_upper in self.service.city_code_mappings else None,
                    "total_airports": len(airports),
                    "airports": airports,
                    "message": f"Found {len(airports)} airports for {city}"
                }
            
            # If no city code mapping, do a regular search
            results = self.service.search_airports(city, limit=20)
            
            return {
                "success": True,
                "city": city,
                "city_code": None,
                "total_airports": len(results),
                "airports": results,
                "message": f"Found {len(results)} airports matching '{city}'"
            }
            
        except Exception as e:
            return {
                "success": False,
                "city": city,
                "total_airports": 0,
                "airports": [],
                "error": str(e),
                "message": f"Error searching for city '{city}': {str(e)}"
            }
    
    def get_stats(self) -> Dict[str, Any]:
        """Get airport database statistics"""
        return {
            "success": True,
            "database_stats": {
                "iata_airports": self.service.iata_count,
                "icao_airports": self.service.icao_count,
                "total_airports": self.service.iata_count + self.service.icao_count,
                "city_mappings": len(self.service.city_code_mappings),
                "alias_mappings": len(self.service.airport_aliases)
            },
            "features": [
                "IATA/ICAO code search",
                "City name search", 
                "Airport name search",
                "Metropolitan area codes",
                "Partial text matching",
                "Alias recognition"
            ]
        }

def main():
    """Command line interface for airport search"""
    if len(sys.argv) < 2:
        print("Usage: python airport_api.py <search_query>")
        print("Examples:")
        print("  python airport_api.py LAX")
        print("  python airport_api.py 'New York'")
        print("  python airport_api.py 'London'")
        return
    
    # Initialize API
    api = AirportSearchAPI()
    
    # Get search query
    query = " ".join(sys.argv[1:])
    
    # Perform search
    print(f"🔍 Searching for: '{query}'")
    print("=" * 50)
    
    result = api.search(query, limit=5)
    
    if result["success"]:
        print(f"✅ {result['message']}")
        print()
        
        for i, airport in enumerate(result["airports"], 1):
            iata = airport.get("iata_code", "N/A")
            name = airport.get("name", "Unknown")
            city = airport.get("city", "Unknown")
            country = airport.get("country", "Unknown")
            
            print(f"{i}. {iata}: {name}")
            print(f"   📍 {city}, {country}")
    else:
        print(f"❌ {result['message']}")
        if "error" in result:
            print(f"Error: {result['error']}")

if __name__ == "__main__":
    main() 