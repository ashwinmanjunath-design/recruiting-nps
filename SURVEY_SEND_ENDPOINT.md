# 📧 Survey Send Endpoint - Implementation Summary

## ✅ Changes Completed

### 1. **Frontend API Client (`client/src/api/client.ts`)**

Added new function:
```typescript
export const sendSurveyEmails = (data: {
  surveyId?: string;
  surveyName: string;
  recipients: string[];
  sendImmediately: boolean;
  fromEmail: string;
  subject?: string;
}) => {
  console.log('[Frontend API] Calling POST /api/surveys/send with:', data);
  return api.post('/surveys/send', data);
};
```

### 2. **Frontend CreateSurveyModal (`client/src/components/surveys/CreateSurveyModal.tsx`)**

**Updated `handleSendNow`:**
- ✅ Imports `sendSurveyEmails` from API client
- ✅ Extracts recipient emails from `selectedRecipients`
- ✅ Builds simplified payload matching backend contract
- ✅ Calls `POST /api/surveys/send` directly
- ✅ Shows success alert: "✅ Survey sent to test address (X recipient(s))"
- ✅ Shows error alert with server error message
- ✅ Closes modal on success, keeps open on error
- ✅ Logs payload and response for debugging

**Key Code:**
```typescript
const handleSendNow = async () => {
  // Validation...
  
  const recipientEmails = selectedRecipients.map(r => r.email);
  const sendPayload = {
    surveyName: name.trim(),
    recipients: recipientEmails,
    sendImmediately: true,
    fromEmail: fromEmail.trim(),
    subject: emailSubject.trim() || `Share your feedback: ${name.trim()}`,
  };

  console.log('[CreateSurveyModal] Calling POST /api/surveys/send with payload:', sendPayload);
  
  try {
    const response = await sendSurveyEmails(sendPayload);
    alert(`✅ Survey sent to test address (${recipientEmails.length} recipient(s))`);
    onClose();
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Failed to send survey';
    alert(`❌ Failed to send survey: ${errorMessage}`);
  }
};
```

### 3. **Backend Route (`backend/src/routes/surveys.routes.ts`)**

**Added new endpoint:**
```typescript
POST /api/surveys/send
```

**Features:**
- ✅ Validates payload (surveyName, recipients, fromEmail required)
- ✅ DEV MODE override: In development, sends ONLY to `EMAIL_DEFAULT_TEST`
- ✅ Logs: `[SurveyEmail] DEV MODE: sending ONLY to ashwin.manjunath@omio.com`
- ✅ Calls `emailService.sendSurveyEmail()` for each recipient
- ✅ Returns 200 with `{ success: true, sentTo: X, recipients: [...] }`
- ✅ Returns 500 with error details if all emails fail
- ✅ Comprehensive logging at each step

**Key Code:**
```typescript
router.post('/send', async (req: AuthRequest, res) => {
  // Validate payload
  // DEV MODE override
  if (isDev && defaultTestEmail) {
    console.log('[SurveyEmail] DEV MODE: sending ONLY to ashwin.manjunath@omio.com');
    finalRecipients = [defaultTestEmail];
  }
  
  // Send emails
  for (const email of finalRecipients) {
    await emailService.sendSurveyEmail({...});
  }
  
  res.status(200).json({ success: true, sentTo: emailResults.length });
});
```

### 4. **Backend Server (`backend/src/server.ts`)**

**Added route mount:**
```typescript
app.use('/api/surveys', surveysRoutes); // Also mount at /api/surveys for send endpoint
```

This makes `/api/surveys/send` accessible (in addition to `/api/survey-management/send`).

## 🔍 Request/Response Format

### Request:
```typescript
POST /api/surveys/send
Content-Type: application/json
Authorization: Bearer <token>

{
  "surveyName": "Post-interview – Engineering",
  "recipients": ["ashwin.manjunath@omio.com"],
  "sendImmediately": true,
  "fromEmail": "ashwin.manjunath@omio.com",
  "subject": "Share your feedback: Post-interview – Engineering"
}
```

### Success Response (200):
```json
{
  "success": true,
  "sentTo": 1,
  "failed": 0,
  "recipients": ["ashwin.manjunath@omio.com"]
}
```

### Error Response (400/500):
```json
{
  "error": "recipients array is required and must not be empty"
}
```

## 🧪 Testing Flow

### 1. **Setup Environment:**
```bash
# backend/.env
NODE_ENV="development"
EMAIL_DEFAULT_TEST="ashwin.manjunath@omio.com"
EMAIL_MODE="local"
```

### 2. **Start Services:**
```bash
# Start MailHog
docker-compose up -d mailhog

# Start backend
cd backend && npm run dev

# Start frontend
cd client && npm run dev
```

### 3. **Test "Send Now":**
1. Navigate to `/surveys` page
2. Click "Create New Survey"
3. Fill in survey name: "Test Survey"
4. Switch to "Individual" mode (test email auto-filled)
5. Click "Send Now"
6. **Check DevTools → Network:**
   - Request: `POST http://localhost:3001/api/surveys/send`
   - Status: `200 OK`
   - Response: `{ success: true, sentTo: 1, ... }`
7. **Check Backend Logs:**
   ```
   [POST /api/surveys/send] Input payload: {...}
   [SurveyEmail] DEV MODE: sending ONLY to ashwin.manjunath@omio.com
   [SurveyEmail] Sending email to: ashwin.manjunath@omio.com
   [SurveyEmail] ✅ Email sent successfully to ashwin.manjunath@omio.com
   [POST /api/surveys/send] Email sending summary: { total: 1, successful: 1, failed: 0 }
   ```
8. **Check MailHog UI** (`http://localhost:8025`):
   - Email should be delivered to `ashwin.manjunath@omio.com`
   - Subject: "Share your feedback: Test Survey"
   - From: "ashwin.manjunath@omio.com"

### 4. **Verify DEV MODE Override:**
- Even if you select multiple recipients, all emails go to `ashwin.manjunath@omio.com` in dev mode
- Backend logs show: `[SurveyEmail] DEV MODE: sending ONLY to ashwin.manjunath@omio.com`
- Original recipients are logged before override

## 📋 Verification Checklist

- [x] Frontend calls `POST /api/surveys/send`
- [x] Backend route exists at `/api/surveys/send`
- [x] Route is mounted in server.ts
- [x] Payload validation works
- [x] DEV MODE override works
- [x] Email service is called
- [x] Success response (200) returned
- [x] Error handling works
- [x] Frontend shows success/error alerts
- [x] Modal closes on success
- [x] Comprehensive logging added

## 🐛 Troubleshooting

### "Route not found" error:
- ✅ Check that `app.use('/api/surveys', surveysRoutes)` is in server.ts
- ✅ Verify backend server is running on correct port
- ✅ Check Network tab for exact URL being called

### Emails not sending:
- ✅ Check `EMAIL_DEFAULT_TEST` is set in backend `.env`
- ✅ Verify `NODE_ENV="development"` in backend `.env`
- ✅ Check MailHog is running: `docker ps | grep mailhog`
- ✅ Check backend logs for email service errors

### Frontend errors:
- ✅ Check browser console for API errors
- ✅ Verify API base URL is correct (`http://localhost:3001/api`)
- ✅ Check authentication token is present

## 🎯 Next Steps

1. **Enhance Email Content:** Replace simple test email with full survey template
2. **Add Survey Link:** Generate real survey tokens and links
3. **Cohort Mode:** Implement DB query for cohort recipients
4. **Toast Library:** Replace `alert()` with proper toast notifications
5. **Retry Logic:** Add retry mechanism for failed emails

