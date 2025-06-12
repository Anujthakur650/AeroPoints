import { FEATURES } from '../../config/features';
import { LegacyAirportSearch } from './legacy-airport-search';
import { NewAirportSearch } from './new-airport-search';

interface AirportSearchProps {
  value: string;
  onChange: (code: string) => void;
  label: string;
  placeholder?: string;
}

export function AirportSearch(props: AirportSearchProps) {
  if (FEATURES.USE_NEW_AIRPORT_SEARCH) {
    return <NewAirportSearch {...props} />;
  }
  return <LegacyAirportSearch {...props} />;
} 