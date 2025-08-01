# Flight Data Comparison: Current Placeholders vs Real Available Data

## What We Currently Show (with placeholders):

```javascript
{
  airline: "BA",
  departure_time: "10:00 AM",     // PLACEHOLDER - not from API
  arrival_time: "6:00 PM",        // PLACEHOLDER - not from API  
  duration: "7h 15m",             // PLACEHOLDER - not from API
  stops: "Non-stop",              // Guessed from YDirect field
  mileage_cost: 30000,            // Real from search API
  available_seats: 4              // Real from search API
}
```

## What Real Data We Can Show:

### Example 1: Direct Flight (BA176)
```javascript
{
  airline: "BA",
  flight_number: "BA176",
  departure_time: "2025-08-14T19:30:00Z",  // Real: 7:30 PM
  arrival_time: "2025-08-15T07:45:00Z",    // Real: 7:45 AM (+1 day)
  duration: 435,                           // Real: 7h 15m
  duration_formatted: "7h 15m",
  stops: 0,
  aircraft: "Boeing 777",
  mileage_cost: 30000,
  cabin: "economy"
}
```

### Example 2: One-Stop Flight (QR via Doha)
```javascript
{
  airline: "QR",
  flight_numbers: "QR704, QR007",
  departure_time: "2025-08-14T11:20:00Z",  // Real: 11:20 AM
  arrival_time: "2025-08-15T14:10:00Z",    // Real: 2:10 PM (+1 day)
  duration: 1310,                          // Real: 21h 50m
  duration_formatted: "21h 50m",
  stops: 1,
  connections: ["DOH"],
  segments: [
    {
      flight: "QR704",
      from: "JFK",
      to: "DOH",
      departs: "2025-08-14T11:20:00Z",
      arrives: "2025-08-15T06:40:00Z",
      aircraft: "Boeing 777-300ER"
    },
    {
      flight: "QR007", 
      from: "DOH",
      to: "LHR",
      departs: "2025-08-15T08:55:00Z",
      arrives: "2025-08-15T14:10:00Z",
      aircraft: "Boeing 777-300ER",
      layover_duration: 135  // 2h 15m layover in Doha
    }
  ],
  mileage_cost: 94500,
  cabin: "economy"
}
```

## Key Differences:

1. **Departure/Arrival Times**: 
   - Current: Hardcoded placeholders like "10:00 AM"
   - Real: Actual ISO timestamps "2025-08-14T19:30:00Z"

2. **Duration**:
   - Current: Placeholder "7h 15m" 
   - Real: Exact minutes (435) that we can format

3. **Flight Details**:
   - Current: Only airline code
   - Real: Flight numbers, aircraft types

4. **Connections**:
   - Current: Just "1 stop" or "Non-stop"
   - Real: Detailed segments with layover times and airports

5. **Multiple Cabin Options**:
   - Current: Shows all cabins in one card
   - Real: Separate trip details for each cabin class

## Implementation Strategy:

1. **Backend Changes Needed**:
   - After search API call, collect all flight IDs
   - Make batch calls to trip details API
   - Merge real timing data with search results
   - Return enriched data to frontend

2. **Frontend Changes Needed**:
   - Update FlightCard component to display real times
   - Format duration from minutes to "Xh Ym"
   - Show connection details for multi-stop flights
   - Display aircraft type and flight numbers
