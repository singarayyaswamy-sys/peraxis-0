@echo off
color 0A
echo ========================================
echo   PERAXIS - LOCAL DEVELOPMENT MODE
echo ========================================
echo Databases in Docker, Services Local
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

echo [INFO] Starting databases in Docker...
docker-compose up -d mysql mongodb redis elasticsearch

if errorlevel 1 (
    echo [ERROR] Failed to start databases
    pause
    exit /b 1
)

echo [INFO] Waiting for databases...
timeout /t 30 /nobreak >nul

echo [INFO] Starting backend services locally...
start "API Gateway" cmd /k "cd backend\api-gateway && mvn spring-boot:run"
timeout /t 3 /nobreak >nul
start "User Service" cmd /k "cd backend\user-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul
start "Product Service" cmd /k "cd backend\product-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul
start "Order Service" cmd /k "cd backend\order-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul
start "AI Service" cmd /k "cd backend\ai-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul
start "Admin Service" cmd /k "cd backend\admin-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul
start "Payment Service" cmd /k "cd backend\payment-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul
start "WebSocket Service" cmd /k "cd backend\websocket-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul
start "Notification Service" cmd /k "cd backend\notification-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul
start "Search Service" cmd /k "cd backend\search-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul
start "Activity Service" cmd /k "cd backend\activity-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul
start "Location Service" cmd /k "cd backend\location-service && mvn spring-boot:run"

echo [INFO] Waiting for backend services...
timeout /t 15 /nobreak >nul

echo [INFO] Starting frontend applications...
start "Customer App" cmd /k "cd frontend\customer-app && npm run dev"
timeout /t 3 /nobreak >nul
start "Admin Dashboard" cmd /k "cd frontend\admin-dashboard && npm run dev"
timeout /t 3 /nobreak >nul
start "Seller Portal" cmd /k "cd frontend\seller-portal && npm run dev"

echo.
echo ========================================
echo     LOCAL DEVELOPMENT ENVIRONMENT
echo ========================================
echo.
echo Frontend (Local):
echo Customer App:     http://localhost:3000
echo Admin Dashboard:  http://localhost:3001
echo Seller Portal:    http://localhost:3002
echo.
echo Backend (Local):
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
echo Databases (Docker):
echo MySQL:           localhost:3307
echo MongoDB:         localhost:27017
echo Redis:           localhost:6379
echo Elasticsearch:   localhost:9200
echo.
echo [SUCCESS] Development environment ready!
echo [INFO] Stop databases: docker-compose down
pause