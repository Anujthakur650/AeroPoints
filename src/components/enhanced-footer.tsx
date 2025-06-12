import React from "react";
import { Link, Divider } from "@heroui/react";
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
        { text: "Contact", href: "#" }
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
    <footer className="relative overflow-hidden">
      {/* Footer Background with Gradient Overlay */}
      <div className="absolute inset-0 bg-background opacity-95 z-0"></div>
      
      {/* Decorative Wave */}
      <div className="absolute top-0 left-0 right-0 h-8 opacity-10" style={{
        background: 'linear-gradient(to right, hsl(var(--primary-600)), hsl(var(--primary-800)))',
        maskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 120\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z\' opacity=\'.25\' class=\'shape-fill\'%3E%3C/path%3E%3Cpath d=\'M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z\' opacity=\'.5\' class=\'shape-fill\'%3E%3C/path%3E%3Cpath d=\'M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z\' class=\'shape-fill\'%3E%3C/path%3E%3C/svg%3E")',
        maskSize: '100% 100%',
        maskRepeat: 'no-repeat',
        WebkitMaskImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 1200 120\' preserveAspectRatio=\'none\'%3E%3Cpath d=\'M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z\' opacity=\'.25\' class=\'shape-fill\'%3E%3C/path%3E%3Cpath d=\'M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z\' opacity=\'.5\' class=\'shape-fill\'%3E%3C/path%3E%3Cpath d=\'M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z\' class=\'shape-fill\'%3E%3C/path%3E%3C/svg%3E")',
        WebkitMaskSize: '100% 100%',
        WebkitMaskRepeat: 'no-repeat',
        transform: 'rotate(180deg)',
      }}></div>
      
      {/* Footer Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
          >
            <div className="flex items-center mb-5">
              <div className="p-2 rounded-lg bg-primary/10 mr-3">
                <Icon icon="lucide:plane" className="text-primary" width={24} height={24} />
              </div>
              <h3 className="font-bold text-xl" style={{ fontFamily: 'var(--font-heading)' }}>AeroPoints</h3>
            </div>
            <p className="text-default-500 text-sm mb-6" style={{ maxWidth: '300px' }}>
              Find and book premium flights using your points and miles. Get the most value from your travel rewards.
            </p>
            <div className="flex space-x-4">
              {socialIcons.map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.2, rotate: 5, y: -3 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Link href="#" aria-label={item.label} className="block p-2 rounded-full bg-default-100/30 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                    <Icon icon={item.icon} width={18} height={18} />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1],
                delay: sectionIndex * 0.1
              }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-5" style={{ fontFamily: 'var(--font-heading)' }}>{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link 
                      href={link.href} 
                      color="foreground" 
                      className="text-sm transition-all hover:text-primary hover:translate-x-1 inline-flex items-center gap-1"
                      style={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                      <span className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300">
                        <Icon icon="lucide:chevron-right" width={14} height={14} className="opacity-0 group-hover:opacity-100" />
                      </span>
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
        
        <Divider className="my-8 opacity-30" />
        
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-default-500 text-sm">
            &copy; {new Date().getFullYear()} AeroPoints. All rights reserved.
          </p>
          <div className="flex items-center mt-4 md:mt-0 space-x-3">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="American Express" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/PayPal_Blue_Logo.svg" alt="PayPal" className="h-8 opacity-70 hover:opacity-100 transition-opacity" />
          </div>
        </div>
      </div>
    </footer>
  );
}