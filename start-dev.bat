@echo off
echo 🚀 Starting Legeclair Development Environment

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

echo 📦 Installing frontend dependencies...
cd legeclair
call npm install

echo 📦 Installing backend dependencies...
cd ..\legeclair-api
call npm install

echo 🔧 Setting up environment files...
REM Copy environment examples if they don't exist
if not exist .env (
    copy env.example .env
    echo ✅ Created .env file for backend
)

cd ..\legeclair
if not exist .env (
    copy env.example .env
    echo ✅ Created .env file for frontend
)

echo 🌐 Starting backend server...
cd ..\legeclair-api
start "Backend Server" cmd /k "npm run dev"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo 🎨 Starting frontend server...
cd ..\legeclair
start "Frontend Server" cmd /k "npm run dev"

echo ✅ Development servers started!
echo    Backend: http://localhost:3000
echo    Frontend: http://localhost:3001
echo.
echo Press any key to stop servers...
pause >nul

echo 🛑 Stopping servers...
taskkill /f /im node.exe >nul 2>&1
echo ✅ Servers stopped
pause 