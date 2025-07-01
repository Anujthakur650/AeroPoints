#!/bin/bash

echo "🚀 Email Service - Final Configuration"
echo "======================================"
echo ""

if [ -z "$1" ]; then
    echo "📧 Usage: ./update_email.sh your-email@gmail.com"
    echo ""
    echo "📋 Current configuration status:"
    echo "✅ App Password: Configured"
    echo "❌ Gmail Address: Needs to be set"
    echo ""
    echo "📝 Example: ./update_email.sh john.doe@gmail.com"
    echo ""
    exit 1
fi

GMAIL_ADDRESS="$1"

echo "🔧 Updating .env file with Gmail address: $GMAIL_ADDRESS"

# Update SMTP_USERNAME
sed -i.bak "s/SMTP_USERNAME=.*/SMTP_USERNAME=$GMAIL_ADDRESS/" .env

# Update FROM_EMAIL  
sed -i.bak "s/FROM_EMAIL=.*/FROM_EMAIL=$GMAIL_ADDRESS/" .env

echo "✅ Email configuration updated!"
echo ""

# Test the configuration
echo "🧪 Testing email service configuration..."
cd backend && python3 -c "
from utils.email_service import EmailService
service = EmailService()
print(f'📊 Configuration Status:')
print(f'  ✅ Configured: {service.is_configured}')
print(f'  📧 SMTP Server: {service.smtp_server}:{service.smtp_port}')
print(f'  📨 From Email: {service.from_email}')
print(f'  🔐 SMTP Username: {service.smtp_username}')

if service.is_configured:
    print('')
    print('🎉 EMAIL SERVICE IS READY FOR DEPLOYMENT!')
    print('')
    print('✅ Next steps:')
    print('1. Start backend: cd backend && python3 api_server.py')
    print('2. Test forgot password at: http://localhost:5173/forgot-password') 
    print('3. Email will be sent to your Gmail inbox!')
else:
    print('')
    print('❌ Configuration incomplete. Please check your settings.')
" 