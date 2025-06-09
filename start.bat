@echo off
rem Nutrition Tracker Startup Script for Windows
rem This script initializes and runs the nutrition tracker web application

echo 🥗 Starting Nutrition Tracker Web Application...
echo ================================================

rem Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Visit: https://nodejs.org/
    pause
    exit /b 1
)

rem Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ npm version:
npm --version
echo.

rem Check if node_modules exists, if not install dependencies
if not exist "node_modules" (
    echo 📦 Installing dependencies...
    npm install
    
    if %errorlevel% neq 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    
    echo ✅ Dependencies installed successfully
    echo.
) else (
    echo ✅ Dependencies already installed
    echo.
)

rem Start the development server
echo 🚀 Starting development server...
echo    The application will be available at: http://localhost:5173/
echo    Press Ctrl+C to stop the server
echo.

rem Run the development server
npm run dev