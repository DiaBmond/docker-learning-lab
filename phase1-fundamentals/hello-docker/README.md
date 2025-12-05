# Docker Fundamentals - Phase 1

## What is Docker?
Docker is a platform that allows you to create and run containers, ensuring consistent and reproducible environments across development, testing, and production.

---

## Why Use Docker?

Docker solves several critical problems in software development:

### 1. **"It Works on My Machine" Problem**
- Eliminates environment inconsistencies between development, testing, and production
- Ensures your application runs the same way everywhere

### 2. **Dependency Management**
- Packages all dependencies with your application
- No more "missing library" or "wrong version" issues

### 3. **Resource Efficiency**
- Lightweight compared to Virtual Machines
- Can run multiple containers on a single host
- Faster startup times (seconds vs minutes)

### 4. **Scalability**
- Easy to scale applications horizontally
- Quick deployment and replication of containers

### 5. **Isolation**
- Each container runs in isolation
- One container's issues don't affect others
- Better security boundaries

### 6. **DevOps & CI/CD**
- Streamlines deployment pipelines
- Enables microservices architecture
- Facilitates continuous integration and delivery

---

## Container vs Virtual Machine

### Containers
- **Share the host OS kernel** - More efficient resource usage
- **Lightweight** - Typically MBs in size
- **Fast startup** - Boots in seconds
- **Higher density** - Can run many containers on one host
- **Portability** - Run anywhere Docker is installed

### Virtual Machines
- **Include full guest OS** - Heavier resource consumption
- **Large size** - Typically GBs in size
- **Slow startup** - Takes minutes to boot
- **Lower density** - Limited by hardware resources
- **Less portable** - Dependent on hypervisor

**When to use what?**
- Use **Containers** for: Microservices, applications, development environments
- Use **VMs** for: Running different OS types, stronger isolation requirements, legacy applications

---

## Docker Architecture

### Docker Engine
- The main platform that powers Docker
- Includes the Docker Daemon, Docker CLI, and Docker API
- Provides the environment for building and running containers

### Docker CLI (Command Line Interface)
- The command-line tool used to run Docker commands (e.g., `docker run`, `docker build`)
- Receives user commands
- Sends requests to the Docker Daemon through the REST API
- Your primary interface for interacting with Docker

### Docker Daemon (dockerd)
- The background service that performs all container operations
- Manages containers, images, networks, and volumes
- Executes tasks requested by the CLI
- Runs as a service on your host machine

**How they work together:**
```
User → Docker CLI → REST API → Docker Daemon → Containers
```

---

## Images vs Containers

### Docker Image
- A **blueprint/template** used to create containers
- Contains the application code, dependencies, and environment setup
- **Immutable** (cannot be changed once built)
- Stored in registries like Docker Hub
- Can be versioned with tags (e.g., `nginx:1.21`, `nginx:latest`)
- **Think of it as**: A class in programming or a recipe in cooking

### Docker Container
- A **running instance** of an image
- Executable environment where your app actually runs
- **Mutable** during runtime (can store state, logs, etc.)
- Lightweight and isolated from other containers
- Can create multiple containers from one image
- **Think of it as**: An object/instance in programming or a dish made from a recipe

**Analogy:**
- Image = Cookie cutter (template)
- Container = Actual cookie (instance)

**Key Insight:**
- 1 Image → Unlimited Containers (as long as names are unique)
- Delete Container → Image remains
- Delete Image → Must remove all containers first

---

## Container Lifecycle

Understanding the lifecycle of a container is crucial:
```
Created → Running → Paused → Stopped → Removed
```

### States Explained:

1. **Created**
   - Container is created but not started yet
   - Resources are allocated but process hasn't started

2. **Running**
   - Container is actively executing
   - The main process is running
   - Can accept connections and perform work

3. **Paused**
   - Container process is temporarily suspended
   - Can be resumed without restarting
   - Rarely used in practice

4. **Stopped**
   - Container process has exited
   - **Container still exists** with all its data
   - Can be restarted without losing changes made during runtime
   - File system changes are preserved

5. **Removed**
   - Container is completely deleted
   - All data inside the container is lost
   - Image still remains on the system

### What Happens When You Stop a Container?

When you run `docker stop my-nginx`:
- The main process inside the container receives a SIGTERM signal
- Container has 10 seconds to gracefully shut down
- If it doesn't stop, Docker sends SIGKILL to force stop
- **The container filesystem is preserved** - all changes remain
- Container status changes from "running" to "stopped"
- You can restart it later with `docker start my-nginx`

### Why Does Container Disappear But Image Remains?

This is a common point of confusion. Here's why:

**When you remove a container (`docker rm`):**
- Only the **running instance** is deleted
- The **image** (template) remains untouched
- Think of it like deleting a Word document - Microsoft Word (the image) still exists

**Key Differences:**
- **Image**: The template stored on disk (persistent)
- **Container**: A running/stopped instance (temporary by design)

**Analogy:**
- Deleting a container = Deleting a file
- Deleting an image = Uninstalling the program

**To remove an image:**
```bash
docker rmi nginx
```
But you must remove all containers created from that image first!

---

## Common Misunderstandings & Clarifications

### Misconception 1: `docker stop` + `docker start` = `docker run` again

**Wrong thinking:**
- Believing that `docker stop` then `docker start` creates a new container

**Correct understanding:**
- `docker run` = creates a **new** container from image
- `docker stop` + `docker start` = uses the **same** container
- Container ID doesn't change, filesystem remains intact

**Example:**
```bash
# Create a new container
docker run -d --name test nginx
docker ps
# Container ID: abc123456789

# Stop and Start (same container)
docker stop test
docker start test
docker ps
# Container ID: abc123456789 (still the same!)

# Remove and Run new (creates new container)
docker rm -f test
docker run -d --name test nginx
docker ps
# Container ID: def987654321 (new one!)
```

**Impact:**
- If you install packages in container → `stop`/`start` = packages **remain** 
- If you install packages in container → `rm`/`run` = packages **gone** 

---

### Misconception 2: `docker logs` shows real-time logs automatically

**Wrong thinking:**
- Believing `docker logs` will show logs in real-time by default

**Correct understanding:**
- `docker logs` = displays all past logs then **stops**
- `docker logs -f` = displays logs in **real-time** (follow mode)

**Example:**
```bash
# View all logs (snapshot)
docker logs my-nginx
# [shows old logs then stops]

# View logs in real-time (streaming)
docker logs -f my-nginx
# [waiting... refresh browser → see new logs appear immediately!]
# Press Ctrl+C to exit
```

**Analogy:**
- `docker logs` = read entire log file once
- `docker logs -f` = `tail -f` in Linux (real-time streaming)

**When to use:**
- Use `docker logs -f` when debugging, monitoring traffic, or watching errors in real-time

---

## Port Mapping Explained

### What is Port Mapping?

Port mapping is how you expose container services to the outside world (your host machine or network).

### The Problem:
- Containers run in **isolated networks**
- By default, services inside containers are **not accessible** from outside
- Example: nginx runs on port 80 inside the container, but you can't access it from your browser

### The Solution: Port Mapping
```bash
docker run -d -p 8080:80 nginx
```

**Format:** `-p HOST_PORT:CONTAINER_PORT`

### How It Works:
```
Your Browser → localhost:8080 → Docker forwards to → Container:80 → nginx
```

**Breaking it down:**
- `8080` = Port on your **host machine** (your computer)
- `80` = Port **inside the container** where nginx is listening
- Docker acts as a **bridge** between these two ports

### Examples:
```bash
# Map host port 8080 to container port 80
docker run -d -p 8080:80 nginx
# Access: http://localhost:8080

# Map host port 3000 to container port 3000
docker run -d -p 3000:3000 node-app
# Access: http://localhost:3000

# Map host port 5432 to container port 5432
docker run -d -p 5432:5432 postgres
# Access: localhost:5432 (e.g., from database client)

# Let Docker assign a random port on host
docker run -d -P nginx
# Use 'docker ps' to see which port was assigned
```

### Multiple Containers on Same Port:

You **cannot** map the same host port to multiple containers:
```bash
docker run -d -p 8080:80 --name nginx1 nginx  # Works
docker run -d -p 8080:80 --name nginx2 nginx  # Error! Port 8080 already in use
docker run -d -p 8081:80 --name nginx3 nginx  # Works
```

**Why?**
- Host port is a resource that must be unique
- But you can create unlimited containers from the same image (just use different ports)

### Why Port Mapping Matters:
- Web applications need to be accessible from browsers
- Databases need to be accessible from your code
- APIs need to be accessible from clients
- Without port mapping, containers are isolated islands

---

## Docker Hub & Registry

### Docker Hub
- The default public Docker registry
- Hosts official and community images
- Allows pushing your own images to share or store
- Most commonly used registry for beginners
- URL: https://hub.docker.com

### Registry
- A storage system for Docker images
- Can be public or private
- Used to push and pull images
- Examples: Docker Hub, GitHub Container Registry, AWS ECR, Google Container Registry (GCR)

### Official vs Community Images:
- **Official Images**: Maintained by Docker or the software vendor (e.g., `nginx`, `postgres`, `node`)
- **Community Images**: Created by users (e.g., `username/my-app`)

---

## Basic Docker Commands

### Pull nginx image from Docker Hub
```bash
docker pull nginx
```
Pull (download) the nginx image from Docker Hub to your local machine

### List all images
```bash
docker images
# or
docker image ls
```
Display all images available on your machine

### List specific nginx images
```bash
docker images nginx
```
Display only images related to nginx

### List running containers
```bash
docker ps
```
Show only containers that are currently running

### List all containers (including stopped ones)
```bash
docker ps -a
```
Show all containers, both running and stopped

### Create and run a container from nginx image
```bash
docker run -d -p 8080:80 --name my-nginx nginx
```

**Flag explanations:**
- `-d` (detach): Run container in background mode (doesn't display output in terminal)
- `-p 8080:80` (port): Map port 8080 on host machine to port 80 in container (host:container)
- `--name my-nginx`: Name the container "my-nginx" for easy reference
- `nginx`: Name of the image to create the container from

After running this command, you can access nginx at `http://localhost:8080`

### Additional Useful Commands
```bash
# Stop a running container
docker stop my-nginx

# Start a stopped container
docker start my-nginx

# Restart a container
docker restart my-nginx

# Remove a container (must be stopped first)
docker rm my-nginx

# Force remove a running container
docker rm -f my-nginx

# Remove an image
docker rmi nginx

# View container logs (all past logs)
docker logs my-nginx

# Follow container logs in real-time
docker logs -f my-nginx

# Access container in interactive mode
docker exec -it my-nginx bash

# View container resource usage
docker stats my-nginx

# Inspect container details (JSON format)
docker inspect my-nginx

# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune

# Remove everything (containers, images, networks, volumes)
docker system prune -a
```

---

## Understanding Common Scenarios

### Scenario 1: I stopped my container, where did my data go?

**Answer**: Your data is still there! 
- Stopped containers retain all filesystem changes
- Use `docker ps -a` to see stopped containers
- Use `docker start my-nginx` to restart it
- Only when you `docker rm` is the data actually deleted

### Scenario 2: I removed my container, can I get it back?

**Answer**: No, but you can create a new one.
- The container instance is gone forever
- The image still exists, so you can create a new container
- Any data stored inside the removed container is lost
- Use volumes to persist important data (covered in Phase 4)

### Scenario 3: Why does my container stop immediately?

**Answer**: The main process exited.
- Containers run as long as the main process is running
- If the process completes or crashes, the container stops
- Check logs with `docker logs <container-name>`
- Example: `docker run ubuntu` stops immediately because there's no long-running process

### Scenario 4: Can I run multiple containers from the same image?

**Answer**: Yes! That's the power of Docker.
```bash
docker run -d -p 8080:80 --name nginx1 nginx
docker run -d -p 8081:80 --name nginx2 nginx
docker run -d -p 8082:80 --name nginx3 nginx
```
Each container is independent with its own filesystem and state.

---

## 🧪 Hands-on Verification Experiments

### Experiment 1: Verify Container Persistence

**Purpose:** Prove that stop/start does not create a new container
```bash
# 1. Create container and note Container ID
docker run -d --name test-nginx nginx
docker ps
# CONTAINER ID: abc123456789 (example)

# 2. Stop then Start - observe ID
docker stop test-nginx
docker start test-nginx
docker ps
# CONTAINER ID: abc123456789 (same! unchanged)

# 3. Remove then Run new - observe ID
docker rm -f test-nginx
docker run -d --name test-nginx nginx
docker ps
# CONTAINER ID: def987654321 (new! changed)

# Clean up
docker rm -f test-nginx
```

**What I Learned:**
- Same Container ID = same container instance
- Different Container ID = different container instance
- `stop`/`start` does not reset container
- Only `rm`/`run` creates new instance

---

### Experiment 2: Test Real-time Logs

**Purpose:** Understand the difference between `logs` and `logs -f`
```bash
# 1. Create nginx container
docker run -d -p 8080:80 --name log-test nginx

# 2. Access nginx from browser
# Open: http://localhost:8080

# 3. View logs normally (shows then stops)
docker logs log-test
# See old access logs then stop

# 4. View logs in real-time
docker logs -f log-test
# [Terminal waiting...]
# Now refresh browser → see new logs appear immediately!
# Press Ctrl+C to exit

# Clean up
docker rm -f log-test
```

**What I Learned:**
- `docker logs` = dump logs once (snapshot)
- `docker logs -f` = follow mode (streaming)
- `-f` flag is like `tail -f` in Linux
- Use when debugging or monitoring traffic

---

## Quick Reference Table

### Commands Reference

| Command | Description | Notes |
|---------|-------------|-------|
| `docker pull <image>` | Download image from registry | - |
| `docker images` | List all local images | Same as `docker image ls` |
| `docker ps` | List **running** containers only | - |
| `docker ps -a` | List **all** containers (running + stopped) | Use this to see stopped containers |
| `docker run` | **Create** and start a new container | New container ID each time |
| `docker start` | Start a **stopped** container | Uses existing container |
| `docker stop` | Stop a running container | Filesystem preserved |
| `docker restart` | Stop then start (same container) | Same as `stop` + `start` |
| `docker rm` | Remove a container | Deletes filesystem permanently |
| `docker rm -f` | Force remove (even if running) | Stops then removes |
| `docker rmi` | Remove an image | Must remove containers first |
| `docker logs` | View past logs (snapshot) | Shows all logs then stops |
| `docker logs -f` | View logs in **real-time** | Press Ctrl+C to exit |
| `docker exec -it` | Execute command in running container | `-it` = interactive + TTY |
| `docker inspect` | View detailed container/image info | Returns JSON |
| `docker stats` | View resource usage (CPU, Memory) | Real-time monitoring |

### Lifecycle Quick Reference

| Action | Command | Container ID | Filesystem | When to Use |
|--------|---------|--------------|------------|-------------|
| Create new | `docker run` | **New** | **Fresh** | First time or after `rm` |
| Pause | `docker stop` | Same | **Preserved** | Temporary stop |
| Resume | `docker start` | Same | **Preserved** | Continue where you left off |
| Destroy | `docker rm` | Gone | **Lost** | Clean up, start over |

### Port Mapping Quick Reference

| Scenario | Command | Result |
|----------|---------|--------|
| Single container | `docker run -p 8080:80 nginx` | localhost:8080 → nginx:80 |
| Multiple containers (different ports) | `docker run -p 8080:80 nginx1`<br>`docker run -p 8081:80 nginx2` | Both work |
| Multiple containers (same port) | `docker run -p 8080:80 nginx1`<br>`docker run -p 8080:80 nginx2` | Error: port already used |

---

## Key Takeaways from Phase 1

### 1. Container Lifecycle is NOT reset by stop/start
- `stop`/`start` = pause/resume (like Pause/Play music)
- Only `rm` actually deletes the container
- Filesystem changes survive `stop`/`start`

### 2. Container ID is the unique identifier
- Same ID = same container instance
- Different ID = different container instance
- Track Container ID to understand what's happening

### 3. Flags matter a lot
- `-d` = detached mode (background)
- `-f` = follow mode (real-time)
- `-it` = interactive + TTY
- `-p` = port mapping

### 4. Image vs Container
- Image = read-only template (immutable)
- Container = running instance (mutable during runtime)
- 1 Image → ∞ Containers

### 5. Filesystem persistence
- Changes survive: `stop`/`start`
- Changes are lost: `rm`/`run`
- Need **volumes** for permanent storage (Phase 4)

---

## Personal Learning Notes

### Challenges I Faced:
- Used to think that `docker stop` + `docker start` would create a new container
- Was unsure whether `docker logs` needed `-f` flag to show real-time logs

### How I Solved It:
- Ran commands and observed Container ID before/after `stop`/`start` → saw that ID didn't change
- Experimented with `docker logs` vs `docker logs -f` side by side → clearly saw the difference

### Aha Moments:
- Container ID unchanged = Same container!
- Flags (-f, -d, -it) dramatically change command behavior
- Containers are "instances" ready to be deleted anytime - not permanent data storage

---

## Checkpoint - Ready for Phase 2?

Before moving to Phase 2, make sure you can answer:

- [ ] What is a container? How is it different from an image?
- [ ] How do `docker run` and `docker start` differ?
- [ ] What command shows logs in real-time?
- [ ] What does port mapping `-p 3000:80` mean?
- [ ] When does Container ID change?
- [ ] When does container filesystem get deleted?

**If YES to all → Ready for Phase 2! **

---

## What's Next?

Phase 2: **Container Playground** - Interactive Exploration
- Understand ephemeral filesystem
- Learn about container isolation
- Discover why we need volumes