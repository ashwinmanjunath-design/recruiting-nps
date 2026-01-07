# 📧 Email Testing Setup

## Overview

This document describes the email testing configuration that ensures all survey emails in development go to a single test address, while maintaining production behavior.

## Backend Changes

### Email Service Override (`backend/src/services/email.service.ts`)

The email service now automatically overrides recipient emails in development mode:

```typescript
const isDev = process.env.NODE_ENV !== 'production';
const defaultTestEmail = process.env.EMAIL_DEFAULT_TEST;

// In development, override recipient to test email if EMAIL_DEFAULT_TEST is set
const recipient = isDev && defaultTestEmail 
  ? defaultTestEmail 
  : data.to;
```

**Behavior:**
- ✅ In development (`NODE_ENV !== "production"`), all emails go to `EMAIL_DEFAULT_TEST`
- ✅ In production, emails go to the actual recipient
- ✅ Logs show both original and actual recipient for debugging

### Environment Variable

Add to your `.env` file:

```bash
EMAIL_DEFAULT_TEST="ashwin.manjunath@omio.com"
NODE_ENV="development"
```

**Note:** In production, either:
- Don't set `EMAIL_DEFAULT_TEST`, or
- Set `NODE_ENV="production"` to disable the override

## Frontend Changes

### CreateSurveyModal Pre-population (`client/src/components/surveys/CreateSurveyModal.tsx`)

When switching to "Individual" mode, the modal automatically pre-populates with a test recipient:

```typescript
// Pre-populate Individual mode with test email when switching to Individual mode
useEffect(() => {
  if (isOpen && sendMode === 'individual' && selectedRecipients.length === 0) {
    const testRecipient: SurveyRecipient = {
      type: 'manual',
      email: 'ashwin.manjunath@omio.com',
      name: 'Ashwin (Test)',
    };
    setSelectedRecipients([testRecipient]);
  }
}, [isOpen, sendMode]);
```

**Behavior:**
- ✅ When switching to "Individual" mode, test email is automatically added
- ✅ Only pre-populates if recipients list is empty
- ✅ User can still add/remove recipients as needed

## Testing Workflow

### Quick Test Flow

1. **Open Create Survey Modal**
   - Click "Create New Survey" button (no navigation, just opens modal)

2. **Fill Survey Details**
   - Enter survey name
   - Select template (optional)
   - Configure email settings

3. **Select Individual Mode**
   - Click "Individual" in "Send To" section
   - Test email (`ashwin.manjunath@omio.com`) is automatically added

4. **Send Survey**
   - Click "Save survey"
   - In development, email will be sent to `ashwin.manjunath@omio.com` regardless of selected recipients
   - Check MailHog at `http://localhost:8025` to view the email

### Cohort Mode Testing

Even in "Cohort" mode, all emails in development will go to the test address:

1. Select "Cohort" mode
2. Configure cohort filters (optional)
3. Send survey
4. All emails (even if cohort resolves to 50 candidates) will go to `ashwin.manjunath@omio.com`

## Production Safety

✅ **Production behavior is preserved:**
- When `NODE_ENV="production"`, emails go to actual recipients
- `EMAIL_DEFAULT_TEST` is ignored in production
- No changes needed for production deployment

## Files Changed

1. **`backend/src/services/email.service.ts`**
   - Updated recipient override logic to use `NODE_ENV` and `EMAIL_DEFAULT_TEST`
   - Enhanced logging to show override behavior

2. **`client/src/components/surveys/CreateSurveyModal.tsx`**
   - Added useEffect to pre-populate Individual mode with test email
   - Maintains hooks-safe structure (no conditional hooks)

3. **`client/src/pages/SurveyManagement.tsx`**
   - Already has `type="button"` to prevent navigation
   - Uses `onClick` handler (no Link/NavLink)

## Environment Setup

### Required `.env` Variables

```bash
# Development
NODE_ENV="development"
EMAIL_DEFAULT_TEST="ashwin.manjunath@omio.com"

# Email Configuration (for MailHog in dev)
EMAIL_MODE="local"
MAILHOG_HOST="localhost"
MAILHOG_PORT="1025"

# Production (when deploying)
NODE_ENV="production"
RESEND_API_KEY="your-resend-api-key"
```

## Verification

### Check Email Override is Working

1. Create a survey with any recipients
2. Check backend logs for:
   ```
   [Email Service] Sending survey email: {
     environment: 'development',
     isDev: true,
     originalRecipient: 'some.other@email.com',
     actualRecipient: 'ashwin.manjunath@omio.com',
     testEmailOverride: 'ashwin.manjunath@omio.com',
     ...
   }
   ```

3. Check MailHog at `http://localhost:8025`
4. Verify email was sent to `ashwin.manjunath@omio.com`

## Troubleshooting

### Emails not going to test address?

1. Check `NODE_ENV` is set to `"development"` (not `"production"`)
2. Verify `EMAIL_DEFAULT_TEST` is set in `.env`
3. Restart backend server after changing `.env`

### Test email not pre-populating in Individual mode?

1. Make sure you're switching to Individual mode (not already in it)
2. Clear recipients list first if it's not empty
3. Check browser console for errors

### Production emails still going to test address?

1. Ensure `NODE_ENV="production"` in production environment
2. Don't set `EMAIL_DEFAULT_TEST` in production (or it will be ignored anyway)

