#!/bin/bash

# AeroPoints Sharing Stop Script
# Cleanly stops all tunneling and development services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

print_header() {
    echo -e "\n${RED}════════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}                        🛑 STOPPING AEROPOINTS SHARING 🛑${NC}"
    echo -e "${RED}════════════════════════════════════════════════════════════════════════════════${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_header

print_info "Stopping all AeroPoints sharing services..."

# Stop ngrok tunnels
print_info "Stopping ngrok tunnels..."
pkill -f "ngrok http" && print_success "ngrok tunnels stopped" || print_info "No ngrok tunnels found"

# Stop tunnel monitor
if [ -f "$SCRIPT_DIR/.monitor.pid" ]; then
    MONITOR_PID=$(cat "$SCRIPT_DIR/.monitor.pid")
    kill $MONITOR_PID 2>/dev/null && print_success "Tunnel monitor stopped" || print_info "Monitor already stopped"
    rm -f "$SCRIPT_DIR/.monitor.pid"
fi

# Stop frontend server (optional - user might want to keep it running)
read -p "🤔 Stop frontend development server? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "$SCRIPT_DIR/.frontend.pid" ]; then
        FRONTEND_PID=$(cat "$SCRIPT_DIR/.frontend.pid")
        kill $FRONTEND_PID 2>/dev/null && print_success "Frontend server stopped" || print_info "Frontend already stopped"
        rm -f "$SCRIPT_DIR/.frontend.pid"
    else
        pkill -f "npm run dev" && print_success "Frontend server stopped" || print_info "No frontend server found"
    fi
else
    print_info "Frontend server left running"
fi

# Stop backend server (optional - user might want to keep it running)
read -p "🤔 Stop backend API server? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if [ -f "$SCRIPT_DIR/.backend.pid" ]; then
        BACKEND_PID=$(cat "$SCRIPT_DIR/.backend.pid")
        kill $BACKEND_PID 2>/dev/null && print_success "Backend server stopped" || print_info "Backend already stopped"
        rm -f "$SCRIPT_DIR/.backend.pid"
    else
        pkill -f "uvicorn.*api_server" && print_success "Backend server stopped" || print_info "No backend server found"
    fi
else
    print_info "Backend server left running"
fi

# Clean up temporary files
print_info "Cleaning up temporary files..."
rm -f "$SCRIPT_DIR/.active-tunnels"
rm -f "$SCRIPT_DIR/.frontend-tunnel.pid"
rm -f "$SCRIPT_DIR/.backend-tunnel.pid"
rm -f "$SCRIPT_DIR/tunnel-monitor.sh"

print_success "AeroPoints sharing stopped successfully!"
echo -e "\n${YELLOW}💡 To restart sharing, run: ./share-website.sh${NC}"
echo -e "${YELLOW}💡 Local servers may still be running on localhost:5174 and localhost:8000${NC}\n" 