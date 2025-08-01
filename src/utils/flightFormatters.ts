/**
 * Utility functions for formatting flight data
 */

/**
 * Format ISO date string to time display
 * @param isoString - ISO 8601 date string
 * @returns Formatted time string (e.g., "7:30 PM")
 */
export function formatFlightTime(isoString: string | undefined): string {
  if (!isoString) return 'N/A';
  
  try {
    const date = new Date(isoString);
    // For now, we'll display in UTC to match what the API sends
    // In a real app, we'd convert to the airport's local timezone
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${period}`;
  } catch (e) {
    return isoString; // Return original if parsing fails
  }
}

/**
 * Format ISO date string to date display
 * @param isoString - ISO 8601 date string
 * @returns Formatted date string (e.g., "Aug 14")
 */
export function formatFlightDate(isoString: string | undefined): string {
  if (!isoString) return 'N/A';
  
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return isoString;
  }
}

/**
 * Check if arrival is next day compared to departure
 * @param departureISO - Departure ISO string
 * @param arrivalISO - Arrival ISO string
 * @returns true if arrival is next day or later
 */
export function isNextDay(departureISO: string | undefined, arrivalISO: string | undefined): boolean {
  if (!departureISO || !arrivalISO) return false;
  
  try {
    const departure = new Date(departureISO);
    const arrival = new Date(arrivalISO);
    
    // Compare just the dates
    return arrival.toDateString() !== departure.toDateString();
  } catch (e) {
    return false;
  }
}

/**
 * Get day difference between arrival and departure
 * @param departureISO - Departure ISO string
 * @param arrivalISO - Arrival ISO string
 * @returns Number of days difference
 */
export function getDayDifference(departureISO: string | undefined, arrivalISO: string | undefined): number {
  if (!departureISO || !arrivalISO) return 0;
  
  try {
    const departure = new Date(departureISO);
    const arrival = new Date(arrivalISO);
    
    // Calculate difference in days
    const diffMs = arrival.getTime() - departure.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDays;
  } catch (e) {
    return 0;
  }
}

/**
 * Format duration from minutes or string
 * @param duration - Duration in minutes or string format
 * @returns Formatted duration string (e.g., "7h 15m")
 */
export function formatDuration(duration: number | string | undefined): string {
  if (!duration) return 'N/A';
  
  // If already formatted string, return it
  if (typeof duration === 'string' && duration.includes('h')) {
    return duration;
  }
  
  // Convert to number if string
  const minutes = typeof duration === 'string' ? parseInt(duration, 10) : duration;
  
  if (isNaN(minutes)) return 'N/A';
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  
  return `${hours}h ${mins}m`;
}

/**
 * Calculate layover duration between two segments
 * @param arrivalISO - Arrival time of first segment
 * @param departureISO - Departure time of next segment
 * @returns Formatted layover duration
 */
export function calculateLayoverDuration(arrivalISO: string, departureISO: string): string {
  try {
    const arrival = new Date(arrivalISO);
    const departure = new Date(departureISO);
    
    const diffMs = departure.getTime() - arrival.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    return formatDuration(diffMinutes);
  } catch (e) {
    return 'N/A';
  }
}

/**
 * Get time period of day
 * @param isoString - ISO 8601 date string
 * @returns Time period (morning, afternoon, evening, night)
 */
export function getTimePeriod(isoString: string | undefined): string {
  if (!isoString) return '';
  
  try {
    const date = new Date(isoString);
    const hour = date.getHours();
    
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  } catch (e) {
    return '';
  }
}

/**
 * Format segment information
 * @param segments - Array of flight segments
 * @returns Formatted segment string
 */
export function formatSegments(segments: any[]): string {
  if (!segments || segments.length === 0) return 'Direct';
  
  if (segments.length === 1) return 'Direct';
  
  const stops = segments.length - 1;
  return `${stops} stop${stops > 1 ? 's' : ''}`;
}
