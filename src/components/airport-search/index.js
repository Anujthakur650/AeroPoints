import { jsx as _jsx } from "react/jsx-runtime";
import { FEATURES } from '../../config/features';
import { LegacyAirportSearch } from './legacy-airport-search';
import { NewAirportSearch } from './new-airport-search';
export function AirportSearch(props) {
    if (FEATURES.USE_NEW_AIRPORT_SEARCH) {
        return _jsx(NewAirportSearch, { ...props });
    }
    return _jsx(LegacyAirportSearch, { ...props });
}
