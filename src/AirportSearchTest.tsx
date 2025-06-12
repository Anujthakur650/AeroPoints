import { useState, useEffect } from 'react';
import { AirportSearch } from './components/AirportSearch';
import { airportManager } from './utils/airportData';
import { validateAirportSearch } from './utils/airportSearch';
import { FEATURES } from './config/features';
import { Airport } from './types/airport';

export function AirportSearchTest() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [validationStatus, setValidationStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [validationMessage, setValidationMessage] = useState('Validating airport data...');
  const [originDetails, setOriginDetails] = useState<Airport | null>(null);
  const [destinationDetails, setDestinationDetails] = useState<Airport | null>(null);
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
      } catch (error) {
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
    } else {
      setOriginDetails(null);
    }
  }, [origin]);

  useEffect(() => {
    if (destination) {
      const details = airportManager.getAirport(destination);
      setDestinationDetails(details || null);
    } else {
      setDestinationDetails(null);
    }
  }, [destination]);

  // Calculate distance when both origin and destination are set
  useEffect(() => {
    if (origin && destination) {
      const calculatedDistance = airportManager.calculateDistance(origin, destination);
      setDistance(calculatedDistance);
    } else {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-4 text-white">Airport Search Test</h1>
        <p className="text-lg text-gray-300 mb-4">
          This page demonstrates the integration with the airport data from datahub.io.
        </p>
        
        <div className={`p-4 mb-6 rounded-lg ${
          validationStatus === 'success' ? 'bg-green-900/30' : 
          validationStatus === 'failed' ? 'bg-red-900/30' : 'bg-gray-900/30'
        }`}>
          <p className="text-gray-200">
            {validationMessage}
          </p>
        </div>
        
        <div className="flex items-center justify-center mb-6">
          <span className="mr-3 text-gray-300">Use CSV Data:</span>
          <button 
            onClick={toggleFeature}
            className={`px-4 py-2 rounded-lg transition-colors ${
              featureEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {featureEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <AirportSearch
            value={origin}
            onChange={setOrigin}
            label="Origin"
            placeholder="Search for an airport or city"
          />
          
          {originDetails && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-white mb-2">{originDetails.name}</h3>
              <p className="text-gray-300">City: {originDetails.city}</p>
              <p className="text-gray-300">Country: {originDetails.country}</p>
              <p className="text-gray-300">
                Coordinates: {originDetails.coordinates[0].toFixed(4)}, {originDetails.coordinates[1].toFixed(4)}
              </p>
              {originDetails.elevation_ft && (
                <p className="text-gray-300">Elevation: {originDetails.elevation_ft} ft</p>
              )}
            </div>
          )}
        </div>
        
        <div>
          <AirportSearch
            value={destination}
            onChange={setDestination}
            label="Destination"
            placeholder="Search for an airport or city"
          />
          
          {destinationDetails && (
            <div className="mt-4 p-4 bg-gray-800 rounded-lg">
              <h3 className="font-semibold text-white mb-2">{destinationDetails.name}</h3>
              <p className="text-gray-300">City: {destinationDetails.city}</p>
              <p className="text-gray-300">Country: {destinationDetails.country}</p>
              <p className="text-gray-300">
                Coordinates: {destinationDetails.coordinates[0].toFixed(4)}, {destinationDetails.coordinates[1].toFixed(4)}
              </p>
              {destinationDetails.elevation_ft && (
                <p className="text-gray-300">Elevation: {destinationDetails.elevation_ft} ft</p>
              )}
            </div>
          )}
        </div>
      </div>
      
      {distance !== null && (
        <div className="p-6 bg-gray-800/50 rounded-lg text-center">
          <h2 className="text-xl font-bold text-white mb-2">Flight Distance</h2>
          <p className="text-3xl font-bold text-blue-400">
            {distance.toFixed(0)} km
          </p>
          <p className="text-gray-400 mt-2">
            ({Math.round(distance * 0.621371)} miles)
          </p>
        </div>
      )}
      
      <div className="mt-8 p-6 bg-gray-800/30 rounded-lg">
        <h2 className="text-lg font-semibold text-white mb-4">Implementation Details</h2>
        <ul className="list-disc pl-5 text-gray-300 space-y-2">
          <li>Data Source: <a href="https://r2.datahub.io/clt98lrmc000fl708ilem2s44/main/raw/data/airport-codes.csv" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">datahub.io Airport Codes CSV</a></li>
          <li>Search Technology: Fuzzy search with Fuse.js for better matching</li>
          <li>Fallback Mechanism: Hard-coded popular airports if CSV fetch fails</li>
          <li>Distance Calculation: Haversine formula for accurate distances</li>
          <li>Feature Flag: Toggle between implementations with validation</li>
        </ul>
      </div>
    </div>
  );
} 