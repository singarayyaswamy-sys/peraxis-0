@echo off
echo Restarting Admin Services...

echo Stopping services...
docker-compose -f docker-compose.admin.yml down

echo Starting MongoDB and Redis...
docker-compose -f docker-compose.admin.yml up -d mongodb redis

echo Waiting for databases...
timeout /t 15 /nobreak >nul

echo Starting Admin Service...
docker-compose -f docker-compose.admin.yml up -d admin-service

echo Waiting for Admin Service...
timeout /t 20 /nobreak >nul

echo Starting API Gateway...
docker-compose -f docker-compose.admin.yml up -d api-gateway

echo Waiting for API Gateway...
timeout /t 15 /nobreak >nul

echo Starting Admin Dashboard...
docker-compose -f docker-compose.admin.yml up -d admin-dashboard

echo.
echo Services restarted!
echo Admin Dashboard: http://localhost:3002
pause
