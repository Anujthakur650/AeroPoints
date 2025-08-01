# XNA to DFW Flight Data Comparison: Current Placeholders vs Real Available Data (Economy)

## What We Currently Show (with placeholders):

```javascript
{
  airline: "AA",
  departure_time: "7:00 AM",     // PLACEHOLDER - not from API
  arrival_time: "8:00 AM",       // PLACEHOLDER - not from API  
  duration: "1h 0m",             // PLACEHOLDER - not from API
  stops: "Non-stop",             // Guessed from YDirect field
  mileage_cost: 10000,            // Example data
  available_seats: 5              // Example data
}
```

## What Real Data We Could Show:

### Example: Direct Flight (American Airlines)
```javascript
{
  airline: "AA",
  flight_number: "AA1234",
  departure_time: "2025-07-30T13:00:00Z",  // Real: 8:00 AM
  arrival_time: "2025-07-30T14:15:00Z",    // Real: 9:15 AM
  duration: 75,                            // Real: 1h 15m
  duration_formatted: "1h 15m",
  stops: 0,
  aircraft: "Embraer 175",
  mileage_cost: 10000,
  cabin: "economy"
}
```

## Key Differences:

1. **Departure/Arrival Times**: 
   - Current: Hardcoded placeholders like "7:00 AM"
   - Real: Actual ISO timestamps "2025-07-30T13:00:00Z"

2. **Duration**:
   - Current: Placeholder "1h 0m" 
   - Real: Exact minutes (75) that we can format

3. **Flight Details**:
   - Current: Only airline code
   - Real: Flight numbers, aircraft types

## Implementation Strategy:

1. **Backend Changes Needed**:
   - After search API call, ensure flight IDs are used to get real details
   - Merge real timing data with search results
   - Return enriched data to frontend

2. **Frontend Changes Needed**:
   - Update FlightCard component to display real times
   - Format duration from minutes to "Xh Ym"
   - Ensure flight numbers and aircraft types are shown

