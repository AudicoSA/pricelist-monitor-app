@echo off
REM Quick start batch file for Windows
echo Starting AI Pricelist Monitor...

REM Check if .env.local exists
if not exist ".env.local" (
    echo Error: .env.local not found!
    echo Please run setup-windows.ps1 first
    pause
    exit /b 1
)

REM Start development server
echo Starting development server on http://localhost:3000
npm run dev

pause