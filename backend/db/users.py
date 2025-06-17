import sqlite3
import uuid
import json
from datetime import datetime
from typing import Optional, List
from ..models.user import UserCreate, UserDB, UserUpdate, SavedSearch, SearchHistory, FrequentFlyerProgram, FlightPreference

DATABASE_URL = "users.db"

def get_db_connection():
    conn = sqlite3.connect(DATABASE_URL)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    
    # Create users table with expanded fields
    conn.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        hashed_password TEXT NOT NULL,
        google_id TEXT UNIQUE,
        avatar_url TEXT,
        is_email_verified BOOLEAN DEFAULT 0,
        points_balance INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        is_active BOOLEAN DEFAULT 1,
        is_admin BOOLEAN DEFAULT 0,
        preferred_airport TEXT,
        frequent_flyer_programs TEXT DEFAULT '[]',
        flight_preferences TEXT,
        saved_searches TEXT DEFAULT '[]',
        search_history TEXT DEFAULT '[]'
    )
    ''')
    
    # Add Google authentication columns if they don't exist (for existing databases)
    try:
        conn.execute('ALTER TABLE users ADD COLUMN google_id TEXT UNIQUE')
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    try:
        conn.execute('ALTER TABLE users ADD COLUMN avatar_url TEXT')
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    try:
        conn.execute('ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT 0')
    except sqlite3.OperationalError:
        pass  # Column already exists
    
    # Create indexes for performance
    conn.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id)')
    
    conn.commit()
    conn.close()

def serialize_user_data(user_data: dict) -> UserDB:
    """Convert database row to UserDB model with proper JSON parsing"""
    # Parse JSON fields
    if user_data.get('frequent_flyer_programs'):
        try:
            ffp_data = json.loads(user_data['frequent_flyer_programs'])
            user_data['frequent_flyer_programs'] = [FrequentFlyerProgram(**ffp) for ffp in ffp_data]
        except (json.JSONDecodeError, TypeError):
            user_data['frequent_flyer_programs'] = []
    else:
        user_data['frequent_flyer_programs'] = []
    
    if user_data.get('flight_preferences'):
        try:
            fp_data = json.loads(user_data['flight_preferences'])
            user_data['flight_preferences'] = FlightPreference(**fp_data)
        except (json.JSONDecodeError, TypeError):
            user_data['flight_preferences'] = None
    else:
        user_data['flight_preferences'] = None
    
    if user_data.get('saved_searches'):
        try:
            ss_data = json.loads(user_data['saved_searches'])
            user_data['saved_searches'] = [SavedSearch(**ss) for ss in ss_data]
        except (json.JSONDecodeError, TypeError):
            user_data['saved_searches'] = []
    else:
        user_data['saved_searches'] = []
    
    if user_data.get('search_history'):
        try:
            sh_data = json.loads(user_data['search_history'])
            user_data['search_history'] = [SearchHistory(**sh) for sh in sh_data]
        except (json.JSONDecodeError, TypeError):
            user_data['search_history'] = []
    else:
        user_data['search_history'] = []
    
    return UserDB(**user_data)

async def get_user_by_email(email: str) -> Optional[UserDB]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user_data = cursor.fetchone()
    conn.close()
    
    if user_data:
        return serialize_user_data(dict(user_data))
    return None

async def get_user_by_id(user_id: str) -> Optional[UserDB]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user_data = cursor.fetchone()
    conn.close()
    
    if user_data:
        return serialize_user_data(dict(user_data))
    return None

async def create_user(user_data: UserCreate, hashed_password: str) -> UserDB:
    user_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    
    # Serialize complex fields to JSON
    frequent_flyer_programs_json = json.dumps([ffp.dict() for ffp in user_data.frequent_flyer_programs])
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        """INSERT INTO users 
        (id, full_name, email, hashed_password, google_id, avatar_url, is_email_verified, 
         created_at, updated_at, preferred_airport, frequent_flyer_programs) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        (user_id, user_data.full_name, user_data.email, hashed_password, 
         getattr(user_data, 'google_id', None), getattr(user_data, 'avatar_url', None), 
         getattr(user_data, 'is_email_verified', False), now, now, 
         user_data.preferred_airport, frequent_flyer_programs_json)
    )
    conn.commit()
    conn.close()
    
    return await get_user_by_email(user_data.email)

async def update_user(user_id: str, user_update: UserUpdate) -> Optional[UserDB]:
    # Get existing user
    existing_user = await get_user_by_id(user_id)
    if not existing_user:
        return None
    
    now = datetime.utcnow().isoformat()
    update_fields = []
    update_values = []
    
    if user_update.full_name is not None:
        update_fields.append("full_name = ?")
        update_values.append(user_update.full_name)
    
    if user_update.preferred_airport is not None:
        update_fields.append("preferred_airport = ?")
        update_values.append(user_update.preferred_airport)
    
    if user_update.frequent_flyer_programs is not None:
        update_fields.append("frequent_flyer_programs = ?")
        update_values.append(json.dumps([ffp.dict() for ffp in user_update.frequent_flyer_programs]))
    
    if user_update.flight_preferences is not None:
        update_fields.append("flight_preferences = ?")
        update_values.append(json.dumps(user_update.flight_preferences.dict()))
    
    if not update_fields:
        return existing_user
    
    update_fields.append("updated_at = ?")
    update_values.append(now)
    update_values.append(user_id)
    
    conn = get_db_connection()
    cursor = conn.cursor()
    query = f"UPDATE users SET {', '.join(update_fields)} WHERE id = ?"
    cursor.execute(query, update_values)
    conn.commit()
    conn.close()
    
    return await get_user_by_id(user_id)

async def add_search_to_history(user_id: str, search: SearchHistory) -> bool:
    user = await get_user_by_id(user_id)
    if not user:
        return False
    
    # Add new search to history (keep last 100 searches)
    search_history = user.search_history[-99:] + [search]
    search_history_json = json.dumps([sh.dict() for sh in search_history])
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE users SET search_history = ?, updated_at = ? WHERE id = ?",
        (search_history_json, datetime.utcnow().isoformat(), user_id)
    )
    conn.commit()
    conn.close()
    
    return True

async def save_search(user_id: str, search: SavedSearch) -> bool:
    user = await get_user_by_id(user_id)
    if not user:
        return False
    
    # Add new saved search (keep last 50 saved searches)
    saved_searches = user.saved_searches[-49:] + [search]
    saved_searches_json = json.dumps([ss.dict() for ss in saved_searches])
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE users SET saved_searches = ?, updated_at = ? WHERE id = ?",
        (saved_searches_json, datetime.utcnow().isoformat(), user_id)
    )
    conn.commit()
    conn.close()
    
    return True

async def remove_saved_search(user_id: str, search_id: str) -> bool:
    user = await get_user_by_id(user_id)
    if not user:
        return False
    
    # Remove search by ID
    saved_searches = [ss for ss in user.saved_searches if ss.id != search_id]
    saved_searches_json = json.dumps([ss.dict() for ss in saved_searches])
    
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE users SET saved_searches = ?, updated_at = ? WHERE id = ?",
        (saved_searches_json, datetime.utcnow().isoformat(), user_id)
    )
    conn.commit()
    conn.close()
    
    return True

async def update_points_balance(user_id: str, points_delta: int) -> Optional[UserDB]:
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE users SET points_balance = points_balance + ?, updated_at = ? WHERE id = ?",
        (points_delta, datetime.utcnow().isoformat(), user_id)
    )
    conn.commit()
    conn.close()
    
    if cursor.rowcount > 0:
        return await get_user_by_id(user_id)
    return None 