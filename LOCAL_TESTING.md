# 🧪 LOCAL EMAIL & SMS TESTING GUIDE

Complete guide for testing survey email and SMS sending in local development.

---

## 🎯 Overview

This guide shows you how to test the complete survey-sending flow locally using **MailHog** for email testing and **mock mode** for SMS testing.

**What you'll learn:**
- How to start MailHog for local email testing
- How to create and send test surveys
- How to view sent emails in MailHog UI
- How to validate survey links and responses
- How to debug email delivery issues

---

## 🚀 Quick Start

### 1. Start Infrastructure with MailHog

```bash
# Start all services including MailHog
docker-compose up -d

# Verify all services are running
docker-compose ps

# You should see:
# ✅ candidate-360-postgres (healthy)
# ✅ candidate-360-redis (healthy)
# ✅ candidate-360-mailhog (running)
```

### 2. Configure Your Test Email Address

```bash
# Edit .env file
nano .env

# Set YOUR email address for testing
TEST_EMAIL_ADDRESS=your-actual-email@gmail.com

# Ensure these are set
EMAIL_MODE=local
SMS_MODE=mock
MAILHOG_HOST=localhost
MAILHOG_PORT=1025
```

**⚠️ IMPORTANT**: In `EMAIL_MODE=local`, ALL survey emails will be sent to `TEST_EMAIL_ADDRESS`, regardless of the original recipient.

### 3. Install Dependencies

```bash
# Install nodemailer (if not already installed)
cd backend
npm install

# This will install:
# - nodemailer@^6.9.7
# - @types/nodemailer@^6.4.14
```

### 4. Start Backend & Workers

```bash
# Terminal 1: Backend API
cd backend
npm run dev

# You should see:
# 🚀 Server running on http://localhost:4000
# 📊 Environment: development

# Terminal 2: Background Workers
cd backend
npm run dev:workers

# You should see:
# ✅ Survey send worker started
# ✅ SmartRecruiters sync worker started
# ✅ Bulk import worker started
# ✅ Metrics aggregation worker started
```

### 5. Access MailHog Web UI

Open in your browser:
```
http://localhost:8025
```

You should see the MailHog inbox interface (empty initially).

---

## 📧 Testing Email Flow

### Method 1: Quick Test Endpoint (Recommended)

#### Step 1: Get Your Auth Token

```bash
# Login to get token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password"
  }'

# Copy the "token" from response
```

#### Step 2: Check Test Configuration

```bash
curl -X GET http://localhost:4000/api/test/config \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Should show:
# {
#   "emailMode": "local",
#   "smsMode": "mock",
#   "testEmailAddress": "your-email@gmail.com",
#   "mailhogWebUI": "http://localhost:8025",
#   ...
# }
```

#### Step 3: Get a Survey ID

```bash
# List available test surveys
curl -X GET http://localhost:4000/api/test/surveys \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Copy a surveyId from the response
# OR create a new test survey:

curl -X POST http://localhost:4000/api/test/create-test-survey \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"

# This will return a new survey with ID
```

#### Step 4: Send Test Email

```bash
curl -X POST http://localhost:4000/api/test/send-survey \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "surveyId": "YOUR_SURVEY_ID",
    "to": "your-email@gmail.com",
    "channel": "email"
  }'

# Response:
# {
#   "success": true,
#   "jobId": "1234",
#   "message": "Survey send job queued successfully",
#   "mailhogUrl": "http://localhost:8025",
#   "instructions": "Check MailHog at http://localhost:8025"
# }
```

#### Step 5: View Email in MailHog

```
1. Open: http://localhost:8025
2. You should see 1 new email in inbox
3. Click on the email to view
4. Verify:
   - To: your-email@gmail.com
   - Subject: "Feedback Request: Post-Interview NPS"
   - Body: Contains survey link and candidate name
```

---

### Method 2: Via Survey Management UI (Full Flow)

#### Step 1: Login to Frontend

```
1. Open: http://localhost:5173
2. Login with:
   - Email: admin@example.com
   - Password: password
```

#### Step 2: Navigate to Survey Management

```
1. Click "Survey Management" in sidebar
2. Click "Distribute Survey" button
```

#### Step 3: Distribute Survey

```
1. Select a survey template
2. Select candidates OR cohort
3. Choose channel: Email
4. Click "Send Now"
5. Wait for success toast
```

#### Step 4: Check MailHog

```
1. Open: http://localhost:8025
2. Should see emails for each candidate
3. ALL emails will be sent to your TEST_EMAIL_ADDRESS
4. Click any email to view details
```

---

## 📊 Viewing and Inspecting Emails

### MailHog Web UI (http://localhost:8025)

**Features:**
- 📥 Inbox view with all captured emails
- 🔍 Search emails by subject, sender, recipient
- 📧 View HTML and plain text versions
- 🔗 Click links directly from emails
- 🗑️ Delete individual or all emails
- 📋 View raw email headers and MIME

**Navigation:**
```
Top Bar:
  - Search box (search by subject/sender/recipient)
  - Delete all button
  - Refresh button

Email List:
  - Click any email to view
  - Shows: From, To, Subject, Time

Email Detail View:
  - HTML tab: See rendered email
  - Plain Text tab: See text version
  - Source tab: See raw email source
  - MIME tab: See MIME structure
```

### MailHog API

```bash
# Get all emails
curl http://localhost:8025/api/v2/messages

# Get specific email
curl http://localhost:8025/api/v2/messages/EMAIL_ID

# Delete all emails
curl -X DELETE http://localhost:8025/api/v1/messages

# Search emails
curl http://localhost:8025/api/v2/search?kind=to&query=test@example.com
```

### Check MailHog Status via Test Endpoint

```bash
curl http://localhost:4000/api/test/mailhog-status \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response shows:
# - Total emails in MailHog
# - Recent 10 emails
# - MailHog URL
```

---

## 🔍 Debugging Email Delivery

### Check Worker Logs

```bash
# Terminal where workers are running should show:

[Email Service] Using MailHog for local email testing
[Email Service] Sending survey email: {
  mode: 'local',
  originalRecipient: 'candidate@example.com',
  actualRecipient: 'your-test-email@gmail.com',
  subject: 'Feedback Request: Post-Interview NPS',
  candidateName: 'John Doe',
  surveyLink: 'http://localhost:5173/survey/survey_...',
  timestamp: '2025-11-29T...'
}
[Email Service] ✅ Email sent successfully: {
  messageId: '<...@mailhog.example>',
  response: '250 Ok: queued as ...',
  accepted: ['your-test-email@gmail.com']
}
[Email Service] 📬 View email at: http://localhost:8025
```

### Common Issues

#### **Issue 1: Email not appearing in MailHog**

**Diagnosis:**
```bash
# Check MailHog is running
docker ps | grep mailhog
# Should show: candidate-360-mailhog (Up)

# Check MailHog logs
docker-compose logs mailhog

# Test MailHog directly
curl http://localhost:8025
# Should return HTML
```

**Solution:**
```bash
# Restart MailHog
docker-compose restart mailhog

# Or restart all services
docker-compose down
docker-compose up -d
```

#### **Issue 2: Wrong email address receiving emails**

**Check:**
```bash
# Verify TEST_EMAIL_ADDRESS in .env
cat .env | grep TEST_EMAIL_ADDRESS

# Check backend is reading it
curl http://localhost:4000/api/test/config \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Solution:**
```bash
# Update .env
echo "TEST_EMAIL_ADDRESS=your-correct-email@gmail.com" >> .env

# Restart backend and workers
# (They need to reload environment variables)
```

#### **Issue 3: Worker not sending emails**

**Check:**
```bash
# Check worker logs for errors
# Look for: [Email Service] or [Worker] messages

# Check Redis is connected
docker-compose logs redis

# Check job queue
# (Connect to Redis and inspect queue)
```

**Solution:**
```bash
# Restart workers
# In worker terminal, press Ctrl+C
npm run dev:workers
```

#### **Issue 4: Email sent but HTML not rendering**

**Check:**
```
1. Open MailHog: http://localhost:8025
2. Click the email
3. Switch between "HTML" and "Plain Text" tabs
4. If HTML tab is blank, check email.service.ts
```

---

## 📱 Testing SMS (Mock Mode)

SMS is automatically mocked in local development to avoid costs and accidental sends.

### View SMS Logs

```bash
# Worker terminal will show:

[SMS Service] 📱 MOCK MODE - SMS not sent: {
  to: '+1234567890',
  candidateName: 'John Doe',
  message: 'Hi John Doe, please share your feedback: https://...',
  timestamp: '2025-11-29T...'
}
```

### Test SMS Sending

```bash
# Send survey with SMS channel
curl -X POST http://localhost:4000/api/test/send-survey \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "surveyId": "YOUR_SURVEY_ID",
    "channel": "sms"
  }'

# Check worker logs - should see SMS mock log
```

### Enable Real SMS (Not Recommended for Local)

If you really need to test real SMS locally:

```bash
# Add to .env
SMS_MODE=production
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Uncomment Twilio code in:
# backend/src/services/sms.service.ts

# Restart workers
```

**⚠️ Warning**: Real SMS will incur costs and send to actual phone numbers!

---

## ✅ Complete Test Workflow

### Full End-to-End Test

#### **1. Setup (One-Time)**

```bash
# Start infrastructure
docker-compose up -d

# Install dependencies
cd backend && npm install

# Run migrations
npm run migrate

# Seed database
npm run seed

# Start servers
# Terminal 1:
npm run dev

# Terminal 2:
npm run dev:workers
```

#### **2. Create Test Survey**

```bash
# Get auth token
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.token')

# Create test survey
SURVEY_RESPONSE=$(curl -s -X POST http://localhost:4000/api/test/create-test-survey \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

# Extract survey ID
SURVEY_ID=$(echo $SURVEY_RESPONSE | jq -r '.survey.id')

echo "Created survey: $SURVEY_ID"
```

#### **3. Send Test Email**

```bash
# Send survey email
curl -X POST http://localhost:4000/api/test/send-survey \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"surveyId\": \"$SURVEY_ID\",
    \"to\": \"your-email@gmail.com\",
    \"channel\": \"email\"
  }"

# Response will include jobId and instructions
```

#### **4. Verify Email Received**

```bash
# Open MailHog
open http://localhost:8025

# Or check via API
curl http://localhost:8025/api/v2/messages | jq '.'

# Or use test endpoint
curl -X GET http://localhost:4000/api/test/mailhog-status \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

#### **5. Test Survey Link**

```
1. In MailHog UI, click the email
2. Click "HTML" tab
3. Click the "Take Survey" button in the email
4. Should open survey page in browser
5. (Note: Survey response page needs to be implemented)
```

#### **6. Verify in Database**

```bash
# Check survey status was updated
docker-compose exec postgres psql -U postgres -d candidate_360_nps \
  -c "SELECT id, status, sent_at FROM surveys ORDER BY created_at DESC LIMIT 5;"

# Should show survey with status: SENT and sent_at timestamp
```

---

## 🎨 Email Template Preview

The generated survey email includes:

**HTML Version:**
- Modern gradient header
- Personalized greeting
- Clear call-to-action button
- Alternative link (if button doesn't work)
- Professional footer
- Responsive design

**Plain Text Version:**
- Simple, clean text
- Survey link
- Same content as HTML

**Example:**
```
Subject: Feedback Request: Post-Interview NPS

Hi John Doe,

Thank you for taking the time to interview with us...

[Take Survey Button]

Or copy this link:
https://your-app.com/survey/token123

Thank you!
```

---

## 🔧 Test Endpoints Reference

### 1. **POST /api/test/send-survey**
Send a test survey email

```bash
curl -X POST http://localhost:4000/api/test/send-survey \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "surveyId": "clx123...",
    "to": "your-email@gmail.com",
    "channel": "email"
  }'
```

**Parameters:**
- `surveyId` (required) - Survey to send
- `to` (optional) - Override test email address
- `channel` (optional) - "email", "sms", or "both" (default: "email")

**Response:**
```json
{
  "success": true,
  "jobId": "1234",
  "surveyId": "clx123...",
  "candidate": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "testEmail": "your-email@gmail.com",
  "channel": "email",
  "message": "Survey send job queued successfully",
  "mailhogUrl": "http://localhost:8025",
  "instructions": "Check MailHog at http://localhost:8025"
}
```

---

### 2. **GET /api/test/surveys**
List available surveys for testing

```bash
curl -X GET http://localhost:4000/api/test/surveys \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "surveys": [
    {
      "id": "clx123...",
      "templateName": "Post-Interview NPS",
      "candidate": {
        "name": "John Doe",
        "email": "john@example.com"
      },
      "status": "PENDING"
    }
  ],
  "example": {
    "surveyId": "clx123...",
    "to": "your-email@gmail.com",
    "channel": "email"
  }
}
```

---

### 3. **POST /api/test/create-test-survey**
Create a test survey quickly

```bash
curl -X POST http://localhost:4000/api/test/create-test-survey \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "survey": {
    "id": "clx456...",
    "templateName": "Post-Interview NPS",
    "candidateName": "John Doe",
    "candidateEmail": "john@example.com"
  },
  "nextStep": {
    "endpoint": "POST /api/test/send-survey",
    "payload": {
      "surveyId": "clx456...",
      "to": "your-email@gmail.com",
      "channel": "email"
    }
  }
}
```

---

### 4. **GET /api/test/mailhog-status**
Check MailHog status and recent emails

```bash
curl -X GET http://localhost:4000/api/test/mailhog-status \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "status": "running",
  "mailhogUrl": "http://localhost:8025",
  "totalEmails": 5,
  "emails": [
    {
      "id": "abc123",
      "from": "surveys@yourdomain.com",
      "to": ["your-email@gmail.com"],
      "subject": "Feedback Request: Post-Interview NPS",
      "created": "2025-11-29T..."
    }
  ]
}
```

---

### 5. **GET /api/test/config**
Show current test configuration

```bash
curl -X GET http://localhost:4000/api/test/config \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "emailMode": "local",
  "smsMode": "mock",
  "testEmailAddress": "your-email@gmail.com",
  "mailhogHost": "localhost",
  "mailhogPort": "1025",
  "mailhogWebUI": "http://localhost:8025",
  "environment": "development",
  "warnings": []
}
```

---

## 🎯 Test Scenarios

### Scenario 1: Single Email Test

```bash
# 1. Create test survey
RESPONSE=$(curl -s -X POST http://localhost:4000/api/test/create-test-survey \
  -H "Authorization: Bearer $TOKEN")

SURVEY_ID=$(echo $RESPONSE | jq -r '.survey.id')

# 2. Send email
curl -X POST http://localhost:4000/api/test/send-survey \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"surveyId\":\"$SURVEY_ID\",\"channel\":\"email\"}"

# 3. Check MailHog
open http://localhost:8025
```

---

### Scenario 2: Bulk Email Test

```bash
# Via UI:
1. Login to frontend
2. Go to Survey Management
3. Click "Distribute Survey"
4. Select template
5. Select 5-10 candidates
6. Click "Send Now"

# Result:
- Job queued for each candidate
- All emails go to TEST_EMAIL_ADDRESS
- Check MailHog: should see 5-10 emails
```

---

### Scenario 3: Scheduled Survey Test

```bash
# Via UI:
1. Go to Survey Management
2. Click "Distribute Survey"
3. Select "Schedule for later"
4. Set time: 2 minutes from now
5. Click "Schedule"

# Wait 2 minutes...

# Check MailHog:
- Email should appear after scheduled time
- Worker processes scheduled surveys automatically
```

---

### Scenario 4: Email + SMS Test

```bash
curl -X POST http://localhost:4000/api/test/send-survey \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "surveyId": "YOUR_SURVEY_ID",
    "channel": "both"
  }'

# Results:
# - Email sent to MailHog (check UI)
# - SMS mocked (check worker logs)
```

---

## 🔧 Configuration Reference

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `EMAIL_MODE` | `local` | Email delivery mode (`local` or `production`) |
| `TEST_EMAIL_ADDRESS` | - | **Your email address** for testing |
| `MAILHOG_HOST` | `localhost` | MailHog SMTP host |
| `MAILHOG_PORT` | `1025` | MailHog SMTP port |
| `SMS_MODE` | `mock` | SMS delivery mode (`mock` or `production`) |

### MailHog Ports

| Port | Service | Access |
|------|---------|--------|
| **1025** | SMTP Server | Backend connects here |
| **8025** | Web UI | Open in browser: http://localhost:8025 |

### Email Behavior by Mode

| Mode | Behavior | Use Case |
|------|----------|----------|
| `local` | All emails → TEST_EMAIL_ADDRESS | Development testing |
| `production` | Emails → actual recipients | Production deployment |

---

## 📋 Complete Testing Checklist

### Prerequisites
- [ ] Docker Compose running (`docker-compose ps`)
- [ ] MailHog service is Up
- [ ] Backend server running (`npm run dev`)
- [ ] Workers running (`npm run dev:workers`)
- [ ] TEST_EMAIL_ADDRESS set in `.env`
- [ ] Database seeded (`npm run seed`)

### Email Testing
- [ ] Can access MailHog UI (http://localhost:8025)
- [ ] Can create test survey (POST /api/test/create-test-survey)
- [ ] Can send test email (POST /api/test/send-survey)
- [ ] Email appears in MailHog inbox
- [ ] Email HTML renders correctly
- [ ] Survey link is present in email
- [ ] Email sent to correct test address
- [ ] Worker logs show successful send

### SMS Testing
- [ ] SMS mode is `mock`
- [ ] SMS logs appear in worker terminal
- [ ] No real SMS sent
- [ ] SMS message format is correct

### Integration Testing
- [ ] Can distribute survey via UI
- [ ] Multiple emails handled correctly
- [ ] All emails go to test address
- [ ] Job queue processes correctly
- [ ] No errors in logs

---

## 🎓 Advanced Testing

### Test with Multiple Recipients

```bash
# Get multiple survey IDs
curl -X GET http://localhost:4000/api/test/surveys \
  -H "Authorization: Bearer $TOKEN" | jq '.surveys[].id'

# Send each one
for SURVEY_ID in survey_id_1 survey_id_2 survey_id_3; do
  curl -X POST http://localhost:4000/api/test/send-survey \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"surveyId\":\"$SURVEY_ID\",\"channel\":\"email\"}"
  sleep 1
done

# Check MailHog: should see 3 emails
```

### Test Rate Limiting

```bash
# Send 100 surveys rapidly
for i in {1..100}; do
  curl -X POST http://localhost:4000/api/test/send-survey \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"surveyId":"YOUR_ID","channel":"email"}' &
done

# Worker should respect rate limit: 100 surveys/minute
# Check worker logs for rate limiting messages
```

### Test Email Failures

```bash
# Test with invalid survey ID
curl -X POST http://localhost:4000/api/test/send-survey \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"surveyId":"invalid","channel":"email"}'

# Should return 404: Survey not found
```

---

## 🎬 Quick Demo Script

Copy and run this complete demo:

```bash
#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Starting Survey Email Test Demo${NC}\n"

# 1. Get token
echo -e "${GREEN}Step 1: Getting auth token...${NC}"
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.token')
echo "Token obtained: ${TOKEN:0:20}..."

# 2. Check config
echo -e "\n${GREEN}Step 2: Checking test configuration...${NC}"
curl -s -X GET http://localhost:4000/api/test/config \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 3. Create test survey
echo -e "\n${GREEN}Step 3: Creating test survey...${NC}"
SURVEY=$(curl -s -X POST http://localhost:4000/api/test/create-test-survey \
  -H "Authorization: Bearer $TOKEN")
SURVEY_ID=$(echo $SURVEY | jq -r '.survey.id')
echo "Survey created: $SURVEY_ID"
echo $SURVEY | jq '.survey'

# 4. Send email
echo -e "\n${GREEN}Step 4: Sending test email...${NC}"
curl -s -X POST http://localhost:4000/api/test/send-survey \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"surveyId\":\"$SURVEY_ID\",\"channel\":\"email\"}" | jq '.'

# 5. Check MailHog
echo -e "\n${GREEN}Step 5: Checking MailHog...${NC}"
sleep 2
curl -s http://localhost:4000/api/test/mailhog-status \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo -e "\n${BLUE}✅ Demo complete!${NC}"
echo -e "Open MailHog to view email: ${GREEN}http://localhost:8025${NC}\n"
```

Save as `test-email-demo.sh`, make executable, and run:
```bash
chmod +x test-email-demo.sh
./test-email-demo.sh
```

---

## 📞 Support & Resources

### MailHog Documentation
- GitHub: https://github.com/mailhog/MailHog
- Web UI: http://localhost:8025
- API Docs: http://localhost:8025/docs

### Troubleshooting

**MailHog not accessible:**
```bash
# Check Docker
docker-compose ps mailhog

# Check logs
docker-compose logs mailhog

# Restart
docker-compose restart mailhog
```

**Port conflicts:**
```bash
# Check if port 8025 is in use
lsof -i :8025

# Change port in docker-compose.yml if needed
```

**Environment variables not loading:**
```bash
# Restart backend and workers after .env changes
# They don't auto-reload environment
```

---

## ✅ Testing Checklist

### Basic Tests
- [ ] MailHog UI accessible (http://localhost:8025)
- [ ] Test config shows correct TEST_EMAIL_ADDRESS
- [ ] Can create test survey
- [ ] Can send email via test endpoint
- [ ] Email appears in MailHog within seconds
- [ ] Email HTML renders correctly
- [ ] Survey link is present
- [ ] Worker logs show successful send

### Advanced Tests
- [ ] Can send multiple emails
- [ ] All emails go to test address
- [ ] SMS is mocked (no real SMS sent)
- [ ] Can send via "both" channel
- [ ] Rate limiting works (100/min)
- [ ] Failed sends logged correctly

### Integration Tests
- [ ] Can distribute via UI
- [ ] Scheduled surveys work
- [ ] Cohort distribution works
- [ ] Template selection works

---

## 🎉 Success Indicators

Your local email testing is working when:

✅ **MailHog UI loads** at http://localhost:8025  
✅ **Test config** shows your email address  
✅ **Worker logs** show email sent successfully  
✅ **Email appears** in MailHog inbox  
✅ **Email content** renders properly  
✅ **Survey link** is clickable  
✅ **No real emails** sent to candidates  
✅ **SMS is mocked** (logs only)  

---

## 🔄 Switching to Production

When ready to send real emails:

```bash
# Update .env (or production environment)
EMAIL_MODE=production
RESEND_API_KEY=your_resend_api_key

SMS_MODE=production
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Remove TEST_EMAIL_ADDRESS or leave it
# (only used in local mode)

# Restart backend and workers
```

Emails will now be sent to actual recipients via Resend.

---

**🎊 Happy Testing!**

You can now safely test the complete survey-sending flow locally without sending real emails to candidates.

For questions or issues, check the troubleshooting section above.

