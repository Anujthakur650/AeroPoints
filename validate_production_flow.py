#!/usr/bin/env python3

"""
AeroPoints Production Password Reset Flow Validation Script
===========================================================

This script performs comprehensive end-to-end testing of the password reset functionality,
including CAPTCHA behavior, email delivery, reset link validation, and security measures.
"""

import requests
import time
import json
import os
import sys
from datetime import datetime

# Configuration
BACKEND_URL = 'http://localhost:8000'
FRONTEND_URL = 'http://localhost:5173'
TEST_EMAIL = 'anujthakur650@gmail.com'

def print_header(title):
    """Print formatted section header"""
    print(f"\n{'='*60}")
    print(f"🧪 {title}")
    print(f"{'='*60}")

def print_step(step, description):
    """Print formatted test step"""
    print(f"\n📋 Step {step}: {description}")
    print("-" * 40)

def print_success(message):
    """Print success message"""
    print(f"✅ {message}")

def print_error(message):
    """Print error message"""
    print(f"❌ {message}")

def print_warning(message):
    """Print warning message"""
    print(f"⚠️ {message}")

def test_backend_health():
    """Test if backend is running and healthy"""
    try:
        response = requests.get(f"{BACKEND_URL}/health", timeout=5)
        if response.status_code == 200:
            print_success("Backend is healthy and running")
            return True
        else:
            print_error(f"Backend health check failed: {response.status_code}")
            return False
    except requests.ConnectionError:
        print_error("Cannot connect to backend. Make sure it's running on localhost:8000")
        return False
    except Exception as e:
        print_error(f"Backend health check error: {e}")
        return False

def test_frontend_running():
    """Test if frontend is running"""
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print_success("Frontend is running")
            return True
        else:
            print_error(f"Frontend check failed: {response.status_code}")
            return False
    except requests.ConnectionError:
        print_error("Cannot connect to frontend. Make sure it's running on localhost:5173")
        return False
    except Exception as e:
        print_error(f"Frontend check error: {e}")
        return False

def test_captcha_validation():
    """Test CAPTCHA validation requirements"""
    print_step(1, "Testing CAPTCHA Validation")
    
    # Test 1: Request without CAPTCHA token
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/forgot-password",
            json={"email": TEST_EMAIL},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 400:
            data = response.json()
            if "CAPTCHA" in data.get("detail", ""):
                print_success("CAPTCHA validation enforced - requests without CAPTCHA rejected")
            else:
                print_error(f"Unexpected error message: {data.get('detail')}")
        else:
            print_error(f"Expected 400 error, got {response.status_code}")
            
    except Exception as e:
        print_error(f"CAPTCHA test error: {e}")

def test_rate_limiting():
    """Test rate limiting functionality"""
    print_step(2, "Testing Rate Limiting")
    
    # Make multiple rapid requests to trigger rate limiting
    for i in range(6):  # Exceeding the 3 request limit
        try:
            response = requests.post(
                f"{BACKEND_URL}/api/auth/forgot-password",
                json={"email": TEST_EMAIL, "captcha_token": "test-token"},
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 429:
                print_success(f"Rate limiting triggered after {i+1} requests")
                break
            elif i < 5:
                print(f"   Request {i+1}: {response.status_code}")
            else:
                print_warning("Rate limiting not triggered after 6 requests")
                
        except Exception as e:
            print_error(f"Rate limiting test error: {e}")
            break

def test_email_delivery():
    """Test actual email delivery with valid request"""
    print_step(3, "Testing Email Delivery")
    
    # Wait a bit to avoid rate limiting
    time.sleep(2)
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/forgot-password",
            json={"email": TEST_EMAIL, "captcha_token": "test-token"},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("Password reset request processed successfully")
            print(f"   Response: {data.get('message')}")
            
            # Check for any sensitive data exposure
            if 'token' in data or 'reset_token' in data:
                print_error("Security Issue: Reset token exposed in API response!")
            else:
                print_success("Security: No sensitive data exposed in response")
                
        else:
            print_error(f"Password reset failed: {response.status_code} - {response.text}")
            
    except Exception as e:
        print_error(f"Email delivery test error: {e}")

def test_invalid_email():
    """Test behavior with invalid email"""
    print_step(4, "Testing Invalid Email Handling")
    
    time.sleep(1)
    
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/forgot-password",
            json={"email": "nonexistent@example.com", "captcha_token": "test-token"},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print_success("Generic response returned for invalid email (security feature)")
            print(f"   Response: {data.get('message')}")
        else:
            print_error(f"Unexpected response for invalid email: {response.status_code}")
            
    except Exception as e:
        print_error(f"Invalid email test error: {e}")

def test_reset_password_validation():
    """Test password reset with invalid tokens"""
    print_step(5, "Testing Reset Password Validation")
    
    # Test with invalid token
    try:
        response = requests.post(
            f"{BACKEND_URL}/api/auth/reset-password",
            json={"token": "invalid-token", "new_password": "NewPassword123!"},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 400:
            data = response.json()
            print_success("Invalid token properly rejected")
            print(f"   Response: {data.get('detail')}")
        else:
            print_error(f"Invalid token should be rejected, got {response.status_code}")
            
    except Exception as e:
        print_error(f"Reset password validation error: {e}")

def check_email_configuration():
    """Check email service configuration"""
    print_step(6, "Checking Email Service Configuration")
    
    try:
        # Import here to avoid issues if backend modules aren't available
        sys.path.append('backend')
        from utils.email_service import EmailService
        
        email_service = EmailService()
        config_results = email_service.test_email_configuration()
        
        print(f"   Configured: {config_results['configured']}")
        print(f"   SMTP Server: {config_results['smtp_server']}:{config_results['smtp_port']}")
        print(f"   From Email: {config_results['from_email']}")
        
        if config_results['configured']:
            if config_results.get('smtp_test') == 'success':
                print_success("Email service ready for production")
            else:
                print_error(f"Email service configuration issue: {config_results.get('error')}")
        else:
            print_warning("Email service not configured - emails will not be sent")
            print("   Run ./setup_email_production.sh to configure Gmail SMTP")
            
    except ImportError as e:
        print_warning(f"Cannot import email service: {e}")
        print("   Make sure you're running from the project root directory")
    except Exception as e:
        print_error(f"Email configuration check error: {e}")

def print_manual_testing_guide():
    """Print manual testing instructions"""
    print_header("Manual Testing Guide")
    
    print("""
🔧 Frontend Testing Steps:
1. Open browser to: http://localhost:5173/forgot-password
2. Verify CAPTCHA appears after first submission attempt (not on page load)
3. Try submitting without completing CAPTCHA - should show error
4. Complete CAPTCHA and submit with valid email
5. Check your email inbox for reset message
6. Click reset link and verify it opens reset form
7. Test password strength validation
8. Submit new password and verify success

📧 Email Delivery Checklist:
✓ Email arrives in inbox (not spam folder)
✓ Email displays correctly on desktop and mobile
✓ Reset link is clickable and properly formatted
✓ Email template looks professional with AeroPoints branding
✓ Plain text fallback works for email clients without HTML support

🔐 Security Validation:
✓ Reset token in URL works only once
✓ Reset token expires after 1 hour
✓ CAPTCHA cannot be bypassed
✓ Rate limiting prevents abuse
✓ No sensitive data in API responses
✓ Generic messages protect user privacy

🎯 Production Readiness:
✓ All tests pass
✓ Email delivery working reliably
✓ Error handling graceful
✓ Security measures active
✓ Performance acceptable under load
""")

def main():
    """Run all production validation tests"""
    print_header("AeroPoints Production Password Reset Validation")
    print(f"Timestamp: {datetime.now().isoformat()}")
    print(f"Backend URL: {BACKEND_URL}")
    print(f"Frontend URL: {FRONTEND_URL}")
    print(f"Test Email: {TEST_EMAIL}")
    
    # Run all tests
    tests_passed = 0
    total_tests = 6
    
    if test_backend_health():
        tests_passed += 1
    
    if test_frontend_running():
        tests_passed += 1
    
    test_captcha_validation()
    test_rate_limiting()
    test_email_delivery()
    test_invalid_email()
    test_reset_password_validation()
    check_email_configuration()
    
    # Print summary
    print_header("Validation Summary")
    print(f"✅ Core Services: {tests_passed}/{2} running")
    print("📧 Email delivery test completed - check your inbox!")
    print("🔒 Security tests completed - verify CAPTCHA and rate limiting work")
    print("🧪 Reset flow validation completed")
    
    if tests_passed == 2:
        print_success("All core services are running - proceed with manual testing")
    else:
        print_error("Some services are not running - fix issues before testing")
    
    print_manual_testing_guide()
    
    print_header("Next Steps")
    print("""
1. 📧 Check your email inbox for password reset email
2. 🔗 Test the reset link functionality
3. 🎨 Verify email template appearance
4. 🔒 Confirm security measures are working
5. 📱 Test on mobile devices
6. 🚀 Ready for production deployment!
    """)

if __name__ == "__main__":
    main() 