import React from "react";
import { motion } from "framer-motion";
import { EnhancedNavbar } from "./components/enhanced-navbar";
import { EnhancedHeroSection } from "./components/enhanced-hero-section";
import { SimpleSearchForm } from "./components/simple-search-form";
import { EnhancedFeaturedDeals } from "./components/enhanced-featured-deals";
import { EnhancedFooter } from "./components/enhanced-footer";

import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Flight, GroupedFlight, BookingOption } from "./services/api";
import { FlightResults, GroupedFlightResults } from "./components/flight-results";
import { AirportSearchTest } from "./AirportSearchTest";
import { AirportSearchDebug } from './AirportSearchDebug';
import SearchPage from './pages/search-page';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Header } from './components/header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';
import Settings from './components/Settings';
import GoogleCallback from './components/auth/GoogleCallback';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';



// Testimonials Section
function LuxuryTestimonials() {
  const testimonials = [
    {
      name: "Alexandra Chen",
      title: "CEO, Tech Innovations",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?q=80&w=256&auto=format&fit=crop",
      rating: 5,
      quote: "The level of service and attention to detail is unmatched. Every journey feels like a first-class experience.",
      trip: "San Francisco → Tokyo (First Class)"
    },
    {
      name: "Michael Rodriguez",
      title: "Investment Partner",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop",
      rating: 5,
      quote: "Their concierge service turned a complex multi-city business trip into a seamless luxury experience.",
      trip: "New York → London → Dubai (Business)"
    },
    {
      name: "Sarah Thompson",
      title: "Fashion Director",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=256&auto=format&fit=crop",
      rating: 5,
      quote: "I've saved countless hours and gained access to exclusive deals I never knew existed. Absolutely worth it.",
      trip: "Los Angeles → Paris (Premium Economy)"
    }
  ];

  return (
    <div className="space-luxury bg-luxury-gradient py-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center space-y-6 mb-16"
        >
          <div className="inline-flex items-center gap-3 glass-card px-6 py-3 rounded-full">
            <Icon icon="lucide:quote" className="text-yellow-400" />
            <span className="text-yellow-400 font-medium uppercase tracking-wide">Client Stories</span>
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold text-gradient-luxury mb-6" style={{ fontFamily: 'var(--font-luxury)' }}>
            Trusted by Luxury Travelers
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <Card className="card-premium interactive-hover h-full">
                <CardBody className="p-8 space-y-6">
                  {/* Stars */}
                  <div className="flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Icon key={i} icon="lucide:star" className="text-yellow-400 fill-current" />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-gray-300 text-lg leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="relative"
                    >
                      <img
                        src={testimonial.avatar}
                        alt={`Profile photo of ${testimonial.name}, ${testimonial.title}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400/30"
                        loading="lazy"
                      />
                      <div 
                        className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900"
                        aria-label="Verified member"
                        title="Verified premium member"
                      ></div>
                    </motion.div>
                    <div>
                      <div className="font-semibold text-white">{testimonial.name}</div>
                      <div className="text-sm text-gray-400">{testimonial.title}</div>
                    </div>
                  </div>

                  {/* Trip info */}
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Icon icon="lucide:plane" className="text-yellow-400" />
                      {testimonial.trip}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [searchResults, setSearchResults] = React.useState<Flight[]>([]);
  const [groupedSearchResults, setGroupedSearchResults] = React.useState<GroupedFlight[]>([]);
  const [useGroupedView, setUseGroupedView] = React.useState<boolean>(true);
  const [isSearching, setIsSearching] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);

  const handleSearchResults = (flights: Flight[]) => {
    console.log('Search results received:', flights);
    setSearchResults(flights);
    setShowResults(true);
    setIsSearching(false); // Reset loading state when results are received
    // Scroll to results section
    setTimeout(() => {
      const resultsElement = document.getElementById('search-results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleGroupedSearchResults = (groupedFlights: GroupedFlight[]) => {
    console.log('Grouped search results received:', groupedFlights);
    setGroupedSearchResults(groupedFlights);
    setShowResults(true);
    setIsSearching(false); // Reset loading state when results are received
  };

  const handleSearchStart = () => {
    console.log('Search started');
    setIsSearching(true);
    setShowResults(false);
  };

  const handleSearchError = (error: string) => {
    console.error('Search error:', error);
    setIsSearching(false);
    setShowResults(false);
  };

  return (
    <Router>
      <AuthProvider>
        <div 
          className="flex flex-col min-h-screen"
          style={{
            background: 'linear-gradient(135deg, hsl(222, 84%, 10%), hsl(222, 84%, 21%), hsl(214, 22%, 18%))',
            color: 'white'
          }}
        >
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={
                <>
                  <EnhancedHeroSection />
                  <SimpleSearchForm 
                    onSearchResults={handleSearchResults}
                    onGroupedSearchResults={handleGroupedSearchResults}
                    onSearchStart={handleSearchStart}
                  />
                  
                  {/* Search Results Section */}
                  {(showResults || isSearching) && (
                    <motion.div
                      id="search-results"
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8 }}
                      className="max-w-7xl mx-auto px-4 py-12"
                    >
                      <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                          {isSearching ? 'Searching Premium Flights...' : `Found ${groupedSearchResults.length} Unique Flights`}
                        </h2>
                        {isSearching && (
                          <p className="text-gray-300">We're finding the best award flights for your journey</p>
                        )}
                      </div>
                      
                      {isSearching ? (
                        <div className="flex justify-center items-center py-20">
                          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-yellow-400"></div>
                        </div>
                      ) : (
                        <GroupedFlightResults 
                          groupedFlights={groupedSearchResults}
                          isLoading={false}
                          searchParams={{
                            origin: '',
                            destination: '',
                            departureDate: '',
                            cabinClass: 'economy',
                            passengers: 1
                          } as any}
                          onFlightSelect={(flight) => {
                            console.log('Flight selected:', flight);
                          }}
                          onBookingOptionSelect={(groupedFlight, bookingOption) => {
                            console.log('Booking option selected:', groupedFlight, bookingOption);
                          }}
                        />
                      )}
                    </motion.div>
                  )}
                  
                  <EnhancedFeaturedDeals />
                  <LuxuryTestimonials />
                </>
              } />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/auth/google/callback" element={<GoogleCallback />} />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <EnhancedFooter />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;