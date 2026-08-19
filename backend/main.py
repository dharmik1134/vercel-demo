import os
import sys

# Ensure project root directory and backend directory are on Python sys.path in Vercel Serverless
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse, RedirectResponse, Response

try:
    from backend.config import settings
    from backend.routes import router as api_router
except ImportError:
    from config import settings
    from routes import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent AI Assistant for Charotar University of Science and Technology (CHARUSAT)"
)

# Enable CORS for cross-origin frontend & mobile requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# 1. Zero-Dependency Health & Status Endpoints (Supports GET & HEAD)
# ------------------------------------------------------------------------------
@app.api_route("/health", methods=["GET", "HEAD"])
@app.api_route("/api/health", methods=["GET", "HEAD"])
@app.api_route("/api/v1/health", methods=["GET", "HEAD"])
async def health():
    """Universal health endpoint requiring zero external dependencies."""
    return {
        "status": "ok",
        "service": "CHARUSAT AI Assistant",
        "version": settings.VERSION
    }

# ------------------------------------------------------------------------------
# 2. Root API / Web Endpoint (Supports GET & HEAD)
# ------------------------------------------------------------------------------
frontend_dir = os.path.join(ROOT_DIR, "frontend")

@app.api_route("/", methods=["GET", "HEAD"])
async def root(request: Request):
    """Serve frontend index.html for browsers or JSON status for API callers."""
    accept = request.headers.get("accept", "")
    index_path = os.path.join(frontend_dir, "index.html")
    if "text/html" in accept and os.path.exists(index_path):
        return FileResponse(index_path, media_type="text/html")
    return {
        "message": "CHARUSAT AI Assistant API is running",
        "status": "ok",
        "service": "CHARUSAT AI Assistant",
        "docs": "/docs"
    }

# ------------------------------------------------------------------------------
# 3. Favicon & Static Asset Fallbacks (Supports GET & HEAD)
# ------------------------------------------------------------------------------
@app.api_route("/favicon.ico", methods=["GET", "HEAD"])
@app.api_route("/favicon.png", methods=["GET", "HEAD"])
@app.api_route("/frontend/favicon.ico", methods=["GET", "HEAD"])
@app.api_route("/frontend/favicon.png", methods=["GET", "HEAD"])
async def favicon():
    """Serve university favicon/logo without crashing."""
    for fname in ["favicon.png", "favicon.ico", "logo.png"]:
        fpath = os.path.join(frontend_dir, fname)
        if os.path.exists(fpath):
            media = "image/png" if fname.endswith(".png") else "image/x-icon"
            return FileResponse(fpath, media_type=media)
    return Response(status_code=204)

@app.api_route("/sitemap.xml", methods=["GET", "HEAD"])
@app.api_route("/frontend/sitemap.xml", methods=["GET", "HEAD"])
async def sitemap():
    sitemap_file = os.path.join(frontend_dir, "sitemap.xml")
    if os.path.exists(sitemap_file):
        return FileResponse(sitemap_file, media_type="application/xml")
    return Response(content="<urlset></urlset>", media_type="application/xml")

@app.api_route("/robots.txt", methods=["GET", "HEAD"])
@app.api_route("/frontend/robots.txt", methods=["GET", "HEAD"])
async def robots():
    robots_file = os.path.join(frontend_dir, "robots.txt")
    if os.path.exists(robots_file):
        return FileResponse(robots_file, media_type="text/plain")
    return Response(content="User-agent: *\nAllow: /", media_type="text/plain")

@app.api_route("/egovernance", methods=["GET", "HEAD"])
@app.api_route("/egov", methods=["GET", "HEAD"])
async def egovernance_portal():
    egov_file = os.path.join(frontend_dir, "egovernance.html")
    if os.path.exists(egov_file):
        return FileResponse(egov_file, media_type="text/html")
    return RedirectResponse(url="/")

@app.api_route("/widget.js", methods=["GET", "HEAD"])
@app.api_route("/frontend/widget.js", methods=["GET", "HEAD"])
async def widget_script():
    w_file = os.path.join(frontend_dir, "widget.js")
    if os.path.exists(w_file):
        return FileResponse(w_file, media_type="application/javascript")
    return Response(content="console.log('CHARUSAT AI widget');", media_type="application/javascript")

# ------------------------------------------------------------------------------
# 4. Mount API Routes
# ------------------------------------------------------------------------------
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router, prefix="/api")

# ------------------------------------------------------------------------------
# 5. Static Files Mounting (Local & Non-Vercel environments)
# ------------------------------------------------------------------------------
if os.path.exists(frontend_dir) and not os.environ.get("VERCEL"):
    app.mount("/charusatAIassistant", StaticFiles(directory=frontend_dir, html=True), name="charusat_assistant")
    app.mount("/app", StaticFiles(directory=frontend_dir, html=True), name="frontend_app")
    app.mount("/frontend", StaticFiles(directory=frontend_dir, html=True), name="frontend_files")

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG
    )
