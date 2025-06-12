import os
import json
from typing import Optional, Dict, Any
import httpx
from google.auth.transport import requests
from google.oauth2 import id_token
from google_auth_oauthlib.flow import Flow
from authlib.integrations.requests_client import OAuth2Session
import secrets

# Google OAuth configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5173/auth/google/callback")

# OAuth scopes
SCOPES = [
    "openid",
    "email", 
    "profile"
]

class GoogleAuthError(Exception):
    """Custom exception for Google authentication errors"""
    pass

class GoogleAuthService:
    def __init__(self):
        self.client_id = GOOGLE_CLIENT_ID
        self.client_secret = GOOGLE_CLIENT_SECRET
        self.redirect_uri = GOOGLE_REDIRECT_URI
        
        if not self.client_id or not self.client_secret:
            print("WARNING: Google OAuth credentials not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.")
    
    def get_authorization_url(self, state: str = None) -> Dict[str, str]:
        """Generate Google OAuth authorization URL"""
        if not self.client_id:
            raise GoogleAuthError("Google OAuth not configured")
        
        if not state:
            state = secrets.token_urlsafe(32)
        
        # Create OAuth session
        oauth = OAuth2Session(
            client_id=self.client_id,
            redirect_uri=self.redirect_uri,
            scope=" ".join(SCOPES)
        )
        
        authorization_url, _ = oauth.create_authorization_url(
            "https://accounts.google.com/o/oauth2/auth",
            state=state,
            access_type="offline",
            prompt="consent"
        )
        
        return {
            "authorization_url": authorization_url,
            "state": state
        }
    
    async def exchange_code_for_tokens(self, code: str, state: str = None) -> Dict[str, Any]:
        """Exchange authorization code for access tokens"""
        if not self.client_id or not self.client_secret:
            raise GoogleAuthError("Google OAuth not configured")
        
        token_url = "https://oauth2.googleapis.com/token"
        
        data = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": self.redirect_uri
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, data=data)
            
        if response.status_code != 200:
            raise GoogleAuthError(f"Token exchange failed: {response.text}")
        
        return response.json()
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get user information from Google API"""
        user_info_url = "https://www.googleapis.com/oauth2/v2/userinfo"
        
        headers = {
            "Authorization": f"Bearer {access_token}"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(user_info_url, headers=headers)
            
        if response.status_code != 200:
            raise GoogleAuthError(f"Failed to get user info: {response.text}")
        
        return response.json()
    
    def verify_id_token(self, id_token_str: str) -> Dict[str, Any]:
        """Verify Google ID token and extract user information"""
        try:
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                id_token_str, 
                requests.Request(), 
                self.client_id
            )
            
            # Check if token is from correct issuer
            if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
                raise GoogleAuthError('Invalid token issuer')
            
            return {
                'sub': idinfo['sub'],  # Google user ID
                'email': idinfo['email'],
                'email_verified': idinfo.get('email_verified', False),
                'name': idinfo.get('name', ''),
                'picture': idinfo.get('picture', ''),
                'given_name': idinfo.get('given_name', ''),
                'family_name': idinfo.get('family_name', ''),
                'locale': idinfo.get('locale', 'en')
            }
            
        except ValueError as e:
            raise GoogleAuthError(f"Invalid ID token: {str(e)}")
    
    async def authenticate_user(self, code: str, state: str = None) -> Dict[str, Any]:
        """Complete Google OAuth flow and return user information"""
        # Exchange code for tokens
        tokens = await self.exchange_code_for_tokens(code, state)
        
        # Get user info from access token
        user_info = await self.get_user_info(tokens['access_token'])
        
        # Verify ID token if present
        if 'id_token' in tokens:
            try:
                id_token_info = self.verify_id_token(tokens['id_token'])
                # Merge information from both sources
                user_info.update(id_token_info)
            except GoogleAuthError:
                # Continue without ID token verification if it fails
                pass
        
        return {
            "user_info": user_info,
            "tokens": tokens
        }

# Create singleton instance
google_auth_service = GoogleAuthService()

# Helper functions for easy access
def get_google_auth_url(state: str = None) -> Dict[str, str]:
    """Get Google OAuth authorization URL"""
    return google_auth_service.get_authorization_url(state)

async def authenticate_google_user(code: str, state: str = None) -> Dict[str, Any]:
    """Authenticate user with Google OAuth code"""
    return await google_auth_service.authenticate_user(code, state)

def is_google_auth_configured() -> bool:
    """Check if Google OAuth is properly configured"""
    return bool(GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET) 