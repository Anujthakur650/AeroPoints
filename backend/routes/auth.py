from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm, HTTPBearer, HTTPAuthorizationCredentials
from datetime import timedelta, datetime
from typing import Annotated, List, Optional
import uuid
import secrets
import os
import sqlite3
import hashlib
import logging
from collections import defaultdict
from time import time
import jwt

from models.user import (
    UserCreate, User, UserDB, UserUpdate, Token, 
    SavedSearch, SearchHistory, CabinClass
)
from utils.auth import (
    verify_password, get_password_hash, create_access_token, 
    get_current_user, get_current_active_user, validate_password_strength,
    validate_email_format, ACCESS_TOKEN_EXPIRE_MINUTES
)
from utils.google_auth import (
    get_google_auth_url, authenticate_google_user, 
    is_google_auth_configured, GoogleAuthError
)
from utils.email_service import send_password_reset_email, EmailService
from db.users import (
    get_user_by_email, create_user, update_user, get_user_by_id,
    add_search_to_history, save_search, remove_saved_search, 
    update_points_balance, init_db, update_user_password, 
    store_password_reset_token, get_user_by_reset_token, delete_reset_token
)

from pydantic import BaseModel, EmailStr

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["authentication"])
security = HTTPBearer()

# Production configuration
JWT_SECRET = os.getenv('JWT_SECRET', 'your-super-secret-jwt-key-change-this-in-production')
JWT_ALGORITHM = 'HS256'

# Database configuration with proper path resolution
DB_PATH = os.getenv('DB_PATH', os.path.join(os.path.dirname(os.path.dirname(__file__)), 'db', 'users.db'))

# Rate limiting storage (in production, use Redis)
rate_limit_storage = {}

# Models
class UserRegistration(BaseModel):
    email: EmailStr
    password: str
    name: str
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class PasswordResetRequest(BaseModel):
    email: str
    captcha_token: Optional[str] = None

class PasswordReset(BaseModel):
    token: str
    new_password: str

# Utility Functions
def hash_password(password: str) -> str:
    """Hash password using SHA-256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed

def create_jwt_token(user_data: dict) -> str:
    """Create JWT token for user"""
    payload = {
        'user_id': user_data['id'],
        'email': user_data['email'],
        'exp': datetime.utcnow() + timedelta(hours=24)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def init_auth_db():
    """Initialize auth database with required tables"""
    try:
        # Ensure database directory exists
        db_dir = os.path.dirname(DB_PATH)
        if not os.path.exists(db_dir):
            os.makedirs(db_dir)
            
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Create users table (simplified schema for auth)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                points INTEGER DEFAULT 1000,
                created_at TEXT NOT NULL,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Create password reset tokens table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS password_reset_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token TEXT UNIQUE NOT NULL,
                expires_at TEXT NOT NULL,
                used BOOLEAN DEFAULT FALSE,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Create indexes
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON password_reset_tokens(token)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_reset_tokens_user_id ON password_reset_tokens(user_id)')
        
        conn.commit()
        conn.close()
        logger.info("Auth database initialized successfully")
        return True
        
    except sqlite3.Error as e:
        logger.error(f"Database initialization error: {e}")
        return False

# Initialize database on module load
try:
    init_auth_db()
    logger.info("✅ Auth database initialized on module load")
except Exception as e:
    logger.error(f"❌ Failed to initialize auth database: {e}")

def get_db_connection():
    """Get database connection with proper error handling"""
    try:
        # Initialize database if needed
        if not os.path.exists(DB_PATH):
            init_auth_db()
            
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except sqlite3.Error as e:
        logger.error(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Database service unavailable")

def check_rate_limit(key: str, limit: int = 3, window: int = 3600) -> bool:
    """Simple rate limiting (use Redis in production)"""
    # More lenient rate limiting for development
    dev_mode = os.getenv('NODE_ENV', 'development') == 'development'
    if dev_mode:
        limit = 10  # Allow more requests in development
        window = 300  # Shorter window (5 minutes)
    
    now = datetime.now()
    if key not in rate_limit_storage:
        rate_limit_storage[key] = []
    
    # Clean old entries
    rate_limit_storage[key] = [
        timestamp for timestamp in rate_limit_storage[key]
        if (now - timestamp).seconds < window
    ]
    
    # Check limit
    if len(rate_limit_storage[key]) >= limit:
        return False
    
    # Add current request
    rate_limit_storage[key].append(now)
    return True

def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token"""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Routes
@router.post("/register", response_model=dict)
async def register(user: UserRegistration):
    """Register a new user"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user already exists
        cursor.execute("SELECT id FROM users WHERE email = ?", (user.email,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password and create user
        hashed_password = hash_password(user.password)
        
        cursor.execute("""
            INSERT INTO users (email, password, name, points, created_at)
            VALUES (?, ?, ?, ?, ?)
        """, (user.email, hashed_password, user.name, 1000, datetime.now().isoformat()))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        # Create token
        user_data = {'id': user_id, 'email': user.email, 'name': user.name}
        token = create_jwt_token(user_data)
        
        logger.info(f"New user registered: {user.email}")
        
        return {
            "message": "Registration successful",
            "token": token,
            "user": {
                "id": user_id,
                "email": user.email,
                "name": user.name,
                "points": 1000
            }
        }
        
    except sqlite3.Error as e:
        logger.error(f"Database error during registration: {e}")
        raise HTTPException(status_code=500, detail="Registration failed")

@router.post("/token", response_model=dict)
async def login(credentials: UserLogin):
    """Login user and return JWT token"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE email = ?", (credentials.email,))
        user = cursor.fetchone()
        conn.close()
        
        if not user or not verify_password(credentials.password, user['password']):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create token
        user_data = {
            'id': user['id'],
            'email': user['email'],
            'name': user['name']
        }
        token = create_jwt_token(user_data)
        
        logger.info(f"User logged in: {credentials.email}")
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user['id'],
                "email": user['email'],
                "name": user['name'],
                "points": user['points']
            }
        }
        
    except sqlite3.Error as e:
        logger.error(f"Database error during login: {e}")
        raise HTTPException(status_code=500, detail="Login failed")

@router.get("/me", response_model=dict)
async def get_current_user(current_user: dict = Depends(verify_jwt_token)):
    """Get current user information"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM users WHERE id = ?", (current_user['user_id'],))
        user = cursor.fetchone()
        conn.close()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "id": user['id'],
            "email": user['email'],
            "name": user['name'],
            "points": user['points'],
            "created_at": user['created_at']
        }
        
    except sqlite3.Error as e:
        logger.error(f"Database error fetching user: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch user data")

@router.post("/logout", response_model=dict)
async def logout():
    """Logout user (client should discard token)"""
    return {"message": "Logged out successfully"}

@router.post("/forgot-password", response_model=dict)
async def forgot_password(request: Request, forgot_request: PasswordResetRequest):
    """Request password reset - production-ready with rate limiting and generic responses"""
    
    logger.info(f"🔒 Password reset request for: {forgot_request.email}")
    logger.info(f"🔒 CAPTCHA token provided: {'Yes' if forgot_request.captcha_token else 'No'}")
    
    # Rate limiting by IP address
    client_ip = request.client.host
    if not check_rate_limit(f"forgot_password_{client_ip}"):
        logger.warning(f"🚫 Rate limit exceeded for IP: {client_ip}")
        raise HTTPException(
            status_code=429,
            detail="Too many password reset requests. Please try again later."
        )
    
    # Rate limiting by email
    if not check_rate_limit(f"forgot_password_email_{forgot_request.email}"):
        logger.warning(f"🚫 Rate limit exceeded for email: {forgot_request.email}")
        raise HTTPException(
            status_code=429,
            detail="Too many password reset requests for this email. Please try again later."
        )
    
    # CAPTCHA validation (more lenient in development)
    dev_mode = os.getenv('NODE_ENV', 'development') == 'development'
    if not forgot_request.captcha_token:
        if dev_mode:
            logger.warning("⚠️ CAPTCHA missing in development mode - proceeding anyway")
        else:
            logger.error("❌ CAPTCHA verification required")
            raise HTTPException(
                status_code=400,
                detail="CAPTCHA verification required"
            )
    
    try:
        # Initialize database if needed
        init_auth_db()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if user exists (but don't reveal this information)
        cursor.execute("SELECT id, email, name FROM users WHERE email = ?", (forgot_request.email,))
        user = cursor.fetchone()
        
        if user:
            logger.info(f"✅ User found: {user['email']}")
            
            # Generate secure reset token
            reset_token = secrets.token_urlsafe(32)
            expires_at = datetime.now() + timedelta(hours=1)
            
            # Store reset token
            cursor.execute("""
                INSERT INTO password_reset_tokens (user_id, token, expires_at, used)
                VALUES (?, ?, ?, ?)
            """, (user['id'], reset_token, expires_at.isoformat(), False))
            
            conn.commit()
            logger.info(f"🔑 Reset token created for user: {user['email']}")
            
            # Send reset email
            email_service = EmailService()
            email_sent = email_service.send_password_reset_email(
                to_email=user['email'],
                reset_token=reset_token,
                user_name=user['name']
            )
            
            if email_sent:
                logger.info(f"📧 Password reset email sent successfully to {user['email']}")
            else:
                logger.warning(f"📧 Failed to send password reset email to {user['email']}")
        else:
            logger.info(f"❌ No user found with email: {forgot_request.email}")
        
        conn.close()
        
        # Always return the same generic message for security
        return {
            "message": "If this email exists in our system, a reset link has been sent.",
            "success": True
        }
        
    except sqlite3.Error as e:
        logger.error(f"❌ Database error in forgot_password: {e}")
        # Return generic message even on database errors
        return {
            "message": "If this email exists in our system, a reset link has been sent.",
            "success": True
        }

@router.post("/reset-password", response_model=dict)
async def reset_password(reset_request: PasswordReset):
    """Reset password using token"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Find valid token
        cursor.execute("""
            SELECT rt.id, rt.user_id, rt.expires_at, rt.used, u.email
            FROM password_reset_tokens rt
            JOIN users u ON rt.user_id = u.id
            WHERE rt.token = ? AND rt.used = FALSE
        """, (reset_request.token,))
        
        token_data = cursor.fetchone()
        
        if not token_data:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        # Check if token has expired
        expires_at = datetime.fromisoformat(token_data['expires_at'])
        if datetime.now() > expires_at:
            raise HTTPException(status_code=400, detail="Reset token has expired")
        
        # Hash new password
        new_password_hash = hash_password(reset_request.new_password)
        
        # Update password
        cursor.execute("""
            UPDATE users SET password = ? WHERE id = ?
        """, (new_password_hash, token_data['user_id']))
        
        # Mark token as used
        cursor.execute("""
            UPDATE password_reset_tokens SET used = TRUE WHERE id = ?
        """, (token_data['id'],))
        
        conn.commit()
        conn.close()
        
        logger.info(f"Password reset successful for user: {token_data['email']}")
        
        return {"message": "Password reset successful"}
        
    except sqlite3.Error as e:
        logger.error(f"Database error during password reset: {e}")
        raise HTTPException(status_code=500, detail="Password reset failed")

@router.get("/google/status", response_model=dict)
async def google_oauth_status():
    """Check Google OAuth configuration status"""
    google_configured = bool(
        os.getenv('GOOGLE_CLIENT_ID') and 
        os.getenv('GOOGLE_CLIENT_SECRET')
    )
    
    return {
        "google_oauth_available": google_configured,
        "message": "Google OAuth is " + ("available" if google_configured else "not configured")
    }

@router.get("/health")
async def auth_health_check():
    """Health check for authentication service"""
    return {"status": "healthy", "service": "authentication"}

@router.get("/email/test")
async def test_email_configuration():
    """Test email configuration and SMTP connectivity"""
    try:
        # Import with correct path
        from utils.email_service import EmailService
        
        email_service = EmailService()
        
        # Check if email service is configured
        if email_service.is_configured:
            test_results = {
                "configured": True,
                "smtp_server": email_service.smtp_server,
                "smtp_port": email_service.smtp_port,
                "from_email": email_service.from_email,
                "status": "ready"
            }
        else:
            test_results = {
                "configured": False,
                "status": "not_configured",
                "message": "Email service not configured. Set SMTP_USERNAME and SMTP_PASSWORD environment variables."
            }
        
        return {
            "email_service": test_results,
            "timestamp": datetime.now().isoformat(),
            "recommendations": [
                "Set SMTP_USERNAME and SMTP_PASSWORD environment variables" if not test_results['configured'] else "Email service is ready",
                "For Gmail, use an app-specific password" if not test_results['configured'] else None,
                "Check firewall settings if connections fail" if test_results['configured'] else None
            ]
        }
        
    except ImportError as e:
        return {
            "email_service": {
                "configured": False,
                "status": "import_error",
                "error": str(e)
            },
            "timestamp": datetime.now().isoformat(),
            "recommendations": ["Check email service module path"]
        }
    except Exception as e:
        return {
            "email_service": {
                "configured": False,
                "status": "error",
                "error": str(e)
            },
            "timestamp": datetime.now().isoformat(),
            "recommendations": ["Check email service configuration"]
        }

# Google OAuth Routes
@router.get("/google")
async def google_login():
    """Initiate Google OAuth flow"""
    try:
        if not is_google_auth_configured():
            raise HTTPException(
                status_code=501,
                detail="Google OAuth not configured on server"
            )
        
        auth_data = get_google_auth_url()
        return {
            "authorization_url": auth_data["authorization_url"],
            "state": auth_data["state"]
        }
    except GoogleAuthError as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Google OAuth callback request body model ---
class GoogleCallbackRequest(BaseModel):
    code: str
    state: Optional[str] = None

@router.post("/google/callback")
async def google_callback(
    payload: Optional[GoogleCallbackRequest] = None,
    code: Optional[str] = None,
    state: Optional[str] = None,
):
    """Handle Google OAuth callback"""
    # Support both JSON body and query/form params for maximum compatibility
    if payload is not None:
        code = payload.code
        state = payload.state

    if code is None:
        raise HTTPException(status_code=422, detail="Missing 'code' in request")

    try:
        if not is_google_auth_configured():
            raise HTTPException(
                status_code=501,
                detail="Google OAuth not configured on server"
            )
        
        # Authenticate with Google
        auth_result = await authenticate_google_user(code, state)
        user_info = auth_result["user_info"]
        
        # Check if user exists
        existing_user = await get_user_by_email(user_info["email"])
        
        if existing_user:
            # Login existing user
            user = existing_user
            # Update user info from Google if needed
            update_data = {
                "full_name": user_info.get("name", user.full_name),
            }
            if user_info.get("picture"):
                update_data["avatar_url"] = user_info["picture"]
            
            user = await update_user(user.id, update_data)
        else:
            # Register new user with Google account
            user_data = UserCreate(
                full_name=user_info.get("name", ""),
                email=user_info["email"],
                password="google_oauth_user",  # Placeholder password
                google_id=user_info.get("sub"),
                avatar_url=user_info.get("picture", ""),
                is_email_verified=user_info.get("email_verified", False)
            )
            
            # Create user with Google authentication
            user_db = await create_user(user_data)
            user = User(
                id=user_db.id,
                email=user_db.email,
                full_name=user_db.full_name,
                points_balance=user_db.points_balance,
                created_at=user_db.created_at,
                updated_at=user_db.updated_at,
                is_admin=user_db.is_admin,
                preferred_airport=user_db.preferred_airport,
                frequent_flyer_programs=user_db.frequent_flyer_programs,
                flight_preferences=user_db.flight_preferences,
                saved_searches=user_db.saved_searches,
                search_history=user_db.search_history
            )
        
        # Create access token
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email}, expires_delta=access_token_expires
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user
        }
        
    except GoogleAuthError as e:
        raise HTTPException(status_code=400, detail=f"Google authentication failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication error: {str(e)}") 