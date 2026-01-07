# 📱 Fix: Mobile Can't Access Survey Links

## 🔍 Problem

**Issue:** Survey links use `localhost:5173`, which only works on your computer. Mobile devices can't access `localhost` on your machine.

**Error:** "Safari can't open the page because It couldn't connect to the server"

## ✅ Solution Options

### Option 1: Use Local Network IP (Quick Test - Same WiFi) ⚡

**Works if:** Your phone and computer are on the **same WiFi network**

#### Step 1: Find Your Computer's Local IP

Your local IP is: **192.168.1.10**

#### Step 2: Update Backend .env

```bash
cd candidate-360-nps/backend
# Edit .env file, add/update:
FRONTEND_URL=http://192.168.1.10:5173
```

#### Step 3: Make Sure Frontend Allows External Connections

Check if Vite is configured to accept external connections. Update `client/vite.config.ts`:

```typescript
export default defineConfig({
  server: {
    host: '0.0.0.0',  // Allow external connections
    port: 5173,
  },
  // ... rest of config
});
```

#### Step 4: Restart Frontend

```bash
cd candidate-360-nps/client
# Stop frontend (Ctrl+C)
npm run dev
```

#### Step 5: Restart Backend

```bash
cd candidate-360-nps/backend
# Stop backend (Ctrl+C)
npm run dev
```

#### Step 6: Test from Mobile

1. **Make sure phone is on same WiFi** as your computer
2. **Send new survey email** (old emails still have localhost link)
3. **Click survey link on phone** - should work!

**Survey link will be:** `http://192.168.1.10:5173/survey/...`

**Limitations:**
- Only works on same WiFi network
- IP might change if you reconnect to WiFi
- Not accessible from outside your network

---

### Option 2: Use ngrok (Works from Anywhere) 🌐

**Best for:** Testing from anywhere (home, office, etc.)

#### Step 1: Start ngrok

```bash
ngrok http 5173
```

You'll get a public URL like:
```
Forwarding: https://abc123.ngrok-free.app -> http://localhost:5173
```

#### Step 2: Update Backend .env

```bash
cd candidate-360-nps/backend
# Edit .env file:
FRONTEND_URL=https://abc123.ngrok-free.app
```

#### Step 3: Restart Backend

```bash
cd candidate-360-nps/backend
npm run dev
```

#### Step 4: Send New Survey Email

Survey links will now be: `https://abc123.ngrok-free.app/survey/...`

**Works from anywhere!** ✅

**Note:** Keep ngrok running while testing. URL changes each restart (unless paid plan).

---

### Option 3: Deploy to Firebase/Vercel (Production Solution) 🚀

**Best for:** Permanent solution, works for everyone

#### Deploy to Firebase:

```bash
cd candidate-360-nps/client
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy --only hosting
```

Get URL: `https://your-app.web.app`

Update `backend/.env`:
```bash
FRONTEND_URL=https://your-app.web.app
```

**Works for everyone, forever!** ✅

---

## 🔧 Quick Fix: Update Vite Config for Local Network

If using Option 1 (local network IP), make sure Vite accepts external connections:

**File:** `client/vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // Allow connections from any IP
    port: 5173,
  },
});
```

Then restart frontend.

---

## 📋 Recommended Approach

**For Quick Testing:**
1. Use **Option 2 (ngrok)** - works from anywhere
2. Or **Option 1 (local IP)** - if on same WiFi

**For Production:**
1. Use **Option 3 (Firebase/Vercel)** - permanent solution

---

## ✅ After Fixing

1. **Update `FRONTEND_URL`** in `backend/.env`
2. **Restart backend** to load new URL
3. **Send NEW survey email** (old emails still have old link)
4. **Test from mobile** - should work!

---

**Choose the option that fits your needs!** 📱

