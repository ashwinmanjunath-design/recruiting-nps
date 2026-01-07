# 🚀 Deploy Frontend to Google Cloud (Firebase Hosting)

## 📋 Overview

We'll deploy the React/Vite frontend to **Firebase Hosting**, which is Google's free hosting service for static websites. Perfect for React apps!

**What you'll get:**
- Public URL: `https://your-app.web.app` or `https://your-app.firebaseapp.com`
- Free SSL certificate
- Global CDN
- Free tier: 10GB storage, 360MB/day transfer

## ✅ Prerequisites

1. **Google Account** (Gmail account works)
2. **Node.js** installed (you already have this)
3. **Git** (optional, for CI/CD)

## 🔧 Step-by-Step Deployment

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

### Step 2: Login to Firebase

```bash
firebase login
```

This will open a browser window. Sign in with your Google account.

### Step 3: Initialize Firebase in Your Project

```bash
cd candidate-360-nps/client
firebase init
```

**Follow these prompts:**

1. **"Which Firebase features do you want to set up?"**
   - Select: `Hosting` (use spacebar to select, Enter to confirm)

2. **"Please select an option:"**
   - Select: `Use an existing project` (if you have one) OR `Create a new project`
   - If creating new: Enter project name (e.g., `candidate-360-nps`)

3. **"What do you want to use as your public directory?"**
   - Enter: `dist` (this is where Vite builds your app)

4. **"Configure as a single-page app (rewrite all urls to /index.html)?"**
   - Answer: `Yes` (important for React Router!)

5. **"Set up automatic builds and deploys with GitHub?"**
   - Answer: `No` (for now, you can set this up later)

6. **"File dist/index.html already exists. Overwrite?"**
   - Answer: `No` (keep your existing build)

### Step 4: Build Your Frontend

```bash
cd candidate-360-nps/client
npm run build
```

This creates a `dist` folder with your production build.

### Step 5: Deploy to Firebase

```bash
firebase deploy --only hosting
```

**First deployment will take 1-2 minutes.**

You'll see output like:
```
✔ Deploy complete!

Hosting URL: https://candidate-360-nps.web.app
```

**Copy this URL!** This is your public frontend URL.

### Step 6: Update Backend Configuration

Update `backend/.env`:

```bash
cd candidate-360-nps/backend
# Edit .env file, add/update:
FRONTEND_URL=https://candidate-360-nps.web.app
```

(Replace with your actual Firebase URL)

### Step 7: Restart Backend

```bash
cd candidate-360-nps/backend
# Stop backend (Ctrl+C)
npm run dev
```

### Step 8: Test Survey Links

1. **Send a new survey email** via the Create Survey modal
2. **Check email** - survey link should be: `https://candidate-360-nps.web.app/survey/...`
3. **Click link** - should work for external users!

## 🔄 Updating Your Deployment

Whenever you make changes to the frontend:

```bash
cd candidate-360-nps/client
npm run build          # Build latest changes
firebase deploy --only hosting  # Deploy to Firebase
```

## 📁 Files Created

Firebase will create:
- `firebase.json` - Firebase configuration
- `.firebaserc` - Firebase project settings

These files are safe to commit to Git.

## 🔧 Firebase Configuration (firebase.json)

Your `firebase.json` should look like:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

## 🌐 Custom Domain (Optional)

If you want to use your own domain:

1. **Add custom domain in Firebase Console:**
   - Go to: https://console.firebase.google.com
   - Select your project
   - Go to Hosting → Add custom domain

2. **Follow DNS setup instructions**
   - Add DNS records as shown
   - Wait for SSL certificate (automatic, takes ~24 hours)

3. **Update FRONTEND_URL:**
   ```bash
   FRONTEND_URL=https://surveys.yourdomain.com
   ```

## 🚨 Troubleshooting

### Build Errors

If `npm run build` fails:
```bash
# Clear cache and rebuild
rm -rf dist node_modules/.vite
npm run build
```

### Deployment Errors

If `firebase deploy` fails:
```bash
# Make sure you're logged in
firebase login

# Check Firebase project
firebase projects:list

# Re-initialize if needed
firebase init hosting
```

### Survey Links Still Use localhost

- Make sure you updated `FRONTEND_URL` in `backend/.env`
- Restart backend after updating `.env`
- Send a **new** survey email (old emails still have old links)

### CORS Issues

If you see CORS errors, make sure your backend allows requests from Firebase URL:

```javascript
// In backend/src/server.ts or CORS config
const allowedOrigins = [
  'http://localhost:5173',
  'https://candidate-360-nps.web.app',  // Add your Firebase URL
];
```

## 📊 Firebase Console

View your deployment:
- **URL:** https://console.firebase.google.com
- **Go to:** Your Project → Hosting
- **See:** Deployment history, analytics, custom domains

## ✅ Checklist

- [ ] Firebase CLI installed
- [ ] Logged in to Firebase
- [ ] Firebase project created
- [ ] `firebase init` completed
- [ ] Frontend built (`npm run build`)
- [ ] Deployed to Firebase (`firebase deploy`)
- [ ] Got public URL (e.g., `https://your-app.web.app`)
- [ ] Updated `FRONTEND_URL` in `backend/.env`
- [ ] Restarted backend
- [ ] Sent test survey email
- [ ] Verified survey link works

## 🎉 Success!

Once deployed, your survey links will work for **all external users**!

**Example survey link:**
```
https://candidate-360-nps.web.app/survey/survey_123456_abc123
```

This link will work for Prapti, chaswin123@gmail.com, and anyone else! 🌐

---

## 💰 Cost

**Firebase Hosting Free Tier:**
- 10 GB storage
- 360 MB/day transfer
- Free SSL
- **Perfect for most use cases!**

If you exceed free tier, pricing is very reasonable ($0.026/GB storage, $0.15/GB transfer).

---

**Ready to deploy? Start with Step 1!** 🚀

