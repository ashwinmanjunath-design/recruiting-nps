# 🚂 RAILWAY SERVICE CONFIGURATION REFERENCE

Quick reference for all Railway service configurations.

---

## 📊 Services Overview

```
Railway Project: candidate-360-nps
├── PostgreSQL (Database)
├── Redis (Cache & Queue)
├── Backend (API)
├── Worker (Background Jobs)
└── Frontend (React App)
```

---

## 🗄️ 1. PostgreSQL Service

### Configuration
```yaml
Service Type: Database
Database Type: PostgreSQL
Version: 16
Auto-provision: Yes
```

### Auto-Generated Variables
- `DATABASE_URL` - Full connection string
- `PGHOST` - Database host
- `PGPORT` - Database port (5432)
- `PGUSER` - Database user
- `PGPASSWORD` - Database password
- `PGDATABASE` - Database name

### Usage
```bash
# Reference in other services
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Management
- **Backups**: Automatic daily backups
- **Restore**: Available in service dashboard
- **Migrations**: Run via backend service

---

## 🔴 2. Redis Service

### Configuration
```yaml
Service Type: Database
Database Type: Redis
Version: 7
Auto-provision: Yes
```

### Auto-Generated Variables
- `REDIS_URL` - Full connection string
- `REDISHOST` - Redis host
- `REDISPORT` - Redis port (6379)
- `REDISUSER` - Redis user
- `REDISPASSWORD` - Redis password

### Usage
```bash
# Reference in other services
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}
```

---

## 🔧 3. Backend Service

### Build Configuration
```yaml
Root Directory: /
Dockerfile Path: backend/Dockerfile
Build Command: (auto from Dockerfile)
Start Command: node backend/dist/server.js
Port: 4000
```

### Environment Variables
```bash
# Application
NODE_ENV=production
PORT=4000

# Database
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}

# JWT (GENERATE SECURE VALUES!)
JWT_SECRET=<openssl rand -base64 32>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# URLs
FRONTEND_URL=https://${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
CORS_ORIGIN=https://${{Frontend.RAILWAY_PUBLIC_DOMAIN}}

# Features
SR_MOCK_MODE=true
MAX_FILE_SIZE=10485760

# Optional: Email/SMS
# RESEND_API_KEY=
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=

# Optional: Monitoring
# SENTRY_DSN=
```

### Networking
```yaml
Public Domain: Yes (Generate)
Port: 4000
Health Check: /health
```

### Post-Deploy Commands
```bash
# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npm run seed

# Generate Prisma client (auto in build)
npx prisma generate
```

### Resource Requirements
```yaml
Recommended:
  Memory: 512MB - 1GB
  CPU: 0.5 - 1 vCPU
  
Scaling:
  Min Replicas: 1
  Max Replicas: 5
```

---

## 👷 4. Worker Service

### Build Configuration
```yaml
Root Directory: /
Dockerfile Path: backend/Dockerfile.worker
Build Command: (auto from Dockerfile)
Start Command: node backend/dist/jobs/start-workers.js
Port: None (internal)
```

### Environment Variables
```bash
# Application
NODE_ENV=production

# Database
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}

# URLs
FRONTEND_URL=https://${{Frontend.RAILWAY_PUBLIC_DOMAIN}}

# Features
SR_MOCK_MODE=true

# Optional: Email/SMS (when enabled)
# RESEND_API_KEY=
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
```

### Networking
```yaml
Public Domain: No (internal only)
Port: N/A
```

### What It Does
- Survey distribution (email/SMS)
- SmartRecruiters sync (every 15 min)
- Bulk import processing
- Daily metrics aggregation (1 AM)

### Resource Requirements
```yaml
Recommended:
  Memory: 512MB - 1GB
  CPU: 0.5 - 1 vCPU
  
Scaling:
  Min Replicas: 1
  Max Replicas: 3
```

---

## 🎨 5. Frontend Service

### Build Configuration
```yaml
Root Directory: frontend
Dockerfile Path: Dockerfile
Build Command: npm run build
Start Command: nginx -g 'daemon off;'
Port: 80
```

### Environment Variables
```bash
# IMPORTANT: Set BEFORE first deploy!
VITE_API_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api
```

**⚠️ Critical**: This is a build-time variable. Must be set before deploying!

### Networking
```yaml
Public Domain: Yes (Generate)
Port: 80
Static Files: /usr/share/nginx/html
```

### Nginx Features
- Gzip compression
- Static asset caching (1 year)
- Security headers
- React Router support (SPA)
- API proxy (optional)

### Resource Requirements
```yaml
Recommended:
  Memory: 256MB - 512MB
  CPU: 0.25 - 0.5 vCPU
  
Scaling:
  Min Replicas: 1
  Max Replicas: 3
```

---

## 🔗 Service Dependencies

### Dependency Graph
```
Frontend
  └─→ Backend API

Backend API
  ├─→ PostgreSQL
  └─→ Redis

Worker
  ├─→ PostgreSQL
  └─→ Redis
```

### Reference Syntax
```bash
# Reference another service's public domain
${{ServiceName.RAILWAY_PUBLIC_DOMAIN}}

# Reference database connection
${{Postgres.DATABASE_URL}}

# Reference Redis variables
${{Redis.REDISHOST}}
${{Redis.REDISPORT}}
${{Redis.REDISPASSWORD}}

# Reference frontend domain
${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
```

---

## 🚀 Deployment Order

**Correct Order** (to avoid reference errors):

1. ✅ **PostgreSQL** (First - no dependencies)
2. ✅ **Redis** (Second - no dependencies)
3. ✅ **Backend** (Third - references Postgres & Redis)
4. ✅ **Worker** (Fourth - references Postgres, Redis & Backend)
5. ✅ **Frontend** (Last - references Backend)

**Why?** Services can only reference other services that already exist.

---

## 📋 Environment Variable Checklist

### Before First Deploy

#### Backend Service
- [ ] `JWT_SECRET` - Generate with `openssl rand -base64 32`
- [ ] `DATABASE_URL` - Set to `${{Postgres.DATABASE_URL}}`
- [ ] `REDIS_HOST` - Set to `${{Redis.REDISHOST}}`
- [ ] `REDIS_PORT` - Set to `${{Redis.REDISPORT}}`
- [ ] `REDIS_PASSWORD` - Set to `${{Redis.REDISPASSWORD}}`

#### Worker Service
- [ ] Same as Backend (except no JWT_SECRET needed)

#### Frontend Service
- [ ] `VITE_API_URL` - Set to `https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api`

### After Services Have Domains

#### Update Backend
- [ ] `FRONTEND_URL` - Set to frontend's generated domain
- [ ] `CORS_ORIGIN` - Set to frontend's generated domain

---

## 🔄 Update & Redeploy Strategy

### When to Redeploy

**Auto-Redeploy** (on git push):
- Code changes
- Dockerfile changes
- New commits to main branch

**Manual Redeploy** (click "Redeploy"):
- Environment variable changes
- Railway infrastructure updates
- After migration failures

### Zero-Downtime Deployment

Railway automatically handles:
- ✅ Rolling updates
- ✅ Health checks
- ✅ Automatic rollback on failure

### Deployment Time
- Backend: 3-5 minutes
- Worker: 3-5 minutes
- Frontend: 2-3 minutes

---

## 🎯 Health Checks

### Backend Health Endpoint
```bash
GET https://your-backend.railway.app/health

Response:
{
  "status": "ok",
  "timestamp": "2025-11-29T..."
}
```

### Check Service Health
```bash
# Use Railway CLI
railway status

# Or check dashboard
- Green: Healthy
- Yellow: Starting
- Red: Failed
```

---

## 📊 Monitoring & Logs

### View Logs
```
Service → Deployments → Latest → View Logs
```

### Log Retention
- Recent logs: 7 days
- Full logs: Export to external service

### Metrics Available
- CPU usage
- Memory usage
- Network traffic
- Request count
- Response time

### Alerts
Configure in Railway dashboard:
- Service down
- High CPU/memory
- Deployment failure

---

## 💰 Resource Usage & Costs

### Typical Monthly Cost

**Small Scale** (< 1,000 users):
```
PostgreSQL: $5
Redis: $2
Backend: $5-10
Worker: $5
Frontend: $2
-----------
Total: ~$19-24/month
```

**Medium Scale** (1,000-10,000 users):
```
PostgreSQL: $10
Redis: $5
Backend (x2): $20
Worker (x2): $10
Frontend (x2): $5
-----------
Total: ~$50/month
```

### Free Tier
- $5 credit per month
- Good for testing/development
- Production needs paid plan

---

## 🔒 Security Best Practices

### Secrets Management
- ✅ Use Railway's encrypted environment variables
- ✅ Never commit secrets to git
- ✅ Rotate JWT_SECRET regularly
- ✅ Use strong database passwords

### Network Security
- ✅ HTTPS enforced automatically
- ✅ Database not publicly accessible
- ✅ Redis not publicly accessible
- ✅ Worker has no public endpoint

### Application Security
- ✅ CORS configured correctly
- ✅ Rate limiting enabled (in code)
- ✅ Security headers (via Nginx)
- ✅ Input validation (Zod)

---

## 🛠️ Useful Railway CLI Commands

### Installation
```bash
npm i -g @railway/cli
# or
brew install railway
```

### Authentication
```bash
railway login
```

### Link Project
```bash
cd /path/to/project
railway link
```

### Common Commands
```bash
# View all services
railway status

# View logs (all services)
railway logs

# View logs (specific service)
railway logs --service backend

# Run command in service
railway run --service backend npx prisma migrate deploy

# Set environment variable
railway variables set JWT_SECRET=your-secret

# Open service in browser
railway open

# Deploy from CLI
railway up

# Shell into service (debugging)
railway shell
```

---

## ✅ Verification Commands

### Test Backend
```bash
curl https://your-backend.railway.app/health
```

### Test Database Connection
```bash
railway run --service backend \
  node -e "console.log('DB:', process.env.DATABASE_URL.split('@')[1])"
```

### Test Redis Connection
```bash
railway run --service worker \
  node -e "console.log('Redis:', process.env.REDIS_HOST)"
```

### Test Frontend
```bash
curl -I https://your-frontend.railway.app
# Should return: HTTP/2 200
```

---

## 📞 Support Resources

### Railway Resources
- **Docs**: https://docs.railway.app
- **Discord**: https://discord.gg/railway
- **Status**: https://status.railway.app
- **Examples**: https://github.com/railwayapp/examples

### Project Resources
- **Full Guide**: `RAILWAY_DEPLOYMENT.md`
- **Quick Start**: `RAILWAY_QUICKSTART.md`
- **General Deployment**: `DEPLOYMENT.md`

---

**Last Updated**: November 29, 2025  
**For**: Candidate 360° NPS Platform  
**Platform**: Railway.app

