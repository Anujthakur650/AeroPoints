# 📱 AeroPoints Mobile Debugging & Troubleshooting Guide

## 🚀 Quick Mobile Access

### Current Live URLs (Updated: June 27, 2025)
- **🌐 Frontend Website**: https://shaggy-drinks-join.loca.lt
- **⚙️ Backend API**: https://afraid-otters-start.loca.lt
- **📚 API Documentation**: https://afraid-otters-start.loca.lt/docs
- **🔧 Mobile Test Page**: https://shaggy-drinks-join.loca.lt/mobile-connectivity-test.html

### 🎯 Tunnel Access Password
**Password**: `98.172.10.237` (Your public IP address)

---

## 🔍 Comprehensive Mobile Fixes Implemented

### 1. 🌐 Dynamic API URL Detection
**Problem**: Frontend was hardcoded to use localhost:8000, failing on mobile tunnels.
**Solution**: Enhanced environment configuration with automatic detection.

**Files Modified**:
- `src/config/environment.ts` - Dynamic API URL detection
- `src/services/api.ts` - Mobile-optimized fetch with retry logic

**Features**:
- ✅ Automatic localhost vs tunnel detection
- ✅ Mobile-specific timeout settings (15s vs 8s)
- ✅ Intelligent retry logic for network errors
- ✅ Enhanced error messages for mobile debugging

### 2. 🔒 Enhanced CORS Configuration
**Problem**: Backend was blocking requests from tunnel domains.
**Solution**: Comprehensive CORS setup for mobile and tunnel environments.

**Files Modified**:
- `backend/api_server.py` - Enhanced CORS with regex patterns

**Features**:
- ✅ Support for all localtunnel subdomains (*.loca.lt)
- ✅ Support for ngrok and other tunnel services
- ✅ Mobile browser compatibility headers
- ✅ Environment-specific origin detection

### 3. 📱 Mobile-Optimized Components
**Problem**: Airport search failing on mobile devices.
**Solution**: Enhanced AirportAutocomplete with mobile-specific features.

**Files Modified**:
- `src/components/AirportAutocomplete.tsx` - Mobile detection and handling

**Features**:
- ✅ Mobile device detection
- ✅ Touch event handling
- ✅ Mobile-specific error handling
- ✅ Enhanced retry logic for slow mobile networks
- ✅ Offline fallback airport data

### 4. 🛠️ Comprehensive Mobile Diagnostics
**Problem**: No way to debug mobile issues remotely.
**Solution**: Complete diagnostic system for mobile debugging.

**Files Created**:
- `mobile-debug.js` - Real-time mobile diagnostics
- `public/mobile-connectivity-test.html` - Standalone test page

**Features**:
- ✅ Real-time on-screen debugging logs
- ✅ API connectivity testing
- ✅ Network performance monitoring
- ✅ Browser compatibility checks
- ✅ Export diagnostic reports

---

## 🧰 Mobile Testing Checklist

### ✅ Pre-Testing Setup
1. **Verify Server Status**:
   ```bash
   # Check if backend is running
   curl -s http://localhost:8000/health
   
   # Check if frontend is running
   curl -s http://localhost:5173
   ```

2. **Verify Tunnel Status**:
   ```bash
   # Check tunnel processes
   ps aux | grep localtunnel | grep -v grep
   
   # Test tunnel connectivity
   curl -s https://shaggy-drinks-join.loca.lt | head -5
   curl -s https://afraid-otters-start.loca.lt/health
   ```

### ✅ Mobile Device Testing
1. **🔍 Run Automatic Diagnostics**:
   - Visit: https://shaggy-drinks-join.loca.lt/mobile-connectivity-test.html
   - Wait for auto-diagnostics to complete
   - Review results and export if needed

2. **🌐 Test Core Functionality**:
   - [ ] Frontend loads without errors
   - [ ] Airport search returns results
   - [ ] Flight search completes successfully
   - [ ] User authentication works
   - [ ] Mobile UI responds to touch

3. **⚠️ Check for Common Issues**:
   - [ ] CORS errors in console
   - [ ] Network timeout errors
   - [ ] API endpoint not found errors
   - [ ] Touch input not working
   - [ ] Slow loading times

---

## 🚨 Common Mobile Issues & Solutions

### Issue 1: "CORS Policy" Error
**Symptoms**: API calls fail with CORS errors in mobile browser console
**Solution**:
```bash
# Restart backend with updated CORS
cd backend
uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload
```

### Issue 2: "Network Request Failed"
**Symptoms**: Airport/flight search shows network errors
**Diagnosis**:
1. Open mobile browser console: `https://shaggy-drinks-join.loca.lt`
2. Try: `fetch('https://afraid-otters-start.loca.lt/health')`
3. Check response

**Solutions**:
- Verify tunnel password: `98.172.10.237`
- Clear mobile browser cache
- Switch mobile network (WiFi ↔ Cellular)

### Issue 3: Airport Search Returns No Results
**Symptoms**: Airport search appears to work but returns empty results
**Diagnosis**:
```javascript
// In mobile browser console
fetch('https://afraid-otters-start.loca.lt/api/airports/search?q=DFW&limit=5')
  .then(r => r.json())
  .then(console.log)
```

**Solutions**:
- Check backend logs for errors
- Verify API endpoint accessibility
- Test with different airport codes

### Issue 4: Touch Input Not Working
**Symptoms**: Dropdown doesn't open on mobile tap
**Solution**: Enhanced touch handling is now implemented with:
- Touch event detection
- Mobile-specific timeouts
- Improved focus handling

---

## 🔧 Advanced Mobile Debugging

### Debug Mobile API Calls
Add to any page to debug API calls:
```javascript
// Enable mobile debugging
if (typeof window !== 'undefined') {
  window.runMobileDiagnostics().then(results => {
    console.log('Mobile Diagnostics:', results);
  });
}
```

### Monitor Network Performance
```javascript
// Check mobile network info
if (navigator.connection) {
  console.log('Network Info:', {
    effectiveType: navigator.connection.effectiveType,
    downlink: navigator.connection.downlink,
    rtt: navigator.connection.rtt
  });
}
```

### Test API Endpoints Directly
```javascript
// Test airport search
fetch('https://afraid-otters-start.loca.lt/api/airports/search?q=LAX&limit=5')
  .then(r => r.json())
  .then(data => console.log('Airport API:', data))
  .catch(err => console.error('Airport API Error:', err));

// Test flight search
fetch('https://afraid-otters-start.loca.lt/api/search-awards?origin=DFW&destination=LAX&date=2025-07-15&cabin_class=economy&passengers=1')
  .then(r => r.json())
  .then(data => console.log('Flight API:', data))
  .catch(err => console.error('Flight API Error:', err));
```

---

## 📊 Mobile Performance Optimization

### Current Optimizations
1. **Increased Timeouts**:
   - Mobile: 15 seconds (vs 8 seconds desktop)
   - Airport search: 10 seconds (vs 5 seconds desktop)

2. **Retry Logic**:
   - Network errors: 3 attempts with exponential backoff
   - Server errors: 2 attempts for mobile devices

3. **Enhanced Error Messages**:
   - Network-specific error detection
   - User-friendly mobile error messages
   - Offline fallback data

4. **Mobile-Specific Headers**:
   - User-Agent detection
   - Mobile browser compatibility
   - Touch event support

---

## 🎯 Mobile Access Instructions

### For End Users
1. **📱 Scan QR Code**: Use your camera app to scan the QR code
2. **🔐 Enter Password**: When prompted, enter `98.172.10.237`
3. **✈️ Search Flights**: Use the search form normally
4. **🆘 Report Issues**: If problems occur, visit the mobile test page

### For Developers
1. **🔍 Run Diagnostics**: Always start with the mobile connectivity test
2. **📝 Check Logs**: Monitor both frontend and backend logs
3. **🔄 Restart Services**: If issues persist, restart backend and tunnels
4. **📊 Export Reports**: Use the diagnostic export feature for analysis

---

## 🚀 Quick Commands for Maintenance

### Restart Everything
```bash
# Kill all processes
pkill -f "vite|uvicorn|localtunnel"

# Restart backend
cd backend && uvicorn api_server:app --host 0.0.0.0 --port 8000 --reload &

# Restart frontend
npm run dev &

# Restart tunnels
npx localtunnel --port 5173 > frontend-tunnel.log 2>&1 &
npx localtunnel --port 8000 > backend-tunnel.log 2>&1 &

# Get new URLs
sleep 5 && cat frontend-tunnel.log backend-tunnel.log
```

### Generate New QR Codes
```bash
# Get current tunnel URLs
FRONTEND_URL=$(cat frontend-tunnel.log | grep "your url is" | cut -d' ' -f4)
BACKEND_URL=$(cat backend-tunnel.log | grep "your url is" | cut -d' ' -f4)

# Generate QR codes
node generate-qr.js $FRONTEND_URL $BACKEND_URL
```

---

## 📞 Support & Troubleshooting

### Real-Time Status
- **Live Status**: https://shaggy-drinks-join.loca.lt/mobile-connectivity-test.html
- **API Health**: https://afraid-otters-start.loca.lt/health
- **API Docs**: https://afraid-otters-start.loca.lt/docs

### Emergency Debugging
If mobile access completely fails:
1. Visit the mobile connectivity test page
2. Run full diagnostics
3. Export the results
4. Check the exported JSON for specific error details

### Contact Information
- **System Status**: All systems operational
- **Last Updated**: June 27, 2025, 10:58 PM
- **Next Maintenance**: As needed

---

*This guide covers all mobile debugging and troubleshooting procedures for the AeroPoints award flight search platform. For additional support, use the built-in diagnostic tools and export reports for detailed analysis.* 