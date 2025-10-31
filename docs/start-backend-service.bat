@echo off
if "%1"=="" (
    echo Usage: start-backend-service.bat [service-name]
    echo.
    echo Available services:
    echo   api-gateway
    echo   user-service
    echo   product-service
    echo   order-service
    echo   ai-service
    echo   admin-service
    echo   payment-service
    echo   websocket-service
    echo   notification-service
    echo   search-service
    echo   activity-service
    echo   location-service
    echo.
    echo Example: start-backend-service.bat api-gateway
    pause
    exit /b 1
)

set SERVICE=%1
echo Starting %SERVICE%...
cd ..\backend\%SERVICE%
mvn spring-boot:run
