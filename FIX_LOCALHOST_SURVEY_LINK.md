# 🔧 Fix: Survey Link "ERR_CONNECTION_REFUSED" for External Users

## 🔍 Problem

**Issue:** Survey links use `localhost:5173`, which only works on your local machine. External recipients (like Prapti) can't access it.

**Error:** `ERR_CONNECTION_REFUSED` when clicking survey link

## ✅ Solution Options

### Option 1: Use ngrok (Quick Fix for Testing) ⚡

**ngrok** exposes your localhost to the internet with a public URL.

#### Step 1: Install ngrok
```bash
# macOS
brew install ngrok

# Or download from: https://ngrok.com/download
```

#### Step 2: Start Frontend
```bash
cd candidate-360-nps/client
npm run dev
# Frontend runs on http://localhost:5173
```

#### Step 3: Expose with ngrok
```bash
ngrok http 5173
```

You'll get a public URL like:
```
Forwarding: https://abc123.ngrok.io -> http://localhost:5173
```

#### Step 4: Update Backend .env
```bash
cd candidate-360-nps/backend
# Edit .env file, add:
FRONTEND_URL=https://abc123.ngrok.io
```

#### Step 5: Restart Backend
```bash
cd candidate-360-nps/backend
npm run dev
```

#### Step 6: Send New Survey Email
Now survey links will use: `https://abc123.ngrok.io/survey/...`

**Note:** ngrok URL changes each time you restart (unless you have a paid plan). You'll need to update `FRONTEND_URL` each time.

---

### Option 2: Deploy Frontend (Production Solution) 🚀

Deploy your frontend to a public URL:

**Options:**
- **Vercel** (recommended for React apps)
- **Netlify**
- **Railway**
- **Your own server**

#### Deploy to Vercel (Example)

```bash
cd candidate-360-nps/client
npm install -g vercel
vercel
# Follow prompts, deploy
# Get URL: https://your-app.vercel.app
```

Then update `backend/.env`:
```bash
FRONTEND_URL=https://your-app.vercel.app
```

---

### Option 3: Use Your Domain (If You Have One)

If you have a domain:

```bash
# In backend/.env
FRONTEND_URL=https://surveys.yourdomain.com
```

---

## 🧪 Quick Test with ngrok

### 1. Install ngrok
```bash
brew install ngrok
# Or: https://ngrok.com/download
```

### 2. Start Frontend
```bash
cd candidate-360-nps/client
npm run dev
```

### 3. Expose with ngrok
```bash
ngrok http 5173
```

**Copy the HTTPS URL** (e.g., `https://abc123.ngrok.io`)

### 4. Update Backend .env
```bash
cd candidate-360-nps/backend
# Add to .env:
FRONTEND_URL=https://abc123.ngrok.io
```

### 5. Restart Backend
```bash
cd candidate-360-nps/backend
npm run dev
```

### 6. Send Test Survey
Create a new survey and send to Prapti. The link will now be:
```
https://abc123.ngrok.io/survey/survey_123456_abc123
```

---

## 📋 Current Setup

**Current:** `FRONTEND_URL=http://localhost:5173` (only works locally)

**Needed:** `FRONTEND_URL=https://public-url.com` (works for everyone)

---

## ✅ After Fixing

1. **Update `FRONTEND_URL`** in `backend/.env`
2. **Restart backend** to load new URL
3. **Send NEW survey email** (old emails still have localhost link)
4. **Test survey link** - should work for external users

---

## 🚀 Recommended: Use ngrok for Testing

For quick testing with external users:
1. Install ngrok
2. Run `ngrok http 5173`
3. Copy the HTTPS URL
4. Update `FRONTEND_URL` in backend `.env`
5. Restart backend
6. Send new survey

**For production:** Deploy frontend to Vercel/Netlify/Railway

---

**The survey link will work once you use a public URL instead of localhost!** 🌐

