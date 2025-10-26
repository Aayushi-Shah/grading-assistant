#!/bin/bash
# Startup script for the integrated Grading Assistant application

echo "🚀 Starting Integrated Grading Assistant Application"
echo "=================================================="

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Port $1 is already in use - killing existing process"
        lsof -ti:$1 | xargs kill -9 2>/dev/null || true
        sleep 2
    else
        echo "✅ Port $1 is available"
    fi
}

# Kill any existing processes
echo "🧹 Cleaning up existing processes..."
pkill -f "python3 app.py" 2>/dev/null || true

# Check port
echo "🔍 Checking port availability..."
check_port 5001

echo ""
echo "📦 Starting Integrated Backend + Frontend Server..."
echo "=================================================="

# Start the integrated server
cd /Users/aayushi/PSU/MyWork/grading-assistant/backend
source venv/bin/activate
python3 app.py &
SERVER_PID=$!

# Wait for server to start
sleep 3

echo ""
echo "✅ Application Started Successfully!"
echo "===================================="
echo ""
echo "🌐 Frontend: http://localhost:5001"
echo "🔧 Backend API: http://localhost:5001/api/"
echo ""
echo "📋 Available Features:"
echo "  • Beautiful React dashboard with animations"
echo "  • Professor management system"
echo "  • Assignment management"
echo "  • File upload capabilities"
echo "  • Database integration"
echo "  • CORS-enabled API communication"
echo ""
echo "🛑 To stop the application, press Ctrl+C"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping application..."
    kill $SERVER_PID 2>/dev/null || true
    pkill -f "python3 app.py" 2>/dev/null || true
    echo "✅ Application stopped"
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Wait for server
wait $SERVER_PID
