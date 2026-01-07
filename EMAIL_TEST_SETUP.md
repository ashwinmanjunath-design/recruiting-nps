# 📧 Email Test Setup - Quick Guide

## ✅ All Changes Complete

All code changes have been implemented. Follow these steps to set up email testing:

## Step 1: Set Up Environment Variables

Copy the template file and create your `.env`:

```bash
cd backend
cp env.template .env
```

Then edit `.env` and ensure these values are set:

```bash
# Required for email testing
NODE_ENV="development"
EMAIL_DEFAULT_TEST="ashwin.manjunath@omio.com"

# Email configuration
EMAIL_MODE="local"
MAILHOG_HOST="localhost"
MAILHOG_PORT="1025"
```

## Step 2: Start MailHog (if not already running)

```bash
docker-compose up -d mailhog
```

Or start the full stack:

```bash
docker-compose up -d
```

MailHog web UI will be available at: `http://localhost:8025`

## Step 3: Test the Flow

### Quick Test:

1. **Start Backend:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd client
   npm run dev
   ```

3. **Create a Survey:**
   - Navigate to `/surveys` page
   - Click "Create New Survey" button
   - Fill in survey details
   - Switch to "Individual" mode → Test email is auto-filled! ✅
   - Click "Save survey"

4. **Check Email:**
   - Open MailHog: `http://localhost:8025`
   - You should see the email sent to `ashwin.manjunath@omio.com` ✅

## How It Works

### Backend Override (Automatic)

In development mode (`NODE_ENV !== "production"`), the email service automatically overrides ALL recipient emails:

```typescript
// backend/src/services/email.service.ts
const isDev = process.env.NODE_ENV !== 'production';
const defaultTestEmail = process.env.EMAIL_DEFAULT_TEST;

const recipient = isDev && defaultTestEmail 
  ? defaultTestEmail  // ← All emails go here in dev
  : data.to;          // ← Actual recipient in production
```

**Result:** Even if you select 50 candidates in "Cohort" mode, all emails will go to `ashwin.manjunath@omio.com` in development.

### Frontend Pre-population (Convenience)

When you switch to "Individual" mode, the UI automatically adds your test email:

```typescript
// client/src/components/surveys/CreateSurveyModal.tsx
useEffect(() => {
  if (isOpen && sendMode === 'individual' && selectedRecipients.length === 0) {
    setSelectedRecipients([{
      type: 'manual',
      email: 'ashwin.manjunath@omio.com',
      name: 'Ashwin (Test)',
    }]);
  }
}, [isOpen, sendMode]);
```

**Result:** Quick testing without manually entering your email each time.

## Verification Checklist

- [ ] `.env` file created with `EMAIL_DEFAULT_TEST="ashwin.manjunath@omio.com"`
- [ ] `NODE_ENV="development"` in `.env`
- [ ] MailHog running (`docker-compose up -d mailhog`)
- [ ] Backend server restarted after `.env` changes
- [ ] Test email appears in Individual mode automatically
- [ ] Email arrives at `ashwin.manjunath@omio.com` in MailHog

## Production Safety

✅ **Production behavior is preserved:**
- Set `NODE_ENV="production"` in production
- Email override is automatically disabled
- All emails go to actual recipients
- No code changes needed for production deployment

## Troubleshooting

### Email not going to test address?

1. Check `.env` has `EMAIL_DEFAULT_TEST` set
2. Verify `NODE_ENV="development"` (not `"production"`)
3. Restart backend server after changing `.env`
4. Check backend logs for email override confirmation

### Test email not pre-populating?

1. Make sure you're switching TO Individual mode (not already in it)
2. Clear recipients list if it's not empty
3. Check browser console for errors

### MailHog not showing emails?

1. Verify MailHog is running: `docker ps | grep mailhog`
2. Check MailHog UI: `http://localhost:8025`
3. Verify backend logs show email was sent
4. Check `MAILHOG_HOST` and `MAILHOG_PORT` in `.env`

## Files Changed

1. ✅ `backend/src/services/email.service.ts` - Email override logic
2. ✅ `client/src/components/surveys/CreateSurveyModal.tsx` - Pre-population
3. ✅ `backend/env.template` - Environment template with EMAIL_DEFAULT_TEST

All changes are complete and ready to test! 🎉

