import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@heroui/react";
import { Icon } from '@iconify/react';

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredAirport, setPreferredAirport] = useState('');
  const [frequentFlyerPrograms] = useState<string[]>([]);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password validation
  const validatePassword = (password: string) => {
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
    } else if (score <= 2) {
      text = 'Weak';
      color = '#ff9800';
    } else if (score <= 3) {
      text = 'Fair';
      color = '#ffc107';
    } else if (score <= 4) {
      text = 'Good';
      color = '#8bc34a';
    } else {
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
    const errors: { [key: string]: string } = {};
    
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!agreeToTerms) {
      errors.terms = 'You must agree to the terms and conditions';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (error) {
      console.error('Registration error:', error);
      setValidationErrors({ 
        general: error instanceof Error ? error.message : 'Registration failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrengthIndicator = validatePassword(password);

  return (
    <motion.div 
      className="min-h-screen flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="registration-container max-w-2xl w-full">
        <motion.div
          className="registration-content"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          {/* Header */}
          <div className="registration-header">
            <motion.h1 
              className="registration-title"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Join AeroPoints Elite
            </motion.h1>
            <motion.p 
              className="registration-subtitle"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Unlock exclusive access to premium award travel opportunities
            </motion.p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="registration-form">
            {/* General Error */}
            {validationErrors.general && (
              <div className="field-feedback invalid">
                <Icon icon="lucide:alert-circle" className="feedback-icon" />
                {validationErrors.general}
              </div>
            )}

            {/* Full Name Field */}
            <div className="form-field-group">
              <label className="form-field-label" htmlFor="fullName">
                Full Name
              </label>
              <div className="input-container">
                <Icon icon="lucide:user" className="form-input-icon" />
                <input
                  type="text"
                  id="fullName"
                  className={`form-input ${validationErrors.fullName ? 'invalid' : fullName ? 'valid' : ''}`}
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              {validationErrors.fullName && (
                <div className="field-feedback invalid">
                  <Icon icon="lucide:x-circle" className="feedback-icon" />
                  {validationErrors.fullName}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div className="form-field-group">
              <label className="form-field-label" htmlFor="email">
                Email Address
              </label>
              <div className="input-container">
                <Icon icon="lucide:mail" className="form-input-icon" />
                <input
                  type="email"
                  id="email"
                  className={`form-input ${validationErrors.email ? 'invalid' : email ? 'valid' : ''}`}
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {validationErrors.email && (
                <div className="field-feedback invalid">
                  <Icon icon="lucide:x-circle" className="feedback-icon" />
                  {validationErrors.email}
                </div>
              )}
            </div>

            {/* Password Fields Container */}
            <div className="password-fields-container">
              {/* Create Password Field */}
              <div className="password-field-group">
                <label className="password-field-label" htmlFor="create-password">
                  Create Password
                </label>
                <div className="input-container">
                  <Icon icon="lucide:lock" className="password-icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    id="create-password"
                    className={`password-input ${validationErrors.password ? 'invalid' : password ? 'valid' : ''}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    className="password-toggle-icon"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} />
                  </button>
                </div>
                {validationErrors.password && (
                  <div className="field-feedback invalid">
                    <Icon icon="lucide:x-circle" className="feedback-icon" />
                    {validationErrors.password}
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="password-field-group">
                <label className="password-field-label" htmlFor="confirm-password">
                  Confirm Password
                </label>
                <div className="input-container">
                  <Icon icon="lucide:shield-check" className="password-icon" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirm-password"
                    className={`password-input ${validationErrors.confirmPassword ? 'invalid' : confirmPassword && password === confirmPassword ? 'valid' : ''}`}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Icon icon={showConfirmPassword ? "lucide:eye-off" : "lucide:eye"} />
                  </button>
                </div>
                {validationErrors.confirmPassword && (
                  <div className="field-feedback invalid">
                    <Icon icon="lucide:x-circle" className="feedback-icon" />
                    {validationErrors.confirmPassword}
                  </div>
                )}
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="password-strength-container">
                <div className="password-strength-meter">
                  <div
                    className="password-strength-fill"
                    style={{
                      width: `${passwordStrengthIndicator.score}%`,
                      backgroundColor: passwordStrengthIndicator.color
                    }}
                  />
                </div>
                <div 
                  className="password-strength-text"
                  style={{ color: passwordStrengthIndicator.color }}
                >
                  Password Strength: {passwordStrengthIndicator.text}
                </div>
              </div>
            )}

            {/* Password Requirements */}
            {password && (
              <div className="password-requirements">
                <div className="password-requirements-title">
                  Password Requirements
                </div>
                <ul className="password-requirements-list">
                  <li className={`password-requirement ${passwordStrengthIndicator.requirements.length ? 'met' : 'not-met'}`}>
                    <span className={`requirement-icon ${passwordStrengthIndicator.requirements.length ? 'met' : 'not-met'}`}></span>
                    At least 8 characters long
                  </li>
                  <li className={`password-requirement ${passwordStrengthIndicator.requirements.uppercase ? 'met' : 'not-met'}`}>
                    <span className={`requirement-icon ${passwordStrengthIndicator.requirements.uppercase ? 'met' : 'not-met'}`}></span>
                    Contains uppercase letter
                  </li>
                  <li className={`password-requirement ${passwordStrengthIndicator.requirements.lowercase ? 'met' : 'not-met'}`}>
                    <span className={`requirement-icon ${passwordStrengthIndicator.requirements.lowercase ? 'met' : 'not-met'}`}></span>
                    Contains lowercase letter
                  </li>
                  <li className={`password-requirement ${passwordStrengthIndicator.requirements.number ? 'met' : 'not-met'}`}>
                    <span className={`requirement-icon ${passwordStrengthIndicator.requirements.number ? 'met' : 'not-met'}`}></span>
                    Contains number
                  </li>
                  <li className={`password-requirement ${passwordStrengthIndicator.requirements.special ? 'met' : 'not-met'}`}>
                    <span className={`requirement-icon ${passwordStrengthIndicator.requirements.special ? 'met' : 'not-met'}`}></span>
                    Contains special character
                  </li>
                </ul>
              </div>
            )}

            {/* Travel Preferences Section */}
            <div className="travel-preferences-section">
              <div className="travel-preferences-header">
                <Icon icon="lucide:plane" className="travel-preferences-icon" />
                <h3 className="travel-preferences-title">Travel Preferences</h3>
              </div>
              <p className="travel-preferences-subtitle">
                Help us personalize your award travel experience
              </p>
              
              {/* Preferred Airport */}
              <div className="form-field-group">
                <label className="form-field-label" htmlFor="preferredAirport">
                  Preferred Home Airport
                </label>
                <div className="input-container">
                  <Icon icon="lucide:map-pin" className="airport-icon" />
                  <select
                    id="preferredAirport"
                    className="airport-dropdown"
                    value={preferredAirport}
                    onChange={(e) => setPreferredAirport(e.target.value)}
                  >
                    <option value="">Select your preferred airport</option>
                    <option value="JFK">John F. Kennedy International (JFK)</option>
                    <option value="LAX">Los Angeles International (LAX)</option>
                    <option value="ORD">Chicago O'Hare International (ORD)</option>
                    <option value="DFW">Dallas/Fort Worth International (DFW)</option>
                    <option value="DEN">Denver International (DEN)</option>
                    <option value="SFO">San Francisco International (SFO)</option>
                    <option value="SEA">Seattle-Tacoma International (SEA)</option>
                    <option value="LAS">McCarran International (LAS)</option>
                    <option value="PHX">Phoenix Sky Harbor International (PHX)</option>
                    <option value="IAH">George Bush Intercontinental (IAH)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="terms-agreement-container">
              <div className="terms-checkbox-wrapper">
                <input
                  type="checkbox"
                  id="agreeToTerms"
                  className="terms-checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  required
                />
              </div>
              <label htmlFor="agreeToTerms" className="terms-text">
                I agree to the{' '}
                <Link to="/terms" className="terms-link">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="terms-link">
                  Privacy Policy
                </Link>
                , and I consent to receive promotional emails and award alerts from AeroPoints.
              </label>
            </div>
            {validationErrors.terms && (
              <div className="field-feedback invalid">
                <Icon icon="lucide:x-circle" className="feedback-icon" />
                {validationErrors.terms}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="join-aeropoints-button"
              disabled={isLoading}
            >
              <Icon icon="lucide:plane" className="button-icon" />
              <span className="button-text">
                {isLoading ? 'Creating Account...' : 'Join AeroPoints Elite'}
              </span>
            </Button>

            {/* Login Link */}
            <div className="auth-switch-link">
              Already have an account?{' '}
              <Link to="/login">Sign in here</Link>
            </div>
          </form>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register; 