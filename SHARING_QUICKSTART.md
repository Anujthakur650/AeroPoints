# 🚀 AeroPoints Sharing - Quick Start

> **Get your local development environment online in under 5 minutes**

## ⚡ Instant Setup

```bash
# 1. One command to share everything
npm run share

# 2. Monitor status
npm run share:status

# 3. Stop when done
npm run share:stop
```

## 📱 Access Your Shared Website

After running `npm run share`, you'll get URLs like:

- **🌐 Frontend**: `https://aeropoints-app.ngrok.io`
- **⚙️ Backend**: `https://aeropoints-api.ngrok.io`
- **📚 API Docs**: `https://aeropoints-api.ngrok.io/docs`

## 🎮 Demo Accounts

Use these for external testing:

| Email | Password | Purpose |
|-------|----------|---------|
| `demo@aeropoints.com` | `Demo123!` | General demo |
| `tester@aeropoints.com` | `Test123!` | Testing features |
| `ai@aeropoints.com` | `AI123!` | AI model interaction |

## 🖥️ Platform Commands

### macOS/Linux
```bash
npm run share           # Start sharing
npm run share:status    # Check tunnel status  
npm run share:stop      # Stop sharing
```

### Windows
```bash
npm run share:win       # Start sharing
npm run share:status    # Check tunnel status
npm run share:stop:win  # Stop sharing
```

## 🔧 Prerequisites

**Required** (install once):
```bash
# Install ngrok
brew install ngrok/ngrok/ngrok  # macOS
# or download from https://ngrok.com/download

# Get free ngrok token from https://ngrok.com
ngrok authtoken YOUR_TOKEN_HERE
```

**Auto-installed**:
- ✅ Node.js packages already installed
- ✅ Python backend dependencies ready
- ✅ Configuration files created

## 🌟 What Gets Shared

### 🎯 Frontend Features
- **Dark premium UI** with glassmorphism
- **Flight search** with real-time data
- **User authentication** and profiles
- **Settings page** with full functionality
- **Responsive design** for mobile/desktop

### ⚙️ Backend Features
- **FastAPI server** with full documentation
- **Authentication endpoints** (register/login/profile)
- **Flight search API** with seats.aero integration
- **Airport search** with 28k+ airports
- **Real-time data** and caching

## 📊 Current State Preserved

- **Existing users** and authentication
- **Flight search** functionality  
- **Database state** with sample data
- **API integrations** working
- **UI/UX** exactly as developed

## 🎪 Perfect For

- **🤝 Stakeholder demos** - Share URL instantly
- **🧪 External testing** - Get feedback from users
- **🤖 AI model testing** - Automated API interaction
- **📱 Mobile testing** - QR codes for phones
- **👥 Team collaboration** - Remote access

## 🛠️ Troubleshooting

### Quick Fixes
```bash
# Reset everything
npm run share:stop && npm run share

# Check if servers are running
curl http://localhost:5174  # Frontend
curl http://localhost:8000/health  # Backend

# View ngrok dashboard
open http://localhost:4040
```

### Common Issues

| Problem | Solution |
|---------|----------|
| "ngrok not found" | Install: `brew install ngrok/ngrok/ngrok` |
| "Port in use" | Kill: `pkill -f "npm run dev"` |
| "No tunnels" | Get token: `ngrok authtoken YOUR_TOKEN` |
| "CORS error" | Restart: `npm run share:stop && npm run share` |

## 🔐 Security Notes

- **HTTPS tunnels** by default
- **JWT authentication** preserved
- **Demo accounts** for external access
- **No sensitive data** in URLs
- **Session timeouts** respected

## 💡 Pro Tips

1. **Keep terminals open** to maintain tunnels
2. **Copy URLs** from the output for easy sharing
3. **Use QR codes** for mobile device testing
4. **Check ngrok dashboard** at `localhost:4040`
5. **Monitor with** `npm run share:status`

## 📞 Need Help?

- **Status**: `npm run share:status`
- **Logs**: `http://localhost:4040`
- **Reset**: `npm run share:stop && npm run share`
- **Docs**: See `SHARING.md` for detailed guide

---

**🎉 Your AeroPoints development environment is now shared globally!**

*Share the URLs, get feedback, and keep building amazing flight search experiences.* 