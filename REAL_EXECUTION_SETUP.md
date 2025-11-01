# Real Code Execution Setup Guide

This guide will help you set up the real code execution backend that replaces the simulation.

## What Changed

- **Before**: Simulated code execution with fake timing
- **After**: Real Docker-based execution with actual performance measurements

## Quick Start (Local Development)

### 1. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Pull Docker images (takes 5-10 minutes, ~2-3GB download)
npm run pull-images

# Start backend server
npm run dev
```

Backend will run on `http://localhost:3001`

### 2. Frontend Setup

```bash
# Navigate to IDE
cd ide

# Create .env file with backend URL
echo "VITE_BACKEND_URL=http://localhost:3001" >> .env

# Your existing OpenRouter key should already be there
# If not, add it:
# echo "VITE_OPENROUTER_API_KEY=your_key" >> .env

# Start frontend
npm run dev
```

Frontend will run on `http://localhost:5173`

### 3. Test It!

1. Open `http://localhost:5173` in your browser
2. Run `phronos init` to create a project
3. Edit `descriptions.md` with a task (e.g., "Write a Python function to calculate fibonacci")
4. Run `phronos compile` to generate tests
5. Run `phronos run` to start the competition
6. Watch as solutions are **actually executed** in Docker containers!

## VPS Deployment

### 1. Connect to Your VPS

```bash
ssh root@YOUR_VPS_IP
```

### 2. Clone Repository

```bash
cd /opt
git clone YOUR_REPO_URL phronos
cd phronos
```

### 3. Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Pull Docker images
npm run pull-images

# Build for production
npm run build

# Create .env file
cat > .env << EOF
PORT=3001
FRONTEND_URL=http://YOUR_VPS_IP:5173
NODE_ENV=production
EOF

# Start with PM2
pm2 start dist/server.js --name phronos-backend
pm2 save
pm2 startup  # Follow the command it outputs
```

### 4. Setup Frontend

```bash
cd ../ide

# Install dependencies
npm install

# Create .env file
cat > .env << EOF
VITE_OPENROUTER_API_KEY=your_key_here
VITE_BACKEND_URL=http://YOUR_VPS_IP:3001
EOF

# Build for production
npm run build

# Serve with a static server (using serve)
npm install -g serve
pm2 start "serve -s dist -l 5173" --name phronos-frontend
pm2 save
```

### 5. Access Your App

Open `http://YOUR_VPS_IP:5173` in your browser!

## Architecture

```
┌─────────────────┐
│  Browser/IDE    │
│  (React App)    │
└────────┬────────┘
         │ HTTP API
         ↓
┌─────────────────┐
│  Backend API    │
│  (Express.js)   │
└────────┬────────┘
         │ Dockerode
         ↓
┌─────────────────┐
│  Docker Daemon  │
│  (Containers)   │
└─────────────────┘
         │
         ↓
┌──────────────────────────────┐
│  Language Containers         │
│  • Python (pytest)           │
│  • JavaScript/TS (Jest)      │
│  • Go (go test)              │
│  • Rust (cargo test)         │
│  • Java (JUnit)              │
│  • C++ (g++)                 │
└──────────────────────────────┘
```

## How It Works

### 1. Test Validation

When an AI generates a solution:

1. Backend receives solution + tests
2. Creates temporary directory: `/tmp/phronos-exec/{uuid}/`
3. Writes solution and test files
4. Spins up Docker container with language image
5. Mounts code directory into container
6. Runs test command (e.g., `pytest test_solution.py`)
7. Parses output to determine pass/fail
8. Returns results to frontend

### 2. Performance Measurement (Only for Passing Solutions)

If tests pass:

1. For **interpreted languages** (Python, JS):
   - Creates wrapper script that runs function 100 times
   - Measures each execution with high-precision timer
   - Returns array of execution times

2. For **compiled languages** (Go, Rust, C++, Java):
   - Compiles code once (not timed)
   - Runs binary 100 times
   - Measures each execution
   - Returns array of execution times

3. Backend calculates:
   - Mean execution time
   - Standard deviation
   - Returns to frontend

## Performance Expectations

| Phase | Duration | Notes |
|-------|----------|-------|
| Test Validation | 1-5 seconds | Python/JS fastest, Rust/C++ slower (compilation) |
| Performance Measurement | 10-60 seconds | 100 runs per solution |
| Full Competition (3 models) | 1-3 minutes | Parallel execution |

## Security Features

**Container Isolation:**
- No network access (can't make HTTP requests)
- Memory limit: 512MB
- CPU limit: 1 core
- 30-second timeout per execution
- Automatic cleanup after execution

**Code Safety:**
- Solutions run in isolated containers
- No access to host filesystem
- No sudo/root privileges
- Can't spawn processes outside container

## Troubleshooting

### Backend Won't Start

**Error: "Cannot connect to Docker daemon"**

```bash
# Check if Docker is running
docker ps

# If not, start Docker
sudo systemctl start docker

# Add your user to docker group (Linux)
sudo usermod -aG docker $USER
newgrp docker
```

**Error: "Port 3001 already in use"**

```bash
# Find what's using the port
lsof -i :3001

# Kill it or change PORT in backend/.env
```

### Frontend Can't Connect to Backend

**Error: "Backend connection error. Is the backend running?"**

1. Check backend is running: `curl http://localhost:3001/health`
2. Check VITE_BACKEND_URL in `ide/.env`
3. Check CORS settings in `backend/src/server.ts`

### Docker Images Not Pulling

```bash
# Check Docker Hub connectivity
docker pull hello-world

# Pull images manually
docker pull python:3.11-slim
docker pull node:20-slim
# ... etc
```

### Execution Timeouts

If solutions timeout:

1. Check if code has infinite loops
2. Increase timeout in `backend/src/services/languageHandlers/base.ts`
3. Check VPS has enough resources (4GB RAM minimum)

### Container Cleanup Issues

```bash
# List all containers
docker ps -a

# Remove all stopped containers
docker container prune -f

# Remove all phronos temp files
rm -rf /tmp/phronos-exec/*
```

## Testing the System

### Test Python Execution

Create a simple test:

**Description (descriptions.md):**
```
Write a Python function that adds two numbers.
```

**Expected Flow:**
1. AI generates tests (pytest)
2. AI generates solution
3. Backend validates with real pytest
4. Backend measures real execution time
5. Frontend shows actual performance!

### Test Different Languages

Try the same problem in different languages and compare **real** performance:
- Python: ~2ms
- JavaScript: ~1ms
- Go: ~0.5ms
- Rust: ~0.3ms
- C++: ~0.25ms

These are now **actual measurements** from Docker containers!

## Environment Variables

### Backend (.env)

```bash
PORT=3001                           # Backend API port
FRONTEND_URL=http://localhost:5173  # CORS allowed origin
NODE_ENV=development                # development or production
```

### Frontend (.env)

```bash
VITE_OPENROUTER_API_KEY=sk-or-...  # Your OpenRouter API key
VITE_BACKEND_URL=http://localhost:3001  # Backend API URL
```

## Next Steps

1. ✅ Backend is running with Docker
2. ✅ Frontend connects to backend
3. ✅ Solutions execute in real containers
4. 🎯 Deploy to your VPS
5. 🎯 Add monitoring/logging
6. 🎯 Optimize container startup time
7. 🎯 Add more language support

## Support

If you encounter issues:

1. Check both backend and frontend logs
2. Verify Docker is running: `docker ps`
3. Test backend health: `curl http://localhost:3001/health`
4. Check VPS resources: `htop` or `docker stats`

Happy coding! 🚀

