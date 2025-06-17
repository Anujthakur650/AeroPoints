import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";

export function UltraPremiumFooter() {
  const footerSections = [
    {
      title: "Company",
      links: [
        { text: "About Us", href: "/about", icon: "lucide:building" },
        { text: "Careers", href: "/careers", icon: "lucide:briefcase" },
        { text: "Press", href: "/press", icon: "lucide:newspaper" },
        { text: "Partners", href: "/partners", icon: "lucide:handshake" },
        { text: "Contact", href: "/contact", icon: "lucide:mail" }
      ]
    },
    {
      title: "Resources",
      links: [
        { text: "Points Guide", href: "/guide", icon: "lucide:book-open" },
        { text: "Airline Partners", href: "/airlines", icon: "lucide:plane" },
        { text: "Travel Blog", href: "/blog", icon: "lucide:pen-tool" },
        { text: "FAQ", href: "/faq", icon: "lucide:help-circle" },
        { text: "Help Center", href: "/help", icon: "lucide:life-buoy" }
      ]
    },
    {
      title: "Legal",
      links: [
        { text: "Terms of Service", href: "/terms", icon: "lucide:file-text" },
        { text: "Privacy Policy", href: "/privacy", icon: "lucide:shield" },
        { text: "Cookie Policy", href: "/cookies", icon: "lucide:cookie" },
        { text: "Accessibility", href: "/accessibility", icon: "lucide:eye" },
        { text: "Security", href: "/security", icon: "lucide:lock" }
      ]
    }
  ];

  const socialIcons = [
    { icon: "lucide:facebook", label: "Facebook", href: "#" },
    { icon: "lucide:twitter", label: "Twitter", href: "#" },
    { icon: "lucide:instagram", label: "Instagram", href: "#" },
    { icon: "lucide:linkedin", label: "LinkedIn", href: "#" }
  ];

  return (
    <footer className="premium-footer">
      <div className="footer-content">
        <div className="footer-main">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="footer-description"
          >
            <h3>AeroPoints Premium Travel</h3>
            <p>
              Discover luxury travel experiences with our premium award flight booking platform.
              Transform your points into extraordinary journeys.
            </p>
            <div className="social-links">
              {socialIcons.map((item, i) => (
                <motion.a
                  key={i}
                  href={item.href}
                  aria-label={item.label}
                  whileHover={{ scale: 1.2, y: -3 }}
                >
                  <Icon icon={item.icon} width={18} height={18} />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <div className="footer-links-grid">
            {footerSections.map((section, sectionIndex) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: sectionIndex * 0.1 }}
                viewport={{ once: true }}
                className="footer-section"
              >
                <h3 className="footer-section-title">{section.title}</h3>
                <ul className="footer-links">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <a href={link.href} className="footer-link">
                        <Icon icon={link.icon} width={14} height={14} />
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright-text">
            &copy; {new Date().getFullYear()} AeroPoints. All rights reserved.
          </p>
          <div className="partner-logos">
            <div className="partner-logo">Visa</div>
            <div className="partner-logo">Mastercard</div>
            <div className="partner-logo">Amex</div>
            <div className="partner-logo">PayPal</div>
          </div>
        </div>
      </div>
    </footer>
  );
} 