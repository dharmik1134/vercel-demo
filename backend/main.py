import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse, FileResponse
import os

from backend.config import settings
from backend.routes import router as api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent AI Assistant for Charotar University of Science and Technology (CHARUSAT)"
)

# Enable CORS for cross-device & network access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount frontend static files
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
if os.path.exists(frontend_dir):
    # Mount primary custom path: /charusatAIassistant
    app.mount("/charusatAIassistant", StaticFiles(directory=frontend_dir, html=True), name="charusat_assistant")
    # Mount aliases for convenience
    app.mount("/app", StaticFiles(directory=frontend_dir, html=True), name="frontend_app")
    app.mount("/charusatai", StaticFiles(directory=frontend_dir, html=True), name="frontend_ai")
    app.mount("/charusat-ai", StaticFiles(directory=frontend_dir, html=True), name="frontend_dash")

@app.get("/sitemap.xml")
async def sitemap():
    """Serve sitemap for search engines."""
    sitemap_file = os.path.join(frontend_dir, "sitemap.xml")
    if os.path.exists(sitemap_file):
        return FileResponse(sitemap_file, media_type="application/xml")
    return RedirectResponse(url="/charusatAIassistant/sitemap.xml")

@app.get("/google3a438eaced72a38f.html")
async def google_verification():
    """Serve Google Search Console verification HTML file."""
    v_file = os.path.join(frontend_dir, "google3a438eaced72a38f.html")
    if os.path.exists(v_file):
        return FileResponse(v_file, media_type="text/html")
    return "google-site-verification: google3a438eaced72a38f.html"

@app.get("/robots.txt")
async def robots():
    """Serve robots.txt for Googlebot and search crawlers."""
    robots_file = os.path.join(frontend_dir, "robots.txt")
    if os.path.exists(robots_file):
        return FileResponse(robots_file, media_type="text/plain")
    return RedirectResponse(url="/charusatAIassistant/robots.txt")

@app.get("/")
async def root():
    """Serve primary web app at root."""
    index_file = os.path.join(frontend_dir, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return RedirectResponse(url="/charusatAIassistant")

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=settings.DEBUG
    )
