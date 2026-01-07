# How to Preserve Your Work When Switching IDEs

All your work is already saved in your local filesystem! Here's how to preserve it:

## Option 1: Copy the Entire Project Folder (Easiest)

1. **Copy the entire project folder:**
   ```bash
   # Your project is located at:
   /Users/ashwinhassanmanjunath/Documents/smart-candidate-scoring/candidate-360-nps
   ```

2. **Copy it to another location or share it:**
   - You can copy the entire `candidate-360-nps` folder
   - All code, configurations, and dependencies are inside

## Option 2: Use Git (Recommended for Version Control)

If you want version control and easy sharing:

1. **Initialize Git (if not already done):**
   ```bash
   cd /Users/ashwinhassanmanjunath/Documents/smart-candidate-scoring/candidate-360-nps
   git init
   git add .
   git commit -m "Initial commit - Complete C360 NPS Analytics Platform"
   ```

2. **Create a GitHub repository:**
   - Go to GitHub.com
   - Create a new repository
   - Push your code:
     ```bash
     git remote add origin YOUR_GITHUB_REPO_URL
     git push -u origin main
     ```

3. **Clone it anywhere:**
   ```bash
   git clone YOUR_GITHUB_REPO_URL
   cd candidate-360-nps
   npm install  # Install dependencies
   ```

## Option 3: Create a Backup Archive

1. **Create a zip/tar archive:**
   ```bash
   cd /Users/ashwinhassanmanjunath/Documents/smart-candidate-scoring
   tar -czf candidate-360-nps-backup.tar.gz candidate-360-nps
   # or
   zip -r candidate-360-nps-backup.zip candidate-360-nps
   ```

2. **Copy the archive file** to wherever you need it

## What's Included in Your Project

Your project contains:

- ✅ **Frontend** (`client/` folder)
  - React + TypeScript + Tailwind CSS
  - All pages: Dashboard, Trends, Cohorts, Geographic, Actions, Surveys, Settings
  - Components, mocks, stores, API clients

- ✅ **Backend** (`backend/` folder)
  - Node.js + Express + Prisma
  - All routes, services, middleware
  - Database schema

- ✅ **Shared** (`shared/` folder)
  - TypeScript types and enums

- ✅ **Configuration Files**
  - `package.json` files
  - `tsconfig.json`
  - `tailwind.config.js`
  - `docker-compose.yml`
  - `.env.example`

## To Run in Another IDE/Environment

1. **Copy the entire `candidate-360-nps` folder**

2. **Install dependencies:**
   ```bash
   cd candidate-360-nps
   
   # Install root dependencies
   npm install
   
   # Install client dependencies
   cd client
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   
   # Install shared dependencies
   cd ../shared
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cd candidate-360-nps/backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up database:**
   ```bash
   cd candidate-360-nps/backend
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Run the application:**
   ```bash
   # Terminal 1: Backend
   cd candidate-360-nps/backend
   npm run dev
   
   # Terminal 2: Frontend
   cd candidate-360-nps/client
   npm run dev
   ```

## Key Files Created/Modified

Here are the main files we've worked on:

### Frontend Pages:
- `client/src/pages/Dashboard.tsx`
- `client/src/pages/Trends.tsx`
- `client/src/pages/Cohorts.tsx`
- `client/src/pages/Geographic.tsx`
- `client/src/pages/Actions.tsx`
- `client/src/pages/SurveyManagement.tsx`
- `client/src/pages/Settings.tsx`

### Components:
- `client/src/components/Layout.tsx`
- `client/src/components/dashboard/*`
- `client/src/components/surveys/CreateSurveyModal.tsx`

### Mock Data:
- `client/src/mocks/npsMockData.ts`
- `client/src/mocks/cohortAnalyticsMock.ts`
- `client/src/mocks/cohortThemes.ts`
- `client/src/mocks/surveyTemplates.ts`

### Backend:
- `backend/src/routes/*`
- `backend/src/services/*`
- `backend/src/jobs/workers/*`
- `backend/prisma/schema.prisma`

## Important Notes

- **All code is saved locally** - nothing is lost when switching IDEs
- **Dependencies** need to be reinstalled with `npm install` in each folder
- **Environment variables** need to be set up in `.env` files
- **Database** needs to be set up with Prisma migrations

Your work is safe! Just copy the folder and you're good to go. 🚀

