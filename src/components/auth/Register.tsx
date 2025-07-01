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
  const [formTouched, setFormTouched] = useState<{ [key: string]: boolean }>({});

  const { register } = useAuth();
  const navigate = useNavigate();

  // Password validation with comprehensive rules
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

  // Enhanced form validation with real-time feedback
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!fullName.trim()) {
      errors.fullName = 'Full name is required';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Full name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(fullName.trim())) {
      errors.fullName = 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    }
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(password);
      if (passwordValidation.score < 60) { // Require at least "Good" strength
        errors.password = 'Password must be stronger. Please include uppercase, lowercase, numbers, and special characters.';
      }
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

  // Real-time validation for specific fields
  const validateField = (fieldName: string, value: string) => {
    if (!formTouched[fieldName]) return;
    
    const errors = { ...validationErrors };
    
    switch (fieldName) {
      case 'email':
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      case 'confirmPassword':
        if (value && password && value !== password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
      default:
        break;
    }
    
    setValidationErrors(errors);
  };

  const handleFieldBlur = (fieldName: string) => {
    setFormTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched for validation display
    setFormTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      terms: true
    });
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorElement = document.querySelector('.field-feedback.invalid');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsLoading(true);
    setValidationErrors({});
    
    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        preferred_airport: preferredAirport,
        frequent_flyer_programs: frequentFlyerPrograms.map(program => ({
          airline: program,
          program_name: program,
          member_number: '',
          tier_status: 'Standard'
        }))
      });
      
      // Show success message and redirect
      console.log('Registration successful! Welcome to AeroPoints.');
      navigate('/profile', { replace: true });
    } catch (error) {
      console.error('Registration error:', error);
      setValidationErrors({ 
        general: error instanceof Error ? error.message : 'Registration failed. Please try again.' 
      });
      
      // Scroll to error message
      const errorElement = document.querySelector('.field-feedback.invalid');
      if (errorElement) {
        errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrengthIndicator = validatePassword(password);

  // Floating background elements
  const floatingElements = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    duration: Math.random() * 5 + 6,
    delay: Math.random() * 3,
    x: Math.random() * 100,
    y: Math.random() * 100,
  }));

  return (
    <div className="auth-page">
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
              scale: [1, 1.05, 1],
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

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <motion.div 
          className="registration-container max-w-2xl w-full"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="registration-content"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {/* Header */}
            <div className="registration-header">
              {/* Logo/Brand */}
              <Link to="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity justify-center">
                <Icon icon="lucide:plane" className="text-gold-400 text-3xl" />
                <span className="font-luxury text-3xl font-bold text-white">AeroPoints</span>
              </Link>
              
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
                <motion.div 
                  className="field-feedback invalid"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Icon icon="lucide:alert-circle" className="feedback-icon" />
                  {validationErrors.general}
                </motion.div>
              )}

              {/* Full Name Field */}
              <motion.div 
                className="form-field-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <label className="form-field-label" htmlFor="fullName">
                  Full Name *
                </label>
                <div className="input-container">
                  <Icon icon="lucide:user" className="form-input-icon" />
                  <input
                    type="text"
                    id="fullName"
                    className={`form-input ${validationErrors.fullName ? 'invalid' : fullName && !validationErrors.fullName ? 'valid' : ''}`}
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (formTouched.fullName) validateField('fullName', e.target.value);
                    }}
                    onBlur={() => handleFieldBlur('fullName')}
                    required
                    autoComplete="name"
                  />
                  {fullName && !validationErrors.fullName && (
                    <Icon icon="lucide:check-circle" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 text-lg" />
                  )}
                </div>
                {validationErrors.fullName && formTouched.fullName && (
                  <div className="field-feedback invalid">
                    <Icon icon="lucide:x-circle" className="feedback-icon" />
                    {validationErrors.fullName}
                  </div>
                )}
              </motion.div>

              {/* Email Field */}
              <motion.div 
                className="form-field-group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <label className="form-field-label" htmlFor="email">
                  Email Address *
                </label>
                <div className="input-container">
                  <Icon icon="lucide:mail" className="form-input-icon" />
                  <input
                    type="email"
                    id="email"
                    className={`form-input ${validationErrors.email ? 'invalid' : email && !validationErrors.email ? 'valid' : ''}`}
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      validateField('email', e.target.value);
                    }}
                    onBlur={() => handleFieldBlur('email')}
                    required
                    autoComplete="email"
                  />
                  {email && !validationErrors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                    <Icon icon="lucide:check-circle" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 text-lg" />
                  )}
                </div>
                {validationErrors.email && formTouched.email && (
                  <div className="field-feedback invalid">
                    <Icon icon="lucide:x-circle" className="feedback-icon" />
                    {validationErrors.email}
                  </div>
                )}
              </motion.div>

              {/* Password Fields Container */}
              <motion.div 
                className="password-fields-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {/* Create Password Field */}
                <div className="password-field-group">
                  <label className="password-field-label" htmlFor="create-password">
                    Create Password *
                  </label>
                  <div className="input-container">
                    <Icon icon="lucide:lock" className="password-icon" />
                    <input
                      type={showPassword ? "text" : "password"}
                      id="create-password"
                      className={`password-input ${validationErrors.password ? 'invalid' : password && passwordStrengthIndicator.score >= 60 ? 'valid' : ''}`}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => handleFieldBlur('password')}
                      required
                      minLength={8}
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-icon"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <Icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} />
                    </button>
                  </div>
                  {validationErrors.password && formTouched.password && (
                    <div className="field-feedback invalid">
                      <Icon icon="lucide:x-circle" className="feedback-icon" />
                      {validationErrors.password}
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="password-field-group">
                  <label className="password-field-label" htmlFor="confirm-password">
                    Confirm Password *
                  </label>
                  <div className="input-container">
                    <Icon icon="lucide:shield-check" className="password-icon" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirm-password"
                      className={`password-input ${validationErrors.confirmPassword ? 'invalid' : confirmPassword && password === confirmPassword ? 'valid' : ''}`}
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        validateField('confirmPassword', e.target.value);
                      }}
                      onBlur={() => handleFieldBlur('confirmPassword')}
                      required
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      className="password-toggle-icon"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      <Icon icon={showConfirmPassword ? "lucide:eye-off" : "lucide:eye"} />
                    </button>
                    {confirmPassword && password === confirmPassword && (
                      <Icon icon="lucide:check-circle" className="absolute right-12 top-1/2 transform -translate-y-1/2 text-green-400 text-lg" />
                    )}
                  </div>
                  {validationErrors.confirmPassword && formTouched.confirmPassword && (
                    <div className="field-feedback invalid">
                      <Icon icon="lucide:x-circle" className="feedback-icon" />
                      {validationErrors.confirmPassword}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Password Strength Indicator */}
              {password && (
                <motion.div 
                  className="password-strength-container"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
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
                </motion.div>
              )}

              {/* Password Requirements */}
              {password && (
                <motion.div 
                  className="password-requirements"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <div className="password-requirements-title">
                    Password Requirements
                  </div>
                  <ul className="password-requirements-list">
                    <li className={`password-requirement ${passwordStrengthIndicator.requirements.length ? 'met' : 'not-met'}`}>
                      <Icon 
                        icon={passwordStrengthIndicator.requirements.length ? "lucide:check-circle" : "lucide:circle"} 
                        className={`requirement-icon ${passwordStrengthIndicator.requirements.length ? 'met' : 'not-met'}`}
                      />
                      At least 8 characters long
                    </li>
                    <li className={`password-requirement ${passwordStrengthIndicator.requirements.uppercase ? 'met' : 'not-met'}`}>
                      <Icon 
                        icon={passwordStrengthIndicator.requirements.uppercase ? "lucide:check-circle" : "lucide:circle"} 
                        className={`requirement-icon ${passwordStrengthIndicator.requirements.uppercase ? 'met' : 'not-met'}`}
                      />
                      Contains uppercase letter
                    </li>
                    <li className={`password-requirement ${passwordStrengthIndicator.requirements.lowercase ? 'met' : 'not-met'}`}>
                      <Icon 
                        icon={passwordStrengthIndicator.requirements.lowercase ? "lucide:check-circle" : "lucide:circle"} 
                        className={`requirement-icon ${passwordStrengthIndicator.requirements.lowercase ? 'met' : 'not-met'}`}
                      />
                      Contains lowercase letter
                    </li>
                    <li className={`password-requirement ${passwordStrengthIndicator.requirements.number ? 'met' : 'not-met'}`}>
                      <Icon 
                        icon={passwordStrengthIndicator.requirements.number ? "lucide:check-circle" : "lucide:circle"} 
                        className={`requirement-icon ${passwordStrengthIndicator.requirements.number ? 'met' : 'not-met'}`}
                      />
                      Contains number
                    </li>
                    <li className={`password-requirement ${passwordStrengthIndicator.requirements.special ? 'met' : 'not-met'}`}>
                      <Icon 
                        icon={passwordStrengthIndicator.requirements.special ? "lucide:check-circle" : "lucide:circle"} 
                        className={`requirement-icon ${passwordStrengthIndicator.requirements.special ? 'met' : 'not-met'}`}
                      />
                      Contains special character
                    </li>
                  </ul>
                </motion.div>
              )}

              {/* Travel Preferences Section */}
              <motion.div 
                className="travel-preferences-section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="travel-preferences-header">
                  <Icon icon="lucide:plane" className="travel-preferences-icon" />
                  <h3 className="travel-preferences-title">Travel Preferences</h3>
                </div>
                <p className="travel-preferences-subtitle">
                  Help us personalize your award travel experience (optional)
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
                      <option value="ATL">Hartsfield-Jackson Atlanta International (ATL)</option>
                      <option value="BOS">Logan International (BOS)</option>
                      <option value="EWR">Newark Liberty International (EWR)</option>
                      <option value="LGA">LaGuardia Airport (LGA)</option>
                      <option value="MIA">Miami International (MIA)</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Terms and Conditions */}
              <motion.div 
                className="terms-agreement-container"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="terms-checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    className="terms-checkbox"
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    onBlur={() => handleFieldBlur('terms')}
                    required
                  />
                </div>
                <label htmlFor="agreeToTerms" className="terms-text">
                  I agree to the{' '}
                  <Link to="/terms" className="terms-link" target="_blank" rel="noopener noreferrer">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="terms-link" target="_blank" rel="noopener noreferrer">
                    Privacy Policy
                  </Link>
                  , and I consent to receive promotional emails and award alerts from AeroPoints. *
                </label>
              </motion.div>
              {validationErrors.terms && formTouched.terms && (
                <div className="field-feedback invalid">
                  <Icon icon="lucide:x-circle" className="feedback-icon" />
                  {validationErrors.terms}
                </div>
              )}

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
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
              </motion.div>

              {/* Login Link */}
              <motion.div 
                className="auth-switch-link"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                Already have an account?{' '}
                <Link to="/login" className="text-gold-400 hover:text-gold-300 transition-colors duration-300">
                  Sign in here
                </Link>
              </motion.div>

              {/* Back to Home Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="text-center mt-4"
              >
                <Link 
                  to="/" 
                  className="inline-flex items-center gap-2 text-platinum-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  <Icon icon="lucide:arrow-left" className="text-sm" />
                  Back to Home
                </Link>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register; 