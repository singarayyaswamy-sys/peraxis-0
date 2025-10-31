@echo off
echo Starting all backend services in separate windows...
echo.

start "API Gateway (8080)" cmd /k "cd ..\backend\api-gateway && mvn spring-boot:run"
timeout /t 2 /nobreak >nul

start "User Service (8081)" cmd /k "cd ..\backend\user-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul

start "Product Service (8082)" cmd /k "cd ..\backend\product-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul

start "Order Service (8083)" cmd /k "cd ..\backend\order-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul

start "AI Service (8084)" cmd /k "cd ..\backend\ai-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul

start "Admin Service (8085)" cmd /k "cd ..\backend\admin-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul

start "Payment Service (8086)" cmd /k "cd ..\backend\payment-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul

start "WebSocket Service (8087)" cmd /k "cd ..\backend\websocket-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul

start "Notification Service (8088)" cmd /k "cd ..\backend\notification-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul

start "Search Service (8089)" cmd /k "cd ..\backend\search-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul

start "Activity Service (8090)" cmd /k "cd ..\backend\activity-service && mvn spring-boot:run"
timeout /t 2 /nobreak >nul

start "Location Service (8091)" cmd /k "cd ..\backend\location-service && mvn spring-boot:run"

echo.
echo All backend services are starting in separate windows...
echo Close this window or press any key to continue.
pause >nul
