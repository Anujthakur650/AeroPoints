import { useState, useEffect } from 'react';
/**
 * A custom hook for debouncing values (like input changes).
 * Useful for search inputs to avoid making API calls on every keystroke.
 *
 * @param value The value to debounce
 * @param delay The delay in milliseconds
 * @returns The debounced value
 */
export function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        // Set a timeout to update the debounced value after the specified delay
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        // Clear the timeout if the value changes again before the delay has elapsed
        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);
    return debouncedValue;
}
