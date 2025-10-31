@echo off
echo ========================================
echo   PERAXIS - Secure Environment Setup
echo ========================================
echo.

REM Generate secure random passwords
echo [INFO] Generating secure credentials...

REM Generate random passwords using PowerShell
for /f "delims=" %%i in ('powershell -command "Add-Type -AssemblyName System.Web; [System.Web.Security.Membership]::GeneratePassword(32, 8)"') do set DB_ROOT_PASSWORD=%%i
for /f "delims=" %%i in ('powershell -command "Add-Type -AssemblyName System.Web; [System.Web.Security.Membership]::GeneratePassword(32, 8)"') do set DB_ADMIN_PASSWORD=%%i
for /f "delims=" %%i in ('powershell -command "Add-Type -AssemblyName System.Web; [System.Web.Security.Membership]::GeneratePassword(32, 8)"') do set REDIS_PASSWORD=%%i
for /f "delims=" %%i in ('powershell -command "Add-Type -AssemblyName System.Web; [System.Web.Security.Membership]::GeneratePassword(64, 16)"') do set JWT_SECRET=%%i
for /f "delims=" %%i in ('powershell -command "Add-Type -AssemblyName System.Web; [System.Web.Security.Membership]::GeneratePassword(64, 16)"') do set JWT_ADMIN_SECRET=%%i
for /f "delims=" %%i in ('powershell -command "Add-Type -AssemblyName System.Web; [System.Web.Security.Membership]::GeneratePassword(32, 8)"') do set ADMIN_PASSWORD=%%i
for /f "delims=" %%i in ('powershell -command "Add-Type -AssemblyName System.Web; [System.Web.Security.Membership]::GeneratePassword(32, 8)"') do set SUPER_ADMIN_PASSWORD=%%i
for /f "delims=" %%i in ('powershell -command "Add-Type -AssemblyName System.Web; [System.Web.Security.Membership]::GeneratePassword(32, 8)"') do set ENCRYPTION_KEY=%%i

REM Create secure .env file
echo [INFO] Creating secure environment configuration...

(
echo # Peraxis Secure Environment Configuration
echo # Generated on %date% %time%
echo # CRITICAL: Keep this file secure and never commit to version control
echo.
echo # Database Credentials
echo DB_ROOT_PASSWORD=%DB_ROOT_PASSWORD%
echo DB_ADMIN_PASSWORD=%DB_ADMIN_PASSWORD%
echo REDIS_PASSWORD=%REDIS_PASSWORD%
echo.
echo # JWT Secrets
echo JWT_SECRET=%JWT_SECRET%
echo JWT_ADMIN_SECRET=%JWT_ADMIN_SECRET%
echo.
echo # Admin Credentials
echo ADMIN_EMAIL=admin@peraxis.com
echo ADMIN_PASSWORD=%ADMIN_PASSWORD%
echo SUPER_ADMIN_EMAIL=superadmin@peraxis.com
echo SUPER_ADMIN_PASSWORD=%SUPER_ADMIN_PASSWORD%
echo.
echo # Encryption
echo ENCRYPTION_KEY=%ENCRYPTION_KEY%
echo.
echo # API Keys ^(Replace with actual values^)
echo GEMINI_API_KEY=your_actual_gemini_api_key_here
echo GOOGLE_MAPS_API_KEY=your_actual_google_maps_api_key_here
echo.
echo # Security Settings
echo SESSION_TIMEOUT=1800
echo MAX_LOGIN_ATTEMPTS=5
echo RATE_LIMIT_REQUESTS=100
echo RATE_LIMIT_WINDOW=60000
echo.
echo # SSL/TLS Settings
echo SSL_ENABLED=true
echo FORCE_HTTPS=true
) > .env

echo [SUCCESS] Secure environment configuration created!
echo.
echo ========================================
echo   IMPORTANT SECURITY INFORMATION
echo ========================================
echo.
echo Admin Credentials:
echo Email: admin@peraxis.com
echo Password: %ADMIN_PASSWORD%
echo.
echo Super Admin Credentials:
echo Email: superadmin@peraxis.com  
echo Password: %SUPER_ADMIN_PASSWORD%
echo.
echo Database Root Password: %DB_ROOT_PASSWORD%
echo Redis Password: %REDIS_PASSWORD%
echo.
echo ========================================
echo   SECURITY CHECKLIST
echo ========================================
echo.
echo [1] Store these credentials in a secure password manager
echo [2] Change default passwords after first login
echo [3] Add your actual API keys to .env file
echo [4] Never commit .env file to version control
echo [5] Restrict file permissions on .env file
echo [6] Enable SSL/TLS in production
echo [7] Configure firewall rules
echo [8] Set up monitoring and alerting
echo.
echo [INFO] Press any key to continue...
pause >nul

REM Set secure file permissions (Windows)
echo [INFO] Setting secure file permissions...
icacls .env /inheritance:r /grant:r "%USERNAME%:F" >nul 2>&1

echo [SUCCESS] Environment setup complete!
echo [WARNING] Clear this console output for security!