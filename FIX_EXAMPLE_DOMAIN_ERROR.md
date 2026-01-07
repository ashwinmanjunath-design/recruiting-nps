# 🔧 Fix: "Example Domain" Error

## 🔍 Problem

You're seeing: **"Example Domain - This domain is for use in documentation examples"**

This happens when clicking a survey link that still points to `example.com` instead of your real frontend URL.

## ✅ Solution

### Step 1: Restart Backend

The backend needs to be restarted to load the new survey link generation code:

```bash
# Stop the backend (Ctrl+C in terminal)
# Then restart:
cd candidate-360-nps/backend
npm run dev
```

### Step 2: Send a NEW Survey Email

**Important:** Old emails still have the `example.com` link. You need to send a **new** survey email.

1. Open the app → **Surveys** → **Create New Survey**
2. Fill in the form
3. Click **Send Now**
4. Check the **new email** - it should have a real survey link

### Step 3: Verify Survey Link

The new email should contain a link like:
```
http://localhost:5173/survey/survey_1764767558591_abc123_chaswin123
```

**NOT:**
```
https://example.com/survey  ❌
```

## 🧪 Quick Test

After restarting backend, test by sending a survey to yourself:

1. **Create New Survey**
2. **Send To:** Individual
3. **Add recipient:** Your email (e.g., `chaswin123@gmail.com`)
4. **Click Send Now**
5. **Check email** - verify the link is `http://localhost:5173/survey/...`
6. **Click link** - should open survey page (not example.com)

## 🔍 Verify Backend is Using New Code

Check backend console logs when sending. You should see:
```
[SurveyEmail] About to send emails to X recipient(s)
[Email Service] Sending survey email: { surveyLink: 'http://localhost:5173/survey/...' }
```

If you see `example.com` in the logs, the backend hasn't restarted with new code.

## ✅ Expected Behavior

**Before Fix:**
- Email link: `https://example.com/survey` ❌
- Clicking → "Example Domain" error

**After Fix:**
- Email link: `http://localhost:5173/survey/survey_123456_abc123` ✅
- Clicking → Opens survey page ✅

## 🚀 If Still Not Working

1. **Check `FRONTEND_URL` in `.env`:**
   ```bash
   cd backend
   cat .env | grep FRONTEND_URL
   ```
   
   Should be:
   ```bash
   FRONTEND_URL=http://localhost:5173
   ```

2. **Verify backend logs** show correct survey link generation

3. **Send a fresh email** (old emails won't work)

4. **Check browser console** if survey page doesn't load

---

**The fix is in place - just restart backend and send a new email!** 🎉

