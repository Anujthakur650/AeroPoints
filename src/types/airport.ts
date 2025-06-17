export interface Airport {
  iata_code: string;
  name: string;
  city: string;
  country: string;
  coordinates: [number, number];
  elevation_ft?: number;
  type: string;
  region?: string;
}

export interface AirportSearchResult {
  code: string;
  city: string;
  name: string;
  country: string;
  type: 'city' | 'airport';
  score?: number;
} 