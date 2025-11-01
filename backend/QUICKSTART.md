# Backend Quick Start

## Prerequisites

- Docker installed and running
- Node.js 20+
- 4GB+ RAM

## Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Pull Docker images (~2-3GB, takes 5-10 minutes)
npm run pull-images

# 3. Start development server
npm run dev
```

Server runs on `http://localhost:3001`

## Test It Works

```bash
# Health check
curl http://localhost:3001/health

# Should return:
# {"status":"ok","timestamp":"...","uptime":...}
```

## Test With Real Code

```bash
# Test Python execution
curl -X POST http://localhost:3001/api/execute/run \
  -H "Content-Type: application/json" \
  -d '{
    "solution": "def add(a, b):\n    return a + b",
    "tests": "def test_add():\n    assert add(2, 3) == 5",
    "language": "python",
    "runs": 10
  }'
```

Expected response:
```json
{
  "passed": true,
  "testsPassed": 1,
  "totalTests": 1,
  "meanExecutionTime": 2.34,
  "standardDeviation": 0.12
}
```

## Production Deployment

```bash
# Build
npm run build

# Start with PM2
pm2 start dist/server.js --name phronos-backend
pm2 save
pm2 startup
```

## Environment Variables

Create `.env` file:

```bash
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=production
```

## Troubleshooting

**"Cannot connect to Docker daemon"**
```bash
# Check Docker is running
docker ps

# Start Docker (Linux)
sudo systemctl start docker
```

**"Port 3001 already in use"**
```bash
# Change port in .env
PORT=3002
```

**"Image pull failed"**
```bash
# Pull manually
docker pull python:3.11-slim
docker pull node:20-slim
docker pull golang:1.21-alpine
docker pull rust:1.75-slim
docker pull openjdk:21-slim
docker pull gcc:latest
```

## Supported Languages

- ✅ Python (pytest)
- ✅ JavaScript (Jest)
- ✅ TypeScript (Jest)
- ✅ Go (go test)
- ✅ Rust (cargo test)
- ✅ Java (JUnit)
- ✅ C++ (g++)

## What Happens When You Execute Code

1. **Receive** solution + tests from frontend
2. **Create** temporary directory `/tmp/phronos-exec/{uuid}`
3. **Write** solution and test files
4. **Validate** by running tests in Docker container
5. **Measure** performance by running solution 100 times
6. **Calculate** mean time and standard deviation
7. **Cleanup** containers and temp files
8. **Return** results to frontend

## Next Steps

1. ✅ Backend is running
2. Start frontend: `cd ../ide && npm run dev`
3. Open `http://localhost:5173`
4. Run a competition and see **real** execution!

🚀 Happy coding!

