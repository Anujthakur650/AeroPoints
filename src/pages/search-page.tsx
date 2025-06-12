import React from 'react';
import { SearchForm } from '../components/search-form';
import SearchStats from '../components/search-stats';

export const SearchPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-4">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-1 mt-6 pt-2 bg-transparent" style={{zIndex:2}}>
            Find Award Flights
          </h1>
          <p className="text-default-500 bg-transparent">Search for award flights using points and miles across multiple airlines.</p>
        </div>
        
        <SearchForm />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            {/* Empty space for flight results, will be populated by SearchForm */}
          </div>
          
          <div className="lg:col-span-1">
            <SearchStats />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage; 