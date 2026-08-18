import os

# Load .env file if available
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    if os.path.exists(env_file):
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k, v = k.strip(), v.strip().strip("'\"")
                        if k not in os.environ:
                            os.environ[k] = v
        except Exception:
            pass


try:
    from pydantic import BaseModel
    
    class Settings(BaseModel):
        PROJECT_NAME: str = "CHARUSAT AI Assistant"
        VERSION: str = "1.0.0"
        API_V1_STR: str = "/api/v1"
        
        # Server configs
        HOST: str = os.getenv("HOST", "0.0.0.0")
        PORT: int = int(os.getenv("PORT", "8000"))
        DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
        
        # API Keys
        OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
        GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
        
        # Vector DB & Storage
        CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./database/chroma_db")
        COLLECTION_NAME: str = os.getenv("COLLECTION_NAME", "charusat_knowledge_base")
        SQLITE_DB_PATH: str = os.getenv("SQLITE_DB_PATH", "./database/app.sqlite3")
        
        # OAuth Credentials
        GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "1083928472918-charusat-ai-assistant.apps.googleusercontent.com")
        GITHUB_CLIENT_ID: str = os.getenv("GITHUB_CLIENT_ID", "Ov23liCharusatAI")

        # RAG Settings
        CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "500"))
        CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "50"))
        TOP_K: int = int(os.getenv("TOP_K", "4"))

    settings = Settings()

except ImportError:
    # Graceful fallback dataclass if pydantic is not yet installed in the current environment
    class SettingsFallback:
        PROJECT_NAME: str = "CHARUSAT AI Assistant"
        VERSION: str = "1.0.0"
        API_V1_STR: str = "/api/v1"
        HOST: str = os.getenv("HOST", "0.0.0.0")
        PORT: int = int(os.getenv("PORT", "8000"))
        DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
        OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
        GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
        GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "1083928472918-charusat-ai-assistant.apps.googleusercontent.com")
        GITHUB_CLIENT_ID: str = os.getenv("GITHUB_CLIENT_ID", "Ov23liCharusatAI")
        CHROMA_PERSIST_DIR: str = os.getenv("CHROMA_PERSIST_DIR", "./database/chroma_db")
        COLLECTION_NAME: str = os.getenv("COLLECTION_NAME", "charusat_knowledge_base")
        SQLITE_DB_PATH: str = os.getenv("SQLITE_DB_PATH", "./database/app.sqlite3")
        CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "500"))
        CHUNK_OVERLAP: int = int(os.getenv("CHUNK_OVERLAP", "50"))
        TOP_K: int = int(os.getenv("TOP_K", "4"))

    settings = SettingsFallback()

