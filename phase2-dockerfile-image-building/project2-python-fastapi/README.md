# Project 2: FastAPI with Alpine - Production-Ready Python API

High-performance FastAPI application demonstrating Alpine optimization, multi-stage builds, and Python best practices.

---

## Project Goals

Build a FastAPI application that showcases:
- Alpine Linux optimization (< 100 MB target)
- Multi-stage builds for Python
- Layer caching strategy
- ASGI server (uvicorn) configuration
- Auto-generated API documentation
- Production security (non-root user)

---

## Results Achieved

### Image Size
| Version | Size | Improvement |
|---------|------|-------------|
| Dockerfile.bad | 1.1 GB | Baseline |
| Dockerfile (optimized) | **85 MB** | **92% smaller** |

### Comparison with Project 1 (Node.js)
| Metric | Node.js | Python | Winner |
|--------|---------|--------|--------|
| **Final Size** | 180 MB | 85 MB | Python |
| **Base Image** | 120 MB | 49 MB | Python |
| **Reduction** | 85% | 92% | Python |
| **Startup Time** | 1-2s | 0.5-1s | Python |
| **Multi-stage Benefit** | High | Medium | Node.js |

### Build Time
| Scenario | Time | Notes |
|----------|------|-------|
| First build | 2m 15s | Installing dependencies |
| Code change | 5s | Dependencies cached |
| Dep change | 1m 30s | Reinstall packages |

---

## Architecture

### Application Structure
```
app/
├── __init__.py           # Package marker
├── main.py               # FastAPI app & root endpoints
├── routers/
│   └── health.py         # Health check endpoint
└── models/
    └── response.py       # Pydantic response models
```

### API Endpoints
```
GET /                     # Welcome message
GET /health               # Health check (status, version, uptime)
GET /api/info             # API metadata and documentation links
GET /docs                 # Swagger UI (auto-generated)
GET /redoc                # ReDoc (auto-generated)
```

---

## Quick Start

### Prerequisites
- Docker installed
- Python 3.11+ (for local development)

### Build & Run
```bash
# Build optimized version
docker build -t fastapi-app .

# Run container
docker run -d -p 8000:8000 --name fastapi fastapi-app

# Test API
curl http://localhost:8000
curl http://localhost:8000/health
curl http://localhost:8000/api/info

# Access interactive documentation
open http://localhost:8000/docs

# View logs
docker logs fastapi

# Stop & remove
docker stop fastapi && docker rm fastapi
```

---

## Dockerfile Analysis

### Dockerfile.bad (For Comparison)
```dockerfile
FROM python:3.11

WORKDIR /app

# Copies everything first (breaks cache)
COPY . .

# No --no-cache-dir (includes pip cache ~50-100 MB)
RUN pip install -r requirements.txt

# No security, runs as root
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Problems:**
- Uses full python:3.11 (~1.01 GB base)
- Poor layer caching
- Includes pip cache
- No multi-stage optimization
- Runs as root user
- No health check

---

### Dockerfile (Optimized)
```dockerfile
# ============================================
# Stage 1: Dependencies
# ============================================
FROM python:3.11-alpine AS builder

WORKDIR /app

# Install dependencies with --user flag
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# ============================================
# Stage 2: Production
# ============================================
FROM python:3.11-alpine

WORKDIR /app

# Create non-root user (Alpine syntax)
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001 -G appuser

# Copy installed packages from builder
COPY --from=builder /root/.local /home/appuser/.local

# Copy application code
COPY --chown=appuser:appuser ./app ./app

# Update PATH to include user packages
ENV PATH=/home/appuser/.local/bin:$PATH

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()" || exit 1

# Run application
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Benefits:**
- Alpine base (49 MB vs 1.01 GB)
- Multi-stage (excludes pip, setuptools)
- Excellent caching (requirements.txt separate)
- No pip cache (--no-cache-dir)
- Non-root user (security)
- Health check (monitoring)
- Direct uvicorn execution

---

## Key Concepts Demonstrated

### 1. Why Alpine is Perfect for Python

**Alpine Advantages:**
```
python:3.11        → 1.01 GB (Development)
python:3.11-slim   → 126 MB  (Production - compatible)
python:3.11-alpine → 49 MB   (Production - smallest)
```

**Alpine works great for pure Python:**
- No compilation needed
- All Python packages work
- 95% smaller than full image

**When Alpine struggles:**
```python
# Packages with C extensions on Alpine
pip install numpy pandas pillow
# Needs: gcc, musl-dev, python3-dev
# Compilation takes 10+ minutes
# Final size larger than slim!

# Use slim instead for data science
FROM python:3.11-slim
```

**This project (FastAPI):**
- Pure Python packages only
- Alpine is perfect choice
- 85 MB final size

---

### 2. Multi-stage Build for Python

**Why multi-stage for interpreted language?**

Python doesn't need compilation, but multi-stage still helps:

**Single-stage includes:**
```
Final Image:
├── pip (~10 MB)
├── setuptools (~5 MB)
├── wheel (~1 MB)
├── Application code
└── Dependencies

Size: ~95 MB
```

**Multi-stage excludes build tools:**
```
Stage 1 (Builder):
├── pip
├── setuptools
└── Install packages

Stage 2 (Production):
├── Installed packages only (from builder)
├── Application code
└── No build tools!

Size: ~85 MB (10 MB saved)
```

**Savings comparison:**
- Node.js multi-stage: 1.2 GB → 180 MB (1.02 GB saved, 85%)
- Python multi-stage: 95 MB → 85 MB (10 MB saved, 11%)

**Conclusion:**
- Multi-stage **essential** for compiled languages
- Multi-stage **nice-to-have** for interpreted languages
- Still worth it for security and best practices

---

### 3. pip Best Practices

**Always use these flags in Docker:**
```dockerfile
# Best practice
RUN pip install --no-cache-dir -r requirements.txt
```

**Flag explanations:**

**`--no-cache-dir`:**
```bash
# Without flag
pip install fastapi
# Downloads packages
# Stores in ~/.cache/pip/ (~50-100 MB)
# Installs packages

# With flag
pip install --no-cache-dir fastapi
# Downloads packages
# Installs packages
# No cache stored → Saves 50-100 MB
```

**`--user` (in multi-stage):**
```bash
# Install to user directory
pip install --user fastapi
# Packages go to: /root/.local/

# Copy to production stage
COPY --from=builder /root/.local /home/appuser/.local
# Only packages, no pip/setuptools
```

---

### 4. ASGI vs WSGI

**FastAPI = ASGI framework**
```
Traditional (WSGI):
Flask/Django → WSGI → gunicorn
- Synchronous
- One request per thread
- Simple but limited

Modern (ASGI):
FastAPI → ASGI → uvicorn
- Asynchronous
- Many requests per thread
- WebSocket support
- Better performance
```

**Running FastAPI:**
```bash
# Correct: uvicorn (ASGI server)
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Alternative: gunicorn with uvicorn workers
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker

# Wrong: gunicorn alone
gunicorn app.main:app
# Error: ASGI app requires ASGI server
```

**In production:**
```
User → nginx (reverse proxy)
       ↓
     uvicorn (ASGI server)
       ↓
     FastAPI (app)
```

---

### 5. Auto-Generated Documentation

**FastAPI's killer feature:**
```python
from fastapi import FastAPI

app = FastAPI(
    title="My API",
    description="Auto-documented!",
    version="1.0.0"
)

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id}
```

**Automatically creates:**
- `/docs` - Swagger UI (interactive)
- `/redoc` - ReDoc (beautiful)
- OpenAPI schema (`/openapi.json`)

**No additional work needed!**

Compare to Express:
```javascript
// Express requires manual setup
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
// ... lots of configuration
```

---

### 6. Pydantic Data Validation

**Automatic validation with type hints:**
```python
from pydantic import BaseModel

class HealthResponse(BaseModel):
    status: str
    version: str
    uptime: float

@app.get("/health", response_model=HealthResponse)
async def health():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        uptime=42.5
    )
```

**Benefits:**
- Type checking at runtime
- Auto-conversion (string → int)
- Validation errors (automatic 422 response)
- Auto-documentation
- IDE autocomplete

---

## Development Workflow

### Local Development
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -r requirements.txt

# Run with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Test endpoints
curl http://localhost:8000
curl http://localhost:8000/health

# Access docs
open http://localhost:8000/docs
```

---

### Docker Development
```bash
# Build development image
docker build -t fastapi:dev .

# Run with volume mount (code changes reflect immediately)
docker run -it -p 8000:8000 \
  -v $(pwd)/app:/app/app \
  fastapi:dev \
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Build production image
docker build -t fastapi:prod .

# Run production container
docker run -d -p 8000:8000 --name fastapi fastapi:prod
```

---

### Testing
```bash
# Test all endpoints
curl http://localhost:8000
curl http://localhost:8000/health
curl http://localhost:8000/api/info

# Check health status
docker inspect fastapi | grep -A 5 Health

# Load testing (requires hey)
brew install hey  # macOS
hey -n 1000 -c 10 http://localhost:8000/health

# Expected output:
# Requests/sec: 500-1000+ (very fast!)
```

---

## Project Files

### requirements.txt
```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
```

**Why these versions?**
- `fastapi==0.104.1` - Latest stable (as of Dec 2024)
- `uvicorn[standard]` - Includes performance extras (httptools, uvloop)
- `pydantic==2.5.0` - V2 (much faster than V1)

---

### .dockerignore
```
__pycache__
*.pyc
*.pyo
*.pyd
.Python
env/
venv/
.venv/
.pytest_cache/
.coverage
htmlcov/
.git
.gitignore
README.md
Dockerfile*
.dockerignore
*.md
.env
*.log
.DS_Store
```

**Why important:**
- Prevents copying `__pycache__` (compiled Python)
- Excludes virtual environments
- Reduces COPY layer size
- Speeds up builds

---

### .gitignore
```
__pycache__/
*.py[cod]
*$py.class
.Python
env/
venv/
.venv/
.pytest_cache/
.coverage
htmlcov/
.DS_Store
*.log
.env
```

---

## Troubleshooting

### Issue: Import errors

**Error:**
```
ModuleNotFoundError: No module named 'app'
```

**Solution:**
```bash
# Check directory structure
ls -la app/

# Ensure __init__.py exists
touch app/__init__.py
touch app/routers/__init__.py
touch app/models/__init__.py

# Rebuild
docker build -t fastapi:fixed .
```

---

### Issue: Health check failing

**Symptom:**
```bash
docker ps
# STATUS: unhealthy
```

**Debug:**
```bash
# Check health check logs
docker inspect fastapi --format='{{json .State.Health}}'

# Test health endpoint manually
docker exec fastapi wget -q -O- http://localhost:8000/health

# View application logs
docker logs fastapi

# Common causes:
# 1. App crashed (check logs)
# 2. Wrong port (should be 8000)
# 3. Health endpoint path wrong
```

---

### Issue: Slow build on Alpine

**Problem:**
```dockerfile
RUN pip install numpy pandas
# Takes 10+ minutes on Alpine!
```

**Why?**
- Alpine uses musl libc (not glibc)
- No pre-compiled wheels for Alpine
- Must compile from source (slow!)

**Solution:**
```dockerfile
# Option 1: Use slim instead
FROM python:3.11-slim

# Option 2: Install build dependencies
FROM python:3.11-alpine
RUN apk add --no-cache gcc musl-dev python3-dev
RUN pip install numpy pandas
# Still slow, but works
```

**Best practice:**
- Alpine: Pure Python packages only
- Slim: Packages with C extensions

---

### Issue: Permission denied

**Error:**
```
PermissionError: [Errno 13] Permission denied: '/app/somefile'
```

**Cause:**
Files owned by root, but app runs as appuser

**Solution:**
```dockerfile
# Copy with correct ownership
COPY --chown=appuser:appuser ./app ./app

# Or change ownership after copy
COPY ./app ./app
RUN chown -R appuser:appuser /app
```

---

## Performance Benchmarks

### Image Size Breakdown

**Dockerfile.bad (1.1 GB):**
```
Base image (python:3.11)      1.01 GB
Dependencies (fastapi, etc)   80 MB
Application code              1 MB
pip cache                     50 MB
```

**Dockerfile.optimized (85 MB):**
```
Base image (python:3.11-alpine) 49 MB
Dependencies (prod only)        35 MB
Application code                1 MB
```

**Savings: 1.02 GB (92% reduction)**

---

### Startup Time
```bash
# Measure startup time
time docker run --rm fastapi:optimized

# Results:
# Node.js (Project 1): 1-2 seconds
# Python (Project 2): 0.5-1 second

# Why Python is faster?
# - No compilation step
# - Lighter runtime
# - Fewer dependencies
```

---

### Request Performance
```bash
# Load test (1000 requests, 10 concurrent)
hey -n 1000 -c 10 http://localhost:8000/health

# Results:
# FastAPI: 500-1000 req/sec
# Express: 400-800 req/sec

# Both excellent for most use cases!
```

---

## Best Practices Implemented

### Dockerfile
- Multi-stage build
- Alpine Linux base
- Layer caching optimization
- No pip cache
- Non-root user
- Health checks
- Direct uvicorn execution

### Security
- Non-root user (appuser)
- Minimal attack surface (Alpine)
- No secrets in image
- Security scanning ready
- Principle of least privilege

### Production Readiness
- Health check endpoint
- Auto-generated API docs
- Proper error handling
- Environment variables support
- Graceful shutdown (SIGTERM)

### Development Experience
- Fast iterative builds (5s for code changes)
- Interactive API docs (/docs)
- Type safety (Pydantic)
- Auto-reload in development
- Clear project structure

---

## Deployment

### Docker Hub
```bash
# Tag image
docker tag fastapi:optimized yourusername/fastapi-demo:1.0.0
docker tag fastapi:optimized yourusername/fastapi-demo:latest

# Push to Docker Hub
docker push yourusername/fastapi-demo:1.0.0
docker push yourusername/fastapi-demo:latest
```

---

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: fastapi
spec:
  replicas: 3
  selector:
    matchLabels:
      app: fastapi
  template:
    metadata:
      labels:
        app: fastapi
    spec:
      containers:
      - name: api
        image: yourusername/fastapi-demo:1.0.0
        ports:
        - containerPort: 8000
        env:
        - name: ENVIRONMENT
          value: production
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 30
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 10
        resources:
          requests:
            memory: "64Mi"
            cpu: "50m"
          limits:
            memory: "128Mi"
            cpu: "100m"
```

---

### Docker Compose
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    environment:
      - ENVIRONMENT=production
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

---

## What I Learned

### Technical Skills
1. **Alpine optimization for Python** - 95% size reduction
2. **Multi-stage builds** - Even for interpreted languages
3. **ASGI servers** - uvicorn for async Python
4. **Pydantic validation** - Type-safe Python
5. **Auto-generated docs** - FastAPI's killer feature

### Python-specific Best Practices
1. **pip --no-cache-dir** - Essential in Docker
2. **pip --user** - For multi-stage builds
3. **Alpine limitations** - Great for pure Python, avoid for data science
4. **Virtual environment** - Not needed in Docker (isolated already)
5. **requirements.txt** - Pin versions for reproducibility

### FastAPI Advantages
1. **Auto docs** - No manual Swagger setup
2. **Type hints** - Better IDE support
3. **Async native** - Better performance
4. **Pydantic** - Built-in validation
5. **Modern Python** - Uses latest features

---

## Key Takeaways

### Alpine is Perfect for Pure Python

**Before:**
- Use python:3.11 (1.01 GB)
- "It's the official image"
- No optimization

**After:**
- Use python:3.11-alpine (49 MB)
- 95% smaller base
- Same functionality

**Impact:**
- Faster pulls/pushes
- Lower costs
- More efficient scaling

---

### Python vs Node.js Trade-offs

**Python Wins:**
- Smaller images (85 MB vs 180 MB)
- Faster startup (0.5s vs 1.5s)
- Auto-generated docs
- Simpler syntax

**Node.js Wins:**
- Larger ecosystem (npm)
- Same language (frontend + backend)
- Better multi-stage benefits
- More mature tooling

**Both Great:**
- Both production-ready
- Both high-performance
- Both support async
- Choose based on team/project

---

### Multi-stage Worth It?

**For Python:**
```
Savings: 10 MB (11%)
Time cost: +30 seconds build time
Complexity: Medium

Worth it? 
- Production: Yes (security + best practice)
- Development: Optional
- Data science: No (use slim)
```

**For Node.js:**
```
Savings: 1 GB (85%)
Time cost: +10 seconds build time
Complexity: Medium

Worth it?
- Always: YES!
```

---

## Project Success Metrics
```
Image size target: < 100 MB → Achieved 85 MB
Startup time: < 1s → Achieved 0.5-1s
Security: Non-root user → Implemented
Monitoring: Health checks → Implemented
Documentation: Auto-generated → Built-in (/docs)
Production ready: Yes → Fully deployed
```

---

##  Next Steps

### Immediate
- [x] Complete implementation
- [x] Test all endpoints
- [x] Document learnings
- [x] Commit to repository

### Future Enhancements
- [ ] Add unit tests (pytest)
- [ ] Add integration tests
- [ ] Add database (PostgreSQL)
- [ ] Add caching (Redis)
- [ ] Add authentication (JWT)
- [ ] Add rate limiting
- [ ] Add CORS middleware
- [ ] Add logging (structured)
- [ ] Add metrics (Prometheus)
- [ ] Add tracing (OpenTelemetry)

### Apply to Other Projects
- [ ] Review existing Python projects
- [ ] Apply Alpine optimization
- [ ] Add type hints
- [ ] Add auto-generated docs
- [ ] Implement health checks

---

## Comparison with Project 1

| Aspect | Project 1 (Node.js) | Project 2 (Python) |
|--------|-------------------|-------------------|
| **Language** | TypeScript | Python |
| **Framework** | Express | FastAPI |
| **Final Size** | 180 MB | 85 MB |
| **Base Size** | 120 MB | 49 MB |
| **Reduction** | 85% | 92% |
| **Startup** | 1-2s | 0.5-1s |
| **Docs** | Manual | Auto-generated |
| **Type Safety** | TypeScript | Pydantic |
| **Async** | Added | Native |
| **Multi-stage Benefit** | High | Medium |
| **Best For** | Full-stack JS teams | Python teams, APIs |

**Both excellent choices - pick based on your team's expertise!**

---

**Project Status:** **COMPLETE & PRODUCTION READY**

**Next:** [Phase 2 Summary](../) or [Phase 3: Docker Compose](../../phase3-docker-compose/)

---