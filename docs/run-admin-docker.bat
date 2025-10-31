@echo off
color 0A
echo ========================================
echo   PERAXIS - ADMIN DOCKER MODE
echo ========================================
echo All Admin Services in Docker
echo.

echo [INFO] Checking Docker...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not running!
    pause
    exit /b 1
)

echo [INFO] Building and starting admin services...
docker-compose -f docker-compose.admin.yml up -d --build

if errorlevel 1 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

echo [INFO] Waiting for services to start...
timeout /t 30 /nobreak >nul

echo [INFO] Checking service health...
docker-compose -f docker-compose.admin.yml ps

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
echo Credentials:
echo - admin@peraxis.com / admin123
echo - superadmin@peraxis.com / super123
echo.
echo [SUCCESS] Admin environment running in Docker!
echo.
echo Commands:
echo - View logs:  docker-compose -f docker-compose.admin.yml logs -f
echo - Stop:       docker-compose -f docker-compose.admin.yml down
echo - Restart:    docker-compose -f docker-compose.admin.yml restart
echo.
pause
