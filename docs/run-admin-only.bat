@echo off
color 0A
echo ========================================
echo   PERAXIS - ADMIN ONLY MODE
echo ========================================
echo Running Admin Dashboard + Required Services
echo.

echo [INFO] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not running!
    pause
    exit /b 1
)

echo [INFO] Starting databases...
docker-compose up -d mongodb redis

echo [INFO] Waiting for databases...
timeout /t 15 /nobreak >nul

echo [INFO] Starting Admin Service...
docker-compose up -d admin-service

echo [INFO] Starting API Gateway...
docker-compose up -d api-gateway

echo [INFO] Waiting for services...
timeout /t 20 /nobreak >nul

echo [INFO] Starting Admin Dashboard...
docker-compose up -d admin-dashboard

echo.
echo ========================================
echo     ADMIN DASHBOARD READY
echo ========================================
echo.
echo Admin Dashboard:  http://localhost:3002
echo API Gateway:      http://localhost:8080
echo Admin Service:    http://localhost:8085
echo.
echo MongoDB:          localhost:27017
echo Redis:            localhost:6379
echo.
echo Login: admin@peraxis.com / admin123
echo       superadmin@peraxis.com / super123
echo.
echo [SUCCESS] Admin environment running!
echo [INFO] Stop: docker-compose down
pause
