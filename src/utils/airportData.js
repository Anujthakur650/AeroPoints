import Fuse from 'fuse.js';
class AirportDataManager {
    constructor() {
        Object.defineProperty(this, "airports", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "searchIndex", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "isInitialized", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "isInitializing", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        this.initialize();
    }
    /**
     * Initialize the airport data by fetching the CSV
     */
    async initialize() {
        if (this.isInitialized || this.isInitializing)
            return;
        this.isInitializing = true;
        try {
            await this.fetchAirportData();
            this.initializeSearchIndex();
            this.isInitialized = true;
            console.log(`Airport data initialized with ${this.airports.size} airports`);
        }
        catch (error) {
            console.error('Failed to initialize airport data:', error);
        }
        finally {
            this.isInitializing = false;
        }
    }
    /**
     * Fetch airport data from datahub.io
     */
    async fetchAirportData() {
        // Define multiple URLs to try, including CORS proxies and local file
        const urlsToTry = [
            // Local file (most reliable)
            '/data/airport-codes.csv', // This should map to public/data/airport-codes.csv
            '../public/data/airport-codes.csv', // Try relative path
            'public/data/airport-codes.csv', // Try another relative path
            'https://r2.datahub.io/clt98lrmc000fl708ilem2s44/main/raw/data/airport-codes.csv',
            'https://cors-anywhere.herokuapp.com/https://r2.datahub.io/clt98lrmc000fl708ilem2s44/main/raw/data/airport-codes.csv',
            'https://api.allorigins.win/raw?url=https://r2.datahub.io/clt98lrmc000fl708ilem2s44/main/raw/data/airport-codes.csv'
        ];
        let lastError;
        // Try each URL in sequence
        for (const url of urlsToTry) {
            try {
                console.log(`Fetching airport data from ${url}...`);
                const response = await fetch(url);
                console.log(`Response status for ${url}: ${response.status} ${response.statusText}`);
                if (!response.ok) {
                    console.warn(`Failed to fetch from ${url}: ${response.status} ${response.statusText}`);
                    continue; // Try next URL
                }
                const csvText = await response.text();
                console.log(`Received CSV data (${csvText.length} bytes) from ${url}`);
                if (csvText.length < 100) {
                    console.log(`CSV content preview: "${csvText}"`);
                }
                else {
                    console.log(`CSV first 100 chars: "${csvText.substring(0, 100)}..."`);
                }
                if (!csvText || csvText.trim().length === 0) {
                    console.warn(`Received empty CSV data from ${url}`);
                    continue; // Try next URL
                }
                // Check if the data looks like a CSV (contains commas and newlines)
                if (!csvText.includes(',') || !csvText.includes('\n')) {
                    console.warn(`Data from ${url} does not appear to be CSV format`);
                    continue; // Try next URL
                }
                console.log(`Parsing CSV data (${csvText.length} characters)...`);
                this.parseCSV(csvText);
                if (this.airports.size === 0) {
                    console.warn(`No airports were parsed from ${url}`);
                    continue; // Try next URL
                }
                console.log(`Successfully parsed ${this.airports.size} airports from ${url}`);
                return; // Success! No need to try other URLs
            }
            catch (error) {
                console.warn(`Error fetching from ${url}:`, error);
                lastError = error;
            }
        }
        // If we get here, all URLs failed
        console.error('All data sources failed:', lastError);
        console.warn('Falling back to hard-coded airports list');
        this.populateFallbackAirports();
        console.log(`Added ${this.airports.size} fallback airports`);
    }
    /**
     * Initialize the Fuse.js search index
     */
    initializeSearchIndex() {
        const airportsArray = Array.from(this.airports.values());
        this.searchIndex = new Fuse(airportsArray, {
            keys: [
                { name: 'iata_code', weight: 10 },
                { name: 'city', weight: 8 },
                { name: 'name', weight: 5 },
                { name: 'country', weight: 3 }
            ],
            threshold: 0.3,
            includeScore: true
        });
    }
    /**
     * Parse the CSV data and populate the airports map with improved handling
     */
    parseCSV(csv) {
        console.log('Starting CSV parsing with improved parser...');
        // First split into lines and check data validity
        const lines = csv.split('\n');
        console.log(`CSV contains ${lines.length} lines`);
        if (lines.length <= 1) {
            console.error('CSV data is empty or invalid');
            return;
        }
        // Parse header line to find column indexes
        const headers = this.parseCSVLine(lines[0]);
        console.log('CSV headers:', headers);
        const iataCodeIndex = headers.indexOf('iata_code');
        const nameIndex = headers.indexOf('name');
        const municipalityIndex = headers.indexOf('municipality');
        const isoCountryIndex = headers.indexOf('iso_country');
        const coordsIndex = headers.indexOf('coordinates');
        const elevationIndex = headers.indexOf('elevation_ft');
        const typeIndex = headers.indexOf('type');
        const isoRegionIndex = headers.indexOf('iso_region');
        console.log('Column indexes:', {
            iataCodeIndex,
            nameIndex,
            municipalityIndex,
            isoCountryIndex,
            coordsIndex,
            elevationIndex,
            typeIndex,
            isoRegionIndex
        });
        // Check if required columns exist
        if (iataCodeIndex === -1) {
            console.error('CSV data is missing iata_code column');
            return;
        }
        let parsedCount = 0;
        let skippedCount = 0;
        const importedCodes = new Set();
        // Process each line
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            if (!line.trim()) {
                skippedCount++;
                continue;
            }
            // Parse the CSV line with quote handling
            const values = this.parseCSVLine(line);
            // Skip if values array is too short
            if (values.length <= iataCodeIndex) {
                skippedCount++;
                continue;
            }
            // Check for valid IATA code (3 letters)
            const iataCode = values[iataCodeIndex]?.trim().toUpperCase();
            if (!iataCode || iataCode.length !== 3 || !/^[A-Z]{3}$/.test(iataCode)) {
                skippedCount++;
                continue;
            }
            // Skip duplicate codes (keep first occurrence)
            if (importedCodes.has(iataCode)) {
                skippedCount++;
                continue;
            }
            // Skip non-airport facilities or closed airports
            const type = values[typeIndex]?.trim();
            if (!type || !type.includes('airport') || (type && type.includes('closed'))) {
                skippedCount++;
                continue;
            }
            // Parse and validate coordinates
            let coordinates = [0, 0];
            if (coordsIndex >= 0 && coordsIndex < values.length) {
                const coordsStr = values[coordsIndex]?.trim().replace(/"/g, '');
                if (coordsStr) {
                    const coordParts = coordsStr.split(',').map(p => parseFloat(p.trim()));
                    if (coordParts.length === 2 && !isNaN(coordParts[0]) && !isNaN(coordParts[1])) {
                        coordinates = [coordParts[0], coordParts[1]];
                    }
                }
            }
            // Extract airport data with defaults for missing values
            const airport = {
                iata_code: iataCode,
                name: nameIndex >= 0 && nameIndex < values.length ? values[nameIndex]?.trim() || '' : '',
                city: municipalityIndex >= 0 && municipalityIndex < values.length ? values[municipalityIndex]?.trim() || '' : '',
                country: isoCountryIndex >= 0 && isoCountryIndex < values.length ? values[isoCountryIndex]?.trim() || '' : '',
                coordinates,
                elevation_ft: elevationIndex >= 0 && elevationIndex < values.length && values[elevationIndex] ?
                    parseInt(values[elevationIndex], 10) : undefined,
                type,
                region: isoRegionIndex >= 0 && isoRegionIndex < values.length ? values[isoRegionIndex]?.trim() : undefined
            };
            // Add to our maps
            this.airports.set(iataCode, airport);
            importedCodes.add(iataCode);
            parsedCount++;
            // Log a few examples
            if (parsedCount <= 3 || parsedCount % 1000 === 0) {
                console.log(`Parsed airport ${parsedCount}:`, airport);
            }
        }
        console.log(`CSV parsing complete. Parsed ${parsedCount} airports, skipped ${skippedCount} entries.`);
    }
    /**
     * Parse a CSV line, handling quoted values
     */
    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            }
            else if (char === ',' && !inQuotes) {
                values.push(current);
                current = '';
            }
            else {
                current += char;
            }
        }
        values.push(current); // Add the last field
        return values;
    }
    /**
     * Fallback method to populate with a larger set of major airports
     */
    populateFallbackAirports() {
        const fallbackAirports = [
            // North America
            {
                iata_code: 'JFK',
                name: 'John F. Kennedy International Airport',
                city: 'New York',
                country: 'US',
                coordinates: [40.6413, -73.7781],
                type: 'large_airport'
            },
            {
                iata_code: 'LAX',
                name: 'Los Angeles International Airport',
                city: 'Los Angeles',
                country: 'US',
                coordinates: [33.9425, -118.4081],
                type: 'large_airport'
            },
            {
                iata_code: 'SFO',
                name: 'San Francisco International Airport',
                city: 'San Francisco',
                country: 'US',
                coordinates: [37.6213, -122.3790],
                type: 'large_airport'
            },
            {
                iata_code: 'ORD',
                name: "O'Hare International Airport",
                city: 'Chicago',
                country: 'US',
                coordinates: [41.9786, -87.9048],
                type: 'large_airport'
            },
            {
                iata_code: 'DFW',
                name: 'Dallas/Fort Worth International Airport',
                city: 'Dallas',
                country: 'US',
                coordinates: [32.8968, -97.0380],
                type: 'large_airport'
            },
            {
                iata_code: 'MIA',
                name: 'Miami International Airport',
                city: 'Miami',
                country: 'US',
                coordinates: [25.7932, -80.2906],
                type: 'large_airport'
            },
            {
                iata_code: 'ATL',
                name: 'Hartsfield-Jackson Atlanta International Airport',
                city: 'Atlanta',
                country: 'US',
                coordinates: [33.6367, -84.4281],
                type: 'large_airport'
            },
            {
                iata_code: 'SEA',
                name: 'Seattle-Tacoma International Airport',
                city: 'Seattle',
                country: 'US',
                coordinates: [47.4499, -122.3117],
                type: 'large_airport'
            },
            {
                iata_code: 'DEN',
                name: 'Denver International Airport',
                city: 'Denver',
                country: 'US',
                coordinates: [39.8561, -104.6737],
                type: 'large_airport'
            },
            {
                iata_code: 'BOS',
                name: 'Boston Logan International Airport',
                city: 'Boston',
                country: 'US',
                coordinates: [42.3643, -71.0052],
                type: 'large_airport'
            },
            {
                iata_code: 'LAS',
                name: 'Harry Reid International Airport',
                city: 'Las Vegas',
                country: 'US',
                coordinates: [36.0840, -115.1537],
                type: 'large_airport'
            },
            {
                iata_code: 'YYZ',
                name: 'Toronto Pearson International Airport',
                city: 'Toronto',
                country: 'CA',
                coordinates: [43.6777, -79.6248],
                type: 'large_airport'
            },
            {
                iata_code: 'YVR',
                name: 'Vancouver International Airport',
                city: 'Vancouver',
                country: 'CA',
                coordinates: [49.1967, -123.1815],
                type: 'large_airport'
            },
            // Europe
            {
                iata_code: 'LHR',
                name: 'Heathrow Airport',
                city: 'London',
                country: 'GB',
                coordinates: [51.4694, -0.4503],
                type: 'large_airport'
            },
            {
                iata_code: 'CDG',
                name: 'Charles de Gaulle Airport',
                city: 'Paris',
                country: 'FR',
                coordinates: [49.0097, 2.5479],
                type: 'large_airport'
            },
            {
                iata_code: 'FRA',
                name: 'Frankfurt Airport',
                city: 'Frankfurt',
                country: 'DE',
                coordinates: [50.0379, 8.5622],
                type: 'large_airport'
            },
            {
                iata_code: 'AMS',
                name: 'Amsterdam Airport Schiphol',
                city: 'Amsterdam',
                country: 'NL',
                coordinates: [52.3086, 4.7639],
                type: 'large_airport'
            },
            {
                iata_code: 'FCO',
                name: 'Leonardo da Vinci–Fiumicino Airport',
                city: 'Rome',
                country: 'IT',
                coordinates: [41.8003, 12.2389],
                type: 'large_airport'
            },
            {
                iata_code: 'MAD',
                name: 'Adolfo Suárez Madrid–Barajas Airport',
                city: 'Madrid',
                country: 'ES',
                coordinates: [40.4983, -3.5676],
                type: 'large_airport'
            },
            {
                iata_code: 'BCN',
                name: 'Barcelona–El Prat Airport',
                city: 'Barcelona',
                country: 'ES',
                coordinates: [41.2971, 2.0785],
                type: 'large_airport'
            },
            {
                iata_code: 'IST',
                name: 'Istanbul Airport',
                city: 'Istanbul',
                country: 'TR',
                coordinates: [41.2753, 28.7519],
                type: 'large_airport'
            },
            {
                iata_code: 'ZRH',
                name: 'Zurich Airport',
                city: 'Zurich',
                country: 'CH',
                coordinates: [47.4647, 8.5492],
                type: 'large_airport'
            },
            // Asia
            {
                iata_code: 'HND',
                name: 'Tokyo Haneda Airport',
                city: 'Tokyo',
                country: 'JP',
                coordinates: [35.5533, 139.7811],
                type: 'large_airport'
            },
            {
                iata_code: 'NRT',
                name: 'Narita International Airport',
                city: 'Tokyo',
                country: 'JP',
                coordinates: [35.7719, 140.3928],
                type: 'large_airport'
            },
            {
                iata_code: 'PEK',
                name: 'Beijing Capital International Airport',
                city: 'Beijing',
                country: 'CN',
                coordinates: [40.0799, 116.6031],
                type: 'large_airport'
            },
            {
                iata_code: 'PVG',
                name: 'Shanghai Pudong International Airport',
                city: 'Shanghai',
                country: 'CN',
                coordinates: [31.1443, 121.8083],
                type: 'large_airport'
            },
            {
                iata_code: 'HKG',
                name: 'Hong Kong International Airport',
                city: 'Hong Kong',
                country: 'HK',
                coordinates: [22.3080, 113.9185],
                type: 'large_airport'
            },
            {
                iata_code: 'ICN',
                name: 'Incheon International Airport',
                city: 'Seoul',
                country: 'KR',
                coordinates: [37.4602, 126.4407],
                type: 'large_airport'
            },
            {
                iata_code: 'SIN',
                name: 'Singapore Changi Airport',
                city: 'Singapore',
                country: 'SG',
                coordinates: [1.3644, 103.9915],
                type: 'large_airport'
            },
            {
                iata_code: 'BKK',
                name: 'Suvarnabhumi Airport',
                city: 'Bangkok',
                country: 'TH',
                coordinates: [13.6900, 100.7501],
                type: 'large_airport'
            },
            {
                iata_code: 'DEL',
                name: 'Indira Gandhi International Airport',
                city: 'New Delhi',
                country: 'IN',
                coordinates: [28.5562, 77.1000],
                type: 'large_airport'
            },
            {
                iata_code: 'BOM',
                name: 'Chhatrapati Shivaji Maharaj International Airport',
                city: 'Mumbai',
                country: 'IN',
                coordinates: [19.0896, 72.8656],
                type: 'large_airport'
            },
            // Middle East
            {
                iata_code: 'DXB',
                name: 'Dubai International Airport',
                city: 'Dubai',
                country: 'AE',
                coordinates: [25.2528, 55.3644],
                type: 'large_airport'
            },
            {
                iata_code: 'AUH',
                name: 'Abu Dhabi International Airport',
                city: 'Abu Dhabi',
                country: 'AE',
                coordinates: [24.4330, 54.6511],
                type: 'large_airport'
            },
            {
                iata_code: 'DOH',
                name: 'Hamad International Airport',
                city: 'Doha',
                country: 'QA',
                coordinates: [25.2609, 51.6138],
                type: 'large_airport'
            },
            // Australia & Oceania
            {
                iata_code: 'SYD',
                name: 'Sydney Kingsford Smith Airport',
                city: 'Sydney',
                country: 'AU',
                coordinates: [-33.9399, 151.1753],
                type: 'large_airport'
            },
            {
                iata_code: 'MEL',
                name: 'Melbourne Airport',
                city: 'Melbourne',
                country: 'AU',
                coordinates: [-37.6690, 144.8410],
                type: 'large_airport'
            },
            {
                iata_code: 'AKL',
                name: 'Auckland Airport',
                city: 'Auckland',
                country: 'NZ',
                coordinates: [-37.0082, 174.7850],
                type: 'large_airport'
            },
            // South America
            {
                iata_code: 'GRU',
                name: 'São Paulo–Guarulhos International Airport',
                city: 'São Paulo',
                country: 'BR',
                coordinates: [-23.4356, -46.4731],
                type: 'large_airport'
            },
            {
                iata_code: 'EZE',
                name: 'Ministro Pistarini International Airport',
                city: 'Buenos Aires',
                country: 'AR',
                coordinates: [-34.8222, -58.5358],
                type: 'large_airport'
            },
            {
                iata_code: 'BOG',
                name: 'El Dorado International Airport',
                city: 'Bogotá',
                country: 'CO',
                coordinates: [4.7016, -74.1469],
                type: 'large_airport'
            },
            {
                iata_code: 'SCL',
                name: 'Santiago International Airport',
                city: 'Santiago',
                country: 'CL',
                coordinates: [-33.3928, -70.7952],
                type: 'large_airport'
            },
            // Africa
            {
                iata_code: 'JNB',
                name: 'O. R. Tambo International Airport',
                city: 'Johannesburg',
                country: 'ZA',
                coordinates: [-26.1392, 28.2461],
                type: 'large_airport'
            },
            {
                iata_code: 'CAI',
                name: 'Cairo International Airport',
                city: 'Cairo',
                country: 'EG',
                coordinates: [30.1219, 31.4056],
                type: 'large_airport'
            },
            {
                iata_code: 'CPT',
                name: 'Cape Town International Airport',
                city: 'Cape Town',
                country: 'ZA',
                coordinates: [-33.9649, 18.6027],
                type: 'large_airport'
            }
        ];
        fallbackAirports.forEach(airport => {
            this.airports.set(airport.iata_code, airport);
        });
        console.log(`Added ${fallbackAirports.length} fallback airports. These are major global airports that should cover most common routes.`);
    }
    /**
     * Search for airports by query
     */
    search(query, limit = 10) {
        // If the search query is very short, return a few popular airports
        if (!query || query.length < 2) {
            // Return first 5 airports if any exist (or empty array if none)
            if (this.airports.size > 0) {
                return Array.from(this.airports.values())
                    .slice(0, 5)
                    .map(airport => ({
                    code: airport.iata_code,
                    city: airport.city,
                    name: airport.name,
                    country: airport.country,
                    type: 'airport'
                }));
            }
            return [];
        }
        // Wait for initialization if needed
        if (!this.isInitialized && !this.isInitializing) {
            console.log('Airport data not initialized yet, triggering initialization...');
            this.initialize();
            // If we have fallback airports, use them for now
            if (this.airports.size > 0) {
                return this.basicSearch(query, limit);
            }
            // Otherwise, return empty results
            return [];
        }
        // If no search index (shouldn't happen), fall back to basic filter
        if (!this.searchIndex) {
            console.log('Search index not available, using basic search');
            return this.basicSearch(query, limit);
        }
        // Perform fuzzy search
        const results = this.searchIndex.search(query);
        return results
            .slice(0, limit)
            .map(result => ({
            code: result.item.iata_code,
            city: result.item.city,
            name: result.item.name,
            country: result.item.country,
            type: 'airport',
            score: result.score
        }));
    }
    /**
     * Basic search fallback when Fuse.js search is not available
     */
    basicSearch(query, limit) {
        const queryLower = query.toLowerCase();
        const results = [];
        // First try exact IATA matches
        if (query.length === 3) {
            const exactMatch = this.airports.get(query.toUpperCase());
            if (exactMatch) {
                results.push({
                    code: exactMatch.iata_code,
                    city: exactMatch.city,
                    name: exactMatch.name,
                    country: exactMatch.country,
                    type: 'airport'
                });
            }
        }
        // Then try partial matches
        if (results.length < limit) {
            for (const airport of this.airports.values()) {
                if (results.length >= limit)
                    break;
                // Skip if already added as exact match
                if (results.some(r => r.code === airport.iata_code))
                    continue;
                // Check for matches in city, name, or code
                if (airport.city.toLowerCase().includes(queryLower) ||
                    airport.name.toLowerCase().includes(queryLower) ||
                    airport.iata_code.toLowerCase().includes(queryLower)) {
                    results.push({
                        code: airport.iata_code,
                        city: airport.city,
                        name: airport.name,
                        country: airport.country,
                        type: 'airport'
                    });
                }
            }
        }
        return results;
    }
    /**
     * Get a specific airport by IATA code
     */
    getAirport(code) {
        if (!code)
            return undefined;
        return this.airports.get(code.toUpperCase());
    }
    /**
     * Calculate distance between two airports
     */
    calculateDistance(from, to) {
        const airport1 = this.getAirport(from);
        const airport2 = this.getAirport(to);
        if (!airport1 || !airport2)
            return null;
        return this.haversineDistance(airport1.coordinates[0], airport1.coordinates[1], airport2.coordinates[0], airport2.coordinates[1]);
    }
    /**
     * Calculate distance using the Haversine formula
     */
    haversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    /**
     * Convert degrees to radians
     */
    toRad(deg) {
        return deg * (Math.PI / 180);
    }
}
// Export a singleton instance
export const airportManager = new AirportDataManager();
