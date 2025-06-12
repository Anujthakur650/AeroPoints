import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Chip, Card, CardBody } from '@heroui/react';
import { Icon } from '@iconify/react';
export function EnhancedFeaturedDeals() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [autoPlay, setAutoPlay] = useState(true);
    const categories = [
        { id: 'all', label: 'All Deals', icon: 'lucide:sparkles' },
        { id: 'business', label: 'Business Class', icon: 'lucide:crown' },
        { id: 'first', label: 'First Class', icon: 'lucide:diamond' },
        { id: 'exclusive', label: 'Exclusive', icon: 'lucide:star' }
    ];
    const featuredDeals = [
        {
            id: '1',
            destination: 'Tokyo',
            origin: 'Los Angeles',
            image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2894&auto=format&fit=crop',
            price: 85000,
            originalPrice: 120000,
            points: 85000,
            cabin: 'business',
            airline: 'ANA',
            validUntil: '2025-12-31',
            availability: 'limited',
            tags: ['Exclusive', 'Limited Time'],
            description: 'Experience Japan\'s finest hospitality with ANA\'s acclaimed business class service.',
            partnership: 'Star Alliance'
        },
        {
            id: '2',
            destination: 'London',
            origin: 'New York',
            image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2940&auto=format&fit=crop',
            price: 95000,
            originalPrice: 140000,
            points: 95000,
            cabin: 'first',
            airline: 'British Airways',
            validUntil: '2025-11-30',
            availability: 'excellent',
            tags: ['First Class', 'Flagship Route'],
            description: 'Indulge in British Airways\' legendary First Class cabin with private suites.',
            partnership: 'oneworld'
        },
        {
            id: '3',
            destination: 'Paris',
            origin: 'San Francisco',
            image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?q=80&w=2946&auto=format&fit=crop',
            price: 75000,
            originalPrice: 110000,
            points: 75000,
            cabin: 'business',
            airline: 'Air France',
            validUntil: '2025-10-31',
            availability: 'good',
            tags: ['Best Value', 'City of Light'],
            description: 'Discover Parisian elegance with Air France\'s sophisticated business class.',
            partnership: 'SkyTeam'
        },
        {
            id: '4',
            destination: 'Dubai',
            origin: 'Los Angeles',
            image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=2946&auto=format&fit=crop',
            price: 110000,
            originalPrice: 160000,
            points: 110000,
            cabin: 'first',
            airline: 'Emirates',
            validUntil: '2025-12-15',
            availability: 'limited',
            tags: ['Ultra Luxury', 'A380 Suite'],
            description: 'Ultimate luxury awaits in Emirates\' private First Class suites with shower spa.',
            partnership: 'Independent'
        },
        {
            id: '5',
            destination: 'Singapore',
            origin: 'San Francisco',
            image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2952&auto=format&fit=crop',
            price: 90000,
            originalPrice: 130000,
            points: 90000,
            cabin: 'business',
            airline: 'Singapore Airlines',
            validUntil: '2025-11-15',
            availability: 'excellent',
            tags: ['World\'s Best', 'Premium Experience'],
            description: 'Fly with the world\'s most awarded airline in their signature business class.',
            partnership: 'Star Alliance'
        },
        {
            id: '6',
            destination: 'Sydney',
            origin: 'Los Angeles',
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2940&auto=format&fit=crop',
            price: 80000,
            originalPrice: 115000,
            points: 80000,
            cabin: 'business',
            airline: 'Qantas',
            validUntil: '2025-12-20',
            availability: 'good',
            tags: ['Down Under', 'Flagship'],
            description: 'Experience Australia\'s iconic airline with their award-winning business class.',
            partnership: 'oneworld'
        }
    ];
    const filteredDeals = featuredDeals.filter(deal => {
        if (selectedCategory === 'all')
            return true;
        if (selectedCategory === 'business')
            return deal.cabin === 'business';
        if (selectedCategory === 'first')
            return deal.cabin === 'first';
        if (selectedCategory === 'exclusive')
            return deal.tags.includes('Exclusive') || deal.tags.includes('Ultra Luxury');
        return true;
    });
    const dealsPerPage = 3;
    const totalPages = Math.ceil(filteredDeals.length / dealsPerPage);
    const currentDeals = filteredDeals.slice(currentPage * dealsPerPage, (currentPage + 1) * dealsPerPage);
    useEffect(() => {
        if (!autoPlay)
            return;
        const interval = setInterval(() => {
            setCurrentPage(prev => (prev + 1) % totalPages);
        }, 5000);
        return () => clearInterval(interval);
    }, [totalPages, autoPlay]);
    const getCabinIcon = (cabin) => {
        switch (cabin) {
            case 'first': return 'lucide:diamond';
            case 'business': return 'lucide:crown';
            default: return 'lucide:plane';
        }
    };
    const getAvailabilityColor = (availability) => {
        switch (availability) {
            case 'limited': return 'bg-red-500/20 text-red-400 border-red-400/30';
            case 'good': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
            case 'excellent': return 'bg-green-500/20 text-green-400 border-green-400/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
        }
    };
    return (_jsx("div", { className: "space-luxury", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4", children: [_jsxs(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, viewport: { once: true }, className: "text-center space-y-6 mb-16", children: [_jsxs("div", { className: "inline-flex items-center gap-3 glass-card px-6 py-3 rounded-full", children: [_jsx(Icon, { icon: "lucide:sparkles", className: "text-yellow-400" }), _jsx("span", { className: "text-yellow-400 font-medium uppercase tracking-wide", children: "Exclusive Offers" })] }), _jsx("h2", { className: "text-5xl md:text-6xl font-bold text-gradient-luxury mb-6", style: { fontFamily: 'var(--font-luxury)' }, children: "Curated Premium Deals" }), _jsx("p", { className: "text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed", children: "Handpicked exceptional offers from our exclusive partner network. These premium deals are available to our platinum members only." })] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.2 }, viewport: { once: true }, className: "flex flex-wrap justify-center gap-4 mb-12", children: categories.map((category, index) => (_jsxs(motion.button, { initial: { opacity: 0, scale: 0.9 }, whileInView: { opacity: 1, scale: 1 }, transition: { duration: 0.4, delay: index * 0.1 }, viewport: { once: true }, whileHover: { scale: 1.05 }, whileTap: { scale: 0.95 }, onClick: () => {
                            setSelectedCategory(category.id);
                            setCurrentPage(0);
                        }, className: `px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${selectedCategory === category.id
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 shadow-lg'
                            : 'glass-card text-gray-300 hover:text-white hover:border-yellow-400/30'}`, children: [_jsx(Icon, { icon: category.icon, className: "text-lg" }), category.label] }, category.id))) }), _jsx(AnimatePresence, { mode: "wait", children: _jsx(motion.div, { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -40 }, transition: { duration: 0.6 }, className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", children: currentDeals.map((deal, index) => (_jsx(motion.div, { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: index * 0.1 }, className: "group", children: _jsx(Card, { className: "card-premium interactive-hover h-full overflow-hidden", children: _jsxs("div", { className: "relative overflow-hidden", children: [_jsxs("div", { className: "relative h-64 overflow-hidden", children: [_jsx(motion.img, { whileHover: { scale: 1.1 }, transition: { duration: 0.6 }, src: deal.image, alt: deal.destination, className: "w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" }), _jsx("div", { className: "absolute inset-0 pointer-events-none", children: [...Array(8)].map((_, i) => (_jsx(motion.div, { className: "absolute w-2 h-2 bg-yellow-400/30 rounded-full", style: {
                                                            left: `${Math.random() * 100}%`,
                                                            top: `${Math.random() * 100}%`,
                                                        }, animate: {
                                                            y: [-10, 10, -10],
                                                            opacity: [0.3, 0.8, 0.3],
                                                            scale: [1, 1.2, 1],
                                                        }, transition: {
                                                            duration: 3 + Math.random() * 2,
                                                            repeat: Infinity,
                                                            delay: Math.random() * 2,
                                                        } }, i))) }), _jsx("div", { className: "absolute top-4 left-4", children: _jsxs(Chip, { className: `${getAvailabilityColor(deal.availability)} font-medium`, children: [deal.availability.charAt(0).toUpperCase() + deal.availability.slice(1), " Availability"] }) }), _jsx("div", { className: "absolute top-4 right-4", children: _jsx("div", { className: "glass-card p-2 rounded-full", children: _jsx(Icon, { icon: getCabinIcon(deal.cabin), className: "text-yellow-400" }) }) }), _jsx("div", { className: "absolute bottom-4 right-4 text-right", children: _jsxs("div", { className: "glass-card p-3 rounded-xl", children: [_jsx("div", { className: "text-xs text-gray-400 line-through", children: deal.originalPrice.toLocaleString() }), _jsxs("div", { className: "text-lg font-bold text-gradient-gold", children: [deal.points.toLocaleString(), " pts"] })] }) })] }), _jsxs(CardBody, { className: "p-6 space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "font-medium text-gray-300", children: deal.origin }), _jsx(Icon, { icon: "lucide:plane", className: "text-yellow-400" }), _jsx("span", { className: "font-medium text-gray-300", children: deal.destination })] }), _jsx("div", { className: "text-sm text-gray-400", children: deal.airline })] }), _jsxs("h3", { className: "text-xl font-bold text-white", style: { fontFamily: 'var(--font-luxury)' }, children: [deal.destination, " Getaway"] }), _jsx("p", { className: "text-gray-400 text-sm leading-relaxed", children: deal.description }), _jsx("div", { className: "flex flex-wrap gap-2", children: deal.tags.map((tag, tagIndex) => (_jsx(Chip, { size: "sm", className: "bg-yellow-400/10 text-yellow-400 border border-yellow-400/20", children: tag }, tagIndex))) }), deal.partnership && (_jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500", children: [_jsx(Icon, { icon: "lucide:handshake" }), _jsxs("span", { children: [deal.partnership, " Partner"] })] })), _jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-500", children: [_jsx(Icon, { icon: "lucide:clock" }), _jsxs("span", { children: ["Valid until ", new Date(deal.validUntil).toLocaleDateString()] })] }), _jsxs(Button, { className: "btn-luxury w-full mt-4 group-hover:scale-105 transition-transform duration-300", size: "lg", children: [_jsx(Icon, { icon: "lucide:sparkles", className: "mr-2" }), "Book Exclusive Deal"] })] })] }) }) }, deal.id))) }, `${selectedCategory}-${currentPage}`) }), totalPages > 1 && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.4 }, viewport: { once: true }, className: "flex justify-center items-center gap-6 mt-12", children: [_jsx("button", { onClick: () => setAutoPlay(!autoPlay), className: `glass-card p-3 rounded-full transition-all duration-300 ${autoPlay ? 'border-yellow-400/30 text-yellow-400' : 'text-gray-400'}`, children: _jsx(Icon, { icon: autoPlay ? 'lucide:pause' : 'lucide:play' }) }), _jsx("div", { className: "flex gap-3", children: Array.from({ length: totalPages }, (_, i) => (_jsx("button", { onClick: () => setCurrentPage(i), className: `w-3 h-3 rounded-full transition-all duration-300 ${i === currentPage
                                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 scale-125'
                                    : 'bg-white/30 hover:bg-white/50'}` }, i))) }), _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: () => setCurrentPage(prev => (prev - 1 + totalPages) % totalPages), className: "glass-card p-3 rounded-full hover:border-yellow-400/30 transition-all duration-300", children: _jsx(Icon, { icon: "lucide:chevron-left", className: "text-gray-300" }) }), _jsx("button", { onClick: () => setCurrentPage(prev => (prev + 1) % totalPages), className: "glass-card p-3 rounded-full hover:border-yellow-400/30 transition-all duration-300", children: _jsx(Icon, { icon: "lucide:chevron-right", className: "text-gray-300" }) })] })] })), _jsx(motion.div, { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.6 }, viewport: { once: true }, className: "text-center mt-16", children: _jsx("div", { className: "card-premium p-8 max-w-2xl mx-auto", children: _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-2xl font-bold text-white", style: { fontFamily: 'var(--font-luxury)' }, children: "Unlock More Exclusive Deals" }), _jsx("p", { className: "text-gray-300", children: "Join our Platinum Circle to access even more premium offers and personalized travel recommendations." }), _jsx(Button, { className: "btn-luxury", size: "lg", endContent: _jsx(Icon, { icon: "lucide:arrow-right" }), children: "Explore Platinum Benefits" })] }) }) })] }) }));
}
