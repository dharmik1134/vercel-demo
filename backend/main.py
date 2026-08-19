import os
import uvicorn
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse, RedirectResponse, Response

from backend.config import settings
from backend.routes import router as api_router

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
# 1. Zero-Dependency Health & Status Endpoints (Always Return 200 OK)
# ------------------------------------------------------------------------------
@app.get("/health")
@app.get("/api/health")
@app.get("/api/v1/health")
async def health():
    """Universal health endpoint requiring zero external dependencies."""
    return {
        "status": "ok",
        "service": "CHARUSAT AI Assistant",
        "version": settings.VERSION
    }

# ------------------------------------------------------------------------------
# 2. Root API / Web Endpoint
# ------------------------------------------------------------------------------
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend")

@app.get("/")
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
# 3. Favicon & Static Asset Fallbacks
# ------------------------------------------------------------------------------
@app.get("/favicon.ico")
@app.get("/favicon.png")
@app.get("/frontend/favicon.ico")
@app.get("/frontend/favicon.png")
async def favicon():
    """Serve university favicon/logo without crashing."""
    for fname in ["favicon.png", "favicon.ico", "logo.png"]:
        fpath = os.path.join(frontend_dir, fname)
        if os.path.exists(fpath):
            media = "image/png" if fname.endswith(".png") else "image/x-icon"
            return FileResponse(fpath, media_type=media)
    return Response(status_code=204)

@app.get("/sitemap.xml")
@app.get("/frontend/sitemap.xml")
async def sitemap():
    sitemap_file = os.path.join(frontend_dir, "sitemap.xml")
    if os.path.exists(sitemap_file):
        return FileResponse(sitemap_file, media_type="application/xml")
    return Response(content="<urlset></urlset>", media_type="application/xml")

@app.get("/robots.txt")
@app.get("/frontend/robots.txt")
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

@app.get("/widget.js")
@app.get("/frontend/widget.js")
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
