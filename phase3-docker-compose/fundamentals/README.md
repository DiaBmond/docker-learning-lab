# Docker Compose Fundamentals

Master Docker Compose through hands-on exercises covering multi-container applications, networking, and data persistence.

---

## 📚 Table of Contents

- [Overview](#overview)
- [Learning Goals](#learning-goals)
- [Prerequisites](#prerequisites)
- [Exercise Structure](#exercise-structure)
- [Progress Tracker](#progress-tracker)
- [Key Concepts](#key-concepts)
- [What I Learned](#what-i-learned)
- [Commands Reference](#commands-reference)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

---

## 🎯 Overview

Phase 3 Fundamentals covers the essential building blocks of Docker Compose:
- **Exercise 1:** Basic multi-container setup with service discovery
- **Exercise 2:** Network isolation and security
- **Exercise 3:** Data persistence with volumes

Each exercise builds upon the previous, creating a solid foundation for production deployments.

---

## 🎓 Learning Goals

By completing these fundamentals, you will be able to:

### Core Skills
- Write production-ready docker-compose.yml files
- Orchestrate multiple containers as a single application
- Implement network isolation for security
- Manage data persistence across container lifecycles
- Configure environment variables and secrets
- Set up health checks and restart policies

### Advanced Concepts
- Service discovery via DNS
- Custom bridge networks
- Internal networks (no internet access)
- Volume types (named, bind mount, tmpfs)
- Resource limits and constraints
- Container dependencies

---

## ✅ Prerequisites

**From Previous Phases:**
- [x] Phase 1: Container basics (run, stop, exec)
- [x] Phase 2: Dockerfile creation and optimization
- [x] Understanding of images and layers
- [x] Basic networking concepts

**System Requirements:**
- Docker Desktop installed (includes docker-compose)
- 8GB RAM minimum
- 10GB free disk space
- Terminal/command line access

**Verify Installation:**
```bash
docker --version
# Docker version 24.x.x

docker-compose --version
# Docker Compose version v2.x.x
```

---

## 📂 Exercise Structure
```
fundamentals/
├── README.md (this file)
├── exercise1-basic-compose/
│   ├── README.md
│   ├── docker-compose.yml
│   ├── backend/
│   ├── nginx/
│   ├── logs/
│   └── test-restart.sh
├── exercise2-networks/
│   ├── README.md
│   ├── docker-compose.yml
│   ├── frontend/
│   ├── backend/
│   ├── database/
│   └── test-isolation.sh
└── exercise3-volumes/
    ├── README.md
    ├── docker-compose.yml
    ├── app/
    ├── logs/
    ├── config/
    ├── test-volumes.sh
    └── test-performance.sh
```

---

## ✅ Progress Tracker

### Exercise 1: Basic Docker Compose
**Time:** ~2-3 hours | **Difficulty:** ⭐⭐ Medium

- [x] **Setup:** Multi-service application (nginx + node.js)
- [x] **Challenge 1:** Environment variables & .env files
- [x] **Challenge 2:** Volumes for logging
- [x] **Challenge 3:** Restart policies & resilience
- [x] **Grade:** ⭐⭐⭐⭐⭐ Expert

**Key Achievement:**
- Created production-ready compose setup
- Implemented auto-restart on crashes
- Configured persistent logging
- Environment management with .env

---

### Exercise 2: Networks & Isolation
**Time:** ~2-3 hours | **Difficulty:** ⭐⭐⭐ Hard

- [x] **Setup:** Three-tier architecture (frontend + backend + database)
- [x] **Networks:** Public and Private with isolation
- [x] **Security:** Internal network (no internet access)
- [x] **Testing:** Network isolation verification
- [x] **Grade:** ⭐⭐⭐⭐⭐ Expert

**Key Achievement:**
```
Frontend → Backend ✅ (public network)
Backend → Database ✅ (private network)
Frontend → Database ❌ (isolated!)
Database → Internet ❌ (internal: true)
```

---

### Exercise 3: Volumes & Data Persistence
**Time:** ~1-2 hours | **Difficulty:** ⭐⭐ Medium

- [x] **Setup:** Volume demo application
- [x] **Named Volumes:** Docker-managed persistent storage
- [x] **Bind Mounts:** Host directory access
- [x] **tmpfs:** RAM storage for temporary data
- [x] **Testing:** Persistence verification
- [x] **Grade:** ⭐⭐⭐⭐⭐ Perfect

**Key Achievement:**
- Understood 3 volume types and use cases
- Implemented backup/restore procedures
- Tested performance differences
- Secured config with read-only mounts

---

## 🎓 Key Concepts

### 1. Service Discovery

**Automatic DNS resolution:**
```yaml
services:
  backend:
    # Can reach database via: database:5432
  database:
    # Backend reaches this via service name "database"
```

**How it works:**
```
Service name → Docker DNS → IP address
backend      → 127.0.0.11 → 172.18.0.2
database     → 127.0.0.11 → 172.18.0.3
```

**Benefits:**
- ✅ No hardcoded IP addresses
- ✅ Works across container restarts
- ✅ Simple configuration
- ✅ Automatic load balancing (multiple replicas)

---

### 2. Networks

**Three types demonstrated:**

**Bridge Network (Default):**
```yaml
networks:
  public:
    driver: bridge
```
- Single host only
- Isolated from other networks
- Default for docker-compose

**Internal Network:**
```yaml
networks:
  private:
    internal: true  # No external access!
```
- No internet access
- Perfect for databases
- Security layer

**Custom Named Networks:**
```yaml
networks:
  public:
    name: public-network
  private:
    name: private-network
```
- Predictable names
- Easier debugging
- Multi-project isolation

---

### 3. Network Isolation Pattern

**Three-Tier Architecture:**
```
┌─────────────────────────────────┐
│      Public Network             │
│  ┌──────────┐    ┌──────────┐  │
│  │ Frontend │────│ Backend  │  │
│  └──────────┘    └─────┬────┘  │
└────────────────────────┼────────┘
                         │
┌────────────────────────┼────────┐
│   Private Network      │        │
│   (internal: true)     │        │
│                   ┌────┴─────┐  │
│                   │ Database │  │
│                   └──────────┘  │
└─────────────────────────────────┘
```

**Security benefits:**
- Frontend cannot access database directly
- Database isolated from internet
- Backend acts as secure gateway
- Principle of least privilege

---

### 4. Volume Types

**Named Volume (Docker-managed):**
```yaml
volumes:
  postgres_data:

services:
  db:
    volumes:
      - postgres_data:/var/lib/postgresql/data
```

**Location:** `/var/lib/docker/volumes/postgres_data/_data`  
**Use case:** Databases, persistent data  
**Backup:** `docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .`

---

**Bind Mount (Host directory):**
```yaml
services:
  app:
    volumes:
      - ./logs:/app/logs
      - ./config:/etc/config:ro  # :ro = read-only
```

**Location:** Your specified path  
**Use case:** Development, logs, configuration  
**Access:** Direct from host filesystem

---

**tmpfs (RAM storage):**
```yaml
services:
  app:
    tmpfs:
      - /tmp:size=100m
```

**Location:** RAM (memory)  
**Use case:** Temporary files, cache  
**Performance:** ⚡ 7x faster than disk  
**Persistence:** ❌ Lost on restart

---

### 5. Environment Variables

**Three methods:**

**Method 1: Inline**
```yaml
services:
  app:
    environment:
      - NODE_ENV=production
      - API_PORT=3000
```

**Method 2: env_file**
```yaml
services:
  app:
    env_file:
      - .env
      - .env.local
```

**Method 3: Combined (override)**
```yaml
services:
  app:
    env_file: .env
    environment:
      - MESSAGE=Override!  # Takes precedence
```

**Priority (highest to lowest):**
1. `environment:` in docker-compose.yml
2. `env_file:` variables
3. Dockerfile `ENV`
4. Shell environment

---

### 6. Health Checks

**Why health checks matter:**
```yaml
services:
  backend:
    healthcheck:
      test: ["CMD", "wget", "-q", "-O-", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

**Benefits:**
- Docker knows if container is actually working
- Auto-restart unhealthy containers
- `depends_on` with `condition: service_healthy`
- Zero-downtime deployments
- Better monitoring

**States:**
- `starting` → Health check not yet run
- `healthy` → Consecutive successful checks
- `unhealthy` → Consecutive failed checks

---

### 7. Restart Policies

**Four policies:**
```yaml
restart: "no"              # Never restart (default)
restart: always            # Always restart
restart: on-failure        # Restart only if exit code != 0
restart: unless-stopped    # Always restart unless manually stopped
```

**Use cases:**

| Policy | Use Case |
|--------|----------|
| `always` | Critical services (database) |
| `unless-stopped` | Most services (recommended) |
| `on-failure` | Batch jobs, workers |
| `"no"` | One-time tasks |

**Combined with health checks:**
```yaml
services:
  backend:
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
```

Result: Auto-restart on crash AND health check failures

---

## 📊 What I Learned

### Exercise 1: Basic Compose

**Technical Skills:**
- docker-compose.yml syntax
- Multi-service orchestration
- Service discovery (DNS-based)
- depends_on with health checks
- Environment variable management
- Restart policies
- Resource limits

**Key Learnings:**

**1. Service Discovery Just Works:**
```javascript
// No configuration needed!
const db = new Client({
  host: 'database',  // ← Service name as hostname
  port: 5432
});
```

**2. Environment Management:**
```bash
# Development
docker-compose --env-file .env.dev up

# Production
docker-compose --env-file .env.prod up
```

**3. Restart Policies Save Downtime:**
```
Application crashes → Auto-restart in 5s
Total downtime: < 10 seconds
vs Manual restart: Minutes to hours
```

---

### Exercise 2: Networks

**Technical Skills:**
- Custom bridge networks
- Network isolation
- Internal networks (no internet)
- Multi-network services
- DNS resolution
- Network security patterns

**Key Learnings:**

**1. Network Isolation = Security:**
```yaml
# Frontend cannot reach database
frontend:
  networks: [public]

# Backend bridges both networks
backend:
  networks: [public, private]

# Database isolated
database:
  networks: [private]
```

**2. Internal Networks Block Internet:**
```yaml
networks:
  private:
    internal: true  # Database cannot reach internet!
```

**3. Service as Network Bridge:**
```
Backend in both networks:
- Connects frontend (public)
- Connects database (private)
- Acts as secure gateway
```

---

### Exercise 3: Volumes

**Technical Skills:**
- Named volumes
- Bind mounts
- tmpfs mounts
- Read-only mounts (`:ro`)
- Volume backup/restore
- Performance optimization

**Key Learnings:**

**1. Choose Right Volume Type:**
```
Database data     → Named volume (managed, persistent)
Development code  → Bind mount (real-time sync)
Temporary cache   → tmpfs (fast, non-persistent)
```

**2. Performance Matters:**
```
tmpfs (RAM):     0.02s to write 100MB
Named volume:    0.15s to write 100MB
Bind mount:      0.14s to write 100MB

tmpfs is 7x faster!
```

**3. Read-only for Security:**
```yaml
volumes:
  - ./certs:/etc/ssl/certs:ro  # Cannot be modified
  - ./secrets:/run/secrets:ro  # Extra security
```

---

## 🛠️ Commands Reference

### Basic Commands
```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services (keeps volumes)
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove containers and volumes
docker-compose down -v

# Rebuild images
docker-compose build

# Build and start
docker-compose up --build
```

---

### Service Management
```bash
# List running services
docker-compose ps

# View logs
docker-compose logs

# Follow logs
docker-compose logs -f

# Logs for specific service
docker-compose logs backend

# Restart service
docker-compose restart backend

# Execute command in service
docker-compose exec backend sh

# Scale service
docker-compose up -d --scale backend=3
```

---

### Network Commands
```bash
# List networks
docker network ls

# Inspect network
docker network inspect public-network

# Check container's networks
docker inspect backend --format='{{range $net, $config := .NetworkSettings.Networks}}{{$net}} {{end}}'

# Get container IP
docker inspect backend --format='{{range $net, $config := .NetworkSettings.Networks}}{{$net}}: {{$config.IPAddress}} {{end}}'
```

---

### Volume Commands
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect postgres_data

# Remove volume
docker volume rm postgres_data

# Clean unused volumes
docker volume prune

# Backup volume
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar czf /backup/backup.tar.gz -C /data .

# Restore volume
docker run --rm -v postgres_data:/data -v $(pwd):/backup alpine tar xzf /backup/backup.tar.gz -C /data
```

---

### Debugging Commands
```bash
# Validate compose file
docker-compose config

# View effective configuration
docker-compose config --services

# Check service health
docker inspect backend --format='{{.State.Health.Status}}'

# View health check logs
docker inspect backend --format='{{json .State.Health}}' | jq '.'

# Test network connectivity
docker-compose exec frontend ping backend

# Check DNS resolution
docker-compose exec backend nslookup database

# View resource usage
docker stats
```

---

## ✅ Best Practices

### Compose File

**✅ Do:**
```yaml
version: '3.8'  # Use latest version

services:
  app:
    image: myapp:1.0.0  # Specific version
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/health"]
    environment:
      NODE_ENV: production
    networks:
      - frontend
    volumes:
      - app_data:/data

networks:
  frontend:
    name: myapp-frontend  # Explicit name

volumes:
  app_data:
    name: myapp-data
```

**❌ Don't:**
```yaml
version: '3'  # Too generic

services:
  app:
    image: myapp:latest  # Unpredictable
    # No restart policy
    # No health check
    environment:
      - PASSWORD=secret123  # Hardcoded secrets
    network_mode: host  # Breaks isolation
```

---

### Environment Variables

**✅ Do:**
```yaml
# Use .env file
env_file:
  - .env

# Or environment block
environment:
  - NODE_ENV=${NODE_ENV:-production}
  - DB_HOST=database
```

**.env:**
```bash
# Safe to commit (no secrets)
NODE_ENV=production
API_PORT=3000
```

**.env.local (gitignored):**
```bash
# Never commit secrets!
DB_PASSWORD=super_secret
API_KEY=sk_live_xyz123
```

**❌ Don't:**
```yaml
environment:
  - PASSWORD=hardcoded_secret  # Security risk!
  - API_KEY=sk_live_123456     # Never in compose file
```

---

### Networks

**✅ Do:**
```yaml
networks:
  frontend:
    name: app-frontend
  backend:
    name: app-backend
  database:
    name: app-database
    internal: true  # No internet for database
```

**❌ Don't:**
```yaml
# Don't use default network for everything
services:
  web:
  api:
  db:
# All in one network = no isolation
```

---

### Volumes

**✅ Do:**
```yaml
volumes:
  postgres_data:
    name: myapp-postgres-data
  
services:
  db:
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./config:/etc/postgresql:ro  # Read-only
```

**❌ Don't:**
```yaml
services:
  db:
    volumes:
      - /var/lib/postgresql/data  # Anonymous volume
      - ./config:/etc/postgresql  # Missing :ro for config
```

---

### Health Checks

**✅ Do:**
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost/health"]
  interval: 30s
  timeout: 3s
  retries: 3
  start_period: 10s
```

**❌ Don't:**
```yaml
healthcheck:
  test: ["CMD", "curl", "http://external-api.com"]  # External dependency
  interval: 5s  # Too frequent
  timeout: 30s  # Too long
```

---

## 🐛 Troubleshooting

### Issue: Service won't start

**Symptoms:**
```bash
docker-compose up
# Service exits immediately
```

**Debug:**
```bash
# View logs
docker-compose logs service-name

# Check exit code
docker-compose ps
# Look for "Exit X" status

# Common exit codes:
# Exit 0: Clean shutdown
# Exit 1: Application error
# Exit 137: Killed (OOM)
```

**Solutions:**
- Check logs for error messages
- Verify environment variables
- Check depends_on order
- Increase resource limits

---

### Issue: Cannot connect between services

**Symptoms:**
```bash
# From frontend:
curl http://backend:3000
# Connection refused or timeout
```

**Debug:**
```bash
# Check both services running
docker-compose ps

# Check networks
docker network inspect network-name

# Test DNS
docker-compose exec frontend nslookup backend

# Check if service listening
docker-compose exec backend netstat -tlnp
```

**Solutions:**
- Verify both services in same network
- Check service name spelling
- Ensure port exposed in Dockerfile
- Check firewall rules

---

### Issue: Volumes not persisting

**Symptoms:**
```bash
docker-compose down
docker-compose up
# Data is gone!
```

**Debug:**
```bash
# Check volume exists
docker volume ls

# Inspect volume
docker volume inspect volume-name

# Check if volume mounted
docker inspect container-name --format='{{json .Mounts}}'
```

**Solutions:**
```bash
# Don't use: docker-compose down -v
# Use: docker-compose down (keeps volumes)

# Or use named volumes:
volumes:
  mydata:
    name: persistent-data
```

---

### Issue: Permission denied on bind mount

**Symptoms:**
```bash
# In container:
touch /app/logs/test.log
# Permission denied
```

**Debug:**
```bash
# Check file ownership on host
ls -la logs/

# Check user in container
docker-compose exec app id
```

**Solutions:**
```bash
# Fix ownership on host
sudo chown -R $USER:$USER logs/

# Or run as specific user
services:
  app:
    user: "1000:1000"
```

---

### Issue: Network isolation not working

**Debug:**
```bash
# Test connectivity
docker-compose exec frontend ping database
# Should fail if properly isolated

# Check networks
docker inspect frontend --format='{{range $net, $config := .NetworkSettings.Networks}}{{$net}} {{end}}'
docker inspect database --format='{{range $net, $config := .NetworkSettings.Networks}}{{$net}} {{end}}'

# Should be in different networks
```

**Solution:**
```yaml
# Ensure correct network assignment
frontend:
  networks: [public]
database:
  networks: [private]
```

---

## 📈 Performance Tips

### 1. Use tmpfs for Temporary Data
```yaml
services:
  app:
    tmpfs:
      - /tmp:size=100m
      - /var/cache:size=50m
```

**Benefit:** 7x faster than disk I/O

---

### 2. Optimize depends_on
```yaml
# ❌ Slow (sequential startup)
services:
  frontend:
    depends_on:
      - backend
  backend:
    depends_on:
      - database

# ✅ Fast (parallel startup with health checks)
services:
  frontend:
    depends_on:
      backend:
        condition: service_healthy
  backend:
    depends_on:
      database:
        condition: service_healthy
```

---

### 3. Resource Limits
```yaml
services:
  app:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

**Benefit:** Prevents one service from consuming all resources

---

### 4. Build Cache
```bash
# Use BuildKit for better caching
DOCKER_BUILDKIT=1 docker-compose build

# Or set in docker-compose.yml
services:
  app:
    build:
      context: .
      cache_from:
        - myapp:latest
```

---

## 🎯 Next Steps

### Completed Fundamentals ✅

**You've mastered:**
- ✅ Multi-service orchestration
- ✅ Service discovery
- ✅ Network isolation
- ✅ Data persistence
- ✅ Environment management
- ✅ Health checks & restart policies

**Ready for:**
- Project 1: Full-stack Application
- Project 2: Microservices Architecture
- Project 3: Production Deployment

---

### Project 1 Preview

**Full-stack Application:**
```
┌─────────────┐
│   React     │ ← Frontend (SPA)
│  Frontend   │
└──────┬──────┘
       │
┌──────┴──────┐
│   Node.js   │ ← Backend API
│   Express   │
└──────┬──────┘
       │
┌──────┴──────┐
│ PostgreSQL  │ ← Database
│   + Redis   │   + Cache
└─────────────┘
```

**Features:**
- nginx reverse proxy
- PostgreSQL database
- Redis cache
- Multiple networks
- Named volumes
- Environment configs

---

## 📚 Additional Resources

### Official Documentation
- [Docker Compose Specification](https://docs.docker.com/compose/compose-file/)
- [Networking in Compose](https://docs.docker.com/compose/networking/)
- [Volumes in Compose](https://docs.docker.com/storage/volumes/)

### Tools
- [docker-compose-viz](https://github.com/pmsipilot/docker-compose-viz) - Visualize compose files
- [dive](https://github.com/wagoodman/dive) - Explore image layers
- [ctop](https://github.com/bcicen/ctop) - Container metrics

---

## 🏆 Final Stats

**Fundamentals Completed:**
```
✅ 3 Exercises completed
✅ 6 Challenges solved
✅ 15+ services orchestrated
✅ 100% isolation tested
✅ All volume types mastered
✅ Production patterns learned
```

**Time Invested:** ~6-8 hours  
**Skills Level:** Intermediate → Advanced  
**Grade:** ⭐⭐⭐⭐⭐ Expert Level

---

**Status:** ✅ **FUNDAMENTALS COMPLETE**

**Next:** [Project 1: Full-stack Application](../project1-fullstack-app/)

---

*Completed: December 11, 2024*  
*Author: Your learning journey*  
*Mentor: Claude (Anthropic)*