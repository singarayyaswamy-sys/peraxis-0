# Docker Environment Fixes

## Issues Fixed

### 1. Missing Environment Variables
- Added `DB_ROOT_PASSWORD=peraxis123`
- Added `DB_ADMIN_PASSWORD=peraxis123`

### 2. MongoDB Configuration
- Requires `MONGO_INITDB_ROOT_USERNAME` and `MONGO_INITDB_ROOT_PASSWORD`
- Fixed in docker-compose.yml

### 3. MySQL Configuration
- Requires `MYSQL_ROOT_PASSWORD`
- Fixed in .env file

### 4. Nginx Configuration Issues
- Frontend apps have incorrect nginx.conf placement
- "events" directive error in default.conf
- Host not found in upstream "api-gateway"

## Solution

Update `.env` file with:
```
DB_ROOT_PASSWORD=peraxis123
DB_ADMIN_PASSWORD=peraxis123
```

## Testing in GitHub Codespaces

Run:
```bash
docker compose down -v
docker compose up
```
