@echo off
echo ========================================
echo    Online Internship Platform
echo    Yuga Yatra Retail (OPC) Private Limited
echo ========================================
echo.

echo Starting the Online Internship Platform...
echo.

echo [1/3] Installing frontend dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Frontend dependency installation failed!
    pause
    exit /b 1
)

echo [2/3] Installing backend dependencies...
cd backend-sql
call npm install
if %errorlevel% neq 0 (
    echo ❌ Backend dependency installation failed!
    pause
    exit /b 1
)

echo [3/3] Setting up MySQL database...
call node scripts/migrate-to-mysql.js
if %errorlevel% neq 0 (
    echo ❌ Database setup failed!
    echo Please check your Hostinger database credentials
    pause
    exit /b 1
)

echo.
echo ✅ All dependencies installed and database configured!
echo.
echo 🚀 Starting servers...
echo.

echo Starting backend server on port 5000...
start "Backend Server" cmd /k "npm start"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting frontend server on port 3000...
start "Frontend Server" cmd /k "cd .. && npm start"

echo.
echo 🌐 Your Online Internship Platform is starting up!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend: http://localhost:5000
echo 👤 Admin Login: http://localhost:3000/admin/login
echo    Username: Admin, Password: Admin
echo.
echo Press any key to close this window...
pause >nul
