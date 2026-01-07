# 🚂 RAILWAY DEPLOYMENT GUIDE

## Complete Step-by-Step Guide for Deploying to Railway

Railway.app provides the simplest deployment experience with automatic builds from GitHub and built-in database services.

---

## 📋 Prerequisites

- GitHub account with your code repository
- Railway account (free tier available at railway.app)
- Your code pushed to GitHub

---

## 🚀 STEP 1: Create Railway Project

### 1.1 Sign Up & Create Project

```
1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign in with GitHub
4. Click "Deploy from GitHub repo"
5. Select your repository: candidate-360-nps
6. Click "Deploy Now"
```

Railway will create an empty project. We'll now add services one by one.

---

## 🗄️ STEP 2: Add PostgreSQL Database

### 2.1 Add PostgreSQL Service

```
1. In your Railway project dashboard
2. Click "+ New" button
3. Select "Database"
4. Choose "PostgreSQL"
5. Wait for database to provision (~30 seconds)
```

### 2.2 Get Database Connection Details

```
1. Click on the PostgreSQL service
2. Go to "Variables" tab
3. You'll see these variables automatically created:
   - DATABASE_URL (full connection string)
   - PGHOST
   - PGPORT
   - PGUSER
   - PGPASSWORD
   - PGDATABASE
```

**Note**: Railway automatically generates secure credentials. Copy the `DATABASE_URL` - you'll need it later.

---

## 🔴 STEP 3: Add Redis Service

### 3.1 Add Redis

```
1. Click "+ New" in your project
2. Select "Database"
3. Choose "Redis"
4. Wait for Redis to provision (~30 seconds)
```

### 3.2 Get Redis Connection Details

```
1. Click on the Redis service
2. Go to "Variables" tab
3. Copy these values:
   - REDIS_URL (full connection string)
   - REDISHOST
   - REDISPORT
   - REDISPASSWORD
```

---

## 🔧 STEP 4: Add Backend API Service

### 4.1 Add Backend Service

```
1. Click "+ New" in your project
2. Select "GitHub Repo"
3. Choose your repository
4. Railway will detect the Dockerfile automatically
```

### 4.2 Configure Backend Service

#### A. Set Root Directory & Dockerfile

```
1. Click on the backend service
2. Go to "Settings" tab
3. Set these values:

   Root Directory: /
   Dockerfile Path: backend/Dockerfile
   
4. Click "Save"
```

#### B. Add Environment Variables

```
1. Go to "Variables" tab
2. Click "Raw Editor"
3. Paste these variables:
```

```bash
# Application
NODE_ENV=production
PORT=4000

# Database (Reference PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (Reference Redis service)
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}

# JWT Secrets (Generate these!)
JWT_SECRET=<GENERATE_WITH_openssl_rand_-base64_32>
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# URLs (Railway will auto-generate)
FRONTEND_URL=${{Frontend.RAILWAY_PUBLIC_DOMAIN}}
CORS_ORIGIN=https://${{Frontend.RAILWAY_PUBLIC_DOMAIN}}

# SmartRecruiters (set to mock mode initially)
SR_MOCK_MODE=true

# File Upload
MAX_FILE_SIZE=10485760
```

**⚠️ IMPORTANT**: Generate secure JWT_SECRET:
```bash
# Run locally to generate
openssl rand -base64 32
```

#### C. Configure Build & Start Commands

Railway auto-detects from Dockerfile, but verify:

```
1. Settings tab
2. Build Command: (auto from Dockerfile)
3. Start Command: (auto from Dockerfile)
```

#### D. Enable Public Domain

```
1. Settings tab
2. Scroll to "Networking"
3. Click "Generate Domain"
4. Save the generated URL (e.g., backend-production-xxxx.railway.app)
```

### 4.3 Deploy Backend

```
1. Click "Deploy" button
2. Watch the build logs
3. Wait for deployment to complete (~3-5 minutes)
4. Check logs for any errors
```

### 4.4 Run Database Migrations

After backend is deployed:

```
1. Click on backend service
2. Click "Deploy" dropdown → "Run Command"
3. Enter: npx prisma migrate deploy
4. Click "Run"
5. Wait for migration to complete
```

### 4.5 Seed Database (Optional)

```
1. Click "Deploy" dropdown → "Run Command"
2. Enter: npm run seed
3. Click "Run"
4. Wait for seeding to complete
```

### 4.6 Test Backend

```bash
# Test health endpoint
curl https://your-backend-url.railway.app/health

# Expected response:
{"status":"ok","timestamp":"2025-11-29T..."}
```

---

## 👷 STEP 5: Add Worker Service

### 5.1 Add Worker Service

```
1. Click "+ New" in your project
2. Select "GitHub Repo"
3. Choose your repository (same as backend)
```

### 5.2 Configure Worker Service

#### A. Set Dockerfile

```
1. Click on worker service
2. Go to "Settings" tab
3. Set these values:

   Root Directory: /
   Dockerfile Path: backend/Dockerfile.worker
   
4. Click "Save"
```

#### B. Add Environment Variables

```
1. Go to "Variables" tab
2. Click "Raw Editor"
3. Paste these variables:
```

```bash
# Application
NODE_ENV=production

# Database (Reference PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Redis (Reference Redis service)
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}

# Frontend URL (Reference frontend service)
FRONTEND_URL=https://${{Frontend.RAILWAY_PUBLIC_DOMAIN}}

# SmartRecruiters
SR_MOCK_MODE=true

# Optional: Email & SMS (add later)
# RESEND_API_KEY=
# TWILIO_ACCOUNT_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
```

#### C. Deploy Worker

```
1. Click "Deploy"
2. Watch build logs
3. Worker will start processing background jobs
4. Check logs to verify it's running
```

**⚠️ Note**: Worker does NOT need a public domain (it's internal)

---

## 🎨 STEP 6: Add Frontend Service

### 6.1 Add Frontend Service

```
1. Click "+ New" in your project
2. Select "GitHub Repo"
3. Choose your repository (same repo)
```

### 6.2 Configure Frontend Service

#### A. Set Root Directory & Dockerfile

```
1. Click on frontend service
2. Go to "Settings" tab
3. Set:

   Root Directory: frontend
   Dockerfile Path: Dockerfile
   
4. Click "Save"
```

#### B. Add Build-Time Environment Variable

⚠️ **CRITICAL**: Frontend needs API URL at BUILD time!

```
1. Go to "Variables" tab
2. Add this variable:

   VITE_API_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api

3. Click "Add"
```

**Important**: After adding this, you need to rebuild frontend:
```
1. Click "Deploy" dropdown
2. Select "Redeploy"
```

#### C. Enable Public Domain

```
1. Settings tab
2. Networking section
3. Click "Generate Domain"
4. Save URL (e.g., frontend-production-xxxx.railway.app)
```

#### D. Deploy Frontend

```
1. Click "Deploy"
2. Watch build logs (~2-3 minutes)
3. Wait for deployment to complete
```

### 6.3 Update Backend CORS & Frontend URL

Now that frontend has a domain, update backend:

```
1. Go to Backend service
2. Variables tab
3. Update these:

   FRONTEND_URL=https://<your-frontend-domain>.railway.app
   CORS_ORIGIN=https://<your-frontend-domain>.railway.app

4. Backend will auto-redeploy
```

### 6.4 Test Frontend

```
1. Open frontend URL in browser
2. Should see login page
3. Try logging in with seeded credentials:
   - Email: admin@example.com
   - Password: password
```

---

## 🔗 STEP 7: Service Connections Summary

Your Railway project now has 5 services connected:

```
┌─────────────────────────────────────────────────┐
│              Railway Project                    │
├─────────────────────────────────────────────────┤
│                                                 │
│  📊 PostgreSQL                                  │
│     └─ DATABASE_URL → Backend, Worker          │
│                                                 │
│  🔴 Redis                                        │
│     └─ REDIS_* → Backend, Worker               │
│                                                 │
│  🔧 Backend API                                  │
│     ├─ Public: https://backend-xxx.railway.app │
│     └─ Connected to: PostgreSQL, Redis         │
│                                                 │
│  👷 Worker                                       │
│     ├─ Internal (no public domain)             │
│     └─ Connected to: PostgreSQL, Redis         │
│                                                 │
│  🎨 Frontend                                     │
│     ├─ Public: https://frontend-xxx.railway.app│
│     └─ Calls: Backend API                      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## ✅ STEP 8: Verification Checklist

### 8.1 Check All Services Running

```
1. Go to Railway dashboard
2. All 5 services should show "Active" status
3. No red error indicators
```

### 8.2 Test Backend Health

```bash
curl https://your-backend-domain.railway.app/health
# Expected: {"status":"ok","timestamp":"..."}
```

### 8.3 Test Frontend

```
1. Open frontend URL
2. Should load login page
3. No console errors (open browser DevTools)
```

### 8.4 Test Login

```
1. Email: admin@example.com
2. Password: password
3. Should redirect to dashboard
4. Dashboard should load with data
```

### 8.5 Test Background Workers

```
1. Go to Worker service in Railway
2. Click "Deployments" → "View Logs"
3. Should see:
   ✅ Survey send worker started
   ✅ SmartRecruiters sync worker started
   ✅ Bulk import worker started
   ✅ Metrics aggregation worker started
```

---

## 🔄 STEP 9: Setup Auto-Deploy from GitHub

Railway automatically deploys on git push, but verify:

```
1. Click on any service (Backend, Worker, or Frontend)
2. Go to "Settings" tab
3. Scroll to "Service"
4. Verify "Auto Deploy" is enabled
5. Branch should be "main" or your production branch
```

Now whenever you push to GitHub, Railway will automatically:
- Build new Docker images
- Deploy updates
- Zero-downtime deployment

---

## 🎯 STEP 10: Custom Domain (Optional)

### 10.1 Add Custom Domain to Frontend

```
1. Go to Frontend service
2. Settings tab
3. Networking section
4. Click "Custom Domain"
5. Enter your domain: app.yourdomain.com
6. Railway will show DNS records to add
```

### 10.2 Configure DNS

```
Add these DNS records at your domain registrar:

Type: CNAME
Name: app
Value: <your-frontend>.railway.app
TTL: 300
```

### 10.3 Add Custom Domain to Backend

```
1. Go to Backend service
2. Settings → Networking → Custom Domain
3. Enter: api.yourdomain.com
4. Add CNAME record at your registrar

Type: CNAME
Name: api
Value: <your-backend>.railway.app
```

### 10.4 Update Environment Variables

After custom domains are set:

```
Backend Variables:
  FRONTEND_URL=https://app.yourdomain.com
  CORS_ORIGIN=https://app.yourdomain.com

Frontend Variables:
  VITE_API_URL=https://api.yourdomain.com/api
```

Then redeploy both services.

---

## 💰 STEP 11: Cost Optimization

### Free Tier Limits
- $5 credit per month
- Usage-based pricing after that

### Optimization Tips

1. **Development Sleep**
   ```
   Settings → Service → "Sleep after 1 hour of inactivity"
   (Only for development services, not production)
   ```

2. **Right-Size Resources**
   ```
   Most services can run on:
   - 512MB RAM
   - 0.5 vCPU
   
   Adjust in Settings → Resources if needed
   ```

3. **Monitor Usage**
   ```
   Project Settings → Usage
   Check metrics and costs regularly
   ```

---

## 📊 STEP 12: Monitoring & Logs

### View Logs

```
1. Click on any service
2. Click "Deployments"
3. Click on latest deployment
4. View real-time logs
```

### Set Up Observability (Optional)

Add to Backend variables:
```bash
# Sentry (Error Tracking)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project

# Enable in production
NODE_ENV=production
```

### Database Backups

Railway automatically backs up PostgreSQL:
```
1. Click PostgreSQL service
2. Go to "Backups" tab
3. View automatic backups
4. Can restore from any backup
```

---

## 🔧 STEP 13: Useful Railway CLI Commands

### Install Railway CLI

```bash
npm i -g @railway/cli
# or
brew install railway
```

### Login & Link Project

```bash
# Login
railway login

# Link to project
cd /path/to/your/project
railway link
```

### Common Commands

```bash
# View logs
railway logs

# Run command in service
railway run npx prisma migrate deploy

# Deploy manually
railway up

# Open service in browser
railway open

# SSH into service (for debugging)
railway shell
```

---

## 🐛 STEP 14: Troubleshooting

### Backend won't start

**Check logs:**
```
1. Go to Backend service
2. Deployments → Latest → View Logs
3. Look for errors
```

**Common issues:**
- Missing environment variables
- Database migration not run
- Invalid DATABASE_URL

**Fix:**
```bash
# Run migration
railway run --service backend npx prisma migrate deploy

# Check variables
railway variables --service backend
```

### Frontend shows "API Error"

**Check:**
1. Is VITE_API_URL correct?
2. Is backend domain correct?
3. Is CORS configured?

**Fix:**
```
1. Update VITE_API_URL in Frontend variables
2. Update CORS_ORIGIN in Backend variables
3. Redeploy both services
```

### Worker not processing jobs

**Check logs:**
```
1. Go to Worker service
2. View logs
3. Should see "Workers started" messages
```

**Verify Redis connection:**
```
1. Check REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
2. Should reference ${{Redis.REDISHOST}} etc.
3. Redeploy worker if changed
```

### Database connection timeout

**Check:**
1. Is DATABASE_URL correct?
2. Is PostgreSQL service running?

**Fix:**
```
1. Verify DATABASE_URL in Backend variables
2. Check PostgreSQL service status
3. Restart Backend service
```

---

## 🚀 STEP 15: Going Live Checklist

Before announcing your app is live:

- [ ] All 5 services active and healthy
- [ ] Database migrated successfully
- [ ] Database seeded with initial data
- [ ] Frontend loads without errors
- [ ] Can login with test credentials
- [ ] Dashboard displays data
- [ ] All pages load correctly
- [ ] Background workers running
- [ ] Custom domains configured (if using)
- [ ] SSL certificates valid
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Monitoring enabled
- [ ] Backups verified

---

## 📈 STEP 16: Scaling on Railway

### Horizontal Scaling

```
1. Click on service (e.g., Backend)
2. Settings tab
3. Scroll to "Replicas"
4. Set number of instances (e.g., 2-3)
5. Railway will load balance automatically
```

### Vertical Scaling

```
1. Settings tab
2. Resources section
3. Adjust:
   - Memory: 512MB → 2GB
   - CPU: 0.5 → 2 vCPU
```

### Database Scaling

```
1. Click PostgreSQL service
2. Settings tab
3. Can upgrade plan for:
   - More storage
   - Better performance
   - Read replicas
```

---

## 🎉 SUCCESS!

Your Candidate 360° NPS Platform is now live on Railway!

### Access Your Application

- **Frontend**: https://your-frontend.railway.app
- **Backend API**: https://your-backend.railway.app
- **Login**: admin@example.com / password

### Next Steps

1. **Change default passwords**
   ```
   Login → Settings → Users → Edit admin user
   ```

2. **Invite team members**
   ```
   Settings → Users → Invite User
   ```

3. **Configure integrations**
   ```
   Settings → Integrations → SmartRecruiters
   ```

4. **Import data**
   ```
   Settings → Bulk Imports → Upload CSV/Excel
   ```

---

## 📞 Support

### Railway Support
- Documentation: https://docs.railway.app
- Discord: https://discord.gg/railway
- Status: https://status.railway.app

### Project Issues
- Check logs in Railway dashboard
- Review environment variables
- Verify service connections

---

**🎊 Congratulations on deploying to Railway!**

Your application is now live and ready for users!

