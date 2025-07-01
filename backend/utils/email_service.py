"""
Email service for sending password reset emails and other notifications.
Production-ready implementation with Gmail SMTP support and comprehensive error handling.
"""

import os
import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import Optional, Dict, Any
import ssl
import socket
import certifi
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class EmailService:
    """Production-ready email service with Gmail SMTP support and comprehensive error handling"""
    
    def __init__(self):
        # Production SMTP configuration with Gmail support
        self.smtp_server = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
        self.smtp_port = int(os.getenv('SMTP_PORT', '587'))
        self.smtp_username = os.getenv('SMTP_USERNAME')  # Gmail address
        self.smtp_password = os.getenv('SMTP_PASSWORD')  # App-specific password
        self.from_email = os.getenv('FROM_EMAIL', self.smtp_username)
        self.from_name = os.getenv('FROM_NAME', 'AeroPoints')
        
        # Production configuration check
        self.is_configured = bool(
            self.smtp_username and 
            self.smtp_password and 
            self.from_email
        )
        
        if not self.is_configured:
            logger.warning("📧 Email service not configured. Set SMTP_USERNAME and SMTP_PASSWORD environment variables.")
        else:
            logger.info(f"📧 Email service configured with {self.smtp_server}:{self.smtp_port}")

    def send_password_reset_email(self, to_email: str, reset_token: str, user_name: Optional[str] = None) -> bool:
        """
        Send password reset email with production-ready HTML template
        
        Args:
            to_email: Recipient email address
            reset_token: Secure reset token
            user_name: Optional user name for personalization
            
        Returns:
            bool: True if email sent successfully, False otherwise
        """
        # Create reset link
        base_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')
        reset_link = f"{base_url}/reset-password?token={reset_token}"
        
        if not self.is_configured:
            # Development mode - log email instead of sending
            logger.warning("📧 Email service not configured. Password reset email not sent.")
            logger.info(f"📧 Would send reset email to: {to_email}")
            logger.info(f"📧 Reset link: {reset_link}")
            logger.info(f"📧 User: {user_name or 'Unknown'}")
            logger.info("📧 To enable email sending, set SMTP_USERNAME and SMTP_PASSWORD environment variables")
            
            # In development, we still return True so the flow continues
            # but we log a warning that the email wasn't actually sent
            print(f"\n🔗 DEVELOPMENT MODE: Password reset link for {to_email}:")
            print(f"   {reset_link}")
            print("   Copy this link to test password reset functionality\n")
            return True

        try:
            # Production mode - send real email
            logger.info(f"📧 Sending password reset email to {to_email}")
            
            # Create email content
            msg = MIMEMultipart('alternative')
            msg['Subject'] = 'Reset Your AeroPoints Password'
            msg['From'] = f"{self.from_name} <{self.from_email}>"
            msg['To'] = to_email
            
            # Add security headers
            msg['X-Mailer'] = 'AeroPoints Security System'
            msg['X-Priority'] = '1'
            
            # HTML email template - mobile responsive
            html_content = self._create_reset_email_html(reset_link, user_name or "Valued Member")
            
            # Plain text fallback
            text_content = self._create_reset_email_text(reset_link, user_name or "Valued Member")
            
            # Attach both versions
            msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
            msg.attach(MIMEText(html_content, 'html', 'utf-8'))
            
            # Send email via SMTP
            context = ssl.create_default_context(cafile=certifi.where())
            
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"📧 Password reset email sent successfully to {to_email}")
            return True
            
        except smtplib.SMTPAuthenticationError:
            logger.error("📧 SMTP Authentication failed. Check SMTP credentials.")
            return False
        except smtplib.SMTPRecipientsRefused:
            logger.error(f"📧 Invalid recipient email address: {to_email}")
            return False
        except smtplib.SMTPException as e:
            logger.error(f"📧 SMTP error occurred: {str(e)}")
            return False
        except Exception as e:
            logger.error(f"📧 Unexpected error sending email: {str(e)}")
            return False

    def _create_reset_email_html(self, reset_link: str, user_name: str) -> str:
        """Create mobile-responsive HTML email template"""
        return f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your AeroPoints Password</title>
    <style>
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{ 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6; 
            color: #333;
            background-color: #f8fafc;
        }}
        .container {{ 
            max-width: 600px; 
            margin: 0 auto; 
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }}
        .header {{ 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }}
        .header h1 {{ 
            font-size: 28px; 
            font-weight: 700;
            margin-bottom: 8px;
        }}
        .content {{ padding: 40px 30px; }}
        .greeting {{ 
            font-size: 18px; 
            margin-bottom: 20px;
            color: #4a5568;
        }}
        .message {{ 
            font-size: 16px; 
            margin-bottom: 30px;
            color: #718096;
            line-height: 1.8;
        }}
        .reset-button {{ 
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
            transition: all 0.3s ease;
        }}
        .reset-button:hover {{ 
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }}
        .security-note {{ 
            background: #f7fafc;
            border-left: 4px solid #4299e1;
            padding: 16px;
            margin: 20px 0;
            border-radius: 4px;
        }}
        .footer {{ 
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            font-size: 14px;
            color: #a0aec0;
            border-top: 1px solid #e2e8f0;
        }}
        .footer a {{ color: #667eea; text-decoration: none; }}
        
        @media (max-width: 600px) {{
            .container {{ margin: 10px; }}
            .header, .content {{ padding: 25px 20px; }}
            .header h1 {{ font-size: 24px; }}
            .reset-button {{ 
                display: block;
                text-align: center;
                width: 100%;
            }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🛫 AeroPoints</h1>
            <p>Premium Flight Search & Awards</p>
        </div>
        
        <div class="content">
            <div class="greeting">Hello {user_name},</div>
            
            <div class="message">
                We received a request to reset your AeroPoints account password. 
                Click the button below to create a new password:
            </div>
            
            <div style="text-align: center;">
                <a href="{reset_link}" class="reset-button">Reset My Password</a>
            </div>
            
            <div class="security-note">
                <strong>🔒 Security Notice:</strong><br>
                • This link expires in 1 hour for your security<br>
                • If you didn't request this reset, please ignore this email<br>
                • Never share this link with anyone
            </div>
            
            <div class="message">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="{reset_link}" style="color: #667eea; word-break: break-all;">{reset_link}</a>
            </div>
        </div>
        
        <div class="footer">
            <p>
                This email was sent by AeroPoints Security System.<br>
                If you have questions, contact us at 
                <a href="mailto:support@aeropoints.com">support@aeropoints.com</a>
            </p>
            <p style="margin-top: 10px;">
                © 2025 AeroPoints. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>
"""

    def _create_reset_email_text(self, reset_link: str, user_name: str) -> str:
        """Create plain text email fallback"""
        return f"""
AeroPoints - Password Reset Request

Hello {user_name},

We received a request to reset your AeroPoints account password.

To reset your password, click this link:
{reset_link}

SECURITY NOTICE:
- This link expires in 1 hour for your security
- If you didn't request this reset, please ignore this email
- Never share this link with anyone

If you have any questions, contact us at support@aeropoints.com

© 2025 AeroPoints. All rights reserved.
"""

    def test_email_configuration(self) -> Dict[str, Any]:
        """Test email service configuration and connectivity"""
        results = {
            'configured': self.is_configured,
            'smtp_server': self.smtp_server,
            'smtp_port': self.smtp_port,
            'from_email': self.from_email,
            'timestamp': datetime.now().isoformat()
        }
        
        if not self.is_configured:
            results['error'] = 'Email service not configured'
            results['working_servers'] = []
            results['overall_status'] = 'unhealthy'
            results['recommendations'] = [
                'Set SMTP_USERNAME environment variable (Gmail address)',
                'Set SMTP_PASSWORD environment variable (App-specific password)',
                'For Gmail: Enable 2FA and generate App Password',
                'Set FRONTEND_URL for production deployment'
            ]
            return results

        # Test SMTP connectivity
        try:
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=10) as server:
                server.starttls(context=context)
                server.login(self.smtp_username, self.smtp_password)
                
            results['smtp_test'] = 'success'
            results['overall_status'] = 'healthy'
            logger.info("📧 SMTP configuration test successful")
            
        except smtplib.SMTPAuthenticationError:
            results['smtp_test'] = 'authentication_failed'
            results['overall_status'] = 'unhealthy'
            results['error'] = 'SMTP authentication failed'
            
        except Exception as e:
            results['smtp_test'] = 'connection_failed'
            results['overall_status'] = 'unhealthy'
            results['error'] = f'SMTP connection failed: {str(e)}'
            
        return results

# Convenience functions for backward compatibility
async def send_password_reset_email(email: str, reset_token: str, user_name: str = "User") -> bool:
    """Send password reset email - convenience function"""
    service = EmailService()
    reset_link = f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/reset-password?token={reset_token}"
    return await service.send_password_reset_email(email, user_name, reset_link)

# Legacy function for compatibility
async def send_password_reset_email(to_email: str, reset_token: str, user_name: str = "") -> bool:
    service = EmailService()
    reset_link = f"{os.getenv('FRONTEND_URL', 'http://localhost:5173')}/reset-password?token={reset_token}"
    return await service.send_password_reset_email(to_email, user_name, reset_link)

async def send_welcome_email(to_email: str, user_name: str) -> bool:
    """Send welcome email - convenience function"""
    service = EmailService()
    return await service.send_welcome_email(to_email, user_name) 