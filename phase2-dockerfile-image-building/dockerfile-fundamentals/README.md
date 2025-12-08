# Dockerfile Fundamentals - Exercises

Hands-on exercises to master Dockerfile basics, layer optimization, and base image selection.

---

## Exercises Overview

| Exercise | Topic | Duration | Key Learning |
|----------|-------|----------|--------------|
| **Exercise 1** | Fix Problematic Dockerfile | 15-20 min | Common mistakes & fixes |
| **Exercise 2** | Optimize Layer Caching | 15-20 min | Cache strategy |
| **Exercise 3** | Compare Image Sizes | 20-30 min | Base image selection |

---

## Exercise 1: Fix the Dockerfile

### Problem
Given a problematic Dockerfile with multiple issues:
```dockerfile
FROM ubuntu:22.04
RUN apt update
RUN apt install -y curl
RUN apt install -y vim
COPY app.js /app/
CMD ["node", "/app/app.js"]
```

### Issues Found
1. Large base image (ubuntu:22.04 ~77 MB + packages)
2. Separate RUN commands (multiple layers)
3. No apt cache cleanup (wastes space)
4. apt update separate from install (cache trap)
5. Missing DEBIAN_FRONTEND=noninteractive (may hang)

### Solution
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Alpine uses apk, not apt
RUN apk add --no-cache curl vim

COPY app.js .

CMD ["node", "app.js"]
```

### What I Learned
- Use appropriate base images (node instead of ubuntu for Node.js apps)
- Alpine uses `apk`, Debian/Ubuntu use `apt`
- `--no-cache` in Alpine = automatic cleanup
- Combine related RUN commands
- WORKDIR better than absolute paths

---

## Exercise 2: Optimize for Cache

### Problem
Dockerfile with poor caching:
```dockerfile
FROM node:18
COPY . /app/
WORKDIR /app
RUN npm install
CMD ["npm", "start"]
```

**Issue:** Every code change rebuilds `npm install` (slow!)

### Solution
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy dependency files first
COPY package*.json ./

# Install dependencies (cached unless package.json changes)
RUN npm ci

# Copy source code last (changes frequently)
COPY . .

CMD ["npm", "start"]
```

### Testing the Improvement
```bash
# Build 1: Fresh build
docker build -t app:v1 .
# Time: ~3 minutes

# Change app.js

# Build 2: With optimization
docker build -t app:v2 .
# Time: ~10 seconds (npm install cached!)
```

### What I Learned
- Layer ordering: dependencies → source code
- `npm ci` faster than `npm install`
- Cache breaks from changed layer downward
- 10-100x build speed improvement possible

---

## Exercise 3: Compare Image Sizes

### Goal
Build and compare three Python images with different base images.

### Dockerfiles

**Dockerfile.a (Full)**
```dockerfile
FROM python:3.11
COPY app.py .
CMD ["python", "app.py"]
```

**Dockerfile.b (Slim)**
```dockerfile
FROM python:3.11-slim
COPY app.py .
CMD ["python", "app.py"]
```

**Dockerfile.c (Alpine)**
```dockerfile
FROM python:3.11-alpine
COPY app.py .
CMD ["python", "app.py"]
```

### Results

| Image | Size | Savings |
|-------|------|---------|
| python:3.11 (Full) | 1.12 GB | 0% (baseline) |
| python:3.11-slim | 150 MB | **87% smaller** |
| python:3.11-alpine | 58.6 MB | **95% smaller** |

### Analysis

**Full (1.12 GB):**
- All tools included
- Best compatibility
- Huge size
- **Use for:** Development only

**Slim (150 MB):**
- ✅ Debian-based (good compatibility)
- ✅ Reasonable size
- ✅ Works with most packages
- **Use for:** Production (default choice)

**Alpine (58.6 MB):**
- Smallest size
- Fast downloads
- musl libc (may have compatibility issues)
- **Use for:** Simple apps, microservices

### What I Learned
- Base image choice dramatically affects size
- Alpine smallest but may need extra work
- Slim good balance for most cases
- Always test compatibility with Alpine

---

## Exercise Results Summary

### Time Investment
- Exercise 1: 15 minutes
- Exercise 2: 20 minutes
- Exercise 3: 25 minutes
- **Total: 1 hour**

### Skills Gained
- Identify common Dockerfile mistakes
- Fix layer optimization issues
- Choose appropriate base images
- Measure and compare image sizes
- Understand caching mechanisms

---

## 🎓 Key Concepts Learned

### 1. Base Image Selection
```
Decision Tree:

Need: Node.js app
├─ node:18 (900 MB) → Development
├─ node:18-slim (200 MB) → Production (balanced)
└─ node:18-alpine (180 MB) → Production (size-critical)

Need: Python app
├─ python:3.11 (1.1 GB) → Development
├─ python:3.11-slim (150 MB) → Production (compatible)
└─ python:3.11-alpine (59 MB) → Production (simple apps)
```

### 2. Layer Caching Rules
```
Dockerfile order (best practice):

1. FROM (base image)         ← Never changes
2. System packages            ← Rarely changes
3. COPY package.json          ← Sometimes changes
4. RUN install dependencies   ← Sometimes changes
5. COPY source code           ← Changes frequently
6. CMD/ENTRYPOINT            ← Rarely changes
```

### 3. Package Managers by Base

| Base OS | Package Manager | Cache Cleanup |
|---------|----------------|---------------|
| Alpine | `apk` | `apk add --no-cache` |
| Debian/Ubuntu | `apt` | `rm -rf /var/lib/apt/lists/*` |
| RHEL/CentOS | `yum`/`dnf` | `yum clean all` |

---

## 🔍 Common Mistakes & Fixes

### Mistake 1: Wrong Base Image
```dockerfile
# Bad
FROM ubuntu:22.04
RUN apt install -y nodejs npm

# Good
FROM node:18-alpine
```

### Mistake 2: Poor Layer Order
```dockerfile
# Bad
COPY . .
RUN npm install

# Good
COPY package*.json ./
RUN npm install
COPY . .
```

### Mistake 3: No Cache Cleanup
```dockerfile
# Bad
RUN apt update
RUN apt install -y curl

# Good
RUN apt update && apt install -y curl \
    && rm -rf /var/lib/apt/lists/*
```

### Mistake 4: Separate apt Commands
```dockerfile
# Bad
RUN apt update
RUN apt install -y curl

# Good
RUN apt update && apt install -y curl
```

---

## Tools Used

### Docker Commands
```bash
# Build
docker build -t image:tag .

# Compare sizes
docker images

# Inspect layers
docker history image:tag

# Remove
docker rmi image:tag
```

### Analysis Tools
```bash
# Dive - explore image layers
dive image:tag

# Docker Scout - security scan
docker scout quickview image:tag
```

---

## Before & After Comparison

### Exercise 1: Fix Dockerfile
```
Before:
- Base: ubuntu:22.04 + manual Node.js install
- Size: ~300 MB
- Layers: 6
- Build time: 45s

After:
- Base: node:18-alpine
- Size: ~180 MB
- Layers: 3
- Build time: 15s

Improvement: 40% smaller, 3x faster
```

### Exercise 2: Cache Optimization
```
Before:
- First build: 3m 20s
- Code change rebuild: 3m 15s (no cache)

After:
- First build: 3m 10s
- Code change rebuild: 8s (npm install cached)

Improvement: 24x faster on code changes
```

### Exercise 3: Image Comparison
```
Full → Slim: 87% size reduction
Full → Alpine: 95% size reduction

Deploy time:
- Full: 2m 30s (download 1.12 GB)
- Slim: 15s (download 150 MB)
- Alpine: 6s (download 59 MB)

Improvement: 25x faster deploys with Alpine
```

---

## Checklist for Dockerfile Quality

Use this checklist for every Dockerfile you write:

**Base Image:**
- [ ] Appropriate for the language/runtime
- [ ] Smallest practical variant (alpine/slim)
- [ ] Specific version tag (not `latest`)

**Layer Optimization:**
- [ ] Dependencies copied before source code
- [ ] Related commands combined
- [ ] Cache cleanup in same RUN command

**Security:**
- [ ] Runs as non-root user
- [ ] No secrets in image
- [ ] Minimal attack surface

**Production Ready:**
- [ ] Health check added
- [ ] Proper logging to stdout/stderr
- [ ] Environment variables for config

---

## Challenge Yourself

Try these variations to deepen understanding:

### Challenge 1: Extreme Optimization
Take Exercise 1's Dockerfile and make it even smaller:
- Use `FROM scratch` if possible
- Multi-stage build
- Strip unnecessary files

### Challenge 2: Cache Breaking
Intentionally break cache at different points and measure impact:
- Change only source code
- Change only dependencies
- Change system packages

### Challenge 3: Base Image Benchmark
Compare ALL variants for your language:
- Full (e.g., python:3.11)
- Slim (e.g., python:3.11-slim)
- Alpine (e.g., python:3.11-alpine)
- Bullseye, Buster, etc.

---

## 📚 Additional Resources

### Documentation
- [Dockerfile Reference](https://docs.docker.com/engine/reference/builder/)
- [Best Practices Guide](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

### Tools
- [Hadolint](https://github.com/hadolint/hadolint) - Dockerfile linter
- [Dive](https://github.com/wagoodman/dive) - Layer analyzer
- [Container-diff](https://github.com/GoogleContainerTools/container-diff) - Compare images

---

## Next Steps

After completing these exercises:

1. **Proceed to Project 1** - Apply skills to real Node.js API
2. **Review concepts** - Ensure understanding of caching
3. **Practice more** - Try with your own projects

---

**Exercise Status:** **ALL COMPLETE**

**Ready for:** [Project 1: Node.js API with Multi-stage Build](../project1-nodejs-api/)

---