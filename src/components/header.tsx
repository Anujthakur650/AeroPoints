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
            <Link to="/" className="flex items-center gap-3">
              <div className="aeropoints-logo w-10 h-10 rounded-xl flex items-center justify-center">
                <Icon icon="lucide:plane" className="text-navy-900 text-xl" />
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
                className="nav-link text-platinum-300 hover:text-gold-400 font-medium transition-all duration-300"
              >
                Search Flights
              </Link>
              <Link 
                to="/deals" 
                className="nav-link text-platinum-300 hover:text-gold-400 font-medium transition-all duration-300"
              >
                Premium Deals
              </Link>
              <Link 
                to="/points-calculator" 
                className="nav-link text-platinum-300 hover:text-gold-400 font-medium transition-all duration-300"
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
                {/* Enhanced Points Balance */}
                <motion.div 
                  className="hidden sm:flex items-center gap-2 glass-card px-3 py-2 rounded-xl border border-emerald-500/20"
                  whileHover={{ scale: 1.02, y: -1 }}
                  transition={{ duration: 0.2 }}
                >
                  <Icon icon="lucide:award" className="text-emerald-400" />
                  <span className="text-emerald-300 font-medium">
                    {user?.points_balance?.toLocaleString() || '0'}
                  </span>
                </motion.div>

                {/* Enhanced User Dropdown */}
                <Dropdown placement="bottom-end">
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
                        <Icon icon="lucide:chevron-down" className="text-platinum-400" />
                      </div>
                    </motion.div>
                  </DropdownTrigger>
                  <DropdownMenu 
                    aria-label="User actions"
                    className="w-64"
                    classNames={{
                      base: "bg-navy-900/95 backdrop-blur-sm border border-white/10",
                      list: "p-2"
                    }}
                  >
                    <DropdownItem 
                      key="profile" 
                      onClick={() => handleNavigation('/profile')}
                      className="text-white hover:bg-white/10 rounded-lg mb-1"
                    >
                      <div className="flex items-center gap-3 py-1">
                        <Icon icon="lucide:user" className="text-gold-400" />
                        <div>
                          <div className="font-medium">My Profile</div>
                          <div className="text-xs text-platinum-400">Manage account settings</div>
                        </div>
                      </div>
                    </DropdownItem>
                    
                    <DropdownItem 
                      key="points"
                      className="text-white hover:bg-white/10 rounded-lg mb-1"
                    >
                      <div className="flex items-center gap-3 py-1">
                        <Icon icon="lucide:award" className="text-emerald-400" />
                        <div>
                          <div className="font-medium">{user?.points_balance?.toLocaleString()} Points</div>
                          <div className="text-xs text-platinum-400">View points history</div>
                        </div>
                      </div>
                    </DropdownItem>
                    
                    <DropdownItem 
                      key="searches"
                      className="text-white hover:bg-white/10 rounded-lg mb-1"
                    >
                      <div className="flex items-center gap-3 py-1">
                        <Icon icon="lucide:search" className="text-blue-400" />
                        <div>
                          <div className="font-medium">My Searches</div>
                          <div className="text-xs text-platinum-400">Saved flight searches</div>
                        </div>
                      </div>
                    </DropdownItem>
                    
                    <DropdownItem 
                      key="settings"
                      onClick={() => handleNavigation('/settings')}
                      className="text-white hover:bg-white/10 rounded-lg mb-1"
                    >
                      <div className="flex items-center gap-3 py-1">
                        <Icon icon="lucide:settings" className="text-gray-400" />
                        <div>
                          <div className="font-medium">Settings</div>
                          <div className="text-xs text-platinum-400">Preferences & notifications</div>
                        </div>
                      </div>
                    </DropdownItem>
                    
                    <DropdownItem 
                      key="divider"
                      className="p-0 mb-2"
                    >
                      <div className="border-t border-white/10 mx-2"></div>
                    </DropdownItem>
                    
                    <DropdownItem 
                      key="logout" 
                      onClick={logout}
                      className="text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      <div className="flex items-center gap-3 py-1">
                        <Icon icon="lucide:log-out" className="text-red-400" />
                        <div>
                          <div className="font-medium">Sign Out</div>
                          <div className="text-xs text-red-300/70">Logout from account</div>
                        </div>
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
                  className="text-platinum-300 hover:text-gold-400 hover:bg-white/5 transition-all duration-300"
                >
                  <Icon icon="lucide:log-in" className="mr-2" />
                  Sign In
                </Button>
                
                <motion.button
                  onClick={() => handleNavigation('/register')}
                  className="join-button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon icon="lucide:user-plus" className="mr-2" />
                  JOIN AEROPOINTS
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
        className="border-t border-white/5 py-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="trust-badges-container flex items-center justify-center gap-4 flex-wrap">
            <motion.div 
              className="trust-badge"
              whileHover={{ scale: 1.02, y: -1 }}
            >
              🔒 Bank-Level Security
            </motion.div>
            <motion.div 
              className="trust-badge"
              whileHover={{ scale: 1.02, y: -1 }}
            >
              ✈️ Real-Time Inventory
            </motion.div>
            <motion.div 
              className="trust-badge"
              whileHover={{ scale: 1.02, y: -1 }}
            >
              🏆 Award Winning Service
            </motion.div>
            <motion.div 
              className="trust-badge"
              whileHover={{ scale: 1.02, y: -1 }}
            >
              💎 VIP Support 24/7
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
} 