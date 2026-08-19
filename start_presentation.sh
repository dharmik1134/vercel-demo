#!/usr/bin/env bash
# ==============================================================================
# 🏛️ CHARUSAT AI Assistant - Bulletproof Live Presentation Launcher
# ==============================================================================

# Change to project root directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "================================================================================"
echo "🏛️  CHARUSAT AI ASSISTANT — STARTING PRESENTATION ENVIRONMENT"
echo "================================================================================"

# 1. Clean previous background tasks
echo "🧹 Cleaning previous servers and tunnels..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
pkill -f "cloudflared tunnel" 2>/dev/null || true
pkill -f "pinggy.io" 2>/dev/null || true
pkill -f "localtunnel" 2>/dev/null || true
sleep 1

# 2. Start FastAPI Server
echo "🚀 Starting FastAPI Backend Server on http://localhost:8000..."
PYTHONPATH=. python3 backend/main.py > backend.log 2>&1 &
BACKEND_PID=$!
sleep 2

# Check backend health
if curl -s http://localhost:8000/api/v1/health >/dev/null; then
    echo "✅ Backend is healthy & active (PID: $BACKEND_PID)"
else
    echo "⏳ Waiting 2 more seconds for backend initialization..."
    sleep 2
fi

# 3. Start Pinggy High-Speed HTTPS Tunnel with persistent auto-reconnect
echo "🌐 Starting Direct Public HTTPS Tunnel (Pinggy)..."
(
    while true; do
        ssh -p 443 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R0:localhost:8000 a.pinggy.io > pinggy.log 2>&1
        sleep 2
    done
) &
PINGGY_PID=$!

# 4. Start Cloudflare Tunnel as backup
(
    while true; do
        cloudflared tunnel --url http://localhost:8000 > cloudflared.log 2>&1
        sleep 2
    done
) &
CLOUDFLARE_PID=$!

echo "⏳ Establishing secure HTTPS connections..."
sleep 4

# Extract generated URLs
PINGGY_URL=$(grep -o "https://[a-zA-Z0-9-]*\.run\.pinggy-free\.link" pinggy.log | tail -n 1)
if [ -z "$PINGGY_URL" ]; then
    PINGGY_URL=$(grep -o "https://[a-zA-Z0-9-]*\.free\.pinggy\.net" pinggy.log | tail -n 1)
fi

CF_URL=$(grep -o "https://[a-zA-Z0-9-]*\.trycloudflare\.com" cloudflared.log | tail -n 1)
WIFI_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "127.0.0.1")

echo ""
echo "================================================================================"
echo "🎉 PRESENTATION ENVIRONMENT IS 100% LIVE & ACTIVE!"
echo "================================================================================"
echo ""
echo "📱 1. PRIMARY PUBLIC URL (Share this with friends / evaluators):"
if [ -n "$PINGGY_URL" ]; then
    echo "   👉 Starting Login Screen:  $PINGGY_URL/?login=true"
    echo "   👉 Direct Workspace:       $PINGGY_URL"
    echo "   👉 e-Gov Floating Bot:     $PINGGY_URL/egovernance"
else
    echo "   👉 Starting Login Screen:  $CF_URL/?login=true"
    echo "   👉 Direct Workspace:       $CF_URL"
    echo "   👉 e-Gov Floating Bot:     $CF_URL/egovernance"
fi
echo ""
echo "📶 2. SAME WI-FI / MOBILE HOTSPOT (Ultra-fast 0ms latency):"
echo "   👉 http://$WIFI_IP:8000/?login=true"
echo ""
echo "💻 3. THIS MAC (Localhost):"
echo "   👉 http://localhost:8000/?login=true"
echo ""
if [ -n "$CF_URL" ]; then
    echo "☁️  4. BACKUP CLOUDFLARE URL:"
    echo "   👉 $CF_URL/?login=true"
fi
echo ""
echo "================================================================================"
echo "💡 IMPORTANT: Keep this terminal window open during your entire presentation."
echo "   This URL will stay alive continuously until you press Ctrl+C."
echo "================================================================================"
echo ""

# Automated Heartbeat Monitor: Checks every 20 seconds and keeps alive indefinitely
while true; do
    sleep 20
    # Check if backend is alive
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "⚠️ Restarting backend..."
        PYTHONPATH=. python3 backend/main.py > backend.log 2>&1 &
        BACKEND_PID=$!
    fi
    # Check if tunnel is alive
    if ! kill -0 $PINGGY_PID 2>/dev/null; then
        ssh -p 443 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R0:localhost:8000 a.pinggy.io > pinggy.log 2>&1 &
        PINGGY_PID=$!
    fi
done
