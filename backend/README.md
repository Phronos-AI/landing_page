# Phronos Backend - Real Code Execution API

Backend service for executing AI-generated solutions in isolated Docker containers with real performance measurements.

## Features

- **Real Code Execution**: Runs solutions in isolated Docker containers
- **Multi-Language Support**: Python, JavaScript, TypeScript, Go, Rust, Java, C++
- **Performance Measurement**: Runs solutions 100 times and returns mean execution time
- **Security**: Containers run with no network access, memory/CPU limits, and timeouts
- **Test Validation**: Validates solutions against test suites before measuring performance

## Prerequisites

- **Node.js 20+**
- **Docker** (with daemon running)
- **4GB+ RAM** (for running Docker containers)
- **20GB+ disk space** (for Docker images)

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Pull Docker Images

This will download all language images (~2-3GB total):

```bash
npm run pull-images
```

Or manually:

```bash
docker pull python:3.11-slim
docker pull node:20-slim
docker pull golang:1.21-alpine
docker pull rust:1.75-slim
docker pull openjdk:21-slim
docker pull gcc:latest
```

### 3. Configuration

Create a `.env` file (optional):

```bash
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## Running

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3001`

### Production

```bash
npm run build
npm start
```

### With PM2 (recommended for production)

```bash
pm2 start dist/server.js --name phronos-backend
pm2 save
pm2 startup
```

## API Endpoints

### POST /api/execute/run

Execute solution with tests and measure performance.

**Request:**

```json
{
  "solution": "def fibonacci(n):\n    ...",
  "tests": "def test_fibonacci():\n    ...",
  "language": "python",
  "runs": 100
}
```

**Response:**

```json
{
  "passed": true,
  "testsPassed": 5,
  "totalTests": 5,
  "meanExecutionTime": 2.45,
  "standardDeviation": 0.12
}
```

### POST /api/execute/validate

Validate solution against tests only (no performance measurement).

**Request:**

```json
{
  "solution": "def fibonacci(n):\n    ...",
  "tests": "def test_fibonacci():\n    ...",
  "language": "python"
}
```

**Response:**

```json
{
  "passed": true,
  "testsPassed": 5,
  "totalTests": 5,
  "output": "..."
}
```

### GET /health

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-11-01T12:00:00.000Z",
  "uptime": 123.45
}
```

## Supported Languages

| Language   | Image                | Test Framework | Notes                    |
|------------|---------------------|----------------|--------------------------|
| Python     | python:3.11-slim    | pytest         | Interpreted              |
| JavaScript | node:20-slim        | Jest           | Interpreted              |
| TypeScript | node:20-slim        | Jest           | Transpiled to JS         |
| Go         | golang:1.21-alpine  | go test        | Compiled once, run 100x  |
| Rust       | rust:1.75-slim      | cargo test     | Compiled once, run 100x  |
| Java       | openjdk:21-slim     | JUnit          | Compiled once, run 100x  |
| C++        | gcc:latest          | GoogleTest     | Compiled once, run 100x  |

## Architecture

```
Frontend → Express API → Language Handlers → Docker Containers → Real Execution
```

**Execution Flow:**

1. Receive solution + tests from frontend
2. Create temporary directory with unique ID
3. Write solution and test files
4. Validate: Run tests in Docker container
5. If tests pass: Measure performance (run 100 times)
6. Calculate mean and standard deviation
7. Cleanup containers and temp files
8. Return results to frontend

## Security

**Container Isolation:**

- No network access (`NetworkMode: 'none'`)
- Memory limit: 512MB
- CPU limit: 1 core
- Timeout: 30 seconds per execution
- Read-only filesystem where possible

**Resource Management:**

- Automatic container cleanup after execution
- Temporary files deleted after each run
- Image caching to avoid repeated downloads

## Deployment

### Local Development

```bash
npm run dev
```

### VPS Deployment

1. SSH into your VPS
2. Install Docker and Node.js
3. Clone repository
4. Install dependencies: `npm install`
5. Pull Docker images: `npm run pull-images`
6. Build: `npm run build`
7. Start with PM2: `pm2 start dist/server.js --name phronos-backend`
8. Configure firewall: Allow port 3001

### Docker Compose

See root `docker-compose.yml` for containerized deployment.

## Troubleshooting

**"Cannot connect to Docker daemon"**

- Ensure Docker is running: `docker ps`
- Check permissions: `sudo usermod -aG docker $USER`

**"Port 3001 already in use"**

- Change port in `.env`: `PORT=3002`

**"Image pull failed"**

- Check internet connection
- Manually pull problematic image: `docker pull python:3.11-slim`

**"Execution timeout"**

- Increase timeout in `src/services/languageHandlers/base.ts`
- Check container resources

## Performance

- **Test validation**: ~1-5 seconds (depends on language)
- **Performance measurement**: ~10-60 seconds (100 runs)
- **Concurrent executions**: Supports 5+ simultaneous executions

## Development

**Project Structure:**

```
backend/
├── src/
│   ├── server.ts                 # Express server
│   ├── routes/
│   │   └── execute.ts           # API routes
│   ├── services/
│   │   ├── codeExecutor.ts      # Main orchestrator
│   │   └── languageHandlers/    # Language-specific handlers
│   │       ├── base.ts          # Base handler with Docker utils
│   │       ├── python.ts
│   │       ├── javascript.ts
│   │       ├── go.ts
│   │       ├── rust.ts
│   │       ├── java.ts
│   │       └── cpp.ts
│   └── types.ts                 # TypeScript interfaces
├── scripts/
│   └── pull-images.js           # Pull Docker images script
└── package.json
```

**Adding New Languages:**

1. Create handler in `src/services/languageHandlers/`
2. Extend `BaseHandler` class
3. Implement `validateSolution` and `measurePerformance`
4. Add language to `SupportedLanguage` type in `types.ts`
5. Register handler in `codeExecutor.ts`

## License

MIT

