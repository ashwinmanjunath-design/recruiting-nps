# 🚂 RAILWAY QUICK START GUIDE

## Deploy Candidate 360° NPS Platform to Railway in 20 Minutes

---

## 🚀 Quick Setup (Step-by-Step)

### **Step 1: Create Railway Account** (2 min)
1. Go to https://railway.app
2. Sign up with GitHub
3. Authorize Railway

### **Step 2: Create New Project** (1 min)
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `candidate-360-nps` repository

---

## **Step 3: Add PostgreSQL** (1 min)

```
Click: + New → Database → PostgreSQL

✅ Wait 30 seconds for provisioning
✅ Copy DATABASE_URL from Variables tab
```

---

## **Step 4: Add Redis** (1 min)

```
Click: + New → Database → Redis

✅ Wait 30 seconds for provisioning
✅ Note: Variables auto-created
```

---

## **Step 5: Deploy Backend** (5 min)

### A. Add Service
```
Click: + New → GitHub Repo → Select your repo
```

### B. Configure
```
Settings:
  Root Directory: /
  Dockerfile Path: backend/Dockerfile
```

### C. Environment Variables (Copy & Paste)
```bash
NODE_ENV=production
PORT=4000
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}
JWT_SECRET=CHANGE_THIS_TO_RANDOM_32_CHARS
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
SR_MOCK_MODE=true
MAX_FILE_SIZE=10485760
```

**⚠️ Generate JWT_SECRET**: Run `openssl rand -base64 32`

### D. Generate Domain
```
Settings → Networking → Generate Domain
✅ Save this URL!
```

### E. Deploy & Migrate
```
Click: Deploy (wait 3-5 min)

After deployed:
  Deploy dropdown → Run Command
  Command: npx prisma migrate deploy
  
Optional - Seed database:
  Deploy dropdown → Run Command
  Command: npm run seed
```

### F. Test Backend
```bash
curl https://your-backend.railway.app/health
# Should return: {"status":"ok",...}
```

---

## **Step 6: Deploy Worker** (3 min)

### A. Add Service
```
Click: + New → GitHub Repo → Same repo
```

### B. Configure
```
Settings:
  Root Directory: /
  Dockerfile Path: backend/Dockerfile.worker
```

### C. Environment Variables
```bash
NODE_ENV=production
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_HOST=${{Redis.REDISHOST}}
REDIS_PORT=${{Redis.REDISPORT}}
REDIS_PASSWORD=${{Redis.REDISPASSWORD}}
SR_MOCK_MODE=true
```

### D. Deploy
```
Click: Deploy
✅ No domain needed (internal service)
✅ Check logs to verify workers started
```

---

## **Step 7: Deploy Frontend** (5 min)

### A. Add Service
```
Click: + New → GitHub Repo → Same repo
```

### B. Configure
```
Settings:
  Root Directory: frontend
  Dockerfile Path: Dockerfile
```

### C. Environment Variables
```bash
VITE_API_URL=https://${{Backend.RAILWAY_PUBLIC_DOMAIN}}/api
```

### D. Generate Domain
```
Settings → Networking → Generate Domain
✅ Save this URL!
```

### E. Deploy
```
Click: Deploy (wait 2-3 min)
```

---

## **Step 8: Update Backend CORS** (1 min)

Now that frontend has a domain:

```
1. Go to Backend service
2. Variables tab
3. Add these:

FRONTEND_URL=https://your-frontend.railway.app
CORS_ORIGIN=https://your-frontend.railway.app

4. Backend auto-redeploys
```

---

## **Step 9: Test Everything** (2 min)

### ✅ Open Frontend
```
Open: https://your-frontend.railway.app
```

### ✅ Login
```
Email: admin@example.com
Password: password
```

### ✅ Verify
- Dashboard loads with data
- All pages accessible
- No console errors

---

## 🎉 **DONE!**

Your app is now live on Railway!

### **Your Services:**
```
✅ PostgreSQL - Database
✅ Redis - Cache & Queue
✅ Backend - API Server
✅ Worker - Background Jobs
✅ Frontend - React App
```

---

## 📊 **Service Variables Reference**

### **Backend Service**
| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `4000` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `REDIS_HOST` | `${{Redis.REDISHOST}}` |
| `REDIS_PORT` | `${{Redis.REDISPORT}}` |
| `REDIS_PASSWORD` | `${{Redis.REDISPASSWORD}}` |
| `JWT_SECRET` | Generate with `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | `7d` |
| `JWT_REFRESH_EXPIRES_IN` | `30d` |
| `FRONTEND_URL` | `https://<frontend-domain>.railway.app` |
| `CORS_ORIGIN` | `https://<frontend-domain>.railway.app` |
| `SR_MOCK_MODE` | `true` |
| `MAX_FILE_SIZE` | `10485760` |

### **Worker Service**
| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` |
| `REDIS_HOST` | `${{Redis.REDISHOST}}` |
| `REDIS_PORT` | `${{Redis.REDISPORT}}` |
| `REDIS_PASSWORD` | `${{Redis.REDISPASSWORD}}` |
| `FRONTEND_URL` | `https://<frontend-domain>.railway.app` |
| `SR_MOCK_MODE` | `true` |

### **Frontend Service**
| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://<backend-domain>.railway.app/api` |

---

## 🔧 **Common Commands**

### Run Migration
```
Backend service → Deploy → Run Command
npx prisma migrate deploy
```

### Seed Database
```
Backend service → Deploy → Run Command
npm run seed
```

### View Logs
```
Click service → Deployments → Latest → View Logs
```

### Restart Service
```
Service → Settings → Redeploy
```

---

## 🐛 **Troubleshooting**

### Frontend can't reach backend
**Fix**: Update `VITE_API_URL` in Frontend service with correct backend domain, then redeploy

### CORS error
**Fix**: Set `CORS_ORIGIN` in Backend to match frontend URL exactly

### Database connection failed
**Fix**: Verify `DATABASE_URL` is set to `${{Postgres.DATABASE_URL}}`

### Workers not running
**Fix**: Check Worker logs, verify Redis variables are set correctly

---

## 💰 **Pricing**

**Free Tier**: $5 credit/month  
**Hobby Plan**: $5/month + usage  
**Pro Plan**: $20/month + usage

**Estimated Monthly Cost**: $10-30 for small-medium scale

---

## 🚀 **Next Steps**

### 1. Change Password
```
Login → Settings → Users → Edit admin
```

### 2. Add Team Members
```
Settings → Users → Invite User
```

### 3. Custom Domain (Optional)
```
Frontend service → Settings → Custom Domain
Add: app.yourdomain.com

Backend service → Settings → Custom Domain
Add: api.yourdomain.com
```

### 4. Enable Email/SMS (Optional)
```
Add to Backend variables:
  RESEND_API_KEY=your_key
  TWILIO_ACCOUNT_SID=your_sid
  TWILIO_AUTH_TOKEN=your_token
```

---

## 📚 **Resources**

- **Full Guide**: See `RAILWAY_DEPLOYMENT.md`
- **Railway Docs**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app

---

**🎊 Your app is live! Share the URL with your team!**

