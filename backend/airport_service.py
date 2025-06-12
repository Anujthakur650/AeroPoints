"""
Airport Service - Load and search for airport data
Uses the airportsdata library to provide accurate airport information
"""

import airportsdata
import logging
import re
from typing import List, Dict, Any, Optional
from functools import lru_cache

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AirportService:
    """Service for loading and searching airport data"""
    
    def __init__(self):
        """Initialize the airport service"""
        self.load_data()
        self.setup_city_mappings()
    
    def setup_city_mappings(self):
        """Setup common city code mappings for major metropolitan areas"""
        self.city_code_mappings = {
            # New York City area
            'NYC': ['JFK', 'LGA', 'EWR'],
            'NEW YORK': ['JFK', 'LGA', 'EWR'],
            'NEW YORK CITY': ['JFK', 'LGA', 'EWR'],
            'NEWYORK': ['JFK', 'LGA', 'EWR'],
            
            # Chicago area
            'CHI': ['ORD', 'MDW'],
            'CHICAGO': ['ORD', 'MDW'],
            
            # London area
            'LON': ['LHR', 'LGW', 'STN', 'LTN', 'LCY'],
            'LONDON': ['LHR', 'LGW', 'STN', 'LTN', 'LCY'],
            
            # Paris area
            'PAR': ['CDG', 'ORY', 'BVA'],
            'PARIS': ['CDG', 'ORY', 'BVA'],
            
            # Tokyo area
            'TYO': ['NRT', 'HND'],
            'TOKYO': ['NRT', 'HND'],
            
            # Los Angeles area
            'LA': ['LAX', 'BUR', 'LGB', 'SNA'],
            'LOS ANGELES': ['LAX', 'BUR', 'LGB', 'SNA'],
            
            # San Francisco Bay area
            'SF': ['SFO', 'OAK', 'SJC'],
            'SAN FRANCISCO': ['SFO', 'OAK', 'SJC'],
            'BAY AREA': ['SFO', 'OAK', 'SJC'],
            
            # Washington DC area
            'WAS': ['DCA', 'IAD', 'BWI'],
            'WASHINGTON': ['DCA', 'IAD', 'BWI'],
            'DC': ['DCA', 'IAD', 'BWI'],
            
            # Miami area
            'MIA': ['MIA', 'FLL', 'PBI'],
            'MIAMI': ['MIA', 'FLL', 'PBI'],
            
            # Milan area
            'MIL': ['MXP', 'LIN', 'BGY'],
            'MILAN': ['MXP', 'LIN', 'BGY'],
            
            # Stockholm area
            'STO': ['ARN', 'BMA', 'NYO'],
            'STOCKHOLM': ['ARN', 'BMA', 'NYO'],
            
            # Moscow area
            'MOW': ['SVO', 'DME', 'VKO'],
            'MOSCOW': ['SVO', 'DME', 'VKO'],
            
            # São Paulo area
            'SAO': ['GRU', 'CGH', 'VCP'],
            'SAO PAULO': ['GRU', 'CGH', 'VCP'],
            
            # Buenos Aires area
            'BUE': ['EZE', 'AEP'],
            'BUENOS AIRES': ['EZE', 'AEP'],
        }
        
        # Also create reverse mappings for alias recognition
        self.airport_aliases = {
            # Common abbreviations and alternative names
            'JFK': ['KENNEDY', 'JOHN F KENNEDY', 'JFK INTERNATIONAL'],
            'LGA': ['LAGUARDIA', 'LA GUARDIA'],
            'EWR': ['NEWARK', 'NEWARK LIBERTY'],
            'LAX': ['LOS ANGELES INTERNATIONAL', 'LAX INTERNATIONAL'],
            'ORD': ['OHARE', "O'HARE", 'CHICAGO OHARE'],
            'LHR': ['HEATHROW', 'LONDON HEATHROW'],
            'CDG': ['CHARLES DE GAULLE', 'PARIS CDG'],
            'NRT': ['NARITA', 'TOKYO NARITA'],
            'HND': ['HANEDA', 'TOKYO HANEDA'],
            'SFO': ['SAN FRANCISCO INTERNATIONAL'],
            'DCA': ['REAGAN', 'RONALD REAGAN', 'WASHINGTON NATIONAL'],
            'IAD': ['DULLES', 'WASHINGTON DULLES'],
        }
    
    def load_data(self):
        """Load airport data from the airportsdata library"""
        try:
            # Load the IATA airport data
            logger.info("Loading airport data...")
            self.airports_by_iata = airportsdata.load('IATA')
            self.airports_by_icao = airportsdata.load('ICAO')
            
            # Track loaded airport count
            self.iata_count = len(self.airports_by_iata)
            self.icao_count = len(self.airports_by_icao)
            
            logger.info(f"Loaded {self.iata_count} airports with IATA codes")
            logger.info(f"Loaded {self.icao_count} airports with ICAO codes")
            
            # Create a mapping for ICAO to IATA
            self.icao_to_iata = {}
            for iata_code, airport in self.airports_by_iata.items():
                if 'icao' in airport and airport['icao']:
                    self.icao_to_iata[airport['icao']] = iata_code
            
            # Print some example airports 
            logger.info("Example airports:")
            example_airports = list(self.airports_by_iata.items())[:3]
            for code, airport in example_airports:
                logger.info(f"  {code}: {airport.get('name')} in {airport.get('city')}, {airport.get('country')}")
                    
        except Exception as e:
            logger.error(f"Error loading airport data: {e}")
            # Initialize with empty dictionaries in case of error
            self.airports_by_iata = {}
            self.airports_by_icao = {}
            self.icao_to_iata = {}
            self.iata_count = 0
            self.icao_count = 0

    @lru_cache(maxsize=128)
    def search_airports(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Search for airports by IATA/ICAO code, city name, or airport name
        Enhanced to handle city codes and aliases
        
        Args:
            query: The search query string
            limit: Maximum number of results to return
        
        Returns:
            List of matching airport objects
        """
        # Add debugging
        print(f"Search query: '{query}', limit: {limit}")
        
        if not query or len(query) < 2:
            print("Query too short, returning empty list")
            return []
        
        # Normalize the query
        original_query = query.strip()
        query = query.strip().upper()
        print(f"Normalized query: '{query}'")
        
        # Check for city code mappings first
        if query in self.city_code_mappings:
            print(f"Found city code mapping for '{query}': {self.city_code_mappings[query]}")
            results = []
            for airport_code in self.city_code_mappings[query]:
                if airport_code in self.airports_by_iata:
                    airport = self.airports_by_iata[airport_code]
                    results.append(self._format_airport(airport, airport_code))
                    print(f"Added city airport: {airport_code} - {airport.get('name')}")
            
            # If we found city airports, return them (limited)
            if results:
                return results[:limit]
        
        # Split multi-word queries for more flexible matching
        query_words = original_query.lower().split()
        print(f"Query words: {query_words}")
        
        # Track exact matches and partial matches separately for ranking
        exact_matches = []
        code_matches = []
        partial_matches = []
        alias_matches = []
        
        print(f"IATA check: Is '{query}' in IATA database? {query in self.airports_by_iata}")
        print(f"ICAO check: Is '{query}' in ICAO database? {query in self.airports_by_icao}")
        
        # Check for IATA code matches
        if query in self.airports_by_iata:
            airport = self.airports_by_iata[query]
            print(f"Found exact IATA match: {query} -> {airport.get('name')}")
            exact_matches.append(self._format_airport(airport, query))
        
        # Check for ICAO code matches
        if query in self.airports_by_icao:
            icao_airport = self.airports_by_icao[query]
            print(f"Found exact ICAO match: {query} -> {icao_airport.get('name')}")
            
            # Get the corresponding IATA code if available
            iata_code = self.icao_to_iata.get(query)
            if iata_code:
                # Use the IATA airport data if available
                airport = self.airports_by_iata.get(iata_code, icao_airport)
                exact_matches.append(self._format_airport(airport, iata_code))
            else:
                # Otherwise, use the ICAO airport data
                exact_matches.append(self._format_airport(icao_airport, None, query))
        
        # Check for airport aliases
        for iata_code, aliases in self.airport_aliases.items():
            if query in aliases or any(alias in query for alias in aliases):
                if iata_code in self.airports_by_iata:
                    airport = self.airports_by_iata[iata_code]
                    alias_matches.append(self._format_airport(airport, iata_code))
                    print(f"Found alias match: '{query}' -> {iata_code} - {airport.get('name')}")
        
        # Check for partial matches if we don't have enough exact matches
        if len(exact_matches + alias_matches) < limit:
            print(f"Looking for partial matches for '{original_query.lower()}'")
            
            # Counter for debugging
            checked_count = 0
            partial_match_count = 0
            
            for iata_code, airport in self.airports_by_iata.items():
                checked_count += 1
                if query == iata_code:
                    continue  # Skip exact matches we've already found
                
                # Check if the query matches the airport code
                if query in iata_code:
                    code_matches.append(self._format_airport(airport, iata_code))
                    partial_match_count += 1
                    print(f"Found code match: {iata_code} contains '{query}'")
                    continue
                
                # Extract city, name, and country for searching
                city = airport.get('city', '').lower()
                name = airport.get('name', '').lower()
                country = airport.get('country', '').lower()
                query_lower = original_query.lower()
                
                # Exact city/name match gets priority
                if query_lower == city or query_lower == name:
                    exact_matches.append(self._format_airport(airport, iata_code))
                    partial_match_count += 1
                    print(f"Found exact city/name match: '{query_lower}' == '{city}' or '{name}'")
                    continue
                
                # For multi-word queries, check if all words are present
                if len(query_words) > 1 and self._contains_all_words(query_words, [city, name, country]):
                    exact_matches.append(self._format_airport(airport, iata_code))
                    partial_match_count += 1
                    print(f"Found multi-word match for '{query_lower}' in '{city}, {name}, {country}'")
                    continue
                
                # Partial matches - check if query is contained within any field
                if (query_lower in city or query_lower in name or query_lower in country):
                    partial_matches.append(self._format_airport(airport, iata_code))
                    partial_match_count += 1
                    continue
                
                # Check if any word in the query starts or is contained in any field
                if any(word in city or word in name or word in country for word in query_words):
                    partial_matches.append(self._format_airport(airport, iata_code))
                    partial_match_count += 1
                    continue
                
                # Check for token-based matches (starts with)
                if self._search_tokens(query_lower, name) or self._search_tokens(query_lower, city):
                    partial_matches.append(self._format_airport(airport, iata_code))
                    partial_match_count += 1
                    continue
                    
                # Limit how many airports we check for larger datasets
                if checked_count >= 5000:
                    break
                    
            print(f"Checked {checked_count} airports, found {partial_match_count} partial matches")
        
        # Combine results with proper ordering (exact first, then aliases, then codes, then partial)
        results = exact_matches + alias_matches + code_matches + partial_matches
        
        # Print out the combined results
        print(f"Combined results count: {len(results)}")
        print(f"- Exact matches: {len(exact_matches)}")
        print(f"- Alias matches: {len(alias_matches)}")
        print(f"- Code matches: {len(code_matches)}")
        print(f"- Partial matches: {len(partial_matches)}")
        
        # Remove duplicates - some airports might match in multiple categories
        unique_results = []
        seen_codes = set()
        
        for airport in results:
            code = airport.get('iata') or airport.get('icao')
            if code and code not in seen_codes:
                unique_results.append(airport)
                seen_codes.add(code)
        
        print(f"Final results count after deduplication and limit: {len(unique_results[:limit])}")
        
        # Log the final results for debugging
        if unique_results:
            print("Sample results:")
            for i, airport in enumerate(unique_results[:min(3, len(unique_results))]):
                print(f"  {i+1}. {airport.get('iata')} - {airport.get('name')} in {airport.get('city')}, {airport.get('country')}")
        
        return unique_results[:limit]

    def _contains_all_words(self, query_words: List[str], texts: List[str]) -> bool:
        """Check if all query words are present in any of the text fields"""
        combined_text = ' '.join(texts).lower()
        return all(word in combined_text for word in query_words)
    
    def _search_tokens(self, query: str, text: str) -> bool:
        """Search for query as token in text (starts with word boundary)"""
        if not text:
            return False
        
        # Split text into tokens and check if any token starts with the query
        tokens = re.split(r'[\s\-,\.]', text.lower())
        return any(token.startswith(query.lower()) for token in tokens if token)

    def _format_airport(self, airport: Dict[str, Any], iata_code: Optional[str] = None, icao_code: Optional[str] = None) -> Dict[str, Any]:
        """Format airport data for API response"""
        return {
            'iata': iata_code or airport.get('iata', ''),
            'icao': icao_code or airport.get('icao', ''),
            'name': airport.get('name', ''),
            'city': airport.get('city', ''),
            'country': airport.get('country', ''),
            'latitude': airport.get('lat', 0.0),
            'longitude': airport.get('lon', 0.0)
        }

# Create a singleton instance
airport_service = AirportService() 