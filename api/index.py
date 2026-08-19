import os
import sys

# Ensure root directory is on Python search path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

os.environ["VERCEL"] = "1"

try:
    from backend.main import app
    handler = app
except Exception as e:
    # Emergency fallback ASGI app in case of unexpected runtime import failure
    from fastapi import FastAPI
    app = FastAPI(title="CHARUSAT AI Assistant - Fallback")
    
    @app.get("/api/v1/health")
    @app.get("/api/health")
    @app.get("/")
    async def fallback_health():
        return {"status": "degraded", "error": str(e)}
        
    handler = app
