### Docker Fundamentals

## What is Docker?
Docker is a platform that allows you to create and run containers, ensuring consistent and reproducible environments across development, testing, and production.

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
docker run -d -p 8080:80 nginx
docker run -d -p 8080:80 nginx
docker run -d -p 8081:80 nginx
```

### Why Port Mapping Matters:
- Web applications need to be accessible from browsers
- Databases need to be accessible from your code
- APIs need to be accessible from clients
- Without port mapping, containers are isolated islands

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

## Basic Docker Commands

### Pull nginx image from Docker Hub
```bash
docker pull nginx
```
Pull (download) the nginx image from Docker Hub to your local machine

### List all images
```bash
docker images
```
or
```bash
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

# View container logs
docker logs my-nginx

# Follow container logs in real-time
docker logs -f my-nginx

# Access container in interactive mode
docker exec -it my-nginx bash

# View container resource usage
docker stats my-nginx

# Inspect container details
docker inspect my-nginx

# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune

# Remove everything (containers, images, networks, volumes)
docker system prune -a
```

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
- Use volumes to persist important data (covered in Phase 2)

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

## Quick Reference

| Command | Description |
|---------|-------------|
| `docker pull <image>` | Download an image from registry |
| `docker images` | List all local images |
| `docker ps` | List running containers |
| `docker ps -a` | List all containers |
| `docker run` | Create and start a container |
| `docker start` | Start a stopped container |
| `docker stop` | Stop a running container |
| `docker restart` | Restart a container |
| `docker rm` | Remove a container |
| `docker rmi` | Remove an image |
| `docker logs` | View container logs |
| `docker exec` | Execute command in running container |
| `docker inspect` | View detailed container info |