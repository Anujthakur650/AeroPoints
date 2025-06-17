import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { FEATURES } from '../config/features';
import { airportManager } from '../utils/airportData';
import { validateAirportSearch } from '../utils/airportSearch';
export function AirportSearch(props) {
    const [isNewImplementationValid, setIsNewImplementationValid] = useState(false);
    useEffect(() => {
        async function validateImplementation() {
            const isValid = await validateAirportSearch();
            setIsNewImplementationValid(isValid);
            if (FEATURES.DEBUG_MODE) {
                console.log('Airport search validation:', isValid ? 'passed' : 'failed');
            }
        }
        validateImplementation();
    }, []);
    // Use new implementation only if feature flag is on and validation passed
    const shouldUseNewImplementation = FEATURES.USE_NEW_AIRPORT_SEARCH && isNewImplementationValid;
    if (shouldUseNewImplementation) {
        return _jsx(NewAirportSearch, { ...props });
    }
    return _jsx(LegacyAirportSearch, { ...props });
}
// Existing implementation remains unchanged
function LegacyAirportSearch(props) {
    const { value, onChange, label, placeholder } = props;
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    // Pre-populate with value if available
    useEffect(() => {
        if (value) {
            // Find the airport by code in popularDestinations
            const airport = popularDestinations.find(a => a.code === value);
            if (airport) {
                setQuery(`${airport.city} (${airport.code})`);
            }
            else {
                setQuery(value);
            }
        }
    }, [value]);
    const handleSearch = (searchQuery) => {
        setQuery(searchQuery);
        if (searchQuery.length < 2) {
            setResults([]);
            return;
        }
        const searchLower = searchQuery.toLowerCase();
        // Search in popular destinations
        const matchedAirports = popularDestinations.filter(airport => airport.city.toLowerCase().includes(searchLower) ||
            airport.code.toLowerCase().includes(searchLower) ||
            airport.airport.toLowerCase().includes(searchLower)).slice(0, 10);
        setResults(matchedAirports);
    };
    const handleSelect = (airport) => {
        setQuery(`${airport.city} (${airport.code})`);
        setResults([]);
        onChange(airport.code);
    };
    return (_jsxs("div", { className: "relative", children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-1", children: label }), _jsx("input", { type: "text", className: "w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent", value: query, onChange: (e) => handleSearch(e.target.value), placeholder: placeholder || "Enter city or airport code" }), results.length > 0 && (_jsx("ul", { className: "absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-auto shadow-xl", children: results.map((airport) => (_jsxs("li", { className: "flex justify-between p-3 hover:bg-gray-700 cursor-pointer", onClick: () => handleSelect(airport), children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-white", children: airport.city }), _jsx("div", { className: "text-sm text-gray-400", children: airport.airport })] }), _jsx("div", { className: "text-blue-400 font-mono text-lg", children: airport.code })] }, airport.code))) }))] }));
}
// New implementation with additional features
function NewAirportSearch({ value, onChange, label, placeholder }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedAirport, setSelectedAirport] = useState(null);
    useEffect(() => {
        if (value && !selectedAirport) {
            const airport = airportManager.getAirport(value);
            if (airport) {
                setSelectedAirport({
                    code: airport.iata_code,
                    city: airport.city,
                    name: airport.name,
                    country: airport.country,
                    type: 'airport'
                });
                setQuery(`${airport.city} (${airport.iata_code})`);
            }
        }
    }, [value]);
    const handleSearch = (searchQuery) => {
        setQuery(searchQuery);
        if (searchQuery.length >= 2) {
            const searchResults = airportManager.search(searchQuery);
            setResults(searchResults);
        }
        else {
            setResults([]);
        }
    };
    const handleSelect = (airport) => {
        setSelectedAirport(airport);
        setQuery(`${airport.city} (${airport.code})`);
        setResults([]);
        onChange(airport.code);
    };
    return (_jsxs("div", { className: "relative", children: [_jsx("label", { className: "block text-sm font-medium text-gray-300 mb-1", children: label }), _jsx("input", { type: "text", className: "w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent", value: query, onChange: (e) => handleSearch(e.target.value), placeholder: placeholder || "Enter city or airport code" }), results.length > 0 && (_jsx("ul", { className: "absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg max-h-60 overflow-auto shadow-xl", children: results.map((airport) => (_jsxs("li", { className: "flex justify-between p-3 hover:bg-gray-700 cursor-pointer", onClick: () => handleSelect(airport), children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium text-white", children: airport.city }), _jsx("div", { className: "text-sm text-gray-400", children: airport.name })] }), _jsx("div", { className: "text-blue-400 font-mono text-lg", children: airport.code })] }, airport.code))) }))] }));
}
// Popular destinations fallback
const popularDestinations = [
    // Major USA Airports by City
    // New York Area
    { city: "New York", code: "JFK", airport: "John F. Kennedy International Airport", country: "United States" },
    { city: "New York", code: "LGA", airport: "LaGuardia Airport", country: "United States" },
    { city: "New York", code: "EWR", airport: "Newark Liberty International Airport", country: "United States" },
    // Los Angeles Area
    { city: "Los Angeles", code: "LAX", airport: "Los Angeles International Airport", country: "United States" },
    { city: "Los Angeles", code: "BUR", airport: "Hollywood Burbank Airport", country: "United States" },
    { city: "Los Angeles", code: "SNA", airport: "John Wayne Airport", country: "United States" },
    { city: "Los Angeles", code: "ONT", airport: "Ontario International Airport", country: "United States" },
    // Chicago Area
    { city: "Chicago", code: "ORD", airport: "O'Hare International Airport", country: "United States" },
    { city: "Chicago", code: "MDW", airport: "Chicago Midway International Airport", country: "United States" },
    // San Francisco Bay Area
    { city: "San Francisco", code: "SFO", airport: "San Francisco International Airport", country: "United States" },
    { city: "Oakland", code: "OAK", airport: "Oakland International Airport", country: "United States" },
    { city: "San Jose", code: "SJC", airport: "San Jose International Airport", country: "United States" },
    // Dallas/Fort Worth Area
    { city: "Dallas", code: "DFW", airport: "Dallas/Fort Worth International Airport", country: "United States" },
    { city: "Dallas", code: "DAL", airport: "Dallas Love Field", country: "United States" },
    // Other Major US Cities
    { city: "Atlanta", code: "ATL", airport: "Hartsfield-Jackson Atlanta International Airport", country: "United States" },
    { city: "Boston", code: "BOS", airport: "Boston Logan International Airport", country: "United States" },
    { city: "Denver", code: "DEN", airport: "Denver International Airport", country: "United States" },
    { city: "Houston", code: "IAH", airport: "George Bush Intercontinental Airport", country: "United States" },
    { city: "Houston", code: "HOU", airport: "William P. Hobby Airport", country: "United States" },
    { city: "Las Vegas", code: "LAS", airport: "Harry Reid International Airport", country: "United States" },
    { city: "Miami", code: "MIA", airport: "Miami International Airport", country: "United States" },
    { city: "Miami", code: "FLL", airport: "Fort Lauderdale-Hollywood International Airport", country: "United States" },
    { city: "Minneapolis", code: "MSP", airport: "Minneapolis–Saint Paul International Airport", country: "United States" },
    { city: "Orlando", code: "MCO", airport: "Orlando International Airport", country: "United States" },
    { city: "Philadelphia", code: "PHL", airport: "Philadelphia International Airport", country: "United States" },
    { city: "Phoenix", code: "PHX", airport: "Phoenix Sky Harbor International Airport", country: "United States" },
    { city: "San Diego", code: "SAN", airport: "San Diego International Airport", country: "United States" },
    { city: "Seattle", code: "SEA", airport: "Seattle-Tacoma International Airport", country: "United States" },
    { city: "Washington DC", code: "IAD", airport: "Dulles International Airport", country: "United States" },
    { city: "Washington DC", code: "DCA", airport: "Ronald Reagan Washington National Airport", country: "United States" },
    { city: "Washington DC", code: "BWI", airport: "Baltimore/Washington International Airport", country: "United States" },
    // International Popular Destinations
    { city: "London", code: "LHR", airport: "Heathrow Airport", country: "United Kingdom" },
    { city: "London", code: "LGW", airport: "Gatwick Airport", country: "United Kingdom" },
    { city: "Tokyo", code: "HND", airport: "Haneda Airport", country: "Japan" },
    { city: "Tokyo", code: "NRT", airport: "Narita International Airport", country: "Japan" },
    { city: "Paris", code: "CDG", airport: "Charles de Gaulle Airport", country: "France" },
    { city: "Paris", code: "ORY", airport: "Orly Airport", country: "France" },
    { city: "Dubai", code: "DXB", airport: "Dubai International Airport", country: "United Arab Emirates" },
    { city: "Singapore", code: "SIN", airport: "Singapore Changi Airport", country: "Singapore" },
    { city: "Hong Kong", code: "HKG", airport: "Hong Kong International Airport", country: "China" },
    { city: "Sydney", code: "SYD", airport: "Sydney Airport", country: "Australia" },
    { city: "Toronto", code: "YYZ", airport: "Toronto Pearson International Airport", country: "Canada" },
    { city: "Vancouver", code: "YVR", airport: "Vancouver International Airport", country: "Canada" }
];
