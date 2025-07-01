#!/bin/bash

# AeroPoints Production Email Configuration Script
# This script helps you set up Gmail SMTP for production email delivery

echo "🚀 AeroPoints Production Email Setup"
echo "=========================================="
echo ""

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    touch .env
else
    echo "📝 Found existing .env file"
fi

echo ""
echo "📧 Gmail SMTP Configuration"
echo "---------------------------"
echo ""
echo "To use Gmail for sending password reset emails, you need:"
echo "1. A Gmail account (personal or Google Workspace)"
echo "2. Two-Factor Authentication (2FA) enabled"
echo "3. An App-Specific Password generated"
echo ""
echo "📖 How to create an App-Specific Password:"
echo "1. Go to https://myaccount.google.com/security"
echo "2. Turn on 2-Step Verification if not already enabled"
echo "3. Go to App passwords (https://myaccount.google.com/apppasswords)"
echo "4. Select 'Mail' and your device"
echo "5. Copy the 16-character password (remove spaces)"
echo ""

# Get Gmail credentials
read -p "Enter your Gmail address: " gmail_address
echo ""
read -s -p "Enter your Gmail App Password (16 characters): " app_password
echo ""
echo ""

# Get frontend URL
read -p "Enter your frontend URL (default: http://localhost:5173): " frontend_url
frontend_url=${frontend_url:-http://localhost:5173}

# Update .env file
echo "🔧 Updating .env configuration..."
echo ""

# Remove existing entries if they exist
sed -i '' '/^SMTP_SERVER=/d' .env 2>/dev/null || sed -i '/^SMTP_SERVER=/d' .env 2>/dev/null
sed -i '' '/^SMTP_PORT=/d' .env 2>/dev/null || sed -i '/^SMTP_PORT=/d' .env 2>/dev/null
sed -i '' '/^SMTP_USERNAME=/d' .env 2>/dev/null || sed -i '/^SMTP_USERNAME=/d' .env 2>/dev/null
sed -i '' '/^SMTP_PASSWORD=/d' .env 2>/dev/null || sed -i '/^SMTP_PASSWORD=/d' .env 2>/dev/null
sed -i '' '/^FROM_EMAIL=/d' .env 2>/dev/null || sed -i '/^FROM_EMAIL=/d' .env 2>/dev/null
sed -i '' '/^FROM_NAME=/d' .env 2>/dev/null || sed -i '/^FROM_NAME=/d' .env 2>/dev/null
sed -i '' '/^FRONTEND_URL=/d' .env 2>/dev/null || sed -i '/^FRONTEND_URL=/d' .env 2>/dev/null

# Add new configuration
cat >> .env << EOF

# Email Configuration (Production Gmail SMTP)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=$gmail_address
SMTP_PASSWORD=$app_password
FROM_EMAIL=$gmail_address
FROM_NAME=AeroPoints
FRONTEND_URL=$frontend_url
EOF

echo "✅ Email configuration saved to .env file"
echo ""

# Test email configuration
echo "🧪 Testing email configuration..."
cd backend && python3 -c "
import sys
sys.path.append('.')
from utils.email_service import EmailService

email_service = EmailService()
results = email_service.test_email_configuration()

print('📊 Email Service Test Results:')
print(f'   Configured: {results[\"configured\"]}')
print(f'   SMTP Server: {results[\"smtp_server\"]}:{results[\"smtp_port\"]}')
print(f'   From Email: {results[\"from_email\"]}')

if results['configured']:
    if results.get('smtp_test') == 'success':
        print('   Status: ✅ Ready for production')
    elif results.get('smtp_test') == 'authentication_failed':
        print('   Status: ❌ Authentication failed - check credentials')
    else:
        print(f'   Status: ❌ Connection failed - {results.get(\"error\", \"Unknown error\")}')
else:
    print('   Status: ⚠️  Not configured')
"
echo ""

echo "🎯 Next Steps:"
echo "1. Test the forgot password flow at: $frontend_url/forgot-password"
echo "2. Check email delivery to your inbox"
echo "3. Verify reset links work correctly"
echo "4. Consider setting up SPF/DKIM records for your domain"
echo ""
echo "📖 Production Deployment Guide: PRODUCTION_DEPLOYMENT.md"
echo ""
echo "✨ Setup complete! Your AeroPoints email system is ready for production." 