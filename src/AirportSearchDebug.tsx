import React, { useState, useEffect } from 'react';
import { airportManager } from './utils/airportData';
import { FEATURES } from './config/features';

export function AirportSearchDebug() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [status, setStatus] = useState<string>('initializing');
  const [airportCount, setAirportCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  const [downloadStatus, setDownloadStatus] = useState<string>('');
  
  // Log error messages that might appear in the console
  const logError = (message: string) => {
    setErrors(prev => [...prev, `[${new Date().toISOString()}] ${message}`]);
  };
  
  // Override console.error to capture errors
  useEffect(() => {
    const originalConsoleError = console.error;
    const originalConsoleWarn = console.warn;
    
    console.error = (...args) => {
      originalConsoleError(...args);
      logError(`ERROR: ${args.join(' ')}`);
    };
    
    console.warn = (...args) => {
      originalConsoleWarn(...args);
      logError(`WARNING: ${args.join(' ')}`);
    };
    
    return () => {
      console.error = originalConsoleError;
      console.warn = originalConsoleWarn;
    };
  }, []);
  
  // Monitor airport data initialization
  useEffect(() => {
    setStatus('Initializing airport data...');
    
    // Poll the airport count every second
    const interval = setInterval(() => {
      try {
        // Check if there are any airports
        const searchResults = airportManager.search('a');
        const count = searchResults.length;
        setAirportCount(count);
        
        if (count > 0) {
          setStatus(`Airport data loaded successfully (${count} airports available)`);
          clearInterval(interval);
        }
      } catch (error) {
        setStatus(`Error checking airports: ${error}`);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleSearch = () => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    try {
      setStatus('Searching...');
      const searchResults = airportManager.search(query);
      setResults(searchResults);
      setStatus(`Found ${searchResults.length} results for "${query}"`);
    } catch (error) {
      setStatus(`Search error: ${error}`);
      setResults([]);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      setDownloadStatus('Starting download...');
      const response = await fetch('https://r2.datahub.io/clt98lrmc000fl708ilem2s44/main/raw/data/airport-codes.csv');
      
      if (!response.ok) {
        setDownloadStatus(`Download failed: ${response.status} ${response.statusText}`);
        return;
      }
      
      setDownloadStatus('Processing data...');
      const text = await response.text();
      
      // Create blob and download link
      const blob = new Blob([text], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      
      // Create link and click it
      const a = document.createElement('a');
      a.href = url;
      a.download = 'airport-codes.csv';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      setDownloadStatus(`Downloaded ${text.length} bytes successfully`);
    } catch (error) {
      setDownloadStatus(`Download error: ${error}`);
    }
  };
  
  const checkLocalFile = async () => {
    try {
      const filePaths = [
        '/data/airport-codes.csv', 
        '../public/data/airport-codes.csv', 
        'public/data/airport-codes.csv'
      ];
      
      let foundFile = false;
      let fileContent = '';
      
      for (const path of filePaths) {
        try {
          setStatus(`Checking ${path}...`);
          const response = await fetch(path);
          
          if (response.ok) {
            foundFile = true;
            fileContent = await response.text();
            const lines = fileContent.split('\n');
            setStatus(`File found at ${path}! Contains ${lines.length} lines`);
            logError(`SUCCESS: Found file at ${path} with ${fileContent.length} bytes`);
            break;
          } else {
            logError(`File not found at ${path}: ${response.status} ${response.statusText}`);
          }
        } catch (err) {
          logError(`Error checking ${path}: ${err}`);
        }
      }
      
      if (!foundFile) {
        setStatus(`CSV file not found in any of the expected locations`);
      }
    } catch (error) {
      setStatus(`Error checking local file: ${error}`);
    }
  };
  
  const displaySaveInstructions = () => {
    return (
      <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
        <h3 className="text-lg font-bold text-white mb-2">Manual File Placement Instructions</h3>
        <ol className="list-decimal pl-5 text-sm text-gray-300 space-y-2">
          <li>Download the CSV using the button above</li>
          <li>Save the file to <code className="bg-gray-800 px-2 py-1 rounded text-yellow-300">public/data/airport-codes.csv</code> in your project</li>
          <li>Refresh the page and try the search again</li>
        </ol>
        <div className="mt-4 p-3 bg-gray-900/50 rounded border border-gray-700 text-xs font-mono text-gray-400">
          <p>Alternatively, you can run this script to download the file automatically:</p>
          <pre className="mt-2 overflow-x-auto">
            {`
node download-airport-data.js
            `.trim()}
          </pre>
        </div>
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Airport Search Debug</h1>
      
      <div className="bg-gray-800 p-4 rounded-lg mb-6 text-gray-300">
        <div className="flex items-center mb-4">
          <span className="font-bold mr-2">Feature Flag:</span>
          <span className={FEATURES.USE_NEW_AIRPORT_SEARCH ? "text-green-400" : "text-red-400"}>
            {FEATURES.USE_NEW_AIRPORT_SEARCH ? "ENABLED" : "DISABLED"}
          </span>
        </div>
        
        <div className="flex items-center mb-4">
          <span className="font-bold mr-2">Status:</span>
          <span className={
            status.includes('error') || status.includes('Error') 
              ? "text-red-400" 
              : status.includes('success') 
                ? "text-green-400" 
                : "text-yellow-400"
          }>
            {status}
          </span>
        </div>
        
        <div className="flex items-center mb-4">
          <span className="font-bold mr-2">Airport Count:</span>
          <span className={airportCount > 0 ? "text-green-400" : "text-red-400"}>
            {airportCount}
          </span>
        </div>
        
        <div className="mt-4">
          <button
            onClick={handleDownloadCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg mr-2"
          >
            Download CSV Directly
          </button>
          <button
            onClick={checkLocalFile}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Check Local CSV File
          </button>
          {displaySaveInstructions()}
          {downloadStatus && (
            <div className="mt-2 text-sm">
              <span className="font-bold mr-2">Download Status:</span>
              <span>{downloadStatus}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-grow bg-gray-800 border border-gray-700 rounded-l-lg px-4 py-2 text-white"
          placeholder="Enter airport code or city name"
        />
        <button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r-lg"
        >
          Search
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {results.map((result, index) => (
          <div key={index} className="bg-gray-800 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xl font-bold text-white">{result.city}</div>
                <div className="text-sm text-gray-400">{result.name}</div>
                <div className="text-xs text-gray-500">{result.country}</div>
              </div>
              <div className="text-2xl font-mono text-blue-400">{result.code}</div>
            </div>
          </div>
        ))}
      </div>
      
      {errors.length > 0 && (
        <div className="bg-red-900/30 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-bold mb-2">Error Log</h2>
          <div className="max-h-60 overflow-auto text-sm font-mono">
            {errors.map((error, index) => (
              <div key={index} className="text-red-400 mb-1">{error}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 