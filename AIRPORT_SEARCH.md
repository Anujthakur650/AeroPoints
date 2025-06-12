# Airport Search Implementation with DataHub.io CSV

This document explains the implementation of the airport search functionality using the airport codes CSV dataset from datahub.io.

## Overview

The implementation provides a robust and efficient airport search component that:

1. Fetches and parses the airport codes CSV from datahub.io
2. Implements fuzzy search with Fuse.js for better matching
3. Provides fallback mechanisms for reliability
4. Calculates flight distances between airports
5. Uses feature flags for safe rollout

## Files

- `src/types/airport.ts` - Type definitions for airports data
- `src/utils/airportData.ts` - Core implementation for CSV parsing and search
- `src/utils/airportSearch.ts` - Validation functions
- `src/components/AirportSearch.tsx` - UI component with legacy and new implementations
- `src/config/features.ts` - Feature flags to control implementation
- `src/AirportSearchTest.tsx` - Test page to demonstrate functionality

## Features

### CSV Data Integration

The implementation fetches the airport codes CSV from datahub.io and parses it to extract relevant information:
- Airport codes (IATA)
- Airport names
- Cities
- Countries
- Coordinates
- Elevation
- Airport types

### Fuzzy Search

Using Fuse.js, the search engine supports:
- Partial matching
- Typo tolerance
- Multi-term search (e.g., "new york" matches "New York JFK")
- Prioritized fields (code, city, name, country)

### Fallback Mechanism

For reliability, the implementation includes:
- Hard-coded popular airports if CSV fetch fails
- Basic search functionality if Fuse.js initialization fails
- Legacy implementation if validation fails

### Distance Calculation

The implementation includes the Haversine formula to calculate the great-circle distance between airports, providing accurate flight distances.

### Feature Flag System

The feature flag system allows:
- Safe rollout with validation
- Easy rollback if issues arise
- Debugging in development mode

## Usage

### Basic Usage

```tsx
import { AirportSearch } from './components/AirportSearch';

function MyComponent() {
  const [origin, setOrigin] = useState('');
  
  return (
    <AirportSearch
      value={origin}
      onChange={setOrigin}
      label="Origin"
      placeholder="Search for an airport or city"
    />
  );
}
```

### Enabling the CSV Implementation

To enable the new CSV-based implementation:

1. Ensure Fuse.js is installed: `npm install fuse.js`
2. Update the feature flag in `src/config/features.ts`:

```typescript
export const FEATURES = {
  USE_NEW_AIRPORT_SEARCH: true, // Set to true to use the CSV implementation
  // ...
};
```

### Testing

The airport search component automatically validates itself when loaded. You can also use the provided test page to verify functionality.

To run the tests:
1. Run the app with `./test-airport-search.sh`
2. Click on the "Airport Search Test" button in the right corner
3. Toggle between implementations and test search functionality

## Rollback

If issues are encountered with the CSV implementation, you can easily disable it by setting the feature flag back to false:

```typescript
export const FEATURES = {
  USE_NEW_AIRPORT_SEARCH: false,
  // ...
};
```

## Data Source

The airport data comes from [datahub.io](https://r2.datahub.io/clt98lrmc000fl708ilem2s44/main/raw/data/airport-codes.csv), which provides a comprehensive database of global airports with their codes, names, locations, and other metadata. 