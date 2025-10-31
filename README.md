# Peraxis - AI-Powered E-commerce Platform

## 🚀 One-Click Setup

```bash
run.bat
```

## 🌐 Access URLs

- **Customer App:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3001  
- **Seller Portal:** http://localhost:3002
- **API Gateway:** http://localhost:8080

## 🗄️ Database Access

- **MySQL:** localhost:3307 (root/peraxis123)
- **MongoDB:** localhost:27017 (admin/peraxis123)
- **Redis:** localhost:6379 (password: peraxis123)
- **Elasticsearch:** localhost:9200

## 🔧 Configuration

Edit `.env` file:
```
GEMINI_API_KEY=your_actual_api_key
```

## 📋 Complete Features

- **11 Backend Microservices** (Spring Boot + Java 17)
- **3 Frontend Applications** (React + Vite)
- **4 Database Technologies** (MySQL, MongoDB, Redis, Elasticsearch)
- **Real-time Features** (WebSocket, AI Chat, Live Updates)
- **AI Integration** (Gemini API, Smart Recommendations)
- **Modern UI/UX** (Dark/Light Mode, Animations, Responsive)

## 🐳 Docker Commands

```bash
# Start everything
docker-compose up -d

# Stop everything  
docker-compose down

# View logs
docker-compose logs -f

# Rebuild and start
docker-compose up -d --build
```

## 🛠️ Services

**Frontend:**
- Customer App (Port 3000)
- Admin Dashboard (Port 3001)
- Seller Portal (Port 3002)

**Backend:**
- API Gateway (8080)
- User Service (8081)
- Product Service (8082)
- Order Service (8083)
- AI Service (8084)
- Admin Service (8085)
- Payment Service (8086)
- WebSocket Service (8087)
- Notification Service (8088)
- Search Service (8089)
- Activity Service (8090)
- Location Service (8091)

**Databases:**
- MySQL (3307)
- MongoDB (27017)
- Redis (6379)
- Elasticsearch (9200)

## 📚 Documentation

All documentation and batch files are located in the `docs/` folder.

## 🔧 Development Modes

### Full Docker Mode (Production-like)
```bash
run.bat
```

### Local Development Mode (Debugging)
```bash
# Databases + Frontends in Docker, Backends in terminals
docs\start-local-dev.bat
docs\start-all-backends.bat
```

See `docs/LOCAL-DEV-GUIDE.md` for detailed instructions.
