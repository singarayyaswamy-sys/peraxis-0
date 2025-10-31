# 🚀 PERAXIS BATCH FILES GUIDE

## 📋 COMPLETE BATCH FILE COLLECTION

### **🎯 Main Entry Points**

| File | Purpose | Usage |
|------|---------|-------|
| `run.bat` | Main entry point with menu | `run.bat` |
| `quick-start.bat` | Auto-detect optimal mode | `quick-start.bat` |
| `peraxis-control.bat` | Full control center | `peraxis-control.bat` |

### **🔧 Deployment Modes**

| File | Mode | Description |
|------|------|-------------|
| `run-local-dev.bat` | Local Development | Frontend/Backend local + Databases Docker |
| `run-docker-full.bat` | Full Docker | All services in Docker containers |
| `run-production.bat` | Production | Production deployment with security |
| `run-dev-tools.bat` | Development Tools | Monitoring, debugging, management tools |

### **🛠️ Management Files**

| File | Purpose | Usage |
|------|---------|-------|
| `stop-all.bat` | Stop all services | `stop-all.bat` |

## 🚀 QUICK START GUIDE

### **Option 1: Automatic (Recommended)**
```bash
# Auto-detect best mode for your system
quick-start.bat
```

### **Option 2: Interactive Menu**
```bash
# Full control center with all options
peraxis-control.bat
```

### **Option 3: Direct Mode**
```bash
# Local development (low resource usage)
run-local-dev.bat

# Full Docker (complete environment)
run-docker-full.bat
```

## 📊 SYSTEM REQUIREMENTS

### **Local Development Mode**
- **RAM:** 4GB minimum, 8GB recommended
- **CPU:** 2 cores minimum, 4 cores recommended
- **Storage:** 10GB free space
- **Docker:** Required for databases only

### **Full Docker Mode**
- **RAM:** 8GB minimum, 16GB recommended
- **CPU:** 4 cores minimum, 8 cores recommended
- **Storage:** 20GB free space
- **Docker:** Required for all services

### **Production Mode**
- **RAM:** 16GB minimum, 32GB recommended
- **CPU:** 8 cores minimum, 16 cores recommended
- **Storage:** 50GB free space
- **Docker/Kubernetes:** Required

## 🔧 DETAILED MODE DESCRIPTIONS

### **1. Local Development Mode (`run-local-dev.bat`)**
**Best for:** Development, debugging, low-resource systems

**What runs locally:**
- ✅ All 11 backend microservices (Java/Spring Boot)
- ✅ All 3 frontend applications (React/Vite)

**What runs in Docker:**
- ✅ MySQL database
- ✅ MongoDB database
- ✅ Redis cache
- ✅ Elasticsearch search

**Advantages:**
- 🚀 Fast development cycle
- 🔧 Easy debugging
- 💾 Lower resource usage
- 🔄 Hot reload for code changes

### **2. Full Docker Mode (`run-docker-full.bat`)**
**Best for:** Production-like testing, team development

**What runs in Docker:**
- ✅ All backend services
- ✅ All frontend applications
- ✅ All databases
- ✅ Load balancers
- ✅ Monitoring stack

**Advantages:**
- 🌐 Production-like environment
- 🔒 Isolated services
- 📈 Scalable architecture
- 🔄 Easy deployment

### **3. Production Mode (`run-production.bat`)**
**Best for:** Production deployment

**Features:**
- 🔒 Security hardening
- 📊 Comprehensive monitoring
- 🔄 Blue-green deployment
- 🛡️ Security scanning
- 📈 Auto-scaling
- 🔐 Secret management

### **4. Development Tools (`run-dev-tools.bat`)**
**Best for:** Monitoring, debugging, management

**Includes:**
- 📊 Prometheus (Metrics)
- 📈 Grafana (Dashboards)
- 🔍 Elasticsearch (Logs)
- 📋 Kibana (Log analysis)
- 🗄️ Database management tools
- 🐳 Container management

## 🎮 CONTROL CENTER FEATURES

The `peraxis-control.bat` provides a comprehensive menu:

```
[1] 🚀 Local Development Mode
[2] 🐳 Full Docker Mode  
[3] 🔧 Development Tools
[4] 🌐 Production Deployment
[5] 📊 System Status
[6] 🛑 Stop All Services
[7] 🧹 Clean Up
[8] 📋 View Logs
[9] 🔍 Security Scan
[0] ❌ Exit
```

## 🌐 ACCESS URLS

### **Frontend Applications**
- **Customer App:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3001
- **Seller Portal:** http://localhost:3002

### **Backend Services**
- **API Gateway:** http://localhost:8080
- **User Service:** http://localhost:8081
- **Product Service:** http://localhost:8082
- **Order Service:** http://localhost:8083
- **AI Service:** http://localhost:8084
- **Admin Service:** http://localhost:8085
- **Payment Service:** http://localhost:8086
- **WebSocket Service:** http://localhost:8087
- **Notification Service:** http://localhost:8088
- **Search Service:** http://localhost:8089
- **Activity Service:** http://localhost:8090
- **Location Service:** http://localhost:8091

### **Databases**
- **MySQL:** localhost:3307 (root/peraxis123)
- **MongoDB:** localhost:27017 (admin/peraxis123)
- **Redis:** localhost:6379 (password: peraxis123)
- **Elasticsearch:** localhost:9200

### **Development Tools**
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3000 (admin/admin)
- **Kibana:** http://localhost:5601
- **Redis Commander:** http://localhost:8081
- **Mongo Express:** http://localhost:8082
- **Adminer:** http://localhost:8083
- **Portainer:** http://localhost:9000

## 🛠️ TROUBLESHOOTING

### **Common Issues**

#### **Docker Not Running**
```bash
# Error: Docker is not running
# Solution: Start Docker Desktop
```

#### **Port Conflicts**
```bash
# Error: Port already in use
# Solution: Stop conflicting services or change ports in docker-compose.yml
```

#### **Low Memory**
```bash
# Error: Out of memory
# Solution: Use Local Development Mode or increase Docker memory limit
```

#### **Services Not Starting**
```bash
# Check logs
docker-compose logs [service-name]

# Restart specific service
docker-compose restart [service-name]

# Full restart
docker-compose down && docker-compose up -d
```

### **Performance Optimization**

#### **For Local Development**
- Use SSD storage
- Allocate 4GB+ RAM to Docker
- Close unnecessary applications

#### **For Full Docker**
- Allocate 8GB+ RAM to Docker
- Use Docker Desktop with WSL2 backend
- Enable Docker BuildKit

## 🔒 SECURITY FEATURES

### **Built-in Security**
- 🔐 CSRF protection
- 🛡️ Input sanitization
- 🔒 Secure headers
- 🔑 JWT authentication
- 🔐 Password hashing
- 🛡️ Rate limiting

### **Security Scanning**
```bash
# Run security scan
peraxis-control.bat -> Option 9
```

## 📈 MONITORING & LOGGING

### **Real-time Monitoring**
- System metrics via Prometheus
- Visual dashboards via Grafana
- Log analysis via ELK stack
- Container monitoring via Portainer

### **Log Management**
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f [service-name]

# View error logs only
docker-compose logs -f | findstr /i "error"
```

## 🚀 DEPLOYMENT WORKFLOW

### **Development**
1. `quick-start.bat` - Start development
2. Make code changes
3. Services auto-reload
4. Test functionality
5. `stop-all.bat` - Stop when done

### **Testing**
1. `run-docker-full.bat` - Production-like environment
2. Run integration tests
3. Performance testing
4. Security testing

### **Production**
1. `run-production.bat` - Deploy to production
2. Monitor system health
3. Scale as needed
4. Backup and maintenance

## 🎯 BEST PRACTICES

### **Development**
- Use Local Development Mode for coding
- Use Full Docker Mode for testing
- Regular security scans
- Monitor resource usage

### **Production**
- Always use Production Mode
- Set up proper monitoring
- Regular backups
- Security updates

### **Maintenance**
- Regular cleanup: `peraxis-control.bat -> Option 7`
- Monitor logs regularly
- Update dependencies
- Security patches

## 📞 SUPPORT

For issues or questions:
1. Check logs: `peraxis-control.bat -> Option 8`
2. Check system status: `peraxis-control.bat -> Option 5`
3. Run security scan: `peraxis-control.bat -> Option 9`
4. Clean up and restart: `peraxis-control.bat -> Option 7`

---

**🎉 Peraxis Platform - Enterprise-Grade E-commerce Solution**