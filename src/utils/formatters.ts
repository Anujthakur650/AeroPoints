/**
 * Utility functions for formatting numbers, currencies, and other display values
 */

/**
 * Format a number as a currency string with the specified currency symbol
 * @param amount The amount to format
 * @param currency The currency code (default: USD)
 * @returns A formatted currency string
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  // Handle zero or invalid values
  if (!amount && amount !== 0) return '$0.00';
  
  // Format with appropriate currency symbol and decimal places
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format a number with commas for thousands
 * @param value The number to format
 * @returns A formatted number string with commas
 */
export function formatNumber(value: number): string {
  if (!value && value !== 0) return '0';
  
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Format a duration string (e.g., "2h 30m")
 * @param duration The duration string or minutes
 * @returns A formatted duration string
 */
export function formatDuration(duration: string | number): string {
  if (typeof duration === 'string') {
    // If already in a readable format, return as is
    return duration;
  }
  
  if (typeof duration === 'number') {
    // Convert minutes to hours and minutes
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    
    if (hours === 0) {
      return `${minutes}m`;
    }
    
    return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
  }
  
  return '0h 0m';
}

/**
 * Format a date string to a more readable format
 * @param dateString The date string to format
 * @param format The format to use (short, medium, long)
 * @returns A formatted date string
 */
export function formatDate(dateString: string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Return empty string for invalid date
  if (isNaN(date.getTime())) return '';
  
  if (format === 'short') {
    return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
  }
  
  if (format === 'long') {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
  
  // Medium (default)
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });
}

/**
 * Format a time string to a more readable format
 * @param time The time string to format (e.g., "14:30", "08:00 AM")
 * @returns A formatted time string (e.g., "2:30 PM", "8:00 AM")
 */
export const formatTime = (time: string | null | undefined): string => {
  if (!time || time === null || time === undefined) {
    return 'Time TBD';
  }
  
  // If time is already in AM/PM format, return as is
  if (time.includes('AM') || time.includes('PM')) {
    return time;
  }
  
  // Handle HH:MM format (24-hour)
  if (time.includes(':')) {
    const [hours, minutes] = time.split(':').map(num => parseInt(num, 10));
    
    if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${displayHour}:${displayMinutes} ${period}`;
    }
  }
  
  // If we can't parse it, return helpful message
  return 'Time TBD';
}; 