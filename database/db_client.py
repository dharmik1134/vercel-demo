import os
import sqlite3
import hashlib
import secrets
from typing import Dict, Any, List, Optional

class DBClient:
    """Manages metadata storage, user authentication, query logs, and admin notifications via SQLite."""

    def __init__(self, db_path: str = "./database/app.sqlite3"):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        dir_name = os.path.dirname(self.db_path)
        if dir_name:
            os.makedirs(dir_name, exist_ok=True)
            
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # 1. Main query interaction logs
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS query_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_email TEXT DEFAULT 'guest',
                    query TEXT NOT NULL,
                    answer TEXT NOT NULL,
                    intent TEXT DEFAULT 'query',
                    latency REAL,
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # 2. Flowchart "Notify Admin" table for unmatched or unanswered queries
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS admin_notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    unresolved_query TEXT NOT NULL,
                    reason TEXT NOT NULL,
                    status TEXT DEFAULT 'pending_review',
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)

            # 3. User Authentication Table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    password_hash TEXT,
                    salt TEXT,
                    institute TEXT DEFAULT 'CHARUSAT',
                    provider TEXT DEFAULT 'email',
                    avatar_url TEXT,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()

            # Automatic Schema Migration
            try:
                cursor.execute("ALTER TABLE query_logs ADD COLUMN user_email TEXT DEFAULT 'guest'")
                conn.commit()
            except Exception:
                pass

            try:
                cursor.execute("ALTER TABLE query_logs ADD COLUMN intent TEXT DEFAULT 'query'")
                conn.commit()
            except Exception:
                pass

    def _hash_password(self, password: str, salt: Optional[str] = None) -> tuple[str, str]:
        """Hash password securely using SHA-256 with random salt."""
        if not salt:
            salt = secrets.token_hex(16)
        salted = f"{password}{salt}".encode("utf-8")
        hash_val = hashlib.sha256(salted).hexdigest()
        return hash_val, salt

    def register_user(self, email: str, name: str, password: str, institute: str = "CHARUSAT") -> Dict[str, Any]:
        """Register a new student or faculty member."""
        clean_email = email.strip().lower()
        if not clean_email or not password:
            return {"success": False, "error": "Email and password are required."}

        pwd_hash, salt = self._hash_password(password)

        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO users (email, name, password_hash, salt, institute, provider) VALUES (?, ?, ?, ?, ?, ?)",
                    (clean_email, name.strip(), pwd_hash, salt, institute.strip(), "email")
                )
                conn.commit()
            return {
                "success": True,
                "user": {
                    "email": clean_email,
                    "name": name.strip(),
                    "institute": institute.strip(),
                    "provider": "email"
                }
            }
        except sqlite3.IntegrityError:
            return {"success": False, "error": "An account with this email already exists."}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def authenticate_user(self, email: str, password: str) -> Dict[str, Any]:
        """Authenticate user credentials."""
        clean_email = email.strip().lower()
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute("SELECT email, name, password_hash, salt, institute, provider FROM users WHERE email = ?", (clean_email,))
                user = cursor.fetchone()

                if not user:
                    return {"success": False, "error": "No account found with this email address."}

                if user["provider"] != "email" and not user["password_hash"]:
                    return {"success": False, "error": f"Please sign in using your {user['provider'].capitalize()} account."}

                computed_hash, _ = self._hash_password(password, user["salt"])
                if computed_hash == user["password_hash"]:
                    return {
                        "success": True,
                        "user": {
                            "email": user["email"],
                            "name": user["name"],
                            "institute": user["institute"],
                            "provider": user["provider"]
                        }
                    }
                else:
                    return {"success": False, "error": "Incorrect password. Please try again."}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def social_login_user(self, email: str, name: str, provider: str = "google", avatar_url: Optional[str] = None) -> Dict[str, Any]:
        """Sign in or auto-register via Google / GitHub OAuth."""
        clean_email = email.strip().lower()
        clean_name = name.strip() if name else clean_email.split("@")[0].capitalize()

        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute("SELECT email, name, institute, provider, avatar_url FROM users WHERE email = ?", (clean_email,))
                user = cursor.fetchone()

                if user:
                    return {
                        "success": True,
                        "user": {
                            "email": user["email"],
                            "name": user["name"],
                            "institute": user["institute"],
                            "provider": user["provider"],
                            "avatar_url": user["avatar_url"]
                        }
                    }
                else:
                    # Auto-register new social user
                    cursor.execute(
                        "INSERT INTO users (email, name, institute, provider, avatar_url) VALUES (?, ?, ?, ?, ?)",
                        (clean_email, clean_name, "CHARUSAT", provider, avatar_url)
                    )
                    conn.commit()
                    return {
                        "success": True,
                        "user": {
                            "email": clean_email,
                            "name": clean_name,
                            "institute": "CHARUSAT",
                            "provider": provider,
                            "avatar_url": avatar_url
                        }
                    }
        except Exception as e:
            return {"success": False, "error": str(e)}

    def reset_password(self, email: str) -> Dict[str, Any]:
        """Simulate sending password reset link."""
        clean_email = email.strip().lower()
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT id FROM users WHERE email = ?", (clean_email,))
                if cursor.fetchone():
                    return {"success": True, "message": f"Password reset instructions sent to {clean_email}."}
                return {"success": False, "error": "No registered account found with that email address."}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def log_interaction(self, query: str, answer: str, latency: float, intent: str = "query", user_email: str = "guest") -> bool:
        """Log conversation interaction to SQLite database for analytics."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO query_logs (user_email, query, answer, latency, intent) VALUES (?, ?, ?, ?, ?)",
                    (user_email, query, answer, latency, intent)
                )
                conn.commit()
            return True
        except Exception as e:
            print(f"Error logging to SQLite database: {e}")
            return False

    def notify_admin(self, query: str, reason: str = "No suitable database match") -> bool:
        """Notify Admin for unmatched questions (Flowchart: 'Notify Admin' block)."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute(
                    "INSERT INTO admin_notifications (unresolved_query, reason) VALUES (?, ?)",
                    (query, reason)
                )
                conn.commit()
            return True
        except Exception as e:
            print(f"Error logging admin notification: {e}")
            return False

    def get_admin_notifications(self, limit: int = 20) -> List[Dict[str, Any]]:
        """Retrieve unresolved queries logged for university admin review."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT id, unresolved_query, reason, status, timestamp FROM admin_notifications ORDER BY id DESC LIMIT ?",
                    (limit,)
                )
                rows = cursor.fetchall()
                return [dict(row) for row in rows]
        except Exception as e:
            print(f"Error retrieving admin notifications: {e}")
            return []

    def get_recent_logs(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Retrieve recent interaction logs."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                conn.row_factory = sqlite3.Row
                cursor = conn.cursor()
                cursor.execute(
                    "SELECT id, user_email, query, answer, intent, latency, timestamp FROM query_logs ORDER BY id DESC LIMIT ?",
                    (limit,)
                )
                rows = cursor.fetchall()
                return [dict(row) for row in rows]
        except Exception as e:
            print(f"Error retrieving logs: {e}")
            return []

    def is_connected(self) -> bool:
        """Verify database connectivity."""
        try:
            with sqlite3.connect(self.db_path) as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT 1")
                return True
        except Exception:
            return False
