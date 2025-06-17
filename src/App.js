import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from "react";
import { motion } from "framer-motion";
import { EnhancedHeroSection } from "./components/enhanced-hero-section";
import { SimpleSearchForm } from "./components/simple-search-form";
import { EnhancedFeaturedDeals } from "./components/enhanced-featured-deals";
import { UltraPremiumPointsCalculator } from "./components/ultra-premium-points-calculator";
import { UltraPremiumFooter } from "./components/ultra-premium-footer";
import { Card, CardBody, Button, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { FlightResults } from "./components/flight-results";
import SearchPage from './pages/search-page';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Header } from './components/header';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/auth/Profile';
import GoogleCallback from './components/auth/GoogleCallback';
// Ultra-Premium Membership Section
function PlatinumCircle() {
    const benefits = [
        {
            icon: "lucide:diamond",
            title: "Private Concierge",
            description: "Dedicated travel specialist available 24/7",
            tier: "Exclusive"
        },
        {
            icon: "lucide:crown",
            title: "Priority Access",
            description: "Skip the wait with instant bookings and upgrades",
            tier: "Premium"
        },
        {
            icon: "lucide:plane",
            title: "Private Jet Access",
            description: "Book private jets and luxury suites",
            tier: "Ultra"
        },
        {
            icon: "lucide:shield",
            title: "Elite Protection",
            description: "Comprehensive travel insurance and guarantees",
            tier: "Premium"
        }
    ];
    const getTierColor = (tier) => {
        switch (tier) {
            case 'Ultra': return 'from-purple-500 to-pink-500';
            case 'Exclusive': return 'from-yellow-400 to-yellow-600';
            case 'Premium': return 'from-blue-500 to-indigo-600';
            default: return 'from-gray-400 to-gray-600';
        }
    };
    return (_jsx("div", { className: "space-luxury", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, viewport: { once: true }, className: "text-center space-y-6 mb-16", children: [_jsxs("div", { className: "inline-flex items-center gap-3 glass-card px-6 py-3 rounded-full", children: [_jsx(Icon, { icon: "lucide:crown", className: "text-yellow-400" }), _jsx("span", { className: "text-yellow-400 font-medium uppercase tracking-wide", children: "Platinum Circle" })] }), _jsx("h2", { className: "text-5xl md:text-6xl font-bold text-gradient-luxury mb-6", style: { fontFamily: 'var(--font-luxury)' }, children: "Elevated Travel Experience" }), _jsx("p", { className: "text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed", children: "Join an exclusive community of discerning travelers who expect nothing less than perfection. Experience luxury travel redefined." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-8 mb-16", children: benefits.map((benefit, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: index * 0.1 }, viewport: { once: true }, className: "group", children: _jsx(Card, { className: "card-premium interactive-hover h-full overflow-hidden", children: _jsxs(CardBody, { className: "p-8 space-y-6", children: [_jsxs("div", { className: "relative", children: [_jsxs(motion.div, { whileHover: { scale: 1.1, rotate: 10 }, transition: { duration: 0.3 }, className: `w-16 h-16 rounded-2xl bg-gradient-to-br ${getTierColor(benefit.tier)} p-4 relative overflow-hidden`, children: [_jsx(Icon, { icon: benefit.icon, className: "text-white text-2xl" }), _jsx("div", { className: "absolute inset-0 pointer-events-none", children: [...Array(6)].map((_, i) => (_jsx(motion.div, { className: "absolute w-1 h-1 bg-white/30 rounded-full", style: {
                                                                left: `${Math.random() * 100}%`,
                                                                top: `${Math.random() * 100}%`,
                                                            }, animate: {
                                                                y: [-5, 5, -5],
                                                                opacity: [0.3, 0.8, 0.3],
                                                                scale: [1, 1.2, 1],
                                                            }, transition: {
                                                                duration: 2 + Math.random(),
                                                                repeat: Infinity,
                                                                delay: Math.random(),
                                                            } }, i))) })] }), _jsx("div", { className: "absolute -top-2 -right-2", children: _jsx(Chip, { size: "sm", className: `bg-gradient-to-r ${getTierColor(benefit.tier)} text-white font-medium border-0`, children: benefit.tier }) })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("h3", { className: "text-2xl font-bold text-white group-hover:text-gradient-gold transition-all duration-300", style: { fontFamily: 'var(--font-luxury)' }, children: benefit.title }), _jsx("p", { className: "text-gray-300 leading-relaxed", children: benefit.description })] }), _jsxs(motion.div, { whileHover: { x: 5 }, className: "flex items-center gap-2 text-yellow-400 cursor-pointer", children: [_jsx("span", { className: "font-medium", children: "Learn More" }), _jsx(Icon, { icon: "lucide:arrow-right", className: "text-sm" })] })] }) }) }, index))) }), _jsx(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.4 }, viewport: { once: true }, className: "text-center", children: _jsx("div", { className: "card-premium p-12 max-w-4xl mx-auto", children: _jsxs("div", { className: "space-y-8", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-3xl font-bold text-white", style: { fontFamily: 'var(--font-luxury)' }, children: "Ready to Elevate Your Travel?" }), _jsx("p", { className: "text-gray-300 text-lg max-w-2xl mx-auto", children: "Join thousands of satisfied travelers who trust us with their most important journeys. Experience the difference of true luxury travel." })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8 py-8", children: [
                                        { number: "500K+", label: "Satisfied Travelers" },
                                        { number: "150+", label: "Luxury Partners" },
                                        { number: "98%", label: "Satisfaction Rate" }
                                    ].map((stat, index) => (_jsxs(motion.div, { initial: { opacity: 0, scale: 0.8 }, whileInView: { opacity: 1, scale: 1 }, transition: { duration: 0.5, delay: index * 0.1 }, viewport: { once: true }, className: "text-center", children: [_jsx("div", { className: "text-4xl font-bold text-gradient-gold mb-2", children: stat.number }), _jsx("div", { className: "text-gray-400 uppercase tracking-wide text-sm", children: stat.label })] }, index))) }), _jsxs("div", { className: "flex flex-col sm:flex-row gap-4 justify-center", children: [_jsx(Button, { className: "btn-luxury animate-pulse-luxury", size: "lg", endContent: _jsx(Icon, { icon: "lucide:crown" }), children: "Join Platinum Circle" }), _jsx(Button, { variant: "bordered", size: "lg", className: "glass-card text-white border-white/20 hover:border-yellow-400/50", endContent: _jsx(Icon, { icon: "lucide:info" }), children: "View Benefits" })] })] }) }) })] }) }));
}
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
    return (_jsx("div", { className: "space-luxury bg-luxury-gradient py-20", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, viewport: { once: true }, className: "text-center space-y-6 mb-16", children: [_jsxs("div", { className: "inline-flex items-center gap-3 glass-card px-6 py-3 rounded-full", children: [_jsx(Icon, { icon: "lucide:quote", className: "text-yellow-400" }), _jsx("span", { className: "text-yellow-400 font-medium uppercase tracking-wide", children: "Client Stories" })] }), _jsx("h2", { className: "text-5xl md:text-6xl font-bold text-gradient-luxury mb-6", style: { fontFamily: 'var(--font-luxury)' }, children: "Trusted by Luxury Travelers" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-8", children: testimonials.map((testimonial, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 40 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: index * 0.2 }, viewport: { once: true }, className: "group", children: _jsx(Card, { className: "card-premium interactive-hover h-full", children: _jsxs(CardBody, { className: "p-8 space-y-6", children: [_jsx("div", { className: "flex gap-1", children: [...Array(testimonial.rating)].map((_, i) => (_jsx(Icon, { icon: "lucide:star", className: "text-yellow-400 fill-current" }, i))) }), _jsxs("p", { className: "text-gray-300 text-lg leading-relaxed italic", children: ["\"", testimonial.quote, "\""] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(motion.div, { whileHover: { scale: 1.1 }, className: "relative", children: [_jsx("img", { src: testimonial.avatar, alt: testimonial.name, className: "w-12 h-12 rounded-full object-cover border-2 border-yellow-400/30" }), _jsx("div", { className: "absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900" })] }), _jsxs("div", { children: [_jsx("div", { className: "font-semibold text-white", children: testimonial.name }), _jsx("div", { className: "text-sm text-gray-400", children: testimonial.title })] })] }), _jsx("div", { className: "pt-4 border-t border-white/10", children: _jsxs("div", { className: "flex items-center gap-2 text-sm text-gray-400", children: [_jsx(Icon, { icon: "lucide:plane", className: "text-yellow-400" }), testimonial.trip] }) })] }) }) }, index))) })] }) }));
}
function App() {
    const [searchResults, setSearchResults] = React.useState([]);
    const [isSearching, setIsSearching] = React.useState(false);
    const [showResults, setShowResults] = React.useState(false);
    const handleSearchResults = (flights) => {
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
    const handleSearchStart = () => {
        console.log('Search started');
        setIsSearching(true);
        setShowResults(false);
    };
    const handleSearchError = (error) => {
        console.error('Search error:', error);
        setIsSearching(false);
        setShowResults(false);
    };
    return (_jsx(Router, { children: _jsx(AuthProvider, { children: _jsxs("div", { className: "flex flex-col min-h-screen", style: {
                    background: 'linear-gradient(135deg, hsl(222, 84%, 10%), hsl(222, 84%, 21%), hsl(214, 22%, 18%))',
                    color: 'white'
                }, children: [_jsx(Header, {}), _jsx("main", { className: "flex-grow", children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsxs(_Fragment, { children: [_jsx(EnhancedHeroSection, {}), _jsx(SimpleSearchForm, { onSearchResults: handleSearchResults, onSearchStart: handleSearchStart }), (showResults || isSearching) && (_jsxs(motion.div, { id: "search-results", initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, className: "max-w-7xl mx-auto px-4 py-12", children: [_jsxs("div", { className: "text-center mb-8", children: [_jsx("h2", { className: "text-3xl md:text-4xl font-bold text-white mb-4", children: isSearching ? 'Searching Premium Flights...' : `Found ${searchResults.length} Premium Flights` }), isSearching && (_jsx("p", { className: "text-gray-300", children: "We're finding the best award flights for your journey" }))] }), isSearching ? (_jsx("div", { className: "flex justify-center items-center py-20", children: _jsx("div", { className: "animate-spin rounded-full h-16 w-16 border-t-2 border-yellow-400" }) })) : (_jsx(FlightResults, { flights: searchResults, isLoading: false, searchParams: {
                                                            origin: '',
                                                            destination: '',
                                                            departureDate: '',
                                                            cabinClass: 'economy',
                                                            passengers: 1
                                                        }, onFlightSelect: (flight) => {
                                                            console.log('Flight selected:', flight);
                                                        } }))] })), _jsx(EnhancedFeaturedDeals, {}), _jsx(PlatinumCircle, {}), _jsx(LuxuryTestimonials, {}), _jsx(UltraPremiumPointsCalculator, {})] }) }), _jsx(Route, { path: "/search", element: _jsx(SearchPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/register", element: _jsx(Register, {}) }), _jsx(Route, { path: "/auth/google/callback", element: _jsx(GoogleCallback, {}) }), _jsx(Route, { path: "/profile", element: _jsx(ProtectedRoute, { children: _jsx(Profile, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/", replace: true }) })] }) }), _jsx(UltraPremiumFooter, {})] }) }) }));
}
export default App;
