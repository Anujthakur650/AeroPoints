#!/usr/bin/env python3
"""
Test script for email service functionality
Run this to verify email configuration and test password reset emails
"""

import asyncio
import os
import sys
import json
from datetime import datetime

# Add the backend directory to Python path
sys.path.append('backend')

from utils.email_service import EmailService

async def test_email_service():
    """Test email service configuration and functionality"""
    
    print("🧪 Testing AeroPoints Email Service")
    print("=" * 50)
    
    # Initialize email service
    email_service = EmailService()
    
    # Test 1: Configuration Check
    print("\n📋 Testing Email Configuration...")
    config_results = email_service.test_email_configuration()
    
    print(f"✅ Configured: {config_results['configured']}")
    print(f"📧 Primary Server: {config_results['primary_server']}")
    print(f"📮 From Email: {config_results['from_email']}")
    
    if config_results['tests']:
        print("\n🔌 SMTP Connection Tests:")
        for test in config_results['tests']:
            status = "✅ PASS" if test['success'] else "❌ FAIL"
            print(f"  {status} {test['server']} ({test['type']})")
    
    print(f"\n🏥 Overall Status: {config_results['overall_status'].upper()}")
    
    # Test 2: Send Test Email (if configured)
    if config_results['configured'] and config_results['working_servers']:
        print("\n📨 Testing Password Reset Email...")
        
        test_email = os.getenv('TEST_EMAIL', 'test@example.com')
        test_name = "Test User"
        test_reset_link = "http://localhost:5173/reset-password?token=test-token-123"
        
        try:
            success = await email_service.send_password_reset_email(
                test_email, test_name, test_reset_link
            )
            
            if success:
                print(f"✅ Password reset email sent successfully to {test_email}")
                print("📧 Please check the recipient's inbox (including spam folder)")
            else:
                print(f"❌ Failed to send password reset email to {test_email}")
                
        except Exception as e:
            print(f"❌ Error sending test email: {str(e)}")
    
    else:
        print("\n⚠️  Email service not properly configured - skipping email test")
        print("\n🔧 To configure email service:")
        print("   export SMTP_USERNAME='your-email@gmail.com'")
        print("   export SMTP_PASSWORD='your-app-password'")
        print("   export SMTP_SERVER='smtp.gmail.com'  # optional")
        print("   export SMTP_PORT='587'  # optional")
    
    # Test 3: Welcome Email Test
    if config_results['configured'] and config_results['working_servers']:
        print("\n🎉 Testing Welcome Email...")
        
        test_email = os.getenv('TEST_EMAIL', 'test@example.com')
        test_name = "New Test User"
        
        try:
            success = await email_service.send_welcome_email(test_email, test_name)
            
            if success:
                print(f"✅ Welcome email sent successfully to {test_email}")
            else:
                print(f"❌ Failed to send welcome email to {test_email}")
                
        except Exception as e:
            print(f"❌ Error sending welcome email: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🏁 Email Service Test Complete")
    
    # Return results for programmatic use
    return {
        'timestamp': datetime.now().isoformat(),
        'configuration': config_results,
        'email_service_ready': config_results['configured'] and bool(config_results.get('working_servers'))
    }

def print_environment_setup():
    """Print instructions for setting up email environment variables"""
    
    print("\n🔧 Email Service Setup Instructions")
    print("=" * 40)
    print("\n📧 For Gmail (recommended for development):")
    print("1. Enable 2-factor authentication on your Gmail account")
    print("2. Generate an App Password: https://myaccount.google.com/apppasswords")
    print("3. Set environment variables:")
    print("   export SMTP_USERNAME='your-email@gmail.com'")
    print("   export SMTP_PASSWORD='your-16-char-app-password'")
    print("   export FROM_EMAIL='your-email@gmail.com'")
    print("   export FROM_NAME='AeroPoints'")
    
    print("\n📧 For Outlook/Hotmail:")
    print("   export SMTP_SERVER='smtp.outlook.com'")
    print("   export SMTP_USERNAME='your-email@outlook.com'")
    print("   export SMTP_PASSWORD='your-password'")
    
    print("\n📧 For production (SendGrid, Mailgun, etc.):")
    print("   export SMTP_SERVER='smtp.sendgrid.net'")
    print("   export SMTP_USERNAME='apikey'")
    print("   export SMTP_PASSWORD='your-sendgrid-api-key'")
    
    print("\n🧪 For testing:")
    print("   export TEST_EMAIL='your-test-email@gmail.com'")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description='Test AeroPoints Email Service')
    parser.add_argument('--setup', action='store_true', help='Show setup instructions')
    parser.add_argument('--json', action='store_true', help='Output results as JSON')
    
    args = parser.parse_args()
    
    if args.setup:
        print_environment_setup()
        sys.exit(0)
    
    # Run the test
    try:
        results = asyncio.run(test_email_service())
        
        if args.json:
            print("\n" + json.dumps(results, indent=2))
            
    except KeyboardInterrupt:
        print("\n⏹️  Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {str(e)}")
        sys.exit(1) 