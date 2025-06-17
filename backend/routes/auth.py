from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta, datetime
from typing import Annotated, List, Optional
import uuid

from ..models.user import (
    UserCreate, User, UserDB, UserUpdate, Token, 
    SavedSearch, SearchHistory, CabinClass
)
from ..utils.auth import (
    verify_password, get_password_hash, create_access_token, 
    get_current_user, get_current_active_user, validate_password_strength,
    validate_email_format, ACCESS_TOKEN_EXPIRE_MINUTES
)
from ..utils.google_auth import (
    get_google_auth_url, authenticate_google_user, 
    is_google_auth_configured, GoogleAuthError
)
from ..db.users import (
    get_user_by_email, create_user, update_user, get_user_by_id,
    add_search_to_history, save_search, remove_saved_search, 
    update_points_balance, init_db
)

from pydantic import BaseModel

router = APIRouter(prefix="/auth", tags=["auth"])

# Initialize database on module load
@router.on_event("startup")
async def startup_event():
    init_db()

@router.post("/register", response_model=Token)
async def register_user(user_data: UserCreate):
    """Register a new user account"""
    
    # Validate email format
    if not validate_email_format(user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email format"
        )
    
    # Validate password strength
    if not validate_password_strength(user_data.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long and contain uppercase, lowercase, and numeric characters"
        )
    
    # Check if user exists
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user with hashed password
    hashed_password = get_password_hash(user_data.password)
    user_db = await create_user(user_data, hashed_password)
    
    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_db.email},
        expires_delta=access_token_expires
    )
    
    # Convert to User model (remove sensitive fields)
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
    
    # Award registration bonus points
    await update_points_balance(user_db.id, 1000)  # Welcome bonus
    user.points_balance += 1000
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    """Login and get access token"""
    user_db = await get_user_by_email(form_data.username)  # username is email in this case
    if not user_db or not verify_password(form_data.password, user_db.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user_db.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is deactivated"
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user_db.email},
        expires_delta=access_token_expires
    )
    
    # Convert to User model (remove sensitive fields)
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
    
    return Token(access_token=access_token, token_type="bearer", user=user)

@router.get("/me", response_model=User)
async def read_users_me(current_user: Annotated[User, Depends(get_current_active_user)]):
    """Get current user profile"""
    # Refresh user data from database to get latest info
    user_db = await get_user_by_email(current_user.email)
    return User(
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

@router.put("/me", response_model=User)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """Update current user profile"""
    updated_user_db = await update_user(current_user.id, user_update)
    if not updated_user_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return User(
        id=updated_user_db.id,
        email=updated_user_db.email,
        full_name=updated_user_db.full_name,
        points_balance=updated_user_db.points_balance,
        created_at=updated_user_db.created_at,
        updated_at=updated_user_db.updated_at,
        is_admin=updated_user_db.is_admin,
        preferred_airport=updated_user_db.preferred_airport,
        frequent_flyer_programs=updated_user_db.frequent_flyer_programs,
        flight_preferences=updated_user_db.flight_preferences,
        saved_searches=updated_user_db.saved_searches,
        search_history=updated_user_db.search_history
    )

@router.post("/search-history", response_model=dict)
async def add_search_history(
    origin: str,
    destination: str,
    departure_date: str,
    cabin_class: CabinClass,
    passengers: int = 1,
    return_date: str = None,
    results_found: int = 0,
    current_user: Annotated[User, Depends(get_current_active_user)] = None
):
    """Add a search to user's search history"""
    search_history = SearchHistory(
        id=str(uuid.uuid4()),
        origin=origin,
        destination=destination,
        departure_date=departure_date,
        return_date=return_date,
        cabin_class=cabin_class,
        passengers=passengers,
        search_timestamp=datetime.utcnow(),
        results_found=results_found
    )
    
    success = await add_search_to_history(current_user.id, search_history)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to add search to history"
        )
    
    # Award points for searches
    await update_points_balance(current_user.id, 10)
    
    return {"message": "Search added to history", "points_earned": 10}

@router.post("/saved-searches", response_model=dict)
async def save_user_search(
    origin: str,
    destination: str,
    departure_date: str,
    cabin_class: CabinClass,
    passengers: int = 1,
    return_date: str = None,
    search_name: str = None,
    current_user: Annotated[User, Depends(get_current_active_user)] = None
):
    """Save a search for later use"""
    saved_search = SavedSearch(
        id=str(uuid.uuid4()),
        origin=origin,
        destination=destination,
        departure_date=departure_date,
        return_date=return_date,
        cabin_class=cabin_class,
        passengers=passengers,
        created_at=datetime.utcnow(),
        search_name=search_name or f"{origin} to {destination}"
    )
    
    success = await save_search(current_user.id, saved_search)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save search"
        )
    
    return {"message": "Search saved successfully"}

@router.delete("/saved-searches/{search_id}", response_model=dict)
async def delete_saved_search(
    search_id: str,
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """Delete a saved search"""
    success = await remove_saved_search(current_user.id, search_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved search not found"
        )
    
    return {"message": "Saved search deleted successfully"}

@router.get("/search-history", response_model=List[SearchHistory])
async def get_search_history(
    limit: int = 20,
    current_user: Annotated[User, Depends(get_current_active_user)] = None
):
    """Get user's search history"""
    user_db = await get_user_by_email(current_user.email)
    # Return most recent searches first
    return sorted(user_db.search_history, key=lambda x: x.search_timestamp, reverse=True)[:limit]

@router.get("/saved-searches", response_model=List[SavedSearch])
async def get_saved_searches(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    """Get user's saved searches"""
    user_db = await get_user_by_email(current_user.email)
    # Return most recent saved searches first
    return sorted(user_db.saved_searches, key=lambda x: x.created_at, reverse=True)

@router.post("/logout", response_model=dict)
async def logout_user():
    """Logout user (client-side token removal)"""
    return {"message": "Logged out successfully. Please remove the token from client storage."}

@router.get("/health")
async def auth_health_check():
    """Health check for authentication service"""
    return {"status": "healthy", "service": "authentication"}

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

@router.get("/google/status")
async def google_auth_status():
    """Check if Google authentication is available"""
    import os
    return {
        "available": is_google_auth_configured(),
        "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:5173/auth/google/callback")
    } 