import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Icon } from '@iconify/react';
export function EnhancedHeroSection() {
    const videoRef = useRef(null);
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });
    // Parallax effects
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const heroContent = [
        {
            headline: "Elevate Your Journey",
            subheadline: "Where Luxury Meets Adventure",
            description: "Experience the pinnacle of premium travel with our exclusive network of luxury partners and unparalleled service.",
            cta: "Discover Exclusive Deals"
        },
        {
            headline: "Bespoke Travel Experiences",
            subheadline: "Curated for the Extraordinary",
            description: "Unlock access to the world's most prestigious destinations with our concierge-level booking service.",
            cta: "Start Your Journey"
        },
        {
            headline: "Exceptional Rewards Await",
            subheadline: "Maximize Every Point",
            description: "Transform your loyalty points into unforgettable memories with our premium redemption strategies.",
            cta: "Unlock Premium Access"
        }
    ];
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroContent.length);
        }, 6000);
        return () => clearInterval(interval);
    }, []);
    const floatingElements = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        duration: Math.random() * 3 + 4,
        delay: Math.random() * 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
    }));
    return (_jsxs("div", { ref: heroRef, className: "hero-section relative min-h-screen overflow-hidden", children: [_jsxs(motion.div, { style: { scale, y }, className: "absolute inset-0 z-0", children: [_jsx("video", { ref: videoRef, autoPlay: true, muted: true, loop: true, playsInline: true, className: "absolute inset-0 w-full h-full object-cover", style: { filter: 'brightness(0.4) contrast(1.2)' }, children: _jsx("source", { src: "https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69&profile_id=164&oauth2_token_id=57447761", type: "video/mp4" }) }), _jsx("div", { className: "absolute inset-0 hero-overlay" })] }), _jsx("div", { className: "absolute inset-0 z-10 pointer-events-none", children: floatingElements.map((element) => (_jsx(motion.div, { className: "absolute", style: {
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                    }, animate: {
                        y: [-20, 20, -20],
                        opacity: [0.2, 0.6, 0.2],
                        scale: [1, 1.2, 1],
                    }, transition: {
                        duration: element.duration,
                        delay: element.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }, children: _jsx("div", { className: "rounded-full bg-gradient-to-br from-gold-400/30 to-gold-600/20 backdrop-blur-sm", style: {
                            width: `${element.size}px`,
                            height: `${element.size}px`,
                            boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)',
                        } }) }, element.id))) }), _jsx(motion.div, { style: { opacity }, className: "relative z-20 min-h-screen flex items-center justify-center px-4", children: _jsxs("div", { className: "max-w-7xl mx-auto text-center", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, className: "trust-badges-container justify-center mb-8", children: [_jsxs("div", { className: "trust-badge", children: [_jsx(Icon, { icon: "lucide:award", className: "inline mr-2" }), "Exclusive Partner Network"] }), _jsxs("div", { className: "trust-badge", children: [_jsx(Icon, { icon: "lucide:headphones", className: "inline mr-2" }), "Concierge Service"] }), _jsxs("div", { className: "trust-badge", children: [_jsx(Icon, { icon: "lucide:shield-check", className: "inline mr-2" }), "Secure & Trusted"] })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -30 }, transition: { duration: 0.8 }, className: "space-y-8", children: [_jsx(motion.div, { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 1, delay: 0.2 }, className: "luxury-tagline", children: heroContent[currentSlide].subheadline }), _jsx(motion.h1, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.3 }, className: "hero-main-title", "data-text": heroContent[currentSlide].headline, children: heroContent[currentSlide].headline.split(' ').map((word, index) => (_jsx(motion.span, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.1 * index }, className: "inline-block mr-4", children: word }, index))) }), _jsx(motion.p, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.5 }, className: "hero-description", children: heroContent[currentSlide].description }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.7 }, className: "hero-cta-container", children: [_jsxs(motion.button, { className: "discover-deals-btn", onClick: () => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' }), whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: [_jsx(Icon, { icon: "lucide:sparkles", className: "mr-2" }), heroContent[currentSlide].cta] }), _jsxs(motion.button, { className: "watch-experience-btn", whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 }, children: [_jsx(Icon, { icon: "lucide:play-circle", className: "mr-2" }), "Watch Experience"] })] })] }, currentSlide), _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1, delay: 1 }, className: "page-indicators", children: heroContent.map((_, index) => (_jsx("button", { onClick: () => setCurrentSlide(index), className: `page-indicator ${index === currentSlide ? 'active' : ''}` }, index))) })] }) }), _jsx(motion.div, { initial: { opacity: 0, y: 50 }, animate: { opacity: 1, y: 0 }, transition: { duration: 1, delay: 1.2 }, className: "absolute bottom-8 left-0 right-0 z-20", children: _jsx("div", { className: "max-w-6xl mx-auto px-4", children: _jsx("div", { className: "stats-section", children: _jsxs("div", { className: "stats-container", children: [_jsxs(motion.div, { className: "stat-item", whileHover: { scale: 1.02 }, children: [_jsx("div", { className: "stat-number", children: "500K+" }), _jsx("div", { className: "stat-label", children: "Premium Members" })] }), _jsxs(motion.div, { className: "stat-item", whileHover: { scale: 1.02 }, children: [_jsx("div", { className: "stat-number", children: "150+" }), _jsx("div", { className: "stat-label", children: "Luxury Partners" })] }), _jsxs(motion.div, { className: "stat-item", whileHover: { scale: 1.02 }, children: [_jsx("div", { className: "stat-number", children: "98%" }), _jsx("div", { className: "stat-label", children: "Satisfaction Rate" })] }), _jsxs(motion.div, { className: "stat-item", whileHover: { scale: 1.02 }, children: [_jsx("div", { className: "stat-number", children: "24/7" }), _jsx("div", { className: "stat-label", children: "Concierge Support" })] })] }) }) }) }), _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 1, delay: 2 }, className: "absolute bottom-24 left-1/2 transform -translate-x-1/2 z-20", children: _jsxs(motion.div, { animate: { y: [0, 10, 0] }, transition: { duration: 2, repeat: Infinity }, className: "flex flex-col items-center text-white/70 cursor-pointer group", onClick: () => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' }), children: [_jsx("span", { className: "text-sm uppercase tracking-widest mb-2 font-medium text-gold-300 group-hover:text-gold-200 transition-colors", children: "Discover More" }), _jsx("div", { className: "p-2 rounded-full glass-card border border-gold-400/30 group-hover:border-gold-400/50 transition-all", children: _jsx(Icon, { icon: "lucide:chevron-down", className: "text-2xl text-gold-400" }) })] }) })] }));
}
