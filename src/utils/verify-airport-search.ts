import { airportManager } from './airportData';

export async function verifyAirportSearch() {
  try {
    console.log('Verifying airport search implementation...');
    
    // Test 1: Basic search for a common airport
    console.log('Test 1: Searching for JFK...');
    const jfkResults = airportManager.search('JFK');
    if (!jfkResults.some(r => r.code === 'JFK')) {
      console.error('Verification failed: Could not find JFK airport');
      return false;
    }
    console.log('JFK search results:', jfkResults);
    
    // Test 2: City search
    console.log('Test 2: Searching for New York...');
    const nyResults = airportManager.search('New York');
    console.log('New York search results:', nyResults);
    if (!nyResults.some(r => ['JFK', 'LGA', 'EWR'].includes(r.code))) {
      console.error('Verification failed: New York airports not found');
      return false;
    }
    
    // Test 3: Get airport by code
    console.log('Test 3: Getting airport by code LAX...');
    const lax = airportManager.getAirport('LAX');
    if (!lax) {
      console.error('Verification failed: Could not get LAX airport details');
      return false;
    }
    console.log('LAX airport details:', lax);
    
    // Test 4: Distance calculation if enabled
    if (airportManager.calculateDistance) {
      console.log('Test 4: Calculating distance between JFK and LAX...');
      const distance = airportManager.calculateDistance('JFK', 'LAX');
      if (!distance || distance < 2000) {
        console.error('Verification failed: Invalid distance calculation');
        return false;
      }
      console.log('JFK to LAX distance:', distance, 'km');
    }
    
    console.log('Airport search verification successful!');
    return true;
  } catch (error) {
    console.error('Airport search verification failed with error:', error);
    return false;
  }
} 