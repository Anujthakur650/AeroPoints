import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Button } from '@heroui/react';

export function EnhancedHeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
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

  return (
    <div ref={heroRef} className="hero-section relative min-h-screen overflow-hidden">
      {/* Enhanced Video Background */}
      <motion.div 
        style={{ scale, y }}
        className="absolute inset-0 z-0"
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: 'brightness(0.3) contrast(1.3) saturate(1.1)' }}
        >
          <source 
            src="https://player.vimeo.com/external/434045526.sd.mp4?s=c27eecc69&profile_id=164&oauth2_token_id=57447761" 
            type="video/mp4" 
          />
          {/* Fallback gradient if video fails */}
        </video>
        
        {/* Enhanced Video overlay gradient */}
        <div className="absolute inset-0 hero-overlay-enhanced" />
      </motion.div>

      {/* Enhanced Floating luxury elements */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.6, 0.2],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: element.duration,
              delay: element.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div 
              className="rounded-full bg-gradient-to-br from-gold-400/30 to-gold-600/20 backdrop-blur-sm"
              style={{
                width: `${element.size}px`,
                height: `${element.size}px`,
                boxShadow: '0 0 20px rgba(212, 175, 55, 0.2)',
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Main Content - Restructured to prevent overlap */}
      <motion.div 
        style={{ opacity }}
        className="relative z-20 min-h-screen flex flex-col justify-between px-4 py-20"
      >
        {/* Hero Content Section */}
        <div className="flex-1 flex items-center justify-center">
          <div className="max-w-7xl mx-auto text-center">
            {/* Enhanced Trust Indicators with Better Glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="trust-badges-container-enhanced justify-center mb-12"
            >
              <motion.div 
                className="trust-badge-enhanced"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ duration: 0.3 }}
              >
                <Icon icon="lucide:award" className="text-gold-400 mr-3" />
                Exclusive Partner Network
              </motion.div>
              <motion.div 
                className="trust-badge-enhanced"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ duration: 0.3 }}
              >
                <Icon icon="lucide:headphones" className="text-gold-400 mr-3" />
                Concierge Service
              </motion.div>
              <motion.div 
                className="trust-badge-enhanced"
                whileHover={{ scale: 1.05, y: -2 }}
                transition={{ duration: 0.3 }}
              >
                <Icon icon="lucide:shield-check" className="text-gold-400 mr-3" />
                Secure & Trusted
              </motion.div>
            </motion.div>

            {/* Enhanced Luxury Script Accent */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="luxury-tagline-enhanced mb-6"
            >
              Maximize Every Point
            </motion.div>

            {/* Enhanced Main Headline - Focus on Bespoke Travel Experiences */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="hero-main-title-enhanced mb-8"
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="inline-block"
              >
                Bespoke Travel
              </motion.span>
              <br />
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-block text-gradient-luxury-enhanced"
              >
                Experiences
              </motion.span>
            </motion.h1>

            {/* Enhanced Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="hero-description-enhanced mb-12"
            >
              Transform your loyalty points into unforgettable memories with 
              our premium redemption strategies.
            </motion.p>

            {/* Enhanced CTA Buttons with Better Glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="hero-cta-container-enhanced"
            >
              <motion.button
                className="discover-deals-btn-enhanced"
                onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon icon="lucide:sparkles" className="mr-3 text-lg" />
                Start Your Journey
              </motion.button>
              
              <motion.button
                className="watch-experience-btn-enhanced"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon icon="lucide:play-circle" className="mr-3 text-lg" />
                Watch Experience
              </motion.button>
            </motion.div>
          </div>
        </div>

        {/* Enhanced Premium Stats Section - Now in proper flow */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="relative z-30 mt-12"
        >
          <div className="max-w-5xl mx-auto px-4">
            <motion.div 
              className="stats-section-enhanced"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.3 }}
            >
              <div className="stats-container-enhanced">
                <motion.div 
                  className="stat-item-enhanced"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="stat-number-enhanced">500K+</div>
                  <div className="stat-label-enhanced">Premium Members</div>
                </motion.div>
                <motion.div 
                  className="stat-item-enhanced"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="stat-number-enhanced">150+</div>
                  <div className="stat-label-enhanced">Luxury Partners</div>
                </motion.div>
                <motion.div 
                  className="stat-item-enhanced"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="stat-number-enhanced">98%</div>
                  <div className="stat-label-enhanced">Satisfaction Rate</div>
                </motion.div>
                <motion.div 
                  className="stat-item-enhanced"
                  whileHover={{ scale: 1.05, y: -2 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="stat-number-enhanced">24/7</div>
                  <div className="stat-label-enhanced">Concierge Support</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced Scroll Indicator - Positioned after stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-40"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center text-white/70 cursor-pointer group"
          onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="text-xs uppercase tracking-wider mb-1 font-medium text-gold-300 group-hover:text-gold-200 transition-colors">
            Discover More
          </span>
          <div className="p-2 rounded-full glass-card-enhanced border border-gold-400/30 group-hover:border-gold-400/50 transition-all">
            <Icon icon="lucide:chevron-down" className="text-lg text-gold-400" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}