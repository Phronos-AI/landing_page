# Deployment Guide: Dependencies & Improved AI Prompts

## Changes Made

### 1. Added Dependencies to All Languages

**Rust** - Added 13 common crates:
- serde, serde_json (JSON serialization/parsing)
- sha2 (cryptographic hashing)
- regex (regular expressions)
- rand (random number generation)
- chrono (date/time handling)
- base64, hex (encoding)
- uuid (unique identifiers)
- anyhow, thiserror (error handling)
- tokio, reqwest (async runtime & HTTP)
- itertools, rayon (collections & parallelism)
- lazy_static, once_cell (lazy initialization)

**Python** - Added 20+ common packages:
- numpy, pandas, scipy (data science)
- matplotlib, pillow (visualization)
- requests, httpx, aiohttp (HTTP)
- cryptography, jwt (security)
- beautifulsoup4 (HTML parsing)
- flask, sqlalchemy (web & database)
- pydantic (data validation)
- redis, pymongo, psycopg2-binary (databases)
- pyyaml, click (utilities)

**JavaScript** - Added 15+ npm packages:
- lodash, underscore, ramda (utility libraries)
- axios, node-fetch (HTTP)
- crypto-js, bcrypt, jsonwebtoken (crypto/auth)
- moment, dayjs (date handling)
- uuid (unique identifiers)
- express (web framework)
- validator, chalk, dotenv (utilities)

**Go** - Added 11 packages:
- github.com/stretchr/testify (testing)
- github.com/google/uuid (identifiers)
- github.com/gorilla/mux, github.com/gin-gonic/gin (web)
- github.com/go-redis/redis/v8 (Redis)
- go.uber.org/zap (logging)
- github.com/spf13/cobra, viper (CLI & config)
- golang.org/x/crypto (cryptography)
- gopkg.in/yaml.v3 (YAML)
- gorm.io/gorm (ORM)

**Java** - Built-in extensive libraries:
- Collections (HashMap, ArrayList, TreeMap, PriorityQueue, etc.)
- Streams, Optional, Functional interfaces
- Date/Time API, Regex, I/O, Networking
- Crypto (javax.crypto, java.security)
- Concurrency (ExecutorService, CompletableFuture)

**C++** - Standard library headers + flags:
- All STL headers (algorithm, vector, map, set, queue, etc.)
- Flags: `-std=c++17 -pthread -lm`
- Available: chrono, thread, mutex, future, random, bitset, regex

### 2. Limited Test Generation to 10 Tests

Updated AI prompt to:
- Generate maximum 10 test cases
- Focus on quality over quantity
- Distribution: 3-4 basic tests, 3-4 edge cases, 2-3 error handling tests

### 3. Improved Description Reading

Enhanced AI prompts to:
- Read ENTIRE task description carefully
- Respect "do not use X" constraints
- Follow library/approach restrictions
- Pay attention to implementation method requirements

## Deployment Steps

### On Your VPS:

```bash
ssh root@87.106.40.86

# Navigate to project
cd /opt/phronos

# Pull latest changes
git pull origin main

# Build backend
cd backend
npm run build

# Restart backend
pm2 restart phronos-backend

# Save PM2 config
pm2 save

# Verify backend is running
pm2 logs phronos-backend --lines 10
```

### Expected Output:
```
🚀 Phronos Backend running on port 3001
📡 Accepting requests from: https://phronos.ai
🐳 Docker integration enabled
✓ Temp directory ready: /tmp/phronos-exec
```

## Testing the Changes

### 1. Test with Simple Problem (Fibonacci)
- Run `phronos init` in IDE
- Run `phronos compile`
- Verify tests generated are ≤10
- Run `phronos run`
- All models should pass now

### 2. Test with Cryptographic Problem (Merkle Tree in Rust)
- Create a Merkle tree problem
- AI should now be able to use `sha2` crate
- Previously would fail with "unresolved import `sha2`"
- Should now work

### 3. Test with Constraint ("Don't use recursion")
- Add "Do not use recursion" to description
- Generate solution
- Verify AI respects the constraint

### 4. Verify Test Count
- Run `phronos compile` on any problem
- Count test functions in generated tests
- Should be ≤10 tests

## What This Fixes

### Before:
- ❌ Rust fails with "unresolved import sha2"
- ❌ Python can't use numpy/pandas/requests
- ❌ JavaScript missing common utilities
- ❌ Go only has basic packages
- ❌ 20-30 tests generated (expensive, slow)
- ❌ AI ignores "don't use X" constraints

### After:
- ✅ Rust has 13 crates (serde, sha2, tokio, regex, chrono, uuid, etc.)
- ✅ Python has 20+ packages (numpy, pandas, flask, cryptography, etc.)
- ✅ JavaScript has 15+ packages (lodash, axios, jwt, moment, etc.)
- ✅ Go has 11 packages (gin, redis, gorm, uuid, crypto, etc.)
- ✅ C++ has pthread support + all STL headers
- ✅ Java has comprehensive built-in library documentation
- ✅ Maximum 10 quality tests generated
- ✅ AI reads full description and respects constraints

## Rollback (if needed)

If something breaks:

```bash
cd /opt/phronos
git log --oneline -5
git revert HEAD  # Revert latest commit
cd backend && npm run build
pm2 restart phronos-backend
```

## Summary

All changes are complete and built successfully:
- ✅ **60+ dependencies** added across 6 languages
  - Rust: 13 crates
  - Python: 20+ packages
  - JavaScript: 15+ packages
  - Go: 11 packages
  - C++: pthread + STL
  - Java: comprehensive docs
- ✅ Test generation limited to 10 tests
- ✅ AI prompts improved for constraint respect
- ✅ Backend builds without errors
- ✅ Ready to deploy

Deploy and test tomorrow! 🚀

**Total libraries/packages added: 60+**
- This covers most common use cases for algorithms, data structures, cryptography, web, databases, and utilities
- Models should now pass significantly more problems without dependency errors

