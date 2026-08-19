#!/usr/bin/env bash
# ==============================================================================
# CHARUSAT AI Assistant - 1-Click Live Presentation Launcher
# ==============================================================================

echo "========================================================"
echo "🏛️  CHARUSAT AI Assistant - Starting Live Presentation System"
echo "========================================================"

# Kill any lingering ports
echo "🧹 Cleaning previous processes on port 8000..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
pkill -f "cloudflared tunnel" 2>/dev/null || true

# Change to project root directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Start FastAPI Backend in background
echo "🚀 Starting FastAPI Backend Server on http://localhost:8000..."
PYTHONPATH=. python3 backend/main.py > backend.log 2>&1 &
BACKEND_PID=$!

# Wait 2 seconds for backend to initialize
sleep 2

# Check if backend is alive
if curl -s http://localhost:8000/api/v1/health >/dev/null; then
    echo "✅ Backend is healthy and running (PID: $BACKEND_PID)"
else
    echo "⚠️ Backend taking time to start, waiting 2 more seconds..."
    sleep 2
fi

# Start Cloudflare Tunnel
echo "🌐 Launching Cloudflare Live Tunnel..."
cloudflared tunnel --url http://localhost:8000 > cloudflared.log 2>&1 &
CLOUDFLARE_PID=$!

echo "⏳ Generating Live Public HTTPS Link..."
sleep 4

# Extract URL from logs
TUNNEL_URL=$(grep -o "https://[a-zA-Z0-9-]*\.trycloudflare\.com" cloudflared.log | tail -n 1)

echo "========================================================"
echo "🎉 PRESENTATION SYSTEM IS LIVE & READY!"
echo "========================================================"
echo "📍 Local Web App:     http://localhost:8000"
echo "🌍 Public Cloudflare: $TUNNEL_URL"
echo "========================================================"
echo "👉 Share the Public Cloudflare link with your friends / evaluators."
echo "💡 Keep this terminal window open during your presentation."
echo "   Press Ctrl+C anytime to stop."
echo "========================================================"

# Keep alive until user stops
wait
