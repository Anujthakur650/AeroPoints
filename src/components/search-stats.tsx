import React, { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader, CardFooter, Divider, Chip, Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import searchHistoryService, { FlightSearchItem } from '../services/search-history';

interface StatsItem {
  code: string;
  city?: string;
  count: number;
}

export const SearchStats: React.FC = () => {
  const [topDestinations, setTopDestinations] = useState<StatsItem[]>([]);
  const [topOrigins, setTopOrigins] = useState<StatsItem[]>([]);
  const [recentActivity, setRecentActivity] = useState<FlightSearchItem[]>([]);
  const [totalSearches, setTotalSearches] = useState<number>(0);
  
  // Load stats on mount
  useEffect(() => {
    calculateStats();
    
    // Set up interval to refresh stats every 60 seconds
    const interval = setInterval(() => {
      calculateStats();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate search statistics
  const calculateStats = () => {
    const history = searchHistoryService.getFlightHistory();
    setTotalSearches(history.length);
    
    if (history.length === 0) {
      setTopDestinations([]);
      setTopOrigins([]);
      setRecentActivity([]);
      return;
    }
    
    // Set recent activity (last 3 searches)
    setRecentActivity(history.slice(0, 3));
    
    // Calculate top destinations
    const destinationCounts: Record<string, StatsItem> = {};
    const originCounts: Record<string, StatsItem> = {};
    
    history.forEach(search => {
      // Track destinations
      if (!destinationCounts[search.destination]) {
        destinationCounts[search.destination] = {
          code: search.destination,
          city: search.destinationCity,
          count: 0
        };
      }
      destinationCounts[search.destination].count++;
      
      // Track origins
      if (!originCounts[search.origin]) {
        originCounts[search.origin] = {
          code: search.origin,
          city: search.originCity,
          count: 0
        };
      }
      originCounts[search.origin].count++;
    });
    
    // Sort and limit to top 5
    const sortedDestinations = Object.values(destinationCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    const sortedOrigins = Object.values(originCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    
    setTopDestinations(sortedDestinations);
    setTopOrigins(sortedOrigins);
  };
  
  // Format date for display
  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Unknown date';
    }
  };
  
  // If no search history, don't show stats
  if (totalSearches === 0) {
    return null;
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="flex gap-3">
        <div className="flex flex-col">
          <p className="text-md font-semibold">Your Search Statistics</p>
          <p className="text-small text-default-500">Based on {totalSearches} searches</p>
        </div>
      </CardHeader>
      <Divider/>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Destinations */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Top Destinations</h3>
            <div className="space-y-2">
              {topDestinations.length > 0 ? (
                topDestinations.map((destination, index) => (
                  <div key={destination.code} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-default-500 text-xs mr-2">{index + 1}.</span>
                      <Chip color="primary" variant="flat" size="sm">
                        {destination.code}
                      </Chip>
                      <span className="ml-2 text-sm">{destination.city || destination.code}</span>
                    </div>
                    <Chip color="default" variant="flat" size="sm">
                      {destination.count} search{destination.count !== 1 ? 'es' : ''}
                    </Chip>
                  </div>
                ))
              ) : (
                <p className="text-sm text-default-500">No destination data yet</p>
              )}
            </div>
          </div>
          
          {/* Top Origins */}
          <div>
            <h3 className="text-sm font-semibold mb-2">Top Origins</h3>
            <div className="space-y-2">
              {topOrigins.length > 0 ? (
                topOrigins.map((origin, index) => (
                  <div key={origin.code} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-default-500 text-xs mr-2">{index + 1}.</span>
                      <Chip color="success" variant="flat" size="sm">
                        {origin.code}
                      </Chip>
                      <span className="ml-2 text-sm">{origin.city || origin.code}</span>
                    </div>
                    <Chip color="default" variant="flat" size="sm">
                      {origin.count} search{origin.count !== 1 ? 'es' : ''}
                    </Chip>
                  </div>
                ))
              ) : (
                <p className="text-sm text-default-500">No origin data yet</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Recent Activity */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-2">Recent Search Activity</h3>
          <div className="space-y-2">
            {recentActivity.map((search, index) => (
              <div key={`activity-${index}`} className="flex items-center text-sm">
                <Icon icon="lucide:search" className="mr-2 text-default-500" />
                <span className="font-semibold">{search.origin}</span>
                <Icon icon="lucide:arrow-right" className="mx-1" />
                <span className="font-semibold">{search.destination}</span>
                <span className="text-default-500 ml-2 text-xs">
                  {formatDate(search.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardBody>
      <Divider />
      <CardFooter className="justify-end">
        <Button
          variant="flat"
          size="sm"
          color="danger"
          startContent={<Icon icon="lucide:trash-2" />}
          onPress={() => {
            searchHistoryService.clearFlightHistory();
            calculateStats();
          }}
        >
          Clear History
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SearchStats; 