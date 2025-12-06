# Container Playground - Phase 1 Learning Notes

## Overview
This project explores Docker container fundamentals through hands-on experimentation with container lifecycle, filesystem behavior, isolation, and image layers.

---

## What I Did

### Part 1: Interactive Container Exploration
- Created an Ubuntu container in interactive mode
- Installed tools (curl, vim, nano) inside the container
- Created files in various directories (/home, /tmp)
- Exited and restarted the container to verify persistence

### Part 2: Container Isolation Testing
- Created multiple containers from the same Ubuntu image
- Verified that each container has its own isolated filesystem
- Confirmed that changes in one container don't affect others

### Part 3: docker commit Exploration
- Saved a modified container as a new custom image
- Created new containers from the custom image
- Compared base Ubuntu image with custom image

### Part 4: Layer Analysis
- Inspected nginx image layers using `docker history`
- Analyzed layer sizes and understood why some layers are 0B
- Identified the largest layer and understood its purpose

---

## Commands Used

### Basic Container Operations
```bash
# Create and run interactive container
docker run -it --name playground ubuntu bash

# Start stopped container
docker start playground

# Execute command in running container
docker exec -it playground bash

# Stop container
docker stop playground

# Remove container
docker rm playground
```

### Working Inside Container
```bash
# Update package list and install tools
apt update
apt install -y curl vim nano

# Create files
echo "This is container data" > /home/myfile.txt
echo "Temporary note" > /tmp/note.txt
mkdir /home/myproject
echo "Project file" > /home/myproject/readme.md

# Verify installations
curl --version
vim --version
```

### Image Operations
```bash
# Commit container to new image
docker commit playground my-custom-ubuntu

# List images
docker images

# Compare image sizes
docker images ubuntu
docker images my-custom-ubuntu

# Inspect image layers
docker history nginx
docker history nginx --no-trunc
```

### Multiple Container Testing
```bash
# Create second container from same image
docker run -it --name playground2 ubuntu bash

# Create third container from custom image
docker run -it --name playground3 my-custom-ubuntu bash
```

---

## Additional Knowledge & Deep Dive

### 1. `apt update` - Update Package Lists
**What it does:**
- Updates the "package catalog" to latest versions
- Does **NOT** install or upgrade any programs
- Just refreshes the list of available packages

**Analogy:** Like updating a restaurant menu - you see what's available but haven't ordered yet.

**Example:**
```bash
apt update
# Reading package lists... Done
# Building dependency tree... Done
# All packages are up to date.
```

---

### 2. `apt update` in Docker - NEVER Use Separately!
**WRONG - Will use stale cache:**
```dockerfile
RUN apt update
RUN apt install -y curl
# Layer 2 might use outdated package list from cached Layer 1!
```

**CORRECT - Always chain together:**
```dockerfile
RUN apt update && apt install -y curl
# Ensures fresh package list is used immediately
```

**Why this matters:**
- Docker caches each `RUN` command as a layer
- If you update your Dockerfile to install a different package, the old `apt update` layer might be reused
- This can cause installation failures or install outdated versions

**Real-world problem:**
```dockerfile
# Day 1: Works fine
RUN apt update
RUN apt install -y curl

# Day 30: Add vim
RUN apt update            # ← Uses CACHED layer from Day 1!
RUN apt install -y curl
RUN apt install -y vim    # ← Might fail or install old version!
```

**The fix:**
```dockerfile
RUN apt update && apt install -y \
    curl \
    vim
# Fresh update + install in ONE layer = Always works!
```

---

### 3. `apt install -y` - Install with Auto-Yes
**What `-y` means:**
- Automatically answers "Yes" to all prompts
- Essential for Docker (no interactive input possible)
- Without it, build hangs waiting for user input

**Example without `-y`:**
```bash
apt install curl
# Do you want to continue? [Y/n]
# ← Hangs here in Docker!
```

**Example with `-y`:**
```bash
apt install -y curl vim nano
# Installs all three without prompting
```

**Common tools installed:**
- `curl` - Download files, test APIs, check connectivity
- `vim` - Advanced text editor
- `nano` - Beginner-friendly text editor

---

### 4. `apt` vs `apt-get` - Modern vs Legacy
**apt (Recommended for humans):**
- User-friendly output with progress bars
- Combines common operations
- Cleaner interface
- **Use for:** Interactive terminal work

**apt-get (Recommended for scripts):**
- More stable interface (backward compatible)
- Scriptable output
- Finer control
- **Use for:** Dockerfiles, automation scripts

**In practice:**
```bash
# Interactive terminal
apt update
apt install curl

# Dockerfile (both work, but apt-get is traditional)
RUN apt-get update && apt-get install -y curl
# or
RUN apt update && apt install -y curl
```

**Most modern Dockerfiles use `apt`** - it's fine for both!

---

### 5. Timezone Prompt - The Docker Build Killer
**The Problem:**
```dockerfile
RUN apt install -y tzdata
# ┌─────────────────────────────┐
# │ Please select geographic    │
# │ area:                        │
# │   1. Africa                  │
# │   2. America                 │
# │ > _                          │
# └─────────────────────────────┘
# ← Build HANGS here forever!
```

**Why it happens:**
- Some packages (tzdata, keyboard-configuration) need user input
- Docker has no interactive terminal during build
- Build freezes waiting for response that never comes

**The Fix:**
```dockerfile
# Set environment variable to prevent prompts
ENV DEBIAN_FRONTEND=noninteractive

RUN apt update && apt install -y \
    tzdata \
    curl
# Now installs without prompting!
```

**What DEBIAN_FRONTEND=noninteractive does:**
- Tells apt to use default values
- Suppresses all interactive prompts
- Essential for automated builds

**Full example:**
```dockerfile
FROM ubuntu:22.04

# Prevent timezone and other interactive prompts
ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=Asia/Bangkok

RUN apt update && apt install -y \
    tzdata \
    curl \
    vim \
    && rm -rf /var/lib/apt/lists/*
```

---

### 6. `ls -la` - X-Ray View of Files
**What each flag does:**
- `-l` (long format) - Shows detailed information
- `-a` (all) - Shows hidden files (starting with `.`)

**Example output:**
```bash
ls -la /home/
total 12
drwxr-xr-x  3 root root 4096 Dec  1 10:00 .
drwxr-xr-x 18 root root 4096 Dec  1 09:50 ..
-rw-r--r--  1 root root   20 Dec  1 10:00 myfile.txt
drwxr-xr-x  2 root root 4096 Dec  1 10:05 myproject
```

**Breaking down the output:**
```
drwxr-xr-x  3  root  root  4096  Dec 1 10:00  myproject
│││││││││││  │   │     │     │       │         │
│││││││││││  │   │     │     │       │         └─ Name
│││││││││││  │   │     │     │       └─ Modified date
│││││││││││  │   │     │     └─ Size (bytes)
│││││││││││  │   │     └─ Group owner
│││││││││││  │   └─ User owner
│││││││││││  └─ Number of links
││││││││││└─ Execute (others)
│││││││││└─ Write (others)
││││││││└─ Read (others)
│││││││└─ Execute (group)
││││││└─ Write (group)
│││││└─ Read (group)
││││└─ Execute (owner)
│││└─ Write (owner)
││└─ Read (owner)
│└─ Type: d=directory, -=file, l=link
```

**Common patterns:**
```
drwxr-xr-x  = Directory, owner can rwx, others can only rx
-rw-r--r--  = File, owner can rw, others can only r
lrwxr-xr-x  = Symbolic link (shortcut)
```

---

### 7. Permission Codes - `drwxr-xr-x`
**Understanding the 10-character code:**
```
d rwx r-x r-x
│ │││ │││ │││
│ │││ │││ └─┴─┴─ Others (everyone else)
│ │││ └─┴─┴─── Group (users in same group)
│ └─┴─┴─────── Owner (file creator)
└───────────── Type (d=dir, -=file, l=link)
```

**Permission letters:**
- `r` = Read (4) - Can view contents
- `w` = Write (2) - Can modify
- `x` = Execute (1) - Can run (for files) or enter (for directories)
- `-` = No permission (0)

**Common permission patterns:**
```bash
drwxr-xr-x  # 755 - Standard directory
-rw-r--r--  # 644 - Standard file
-rwxr-xr-x  # 755 - Executable file
drwx------  # 700 - Private directory
-rw-------  # 600 - Private file (like SSH keys)
```

**Changing permissions:**
```bash
# Using letters (symbolic)
chmod u+x script.sh      # Add execute for owner
chmod go-w file.txt      # Remove write from group & others
chmod a+r readme.md      # Add read for all

# Using numbers (octal)
chmod 755 script.sh      # rwxr-xr-x
chmod 644 file.txt       # rw-r--r--
chmod 600 secret.key     # rw-------
```

**Numeric breakdown:**
```
7 = 4+2+1 = rwx
6 = 4+2   = rw-
5 = 4+1   = r-x
4 = 4     = r--
0 = 0     = ---
```

---

### 8. Special Symbols - `lrwxr-xr-x@`
**The `l` prefix:**
```bash
lrwxr-xr-x  1 root root  11 Dec 1 10:00 tmp -> private/tmp
│
└─ "l" means symbolic link (like a shortcut in Windows)
```

**What is a symbolic link?**
- A pointer/reference to another file or directory
- Like a shortcut - doesn't contain data itself
- Deleting the link doesn't delete the target
- If target is deleted, link becomes "broken"

**Creating symbolic links:**
```bash
# ln -s TARGET LINK_NAME
ln -s /usr/bin/python3 /usr/bin/python
# Now "python" points to "python3"
```

**The `@` suffix (macOS specific):**
```bash
drwxr-xr-x@  2 user staff  64 Dec 1 10:00 Documents
                │
                └─ "@" means extended attributes (xattr)
```

**Extended attributes:**
- Extra metadata attached to files/directories
- Common on macOS for Finder info, quarantine flags
- View with: `xattr -l filename`
- Not usually seen in Docker containers (Linux-only)

---

### 9. `/tmp -> private/tmp` - macOS System Design
**What you see on macOS:**
```bash
ls -la / | grep tmp
lrwxr-xr-x@   1 root  wheel    11 Nov 20 09:15 tmp -> private/tmp
```

**Why this exists:**
- Historical Unix convention
- macOS merges `/tmp`, `/var`, `/etc` under `/private`
- Creates symbolic links for compatibility
- Protected by SIP (System Integrity Protection)

**What is SIP?**
- Security feature in macOS
- Prevents modification of system files (even by root)
- Protects symlinks like `/tmp`, `/var`, `/etc`
- Can't delete these links without disabling SIP

**In Docker:**
- Linux containers don't have this
- `/tmp` is a real directory, not a symlink
- No SIP protection needed

**Example:**
```bash
# On macOS host
ls -l /tmp
lrwxr-xr-x  tmp -> private/tmp

# Inside Docker container
docker run -it ubuntu ls -l /tmp
drwxrwxrwt  2 root root  # Real directory!
```

---

### 10. `docker ps -a | grep` - Search Containers
**What it does:**
- `docker ps -a` - Lists ALL containers (running + stopped)
- `|` (pipe) - Sends output to next command
- `grep pattern` - Filters lines containing "pattern"

**Examples:**
```bash
# Find all playground containers
docker ps -a | grep playground

# Find running nginx containers
docker ps | grep nginx

# Find stopped containers
docker ps -a | grep Exited

# Find containers by image
docker ps -a | grep ubuntu
```

**Output example:**
```bash
docker ps -a | grep playground
abc123  ubuntu  "bash"  10 mins ago  Exited    playground
def456  ubuntu  "bash"  5 mins ago   Up 2 min  playground2
```

**Useful grep tricks:**
```bash
# Case-insensitive search
docker ps -a | grep -i NGINX

# Show line numbers
docker ps -a | grep -n playground

# Invert match (show everything EXCEPT pattern)
docker ps -a | grep -v playground

# Count matches
docker ps -a | grep -c playground
```

**Pro tip - Using format:**
```bash
# Better than grep for specific fields
docker ps -a --filter "name=playground"
docker ps -a --filter "status=exited"
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"
```

---

### 11. `docker commit` vs `Dockerfile` - Snapshot vs Recipe

| Aspect | docker commit | Dockerfile |
|--------|---------------|------------|
| **Metaphor** | Taking a photo (snapshot) | Writing a recipe (instructions) |
| **Process** | Interactive: do things → save | Declarative: write steps → build |
| **Documentation** | No record | Every step documented |
| **Reproducibility** | Hard to recreate | 100% reproducible |
| **Sharing** | Share large image | Share small text file |
| **Version Control** | Binary blob | Git-friendly text |
| **Optimization** | Includes junk data | Clean, optimized layers |
| **Best for** | Quick experiments, debugging | Production, teamwork, CI/CD |

**docker commit analogy:**
```
Like saving a video game:
1. Play game (modify container)
2. Save state (docker commit)
3. Load saved game later (run from image)

Problem: No one knows HOW you played to get there
```

**Dockerfile analogy:**
```
Like a cooking recipe:
1. Write instructions (Dockerfile)
2. Follow recipe (docker build)
3. Get same dish every time

Benefit: Anyone can follow recipe and get same result
```

**Example comparison:**

**Using docker commit:**
```bash
# Step 1: Manual work (not documented)
docker run -it ubuntu bash
apt update
apt install -y curl nginx
mkdir /app
echo "server { listen 80; }" > /app/nginx.conf
exit

# Step 2: Save state
docker commit <container-id> my-nginx

# Problem: What did I install? What config did I change?
# No one knows! 
```

**Using Dockerfile:**
```dockerfile
# Every step documented!
FROM ubuntu
RUN apt update && apt install -y \
    curl \
    nginx \
    && rm -rf /var/lib/apt/lists/*
RUN mkdir /app
COPY nginx.conf /app/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Clear, reproducible, version-controlled 
```

**When to use each:**

**docker commit:**
- Quick test/experiment
- Debugging (save problem state)
- One-time backup
- Learning Docker

**Dockerfile:**
- Production images
- Team projects
- CI/CD pipelines
- Open source projects
- ANY serious work

---

### 12. Docker Layers - Transparent Sheets Stacked Together

**The Concept:**
Docker images are like a stack of transparent sheets (overhead projector slides). Each sheet represents one change to the filesystem.

**Visual analogy:**
```
┌─────────────────────┐
│ Sheet 4: app.js     │  ← New file added
├─────────────────────┤
│ Sheet 3: curl       │  ← Package installed  
├─────────────────────┤
│ Sheet 2: apt cache  │  ← Package list updated
├─────────────────────┤
│ Sheet 1: Ubuntu OS  │  ← Base system
└─────────────────────┘

When you look from top, you see the combined result!
```

**How layers work:**

1. **Each Dockerfile instruction = 1 layer**
```dockerfile
FROM ubuntu          # Layer 1
RUN apt update       # Layer 2
RUN apt install curl # Layer 3
COPY app.js /app/    # Layer 4
CMD ["node", "app"]  # Layer 5 (metadata, 0B)
```

2. **Layers are read-only (immutable)**
   - Once created, never changes
   - Can be shared across multiple images
   - Like a published book - can't modify pages

3. **Container adds one writable layer on top**
```
┌─────────────────────┐
│ Container R/W Layer │  ← Your changes go here
├─────────────────────┤
│ Image Layers        │  ← Read-only, shared
└─────────────────────┘
```

**Cache Benefits:**

**Scenario: Add vim to image**
```dockerfile
FROM ubuntu                    # Layer 1
RUN apt update                 # Layer 2
RUN apt install -y curl        # Layer 3
RUN apt install -y vim         # Layer 4 (new!)
```

**First build:**
- Layer 1-3: Build from scratch (slow)
- Layer 4: Build from scratch
- Total: 3 minutes

**Second build (nothing changed):**
- Layer 1-4: **Use cache** ⚡
- Total: 1 second!

**Third build (add git):**
```dockerfile
FROM ubuntu                    # Layer 1
RUN apt update                 # Layer 2
RUN apt install -y curl        # Layer 3
RUN apt install -y vim         # Layer 4
RUN apt install -y git         # Layer 5 (new!)
```
- Layer 1-4: **Use cache** (instant)
- Layer 5: Build (30 seconds)
- Total: 30 seconds instead of 3 minutes!

**Why caching matters:**

**Without cache:**
```
Every build: 3 minutes
Daily: 3 min × 20 builds = 60 minutes wasted!
```

**With cache:**
```
Changed builds: 30 seconds
Daily: 30 sec × 20 builds = 10 minutes
Saved: 50 minutes per day! 
```

**Cache invalidation rules:**
```dockerfile
FROM ubuntu           # Layer 1: Almost never changes
RUN apt update        # Layer 2: Changes when Ubuntu updates
COPY package.json .   # Layer 3: Changes when dependencies change
RUN npm install       # Layer 4: Changes when package.json changes
COPY . .              # Layer 5: Changes EVERY code edit!
```

**If Layer 5 changes:**
- Layer 1-4: **Use cache** 
- Layer 5: **Rebuild** 

**If Layer 3 changes:**
- Layer 1-2: **Use cache** 
- Layer 3-5: **Must rebuild** (cache invalidated)

**Best practice order:**
```dockerfile
# 1. Base image (never changes)
FROM ubuntu

# 2. System dependencies (rarely change)
RUN apt update && apt install -y curl

# 3. App dependencies (sometimes change)
COPY package*.json ./
RUN npm install

# 4. Source code (changes every commit)
COPY . .

# 5. Metadata (doesn't affect cache)
CMD ["npm", "start"]
```

**Real-world impact:**
```
BAD order (code first):
COPY . .              # Layer 1: Changes every edit
RUN npm install       # Layer 2: Rebuilds every time! 
FROM ubuntu           # Layer 3: ...

Build times: 3 minutes EVERY time

GOOD order (dependencies first):
FROM ubuntu           # Layer 1: Cached
COPY package.json .   # Layer 2: Cached (if deps unchanged)
RUN npm install       # Layer 3: Cached (if deps unchanged)
COPY . .              # Layer 4: Only this rebuilds

Build times: 5 seconds for code changes! 
```

---

## Critical Thinking Answers

[Previous content remains the same...]

---

## Key Takeaways

### 1. **Containers are Ephemeral by Design**
- Filesystem changes exist only while container exists
- `docker stop` preserves, `docker rm` destroys
- For persistent data: Use Volumes (Phase 4)

### 2. **Container Isolation is Complete**
- Each container has separate filesystem, processes, network
- Changes in one container never affect others
- Isolation provides security and predictability

### 3. **Images are Layered & Immutable**
- Each Dockerfile instruction = 1 layer
- Layers are read-only and shared across images
- Container adds one read-write layer on top

### 4. **Layers Enable Efficiency**
- **Sharing:** Multiple images share common layers (saves disk space)
- **Caching:** Unchanged layers reused in builds (saves time)
- **Speed:** Only changed layers transferred (saves bandwidth)
- **History:** Transparent audit trail (saves debugging time)

### 5. **docker commit is a Tool, Not a Solution**
- Good for: Experiments, debugging, one-time saves
- Bad for: Production, teamwork, reproducibility
- Better: Write Dockerfiles for real projects

### 6. **Package Management Best Practices**
- Always chain `apt update && apt install` together
- Use `-y` flag to auto-confirm
- Set `DEBIAN_FRONTEND=noninteractive` to prevent prompts
- Clean up cache with `rm -rf /var/lib/apt/lists/*`

### 7. **Layer Order Optimization**
- Put rarely-changing instructions first
- Put frequently-changing instructions last
- Maximize cache hits for faster builds
- Example: Base image → System deps → App deps → Source code

### 8. **Understanding File Permissions**
- `ls -la` shows detailed file information
- Permission format: `drwxr-xr-x` (type + owner + group + others)
- Symbolic links (`l`) are pointers to other files
- Extended attributes (`@`) store extra metadata

---

## Next Steps

**Completed:**
- Container lifecycle understanding
- Filesystem behavior and isolation
- Image layers and docker commit
- Best practices for layer optimization
- Deep dive into apt, permissions, and Docker internals

**Ready for Phase 2:**
- Dockerfile creation and best practices
- Multi-stage builds
- Image optimization techniques
- Building production-ready images

---

## References & Resources

- [Docker Documentation - Storage](https://docs.docker.com/storage/)
- [Docker Documentation - Images and Layers](https://docs.docker.com/storage/storagedriver/)
- [Best Practices for Writing Dockerfiles](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Understanding Docker Layers](https://docs.docker.com/build/guide/layers/)
- [APT User's Guide](https://www.debian.org/doc/manuals/apt-guide/)
- [Linux File Permissions](https://wiki.archlinux.org/title/File_permissions_and_attributes)

---