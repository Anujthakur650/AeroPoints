from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum

class CabinClass(str, Enum):
    economy = "economy"
    premium_economy = "premium_economy"
    business = "business"
    first = "first"

class FrequentFlyerProgram(BaseModel):
    airline: str
    program_name: str
    member_number: str
    tier_status: Optional[str] = None

class FlightPreference(BaseModel):
    preferred_cabin: CabinClass = CabinClass.economy
    preferred_airlines: List[str] = []
    preferred_airports: List[str] = []
    max_stops: int = 2
    avoid_red_eye: bool = False

class SavedSearch(BaseModel):
    id: str
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    cabin_class: CabinClass
    passengers: int = 1
    created_at: datetime
    search_name: Optional[str] = None

class SearchHistory(BaseModel):
    id: str
    origin: str
    destination: str
    departure_date: str
    return_date: Optional[str] = None
    cabin_class: CabinClass
    passengers: int
    search_timestamp: datetime
    results_found: int = 0

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    google_id: Optional[str] = None
    avatar_url: Optional[str] = None
    is_email_verified: bool = False
    
class UserCreate(UserBase):
    password: str
    preferred_airport: Optional[str] = None
    frequent_flyer_programs: List[FrequentFlyerProgram] = []
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    preferred_airport: Optional[str] = None
    frequent_flyer_programs: Optional[List[FrequentFlyerProgram]] = None
    flight_preferences: Optional[FlightPreference] = None

class UserDB(UserBase):
    id: str
    hashed_password: str
    created_at: datetime
    updated_at: datetime
    points_balance: int = 0
    is_active: bool = True
    is_admin: bool = False
    preferred_airport: Optional[str] = None
    frequent_flyer_programs: List[FrequentFlyerProgram] = []
    flight_preferences: Optional[FlightPreference] = None
    saved_searches: List[SavedSearch] = []
    search_history: List[SearchHistory] = []
    
    class Config:
        from_attributes = True
        
class User(UserBase):
    id: str
    points_balance: int
    created_at: datetime
    updated_at: datetime
    is_admin: bool = False
    preferred_airport: Optional[str] = None
    frequent_flyer_programs: List[FrequentFlyerProgram] = []
    flight_preferences: Optional[FlightPreference] = None
    saved_searches: List[SavedSearch] = []
    search_history: List[SearchHistory] = []
    
    class Config:
        from_attributes = True

# Token models
class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class TokenData(BaseModel):
    email: Optional[str] = None 