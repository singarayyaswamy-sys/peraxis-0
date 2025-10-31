# GitHub Codespaces Fixes

## Issues Fixed

### 1. Location Service - Missing Database
**Error:** `Unknown database 'peraxis_location'`

**Fix:** Added `DATABASE-INIT.sql` to create all required databases on MySQL startup.

### 2. Frontend 403 Forbidden
**Error:** `directory index of "/usr/share/nginx/html/" is forbidden`

**Cause:** Nginx can't find `index.html` in the dist folder.

**Solution:**
```bash
# Build frontend apps first
cd frontend/customer-app && npm run build
cd ../admin-dashboard && npm run build
cd ../seller-portal && npm run build
```

### 3. Quick Fix Commands

```bash
# Stop all containers
docker compose down -v

# Build frontends (if not built)
cd frontend/customer-app && npm install && npm run build && cd ../..
cd frontend/admin-dashboard && npm install && npm run build && cd ../..
cd frontend/seller-portal && npm install && npm run build && cd ../..

# Start with database init
docker compose up -d
```

### 4. Database Initialization
The `DATABASE-INIT.sql` creates:
- peraxis_location
- peraxis_main
- peraxis_products
- peraxis_activities

### 5. Port Access in Codespaces
Make ports **Public** in the Ports tab:
- 3000 (Customer App)
- 3001 (Admin Dashboard)
- 3002 (Seller Portal)
- 8080 (API Gateway)
