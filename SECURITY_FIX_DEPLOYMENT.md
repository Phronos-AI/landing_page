# Security Fix: API Key Removal from Frontend

## What Was Fixed

### ❌ Before (INSECURE)
- OpenRouter API key was hardcoded in frontend JavaScript
- Anyone could extract it from browser dev tools
- Key was exposed in 5+ minified JS files served publicly

### ✅ After (SECURE)
- API key moved to backend-only environment variable
- Frontend calls backend proxy endpoints instead
- Key never sent to browser or exposed publicly

## Files Changed

### Backend (New)
1. `backend/src/services/openRouterService.ts` - Server-side OpenRouter client
2. `backend/src/routes/ai.ts` - Secure AI proxy endpoints
3. `backend/src/server.ts` - Routes configuration

### Frontend (Updated)
1. `ide/src/lib/openRouterClient.ts` - Now calls backend instead of OpenRouter
2. `ide/src/lib/competitionManager.ts` - Uses secure generateSolution method

## Deployment Instructions

### 1. **ROTATE YOUR API KEY IMMEDIATELY** 🔑
```bash
# Go to https://openrouter.ai/keys
# 1. Create a NEW API key
# 2. REVOKE the old key: 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
```

### 2. **SSH into VPS and Update Backend**
```bash
ssh root@87.106.40.86

# Navigate to project
cd /opt/phronos

# Pull latest code (or upload the built files)
git pull origin main

# Update backend environment variable with NEW key
cat > /opt/phronos/backend/.env << 'EOF'
PORT=3001
FRONTEND_URL=https://phronos.ai
NODE_ENV=production
OPENROUTER_API_KEY=YOUR_NEW_KEY_HERE
EOF

# Rebuild backend
cd /opt/phronos/backend
npm run build

# Restart backend with updated environment
pm2 delete phronos-backend
pm2 start dist/server.js --name phronos-backend
pm2 save
```

### 3. **Update Frontend**
```bash
cd /opt/phronos/ide

# Build with backend URL
VITE_BACKEND_URL=https://api.phronos.ai npm run build

# Deploy to homepage
cp -r dist/* /opt/phronos/homepage/dist/ide/

# Nginx will automatically serve the new files
```

### 4. **Remove Old API Key from IDE .env**
```bash
# Update IDE .env to remove VITE_OPENROUTER_API_KEY
cat > /opt/phronos/ide/.env << 'EOF'
VITE_BACKEND_URL=https://api.phronos.ai
EOF
```

### 5. **Verify Security** ✅
```bash
# Check no API key in frontend build
grep -r "sk-or-v1-" /opt/phronos/homepage/dist/ide/
# Should return: no output (safe!)

# Test backend health
curl https://api.phronos.ai/health

# Test from browser (should work)
# Visit: https://phronos.ai/ide
# Try: phronos compile
```

## New Architecture

```
Browser (Frontend)
       ↓
[NO API KEY STORED]
       ↓
https://api.phronos.ai/api/ai/generate-tests
https://api.phronos.ai/api/ai/generate-solution
https://api.phronos.ai/api/ai/complete
       ↓
Backend Server (Secure)
[OPENROUTER_API_KEY in .env]
       ↓
OpenRouter API
```

## API Endpoints Added

- `POST /api/ai/complete` - General purpose AI completion
- `POST /api/ai/generate-tests` - Generate test cases
- `POST /api/ai/generate-solution` - Generate solution code

## Security Notes

- ✅ API key only in backend `.env` (not `VITE_` prefix)
- ✅ Backend validates all AI requests
- ✅ CORS properly configured for `https://phronos.ai`
- ✅ Frontend never sees the API key
- ⚠️ **IMPORTANT**: Always use server-side env vars for secrets (never `VITE_*`)

## Testing

After deployment:
1. Open browser console at `https://phronos.ai/ide`
2. Run `phronos compile` command
3. Verify no API key errors
4. Check Network tab - should see calls to `https://api.phronos.ai/api/ai/*`
5. Verify no `sk-or-v1-` strings in any JS file

## Rollback Plan

If something breaks:
```bash
# On VPS
pm2 logs phronos-backend --lines 50

# Check backend can reach OpenRouter
curl -X POST http://localhost:3001/api/ai/generate-tests \
  -H "Content-Type: application/json" \
  -d '{"description":"test","language":"python","testFramework":"pytest","languageName":"Python"}'
```

---

**Status**: ✅ Built and ready to deploy
**Security**: ✅ API key removed from frontend
**Next Step**: Deploy to VPS and rotate API key

