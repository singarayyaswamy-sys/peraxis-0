@echo off
echo Stopping Admin Services...
docker-compose -f docker-compose.admin.yml down
echo Admin services stopped!
pause
