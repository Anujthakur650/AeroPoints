/**
 * Search History Service
 * Manages user search history for airports and flight searches
 */
// Maximum number of entries to keep in history
const MAX_AIRPORT_HISTORY = 5;
const MAX_FLIGHT_HISTORY = 10;
// Storage keys
const AIRPORT_HISTORY_KEY = 'airport_search_history';
const FLIGHT_HISTORY_KEY = 'flight_search_history';
class SearchHistoryService {
    /**
     * Add an airport to search history
     */
    addAirportToHistory(airport) {
        try {
            const history = this.getAirportHistory();
            // Create new history item with timestamp
            const newItem = {
                ...airport,
                timestamp: Date.now()
            };
            // Remove any existing entries for this airport/type combination
            const filteredHistory = history.filter(item => !(item.code === airport.code && item.type === airport.type));
            // Add new item to the beginning
            filteredHistory.unshift(newItem);
            // Limit to max items
            const limitedHistory = filteredHistory.slice(0, MAX_AIRPORT_HISTORY);
            // Save to localStorage
            localStorage.setItem(AIRPORT_HISTORY_KEY, JSON.stringify(limitedHistory));
            console.log(`Added ${airport.code} (${airport.type}) to airport search history`);
        }
        catch (error) {
            console.error('Error adding airport to history:', error);
        }
    }
    /**
     * Add a flight search to history
     */
    addFlightSearchToHistory(search) {
        try {
            const history = this.getFlightHistory();
            // Create new history item with timestamp
            const newItem = {
                ...search,
                timestamp: Date.now()
            };
            // Check for duplicates (same origin/destination/dates)
            const isDuplicate = history.some(item => item.origin === search.origin &&
                item.destination === search.destination &&
                item.departureDate === search.departureDate &&
                item.returnDate === search.returnDate);
            if (!isDuplicate) {
                // Add new item to the beginning
                history.unshift(newItem);
                // Limit to max items
                const limitedHistory = history.slice(0, MAX_FLIGHT_HISTORY);
                // Save to localStorage
                localStorage.setItem(FLIGHT_HISTORY_KEY, JSON.stringify(limitedHistory));
                console.log(`Added flight search (${search.origin}-${search.destination}) to history`);
            }
            else {
                console.log('Skipping duplicate flight search in history');
            }
        }
        catch (error) {
            console.error('Error adding flight search to history:', error);
        }
    }
    /**
     * Get airport search history
     */
    getAirportHistory() {
        try {
            const historyData = localStorage.getItem(AIRPORT_HISTORY_KEY);
            if (!historyData)
                return [];
            const history = JSON.parse(historyData);
            if (!Array.isArray(history))
                return [];
            return history;
        }
        catch (error) {
            console.error('Error getting airport history:', error);
            return [];
        }
    }
    /**
     * Get flight search history
     */
    getFlightHistory() {
        try {
            const historyData = localStorage.getItem(FLIGHT_HISTORY_KEY);
            if (!historyData)
                return [];
            const history = JSON.parse(historyData);
            if (!Array.isArray(history))
                return [];
            return history;
        }
        catch (error) {
            console.error('Error getting flight history:', error);
            return [];
        }
    }
    /**
     * Get airport history by type (origin/destination)
     */
    getAirportHistoryByType(type) {
        const history = this.getAirportHistory();
        return history.filter(item => item.type === type);
    }
    /**
     * Clear airport search history
     */
    clearAirportHistory() {
        try {
            localStorage.removeItem(AIRPORT_HISTORY_KEY);
            console.log('Airport search history cleared');
        }
        catch (error) {
            console.error('Error clearing airport history:', error);
        }
    }
    /**
     * Clear flight search history
     */
    clearFlightHistory() {
        try {
            localStorage.removeItem(FLIGHT_HISTORY_KEY);
            console.log('Flight search history cleared');
        }
        catch (error) {
            console.error('Error clearing flight history:', error);
        }
    }
}
// Create singleton instance
const searchHistoryService = new SearchHistoryService();
export default searchHistoryService;
