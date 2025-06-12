import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@heroui/react";
import { Icon } from '@iconify/react';
const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [preferredAirport, setPreferredAirport] = useState('');
    const [frequentFlyerPrograms] = useState([]);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();
    // Password validation
    const validatePassword = (password) => {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        const score = Object.values(requirements).filter(Boolean).length;
        let text = '';
        let color = '';
        if (score === 0) {
            text = 'Very Weak';
            color = '#f44336';
        }
        else if (score <= 2) {
            text = 'Weak';
            color = '#ff9800';
        }
        else if (score <= 3) {
            text = 'Fair';
            color = '#ffc107';
        }
        else if (score <= 4) {
            text = 'Good';
            color = '#8bc34a';
        }
        else {
            text = 'Strong';
            color = '#4caf50';
        }
        return { score: (score / 5) * 100, text, color, requirements };
    };
    useEffect(() => {
        // Password validation is handled inline in the component
    }, [password]);
    // Form validation
    const validateForm = () => {
        const errors = {};
        if (!fullName.trim()) {
            errors.fullName = 'Full name is required';
        }
        if (!email.trim()) {
            errors.email = 'Email is required';
        }
        else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Please enter a valid email address';
        }
        if (!password) {
            errors.password = 'Password is required';
        }
        else if (password.length < 8) {
            errors.password = 'Password must be at least 8 characters long';
        }
        if (!confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        }
        else if (password !== confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }
        if (!agreeToTerms) {
            errors.terms = 'You must agree to the terms and conditions';
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsLoading(true);
        try {
            await register({
                full_name: fullName,
                email,
                password,
                preferred_airport: preferredAirport,
                frequent_flyer_programs: frequentFlyerPrograms.map(program => ({
                    airline: program,
                    program_name: program,
                    member_number: '',
                    tier_status: 'Standard'
                }))
            });
            navigate('/dashboard');
        }
        catch (error) {
            console.error('Registration error:', error);
            setValidationErrors({
                general: error instanceof Error ? error.message : 'Registration failed. Please try again.'
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    const passwordStrengthIndicator = validatePassword(password);
    return (_jsx(motion.div, { className: "min-h-screen flex items-center justify-center p-4", initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5 }, children: _jsx("div", { className: "registration-container max-w-2xl w-full", children: _jsxs(motion.div, { className: "registration-content", initial: { y: 30, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.6, delay: 0.1 }, children: [_jsxs("div", { className: "registration-header", children: [_jsx(motion.h1, { className: "registration-title", initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.6, delay: 0.2 }, children: "Join AeroPoints Elite" }), _jsx(motion.p, { className: "registration-subtitle", initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 }, transition: { duration: 0.6, delay: 0.3 }, children: "Unlock exclusive access to premium award travel opportunities" })] }), _jsxs("form", { onSubmit: handleSubmit, className: "registration-form", children: [validationErrors.general && (_jsxs("div", { className: "field-feedback invalid", children: [_jsx(Icon, { icon: "lucide:alert-circle", className: "feedback-icon" }), validationErrors.general] })), _jsxs("div", { className: "form-field-group", children: [_jsx("label", { className: "form-field-label", htmlFor: "fullName", children: "Full Name" }), _jsxs("div", { className: "input-container", children: [_jsx(Icon, { icon: "lucide:user", className: "form-input-icon" }), _jsx("input", { type: "text", id: "fullName", className: `form-input ${validationErrors.fullName ? 'invalid' : fullName ? 'valid' : ''}`, placeholder: "Enter your full name", value: fullName, onChange: (e) => setFullName(e.target.value), required: true })] }), validationErrors.fullName && (_jsxs("div", { className: "field-feedback invalid", children: [_jsx(Icon, { icon: "lucide:x-circle", className: "feedback-icon" }), validationErrors.fullName] }))] }), _jsxs("div", { className: "form-field-group", children: [_jsx("label", { className: "form-field-label", htmlFor: "email", children: "Email Address" }), _jsxs("div", { className: "input-container", children: [_jsx(Icon, { icon: "lucide:mail", className: "form-input-icon" }), _jsx("input", { type: "email", id: "email", className: `form-input ${validationErrors.email ? 'invalid' : email ? 'valid' : ''}`, placeholder: "Enter your email address", value: email, onChange: (e) => setEmail(e.target.value), required: true })] }), validationErrors.email && (_jsxs("div", { className: "field-feedback invalid", children: [_jsx(Icon, { icon: "lucide:x-circle", className: "feedback-icon" }), validationErrors.email] }))] }), _jsxs("div", { className: "password-fields-container", children: [_jsxs("div", { className: "password-field-group", children: [_jsx("label", { className: "password-field-label", htmlFor: "create-password", children: "Create Password" }), _jsxs("div", { className: "input-container", children: [_jsx(Icon, { icon: "lucide:lock", className: "password-icon" }), _jsx("input", { type: showPassword ? "text" : "password", id: "create-password", className: `password-input ${validationErrors.password ? 'invalid' : password ? 'valid' : ''}`, placeholder: "Enter your password", value: password, onChange: (e) => setPassword(e.target.value), required: true, minLength: 8 }), _jsx("button", { type: "button", className: "password-toggle-icon", onClick: () => setShowPassword(!showPassword), children: _jsx(Icon, { icon: showPassword ? "lucide:eye-off" : "lucide:eye" }) })] }), validationErrors.password && (_jsxs("div", { className: "field-feedback invalid", children: [_jsx(Icon, { icon: "lucide:x-circle", className: "feedback-icon" }), validationErrors.password] }))] }), _jsxs("div", { className: "password-field-group", children: [_jsx("label", { className: "password-field-label", htmlFor: "confirm-password", children: "Confirm Password" }), _jsxs("div", { className: "input-container", children: [_jsx(Icon, { icon: "lucide:shield-check", className: "password-icon" }), _jsx("input", { type: showConfirmPassword ? "text" : "password", id: "confirm-password", className: `password-input ${validationErrors.confirmPassword ? 'invalid' : confirmPassword && password === confirmPassword ? 'valid' : ''}`, placeholder: "Confirm your password", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true }), _jsx("button", { type: "button", className: "password-toggle-icon", onClick: () => setShowConfirmPassword(!showConfirmPassword), children: _jsx(Icon, { icon: showConfirmPassword ? "lucide:eye-off" : "lucide:eye" }) })] }), validationErrors.confirmPassword && (_jsxs("div", { className: "field-feedback invalid", children: [_jsx(Icon, { icon: "lucide:x-circle", className: "feedback-icon" }), validationErrors.confirmPassword] }))] })] }), password && (_jsxs("div", { className: "password-strength-container", children: [_jsx("div", { className: "password-strength-meter", children: _jsx("div", { className: "password-strength-fill", style: {
                                                width: `${passwordStrengthIndicator.score}%`,
                                                backgroundColor: passwordStrengthIndicator.color
                                            } }) }), _jsxs("div", { className: "password-strength-text", style: { color: passwordStrengthIndicator.color }, children: ["Password Strength: ", passwordStrengthIndicator.text] })] })), password && (_jsxs("div", { className: "password-requirements", children: [_jsx("div", { className: "password-requirements-title", children: "Password Requirements" }), _jsxs("ul", { className: "password-requirements-list", children: [_jsxs("li", { className: `password-requirement ${passwordStrengthIndicator.requirements.length ? 'met' : 'not-met'}`, children: [_jsx("span", { className: `requirement-icon ${passwordStrengthIndicator.requirements.length ? 'met' : 'not-met'}` }), "At least 8 characters long"] }), _jsxs("li", { className: `password-requirement ${passwordStrengthIndicator.requirements.uppercase ? 'met' : 'not-met'}`, children: [_jsx("span", { className: `requirement-icon ${passwordStrengthIndicator.requirements.uppercase ? 'met' : 'not-met'}` }), "Contains uppercase letter"] }), _jsxs("li", { className: `password-requirement ${passwordStrengthIndicator.requirements.lowercase ? 'met' : 'not-met'}`, children: [_jsx("span", { className: `requirement-icon ${passwordStrengthIndicator.requirements.lowercase ? 'met' : 'not-met'}` }), "Contains lowercase letter"] }), _jsxs("li", { className: `password-requirement ${passwordStrengthIndicator.requirements.number ? 'met' : 'not-met'}`, children: [_jsx("span", { className: `requirement-icon ${passwordStrengthIndicator.requirements.number ? 'met' : 'not-met'}` }), "Contains number"] }), _jsxs("li", { className: `password-requirement ${passwordStrengthIndicator.requirements.special ? 'met' : 'not-met'}`, children: [_jsx("span", { className: `requirement-icon ${passwordStrengthIndicator.requirements.special ? 'met' : 'not-met'}` }), "Contains special character"] })] })] })), _jsxs("div", { className: "travel-preferences-section", children: [_jsxs("div", { className: "travel-preferences-header", children: [_jsx(Icon, { icon: "lucide:plane", className: "travel-preferences-icon" }), _jsx("h3", { className: "travel-preferences-title", children: "Travel Preferences" })] }), _jsx("p", { className: "travel-preferences-subtitle", children: "Help us personalize your award travel experience" }), _jsxs("div", { className: "form-field-group", children: [_jsx("label", { className: "form-field-label", htmlFor: "preferredAirport", children: "Preferred Home Airport" }), _jsxs("div", { className: "input-container", children: [_jsx(Icon, { icon: "lucide:map-pin", className: "airport-icon" }), _jsxs("select", { id: "preferredAirport", className: "airport-dropdown", value: preferredAirport, onChange: (e) => setPreferredAirport(e.target.value), children: [_jsx("option", { value: "", children: "Select your preferred airport" }), _jsx("option", { value: "JFK", children: "John F. Kennedy International (JFK)" }), _jsx("option", { value: "LAX", children: "Los Angeles International (LAX)" }), _jsx("option", { value: "ORD", children: "Chicago O'Hare International (ORD)" }), _jsx("option", { value: "DFW", children: "Dallas/Fort Worth International (DFW)" }), _jsx("option", { value: "DEN", children: "Denver International (DEN)" }), _jsx("option", { value: "SFO", children: "San Francisco International (SFO)" }), _jsx("option", { value: "SEA", children: "Seattle-Tacoma International (SEA)" }), _jsx("option", { value: "LAS", children: "McCarran International (LAS)" }), _jsx("option", { value: "PHX", children: "Phoenix Sky Harbor International (PHX)" }), _jsx("option", { value: "IAH", children: "George Bush Intercontinental (IAH)" })] })] })] })] }), _jsxs("div", { className: "terms-agreement-container", children: [_jsx("div", { className: "terms-checkbox-wrapper", children: _jsx("input", { type: "checkbox", id: "agreeToTerms", className: "terms-checkbox", checked: agreeToTerms, onChange: (e) => setAgreeToTerms(e.target.checked), required: true }) }), _jsxs("label", { htmlFor: "agreeToTerms", className: "terms-text", children: ["I agree to the", ' ', _jsx(Link, { to: "/terms", className: "terms-link", children: "Terms of Service" }), ' ', "and", ' ', _jsx(Link, { to: "/privacy", className: "terms-link", children: "Privacy Policy" }), ", and I consent to receive promotional emails and award alerts from AeroPoints."] })] }), validationErrors.terms && (_jsxs("div", { className: "field-feedback invalid", children: [_jsx(Icon, { icon: "lucide:x-circle", className: "feedback-icon" }), validationErrors.terms] })), _jsxs(Button, { type: "submit", className: "join-aeropoints-button", disabled: isLoading, children: [_jsx(Icon, { icon: "lucide:plane", className: "button-icon" }), _jsx("span", { className: "button-text", children: isLoading ? 'Creating Account...' : 'Join AeroPoints Elite' })] }), _jsxs("div", { className: "auth-switch-link", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", children: "Sign in here" })] })] })] }) }) }));
};
export default Register;
