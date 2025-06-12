import React, { useState, useEffect, useRef } from 'react';
import { Input, Spinner } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useDebounce } from '../hooks/useDebounce';
import searchHistoryService from '../services/search-history';
import apiService from '../services/api';

// Airport data interface
export interface Airport {
  iata: string;
  icao: string;
  name: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

// Component props interface
interface AirportAutocompleteProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string, airport?: Airport) => void;
  icon?: string;
  required?: boolean;
  disabled?: boolean;
  type?: 'origin' | 'destination';
}

export const AirportAutocomplete: React.FC<AirportAutocompleteProps> = ({
  label,
  placeholder = "Search airports by code or city",
  value,
  onChange,
  icon = "lucide:plane",
  required = false,
  disabled = false,
  type = 'origin'
}) => {
  // State for the input field and dropdown
  const [query, setQuery] = useState<string>(value);
  const [inputValue, setInputValue] = useState<string>(value);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestions, setSuggestions] = useState<Airport[]>([]);
  const [recentSearches, setRecentSearches] = useState<Airport[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [error, setError] = useState<string>("");
  const [noResults, setNoResults] = useState<boolean>(false);
  
  // Refs
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  
  // Debounce the search query to avoid excessive API calls
  const debouncedQuery = useDebounce(query, 300);
  
  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, [type]);
  
  // Update input value when value prop changes externally (e.g., during swap)
  useEffect(() => {
    console.log(`Value prop changed to: "${value}"`);
    setInputValue(value);
    setQuery(value);
  }, [value]);

  // Format airport display value
  const formatAirportDisplay = (airport: Airport): string => {
    return `${airport.iata} - ${airport.city} (${airport.name})`;
  };
  
  // Load recent searches from search history service
  const loadRecentSearches = () => {
    const history = searchHistoryService.getAirportHistoryByType(type);
    
    // Convert history items to Airport objects
    const recentAirports = history.map(item => ({
      iata: item.code,
      icao: '',
      name: item.name,
      city: item.city,
      country: ''
    }));
    
    setRecentSearches(recentAirports);
    console.log(`Loaded ${recentAirports.length} recent ${type} searches`);
  };
  
  // When an airport is selected
  const handleSelect = (airport: Airport) => {
    console.log('Selected airport:', airport);
    setInputValue(formatAirportDisplay(airport));
    onChange(airport.iata, airport);
    setIsOpen(false);
    setSuggestions([]);
    setNoResults(false);
    
    // Add to search history
    searchHistoryService.addAirportToHistory({
      code: airport.iata,
      city: airport.city,
      name: airport.name,
      type: type
    });
    
    // Refresh recent searches
    loadRecentSearches();
  };
  
  // Fetch airport suggestions when the debounced query changes
  useEffect(() => {
    const fetchSuggestions = async () => {
      // Skip if query is less than 2 characters
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setSuggestions([]);
        setNoResults(false);
        setIsOpen(false);
        return;
      }
      
      setIsLoading(true);
      setError("");
      setNoResults(false);
      
      try {
        console.log(`Searching for airports with query: "${debouncedQuery}"`);
        
        // Use the updated API service to fetch airport suggestions
        // The service now returns the array of airports directly
        const results: Airport[] = await apiService.searchAirports(debouncedQuery, 10);
        console.log('Airport search API response:', results);
        
        if (results && results.length > 0) {
          console.log(`Found ${results.length} airport suggestions for "${debouncedQuery}"`);
          // Ensure results are mapped to the Airport interface if needed
          // Assuming the API returns data matching the Airport interface
          setSuggestions(results);
          setNoResults(false);
          setIsOpen(true);
        } else {
          console.log(`No airports found for "${debouncedQuery}"`);
          setSuggestions([]);
          setNoResults(true);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Error fetching airport suggestions:", error);
        setError(`Failed to fetch airport suggestions: ${error instanceof Error ? error.message : String(error)}`);
        setSuggestions([]);
        
        // Keep the fallback logic in case the API is down
        const fallbackAirports = getFallbackAirports(debouncedQuery);
        if (fallbackAirports.length > 0) {
          console.log("Using fallback airports due to API error:", fallbackAirports.length);
          setSuggestions(fallbackAirports);
          setNoResults(false);
          setIsOpen(true);
        } else {
          setNoResults(true);
          setIsOpen(true); // Keep dropdown open to show "No results"
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    if (debouncedQuery.length >= 2) {
      console.log(`Initiating search for "${debouncedQuery}" after debounce`);
      fetchSuggestions();
    }
  }, [debouncedQuery]);
  
  // Fallback function that returns common airports matching the query
  const getFallbackAirports = (query: string): Airport[] => {
    // List of common airports for fallback
    const commonAirports: Airport[] = [
      { iata: 'JFK', icao: 'KJFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'US' },
      { iata: 'LAX', icao: 'KLAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'US' },
      { iata: 'SFO', icao: 'KSFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'US' },
      { iata: 'ORD', icao: 'KORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'US' },
      { iata: 'ATL', icao: 'KATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'US' },
      { iata: 'LHR', icao: 'EGLL', name: 'Heathrow Airport', city: 'London', country: 'GB' },
      { iata: 'CDG', icao: 'LFPG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'FR' },
      { iata: 'DXB', icao: 'OMDB', name: 'Dubai International Airport', city: 'Dubai', country: 'AE' },
      { iata: 'HKG', icao: 'VHHH', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'HK' },
      { iata: 'SYD', icao: 'YSSY', name: 'Sydney Airport', city: 'Sydney', country: 'AU' },
    ];
    
    const normalizedQuery = query.toLowerCase();
    return commonAirports.filter(airport => 
      airport.iata.toLowerCase().includes(normalizedQuery) || 
      airport.city.toLowerCase().includes(normalizedQuery) ||
      airport.name.toLowerCase().includes(normalizedQuery)
    );
  };
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log(`Input changed to: "${value}"`);
    setInputValue(value);
    setQuery(value);
    
    // Reset the selected airport if the input is cleared
    if (!value) {
      console.log('Input cleared, resetting selected airport');
      onChange("", undefined);
      setNoResults(false);
      setIsOpen(false);
    }
    
    // Show/hide dropdown based on input length
    if (value.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;
    
    // Get total items count (recent searches + suggestions)
    const recentCount = recentSearches.length;
    const suggestionCount = suggestions.length;
    const totalCount = recentCount + suggestionCount;
    
    // Arrow Down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, totalCount - 1));
    } 
    // Arrow Up
    else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } 
    // Enter
    else if (e.key === 'Enter') {
      e.preventDefault();
      
      if (selectedIndex >= 0) {
        // Determine if selection is from recent searches or suggestions
        if (selectedIndex < recentCount) {
          handleSelect(recentSearches[selectedIndex]);
        } else {
          handleSelect(suggestions[selectedIndex - recentCount]);
        }
      }
    } 
    // Escape
    else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };
  
  // Close suggestions on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleOutsideClick);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);
  
  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);
  
  // Check if we should show recent searches
  const hasRecentSearches = recentSearches.length > 0;
  // Check if we have any content to show
  const hasContent = hasRecentSearches || suggestions.length > 0 || noResults;

  return (
    <div className="relative w-full">
      <Input
        ref={inputRef}
        label={label}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (query.length >= 2) {
            setIsOpen(true);
          } else if (recentSearches.length > 0) {
            // Show recent searches even if query is empty
            setIsOpen(true);
          }
        }}
        startContent={
          isLoading ? (
            <Spinner size="sm" color="primary" />
          ) : (
            <Icon icon={icon} className="text-default-400" />
          )
        }
        isRequired={required}
        isDisabled={disabled}
      />
      
      {error && <div className="text-danger text-xs mt-1">{error}</div>}
      
      {isOpen && hasContent && (
        <div 
          ref={suggestionsRef}
          className="absolute z-50 w-full max-h-64 mt-1 overflow-y-auto bg-content1 shadow-lg rounded-lg border border-default-200 dark:border-default-100"
        >
          {/* Recent Searches Section */}
          {hasRecentSearches && (
            <div className="border-b border-default-200 dark:border-default-100">
              <div className="px-2 py-1 text-xs text-default-500 bg-default-100 font-medium">
                Recent Searches
              </div>
              
              {recentSearches.map((airport, index) => (
                <div 
                  key={`recent-${airport.iata}-${index}`}
                  className={`
                    p-2 cursor-pointer hover:bg-default-100 
                    ${selectedIndex === index ? 'bg-default-100' : ''}
                  `}
                  onClick={() => handleSelect(airport)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-center">
                    <Icon icon="lucide:clock" className="mr-2 text-default-400" />
                    <div className="mr-2 bg-primary/10 text-primary rounded px-2 py-0.5 font-mono font-semibold">
                      {airport.iata}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{airport.city}</div>
                      <div className="text-xs text-default-500 truncate">{airport.name}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Search Results Section */}
          {suggestions.length > 0 && (
            <div>
              {hasRecentSearches && (
                <div className="px-2 py-1 text-xs text-default-500 bg-default-100 font-medium">
                  Search Results
                </div>
              )}
              
              {suggestions.map((airport, index) => (
                <div 
                  key={airport.iata || airport.icao}
                  className={`
                    p-2 cursor-pointer hover:bg-default-100 
                    ${selectedIndex === (hasRecentSearches ? index + recentSearches.length : index) ? 'bg-default-100' : ''}
                  `}
                  onClick={() => handleSelect(airport)}
                  onMouseEnter={() => setSelectedIndex(hasRecentSearches ? index + recentSearches.length : index)}
                >
                  <div className="flex items-center">
                    <div className="mr-2 bg-primary/10 text-primary rounded px-2 py-0.5 font-mono font-semibold">
                      {airport.iata || airport.icao}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{airport.city}</div>
                      <div className="text-xs text-default-500 truncate">{airport.name}</div>
                    </div>
                    <div className="text-xs text-default-400 ml-1">{airport.country}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* No Results Message */}
          {noResults && suggestions.length === 0 && (
            <div className="p-3 text-center text-default-500">
              <Icon icon="lucide:search-x" className="mx-auto mb-2 text-default-400" width={24} />
              <p>No airports found for "{debouncedQuery}"</p>
              <p className="text-xs mt-1">Try a different search term or airport code</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AirportAutocomplete; 