import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button, Card, CardBody, Switch, Input, Select, SelectItem, Avatar, Chip, Tabs, Tab } from "@heroui/react";
import { Icon } from '@iconify/react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Settings: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: true,
    priceAlerts: true,
    preferredCurrency: 'USD',
    preferredClass: 'economy',
    autoSaveSearches: true,
    darkMode: true
  });

  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: '',
    preferred_airport: ''
  });

  const handlePreferenceChange = (key: keyof typeof preferences, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleProfileUpdate = () => {
    // Here you would typically call an API to update the profile
    console.log('Updating profile:', profileData);
    setIsEditingProfile(false);
  };

  const currencies = [
    { key: 'USD', label: 'US Dollar (USD)' },
    { key: 'EUR', label: 'Euro (EUR)' },
    { key: 'GBP', label: 'British Pound (GBP)' },
    { key: 'CAD', label: 'Canadian Dollar (CAD)' },
    { key: 'AUD', label: 'Australian Dollar (AUD)' }
  ];

  const cabinClasses = [
    { key: 'economy', label: 'Economy' },
    { key: 'premium_economy', label: 'Premium Economy' },
    { key: 'business', label: 'Business' },
    { key: 'first', label: 'First Class' }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16" style={{
      background: 'linear-gradient(135deg, hsl(222, 84%, 10%), hsl(222, 84%, 21%), hsl(214, 22%, 18%))'
    }}>
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex items-center gap-4 mb-8"
        >
          <Link 
            to="/" 
            className="flex items-center gap-2 text-platinum-300 hover:text-gold-400 transition-colors"
          >
            <Icon icon="lucide:arrow-left" className="text-xl" />
            <span>Back to Home</span>
          </Link>
          <div className="h-6 border-l border-platinum-400/30 mx-2"></div>
          <h1 className="font-luxury text-4xl font-bold text-white">Account Settings</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="glass-card p-8 rounded-3xl border border-gold-500/20 sticky top-8">
              <div className="text-center mb-6">
                {/* Avatar */}
                <div className="relative mb-6">
                  <Avatar
                    size="lg"
                    className="w-24 h-24 mx-auto bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 text-2xl font-bold ring-4 ring-gold-400/30"
                    name={user?.full_name?.charAt(0).toUpperCase()}
                  />
                  <div className="absolute -bottom-2 -right-2">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-navy-900">
                      <Icon icon="lucide:crown" className="text-white text-sm" />
                    </div>
                  </div>
                </div>

                {/* User Info */}
                <h2 className="font-luxury text-2xl font-bold text-white mb-2">
                  {user?.full_name}
                </h2>
                <p className="text-platinum-300 mb-4">{user?.email}</p>
                
                {/* Membership Status */}
                <Chip
                  className="mb-6 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 font-semibold"
                  startContent={<Icon icon="lucide:star" />}
                >
                  Premium Member
                </Chip>

                {/* Points Balance */}
                <div className="glass-card p-4 rounded-xl border border-emerald-500/20 mb-6">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Icon icon="lucide:award" className="text-emerald-400 text-xl" />
                    <span className="text-emerald-400 font-medium">Points Balance</span>
                  </div>
                  <div className="text-3xl font-bold text-white">
                    {user?.points_balance?.toLocaleString() || '1,000'}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <Button
                    variant="bordered"
                    size="sm"
                    className="w-full border-blue-400/50 text-blue-400 hover:bg-blue-400/10"
                    startContent={<Icon icon="lucide:download" />}
                  >
                    Export Data
                  </Button>
                  <Button
                    variant="bordered"
                    size="sm"
                    className="w-full border-red-400/50 text-red-400 hover:bg-red-400/10"
                    onClick={logout}
                    startContent={<Icon icon="lucide:log-out" />}
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Settings Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2"
          >
            <Tabs 
              aria-label="Settings sections" 
              variant="underlined"
              classNames={{
                tabList: "gap-6 w-full relative rounded-none p-0 border-b border-gold-400/20",
                cursor: "w-full bg-gold-400",
                tab: "max-w-fit px-0 h-12",
                tabContent: "group-data-[selected=true]:text-gold-400 text-platinum-300 font-medium"
              }}
            >
              {/* Profile Tab */}
              <Tab
                key="profile"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:user" />
                    <span>Profile</span>
                  </div>
                }
              >
                <div className="pt-6">
                  <Card className="glass-card border border-gold-500/20">
                    <CardBody className="p-8">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-luxury text-2xl font-bold text-white flex items-center gap-2">
                          <Icon icon="lucide:user-circle" className="text-gold-400" />
                          Profile Information
                        </h3>
                        <Button
                          variant={isEditingProfile ? "flat" : "bordered"}
                          size="sm"
                          className={isEditingProfile ? "bg-gold-500 text-navy-900" : "border-gold-400/50 text-gold-400 hover:bg-gold-400/10"}
                          onClick={() => setIsEditingProfile(!isEditingProfile)}
                        >
                          <Icon icon={isEditingProfile ? "lucide:x" : "lucide:edit"} className="mr-1" />
                          {isEditingProfile ? 'Cancel' : 'Edit Profile'}
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Full Name"
                          value={profileData.full_name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, full_name: e.target.value }))}
                          isDisabled={!isEditingProfile}
                          variant="bordered"
                          classNames={{
                            input: "text-white",
                            label: "text-platinum-300",
                            inputWrapper: "border-gold-400/30 data-[hover=true]:border-gold-400/50"
                          }}
                        />
                        <Input
                          label="Email"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                          isDisabled={!isEditingProfile}
                          variant="bordered"
                          classNames={{
                            input: "text-white",
                            label: "text-platinum-300",
                            inputWrapper: "border-gold-400/30 data-[hover=true]:border-gold-400/50"
                          }}
                        />
                        <Input
                          label="Phone Number"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          isDisabled={!isEditingProfile}
                          variant="bordered"
                          classNames={{
                            input: "text-white",
                            label: "text-platinum-300",
                            inputWrapper: "border-gold-400/30 data-[hover=true]:border-gold-400/50"
                          }}
                        />
                        <Input
                          label="Preferred Airport"
                          value={profileData.preferred_airport}
                          onChange={(e) => setProfileData(prev => ({ ...prev, preferred_airport: e.target.value }))}
                          isDisabled={!isEditingProfile}
                          variant="bordered"
                          classNames={{
                            input: "text-white",
                            label: "text-platinum-300",
                            inputWrapper: "border-gold-400/30 data-[hover=true]:border-gold-400/50"
                          }}
                        />
                      </div>

                      {isEditingProfile && (
                        <div className="flex justify-end gap-3 mt-6">
                          <Button
                            variant="bordered"
                            className="border-platinum-400/50 text-platinum-300"
                            onClick={() => setIsEditingProfile(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 font-semibold"
                            onClick={handleProfileUpdate}
                          >
                            Save Changes
                          </Button>
                        </div>
                      )}
                    </CardBody>
                  </Card>
                </div>
              </Tab>

              {/* Preferences Tab */}
              <Tab
                key="preferences"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:settings" />
                    <span>Preferences</span>
                  </div>
                }
              >
                <div className="pt-6 space-y-6">
                  {/* Search Preferences */}
                  <Card className="glass-card border border-gold-500/20">
                    <CardBody className="p-8">
                      <h3 className="font-luxury text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Icon icon="lucide:search" className="text-gold-400" />
                        Search Preferences
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                          label="Preferred Currency"
                          selectedKeys={[preferences.preferredCurrency]}
                          onSelectionChange={(keys) => handlePreferenceChange('preferredCurrency', Array.from(keys)[0] as string)}
                          variant="bordered"
                          classNames={{
                            trigger: "border-gold-400/30 data-[hover=true]:border-gold-400/50",
                            label: "text-platinum-300",
                            value: "text-white"
                          }}
                        >
                          {currencies.map((currency) => (
                            <SelectItem key={currency.key}>{currency.label}</SelectItem>
                          ))}
                        </Select>

                        <Select
                          label="Preferred Cabin Class"
                          selectedKeys={[preferences.preferredClass]}
                          onSelectionChange={(keys) => handlePreferenceChange('preferredClass', Array.from(keys)[0] as string)}
                          variant="bordered"
                          classNames={{
                            trigger: "border-gold-400/30 data-[hover=true]:border-gold-400/50",
                            label: "text-platinum-300",
                            value: "text-white"
                          }}
                        >
                          {cabinClasses.map((cabinClass) => (
                            <SelectItem key={cabinClass.key}>{cabinClass.label}</SelectItem>
                          ))}
                        </Select>
                      </div>

                      <div className="mt-6">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center gap-3">
                            <Icon icon="lucide:bookmark" className="text-blue-400" />
                            <div>
                              <div className="font-medium text-white">Auto-save Searches</div>
                              <div className="text-sm text-platinum-400">Automatically save your search history</div>
                            </div>
                          </div>
                          <Switch
                            isSelected={preferences.autoSaveSearches}
                            onValueChange={(value) => handlePreferenceChange('autoSaveSearches', value)}
                            classNames={{
                              wrapper: "group-data-[selected=true]:bg-gold-400"
                            }}
                          />
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Display Preferences */}
                  <Card className="glass-card border border-gold-500/20">
                    <CardBody className="p-8">
                      <h3 className="font-luxury text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Icon icon="lucide:palette" className="text-gold-400" />
                        Display Preferences
                      </h3>
                      
                      <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                          <Icon icon="lucide:moon" className="text-purple-400" />
                          <div>
                            <div className="font-medium text-white">Dark Mode</div>
                            <div className="text-sm text-platinum-400">Use dark theme throughout the application</div>
                          </div>
                        </div>
                        <Switch
                          isSelected={preferences.darkMode}
                          onValueChange={(value) => handlePreferenceChange('darkMode', value)}
                          classNames={{
                            wrapper: "group-data-[selected=true]:bg-gold-400"
                          }}
                        />
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </Tab>

              {/* Notifications Tab */}
              <Tab
                key="notifications"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:bell" />
                    <span>Notifications</span>
                  </div>
                }
              >
                <div className="pt-6">
                  <Card className="glass-card border border-gold-500/20">
                    <CardBody className="p-8">
                      <h3 className="font-luxury text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Icon icon="lucide:bell-ring" className="text-gold-400" />
                        Notification Settings
                      </h3>
                      
                      <div className="space-y-4">
                        {[
                          {
                            key: 'emailNotifications',
                            icon: 'lucide:mail',
                            title: 'Email Notifications',
                            description: 'Receive important updates via email',
                            color: 'text-blue-400'
                          },
                          {
                            key: 'pushNotifications',
                            icon: 'lucide:smartphone',
                            title: 'Push Notifications',
                            description: 'Get real-time alerts on your device',
                            color: 'text-green-400'
                          },
                          {
                            key: 'priceAlerts',
                            icon: 'lucide:trending-down',
                            title: 'Price Alerts',
                            description: 'Notify when flight prices drop',
                            color: 'text-emerald-400'
                          },
                          {
                            key: 'marketingEmails',
                            icon: 'lucide:megaphone',
                            title: 'Marketing Communications',
                            description: 'Receive deals and promotional offers',
                            color: 'text-purple-400'
                          }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="flex items-center gap-3">
                              <Icon icon={item.icon} className={`${item.color} text-xl`} />
                              <div>
                                <div className="font-medium text-white">{item.title}</div>
                                <div className="text-sm text-platinum-400">{item.description}</div>
                              </div>
                            </div>
                            <Switch
                              isSelected={preferences[item.key as keyof typeof preferences] as boolean}
                              onValueChange={(value) => handlePreferenceChange(item.key as keyof typeof preferences, value)}
                              classNames={{
                                wrapper: "group-data-[selected=true]:bg-gold-400"
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </Tab>

              {/* Security Tab */}
              <Tab
                key="security"
                title={
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:shield" />
                    <span>Security</span>
                  </div>
                }
              >
                <div className="pt-6">
                  <Card className="glass-card border border-gold-500/20">
                    <CardBody className="p-8">
                      <h3 className="font-luxury text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Icon icon="lucide:shield-check" className="text-gold-400" />
                        Security Settings
                      </h3>
                      
                      <div className="space-y-6">
                        {/* Password Change */}
                        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Icon icon="lucide:key" className="text-yellow-400 text-xl" />
                              <div>
                                <div className="font-medium text-white">Password</div>
                                <div className="text-sm text-platinum-400">Last changed 30 days ago</div>
                              </div>
                            </div>
                            <Button
                              variant="bordered"
                              size="sm"
                              className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10"
                            >
                              Change Password
                            </Button>
                          </div>
                        </div>

                        {/* Two-Factor Authentication */}
                        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Icon icon="lucide:smartphone" className="text-green-400 text-xl" />
                              <div>
                                <div className="font-medium text-white">Two-Factor Authentication</div>
                                <div className="text-sm text-platinum-400">Add an extra layer of security</div>
                              </div>
                            </div>
                            <Chip className="bg-red-500/20 text-red-400">
                              Disabled
                            </Chip>
                          </div>
                          <Button
                            variant="bordered"
                            size="sm"
                            className="border-green-400/50 text-green-400 hover:bg-green-400/10"
                          >
                            Enable 2FA
                          </Button>
                        </div>

                        {/* Login Sessions */}
                        <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Icon icon="lucide:monitor" className="text-blue-400 text-xl" />
                              <div>
                                <div className="font-medium text-white">Active Sessions</div>
                                <div className="text-sm text-platinum-400">Manage your active login sessions</div>
                              </div>
                            </div>
                            <Button
                              variant="bordered"
                              size="sm"
                              className="border-blue-400/50 text-blue-400 hover:bg-blue-400/10"
                            >
                              View Sessions
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              </Tab>
            </Tabs>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 