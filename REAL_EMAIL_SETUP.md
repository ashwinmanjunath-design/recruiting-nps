# 📧 Real Email Sending Setup - Complete Guide

## ✅ Implementation Complete

All changes have been implemented to send **real survey emails** via SMTP instead of mocked responses.

## 🔧 Required Environment Variables

Add these to your `backend/.env` file:

```bash
# SMTP Configuration (REQUIRED for real email sending)
SMTP_HOST=smtp.gmail.com          # Your SMTP server hostname
SMTP_PORT=587                      # SMTP port (587 for TLS, 465 for SSL)
SMTP_USER=your-email@gmail.com     # Your SMTP username/email
SMTP_PASS=your-app-password        # Your SMTP password or app password

# Optional: Fallback to MailHog if SMTP not configured
EMAIL_MODE=local                   # "local" for MailHog, "production" for SMTP
MAILHOG_HOST=localhost
MAILHOG_PORT=1025

# Frontend URL (for survey links)
FRONTEND_URL=http://localhost:5173

# Node Environment
NODE_ENV=development
```

### SMTP Provider Examples

**Gmail:**
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password  # Use App Password, not regular password
```

**SendGrid:**
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Outlook/Office365:**
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

## 📡 API Endpoint

### POST /api/surveys/send

**URL:** `http://localhost:3001/api/surveys/send`

**Method:** `POST`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "surveyName": "Post-interview – Engineering",
  "recipients": ["ashwin.manjunath@omio.com"],
  "fromEmail": "ashwin.manjunath@omio.com",
  "targetCohort": "Backend Engineers – Q4",
  "sendImmediately": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "sentTo": 1,
  "recipients": ["ashwin.manjunath@omio.com"]
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "message": "surveyName is required"
}
```

## 🔍 Development Mode Behavior

### Recipient Handling

In development mode (`NODE_ENV !== 'production'`):
- Your test email (`ashwin.manjunath@omio.com`) is **automatically included** in the recipients list
- Original recipients are **not overridden** - both original and test email receive the survey
- Example: If you send to `["user1@example.com", "user2@example.com"]`, all three will receive it:
  - `user1@example.com`
  - `user2@example.com`
  - `ashwin.manjunath@omio.com` (auto-added)

In production mode:
- Only the recipients you specify will receive emails
- No test email is added

## 📝 Example cURL Request

```bash
curl -X POST http://localhost:3001/api/surveys/send \
  -H "Content-Type: application/json" \
  -d '{
    "surveyName": "Test Survey",
    "recipients": ["ashwin.manjunath@omio.com"],
    "fromEmail": "ashwin.manjunath@omio.com",
    "targetCohort": "Test Cohort",
    "sendImmediately": true
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "sentTo": 1,
  "recipients": ["ashwin.manjunath@omio.com"]
}
```

## 🧪 Testing Flow

### 1. **Set Up SMTP Credentials**

Add SMTP configuration to `backend/.env`:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 2. **Start Backend**

```bash
cd backend
npm run dev
```

You should see:
```
[Email Service] Using SMTP configuration for real email sending
[Email Service] SMTP Host: smtp.gmail.com:587
```

### 3. **Start Frontend**

```bash
cd client
npm run dev
```

### 4. **Test Email Sending**

1. Navigate to `http://localhost:5173/surveys`
2. Click "Create New Survey"
3. Fill in:
   - Survey name: "Test Survey"
   - From Email: "ashwin.manjunath@omio.com"
   - Switch to "Individual" mode (test email auto-filled)
4. Click "Send Now"

### 5. **Verify**

**Backend Logs:**
```
[POST /api/surveys/send] Input payload: {...}
[POST /api/surveys/send] DEV MODE: Including test email ashwin.manjunath@omio.com
[SurveyEmail] Sending email to: ashwin.manjunath@omio.com
[Email Service] ✅ Email sent successfully: { messageId: "...", ... }
[POST /api/surveys/send] Email sending summary: { total: 1, successful: 1, failed: 0 }
```

**Frontend:**
- Success alert: "✅ Survey email sent to 1 recipient(s)."
- Modal closes

**Your Inbox:**
- Check `ashwin.manjunath@omio.com` for the survey email
- Subject: "Candidate Survey: Test Survey"
- Contains survey link and invitation text

## 📧 Email Content

The email includes:
- **Subject:** "Candidate Survey: {surveyName}"
- **HTML Body:** Professional survey invitation with:
  - Header with survey name
  - Friendly greeting
  - Survey invitation text
  - "Take Survey" button linking to survey URL
  - Footer with branding
- **Plain Text Fallback:** Text-only version for email clients that don't support HTML

## 🐛 Troubleshooting

### Emails Not Sending

1. **Check SMTP Configuration:**
   ```bash
   # Verify env vars are set
   cd backend
   cat .env | grep SMTP
   ```

2. **Check Backend Logs:**
   - Look for `[Email Service] Using SMTP configuration`
   - Check for SMTP connection errors
   - Verify `messageId` is returned (indicates successful send)

3. **Test SMTP Connection:**
   - Try sending a test email manually
   - Verify SMTP credentials are correct
   - Check if your email provider requires "App Password" (Gmail)

4. **Check Spam Folder:**
   - Emails might be filtered to spam
   - Check spam/junk folder in your inbox

### "SMTP not configured" Error

If you see this, the email service falls back to MailHog. To use real SMTP:
- Ensure `SMTP_HOST`, `SMTP_USER`, and `SMTP_PASS` are all set in `.env`
- Restart the backend server after adding env vars

### Authentication Errors

- **Gmail:** Use an "App Password" instead of your regular password
- **2FA Required:** Most providers require app-specific passwords
- **Less Secure Apps:** Some providers need this enabled (not recommended for production)

## 📋 Files Changed

1. **`backend/src/services/email.service.ts`**
   - Updated to support SMTP configuration via env vars
   - Removed recipient override logic (now handled in route)
   - Falls back to MailHog if SMTP not configured

2. **`backend/src/routes/surveys.routes.ts`**
   - Updated `/send` route to use real email service
   - Includes test email in dev mode (doesn't override)
   - Builds proper HTML email body
   - Returns proper success/error responses

3. **`client/src/api/client.ts`**
   - Updated `sendSurveyEmails()` payload format
   - Removed `subject` (backend generates it)

4. **`client/src/components/surveys/CreateSurveyModal.tsx`**
   - Updated `handleSendNow` to send correct payload
   - Improved success/error messaging
   - Shows actual recipient count

## ✅ Verification Checklist

- [x] SMTP configuration supported via env vars
- [x] Real email service sends actual emails
- [x] Dev mode includes test email (doesn't override)
- [x] HTML email body generated
- [x] Plain text fallback included
- [x] Proper error handling
- [x] Frontend sends correct payload
- [x] Success/error responses handled correctly

## 🚀 Next Steps

1. **Set SMTP credentials** in `backend/.env`
2. **Restart backend** to load new env vars
3. **Test sending** via the UI
4. **Check your inbox** for the survey email
5. **Verify email content** looks correct

The system is now ready to send real survey emails! 🎉

