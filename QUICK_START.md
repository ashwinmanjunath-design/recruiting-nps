# 🚀 Quick Start Guide - Candidate 360° NPS Platform

**Date:** November 30, 2025

This guide will get your local development environment running in under 10 minutes.

---

## ✅ Prerequisites

Before starting, ensure you have:

- ✅ **Node.js 18+** installed
- ✅ **PostgreSQL** running (locally or Docker)
- ✅ **Redis** running (locally or Docker)

---

## 📦 Step 1: Install Dependencies

### Backend
```bash
cd /Users/ashwinhassanmanjunath/Documents/smart-candidate-scoring/candidate-360-nps/backend
npm install
```

### Frontend (Already Done ✅)
```bash
cd /Users/ashwinhassanmanjunath/Documents/smart-candidate-scoring/candidate-360-nps/client
npm install  # Already completed
```

---

## 🗄️ Step 2: Start PostgreSQL & Redis

### Option A: Using Docker (Recommended)

If you have Docker installed:

```bash
cd /Users/ashwinhassanmanjunath/Documents/smart-candidate-scoring/candidate-360-nps
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Redis on port 6379
- MailHog on ports 1025 (SMTP) and 8025 (Web UI)

### Option B: Using Homebrew (macOS)

If you prefer local installations:

```bash
# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Install Redis
brew install redis
brew services start redis

# Create database
createdb candidate_nps
```

---

## 🔧 Step 3: Configure Environment

The `.env` file has been created in the backend folder with sensible defaults:

```bash
/Users/ashwinhassanmanjunath/Documents/smart-candidate-scoring/candidate-360-nps/backend/.env
```

**Default settings:**
- Database: `postgresql://postgres:postgres@localhost:5432/candidate_nps`
- Backend Port: `3001`
- Frontend Port: `5173` (already running)
- Redis: `localhost:6379`
- Email: MailHog (local capture)
- SMS: Mock mode (no real SMS sent)

**No changes needed for local development!**

---

## 🗃️ Step 4: Setup Database

Run Prisma migrations and seed data:

```bash
cd /Users/ashwinhassanmanjunath/Documents/smart-candidate-scoring/candidate-360-nps/backend

# Run migrations to create tables
npx prisma migrate dev

# Seed the database with test data
npm run seed
```

This creates:
- 10 test users (including admin@example.com)
- 100 candidates
- 10 jobs
- 50 surveys
- 200 survey responses
- Various NPS metrics and trends

---

## 🚀 Step 5: Start Development Servers

### Terminal 1: Backend API
```bash
cd /Users/ashwinhassanmanjunath/Documents/smart-candidate-scoring/candidate-360-nps/backend
npm run dev
```

Server will start on: **http://localhost:3001**

### Terminal 2: Background Workers (Optional)
```bash
cd /Users/ashwinhassanmanjunath/Documents/smart-candidate-scoring/candidate-360-nps/backend
npm run dev:workers
```

This starts BullMQ workers for:
- Survey sending
- SmartRecruiters sync
- Bulk imports
- Metrics aggregation

### Terminal 3: Frontend (Already Running ✅)
```bash
cd /Users/ashwinhassanmanjunath/Documents/smart-candidate-scoring/candidate-360-nps/client
npm run dev
```

Frontend running on: **http://localhost:5173**

---

## 🔐 Step 6: Login

Open your browser to: **http://localhost:5173**

**Login credentials:**
```
Email: admin@example.com
Password: password
```

---

## ✅ Verification Checklist

After setup, verify everything is working:

| Service | URL | Status |
|---------|-----|--------|
| Frontend | http://localhost:5173 | ✅ Running |
| Backend API | http://localhost:3001 | Check this |
| PostgreSQL | localhost:5432 | Check this |
| Redis | localhost:6379 | Check this |
| MailHog UI | http://localhost:8025 | Optional |

### Quick Health Check

```bash
# Check PostgreSQL
psql -h localhost -U postgres -d candidate_nps -c "SELECT COUNT(*) FROM \"User\";"

# Check Redis
redis-cli ping

# Check Backend API
curl http://localhost:3001/api/health
```

---

## 🧪 Step 7: Test Survey Sending (Optional)

If you want to test the email flow:

1. Start MailHog (if using Docker Compose, it's already running)
2. Open MailHog UI: http://localhost:8025
3. Use the test endpoint:

```bash
curl -X POST http://localhost:3001/api/test/send-survey \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "surveyId": "some-survey-id",
    "to": "test@example.com",
    "channel": "email"
  }'
```

4. Check MailHog UI to see the captured email

---

## 📊 Available Test Users

The seed script creates these users:

| Email | Role | Password |
|-------|------|----------|
| admin@example.com | ADMIN | password |
| analyst@example.com | ANALYST | password |
| recruiter@example.com | RECRUITER | password |
| viewer@example.com | VIEWER | password |

All users have the same password: `password`

---

## 🐛 Troubleshooting

### Backend won't start

**Error:** `Error: connect ECONNREFUSED ::1:5432`
- **Fix:** PostgreSQL is not running. Start it with Docker or Homebrew.

**Error:** `Error: Redis connection failed`
- **Fix:** Redis is not running. Start it with Docker or Homebrew.

**Error:** `Module not found`
- **Fix:** Run `npm install` in the backend folder.

### Can't login

**Error:** Network error or 401 Unauthorized
- **Fix:** Ensure backend is running on port 3001
- **Fix:** Run `npm run seed` to create test users

### Database errors

**Error:** `The table 'User' does not exist`
- **Fix:** Run `npx prisma migrate dev` in the backend folder

### Port already in use

**Error:** `EADDRINUSE: address already in use :::3001`
- **Fix:** Kill the process: `lsof -ti:3001 | xargs kill -9`

---

## 📁 Project Structure

```
candidate-360-nps/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma       # Database models
│   │   └── seed.ts             # Seed data
│   ├── src/
│   │   ├── server.ts           # Main API server
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic
│   │   ├── middleware/         # Auth & RBAC
│   │   └── jobs/               # Background workers
│   ├── .env                    # Environment variables
│   └── package.json
├── client/
│   ├── src/
│   │   ├── pages/              # React pages
│   │   ├── components/         # React components
│   │   ├── api/                # API client & queries
│   │   └── store/              # Zustand stores
│   └── package.json
├── shared/
│   └── types/                  # Shared TypeScript types
└── docker-compose.yml          # Docker services
```

---

## 🎯 Next Steps

1. ✅ Complete backend setup (Step 1-4)
2. ✅ Start backend server (Step 5)
3. ✅ Login and explore the dashboard
4. 📖 Read the feature documentation
5. 🧪 Test survey sending
6. 🔧 Customize for your needs

---

## 📚 Additional Documentation

- **Local Email Testing:** `LOCAL_TESTING.md`
- **Deployment:** `DEPLOYMENT.md`
- **Railway Deployment:** `RAILWAY_DEPLOYMENT.md`
- **Design Review:** `DESIGN_REVIEW.md`

---

## 🆘 Need Help?

If you encounter any issues not covered here, check:

1. Terminal output for error messages
2. Backend logs: `backend/logs/` (if logging is enabled)
3. Browser console (F12) for frontend errors
4. Database connection: `npx prisma studio` (opens DB GUI)

---

**Happy coding! 🚀**

