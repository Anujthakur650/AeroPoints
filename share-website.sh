#!/bin/bash

# AeroPoints Website Sharing Script
# Makes local development environment accessible externally via tunnels

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/share-config.json"
FRONTEND_PORT=5174
BACKEND_PORT=8000
TUNNELS_FILE="$SCRIPT_DIR/.active-tunnels"

# Function to print colored output
print_header() {
    echo -e "\n${PURPLE}════════════════════════════════════════════════════════════════════════════════${NC}"
    echo -e "${PURPLE}                           🚀 AEROPOINTS SHARING SYSTEM 🚀${NC}"
    echo -e "${PURPLE}════════════════════════════════════════════════════════════════════════════════${NC}\n"
}

print_section() {
    echo -e "\n${CYAN}▶ $1${NC}"
    echo -e "${CYAN}$(printf '─%.0s' {1..80})${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_section "Checking Dependencies"
    
    local missing_deps=()
    
    if ! command -v node &> /dev/null; then
        missing_deps+=("node")
    fi
    
    if ! command -v npm &> /dev/null; then
        missing_deps+=("npm")
    fi
    
    if ! command -v python &> /dev/null; then
        missing_deps+=("python")
    fi
    
    if [ ${#missing_deps[@]} -ne 0 ]; then
        print_error "Missing required dependencies: ${missing_deps[*]}"
        exit 1
    fi
    
    print_success "All dependencies found"
}

# Check if ports are available
check_ports() {
    print_section "Checking Port Availability"
    
    if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null ; then
        print_info "Frontend port $FRONTEND_PORT is in use (expected if dev server running)"
    else
        print_warning "Frontend port $FRONTEND_PORT is not in use - will start dev server"
    fi
    
    if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null ; then
        print_info "Backend port $BACKEND_PORT is in use (expected if API server running)"
    else
        print_warning "Backend port $BACKEND_PORT is not in use - will start API server"
    fi
}

# Install ngrok if not present
install_ngrok() {
    if ! command -v ngrok &> /dev/null; then
        print_section "Installing ngrok"
        
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if command -v brew &> /dev/null; then
                brew install ngrok/ngrok/ngrok
            else
                print_error "Please install Homebrew or manually install ngrok from https://ngrok.com/download"
                exit 1
            fi
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux
            curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | \
                sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
                echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | \
                sudo tee /etc/apt/sources.list.d/ngrok.list && \
                sudo apt update && sudo apt install ngrok
        else
            print_error "Unsupported OS. Please manually install ngrok from https://ngrok.com/download"
            exit 1
        fi
        
        print_success "ngrok installed"
    else
        print_success "ngrok already installed"
    fi
}

# Start development servers
start_servers() {
    print_section "Starting Development Servers"
    
    # Check if frontend is running
    if ! lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null ; then
        print_info "Starting frontend development server..."
        npm run dev > /dev/null 2>&1 &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > "$SCRIPT_DIR/.frontend.pid"
        sleep 5
        
        if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null ; then
            print_success "Frontend server started on port $FRONTEND_PORT"
        else
            print_error "Failed to start frontend server"
            exit 1
        fi
    else
        print_success "Frontend server already running on port $FRONTEND_PORT"
    fi
    
    # Check if backend is running
    if ! lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null ; then
        print_info "Starting backend API server..."
        cd backend
        uvicorn api_server:app --host 0.0.0.0 --port $BACKEND_PORT --reload > /dev/null 2>&1 &
        BACKEND_PID=$!
        echo $BACKEND_PID > "$SCRIPT_DIR/.backend.pid"
        cd ..
        sleep 5
        
        if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null ; then
            print_success "Backend server started on port $BACKEND_PORT"
        else
            print_error "Failed to start backend server"
            exit 1
        fi
    else
        print_success "Backend server already running on port $BACKEND_PORT"
    fi
}

# Start ngrok tunnels
start_tunnels() {
    print_section "Starting ngrok Tunnels"
    
    # Kill existing tunnels
    pkill -f "ngrok http" || true
    sleep 2
    
    # Start frontend tunnel
    print_info "Starting frontend tunnel (port $FRONTEND_PORT)..."
    ngrok http $FRONTEND_PORT --subdomain=aeropoints-app > /dev/null 2>&1 &
    FRONTEND_TUNNEL_PID=$!
    echo $FRONTEND_TUNNEL_PID > "$SCRIPT_DIR/.frontend-tunnel.pid"
    
    # Start backend tunnel
    print_info "Starting backend tunnel (port $BACKEND_PORT)..."
    ngrok http $BACKEND_PORT --subdomain=aeropoints-api > /dev/null 2>&1 &
    BACKEND_TUNNEL_PID=$!
    echo $BACKEND_TUNNEL_PID > "$SCRIPT_DIR/.backend-tunnel.pid"
    
    # Wait for tunnels to initialize
    print_info "Waiting for tunnels to initialize..."
    sleep 8
    
    print_success "ngrok tunnels started"
}

# Get tunnel URLs from ngrok API
get_tunnel_urls() {
    print_section "Retrieving Tunnel URLs"
    
    # Query ngrok API for active tunnels
    local ngrok_api="http://localhost:4040/api/tunnels"
    local max_retries=10
    local retry_count=0
    
    while [ $retry_count -lt $max_retries ]; do
        if curl -s "$ngrok_api" > /dev/null 2>&1; then
            break
        fi
        retry_count=$((retry_count + 1))
        sleep 2
    done
    
    if [ $retry_count -eq $max_retries ]; then
        print_error "Could not connect to ngrok API"
        return 1
    fi
    
    # Extract URLs
    local tunnels_json=$(curl -s "$ngrok_api")
    
    # Frontend URL
    FRONTEND_URL=$(echo "$tunnels_json" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for tunnel in data.get('tunnels', []):
    if tunnel.get('config', {}).get('addr') == 'http://localhost:$FRONTEND_PORT':
        print(tunnel.get('public_url', ''))
        break
" 2>/dev/null || echo "")
    
    # Backend URL
    BACKEND_URL=$(echo "$tunnels_json" | python3 -c "
import sys, json
data = json.load(sys.stdin)
for tunnel in data.get('tunnels', []):
    if tunnel.get('config', {}).get('addr') == 'http://localhost:$BACKEND_PORT':
        print(tunnel.get('public_url', ''))
        break
" 2>/dev/null || echo "")
    
    # Save URLs to file
    cat > "$TUNNELS_FILE" << EOF
FRONTEND_URL="$FRONTEND_URL"
BACKEND_URL="$BACKEND_URL"
CREATED_AT="$(date)"
EOF
    
    if [ -n "$FRONTEND_URL" ] && [ -n "$BACKEND_URL" ]; then
        print_success "Tunnel URLs retrieved successfully"
        return 0
    else
        print_warning "Some tunnel URLs could not be retrieved"
        return 1
    fi
}

# Generate QR codes for mobile access
generate_qr_codes() {
    if command -v node &> /dev/null && [ -n "$FRONTEND_URL" ]; then
        print_section "Generating QR Code for Mobile Access"
        
        node -e "
        const qr = require('qrcode-terminal');
        console.log('\n📱 Scan QR code for mobile access:');
        qr.generate('$FRONTEND_URL', {small: true});
        " 2>/dev/null || print_info "QR code generation skipped (qrcode-terminal not available)"
    fi
}

# Display sharing information
display_sharing_info() {
    print_section "🌐 AeroPoints Website is Now Publicly Accessible!"
    
    echo -e "\n${GREEN}🎯 FRONTEND (Main Website):${NC}"
    echo -e "   ${CYAN}$FRONTEND_URL${NC}"
    echo -e "   ${YELLOW}React + Vite development server with premium UI${NC}"
    
    echo -e "\n${GREEN}🔧 BACKEND (API Server):${NC}"
    echo -e "   ${CYAN}$BACKEND_URL${NC}"
    echo -e "   ${YELLOW}FastAPI server with authentication and flight search${NC}"
    
    echo -e "\n${GREEN}📊 API Documentation:${NC}"
    echo -e "   ${CYAN}$BACKEND_URL/docs${NC}"
    echo -e "   ${YELLOW}Interactive Swagger API documentation${NC}"
    
    echo -e "\n${GREEN}🎮 DEMO ACCOUNT:${NC}"
    echo -e "   ${CYAN}Email:${NC} demo@aeropoints.com"
    echo -e "   ${CYAN}Password:${NC} Demo123!"
    echo -e "   ${YELLOW}Use this account for testing authentication${NC}"
    
    echo -e "\n${GREEN}✨ CURRENT FEATURES:${NC}"
    echo -e "   • User authentication (register/login/settings)"
    echo -e "   • Real-time flight search with seats.aero API"
    echo -e "   • Airport autocomplete with 28k+ airports"
    echo -e "   • Premium dark glassmorphism theme"
    echo -e "   • Responsive design for mobile/desktop"
    echo -e "   • Award flight tracking and comparison"
    
    echo -e "\n${GREEN}📋 USAGE INSTRUCTIONS:${NC}"
    echo -e "   1. Visit the frontend URL to access the website"
    echo -e "   2. Register a new account or use the demo account"
    echo -e "   3. Search for flights between any airports"
    echo -e "   4. Explore the settings page and user profile"
    echo -e "   5. Check API documentation for integration details"
    
    echo -e "\n${GREEN}🔗 QUICK COPY COMMANDS:${NC}"
    echo -e "   ${YELLOW}Frontend:${NC} echo '$FRONTEND_URL' | pbcopy  ${BLUE}(macOS)${NC}"
    echo -e "   ${YELLOW}Backend:${NC}  echo '$BACKEND_URL' | pbcopy   ${BLUE}(macOS)${NC}"
    
    # Copy frontend URL to clipboard (macOS)
    if command -v pbcopy &> /dev/null; then
        echo "$FRONTEND_URL" | pbcopy
        print_success "Frontend URL copied to clipboard!"
    fi
}

# Monitor tunnel health
monitor_tunnels() {
    print_section "Starting Tunnel Health Monitor"
    
    cat > "$SCRIPT_DIR/tunnel-monitor.sh" << 'EOF'
#!/bin/bash
while true; do
    if ! curl -s http://localhost:4040/api/tunnels > /dev/null; then
        echo "$(date): ngrok tunnels down, attempting restart..."
        pkill -f "ngrok http"
        sleep 3
        ngrok http 5174 --subdomain=aeropoints-app > /dev/null 2>&1 &
        ngrok http 8000 --subdomain=aeropoints-api > /dev/null 2>&1 &
    fi
    sleep 30
done
EOF
    
    chmod +x "$SCRIPT_DIR/tunnel-monitor.sh"
    nohup "$SCRIPT_DIR/tunnel-monitor.sh" > /dev/null 2>&1 &
    MONITOR_PID=$!
    echo $MONITOR_PID > "$SCRIPT_DIR/.monitor.pid"
    
    print_success "Health monitor started (PID: $MONITOR_PID)"
}

# Cleanup function
cleanup() {
    print_section "Cleanup Instructions"
    
    echo -e "\n${YELLOW}To stop all services, run:${NC}"
    echo -e "   ${CYAN}./stop-sharing.sh${NC}"
    echo -e "\n${YELLOW}Or manually:${NC}"
    echo -e "   ${CYAN}pkill -f ngrok${NC}          # Stop tunnels"
    echo -e "   ${CYAN}pkill -f 'npm run dev'${NC}  # Stop frontend"
    echo -e "   ${CYAN}pkill -f uvicorn${NC}        # Stop backend"
    
    echo -e "\n${YELLOW}Logs and monitoring:${NC}"
    echo -e "   ${CYAN}curl http://localhost:4040${NC}    # ngrok dashboard"
    echo -e "   ${CYAN}tail -f ~/.ngrok2/ngrok.log${NC}  # ngrok logs"
}

# Main execution
main() {
    print_header
    
    print_info "Starting AeroPoints sharing system..."
    print_info "This will make your local development environment publicly accessible"
    
    check_dependencies
    check_ports
    install_ngrok
    start_servers
    start_tunnels
    
    if get_tunnel_urls; then
        generate_qr_codes
        display_sharing_info
        monitor_tunnels
        cleanup
        
        echo -e "\n${GREEN}🎉 SUCCESS! AeroPoints is now shared and accessible externally${NC}"
        echo -e "${YELLOW}Keep this terminal open to maintain the tunnels${NC}"
        echo -e "${YELLOW}Press Ctrl+C to stop sharing${NC}\n"
        
        # Keep script running
        trap 'echo -e "\n${YELLOW}Stopping sharing system...${NC}"; exit 0' INT
        while true; do
            sleep 30
            if ! curl -s http://localhost:4040/api/tunnels > /dev/null 2>&1; then
                print_warning "Tunnels appear to be down"
            fi
        done
    else
        print_error "Failed to start tunnels properly"
        exit 1
    fi
}

# Run main function
main "$@" 