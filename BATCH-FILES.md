# Peraxis Batch Files Guide

## Available Batch Files

### 1. `setup-secure-env.bat`
**Purpose**: Generate secure environment configuration
- Creates `.env` file with randomly generated passwords
- Sets up secure credentials for all services
- **Run this first** before starting any services

### 2. `run-local-dev.bat`
**Purpose**: Local development mode
- **Databases**: Run in Docker containers
- **Backend Services**: Run locally with Maven
- **Frontend Apps**: Run locally with npm/vite
- Best for development and debugging

### 3. `run-docker-full.bat`
**Purpose**: Full Docker deployment
- **Everything**: Runs in Docker containers
- **Production-like**: Complete containerized environment
- Best for testing and production deployment

## Quick Start

1. **First Time Setup**:
   ```bash
   setup-secure-env.bat
   ```

2. **For Development**:
   ```bash
   run-local-dev.bat
   ```

3. **For Production/Testing**:
   ```bash
   run-docker-full.bat
   ```

## Service URLs

| Service | URL |
|---------|-----|
| Customer App | http://localhost:3000 |
| Admin Dashboard | http://localhost:3001 |
| Seller Portal | http://localhost:3002 |
| API Gateway | http://localhost:8080 |
| MySQL | localhost:3307 |
| MongoDB | localhost:27017 |
| Redis | localhost:6379 |
| Elasticsearch | localhost:9200 |

## Stopping Services

- **Local Dev**: Close terminal windows + `docker-compose down`
- **Full Docker**: `docker-compose down`

## Troubleshooting

- Ensure Docker Desktop is running
- Check `.env` file exists (run `setup-secure-env.bat`)
- Verify ports are not in use
- Check Docker logs: `docker-compose logs -f`