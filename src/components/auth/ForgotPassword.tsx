import React, { useState } from 'react';
import { ArrowLeft, Mail, Shield, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiService from '../../services/api';

// CAPTCHA component (hCaptcha integration)
const HCaptcha = ({ onVerify, onError }: { onVerify: (token: string) => void; onError: () => void }) => {
  const [captchaId] = useState(() => `h-captcha-${Math.random().toString(36).substr(2, 9)}`);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [hasError, setHasError] = useState(false);

  React.useEffect(() => {
    console.log('🔒 HCaptcha component mounted, loading script...');
    
    // Check if hCaptcha is already loaded
    if (window.hcaptcha) {
      console.log('✅ hCaptcha already loaded');
      setIsLoaded(true);
      return;
    }

    // Load hCaptcha script
    const script = document.createElement('script');
    script.src = 'https://js.hcaptcha.com/1/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ hCaptcha script loaded successfully');
      setIsLoaded(true);
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load hCaptcha script');
      setHasError(true);
      onError();
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts
      try {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      } catch (error) {
        console.warn('Cleanup warning:', error);
      }
    };
  }, [onError]);

  React.useEffect(() => {
    if (isLoaded && window.hcaptcha && !isRendered && !hasError) {
      const captchaContainer = document.getElementById(captchaId);
      if (captchaContainer) {
        try {
          console.log('🎯 Rendering hCaptcha with ID:', captchaId);
          
          const widgetId = window.hcaptcha.render(captchaId, {
            sitekey: '10000000-ffff-ffff-ffff-000000000001', // Test site key - always works
            callback: (token: string) => {
              console.log('✅ CAPTCHA verified successfully');
              onVerify(token);
            },
            'error-callback': (error: any) => {
              console.error('❌ CAPTCHA verification failed:', error);
              setHasError(true);
              onError();
            },
            'expired-callback': () => {
              console.warn('⏰ CAPTCHA expired');
              onError();
            },
            'chalexpired-callback': () => {
              console.warn('⏰ CAPTCHA challenge expired');
              onError();
            },
            theme: 'dark',
            size: 'normal'
          });
          
          console.log('🎯 hCaptcha widget ID:', widgetId);
          setIsRendered(true);
          
        } catch (error) {
          console.error('❌ Error rendering hCaptcha:', error);
          setHasError(true);
          onError();
        }
      } else {
        console.error('❌ CAPTCHA container not found:', captchaId);
        setHasError(true);
        onError();
      }
    }
  }, [isLoaded, captchaId, isRendered, hasError, onVerify, onError]);

  if (hasError) {
    return (
      <div className="captcha-wrapper">
        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
          <p className="text-red-300 text-sm">
            🔒 Security verification failed to load. Please refresh the page and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="captcha-wrapper">
      <div id={captchaId} className="h-captcha-container flex justify-center"></div>
      {!isLoaded && (
        <div className="text-center py-4">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-white/30 border-t-white rounded-full"></div>
          <p className="text-white/60 text-sm mt-2">Loading security verification...</p>
        </div>
      )}
    </div>
  );
};

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Debug logging
  React.useEffect(() => {
    console.log('ForgotPassword state:', {
      email,
      showCaptcha,
      hasAttemptedSubmit,
      captchaToken: captchaToken ? 'present' : 'null',
      errors
    });
  }, [email, showCaptcha, hasAttemptedSubmit, captchaToken, errors]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCaptchaVerify = (token: string) => {
    console.log('CAPTCHA verified in parent component');
    setCaptchaToken(token);
    setErrors(prev => ({ ...prev, captcha: '' }));
  };

  const handleCaptchaError = () => {
    console.log('CAPTCHA error in parent component');
    setCaptchaToken(null);
    setErrors(prev => ({ ...prev, captcha: 'CAPTCHA verification failed. Please try again.' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔄 Form submitted - Current state:', {
      showCaptcha,
      hasAttemptedSubmit,
      captchaToken: captchaToken ? 'present' : 'null',
      email
    });
    
    // Mark that user has attempted to submit
    setHasAttemptedSubmit(true);
    
    // Reset previous states
    setErrors({});
    setMessage('');
    setIsSuccess(false);

    // Validation
    const newErrors: { [key: string]: string } = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // If this is the first submission attempt and CAPTCHA isn't shown yet
    if (!showCaptcha) {
      console.log('🎯 First submission - showing CAPTCHA');
      setShowCaptcha(true);
      
      // If there are email validation errors, show them
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
      }
      
      // Don't proceed with the submission - wait for CAPTCHA completion
      return;
    }

    console.log('✅ CAPTCHA is shown, proceeding with validation');

    // After CAPTCHA is shown, validate it
    if (showCaptcha && !captchaToken) {
      console.log('❌ CAPTCHA not completed');
      newErrors.captcha = 'Please complete the CAPTCHA verification';
    }

    // If there are any validation errors, show them and stop
    if (Object.keys(newErrors).length > 0) {
      console.log('❌ Validation errors:', newErrors);
      setErrors(newErrors);
      return;
    }

    console.log('🚀 All validations passed, submitting to API');

    // All validations passed, proceed with submission
    setIsLoading(true);

    try {
      const response = await apiService.forgotPassword(email, captchaToken);
      
      console.log('✅ API response received');
      
      // Always show success message for security (generic response)
      setIsSuccess(true);
      setMessage('If this email exists in our system, a reset link has been sent.');
      
      // Clear form
      setEmail('');
      setCaptchaToken(null);
      setShowCaptcha(false);
      setHasAttemptedSubmit(false);
      
      // Reset CAPTCHA
      if (window.hcaptcha) {
        window.hcaptcha.reset();
      }

    } catch (error: any) {
      console.log('❌ API error:', error);
      // Handle rate limiting
      if (error.response?.status === 429) {
        setErrors({ general: 'Too many requests. Please try again later.' });
      } else {
        // Generic error message for security
        setIsSuccess(true);
        setMessage('If this email exists in our system, a reset link has been sent.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link 
          to="/login" 
          className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Login
        </Link>

        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-white/70">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-green-100 text-sm font-medium">Email Sent</p>
                <p className="text-green-200/80 text-sm">{message}</p>
                <p className="text-green-200/60 text-xs mt-2">
                  Please check your email and follow the instructions. The link will expire in 1 hour.
                </p>
              </div>
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-red-100 text-sm font-medium">Error</p>
                <p className="text-red-200/80 text-sm">{errors.general}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 bg-white/10 border ${
                    errors.email ? 'border-red-500/50' : 'border-white/20'
                  } rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-transparent transition-all`}
                  placeholder="Enter your email address"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* CAPTCHA - Only show after first submission attempt */}
            {showCaptcha && (
              <div className="animate-fade-in">
                <label className="block text-sm font-medium text-white/90 mb-2">
                  <Shield className="w-4 h-4 inline mr-2" />
                  Security Verification
                </label>
                <div className="bg-white/5 border border-white/20 rounded-lg p-4 flex justify-center">
                  <HCaptcha onVerify={handleCaptchaVerify} onError={handleCaptchaError} />
                </div>
                {errors.captcha && (
                  <p className="mt-2 text-sm text-red-400 text-center">{errors.captcha}</p>
                )}
                <p className="mt-2 text-xs text-white/60 text-center">
                  Complete the verification above to proceed
                </p>
              </div>
            )}

            {/* Progressive CAPTCHA Notice - Only show before CAPTCHA appears */}
            {!showCaptcha && !hasAttemptedSubmit && (
              <div className="text-center p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
                <p className="text-blue-200 text-sm">
                  <Shield className="w-4 h-4 inline mr-1" />
                  Security verification will appear after clicking "Send Reset Link"
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-blue-100 text-sm font-medium">Security Notice</p>
                <ul className="text-blue-200/80 text-xs mt-1 space-y-1">
                  <li>• Reset links expire after 1 hour for your security</li>
                  <li>• Only the most recent reset link will be valid</li>
                  <li>• Security verification required to prevent abuse</li>
                  <li>• If you didn't request this, please ignore this form</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            <p className="text-white/70 text-sm">
              Remember your password?{' '}
              <Link to="/login" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Sign In
              </Link>
            </p>
            <p className="text-white/70 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Extend Window interface for hCaptcha
declare global {
  interface Window {
    hcaptcha: any;
  }
}

export default ForgotPassword; 