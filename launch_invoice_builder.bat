@echo off
title BROSKI Invoice & Quotation Builder
echo ========================================================
echo   BROSKI B2B & Wholesale Invoice Builder
echo   Proprietor: Lakshay (Nangloi, West Delhi)
echo ========================================================
echo.
echo Starting BROSKI Invoice Backend & Web UI...
cd /d "%~dp0invoice-builder"

start /b cmd /c "npm run dev:webserver"
timeout /t 3 /nobreak >nul
start /b cmd /c "npm run dev:renderer"
timeout /t 2 /nobreak >nul

start http://localhost:5173
echo.
echo Invoice Builder is live at: http://localhost:5173
echo Pre-loaded Database: broski_invoices.db
echo Press Ctrl+C in this window to stop the servers.
pause
