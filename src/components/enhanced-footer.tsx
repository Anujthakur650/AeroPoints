import React from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

export function EnhancedFooter() {
  const footerSections = [
    {
      title: "Company",
      links: [
        { text: "About Us", href: "#" },
        { text: "Careers", href: "#" },
        { text: "Press", href: "#" },
        { text: "Partners", href: "#" },
        { text: "Contact Support", href: "#" }
      ]
    },
    {
      title: "Resources",
      links: [
        { text: "Points Guide", href: "#" },
        { text: "Airline Partners", href: "#" },
        { text: "Travel Blog", href: "#" },
        { text: "FAQ", href: "#" },
        { text: "Help Center", href: "#" }
      ]
    },
    {
      title: "Legal",
      links: [
        { text: "Terms of Service", href: "#" },
        { text: "Privacy Policy", href: "#" },
        { text: "Cookie Policy", href: "#" },
        { text: "Accessibility", href: "#" },
        { text: "Security", href: "#" }
      ]
    }
  ];

  const socialIcons = [
    { icon: "lucide:facebook", label: "Facebook" },
    { icon: "lucide:twitter", label: "Twitter" },
    { icon: "lucide:instagram", label: "Instagram" },
    { icon: "lucide:linkedin", label: "LinkedIn" }
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/5">
      {/* Premium Background with Dark Gradient */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, hsl(222, 84%, 10%), hsl(222, 84%, 21%), hsl(214, 22%, 18%))',
        }}
      ></div>
      
      {/* Decorative Gold Accent Top Border */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 opacity-60"
        style={{
          background: 'linear-gradient(90deg, transparent, #FFD700, #FFA500, #FFD700, transparent)',
        }}
      ></div>
      
      {/* Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="col-span-1 md:col-span-1"
          >
            {/* Company Logo & Description */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)',
                  }}
                >
                  <Icon icon="lucide:plane" className="text-slate-900 text-2xl" />
                </div>
                <div>
                  <h3 
                    className="text-2xl font-bold text-white"
                    style={{ fontFamily: 'Playfair Display, serif' }}
                  >
                    AeroPoints
                  </h3>
                  <p 
                    className="text-sm font-medium"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}
                  >
                    Premium Travel
                  </p>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed">
                Discover award flights and luxury travel experiences with expert-crafted search tools designed for the savvy traveler.
              </p>
              
              {/* Social Media Links */}
              <div className="flex gap-4">
                {socialIcons.map((social) => (
                  <motion.a
                    key={social.label}
                    href="#"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-gray-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent"
                    style={{
                      background: 'rgba(255, 215, 0, 0.05)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 215, 0, 0.1)',
                    }}
                    aria-label={social.label}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.3)';
                      e.currentTarget.style.color = '#FFD700';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(255, 215, 0, 0.1)';
                      e.currentTarget.style.color = 'rgb(209, 213, 219)';
                    }}
                  >
                    <Icon icon={social.icon} className="text-lg" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
          
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: (index + 1) * 0.1 }}
              viewport={{ once: true }}
              className="col-span-1"
            >
              <h4 className="text-lg font-semibold text-white mb-6 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.text}>
                    <a
                      href={link.href}
                      className="text-gray-300 hover:text-[#FFD700] transition-colors duration-300 focus:outline-none focus:text-[#FFD700] focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-transparent rounded px-1 py-1"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      {link.text}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        {/* Elegant Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          whileInView={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          viewport={{ once: true }}
          className="my-12"
        >
          <div 
            className="h-px w-full opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent, #FFD700, transparent)',
            }}
          ></div>
        </motion.div>
        
        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <p className="text-gray-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
              &copy; {new Date().getFullYear()} AeroPoints. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Secure Payments</span>
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              <span>24/7 Support</span>
              <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
              <span>Best Price Guarantee</span>
            </div>
          </div>
          
          {/* Payment Logos */}
          <motion.div 
            className="flex items-center gap-6"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            viewport={{ once: true }}
          >
            <span className="text-gray-400 text-sm mr-2">Accepted Payments:</span>
            <div className="flex items-center gap-4">
              {[
                { src: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg", alt: "Visa" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg", alt: "Mastercard" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg", alt: "American Express" },
                { src: "https://upload.wikimedia.org/wikipedia/commons/4/41/PayPal_Blue_Logo.svg", alt: "PayPal" }
              ].map((payment) => (
                <motion.img
                  key={payment.alt}
                  src={payment.src}
                  alt={payment.alt}
                  className="h-8 opacity-60 transition-all duration-300 filter grayscale hover:grayscale-0 hover:opacity-100"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}