import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { AirportSearch } from './components/AirportSearch';
import { airportManager } from './utils/airportData';
import { validateAirportSearch } from './utils/airportSearch';
import { FEATURES } from './config/features';
export function AirportSearchTest() {
    const [origin, setOrigin] = useState('');
    const [destination, setDestination] = useState('');
    const [distance, setDistance] = useState(null);
    const [validationStatus, setValidationStatus] = useState('pending');
    const [validationMessage, setValidationMessage] = useState('Validating airport data...');
    const [originDetails, setOriginDetails] = useState(null);
    const [destinationDetails, setDestinationDetails] = useState(null);
    const [featureEnabled, setFeatureEnabled] = useState(FEATURES.USE_NEW_AIRPORT_SEARCH);
    // Validate the airport search implementation
    useEffect(() => {
        async function runValidation() {
            try {
                const isValid = await validateAirportSearch();
                setValidationStatus(isValid ? 'success' : 'failed');
                setValidationMessage(isValid
                    ? 'Airport data loaded successfully! You can now search for airports.'
                    : 'Airport data validation failed. Using fallback data.');
            }
            catch (error) {
                console.error('Error during validation:', error);
                setValidationStatus('failed');
                setValidationMessage('An error occurred during validation. Using fallback data.');
            }
        }
        runValidation();
    }, []);
    // Update airport details when origin or destination changes
    useEffect(() => {
        if (origin) {
            const details = airportManager.getAirport(origin);
            setOriginDetails(details || null);
        }
        else {
            setOriginDetails(null);
        }
    }, [origin]);
    useEffect(() => {
        if (destination) {
            const details = airportManager.getAirport(destination);
            setDestinationDetails(details || null);
        }
        else {
            setDestinationDetails(null);
        }
    }, [destination]);
    // Calculate distance when both origin and destination are set
    useEffect(() => {
        if (origin && destination) {
            const calculatedDistance = airportManager.calculateDistance(origin, destination);
            setDistance(calculatedDistance);
        }
        else {
            setDistance(null);
        }
    }, [origin, destination]);
    // Toggle feature flag
    const toggleFeature = () => {
        const newValue = !featureEnabled;
        // In a real app, you'd persist this to a user setting or local storage
        // Here we're just updating the UI state
        setFeatureEnabled(newValue);
        Object.defineProperty(FEATURES, 'USE_NEW_AIRPORT_SEARCH', {
            value: newValue,
            writable: true,
            configurable: true
        });
    };
    return (_jsxs("div", { className: "container mx-auto px-4 py-8 max-w-4xl", children: [_jsxs("div", { className: "mb-8 text-center", children: [_jsx("h1", { className: "text-3xl font-bold mb-4 text-white", children: "Airport Search Test" }), _jsx("p", { className: "text-lg text-gray-300 mb-4", children: "This page demonstrates the integration with the airport data from datahub.io." }), _jsx("div", { className: `p-4 mb-6 rounded-lg ${validationStatus === 'success' ? 'bg-green-900/30' :
                            validationStatus === 'failed' ? 'bg-red-900/30' : 'bg-gray-900/30'}`, children: _jsx("p", { className: "text-gray-200", children: validationMessage }) }), _jsxs("div", { className: "flex items-center justify-center mb-6", children: [_jsx("span", { className: "mr-3 text-gray-300", children: "Use CSV Data:" }), _jsx("button", { onClick: toggleFeature, className: `px-4 py-2 rounded-lg transition-colors ${featureEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'}`, children: featureEnabled ? 'Enabled' : 'Disabled' })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6 mb-8", children: [_jsxs("div", { children: [_jsx(AirportSearch, { value: origin, onChange: setOrigin, label: "Origin", placeholder: "Search for an airport or city" }), originDetails && (_jsxs("div", { className: "mt-4 p-4 bg-gray-800 rounded-lg", children: [_jsx("h3", { className: "font-semibold text-white mb-2", children: originDetails.name }), _jsxs("p", { className: "text-gray-300", children: ["City: ", originDetails.city] }), _jsxs("p", { className: "text-gray-300", children: ["Country: ", originDetails.country] }), _jsxs("p", { className: "text-gray-300", children: ["Coordinates: ", originDetails.coordinates[0].toFixed(4), ", ", originDetails.coordinates[1].toFixed(4)] }), originDetails.elevation_ft && (_jsxs("p", { className: "text-gray-300", children: ["Elevation: ", originDetails.elevation_ft, " ft"] }))] }))] }), _jsxs("div", { children: [_jsx(AirportSearch, { value: destination, onChange: setDestination, label: "Destination", placeholder: "Search for an airport or city" }), destinationDetails && (_jsxs("div", { className: "mt-4 p-4 bg-gray-800 rounded-lg", children: [_jsx("h3", { className: "font-semibold text-white mb-2", children: destinationDetails.name }), _jsxs("p", { className: "text-gray-300", children: ["City: ", destinationDetails.city] }), _jsxs("p", { className: "text-gray-300", children: ["Country: ", destinationDetails.country] }), _jsxs("p", { className: "text-gray-300", children: ["Coordinates: ", destinationDetails.coordinates[0].toFixed(4), ", ", destinationDetails.coordinates[1].toFixed(4)] }), destinationDetails.elevation_ft && (_jsxs("p", { className: "text-gray-300", children: ["Elevation: ", destinationDetails.elevation_ft, " ft"] }))] }))] })] }), distance !== null && (_jsxs("div", { className: "p-6 bg-gray-800/50 rounded-lg text-center", children: [_jsx("h2", { className: "text-xl font-bold text-white mb-2", children: "Flight Distance" }), _jsxs("p", { className: "text-3xl font-bold text-blue-400", children: [distance.toFixed(0), " km"] }), _jsxs("p", { className: "text-gray-400 mt-2", children: ["(", Math.round(distance * 0.621371), " miles)"] })] })), _jsxs("div", { className: "mt-8 p-6 bg-gray-800/30 rounded-lg", children: [_jsx("h2", { className: "text-lg font-semibold text-white mb-4", children: "Implementation Details" }), _jsxs("ul", { className: "list-disc pl-5 text-gray-300 space-y-2", children: [_jsxs("li", { children: ["Data Source: ", _jsx("a", { href: "https://r2.datahub.io/clt98lrmc000fl708ilem2s44/main/raw/data/airport-codes.csv", className: "text-blue-400 hover:underline", target: "_blank", rel: "noopener noreferrer", children: "datahub.io Airport Codes CSV" })] }), _jsx("li", { children: "Search Technology: Fuzzy search with Fuse.js for better matching" }), _jsx("li", { children: "Fallback Mechanism: Hard-coded popular airports if CSV fetch fails" }), _jsx("li", { children: "Distance Calculation: Haversine formula for accurate distances" }), _jsx("li", { children: "Feature Flag: Toggle between implementations with validation" })] })] })] }));
}
