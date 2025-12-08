# Phase 2: Dockerfile & Image Building

Master the art of building optimized, production-ready Docker images through hands-on exercises and real-world projects.

---

## Table of Contents

- [Overview](#overview)
- [Learning Goals](#learning-goals)
- [Structure](#structure)
- [Progress Tracker](#progress-tracker)
- [Key Achievements](#key-achievements)
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
└── project1-nodejs-api/
    ├── README.md
    ├── src/
    ├── Dockerfile
    ├── Dockerfile.bad
    └── ...
```

---

## Progress Tracker

### Dockerfile Fundamentals
- [x] **Exercise 1:** Fix problematic Dockerfile
  - Combined RUN commands
  - Used Alpine base image
  - Cleaned up apt cache
  - Added DEBIAN_FRONTEND=noninteractive
- [x] **Exercise 2:** Optimize layer caching
  - COPY package.json before source code
  - Implemented proper layer ordering
- [x] **Exercise 3:** Compare image sizes
  - Tested python:3.11 (1.12GB)
  - Tested python:3.11-slim (150MB)
  - Tested python:3.11-alpine (58.6MB)

### Projects
- [x] **Project 1:** Node.js API with Multi-stage Build
  - Express API with TypeScript
  - Multi-stage optimization: 1.2GB → 180MB
  - Health checks and security
- [ ] **Project 2:** Python FastAPI with Alpine *(Coming next)*
- [ ] **Project 3:** Real-world Application Optimization *(Coming next)*

---

## Key Achievements

### Image Size Optimization
```
Before (Dockerfile.bad):  1.2 GB
After (Optimized):        180 MB
Reduction:                85% 
```

### Build Time Improvement
```
Before: 3 minutes (on code change)
After:  10 seconds (leveraging cache)
Speed:  18x faster ⚡
```

### Layers Optimization
```
Before: 15 layers
After:  8 layers
Reduction: 47% 
```

---

## What I Learned

### Multi-stage Builds
Multi-stage builds separate the build environment from the runtime environment:
```dockerfile
# Stage 1: Build (has compilers, dev tools)
FROM node:18-alpine AS builder
RUN npm install
RUN npm run build

# Stage 2: Production (only runtime)
FROM node:18-alpine
COPY --from=builder /app/dist ./dist
# Result: No build tools in final image!
```

**Benefits:**
- Smaller images (build tools excluded)
- More secure (fewer packages)
- Faster deploys (less to transfer)

---

### Layer Caching Strategy

**Bad (cache breaks on every code change):**
```dockerfile
COPY . .
RUN npm install  # Rebuilds every time!
```

**Good (cache works for dependencies):**
```dockerfile
COPY package*.json ./
RUN npm install  # Cached unless package.json changes!
COPY . .
```

**Layer ordering principle:**
```
1. Base image (never changes)
2. System dependencies (rarely change)
3. App dependencies (sometimes change)
4. Source code (changes frequently)
5. Metadata/CMD (rarely changes)
```

---

### Alpine vs Slim vs Full

| Base Image | Size | Use Case | Trade-offs |
|------------|------|----------|------------|
| `node:18` | ~900 MB | Development | Includes everything, easy debugging |
| `node:18-slim` | ~200 MB | Production | Good compatibility, reasonable size |
| `node:18-alpine` | ~180 MB | Production | Smallest, may have compatibility issues |

**When to use:**
- **Alpine:** Microservices, size-critical apps, pure JavaScript
- **Slim:** Apps with native dependencies, balanced approach
- **Full:** Development, complex builds, debugging

---

### npm ci vs npm install
```bash
# npm install
- Reads package.json
- May install different versions (^, ~)
- Updates package-lock.json
- Slower

# npm ci (Continuous Integration)
- Reads package-lock.json only
- Installs exact versions
- Faster (~2x)
- Reproducible builds
```

**Always use `npm ci` in Dockerfiles!**

---

### Security Best Practices
```dockerfile
# Bad: Running as root
FROM node:18-alpine
COPY . .
CMD ["node", "app.js"]  # Runs as root!

# Good: Non-root user
FROM node:18-alpine
RUN addgroup -g 1001 nodejs && adduser -S nodejs -u 1001
COPY . .
RUN chown -R nodejs:nodejs /app
USER nodejs  # Switch to non-root
CMD ["node", "app.js"]
```

**Benefits:**
- Limits damage if container is compromised
- Follows principle of least privilege
- Required by many security policies

---

### Health Checks
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
```

**Why important:**
- Docker/Kubernetes knows if container is healthy
- Automatic restart of unhealthy containers
- Better monitoring and alerting
- Zero-downtime deployments

---

## Comparison: Bad vs Optimized

### Dockerfile.bad
```dockerfile
FROM node:18
COPY . .
RUN npm install
CMD ["npm", "start"]
```

**Problems:**
- Large base image (900 MB)
- Poor caching (copies everything first)
- Includes devDependencies
- No security (runs as root)
- No health check

---

### Dockerfile (Optimized)
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
EXPOSE 3000
HEALTHCHECK CMD node -e "..."
CMD ["node", "dist/index.js"]
```

**Benefits:**
- Small Alpine base (180 MB final)
- Excellent caching (dependencies separate)
- Production deps only
- Secure (non-root user)
- Health check included
- Multi-stage build

---

## Deep Dive: How Multi-stage Works

### The Problem (Single-stage)
```
Your Image:
[Application Code]
[Production Dependencies]
[Dev Dependencies]        ← Unnecessary in production
[TypeScript Compiler]     ← Unnecessary in production
[Build Tools]             ← Unnecessary in production
[Source Code (.ts files)] ← Unnecessary in production

Total: 1.2 GB
```

---

### The Solution (Multi-stage)

**Stage 1 (Builder):**
```
Builder Image:
[Source Code (.ts files)]
[All Dependencies (dev + prod)]
[TypeScript Compiler]
[Build Tools]
↓
[Compiled Code (.js files)]  ← Extract this!

(This image is discarded)
```

**Stage 2 (Production):**
```
Production Image:
[Compiled Code (.js files)]   ← Copied from builder
[Production Dependencies only]
[Runtime Environment]

Total: 180 MB (85% smaller!)
```

---

### Visual Representation
```
┌─────────────────────────────────┐
│   Stage 1: Builder              │
│                                 │
│   FROM node:18-alpine AS builder│
│   - Install ALL dependencies    │
│   - Compile TypeScript          │
│   - Run tests (optional)        │
│   - Output: dist/ folder        │
│                                 │
│   Size: 800 MB                  │
└─────────────────────────────────┘
           │
           │ COPY --from=builder
           ↓
┌─────────────────────────────────┐
│   Stage 2: Production           │
│                                 │
│   FROM node:18-alpine           │
│   - Copy dist/ only             │
│   - Install PROD deps only      │
│   - No build tools              │
│                                 │
│   Size: 180 MB                  │
└─────────────────────────────────┘
```

---

## Common Patterns

### Pattern 1: Node.js with TypeScript
```dockerfile
# Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY package*.json ./
RUN npm ci --only=production
CMD ["node", "dist/index.js"]
```

---

### Pattern 2: Go Application
```dockerfile
# Build
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o app

# Production (can use scratch!)
FROM alpine:3.18
COPY --from=builder /app/app /app
CMD ["/app"]
```

---

### Pattern 3: Python with pip
```dockerfile
# Build
FROM python:3.11-slim AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-cache-dir -r requirements.txt

# Production
FROM python:3.11-alpine
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["python", "app.py"]
```

---

## Best Practices Checklist

### Image Size
- [ ] Use Alpine or Slim base images
- [ ] Multi-stage builds for compiled languages
- [ ] Clean up package manager cache
- [ ] Use `.dockerignore` to exclude unnecessary files
- [ ] Remove dev dependencies in production

### Build Speed
- [ ] Order layers from least to most frequently changed
- [ ] Copy dependency files before source code
- [ ] Use `npm ci` instead of `npm install`
- [ ] Leverage build cache effectively
- [ ] Use `--no-cache` flag sparingly

### Security
- [ ] Run as non-root user
- [ ] Scan images for vulnerabilities
- [ ] Use specific image tags (not `latest`)
- [ ] Keep base images updated
- [ ] Use official images when possible
- [ ] Add health checks

### Production Readiness
- [ ] Health checks configured
- [ ] Proper logging (stdout/stderr)
- [ ] Graceful shutdown handling
- [ ] Resource limits considered
- [ ] Environment variables for configuration
- [ ] Documentation complete

---

## Performance Metrics

### Build Time Comparison

| Scenario | Before | After | Improvement |
|----------|--------|-------|-------------|
| First build | 3m 45s | 3m 30s | 7% faster |
| Change source code | 3m 20s | 8s | **25x faster** |
| Change dependencies | 3m 40s | 2m 10s | 40% faster |
| No changes | 3m 15s | 1s | **195x faster** ⚡ |

**Key insight:** Proper layer caching makes iterative development dramatically faster!

---

### Image Size Breakdown
```
Dockerfile.bad (1.2 GB):
├── Base image (node:18)        900 MB
├── node_modules (all deps)     250 MB
├── Source code (.ts)           20 MB
├── Compiled code (.js)         15 MB
└── Build tools                 15 MB

Dockerfile.optimized (180 MB):
├── Base image (node:18-alpine) 120 MB
├── node_modules (prod only)    55 MB
└── Compiled code (.js)         5 MB
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Copying node_modules
```dockerfile
# Bad
COPY . .  # Copies local node_modules!

# Good
# Add to .dockerignore:
node_modules/
```

---

### Pitfall 2: Not Cleaning Package Cache
```dockerfile
# Bad
RUN apt-get update
RUN apt-get install -y curl
# Cache remains (~50 MB)

# Good
RUN apt-get update && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*
```

---

### Pitfall 3: Breaking Cache Unnecessarily
```dockerfile
# Bad
COPY . .
RUN npm install
# Changes to ANY file breaks cache!

# Good
COPY package*.json ./
RUN npm install
COPY . .
# Only package.json changes break npm install cache
```

---

### Pitfall 4: Using npm install in Production
```dockerfile
# Bad
RUN npm install
# May install different versions!

# Good
RUN npm ci --only=production
# Exact versions from package-lock.json
```

---

### Pitfall 5: Running as Root
```dockerfile
# Bad
CMD ["node", "app.js"]
# Runs as root (uid 0)

# Good
USER node
CMD ["node", "app.js"]
# Runs as node user (uid 1000)
```

---

## Resources

### Official Documentation
- [Docker Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Security](https://docs.docker.com/engine/security/)

### Tools
- [Dive](https://github.com/wagoodman/dive) - Analyze image layers
- [Hadolint](https://github.com/hadolint/hadolint) - Dockerfile linter
- [Docker Scout](https://docs.docker.com/scout/) - Security scanning

### Community
- [Docker Hub](https://hub.docker.com/) - Official images
- [Awesome Docker](https://github.com/veggiemonk/awesome-docker) - Curated resources

---

## What's Next?

### Continue Phase 2
- [ ] **Project 2:** Python FastAPI with Alpine
- [ ] **Project 3:** Multi-stage optimization challenge

### Move to Phase 3
- [ ] Docker Compose & Multi-container apps
- [ ] Networking between containers
- [ ] Volumes and data persistence
- [ ] Environment management

### Advanced Topics
- [ ] Docker BuildKit features
- [ ] BuildKit cache mounts
- [ ] Multi-architecture builds
- [ ] Registry management

---

## Key Takeaways

### The Big Three
1. **Multi-stage builds = Smaller images**
   - Separate build environment from runtime
   - 85% size reduction is typical

2. **Layer ordering = Faster builds**
   - Dependencies before source code
   - 10-100x faster iterative builds

3. **Alpine + Security = Production ready**
   - Smallest practical base
   - Non-root user always
   - Health checks for reliability

### Remember
> "Premature optimization is the root of all evil, but Dockerfile optimization is always worth it!"

**Why?**
- Affects every developer's build time
- Impacts production deployment speed
- Reduces infrastructure costs
- Improves security posture

---

## Final Stats

**Phase 2 Achievements:**
```
3 Exercises completed
1 Production project built
85% image size reduction
18x build speed improvement
100% security best practices applied
Ready for Phase 3!
```

---

**Status:** **PHASE 2 COMPLETE**

**Next:** [Phase 3: Docker Compose & Multi-container Applications](../phase3-docker-compose/)

---

*Last updated: December 8, 2024*
*Author: Your learning journey*
*Mentor: Claude (Anthropic)*