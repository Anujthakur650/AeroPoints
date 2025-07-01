# 🌐 AeroPoints Website Sharing System

> **Share your local development environment instantly with external users, AI models, or stakeholders**

## 🚀 Quick Start

```bash
# 1. Start sharing (one command setup)
./share-website.sh

# 2. Monitor status
node tunnel-status.js

# 3. Stop sharing
./stop-sharing.sh
```

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Current Website State](#current-website-state)
- [Usage Guide](#usage-guide)
- [Monitoring & Management](#monitoring--management)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Advanced Configuration](#advanced-configuration)

## 🎯 Overview

The AeroPoints Sharing System creates secure tunnels that make your local development environment accessible from anywhere on the internet. This preserves the exact current state of your application while enabling:

- **External testing** by stakeholders and testers
- **AI model interaction** for automated testing
- **Mobile device testing** via QR codes
- **Collaborative development** with remote team members
- **Demo presentations** without deployment

## ✨ Features

### 🔗 Tunneling
- **ngrok** integration with custom subdomains
- **LocalTunnel** as fallback option
- **Automatic tunnel management** with health monitoring
- **Real-time URL generation** and QR codes

### 📊 Monitoring
- **Live status dashboard** with tunnel health
- **Server health checks** for frontend and backend
- **Auto-restart** on tunnel failures
- **CLI monitoring tools** with colored output

### 🛡️ Security
- **CORS configuration** for tunnel domains
- **Optional authentication** and IP whitelisting
- **Session management** with configurable timeouts
- **Secure tunnel protocols** (HTTPS by default)

### 📱 Accessibility
- **QR code generation** for mobile testing
- **Responsive design** preserved
- **Cross-platform compatibility**
- **Real-time URL copying** to clipboard

## 🔧 Prerequisites

### Required Software
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**
- **curl** (for health checks)

### System Dependencies
```bash
# macOS (using Homebrew)
brew install node python curl

# Ubuntu/Debian
sudo apt install nodejs npm python3 curl

# Windows (using Chocolatey)
choco install nodejs python curl
```

### Project Dependencies
```bash
# Install tunneling packages
npm install --save-dev ngrok localtunnel concurrently cross-env qrcode-terminal chalk --legacy-peer-deps
```

## 🚀 Setup Instructions

### 1. Initial Setup

```bash
# Clone or navigate to your AeroPoints project
cd /path/to/AwardFlight_Frontend

# Ensure both servers are working locally
npm run dev          # Frontend on port 5174
cd backend && uvicorn api_server:app --port 8000  # Backend on port 8000
```

### 2. Configure ngrok (Recommended)

```bash
# Sign up at https://ngrok.com (free tier available)
# Install ngrok
brew install ngrok/ngrok/ngrok  # macOS
# or download from https://ngrok.com/download

# Authenticate (replace with your token)
ngrok authtoken YOUR_NGROK_TOKEN

# Verify installation
ngrok version
```

### 3. Start Sharing

```bash
# Make scripts executable
chmod +x share-website.sh stop-sharing.sh

# Start the sharing system
./share-website.sh
```

### 4. Access Your Shared Website

The script will display URLs like:
- **Frontend**: `https://aeropoints-app.ngrok.io`
- **Backend**: `https://aeropoints-api.ngrok.io`
- **API Docs**: `https://aeropoints-api.ngrok.io/docs`

## 🎮 Current Website State

### ✅ Active Features
- **User Authentication**
  - Registration with email/password
  - Login with JWT tokens
  - Password reset functionality
  - User profile management

- **Flight Search Engine**
  - Real-time award flight search
  - seats.aero API integration
  - Airport autocomplete (28k+ airports)
  - Multiple cabin classes (economy, business, first)

- **Premium UI/UX**
  - Dark glassmorphism theme
  - Responsive design for mobile/desktop
  - Gold accent color scheme
  - Smooth animations and transitions

- **Settings & Profile**
  - Comprehensive settings page
  - Profile editing capabilities
  - Notification preferences
  - Security settings

### 🗄️ Database State
- **SQLite database** with sample users
- **Working authentication** system
- **Session management** with secure tokens
- **User preferences** storage

### 🔌 API Integration
- **seats.aero** for real-time flight data
- **FastAPI** backend with full documentation
- **RESTful endpoints** for all features
- **CORS enabled** for tunnel access

## 📖 Usage Guide

### For Testing & Development

1. **Access the main website** at the provided frontend URL
2. **Register a new account** or use the demo account:
   - Email: `demo@aeropoints.com`
   - Password: `Demo123!`
3. **Test flight search** with any airport codes (e.g., LAX to JFK)
4. **Explore settings** and user profile features
5. **Check API documentation** at the backend URL + `/docs`

### For Stakeholder Demos

1. **Share the frontend URL** with stakeholders
2. **Provide demo account credentials** for immediate access
3. **Guide them through key features**:
   - Flight search workflow
   - User registration process
   - Settings and profile management
   - Mobile responsiveness

### For AI Model Interaction

1. **Use the backend API URL** for programmatic access
2. **Reference API documentation** at `/docs` endpoint
3. **Authentication endpoints**:
   - `POST /api/auth/register` - User registration
   - `POST /api/auth/token` - Login and get JWT
   - `GET /api/auth/me` - Get user profile
4. **Flight search endpoints**:
   - `GET /api/search-awards` - Search flights
   - `GET /api/airports/search` - Airport autocomplete

## 📊 Monitoring & Management

### Real-time Status Monitor

```bash
# Start the status monitor
node tunnel-status.js

# One-time status check
node tunnel-status.js --once
```

The monitor displays:
- **Tunnel status** and URLs
- **Server health** for frontend/backend
- **QR codes** for mobile access
- **Quick commands** and shortcuts

### Health Endpoints

```bash
# Check backend health
curl https://your-api-url.ngrok.io/health

# Check ngrok dashboard
open http://localhost:4040
```

### Log Monitoring

```bash
# ngrok logs
tail -f ~/.ngrok2/ngrok.log

# Frontend logs (in terminal running npm run dev)
# Backend logs (in terminal running uvicorn)
```

## 🛡️ Security Considerations

### Default Security
- **HTTPS tunnels** by default via ngrok
- **CORS configured** for tunnel domains
- **JWT authentication** for API access
- **No sensitive data** exposed in URLs

### Optional Enhancements
```json
// In share-config.json
{
  "security": {
    "tunnel_auth": true,           // Enable ngrok basic auth
    "rate_limiting": true,         // API rate limiting
    "ip_whitelist": ["1.2.3.4"],  // Restrict access by IP
    "session_duration": "2h"       // Shorter session timeout
  }
}
```

### Best Practices
- **Use demo accounts** for external sharing
- **Monitor access logs** during sharing sessions
- **Disable sharing** when not needed
- **Keep sessions short** for temporary access
- **Don't share sensitive production data**

## 🔧 Troubleshooting

### Common Issues

#### Tunnels Not Starting
```bash
# Check if ngrok is installed
ngrok version

# Check for port conflicts
lsof -i :5174  # Frontend
lsof -i :8000  # Backend
lsof -i :4040  # ngrok dashboard

# Restart with fresh tunnels
pkill -f ngrok
./share-website.sh
```

#### Servers Not Responding
```bash
# Check server status
curl http://localhost:5174  # Frontend
curl http://localhost:8000/health  # Backend

# Restart development servers
npm run dev  # In project root
cd backend && uvicorn api_server:app --port 8000 --reload
```

#### CORS Issues
```bash
# Verify CORS configuration in backend
grep -r "allow_origins" backend/

# Check tunnel URLs match CORS settings
curl -H "Origin: https://your-tunnel.ngrok.io" https://your-api-tunnel.ngrok.io/health
```

#### Authentication Problems
```bash
# Test login endpoint
curl -X POST https://your-api-tunnel.ngrok.io/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"username":"demo@aeropoints.com","password":"Demo123!"}'
```

### Error Messages

| Error | Solution |
|-------|----------|
| `ngrok not found` | Install ngrok: `brew install ngrok/ngrok/ngrok` |
| `Port already in use` | Kill existing processes: `pkill -f "npm run dev"` |
| `Tunnel creation failed` | Check ngrok auth token: `ngrok authtoken YOUR_TOKEN` |
| `CORS error` | Add tunnel domain to CORS whitelist |
| `API 404 errors` | Verify backend is running on port 8000 |

### Recovery Commands

```bash
# Complete reset
./stop-sharing.sh
pkill -f npm
pkill -f uvicorn
pkill -f ngrok
./share-website.sh

# Quick tunnel restart
pkill -f ngrok
ngrok http 5174 --subdomain=aeropoints-app &
ngrok http 8000 --subdomain=aeropoints-api &
```

## ⚙️ Advanced Configuration

### Custom Subdomains

Edit `share-config.json`:
```json
{
  "services": {
    "frontend": {
      "subdomain": "my-custom-app"
    },
    "backend": {
      "subdomain": "my-custom-api"
    }
  }
}
```

### LocalTunnel Fallback

```bash
# If ngrok fails, use localtunnel
npx localtunnel --port 5174 --subdomain aeropoints-app
npx localtunnel --port 8000 --subdomain aeropoints-api
```

### Multiple Environments

```bash
# Development
./share-website.sh

# Staging (different ports)
FRONTEND_PORT=3000 BACKEND_PORT=8001 ./share-website.sh

# Production testing
FRONTEND_PORT=5000 BACKEND_PORT=8002 ./share-website.sh
```

### Environment Variables

```bash
# Set in your shell or .env file
export NGROK_AUTH_TOKEN="your_token_here"
export NGROK_REGION="us"  # or "eu", "ap", etc.
export TUNNEL_SUBDOMAIN_PREFIX="mycompany"
```

## 📞 Support & Contact

### Immediate Help
- **Check logs**: `node tunnel-status.js`
- **Reset everything**: `./stop-sharing.sh && ./share-website.sh`
- **ngrok dashboard**: http://localhost:4040

### Resources
- **ngrok Documentation**: https://ngrok.com/docs
- **LocalTunnel**: https://localtunnel.github.io/www/
- **AeroPoints Issues**: Create an issue in the project repository

---

**🎉 Happy Sharing! Your AeroPoints development environment is now accessible from anywhere in the world.** 