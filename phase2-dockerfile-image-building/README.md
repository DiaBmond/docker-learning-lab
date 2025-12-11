# Phase 2: Dockerfile & Image Building

Master the art of building optimized, production-ready Docker images through hands-on exercises and real-world projects.

---

## Table of Contents

- [Overview](#overview)
- [Learning Goals](#learning-goals)
- [Structure](#structure)
- [Progress Tracker](#progress-tracker)
- [Key Achievements](#key-achievements)
- [Project Comparisons](#project-comparisons)
- [What I Learned](#what-i-learned)
- [Common Patterns](#common-patterns)
- [Best Practices](#best-practices)
- [Performance Metrics](#performance-metrics)
- [Common Pitfalls](#common-pitfalls)
- [Resources](#resources)
- [What's Next](#whats-next)

---

## Overview

Phase 2 focuses on **Dockerfile creation** and **image optimization**. You'll learn to build production-ready images that are:
- **Small** - Optimized size using multi-stage builds
- **Fast** - Leveraging layer caching
- **Secure** - Running as non-root users
- **Reproducible** - Consistent builds across environments

---

## Learning Goals

By the end of Phase 2, you will be able to:

### Core Skills
- Write optimized Dockerfiles from scratch
- Use multi-stage builds to reduce image size
- Implement layer caching strategies
- Choose appropriate base images (Alpine vs Slim vs Full)
- Secure images with non-root users
- Add health checks for monitoring

### Advanced Concepts
- Understand Docker layer architecture
- Optimize build times for rapid iteration
- Apply best practices for production deployments
- Compare and benchmark different approaches

---

## Structure
```
phase2-dockerfile-image-building/
├── README.md (this file)
├── dockerfile-fundamentals/
│   ├── README.md
│   ├── exercise1-fix-the-dockerfile/
│   ├── exercise2-optimize-for-cache/
│   └── exercise3-compare-image-sizes/
├── project1-nodejs-api/
│   ├── README.md
│   ├── src/
│   ├── Dockerfile
│   └── Dockerfile.bad
├── project2-python-fastapi/
│   ├── README.md
│   ├── app/
│   ├── Dockerfile
│   └── Dockerfile.bad
└── project3-optimization-challenge/
    ├── README.md
    ├── app/
    ├── Dockerfile.original
    └── Dockerfile.optimized
```

---

## Progress Tracker

### Dockerfile Fundamentals
- [x] **Exercise 1:** Fix problematic Dockerfile
  - Combined RUN commands
  - Used Alpine base image
  - Cleaned up apt cache
  - Added DEBIAN_FRONTEND=noninteractive
  - **Score:** 95/100
  
- [x] **Exercise 2:** Optimize layer caching
  - COPY package.json before source code
  - Implemented proper layer ordering
  - **Score:** 100/100
  
- [x] **Exercise 3:** Compare image sizes
  - Tested python:3.11 (1.12GB)
  - Tested python:3.11-slim (150MB)
  - Tested python:3.11-alpine (58.6MB)
  - **Score:** 100/100

### Projects
- [x] **Project 1:** Node.js API with Multi-stage Build
  - Express API with TypeScript
  - Multi-stage optimization: 1.2GB → 180MB (85% reduction)
  - Health checks and security
  - Build time: 3min → 10sec (18x faster)
  - **Status:** Complete
  
- [x] **Project 2:** Python FastAPI with Alpine
  - FastAPI with async support
  - Alpine optimization: 1.1GB → 85MB (92% reduction)
  - Auto-generated API docs
  - Startup time: 0.5-1 second
  - **Status:** Complete
  
- [x] **Project 3:** Full-stack Optimization Challenge
  - React + Express monorepo
  - Three-stage build: 1.17GB → 131MB (89% reduction)
  - Separate frontend/backend builds
  - Build time: 8min → 25sec (19x faster)
  - **Status:** Complete

---

## Key Achievements

### Overall Phase 2 Results

**Total Size Savings:**
```
Project 1: 1.02 GB saved (85% reduction)
Project 2: 1.03 GB saved (92% reduction)
Project 3: 1.04 GB saved (89% reduction)
─────────────────────────────────────────
Total:     3.09 GB saved! 
```

**Build Time Improvements:**
```
Project 1: 3min → 10sec  (18x faster)
Project 2: 2min → 5sec   (24x faster)
Project 3: 8min → 25sec  (19x faster)
```

**Security & Best Practices:**
```
Non-root users in all projects
Health checks implemented
Layer caching optimized
Production dependencies only
Multi-stage builds mastered
```

---

## Project Comparisons

### Size Comparison

| Project | Language | Original | Optimized | Reduction | Winner |
|---------|----------|----------|-----------|-----------|--------|
| Project 1 | Node.js/TS | 1.2 GB | 180 MB | 85% | - |
| Project 2 | Python | 1.1 GB | **85 MB** | 92% | 🏆 |
| Project 3 | React+Node | 1.17 GB | 131 MB | 89% | - |

**Why Python wins:**
- Smaller base image (49 MB vs 120 MB)
- No compilation needed
- Lighter runtime dependencies

---

### Complexity Comparison

| Aspect | Project 1 | Project 2 | Project 3 |
|--------|-----------|-----------|-----------|
| **Stages** | 2 | 2 | **3** |
| **Languages** | TypeScript | Python | TypeScript (Both) |
| **Compilation** | Yes (tsc) | No | Yes (tsc + webpack) |
| **Complexity** | Medium | Low | **High** |
| **Multi-stage Benefit** | High | Medium | **Very High** |

---

### Technology Stack

**Project 1: Node.js API**
- Framework: Express
- Language: TypeScript
- Server: Direct node execution
- Docs: Manual setup

**Project 2: Python API**
- Framework: FastAPI
- Language: Python
- Server: uvicorn (ASGI)
- Docs: Auto-generated (/docs)

**Project 3: Full-stack**
- Frontend: React + webpack
- Backend: Express + TypeScript
- Architecture: Monorepo
- Deployment: Single container

---

## What I Learned

### 1. Multi-stage Builds

**Impact by Language:**
```
TypeScript/Compiled (Project 1 & 3):
├── Single-stage: 1.2 GB
├── Multi-stage:  180 MB
└── Savings:      1.02 GB (85%)

Why so effective?
- Excludes TypeScript compiler
- Excludes webpack/build tools
- Excludes source .ts files
- Excludes devDependencies
```
```
Python/Interpreted (Project 2):
├── Single-stage: 95 MB
├── Multi-stage:  85 MB
└── Savings:      10 MB (11%)

Why less impact?
- No compilation needed
- Only excludes pip/setuptools
- Pure Python benefits less
```

**Key Insight:** Multi-stage is **essential** for compiled languages, **nice-to-have** for interpreted languages.

---

### 2. Base Image Selection

**Comparison Across Projects:**

| Base Image | Node.js | Python | When to Use |
|------------|---------|--------|-------------|
| **Full** | 900 MB | 1.01 GB | Development only |
| **Slim** | 200 MB | 126 MB | Production (compatible) |
| **Alpine** | 120 MB | **49 MB** | Production (smallest) |

**Alpine Performance:**
- Node.js Project: 780 MB saved (87%)
- Python Project: 970 MB saved (96%)
- Full-stack Project: 780 MB saved (87%)

**When Alpine Works:**
- Pure JavaScript/TypeScript
- Pure Python
- No native dependencies

**When Alpine Struggles:**
- numpy, pandas (needs compilation)
- Complex C extensions
- Use slim instead

---

### 3. Layer Caching Strategy

**The Universal Pattern:**
```dockerfile
# Optimal order for all languages
FROM base-image

WORKDIR /app

# 1. Copy dependency files (rarely change)
COPY package.json package-lock.json ./  # Node.js
COPY requirements.txt ./                # Python

# 2. Install dependencies (cached unless above changes)
RUN npm ci --only=production
RUN pip install --no-cache-dir -r requirements.txt

# 3. Copy source code (changes frequently)
COPY . .

# 4. Build if needed
RUN npm run build  # Only for compiled languages

# 5. Metadata (rarely changes)
CMD ["node", "app.js"]
```

**Build Time Impact:**

| Scenario | No Caching | With Caching | Improvement |
|----------|------------|--------------|-------------|
| First build | 3 min | 3 min | Same |
| Code change | 3 min | **10 sec** | **18x faster** |
| Dep change | 3 min | 2 min | 33% faster |
| No changes | 3 min | **1 sec** | **180x faster** |

---

### 4. Security Best Practices

**Implemented in All Projects:**
```dockerfile
# Create non-root user (Alpine syntax)
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

# Copy files and set ownership
COPY --chown=appuser:appuser ./app ./app

# Switch to non-root user
USER appuser

# Application runs with limited privileges
CMD ["node", "app.js"]
```

**Why This Matters:**
```
Root user (uid 0):
- Full system access
- Can modify any file
- Can install software
- High security risk

Non-root user (uid 1001):
- Limited permissions
- Cannot modify system
- Cannot install packages
- Low security risk
```

**Real-world Impact:**
- Passes security scans
- Complies with policies
- Reduces attack surface
- Required by Kubernetes

---

### 5. Health Checks

**Implementation Patterns:**

**Node.js:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
```

**Python:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health').read()" || exit 1
```

**Benefits:**
- Auto-restart unhealthy containers
- Better monitoring/alerting
- Zero-downtime deployments
- Kubernetes integration

---

### 6. Package Manager Best Practices

**Node.js:**
```dockerfile
# Best practice
RUN npm ci --only=production && npm cache clean --force

Why npm ci?
- Faster (~2x)
- Reproducible (uses package-lock.json)
- Fails if package.json doesn't match lock file

Why --only=production?
- Excludes devDependencies
- Saves 100-200 MB
```

**Python:**
```dockerfile
# Best practice
RUN pip install --no-cache-dir -r requirements.txt

Why --no-cache-dir?
- pip cache: 50-100 MB
- Not needed in Docker
- Saves space
```

---

### 7. Language-Specific Insights

**TypeScript (Projects 1 & 3):**
```
Multi-stage benefit: Very High
Reason: Must exclude compiler and build tools

Build Stage needs:
- typescript
- webpack
- @types/*
- ts-loader

Production Stage needs:
- None of above!
- Only compiled .js files

Savings: 500+ MB
```

**Python (Project 2):**
```
Multi-stage benefit: Medium
Reason: No compilation, only pip/setuptools

Build Stage needs:
- pip
- setuptools
- wheel

Production Stage needs:
- Installed packages only

Savings: 10-20 MB
```

**React (Project 3):**
```
Multi-stage benefit: Very High
Reason: webpack and all build tools

Build Stage needs:
- webpack
- babel
- loaders
- plugins

Production Stage needs:
- Static files only (HTML/JS/CSS)

Savings: 600+ MB
```

---

## Common Patterns

### Pattern 1: Node.js with TypeScript (Projects 1 & 3)
```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
RUN addgroup -g 1001 nodejs && adduser -S nodejs -u 1001
COPY package*.json ./
COPY --from=builder /app/dist ./dist
RUN npm ci --only=production
RUN chown -R nodejs:nodejs /app
USER nodejs
CMD ["node", "dist/index.js"]
```

**Use for:** APIs, backends, any TypeScript service

---

### Pattern 2: Python with FastAPI (Project 2)
```dockerfile
# Build stage
FROM python:3.11-alpine AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Production stage
FROM python:3.11-alpine
WORKDIR /app
RUN addgroup -g 1001 appuser && adduser -S appuser -u 1001
COPY --from=builder /root/.local /home/appuser/.local
COPY --chown=appuser:appuser ./app ./app
ENV PATH=/home/appuser/.local/bin:$PATH
USER appuser
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Use for:** FastAPI, Flask, any Python web service

---

### Pattern 3: Full-stack Monorepo (Project 3)
```dockerfile
# Frontend build stage
FROM node:18-alpine AS frontend-builder
WORKDIR /app/frontend
COPY app/frontend/package*.json ./
RUN npm install
COPY app/frontend/ ./
RUN npm run build

# Backend build stage
FROM node:18-alpine AS backend-builder
WORKDIR /app/backend
COPY app/backend/package*.json ./
RUN npm install
COPY app/backend/ ./
RUN npm run build

# Production stage
FROM node:18-alpine
WORKDIR /app
RUN addgroup -g 1001 nodejs && adduser -S nodejs -u 1001
COPY app/backend/package*.json ./
RUN npm install --only=production
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=frontend-builder /app/frontend/build ./dist/public
RUN chown -R nodejs:nodejs /app
USER nodejs
CMD ["node", "dist/index.js"]
```

**Use for:** React+API, Vue+API, any SPA+backend

---

### Pattern 4: Go Application (Bonus)
```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o app

# Production stage (smallest possible!)
FROM alpine:3.18
RUN apk add --no-cache ca-certificates
COPY --from=builder /app/app /app
RUN adduser -D appuser
USER appuser
CMD ["/app"]
```

**Use for:** Go microservices, CLI tools

---

## Best Practices Checklist

### Image Size
- [x] Use Alpine or Slim base images
- [x] Multi-stage builds for compiled languages
- [x] Clean up package manager cache
- [x] Use `.dockerignore` to exclude unnecessary files
- [x] Remove dev dependencies in production
- [x] Combine related RUN commands
- [x] Remove temporary files in same layer

### Build Speed
- [x] Order layers from least to most frequently changed
- [x] Copy dependency files before source code
- [x] Use `npm ci` instead of `npm install`
- [x] Use `pip --no-cache-dir`
- [x] Leverage build cache effectively
- [x] Separate build stages for parallel builds

### Security
- [x] Run as non-root user
- [x] Use specific image tags (not `latest`)
- [x] Add health checks
- [x] Scan images for vulnerabilities
- [x] Keep base images updated
- [x] Use official images when possible
- [x] Set proper file ownership

### Production Readiness
- [x] Health checks configured
- [x] Proper logging (stdout/stderr)
- [x] Graceful shutdown handling
- [x] Environment variables for configuration
- [x] Documentation complete
- [x] Resource limits considered
- [x] Auto-generated docs (Python)

---

## Performance Metrics

### Build Time Comparison

**Project 1 (Node.js):**
| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| First build | 3m 45s | 3m 30s | 7% faster |
| Code change | 3m 20s | **8s** | **25x faster** ⚡ |
| Dep change | 3m 40s | 2m 10s | 40% faster |
| No changes | 3m 15s | **1s** | **195x faster** 🚀 |

**Project 2 (Python):**
| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| First build | 2m 30s | 2m 15s | 10% faster |
| Code change | 2m 25s | **5s** | **29x faster** ⚡ |
| Dep change | 2m 30s | 1m 30s | 40% faster |
| No changes | 2m 20s | **1s** | **140x faster** 🚀 |

**Project 3 (Full-stack):**
| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| First build | 8m 15s | 2m 45s | 3x faster |
| Frontend change | 8m 10s | **30s** | **16x faster** ⚡ |
| Backend change | 8m 5s | **25s** | **19x faster** ⚡ |
| No changes | 8m 0s | **1s** | **480x faster** 🚀 |

---

### Image Size Breakdown

**Project 1 Breakdown:**
```
Dockerfile.bad (1.2 GB):
├── Base (node:18)           900 MB
├── All dependencies         250 MB
├── Source + compiled        35 MB
└── Build tools             15 MB

Dockerfile.optimized (180 MB):
├── Base (node:18-alpine)    120 MB
├── Prod dependencies        55 MB
└── Compiled JS             5 MB
```

**Project 2 Breakdown:**
```
Dockerfile.bad (1.1 GB):
├── Base (python:3.11)       1.01 GB
├── Dependencies            80 MB
└── Source code             1 MB

Dockerfile.optimized (85 MB):
├── Base (python:3.11-alpine) 49 MB
├── Dependencies            35 MB
└── Source code             1 MB
```

**Project 3 Breakdown:**
```
Dockerfile.original (1.17 GB):
├── Base (node:18)           900 MB
├── All node_modules         250 MB
├── Source files            20 MB

Dockerfile.optimized (131 MB):
├── Base (node:18-alpine)    120 MB
├── Backend deps            8 MB
├── Compiled backend        2 MB
└── Frontend static         1 MB
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Copying node_modules

**Problem:**
```dockerfile
COPY . .  # Copies local node_modules!
```

**Solution:**
```
# .dockerignore
node_modules/
npm-debug.log
```

**Impact:** Saves 100-300 MB, prevents platform mismatch

---

### Pitfall 2: Not Cleaning Package Cache

**Problem:**
```dockerfile
RUN apt-get update
RUN apt-get install -y curl
# Cache remains (~50 MB)
```

**Solution:**
```dockerfile
RUN apt-get update && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
```

**Impact:** Saves 50-100 MB per layer

---

### Pitfall 3: Breaking Cache Unnecessarily

**Problem:**
```dockerfile
COPY . .
RUN npm install
# Any file change → npm install rebuilds
```

**Solution:**
```dockerfile
COPY package*.json ./
RUN npm install
COPY . .
# Only package.json change → npm install rebuilds
```

**Impact:** 10-100x faster builds

---

### Pitfall 4: Using npm install in Production

**Problem:**
```dockerfile
RUN npm install
# May install different versions!
```

**Solution:**
```dockerfile
RUN npm ci --only=production
# Exact versions from package-lock.json
```

**Impact:** Reproducible builds, 2x faster

---

### Pitfall 5: Running as Root

**Problem:**
```dockerfile
CMD ["node", "app.js"]
# Runs as root (uid 0)
```

**Solution:**
```dockerfile
USER node  # or create custom user
CMD ["node", "app.js"]
# Runs as non-root
```

**Impact:** Security compliance, reduced risk

---

### Pitfall 6: Monorepo npm ci Issues

**Problem:**
```dockerfile
# In subdirectory
COPY package*.json ./
RUN npm ci  # Fails: no package-lock.json
```

**Solution:**
```dockerfile
# Option 1: Use npm install
RUN npm install

# Option 2: Create separate lock files
# Run npm install in each subdirectory
# Commit package-lock.json files
```

**Impact:** Builds work with workspaces

---

## Resources

### Official Documentation
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Security](https://docs.docker.com/engine/security/)
- [.dockerignore](https://docs.docker.com/engine/reference/builder/#dockerignore-file)

### Tools Used
- [Dive](https://github.com/wagoodman/dive) - Analyze image layers
- [Hadolint](https://github.com/hadolint/hadolint) - Dockerfile linter
- [Docker Scout](https://docs.docker.com/scout/) - Security scanning
- [hey](https://github.com/rakyll/hey) - HTTP load testing

### Community Resources
- [Docker Hub](https://hub.docker.com/) - Official images
- [Awesome Docker](https://github.com/veggiemonk/awesome-docker) - Curated resources
- [Docker Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html)

---

## What's Next?

### Phase 3: Docker Compose & Multi-container Applications
- [ ] Learn docker-compose.yml syntax
- [ ] Connect multiple containers
- [ ] Set up networks and volumes
- [ ] Manage environments
- [ ] Deploy multi-service apps

### Advanced Docker Topics
- [ ] Docker BuildKit advanced features
- [ ] BuildKit cache mounts
- [ ] Multi-architecture builds (arm64, amd64)
- [ ] Private registry management
- [ ] Image signing and verification

### DevOps Integration
- [ ] CI/CD pipelines (GitHub Actions)
- [ ] Kubernetes deployments
- [ ] Helm charts
- [ ] Monitoring and logging
- [ ] Auto-scaling strategies

---

## Key Takeaways

### The Big Three Principles

**1. Multi-stage Builds = Smaller Images**
```
Before: Everything in one image
After:  Build stage + Production stage
Result: 85-92% size reduction

Impact:
- Faster deployments
- Lower bandwidth costs
- Reduced attack surface
- Better security
```

**2. Layer Caching = Faster Builds**
```
Before: 3-8 minutes per build
After:  1-30 seconds per build
Result: 10-480x faster

Impact:
- Happy developers
- Faster iteration
- More productive team
- Lower CI costs
```

**3. Alpine + Security = Production Ready**
```
Before: Large images, root user
After:  Alpine base, non-root user
Result: Secure, compliant images

Impact:
- Passes security scans
- Meets compliance requirements
- Reduces vulnerabilities
- Production-grade quality
```

---

### Remember

> "Optimization is not optional in production Docker images. It affects deployment speed, infrastructure costs, and security posture."

**Why These Optimizations Matter:**
- Affects every developer's build time
- Impacts production deployment speed
- Reduces infrastructure costs (bandwidth, storage)
- Improves security posture
- Enables better scaling

---

## Final Phase 2 Statistics
```
3 Exercises completed (100%)
3 Production projects built
3.09 GB total size saved
85-92% average size reduction
10-480x build speed improvements
100% security best practices applied
3 comprehensive READMEs created
Multiple deployment patterns learned
Ready for Phase 3!
```

---

**Status:** **PHASE 2 COMPLETE**

**Achievement Unlocked:** **Docker Optimization Master**

**Next:** [Phase 3: Docker Compose & Multi-container Applications](../phase3-docker-compose/)

---

*Phase completed: December 8, 2024*  
*Total time invested: ~8-10 hours*  
*Projects built: 3*  
*Skills mastered: Dockerfile optimization, multi-stage builds, security, layer caching*  
*Author: Your learning journey*  
*Mentor: Claude (Anthropic)*