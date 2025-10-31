# Local Development Guide

## Overview
Run databases and frontends in Docker, backend services locally in terminals for easier debugging.

## Prerequisites
- Docker Desktop installed and running
- Java 17 installed
- Maven installed
- Node.js installed (for frontend builds)

## Quick Start

### Option 1: Automatic (All Services)
```bash
# Start databases and frontends in Docker
docs\start-local-dev.bat

# Start all backend services in separate windows
docs\start-all-backends.bat
```

### Option 2: Manual (Individual Services)
```bash
# 1. Start databases and frontends
docs\start-local-dev.bat

# 2. Start backend services individually
docs\start-backend-service.bat api-gateway
docs\start-backend-service.bat user-service
# ... etc
```

## What Runs Where

### Docker (Databases + Frontends)
- **MySQL**: localhost:3307
- **MongoDB**: localhost:27017
- **Redis**: localhost:6379
- **Elasticsearch**: localhost:9200
- **Customer App**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3001
- **Seller Portal**: http://localhost:3002

### Local Terminals (Backend Services)
- **API Gateway**: localhost:8080
- **User Service**: localhost:8081
- **Product Service**: localhost:8082
- **Order Service**: localhost:8083
- **AI Service**: localhost:8084
- **Admin Service**: localhost:8085
- **Payment Service**: localhost:8086
- **WebSocket Service**: localhost:8087
- **Notification Service**: localhost:8088
- **Search Service**: localhost:8089
- **Activity Service**: localhost:8090
- **Location Service**: localhost:8091

## Service Startup Order

1. **Databases** (Docker) - Start first
2. **API Gateway** - Start second
3. **Core Services** - user, product, order
4. **Supporting Services** - ai, admin, payment, websocket, notification, search, activity, location
5. **Frontends** (Docker) - Already running

## Stopping Services

```bash
# Stop Docker containers
docs\stop-local-dev.bat

# Stop backend services
# Press Ctrl+C in each terminal window
```

## Troubleshooting

### Database Connection Issues
```bash
# Check if databases are running
docker ps

# Restart databases
docker-compose -f docker-compose.local-dev.yml restart
```

### Backend Service Won't Start
```bash
# Check if port is already in use
netstat -ano | findstr :8080

# Kill process if needed
taskkill /PID <process_id> /F
```

### Frontend Build Issues
```bash
# Rebuild frontends
cd frontend/customer-app && npm run build
cd frontend/admin-dashboard && npm run build
cd frontend/seller-portal && npm run build
```

## Development Workflow

1. Start databases and frontends: `docs\start-local-dev.bat`
2. Start backend services you're working on
3. Make code changes
4. Spring Boot auto-reloads on save
5. Test changes
6. Stop services when done

## Benefits of This Setup

✅ **Fast Backend Debugging** - Direct IDE debugging, no Docker overhead
✅ **Quick Restarts** - Only restart the service you're working on
✅ **Easy Logging** - See logs directly in terminal
✅ **Hot Reload** - Spring Boot DevTools works perfectly
✅ **Isolated Databases** - Databases in Docker, consistent state
✅ **Frontend Stability** - Frontends run in Docker, no rebuild needed
