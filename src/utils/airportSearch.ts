import { airportManager } from './airportData';

// Validation function to ensure the implementation works
export async function validateAirportSearch(): Promise<boolean> {
  try {
    // Test case 1: Basic search
    const jfkResults = airportManager.search('JFK');
    if (!jfkResults.some(r => r.code === 'JFK')) {
      console.error('Validation failed: Could not find JFK airport');
      return false;
    }

    // Test case 2: City search
    const newYorkResults = airportManager.search('New York');
    if (!newYorkResults.some(r => ['JFK', 'LGA', 'EWR'].includes(r.code))) {
      console.error('Validation failed: Could not find New York airports');
      return false;
    }

    // Test case 3: Distance calculation
    const distance = airportManager.calculateDistance('JFK', 'LAX');
    if (!distance || distance < 2000) { // Rough check for JFK-LAX distance
      console.error('Validation failed: Invalid distance calculation');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Airport search validation failed:', error);
    return false;
  }
} 