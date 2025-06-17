import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button, Input } from "@heroui/react";
import { Icon } from '@iconify/react';
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const { login, loading, error, loginWithGoogle, isGoogleAuthAvailable } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    // Debug log to see the Google auth availability status
    console.log('Login component - Google OAuth available:', isGoogleAuthAvailable);
    // Get the redirect path or default to home
    const from = location.state?.from?.pathname || '/';
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            // Show success message
            console.log('LOGIN SUCCESS: Welcome back!');
            // Use React navigation instead of hard refresh
            navigate(from, { replace: true });
        }
        catch (err) {
            // Error is already handled in AuthContext
            console.error('Login failed:', err);
        }
    };
    // Floating background elements
    const floatingElements = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        size: Math.random() * 5 + 3,
        duration: Math.random() * 4 + 5,
        delay: Math.random() * 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
    }));
    return (_jsxs("div", { className: "min-h-screen relative overflow-hidden", style: { background: 'var(--gradient-luxury)' }, children: [_jsx("div", { className: "absolute inset-0 pointer-events-none", children: floatingElements.map((element) => (_jsx(motion.div, { className: "absolute", style: {
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                    }, animate: {
                        y: [-15, 15, -15],
                        opacity: [0.1, 0.4, 0.1],
                        scale: [1, 1.1, 1],
                    }, transition: {
                        duration: element.duration,
                        delay: element.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }, children: _jsx("div", { className: "rounded-full bg-gradient-to-br from-gold-400/25 to-gold-600/15 backdrop-blur-sm", style: {
                            width: `${element.size}px`,
                            height: `${element.size}px`,
                        } }) }, element.id))) }), _jsx("div", { className: "relative z-10 min-h-screen flex items-center justify-center px-4 py-12", children: _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8 }, className: "w-full max-w-lg", children: [_jsxs(motion.div, { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.2 }, className: "login-header", children: [_jsxs(Link, { to: "/", className: "inline-flex items-center gap-3 mb-6", children: [_jsx(Icon, { icon: "lucide:plane", className: "text-gold-400 text-3xl" }), _jsx("span", { className: "font-luxury text-3xl font-bold text-white", children: "AeroPoints" })] }), _jsx("div", { className: "welcome-back-text", children: "Welcome Back" }), _jsx("h1", { className: "login-title", children: "Sign In" }), _jsx("p", { className: "login-subtitle", children: "Access your premium travel dashboard" })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.3 }, className: "trust-indicators-row", children: [_jsxs("div", { className: "trust-indicator-badge bank-security", children: [_jsx(Icon, { icon: "lucide:shield-check", className: "trust-badge-icon" }), _jsx("span", { className: "trust-badge-text", children: "Secure Login" })] }), _jsxs("div", { className: "trust-indicator-badge real-time", children: [_jsx(Icon, { icon: "lucide:zap", className: "trust-badge-icon" }), _jsx("span", { className: "trust-badge-text", children: "Instant Access" })] }), _jsxs("div", { className: "trust-indicator-badge vip-support", children: [_jsx(Icon, { icon: "lucide:star", className: "trust-badge-icon" }), _jsx("span", { className: "trust-badge-text", children: "VIP Dashboard" })] })] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 0.4 }, className: "login-container", children: _jsxs("div", { className: "login-content", children: [error && (_jsx(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, className: "bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm", role: "alert", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Icon, { icon: "lucide:alert-circle", className: "text-red-400" }), _jsx("span", { children: error })] }) })), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [_jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6, delay: 0.5 }, className: "login-form-group", children: [_jsx(Icon, { icon: "lucide:mail", className: "login-input-icon" }), _jsx(Input, { type: "email", placeholder: "Enter your email", value: email, onChange: (e) => setEmail(e.target.value), className: "login-input", classNames: {
                                                            input: "text-white placeholder:text-platinum-400 bg-transparent pl-12",
                                                            inputWrapper: "bg-transparent border-2 border-gold-400/20 hover:border-gold-400/30 focus-within:border-gold-400/50 backdrop-blur-sm h-14 rounded-xl"
                                                        }, isRequired: true })] }), _jsxs(motion.div, { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.6, delay: 0.6 }, className: "login-form-group password-field-container", children: [_jsx(Icon, { icon: "lucide:lock", className: "login-input-icon" }), _jsx(Input, { type: showPassword ? "text" : "password", placeholder: "Enter your password", value: password, onChange: (e) => setPassword(e.target.value), className: "login-input", classNames: {
                                                            input: "text-white placeholder:text-platinum-400 bg-transparent pl-12 pr-12",
                                                            inputWrapper: "bg-transparent border-2 border-gold-400/20 hover:border-gold-400/30 focus-within:border-gold-400/50 backdrop-blur-sm h-14 rounded-xl"
                                                        }, isRequired: true }), _jsx("button", { type: "button", onClick: () => setShowPassword(!showPassword), className: "password-toggle", children: _jsx(Icon, { icon: showPassword ? "lucide:eye-off" : "lucide:eye" }) })] }), _jsxs(motion.div, { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.7 }, className: "login-options", children: [_jsxs("div", { className: "remember-me-container", children: [_jsx("input", { type: "checkbox", checked: rememberMe, onChange: (e) => setRememberMe(e.target.checked), className: "remember-checkbox" }), _jsx("span", { className: "remember-text", children: "Remember me" })] }), _jsx(Link, { to: "/forgot-password", className: "forgot-password-link", children: "Forgot Password?" })] }), _jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 0.8 }, children: _jsx("button", { type: "submit", disabled: loading, className: "sign-in-button", children: loading ? (_jsxs(_Fragment, { children: [_jsx(Icon, { icon: "lucide:loader-2", className: "animate-spin mr-2" }), "Signing In..."] })) : (_jsxs(_Fragment, { children: [_jsx(Icon, { icon: "lucide:log-in", className: "mr-2" }), "Sign In"] })) }) })] }), _jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.6, delay: 0.9 }, className: "social-login-divider", children: _jsx("span", { className: "social-login-text", children: "Or continue with" }) }), isGoogleAuthAvailable && (_jsx(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: 1.0 }, children: _jsxs(Button, { variant: "bordered", size: "lg", className: "w-full h-14 text-white border-white/20 hover:border-gold-400/50 transition-all duration-300 hover:bg-white/5", onPress: loginWithGoogle, isDisabled: loading, children: [_jsx(Icon, { icon: "logos:google-icon", className: "mr-3 text-lg" }), "Continue with Google"] }) })), _jsxs(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.6, delay: 1.1 }, className: "auth-switch-link", children: ["Don't have an account?", ' ', _jsx(Link, { to: "/register", children: "Sign Up" })] })] }) }), _jsxs(motion.div, { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.8, delay: 1.2 }, className: "benefit-cards-container", children: [_jsxs("div", { className: "benefit-card", children: [_jsx(Icon, { icon: "lucide:shield-check", className: "benefit-card-icon" }), _jsx("div", { className: "benefit-card-title", children: "Secure Access" }), _jsx("div", { className: "benefit-card-description", children: "Bank-level security for your account" })] }), _jsxs("div", { className: "benefit-card", children: [_jsx(Icon, { icon: "lucide:star", className: "benefit-card-icon" }), _jsx("div", { className: "benefit-card-title", children: "Premium Benefits" }), _jsx("div", { className: "benefit-card-description", children: "Exclusive access to luxury travel deals" })] })] })] }) })] }));
};
export default Login;
