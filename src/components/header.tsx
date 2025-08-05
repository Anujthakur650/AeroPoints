import React from 'react';
import { motion } from 'framer-motion';
import { Button, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from "@heroui/react";
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <motion.header 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="header-container relative z-50"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Enhanced Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            <Link to="/" className="flex items-center gap-3 focus:ring-2 focus:ring-yellow-400 focus:outline-none rounded-lg p-1" aria-label="AeroPoints homepage">
              <div className="aeropoints-logo w-10 h-10 rounded-xl flex items-center justify-center" aria-hidden="true">
                <Icon icon="lucide:plane" className="text-navy-900 text-xl" aria-hidden="true" />
              </div>
              <div className="flex flex-col">
                <span className="font-luxury text-2xl font-bold text-white">AeroPoints</span>
                <span className="luxury-script text-xs text-gold-400 -mt-1">Premium Travel</span>
              </div>
            </Link>
          </motion.div>

          {/* Enhanced Navigation Links (Desktop) */}
          <motion.nav 
            className="hidden md:block"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="nav-links-container flex items-center gap-2">
              <Link 
                to="/" 
                className="nav-link text-platinum-300 hover:text-gold-400 focus:text-gold-400 font-medium transition-all duration-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none rounded px-3 py-2"
              >
                Search Flights
              </Link>
              <Link 
                to="/" 
                className="nav-link text-platinum-300 hover:text-gold-400 focus:text-gold-400 font-medium transition-all duration-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none rounded px-3 py-2"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('featured-deals')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Premium Deals
              </Link>
              <Link 
                to="/" 
                className="nav-link text-platinum-300 hover:text-gold-400 focus:text-gold-400 font-medium transition-all duration-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none rounded px-3 py-2"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('points-calculator')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Points Calculator
              </Link>
            </div>
          </motion.nav>
          
          {/* Enhanced User Authentication */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-4"
              >
                {/* Enhanced User Dropdown with Premium Glassmorphism */}
                <Dropdown placement="bottom-end" offset={12}>
                  <DropdownTrigger>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-xl border border-gold-500/20 hover:border-gold-400/40 transition-all duration-300">
                        <Avatar
                          size="sm"
                          className="bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 font-bold"
                          name={user?.full_name?.charAt(0).toUpperCase()}
                        />
                        <div className="hidden sm:block text-left">
                          <div className="text-white font-medium text-sm">{user?.full_name}</div>
                          <div className="text-platinum-400 text-xs">Premium Member</div>
                        </div>
                        <Icon icon="lucide:chevron-down" className="text-platinum-400 transition-transform duration-300 hidden sm:block" />
                      </div>
                    </motion.div>
                  </DropdownTrigger>
                  <DropdownMenu 
                    aria-label="User actions"
                    className="w-80 max-w-xs"
                    classNames={{
                      base: "bg-slate-900/95 backdrop-blur-lg border border-gray-700/50 shadow-2xl rounded-2xl p-6 overflow-hidden",
                      list: "gap-3"
                    }}
                  >
                    {/* User Profile Header */}
                    <DropdownItem 
                      key="user-profile"
                      className="p-0 mb-4"
                      isReadOnly
                    >
                      <div className="flex items-center gap-4 p-4 bg-slate-800/60 rounded-2xl border border-gray-700/50">
                        <Avatar
                          size="md"
                          className="bg-gradient-to-r from-gold-500 to-gold-600 text-slate-900 font-bold ring-2 ring-gold-400/30"
                          name={user?.full_name?.charAt(0).toUpperCase()}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-white truncate">{user?.full_name}</div>
                          <div className="text-sm bg-gradient-to-r from-gold-400 to-gold-500 bg-clip-text text-transparent font-medium">Premium Member</div>
                          <div className="text-xs text-gray-300 truncate">{user?.email}</div>
                        </div>
                      </div>
                    </DropdownItem>

                    {/* My Searches */}
                    <DropdownItem 
                      key="searches"
                      onClick={() => handleNavigation('/searches')}
                      className="text-white hover:bg-white/5 rounded-2xl transition-colors duration-200 p-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-400/30">
                          <Icon icon="lucide:search" className="text-blue-400 text-lg" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">My Searches</div>
                          <div className="text-sm text-gray-400">Saved flight searches</div>
                        </div>
                        <Icon icon="lucide:chevron-right" className="text-gray-400 text-sm" />
                      </div>
                    </DropdownItem>
                    
                    {/* Settings */}
                    <DropdownItem 
                      key="settings"
                      onClick={() => handleNavigation('/settings')}
                      className="text-white hover:bg-white/5 rounded-2xl transition-colors duration-200 p-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gold-500/20 flex items-center justify-center border border-gold-400/30">
                          <Icon icon="lucide:settings" className="text-gold-400 text-lg" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white">Settings</div>
                          <div className="text-sm text-gray-400">Preferences & notifications</div>
                        </div>
                        <Icon icon="lucide:chevron-right" className="text-gray-400 text-sm" />
                      </div>
                    </DropdownItem>
                    
                    {/* Elegant Divider */}
                    <DropdownItem 
                      key="divider"
                      className="p-0 my-3"
                      isReadOnly
                    >
                      <div className="border-t border-gray-700/50 mx-2"></div>
                    </DropdownItem>
                    
                    {/* Sign Out */}
                    <DropdownItem 
                      key="logout" 
                      onClick={logout}
                      className="text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-2xl transition-colors duration-200 p-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center border border-red-400/30">
                          <Icon icon="lucide:log-out" className="text-red-400 text-lg" />
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-red-300">Sign Out</div>
                          <div className="text-sm text-red-400/70">Logout from account</div>
                        </div>
                        <Icon icon="lucide:chevron-right" className="text-red-400/50 text-sm" />
                      </div>
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-3"
              >
                <Button 
                  variant="light"
                  onClick={() => handleNavigation('/login')}
                  className="text-platinum-300 hover:text-gold-400 hover:bg-white/5 transition-all duration-300 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                  aria-label="Sign in to your account"
                >
                  <Icon icon="lucide:log-in" className="mr-2" aria-hidden="true" />
                  Sign In
                </Button>
                
                                  <motion.button
                    onClick={() => handleNavigation('/register')}
                    className="join-button focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    aria-label="Join AeroPoints premium membership"
                  >
                    <Icon icon="lucide:user-plus" className="mr-2" aria-hidden="true" />
                    Join AeroPoints
                  </motion.button>
              </motion.div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.div 
            className="md:hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              isIconOnly
              variant="light"
              className="text-white hover:text-gold-400 hover:bg-white/5"
            >
              <Icon icon="lucide:menu" className="text-xl" />
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Trust Indicators Bar */}
      <motion.div
        className="border-t border-white/5 py-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto trust-badges-container-header">
            {[
              { icon: 'lucide:shield-check', text: 'Bank-Level Security', subtext: 'SOC 2 Certified', color: 'text-green-400', title: '256-bit SSL encryption with SOC 2 Type II compliance' },
              { icon: 'lucide:zap', text: 'Real-Time Inventory', subtext: '30s Updates', color: 'text-yellow-400', title: 'Live data from 150+ airline partners updated every 30 seconds' },
              { icon: 'lucide:award', text: 'Award Winning Service', subtext: 'Travel Weekly 2024', color: 'text-gold-400', title: 'Winner of 2024 Best Travel Platform Award by Travel Weekly' },
              { icon: 'lucide:headphones', text: 'VIP Support 24/7', subtext: '12 Languages', color: 'text-blue-400', title: 'Dedicated concierge team available 24/7 in 12 languages' }
            ].map((item, index) => (
              <motion.div
                key={index}
                className="trust-badge group cursor-pointer flex-shrink-0"
                whileHover={{ scale: 1.03, y: -2 }}
                title={item.title}
              >
                <Icon icon={item.icon} className={`${item.color} mr-2 text-lg`} />
                <span className="font-semibold text-sm">{item.text}</span>
                <span className="ml-2 text-xs opacity-60 group-hover:opacity-100 transition-opacity">
                  {item.subtext}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
} 