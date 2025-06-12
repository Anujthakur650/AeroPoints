import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Select, SelectItem, Avatar, Chip } from "@heroui/react";
import { Icon } from '@iconify/react';
const Profile = () => {
    const { user, updateProfile, logout } = useAuth();
    // Editable profile state
    const [isEditing, setIsEditing] = useState(false);
    const [editedProfile, setEditedProfile] = useState({
        full_name: user?.full_name || '',
        email: user?.email || '',
        preferred_airport: user?.preferred_airport || '',
        frequent_flyer_programs: user?.frequent_flyer_programs || [],
        flight_preferences: user?.flight_preferences || {
            preferred_cabin: 'economy',
            preferred_airlines: [],
            preferred_airports: [],
            max_stops: 2,
            avoid_red_eye: false
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
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center", style: { background: 'var(--gradient-luxury)' }, children: _jsxs("div", { className: "glass-card p-8 rounded-3xl", children: [_jsx(Icon, { icon: "lucide:loader-2", className: "animate-spin text-gold-400 text-3xl mx-auto mb-4" }), _jsx("p", { className: "text-white text-center", children: "Loading profile..." })] }) }));
    }
    const handleSave = async () => {
        try {
            await updateProfile(editedProfile);
            setIsEditing(false);
        }
        catch (error) {
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
                preferred_cabin: 'economy',
                preferred_airlines: [],
                preferred_airports: [],
                max_stops: 2,
                avoid_red_eye: false
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
    return (_jsxs("div", { className: "min-h-screen relative overflow-hidden", style: { background: 'var(--gradient-luxury)' }, children: [_jsx("div", { className: "absolute inset-0 pointer-events-none", children: floatingElements.map((element) => (_jsx(motion.div, { className: "absolute", style: {
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                    }, animate: {
                        y: [-10, 10, -10],
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.15, 1],
                    }, transition: {
                        duration: element.duration,
                        delay: element.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }, children: _jsx("div", { className: "rounded-full bg-gradient-to-br from-gold-400/20 to-gold-600/10 backdrop-blur-sm", style: {
                            width: `${element.size}px`,
                            height: `${element.size}px`,
                        } }) }, element.id))) }), _jsx("div", { className: "relative z-10 min-h-screen px-4 py-12", children: _jsxs("div", { className: "max-w-6xl mx-auto", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, className: "text-center mb-12", children: [_jsx("div", { className: "luxury-script text-xl text-gold-400 mb-2", children: "Premium Member Dashboard" }), _jsx("h1", { className: "font-luxury text-4xl font-bold text-white mb-4", children: "Your Profile" })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.8, delay: 0.2 }, className: "lg:col-span-1", children: _jsx("div", { className: "glass-card p-8 rounded-3xl border border-gold-500/20", children: _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "relative mb-6", children: [_jsx(Avatar, { size: "lg", className: "w-24 h-24 mx-auto bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 text-2xl font-bold", name: user.full_name?.charAt(0).toUpperCase() }), _jsx("div", { className: "absolute -bottom-2 -right-2", children: _jsx("div", { className: "w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-navy-900", children: _jsx(Icon, { icon: "lucide:crown", className: "text-white text-sm" }) }) })] }), _jsx("h2", { className: "font-luxury text-2xl font-bold text-white mb-2", children: user.full_name }), _jsx("p", { className: "text-platinum-300 mb-4", children: user.email }), _jsx(Chip, { className: "mb-6 bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 font-semibold", startContent: _jsx(Icon, { icon: "lucide:star" }), children: user.is_admin ? 'Admin' : 'Premium Member' }), _jsxs("div", { className: "glass-card p-4 rounded-xl border border-emerald-500/20 mb-6", children: [_jsxs("div", { className: "flex items-center justify-center gap-2 mb-2", children: [_jsx(Icon, { icon: "lucide:award", className: "text-emerald-400 text-xl" }), _jsx("span", { className: "text-emerald-400 font-medium", children: "Points Balance" })] }), _jsx("div", { className: "text-3xl font-bold text-white", children: user.points_balance?.toLocaleString() || '0' })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-platinum-400", children: "Member Since" }), _jsx("span", { className: "text-white font-medium", children: "2024" })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-platinum-400", children: "Account Type" }), _jsx("span", { className: "text-white font-medium", children: user.isAdmin ? 'Administrator' : 'Standard' })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-platinum-400", children: "Searches This Month" }), _jsx("span", { className: "text-white font-medium", children: "27" })] })] })] }) }) }), _jsxs(motion.div, { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.8, delay: 0.4 }, className: "lg:col-span-2 space-y-6", children: [_jsxs("div", { className: "glass-card p-8 rounded-3xl border border-gold-500/20", children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsxs("h3", { className: "font-luxury text-2xl font-bold text-white flex items-center gap-2", children: [_jsx(Icon, { icon: "lucide:user", className: "text-gold-400" }), "Account Information"] }), _jsxs(Button, { variant: isEditing ? "flat" : "bordered", size: "sm", className: isEditing ? "bg-gold-500 text-navy-900" : "border-gold-400/50 text-gold-400 hover:bg-gold-400/10", onClick: () => setIsEditing(!isEditing), children: [_jsx(Icon, { icon: isEditing ? "lucide:x" : "lucide:edit", className: "mr-1" }), isEditing ? 'Cancel' : 'Edit Profile'] })] }), _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsx("div", { children: isEditing ? (_jsx(Input, { label: "Username", value: editedProfile.username, onChange: (e) => setEditedProfile({ ...editedProfile, username: e.target.value }), startContent: _jsx(Icon, { icon: "lucide:user", className: "text-gold-400" }), classNames: {
                                                                            input: "text-white placeholder:text-platinum-400 bg-transparent",
                                                                            label: "text-platinum-300 font-medium",
                                                                            inputWrapper: "bg-white/5 border-white/10 hover:border-gold-400/30 focus-within:border-gold-400/50 backdrop-blur-sm"
                                                                        } })) : (_jsxs("div", { children: [_jsx("p", { className: "text-platinum-400 text-sm mb-1", children: "Username" }), _jsx("p", { className: "text-white font-medium", children: user.username })] })) }), _jsx("div", { children: isEditing ? (_jsx(Input, { label: "Email Address", type: "email", value: editedProfile.email, onChange: (e) => setEditedProfile({ ...editedProfile, email: e.target.value }), startContent: _jsx(Icon, { icon: "lucide:mail", className: "text-gold-400" }), classNames: {
                                                                            input: "text-white placeholder:text-platinum-400 bg-transparent",
                                                                            label: "text-platinum-300 font-medium",
                                                                            inputWrapper: "bg-white/5 border-white/10 hover:border-gold-400/30 focus-within:border-gold-400/50 backdrop-blur-sm"
                                                                        } })) : (_jsxs("div", { children: [_jsx("p", { className: "text-platinum-400 text-sm mb-1", children: "Email Address" }), _jsx("p", { className: "text-white font-medium", children: user.email })] })) })] }), _jsxs("div", { className: "border-t border-white/10 pt-6", children: [_jsxs("h4", { className: "font-luxury text-lg text-white mb-4 flex items-center gap-2", children: [_jsx(Icon, { icon: "lucide:plane", className: "text-gold-400" }), "Travel Preferences"] }), _jsxs("div", { className: "space-y-4", children: [_jsx("div", { children: isEditing ? (_jsx(Select, { label: "Preferred Departure Airport", placeholder: "Select your primary airport", selectedKeys: editedProfile.preferredAirport ? [editedProfile.preferredAirport] : [], onSelectionChange: (keys) => setEditedProfile({ ...editedProfile, preferredAirport: Array.from(keys)[0] }), startContent: _jsx(Icon, { icon: "lucide:plane-takeoff", className: "text-gold-400" }), classNames: {
                                                                                    trigger: "bg-white/5 border-white/10 hover:border-gold-400/30 data-[hover=true]:border-gold-400/30 data-[focus=true]:border-gold-400/50 backdrop-blur-sm",
                                                                                    label: "text-platinum-300 font-medium",
                                                                                    value: "text-white"
                                                                                }, children: popularAirports.map((airport) => (_jsx(SelectItem, { children: airport.label }, airport.value))) })) : (_jsxs("div", { children: [_jsx("p", { className: "text-platinum-400 text-sm mb-1", children: "Preferred Airport" }), _jsx("p", { className: "text-white font-medium", children: "Los Angeles (LAX)" })] })) }), _jsxs("div", { children: [_jsx("p", { className: "text-platinum-400 text-sm mb-2", children: "Frequent Flyer Programs" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx(Chip, { className: "bg-gold-500/20 text-gold-300 border border-gold-500/30", children: "American Airlines AAdvantage" }), _jsx(Chip, { className: "bg-gold-500/20 text-gold-300 border border-gold-500/30", children: "Delta SkyMiles" })] })] })] })] })] }), isEditing && (_jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, className: "flex gap-4 mt-8 pt-6 border-t border-white/10", children: [_jsxs(Button, { size: "lg", className: "btn-luxury bg-gradient-to-r from-gold-500 to-gold-600 text-navy-900 hover:from-gold-400 hover:to-gold-500", onClick: handleSave, children: [_jsx(Icon, { icon: "lucide:save", className: "mr-2" }), "Save Changes"] }), _jsx(Button, { variant: "bordered", size: "lg", className: "border-white/20 text-white hover:bg-white/5", onClick: handleCancel, children: "Cancel" })] }))] }), _jsxs("div", { className: "glass-card p-8 rounded-3xl border border-gold-500/20", children: [_jsxs("h3", { className: "font-luxury text-2xl font-bold text-white mb-6 flex items-center gap-2", children: [_jsx(Icon, { icon: "lucide:activity", className: "text-gold-400" }), "Recent Activity"] }), _jsx("div", { className: "space-y-4", children: [
                                                        { action: 'Flight Search', details: 'LAX → JFK', time: '2 hours ago', icon: 'lucide:search' },
                                                        { action: 'Points Earned', details: '+2,500 points', time: '1 day ago', icon: 'lucide:plus-circle' },
                                                        { action: 'Profile Updated', details: 'Travel preferences', time: '3 days ago', icon: 'lucide:user' }
                                                    ].map((activity, index) => (_jsxs("div", { className: "flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10", children: [_jsx("div", { className: "w-10 h-10 rounded-full bg-gold-500/20 flex items-center justify-center", children: _jsx(Icon, { icon: activity.icon, className: "text-gold-400" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-white font-medium", children: activity.action }), _jsx("p", { className: "text-platinum-400 text-sm", children: activity.details })] }), _jsx("p", { className: "text-platinum-400 text-sm", children: activity.time })] }, index))) })] }), _jsxs("div", { className: "glass-card p-8 rounded-3xl border border-gold-500/20", children: [_jsxs("h3", { className: "font-luxury text-2xl font-bold text-white mb-6 flex items-center gap-2", children: [_jsx(Icon, { icon: "lucide:settings", className: "text-gold-400" }), "Account Actions"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs(Button, { variant: "bordered", size: "lg", className: "border-blue-400/50 text-blue-400 hover:bg-blue-400/10 h-14", children: [_jsx(Icon, { icon: "lucide:download", className: "mr-2" }), "Export Data"] }), _jsxs(Button, { variant: "bordered", size: "lg", className: "border-red-400/50 text-red-400 hover:bg-red-400/10 h-14", onClick: logout, children: [_jsx(Icon, { icon: "lucide:log-out", className: "mr-2" }), "Sign Out"] })] })] })] })] })] }) })] }));
};
export default Profile;
