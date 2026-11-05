@echo off
setlocal
cd /d "%~dp0"
if errorlevel 1 goto failed
where node >nul 2>nul
if errorlevel 1 goto missing_node
where npm >nul 2>nul
if errorlevel 1 goto missing_node
if not exist "node_modules\.bin\vite.cmd" (
  call npm install
  if errorlevel 1 goto failed
)
call npm run build
if errorlevel 1 goto failed
set "PORT=4174"
echo Broski local preview: http://127.0.0.1:4174
echo Keep this window open. Press Ctrl+C to stop.
echo Preview checkout only - no payment or dispatch.
call npm start
if errorlevel 1 goto failed
exit /b 0
:missing_node
echo Node.js and npm must be installed and available on PATH.
echo Install a Node.js version supported by this project's Vite dependency.
pause
exit /b 1
:failed
echo The website could not start. Review the error above.
echo If port 4174 is occupied, stop the existing preview first.
pause
exit /b 1
