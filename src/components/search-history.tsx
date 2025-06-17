import React, { useState, useEffect } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FlightSearchItem } from '../services/search-history';
import searchHistoryService from '../services/search-history';

interface SearchHistoryProps {
  onSelectSearch: (search: FlightSearchItem) => void;
}

export const SearchHistory: React.FC<SearchHistoryProps> = ({ onSelectSearch }) => {
  const [searchHistory, setSearchHistory] = useState<FlightSearchItem[]>([]);
  
  // Load search history on mount
  useEffect(() => {
    loadSearchHistory();
  }, []);
  
  // Load search history from service
  const loadSearchHistory = () => {
    const history = searchHistoryService.getFlightHistory();
    setSearchHistory(history);
  };
  
  // Clear search history
  const handleClearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    searchHistoryService.clearFlightHistory();
    setSearchHistory([]);
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch (e) {
      return dateString;
    }
  };
  
  // Calculate how long ago a search was performed
  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) {
      return 'just now';
    }
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) {
      return `${minutes}m ago`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours}h ago`;
    }
    
    const days = Math.floor(hours / 24);
    if (days < 7) {
      return `${days}d ago`;
    }
    
    const weeks = Math.floor(days / 7);
    return `${weeks}w ago`;
  };
  
  // If no search history, don't render anything
  if (searchHistory.length === 0) {
    return null;
  }
  
  return (
    <Dropdown>
      <DropdownTrigger>
        <Button 
          variant="flat" 
          size="sm" 
          startContent={<Icon icon="lucide:history" />}
          endContent={<Icon icon="lucide:chevron-down" className="text-xs" />}
          className="min-w-0"
        >
          Recent Searches
        </Button>
      </DropdownTrigger>
      <DropdownMenu 
        aria-label="Search History"
        className="min-w-[300px]"
        variant="flat"
      >
        <DropdownSection title="Recent Searches" showDivider>
          {searchHistory.map((search, index) => (
            <DropdownItem
              key={`search-${index}`}
              textValue={`${search.origin} to ${search.destination}`}
              onClick={() => onSelectSearch(search)}
              startContent={<Icon icon="lucide:search" className="text-default-500" />}
              endContent={
                <span className="text-xs text-default-400">{getTimeAgo(search.timestamp)}</span>
              }
              description={`${formatDate(search.departureDate)}${search.returnDate ? ` - ${formatDate(search.returnDate)}` : ''} · ${search.cabinClass} · ${search.passengers} passenger${search.passengers !== 1 ? 's' : ''}`}
              className="py-2"
            >
              <div className="flex items-center text-sm">
                <span className="font-semibold">{search.origin}</span>
                <Icon icon="lucide:arrow-right" className="mx-1" />
                <span className="font-semibold">{search.destination}</span>
              </div>
            </DropdownItem>
          ))}
        </DropdownSection>
        
        <DropdownSection>
          <DropdownItem 
            key="clear-history" 
            textValue="Clear Search History"
            onClick={handleClearHistory} 
            startContent={<Icon icon="lucide:trash-2" className="text-danger" />}
            className="text-danger"
          >
            Clear Search History
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
};

export default SearchHistory; 