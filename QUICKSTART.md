# Quick Start Guide

## 🎯 Get Running in 5 Minutes

### 1. Install PostgreSQL
```bash
# macOS
brew install postgresql
brew services start postgresql

# Ubuntu
sudo apt-get install postgresql
sudo systemctl start postgresql

# Create database
createdb candidate_360_nps
```

### 2. Setup Project
```bash
cd candidate-360-nps

# Copy environment file
cp .env.example .env

# Edit .env with your database URL:
# DATABASE_URL="postgresql://user:password@localhost:5432/candidate_360_nps"
```

### 3. Install & Run
```bash
chmod +x start.sh
./start.sh
```

Or manually:
```bash
# Install dependencies
npm install
cd client && npm install && cd ..

# Generate Prisma client & run migrations
npm run db:generate
npm run db:migrate

# Seed database
npm run db:seed

# Start servers
npm run dev
```

### 4. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Prisma Studio: `npm run db:studio`

**Login with:**
- Email: `admin@example.com`
- Password: `admin123`

## 📱 Pages Overview

1. **Dashboard** (/) - Main metrics, NPS score, response rate
2. **Trends** (/trends) - Historical charts and analysis
3. **Geographic** (/geographic) - Regional breakdown with map
4. **Cohorts** (/cohorts) - Compare candidate groups
5. **Actions** (/actions) - Manage action items

## 🔥 Common Issues

### Port already in use
```bash
# Kill process on port 4000 or 5173
lsof -ti:4000 | xargs kill -9
```

### Prisma errors
```bash
# Reset database
npx prisma migrate reset
npm run db:seed
```

### Module not found
```bash
# Reinstall dependencies
rm -rf node_modules client/node_modules
npm install
cd client && npm install
```

## 🎨 Customize

- **Colors**: Edit `client/tailwind.config.js`
- **API URL**: Update `client/src/api/client.ts`
- **Database Schema**: Modify `prisma/schema.prisma`

## 📦 Build for Production

```bash
# Build backend
npm run build:backend

# Build frontend
npm run build:frontend

# Start production
npm start
```

---

**Need help?** Check the full README.md or open an issue!

