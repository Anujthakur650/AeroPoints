@echo off
REM AeroPoints Website Sharing Script for Windows
REM Makes local development environment accessible externally via tunnels

setlocal EnableDelayedExpansion

REM Configuration
set FRONTEND_PORT=5174
set BACKEND_PORT=8000
set SCRIPT_DIR=%~dp0
set CONFIG_FILE=%SCRIPT_DIR%share-config.json
set TUNNELS_FILE=%SCRIPT_DIR%.active-tunnels

REM Colors for output (Windows compatible)
echo.
echo ================================================================================
echo                           🚀 AEROPOINTS SHARING SYSTEM 🚀
echo ================================================================================
echo.

echo ℹ️  Starting AeroPoints sharing system...
echo ℹ️  This will make your local development environment publicly accessible
echo.

REM Check if required tools are installed
echo ▶ Checking Dependencies
echo ──────────────────────────────────────────────────────────────────────────────
where node >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Node.js not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ npm not found. Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ❌ Python not found. Please install Python from https://python.org/
    pause
    exit /b 1
)

echo ✅ All dependencies found
echo.

REM Check if ports are available
echo ▶ Checking Port Availability
echo ──────────────────────────────────────────────────────────────────────────────
netstat -an | findstr :%FRONTEND_PORT% >nul
if %ERRORLEVEL% equ 0 (
    echo ℹ️  Frontend port %FRONTEND_PORT% is in use (expected if dev server running)
) else (
    echo ⚠️  Frontend port %FRONTEND_PORT% is not in use - will start dev server
)

netstat -an | findstr :%BACKEND_PORT% >nul
if %ERRORLEVEL% equ 0 (
    echo ℹ️  Backend port %BACKEND_PORT% is in use (expected if API server running)
) else (
    echo ⚠️  Backend port %BACKEND_PORT% is not in use - will start API server
)
echo.

REM Install ngrok if not present
where ngrok >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo ▶ Installing ngrok
    echo ──────────────────────────────────────────────────────────────────────────────
    echo ❌ ngrok not found. Please install ngrok:
    echo    1. Download from https://ngrok.com/download
    echo    2. Extract to a folder in your PATH
    echo    3. Or use chocolatey: choco install ngrok
    pause
    exit /b 1
) else (
    echo ✅ ngrok already installed
)
echo.

REM Start development servers
echo ▶ Starting Development Servers
echo ──────────────────────────────────────────────────────────────────────────────

REM Check if frontend is running
netstat -an | findstr :%FRONTEND_PORT% >nul
if %ERRORLEVEL% neq 0 (
    echo ℹ️  Starting frontend development server...
    start "AeroPoints Frontend" cmd /k "npm run dev"
    timeout /t 5 /nobreak >nul
    
    netstat -an | findstr :%FRONTEND_PORT% >nul
    if %ERRORLEVEL% equ 0 (
        echo ✅ Frontend server started on port %FRONTEND_PORT%
    ) else (
        echo ❌ Failed to start frontend server
        pause
        exit /b 1
    )
) else (
    echo ✅ Frontend server already running on port %FRONTEND_PORT%
)

REM Check if backend is running
netstat -an | findstr :%BACKEND_PORT% >nul
if %ERRORLEVEL% neq 0 (
    echo ℹ️  Starting backend API server...
    start "AeroPoints Backend" cmd /k "cd backend && uvicorn api_server:app --host 0.0.0.0 --port %BACKEND_PORT% --reload"
    timeout /t 5 /nobreak >nul
    
    netstat -an | findstr :%BACKEND_PORT% >nul
    if %ERRORLEVEL% equ 0 (
        echo ✅ Backend server started on port %BACKEND_PORT%
    ) else (
        echo ❌ Failed to start backend server
        pause
        exit /b 1
    )
) else (
    echo ✅ Backend server already running on port %BACKEND_PORT%
)
echo.

REM Start ngrok tunnels
echo ▶ Starting ngrok Tunnels
echo ──────────────────────────────────────────────────────────────────────────────

REM Kill existing tunnels
taskkill /f /im ngrok.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Start frontend tunnel
echo ℹ️  Starting frontend tunnel (port %FRONTEND_PORT%)...
start "ngrok-frontend" ngrok http %FRONTEND_PORT% --subdomain=aeropoints-app

REM Start backend tunnel
echo ℹ️  Starting backend tunnel (port %BACKEND_PORT%)...
start "ngrok-backend" ngrok http %BACKEND_PORT% --subdomain=aeropoints-api

REM Wait for tunnels to initialize
echo ℹ️  Waiting for tunnels to initialize...
timeout /t 8 /nobreak >nul

echo ✅ ngrok tunnels started
echo.

REM Get tunnel URLs from ngrok API
echo ▶ Retrieving Tunnel URLs
echo ──────────────────────────────────────────────────────────────────────────────

REM Wait for ngrok API to be ready
set RETRY_COUNT=0
:wait_for_ngrok
if %RETRY_COUNT% gtr 10 (
    echo ❌ Could not connect to ngrok API
    pause
    exit /b 1
)

curl -s http://localhost:4040/api/tunnels >nul 2>&1
if %ERRORLEVEL% neq 0 (
    set /a RETRY_COUNT+=1
    timeout /t 2 /nobreak >nul
    goto wait_for_ngrok
)

REM Extract URLs using PowerShell
for /f "delims=" %%i in ('powershell -command "(Invoke-RestMethod http://localhost:4040/api/tunnels).tunnels | Where-Object {$_.config.addr -like '*:5174'} | Select-Object -ExpandProperty public_url"') do set FRONTEND_URL=%%i
for /f "delims=" %%i in ('powershell -command "(Invoke-RestMethod http://localhost:4040/api/tunnels).tunnels | Where-Object {$_.config.addr -like '*:8000'} | Select-Object -ExpandProperty public_url"') do set BACKEND_URL=%%i

REM Save URLs to file
echo FRONTEND_URL=%FRONTEND_URL% > "%TUNNELS_FILE%"
echo BACKEND_URL=%BACKEND_URL% >> "%TUNNELS_FILE%"
echo CREATED_AT=%DATE% %TIME% >> "%TUNNELS_FILE%"

if not "%FRONTEND_URL%"=="" if not "%BACKEND_URL%"=="" (
    echo ✅ Tunnel URLs retrieved successfully
) else (
    echo ⚠️  Some tunnel URLs could not be retrieved
)
echo.

REM Display sharing information
echo ▶ 🌐 AeroPoints Website is Now Publicly Accessible!
echo ──────────────────────────────────────────────────────────────────────────────
echo.
echo 🎯 FRONTEND (Main Website):
echo    %FRONTEND_URL%
echo    React + Vite development server with premium UI
echo.
echo 🔧 BACKEND (API Server):
echo    %BACKEND_URL%
echo    FastAPI server with authentication and flight search
echo.
echo 📊 API Documentation:
echo    %BACKEND_URL%/docs
echo    Interactive Swagger API documentation
echo.
echo 🎮 DEMO ACCOUNT:
echo    Email: demo@aeropoints.com
echo    Password: Demo123!
echo    Use this account for testing authentication
echo.
echo ✨ CURRENT FEATURES:
echo    • User authentication (register/login/settings)
echo    • Real-time flight search with seats.aero API
echo    • Airport autocomplete with 28k+ airports
echo    • Premium dark glassmorphism theme
echo    • Responsive design for mobile/desktop
echo    • Award flight tracking and comparison
echo.
echo 📋 USAGE INSTRUCTIONS:
echo    1. Visit the frontend URL to access the website
echo    2. Register a new account or use the demo account
echo    3. Search for flights between any airports
echo    4. Explore the settings page and user profile
echo    5. Check API documentation for integration details
echo.
echo 🔗 QUICK ACCESS:
echo    Frontend: %FRONTEND_URL%
echo    Backend:  %BACKEND_URL%
echo.

REM Copy frontend URL to clipboard (Windows)
echo %FRONTEND_URL% | clip
echo ✅ Frontend URL copied to clipboard!
echo.

echo ▶ Cleanup Instructions
echo ──────────────────────────────────────────────────────────────────────────────
echo.
echo To stop all services:
echo    stop-sharing.bat
echo.
echo Or manually:
echo    taskkill /f /im ngrok.exe     # Stop tunnels
echo    # Stop dev servers in their command windows
echo.
echo Logs and monitoring:
echo    http://localhost:4040         # ngrok dashboard
echo    node tunnel-status.js         # Status monitor
echo.

echo 🎉 SUCCESS! AeroPoints is now shared and accessible externally
echo Keep ngrok windows open to maintain the tunnels
echo Press any key to open ngrok dashboard...
pause >nul

start http://localhost:4040

echo.
echo Press any key to exit this script (tunnels will continue running)...
pause >nul 