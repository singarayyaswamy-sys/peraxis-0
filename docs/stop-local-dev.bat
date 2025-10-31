@echo off
echo Stopping Local Development Environment...
echo.

echo Stopping Docker containers...
cd ..
docker-compose -f docker-compose.local-dev.yml down

echo.
echo Docker containers stopped!
echo.
echo Note: Backend services running in terminals need to be stopped manually.
echo Press Ctrl+C in each terminal window to stop the services.
echo.
pause
