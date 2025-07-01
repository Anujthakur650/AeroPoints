@echo off
REM AeroPoints Sharing Stop Script for Windows
REM Cleanly stops all tunneling and development services

setlocal EnableDelayedExpansion

set SCRIPT_DIR=%~dp0

echo.
echo ================================================================================
echo                        🛑 STOPPING AEROPOINTS SHARING 🛑
echo ================================================================================
echo.

echo ℹ️  Stopping all AeroPoints sharing services...
echo.

REM Stop ngrok tunnels
echo ℹ️  Stopping ngrok tunnels...
taskkill /f /im ngrok.exe >nul 2>&1
if %ERRORLEVEL% equ 0 (
    echo ✅ ngrok tunnels stopped
) else (
    echo ℹ️  No ngrok tunnels found
)

REM Clean up temporary files
echo ℹ️  Cleaning up temporary files...
if exist "%SCRIPT_DIR%.active-tunnels" del "%SCRIPT_DIR%.active-tunnels"
if exist "%SCRIPT_DIR%.frontend.pid" del "%SCRIPT_DIR%.frontend.pid"
if exist "%SCRIPT_DIR%.backend.pid" del "%SCRIPT_DIR%.backend.pid"
if exist "%SCRIPT_DIR%.frontend-tunnel.pid" del "%SCRIPT_DIR%.frontend-tunnel.pid"
if exist "%SCRIPT_DIR%.backend-tunnel.pid" del "%SCRIPT_DIR%.backend-tunnel.pid"
if exist "%SCRIPT_DIR%.monitor.pid" del "%SCRIPT_DIR%.monitor.pid"
if exist "%SCRIPT_DIR%tunnel-monitor.sh" del "%SCRIPT_DIR%tunnel-monitor.sh"

REM Ask about stopping servers
echo.
set /p STOP_FRONTEND="🤔 Stop frontend development server? (y/N): "
if /i "%STOP_FRONTEND%"=="y" (
    echo ℹ️  Looking for frontend server processes...
    taskkill /f /fi "WINDOWTITLE eq AeroPoints Frontend*" >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo ✅ Frontend server stopped
    ) else (
        echo ℹ️  Frontend server not found or already stopped
    )
) else (
    echo ℹ️  Frontend server left running
)

echo.
set /p STOP_BACKEND="🤔 Stop backend API server? (y/N): "
if /i "%STOP_BACKEND%"=="y" (
    echo ℹ️  Looking for backend server processes...
    taskkill /f /fi "WINDOWTITLE eq AeroPoints Backend*" >nul 2>&1
    if %ERRORLEVEL% equ 0 (
        echo ✅ Backend server stopped
    ) else (
        echo ℹ️  Backend server not found or already stopped
    )
) else (
    echo ℹ️  Backend server left running
)

echo.
echo ✅ AeroPoints sharing stopped successfully!
echo.
echo 💡 To restart sharing, run: share-website.bat
echo 💡 Local servers may still be running on localhost:5174 and localhost:8000
echo.

pause 