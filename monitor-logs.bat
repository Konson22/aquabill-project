@echo off
echo 🔍 XAMPP Log Monitor Started
echo Press Ctrl+C to stop monitoring
echo.

cd /d F:\PRO-PROJECTS\aquabill

echo ✅ Monitoring Laravel logs...
echo ✅ Monitoring Apache access logs...
echo.

:loop
echo.
echo === Laravel API Requests ===
type storage\logs\laravel.log | findstr "API Request Debug" | findstr /C:"is_mobile_app.*true"
echo.
echo === Apache Access Log ===
type C:\xampp\apache\logs\access.log | findstr "10.103.26.43" | findstr "api"
echo.
timeout /t 5 /nobreak >nul
goto loop
