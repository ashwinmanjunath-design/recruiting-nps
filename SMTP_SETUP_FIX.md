# 🔧 Why Email Sending Isn't Working - FIX GUIDE

## 🔍 Root Cause

**The Problem:** 
- MailHog (local email testing) is **not running**
- Real SMTP credentials are **not configured** in `backend/.env`
- Email service falls back to MailHog → **ECONNREFUSED** error

## ✅ Solution: Configure Real SMTP

You need to add SMTP credentials to `backend/.env`. Here's how:

### Step 1: Open `backend/.env` file

```bash
cd candidate-360-nps/backend
# Edit .env file (create it if it doesn't exist)
```

### Step 2: Add SMTP Configuration

Add these lines to `backend/.env`:

```bash
# SMTP Configuration (REQUIRED for real email sending)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Step 3: Choose Your SMTP Provider

#### Option A: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)" → "Candidate 360 NPS"
   - Copy the 16-character app password
3. **Add to `.env`:**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=xxxx xxxx xxxx xxxx  # The 16-char app password
   ```

#### Option B: SendGrid

```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Option C: Outlook/Office365

```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Step 4: Restart Backend

After adding SMTP credentials, **restart the backend**:

```bash
# Stop the current backend (Ctrl+C in terminal)
# Then restart:
cd backend
npm run dev
```

You should see:
```
[Email Service] Using SMTP configuration for real email sending
[Email Service] SMTP Host: smtp.gmail.com:587
```

### Step 5: Test Again

1. Open app → Surveys → Create New Survey
2. Fill in:
   - Survey Name: `Email Test – 1`
   - From Email: `ashwin.manjunath@omio.com` (or your SMTP email)
   - Send To: Individual
   - Add recipient: `ashwin.manjunath@omio.com`
3. Click **Send Now**

## 🐛 Common Errors & Fixes

### Error: `ECONNREFUSED`
- **Cause:** SMTP_HOST or SMTP_PORT wrong, or server not reachable
- **Fix:** Check SMTP_HOST and SMTP_PORT are correct for your provider

### Error: `EAUTH` or "Invalid login"
- **Cause:** SMTP_USER or SMTP_PASS wrong
- **Fix:** 
  - For Gmail: Use **App Password**, not regular password
  - Double-check credentials

### Error: "Sender address rejected"
- **Cause:** `fromEmail` doesn't match SMTP account
- **Fix:** Use the same email as `SMTP_USER` for `fromEmail`

## 📋 Quick Checklist

- [ ] `backend/.env` file exists
- [ ] `SMTP_HOST` is set (e.g., `smtp.gmail.com`)
- [ ] `SMTP_PORT` is set (e.g., `587`)
- [ ] `SMTP_USER` is set (your email)
- [ ] `SMTP_PASS` is set (app password for Gmail)
- [ ] Backend restarted after adding env vars
- [ ] Backend logs show: `[Email Service] Using SMTP configuration`
- [ ] `fromEmail` matches `SMTP_USER` (or is allowed by SMTP server)

## 🚀 Alternative: Start MailHog (If Docker Available)

If you prefer local testing without real emails:

```bash
cd candidate-360-nps
docker compose up -d mailhog
```

Then view emails at: http://localhost:8025

But you still need to set in `backend/.env`:
```bash
EMAIL_MODE=local
MAILHOG_HOST=localhost
MAILHOG_PORT=1025
```

---

**After configuring SMTP, try sending the survey again!** 🎉

