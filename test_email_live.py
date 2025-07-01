#!/usr/bin/env python3

"""
Live Email Test for AeroPoints Password Reset
==============================================

This script sends a real password reset email to test the complete flow.
Make sure you have configured Gmail SMTP before running this test.
"""

import os
import sys
import time
import requests
from datetime import datetime

# Add backend to path
sys.path.append('backend')

def main():
    print("🧪 AeroPoints Live Email Test")
    print("=" * 50)
    print(f"Timestamp: {datetime.now().isoformat()}")
    print()
    
    # Check if email is configured
    smtp_username = os.getenv('SMTP_USERNAME')
    smtp_password = os.getenv('SMTP_PASSWORD')
    
    if not smtp_username or not smtp_password:
        print("❌ Email not configured!")
        print("Please run: ./setup_email_production.sh")
        print("Or set these environment variables:")
        print("   SMTP_USERNAME=your-gmail@gmail.com")
        print("   SMTP_PASSWORD=your-app-specific-password")
        return
    
    print(f"📧 Email configured with: {smtp_username}")
    print(f"🔧 SMTP Server: {os.getenv('SMTP_SERVER', 'smtp.gmail.com')}")
    print(f"🔧 Frontend URL: {os.getenv('FRONTEND_URL', 'http://localhost:5173')}")
    print()
    
    # Test email service configuration
    try:
        from utils.email_service import EmailService
        
        email_service = EmailService()
        test_results = email_service.test_email_configuration()
        
        print("📊 Email Service Configuration Test:")
        print(f"   Configured: {test_results['configured']}")
        
        if test_results['configured']:
            if test_results.get('smtp_test') == 'success':
                print("   Status: ✅ Ready for production")
            else:
                print(f"   Status: ❌ {test_results.get('error', 'Connection failed')}")
                return
        else:
            print("   Status: ❌ Not configured")
            return
            
    except Exception as e:
        print(f"❌ Email service test error: {e}")
        return
    
    print()
    
    # Get email to send test to
    test_email = input("Enter email address to send test reset email to: ").strip()
    
    if not test_email or '@' not in test_email:
        print("❌ Invalid email address")
        return
    
    print(f"\n🚀 Sending password reset email to: {test_email}")
    print("Please wait...")
    
    # Send forgot password request
    try:
        response = requests.post(
            'http://localhost:8000/api/auth/forgot-password',
            json={'email': test_email, 'captcha_token': 'test-token'},
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        if response.status_code == 200:
            print("✅ Password reset request processed successfully!")
            print(f"   Response: {response.json().get('message')}")
            print()
            print("📧 Email Delivery Test Results:")
            print("   1. Check your email inbox (and spam folder)")
            print("   2. Look for email from AeroPoints")
            print("   3. Verify the reset link works")
            print("   4. Test the password reset form")
            print()
            print("✨ If you received the email, the production setup is working!")
            
        elif response.status_code == 429:
            print("⚠️ Rate limiting active - wait a few minutes and try again")
            
        else:
            print(f"❌ Request failed: {response.status_code}")
            print(f"   Error: {response.text}")
            
    except requests.exceptions.Timeout:
        print("⏰ Request timed out - check if backend is running")
        
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend - make sure it's running on localhost:8000")
        
    except Exception as e:
        print(f"❌ Error sending request: {e}")

if __name__ == "__main__":
    main() 