# 🚀 Peraxis Quick Start Guide

## Two Simple Ways to Run Peraxis

### 1. 🐳 Full Docker Mode (Production-like)
```bash
run-full-docker.bat
```
- **Everything runs in Docker containers**
- All databases, backend services, and frontend apps
- Best for production testing and deployment
- Requires Docker Desktop

### 2. 💻 Local Development Mode  
```bash
run-local-dev.bat
```
- **Databases in Docker, Apps run locally**
- MySQL, MongoDB, Redis, Elasticsearch in containers
- Backend services run locally with Maven
- Frontend apps run locally with npm/vite
- Best for development and debugging

### 3. 🛑 Stop All Services
```bash
stop-all.bat
```
- Stops all Docker containers
- Kills local Java and Node processes
- Clean shutdown of all services

## 📋 Prerequisites

### For Full Docker Mode:
- Docker Desktop installed and running
- 8GB+ RAM recommended

### For Local Development Mode:
- Docker Desktop (for databases)
- Java 17+ installed
- Maven 3.6+ installed  
- Node.js 18+ installed
- 4GB+ RAM recommended

## 🌐 Access URLs

| Service | URL | Credentials |
|---------|-----|-------------|
| Customer App | http://localhost:3000 | - |
| Admin Dashboard | http://localhost:3001 | admin@peraxis.com / admin123 |
| Seller Portal | http://localhost:3002 | - |
| API Gateway | http://localhost:8080 | - |
| MySQL | localhost:3307 | root / peraxis123 |
| MongoDB | localhost:27017 | admin / peraxis123 |
| Redis | localhost:6379 | password: peraxis123 |
| Elasticsearch | localhost:9200 | - |

## 🔧 Configuration

1. Copy `.env.example` to `.env`
2. Add your API keys:
   ```
   GEMINI_API_KEY=your_actual_key
   GOOGLE_MAPS_API_KEY=your_actual_key
   ```

## 🐛 Troubleshooting

- **Docker not running**: Start Docker Desktop
- **Port conflicts**: Check if ports 3000-3002, 8080-8091 are free
- **Memory issues**: Close other applications, increase Docker memory
- **Service startup**: Wait 30-60 seconds for all services to initialize

## 📁 Old Batch Files Removed

The multiple individual .bat files have been replaced with these 3 optimized scripts for better management.