@echo off
echo ========================================
echo Starting Peraxis Local Development
echo ========================================
echo.

echo [1/2] Starting Databases and Frontends in Docker...
docker-compose -f docker-compose.local-dev.yml up -d

echo.
echo [2/2] Waiting for databases to be ready...
timeout /t 15 /nobreak >nul

echo.
echo ========================================
echo Docker Services Started Successfully!
echo ========================================
echo.
echo Databases:
echo   MySQL:         localhost:3307
echo   MongoDB:       localhost:27017
echo   Redis:         localhost:6379
echo   Elasticsearch: localhost:9200
echo.
echo Frontends:
echo   Customer App:      http://localhost:3000
echo   Admin Dashboard:   http://localhost:3001
echo   Seller Portal:     http://localhost:3002
echo.
echo ========================================
echo Now start backend services manually:
echo ========================================
echo.
echo Open 11 separate terminals and run:
echo.
echo Terminal 1:  cd backend\api-gateway       ^&^& mvn spring-boot:run
echo Terminal 2:  cd backend\user-service      ^&^& mvn spring-boot:run
echo Terminal 3:  cd backend\product-service   ^&^& mvn spring-boot:run
echo Terminal 4:  cd backend\order-service     ^&^& mvn spring-boot:run
echo Terminal 5:  cd backend\ai-service        ^&^& mvn spring-boot:run
echo Terminal 6:  cd backend\admin-service     ^&^& mvn spring-boot:run
echo Terminal 7:  cd backend\payment-service   ^&^& mvn spring-boot:run
echo Terminal 8:  cd backend\websocket-service ^&^& mvn spring-boot:run
echo Terminal 9:  cd backend\notification-service ^&^& mvn spring-boot:run
echo Terminal 10: cd backend\search-service    ^&^& mvn spring-boot:run
echo Terminal 11: cd backend\activity-service  ^&^& mvn spring-boot:run
echo Terminal 12: cd backend\location-service  ^&^& mvn spring-boot:run
echo.
echo ========================================
pause
