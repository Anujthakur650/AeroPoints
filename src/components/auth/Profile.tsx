import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Select, SelectItem, Avatar, Chip, Card, CardBody } from "@heroui/react";
import { Icon } from '@iconify/react';

const Profile: React.FC = () => {
  const { user, updateProfile, logout } = useAuth();
  
  // Editable profile state
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    preferred_airport: user?.preferred_airport || '',
    frequent_flyer_programs: user?.frequent_flyer_programs || [],
    flight_preferences: user?.flight_preferences || {
      preferred_class: 'economy',
      preferred_airlines: [],
      preferred_airports: [],
      flexible_dates: false,
      max_stops: 2,
      meal_preference: 'any',
      seat_preference: 'any'
    }
  });

  // Popular airports for the select dropdown
  const popularAirports = [
    { value: 'LAX', label: 'Los Angeles (LAX)' },
    { value: 'JFK', label: 'New York JFK (JFK)' },
    { value: 'LHR', label: 'London Heathrow (LHR)' },
    { value: 'DXB', label: 'Dubai (DXB)' },
    { value: 'NRT', label: 'Tokyo Narita (NRT)' },
    { value: 'CDG', label: 'Paris Charles de Gaulle (CDG)' },
    { value: 'SIN', label: 'Singapore (SIN)' },
    { value: 'DFW', label: 'Dallas/Fort Worth (DFW)' },
    { value: 'ORD', label: 'Chicago O\'Hare (ORD)' },
    { value: 'FRA', label: 'Frankfurt (FRA)' }
  ];

  // Frequent flyer programs
  const frequentFlyerOptions = [
    'American Airlines AAdvantage',
    'Delta SkyMiles',
    'United MileagePlus',
    'British Airways Executive Club',
    'Emirates Skywards',
    'Qatar Airways Privilege Club',
    'Lufthansa Miles & More',
    'Air France-KLM Flying Blue',
    'Singapore Airlines KrisFlyer',
    'Cathay Pacific Asia Miles'
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--gradient-luxury)' }}>
        <div className="glass-card p-8 rounded-3xl">
          <Icon icon="lucide:loader-2" className="animate-spin text-gold-400 text-3xl mx-auto mb-4" />
          <p className="text-white text-center">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      await updateProfile(editedProfile);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      // Error is already handled in AuthContext
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset edited profile to original values
    setEditedProfile({
      full_name: user?.full_name || '',
      email: user?.email || '',
      preferred_airport: user?.preferred_airport || '',
      frequent_flyer_programs: user?.frequent_flyer_programs || [],
      flight_preferences: user?.flight_preferences || {
        preferred_class: 'economy',
        preferred_airlines: [],
        preferred_airports: [],
        flexible_dates: false,
        max_stops: 2,
        meal_preference: 'any',
        seat_preference: 'any'
      }
    });
  };

  // Floating background elements
  const floatingElements = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 5 + 7,
    delay: Math.random() * 3,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'var(--gradient-luxury)' }}>
      {/* Floating luxury elements */}
      <div className="absolute inset-0 pointer-events-none">
        {floatingElements.map((element) => (
          <motion.div
            key={element.id}
            className="absolute"
            style={{
              left: `${element.x}%`,
              top: `${element.y}%`,
            }}
            animate={{
              y: [-10, 10, -10],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: element.duration,
              delay: element.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div 
              className="rounded-full bg-gradient-to-br from-gold-400/20 to-gold-600/10 backdrop-blur-sm"
              style={{
                width: `${element.size}px`,
                height: `${element.size}px`,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="luxury-script text-xl text-gold-400 mb-2">
              Premium Member Dashboard
            </div>
            <h1 className="font-luxury text-4xl font-bold text-white mb-4">
              Your Profile
            </h1>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Overview Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="glass-card p-8 rounded-3xl border border-gold-500/20">
                <div className="text-center">
                  {/* Avatar */}
                  <div className="relative mb-6">
                    <Avatar
                      size="lg"
                      className="w-24 h-24 mx-auto bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 text-2xl font-bold"
                      name={user.full_name?.charAt(0).toUpperCase()}
                    />
                    <div className="absolute -bottom-2 -right-2">
                      <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-navy-900">
                        <Icon icon="lucide:crown" className="text-white text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* User Info */}
                  <h2 className="font-luxury text-2xl font-bold text-white mb-2">
                    {user.full_name}
                  </h2>
                  <p className="text-platinum-300 mb-4">{user.email}</p>
                  
                  {/* Membership Status */}
                  <Chip
                    className="mb-6 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 font-semibold"
                    startContent={<Icon icon="lucide:star" />}
                  >
                    {user.is_admin ? 'Admin' : 'Premium Member'}
                  </Chip>

                  {/* Points Balance */}
                  <div className="glass-card p-4 rounded-xl border border-emerald-500/20 mb-6">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Icon icon="lucide:award" className="text-emerald-400 text-xl" />
                      <span className="text-emerald-400 font-medium">Points Balance</span>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {user.points_balance?.toLocaleString() || '0'}
                    </div>
                  </div>

                  {/* Account Stats */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-platinum-400">Member Since</span>
                      <span className="text-white font-medium">2024</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-platinum-400">Account Type</span>
                      <span className="text-white font-medium">
                        {user.isAdmin ? 'Administrator' : 'Standard'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-platinum-400">Searches This Month</span>
                      <span className="text-white font-medium">27</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Profile Details & Settings */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-2 space-y-6"
            >
              {/* Account Information */}
              <div className="glass-card p-8 rounded-3xl border border-gold-500/20">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-luxury text-2xl font-bold text-white flex items-center gap-2">
                    <Icon icon="lucide:user" className="text-gold-400" />
                    Account Information
                  </h3>
                  <Button
                    variant={isEditing ? "flat" : "bordered"}
                    size="sm"
                    className={isEditing ? "bg-gold-500 text-navy-900" : "border-gold-400/50 text-gold-400 hover:bg-gold-400/10"}
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Icon icon={isEditing ? "lucide:x" : "lucide:edit"} className="mr-1" />
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      {isEditing ? (
                        <Input
                          label="Username"
                          value={editedProfile.username}
                          onChange={(e) => setEditedProfile({...editedProfile, username: e.target.value})}
                          startContent={<Icon icon="lucide:user" className="text-gold-400" />}
                          classNames={{
                            input: "text-white placeholder:text-platinum-400 bg-transparent",
                            label: "text-platinum-300 font-medium",
                            inputWrapper: "bg-white/5 border-white/10 hover:border-gold-400/30 focus-within:border-gold-400/50 backdrop-blur-sm"
                          }}
                        />
                      ) : (
                        <div>
                          <p className="text-platinum-400 text-sm mb-1">Username</p>
                          <p className="text-white font-medium">{user.username}</p>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      {isEditing ? (
                        <Input
                          label="Email Address"
                          type="email"
                          value={editedProfile.email}
                          onChange={(e) => setEditedProfile({...editedProfile, email: e.target.value})}
                          startContent={<Icon icon="lucide:mail" className="text-gold-400" />}
                          classNames={{
                            input: "text-white placeholder:text-platinum-400 bg-transparent",
                            label: "text-platinum-300 font-medium",
                            inputWrapper: "bg-white/5 border-white/10 hover:border-gold-400/30 focus-within:border-gold-400/50 backdrop-blur-sm"
                          }}
                        />
                      ) : (
                        <div>
                          <p className="text-platinum-400 text-sm mb-1">Email Address</p>
                          <p className="text-white font-medium">{user.email}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Travel Preferences */}
                  <div className="border-t border-white/10 pt-6">
                    <h4 className="font-luxury text-lg text-white mb-4 flex items-center gap-2">
                      <Icon icon="lucide:plane" className="text-gold-400" />
                      Travel Preferences
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        {isEditing ? (
                          <Select
                            label="Preferred Departure Airport"
                            placeholder="Select your primary airport"
                            selectedKeys={editedProfile.preferredAirport ? [editedProfile.preferredAirport] : []}
                            onSelectionChange={(keys) => setEditedProfile({...editedProfile, preferredAirport: Array.from(keys)[0] as string})}
                            startContent={<Icon icon="lucide:plane-takeoff" className="text-gold-400" />}
                            classNames={{
                              trigger: "bg-white/5 border-white/10 hover:border-gold-400/30 data-[hover=true]:border-gold-400/30 data-[focus=true]:border-gold-400/50 backdrop-blur-sm",
                              label: "text-platinum-300 font-medium",
                              value: "text-white"
                            }}
                          >
                                                         {popularAirports.map((airport) => (
                               <SelectItem key={airport.value}>
                                 {airport.label}
                               </SelectItem>
                             ))}
                          </Select>
                        ) : (
                          <div>
                            <p className="text-platinum-400 text-sm mb-1">Preferred Airport</p>
                            <p className="text-white font-medium">Los Angeles (LAX)</p>
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="text-platinum-400 text-sm mb-2">Frequent Flyer Programs</p>
                        <div className="flex flex-wrap gap-2">
                          <Chip className="bg-gold-500/20 text-gold-300 border border-gold-500/30">
                            American Airlines AAdvantage
                          </Chip>
                          <Chip className="bg-gold-500/20 text-gold-300 border border-gold-500/30">
                            Delta SkyMiles
                          </Chip>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save/Cancel Buttons */}
                {isEditing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-4 mt-8 pt-6 border-t border-white/10"
                  >
                    <Button
                      size="lg"
                      className="btn-luxury bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 hover:from-gold-400 hover:to-gold-500"
                      onClick={handleSave}
                    >
                      <Icon icon="lucide:save" className="mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      variant="bordered"
                      size="lg"
                      className="border-white/20 text-white hover:bg-white/5"
                      onClick={handleCancel}
                    >
                      Cancel
                    </Button>
                  </motion.div>
                )}
              </div>

              {/* Recent Activity */}
              <div className="glass-card p-8 rounded-3xl border border-gold-500/20">
                <h3 className="font-luxury text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Icon icon="lucide:activity" className="text-gold-400" />
                  Recent Activity
                </h3>
                
                <div className="space-y-4">
                  {[
                    { action: 'Flight Search', details: 'LAX → JFK', time: '2 hours ago', icon: 'lucide:search' },
                    { action: 'Points Earned', details: '+2,500 points', time: '1 day ago', icon: 'lucide:plus-circle' },
                    { action: 'Profile Updated', details: 'Travel preferences', time: '3 days ago', icon: 'lucide:user' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center">
                        <Icon icon={activity.icon} className="text-gold-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-medium">{activity.action}</p>
                        <p className="text-platinum-400 text-sm">{activity.details}</p>
                      </div>
                      <p className="text-platinum-400 text-sm">{activity.time}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Account Actions */}
              <div className="glass-card p-8 rounded-3xl border border-gold-500/20">
                <h3 className="font-luxury text-2xl font-bold text-white mb-6 flex items-center gap-2">
                  <Icon icon="lucide:settings" className="text-gold-400" />
                  Account Actions
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant="bordered"
                    size="lg"
                    className="border-blue-400/50 text-blue-400 hover:bg-blue-400/10 h-14"
                  >
                    <Icon icon="lucide:download" className="mr-2" />
                    Export Data
                  </Button>
                  
                  <Button
                    variant="bordered"
                    size="lg"
                    className="border-red-400/50 text-red-400 hover:bg-red-400/10 h-14"
                    onClick={logout}
                  >
                    <Icon icon="lucide:log-out" className="mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 