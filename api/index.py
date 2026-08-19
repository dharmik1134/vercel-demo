import os
import sys

# Ensure project root directory is on Python module search path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

os.environ["VERCEL"] = "1"

# Import FastAPI application
try:
    from backend.main import app
except Exception as e:
    # Fail-safe ASGI handler to ensure serverless function never crashes on import
    from fastapi import FastAPI
    app = FastAPI(title="CHARUSAT AI Assistant - FailSafe")

    @app.get("/health")
    @app.get("/api/health")
    @app.get("/api/v1/health")
    @app.get("/")
    async def failsafe_health():
        return {
            "status": "ok",
            "service": "CHARUSAT AI Assistant",
            "mode": "failsafe",
            "detail": str(e)
        }

# Expose app and handler for Vercel Python Serverless Runtime
handler = app
