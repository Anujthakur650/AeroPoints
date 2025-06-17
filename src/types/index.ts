export interface SearchParams {
  origin: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date | null;
  passengers: number;
  cabinClass: 'economy' | 'premium-economy' | 'business' | 'first';
  isRoundTrip: boolean;
  airline?: string;
  alliance?: string;
  directFlights?: boolean;
}

export interface Flight {
  ID: string;
  Date: string;
  Source: string;
  OriginCode: string;
  DestinationCode: string;
  OriginAirport: string;
  DestinationAirport: string;
  Airline: string;
  FlightNumber: string;
  DepartureTime: string;
  ArrivalTime: string;
  Duration: string;
  Aircraft: string;
  CabinClass: string;
  YAvailable: number;
  JAvailable: number;
  FAvailable: number;
  YMileageCost: number;
  JMileageCost: number;
  FMileageCost: number;
  YCashPrice: number;
  JCashPrice: number;
  FCashPrice: number;
  Stops: number;
  ConnectionAirports?: string[];
  Alliance?: string;
  PartnerAirline?: string;
  BookingClass: string;
  FareBasis: string;
  ValidatingCarrier: string;
  LastUpdated: string;
  PromotionCode?: string;
  SpecialOffer?: string;
  FlexibleDates?: boolean;
  SeatConfiguration?: string;
  AmenityScore?: number;
  OnTimePerformance?: number;
  CarbonEmissions?: number;
  SustainabilityRating?: string;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  terminal?: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  membershipTier: 'standard' | 'premium' | 'platinum';
  joinDate: string;
  loyaltyPrograms: LoyaltyProgram[];
  preferences: UserPreferences;
  recentSearches: SearchHistory[];
}

export interface LoyaltyProgram {
  airline: string;
  memberNumber: string;
  tier: string;
  balance: number;
  expirationDate?: string;
}

export interface UserPreferences {
  preferredCabinClass: string;
  preferredAirlines: string[];
  preferredAlliances: string[];
  seatingPreference: string;
  mealPreference: string;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
  dealAlerts: boolean;
  priceDrops: boolean;
  membershipUpdates: boolean;
}

export interface SearchHistory {
  id: string;
  searchParams: SearchParams;
  timestamp: string;
  resultsCount: number;
  savedFlights: string[];
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  destination: string;
  origin: string;
  image: string;
  originalPrice: number;
  discountedPrice: number;
  pointsRequired: number;
  cabinClass: string;
  airline: string;
  validFrom: string;
  validUntil: string;
  availability: 'limited' | 'good' | 'excellent';
  tags: string[];
  isExclusive: boolean;
  membershipRequired?: string;
  termsAndConditions: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  review: string;
  trip: {
    origin: string;
    destination: string;
    cabinClass: string;
    airline: string;
  };
  verified: boolean;
  date: string;
}

export interface NewsletterSubscription {
  email: string;
  preferences: {
    weeklyDeals: boolean;
    premiumOffers: boolean;
    travelTips: boolean;
    membershipUpdates: boolean;
  };
}

export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  inquiryType: 'general' | 'support' | 'partnership' | 'feedback';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

// Utility types
export type CabinClass = 'economy' | 'premium-economy' | 'business' | 'first';
export type MembershipTier = 'standard' | 'premium' | 'platinum';
export type SortOption = 'price' | 'duration' | 'departure' | 'arrival' | 'points' | 'airline';
export type FilterOption = 'alliance' | 'airline' | 'cabin' | 'stops' | 'time' | 'points';

export interface SortConfig {
  field: SortOption;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  alliances: string[];
  airlines: string[];
  cabinClasses: CabinClass[];
  maxStops: number;
  timeRanges: {
    departure: { start: string; end: string };
    arrival: { start: string; end: string };
  };
  pointsRange: { min: number; max: number };
  priceRange: { min: number; max: number };
  amenities: string[];
  aircraftTypes: string[];
}

export interface SearchFilters extends Partial<FilterConfig> {
  sortBy: SortConfig;
}

export interface FlightSearchResponse {
  flights: Flight[];
  totalCount: number;
  searchId: string;
  searchParams: SearchParams;
  executionTime: number;
  lastUpdated: string;
  aggregations: {
    airlines: { name: string; count: number }[];
    alliances: { name: string; count: number }[];
    priceRange: { min: number; max: number };
    durationRange: { min: number; max: number };
  };
}

// Component prop types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface ModalProps extends ComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export interface FormProps extends ComponentProps {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

// Animation and UI types
export interface AnimationConfig {
  duration: number;
  delay?: number;
  ease?: string;
  repeat?: number | boolean;
}

export interface ThemeConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: {
    luxury: string;
    body: string;
    accent: string;
  };
  borderRadius: string;
  spacing: {
    luxury: string;
    luxuryLg: string;
    luxuryXl: string;
  };
} 