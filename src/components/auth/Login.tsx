import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@heroui/react";
import { Icon } from '@iconify/react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, loading, error, loginWithGoogle, isGoogleAuthAvailable } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Debug log to see the Google auth availability status
  console.log('Login component - Google OAuth available:', isGoogleAuthAvailable);

  // Get the redirect path or default to home
  const from = location.state?.from?.pathname || '/';

  // Form validation
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = document.querySelector('.field-feedback.invalid');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    
    setIsSubmitting(true);
    setValidationErrors({});
    
    try {
      await login(email, password);
      
      // Show success message
      console.log('LOGIN SUCCESS: Welcome back!');
      
      // Use React navigation instead of hard refresh
      navigate(from, { replace: true });
      
    } catch (err: any) {
      console.error('Login failed:', err);
      setValidationErrors({ 
        general: err.message || 'Login failed. Please check your credentials and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      await loginWithGoogle();
    } catch (err: any) {
      console.error('Google login failed:', err);
      setValidationErrors({ 
        general: 'Google login failed. Please try again.' 
      });
    } finally {
      setIsSubmitting(false);
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
              y: [-15, 15, -15],
              opacity: [0.1, 0.4, 0.1],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: element.duration,
              delay: element.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <div 
              className="rounded-full bg-gradient-to-br from-gold-400/25 to-gold-600/15 backdrop-blur-sm"
              style={{
                width: `${element.size}px`,
                height: `${element.size}px`,
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-lg"
        >
          {/* Enhanced Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="login-header"
          >
            {/* Logo/Brand */}
            <Link to="/" className="inline-flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
              <Icon icon="lucide:plane" className="text-gold-400 text-3xl" />
              <span className="font-luxury text-3xl font-bold text-white">AeroPoints</span>
            </Link>
            
            <div className="welcome-back-text">
              Welcome Back
            </div>
            <h1 className="login-title">
              Sign In
            </h1>
            <p className="login-subtitle">
              Access your premium travel dashboard
            </p>
          </motion.div>

          {/* Enhanced Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="trust-indicators-row"
          >
            <div className="trust-indicator-badge bank-security">
              <Icon icon="lucide:shield-check" className="trust-badge-icon" />
              <span className="trust-badge-text">Secure Login</span>
            </div>
            <div className="trust-indicator-badge real-time">
              <Icon icon="lucide:zap" className="trust-badge-icon" />
              <span className="trust-badge-text">Instant Access</span>
            </div>
            <div className="trust-indicator-badge vip-support">
              <Icon icon="lucide:star" className="trust-badge-icon" />
              <span className="trust-badge-text">VIP Dashboard</span>
            </div>
          </motion.div>

          {/* Enhanced Login Form Container */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="login-container"
          >
            <div className="login-content">
              {/* General Error Display */}
              {(error || validationErrors.general) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl mb-6 backdrop-blur-sm"
                  role="alert"
                >
                  <div className="flex items-center gap-2">
                    <Icon icon="lucide:alert-circle" className="text-red-400" />
                    <span>{error || validationErrors.general}</span>
                  </div>
                </motion.div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="login-form-group"
                >
                  <label htmlFor="email" className="login-form-label">
                    Email Address
                  </label>
                  <div className="login-input-container">
                    <Icon icon="lucide:mail" className="login-input-icon" />
                    <input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`login-form-input ${validationErrors.email ? 'error' : ''}`}
                      required
                      aria-describedby={validationErrors.email ? "email-error" : undefined}
                    />
                  </div>
                  {validationErrors.email && (
                    <div id="email-error" className="field-feedback invalid">
                      <Icon icon="lucide:x-circle" className="feedback-icon" />
                      {validationErrors.email}
                    </div>
                  )}
                </motion.div>
                
                {/* Password Field */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="login-form-group"
                >
                  <label htmlFor="password" className="login-form-label">
                    Password
                  </label>
                  <div className="login-input-container">
                    <Icon icon="lucide:lock" className="login-input-icon" />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`login-form-input ${validationErrors.password ? 'error' : ''}`}
                      required
                      aria-describedby={validationErrors.password ? "password-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="password-toggle-btn"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      <Icon icon={showPassword ? "lucide:eye-off" : "lucide:eye"} />
                    </button>
                  </div>
                  {validationErrors.password && (
                    <div id="password-error" className="field-feedback invalid">
                      <Icon icon="lucide:x-circle" className="feedback-icon" />
                      {validationErrors.password}
                    </div>
                  )}
                </motion.div>

                {/* Enhanced Remember Me & Forgot Password */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="login-options"
                >
                  <div className="remember-me-container">
                    <input
                      type="checkbox"
                      id="rememberMe"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="remember-checkbox"
                    />
                    <label htmlFor="rememberMe" className="remember-text">
                      Remember me
                    </label>
                  </div>
                  
                  <Link to="/forgot-password" className="forgot-password-link">
                    Forgot Password?
                  </Link>
                </motion.div>
                
                {/* Enhanced Submit Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <button
                    type="submit"
                    disabled={loading || isSubmitting}
                    className="sign-in-button"
                    aria-describedby={error ? "login-error" : undefined}
                  >
                    {(loading || isSubmitting) ? (
                      <>
                        <Icon icon="lucide:loader-2" className="animate-spin mr-2" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <Icon icon="lucide:log-in" className="mr-2" />
                        Sign In
                      </>
                    )}
                  </button>
                </motion.div>
              </form>

              {/* Enhanced Divider */}
              {isGoogleAuthAvailable && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                  className="social-login-divider"
                >
                  <span className="social-login-text">Or continue with</span>
                </motion.div>
              )}

              {/* Google Sign In */}
              {isGoogleAuthAvailable && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <Button
                    variant="bordered"
                    size="lg"
                    className="google-auth-button"
                    onPress={handleGoogleLogin}
                    isDisabled={loading || isSubmitting}
                  >
                    <Icon icon="logos:google-icon" className="mr-3 text-lg" />
                    Continue with Google
                  </Button>
                </motion.div>
              )}
              
              {/* Enhanced Register Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.1 }}
                className="auth-switch-link"
              >
                Don't have an account?{' '}
                <Link to="/register" className="auth-link-gold">
                  Sign Up
                </Link>
              </motion.div>

              {/* Back to Home Link */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                className="text-center mt-4"
              >
                <Link 
                  to="/" 
                  className="back-to-home-link"
                >
                  <Icon icon="lucide:arrow-left" className="text-sm" />
                  Back to Home
                </Link>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="benefit-cards-container"
          >
            <div className="benefit-card">
              <Icon icon="lucide:shield-check" className="benefit-card-icon" />
              <div className="benefit-card-title">Secure Access</div>
              <div className="benefit-card-description">Bank-level security for your account</div>
            </div>
            <div className="benefit-card">
              <Icon icon="lucide:star" className="benefit-card-icon" />
              <div className="benefit-card-title">Premium Benefits</div>
              <div className="benefit-card-description">Exclusive access to luxury travel deals</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login; 