@echo off
color 0A
echo ========================================
echo   PERAXIS - FULL DOCKER MODE
echo ========================================
echo All services running in Docker
echo.

REM Check if secure environment is configured
if not exist ".env" (
    echo [ERROR] Environment not configured!
    echo [INFO] Run setup-secure-env.bat first
    pause
    exit /b 1
)

REM Check Docker status
echo [INFO] Checking Docker status...
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker not running. Start Docker Desktop.
    pause
    exit /b 1
)

echo [INFO] Building and starting all services...
docker-compose up -d --build

if errorlevel 1 (
    echo [ERROR] Failed to start services
    pause
    exit /b 1
)

echo [INFO] Waiting for services to initialize...
timeout /t 60 /nobreak >nul

echo [INFO] Checking service health...
docker-compose ps

echo.
echo ========================================
echo     FULL DOCKER ENVIRONMENT
echo ========================================
echo.
echo Frontend Applications:
echo Customer App:     http://localhost:3000
echo Admin Dashboard:  http://localhost:3001
echo Seller Portal:    http://localhost:3002
echo.
echo Backend Services:
echo API Gateway:      http://localhost:8080
echo User Service:     http://localhost:8081
echo Product Service:  http://localhost:8082
echo Order Service:    http://localhost:8083
echo AI Service:       http://localhost:8084
echo Admin Service:    http://localhost:8085
echo Payment Service:  http://localhost:8086
echo WebSocket:        ws://localhost:8087
echo Notification:     http://localhost:8088
echo Search Service:   http://localhost:8089
echo Activity Service: http://localhost:8090
echo Location Service: http://localhost:8091
echo.
echo Databases:
echo MySQL:           localhost:3307
echo MongoDB:         localhost:27017
echo Redis:           localhost:6379
echo Elasticsearch:   localhost:9200
echo.
echo Docker Commands:
echo View logs:       docker-compose logs -f
echo Stop all:        docker-compose down
echo Restart:         docker-compose restart
echo Rebuild:         docker-compose up -d --build
echo.
echo [SUCCESS] Full Docker environment ready!
pause