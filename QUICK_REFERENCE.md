# 📧 QUICK REFERENCE: Local Email Testing

**One-page guide for testing survey emails locally**

---

## 🚀 Quick Setup (5 Minutes)

### 1. Update `.env` File

```bash
cd backend
nano .env

# Add these lines:
EMAIL_MODE=local
TEST_EMAIL_ADDRESS=your-email@gmail.com  # ⚠️ CHANGE THIS!
MAILHOG_HOST=localhost
MAILHOG_PORT=1025
SMS_MODE=mock
```

### 2. Start Services

```bash
# From project root
docker-compose up -d
```

### 3. Start Backend & Workers

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd backend && npm run dev:workers
```

### 4. Open MailHog

```
http://localhost:8025
```

---

## 📧 Send Test Email (30 Seconds)

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.token')

# 2. Create survey
SURVEY=$(curl -s -X POST http://localhost:4000/api/test/create-test-survey \
  -H "Authorization: Bearer $TOKEN")
  
SURVEY_ID=$(echo $SURVEY | jq -r '.survey.id')

# 3. Send email
curl -X POST http://localhost:4000/api/test/send-survey \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"surveyId\":\"$SURVEY_ID\",\"channel\":\"email\"}"

# 4. Check MailHog
open http://localhost:8025
```

---

## 🔧 Test Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/test/config` | GET | Show test configuration |
| `/api/test/surveys` | GET | List available surveys |
| `/api/test/create-test-survey` | POST | Create test survey |
| `/api/test/send-survey` | POST | Send test email |
| `/api/test/mailhog-status` | GET | Check MailHog |

**All require:** `Authorization: Bearer <token>` header

---

## 📋 Troubleshooting (Quick Fixes)

| Problem | Solution |
|---------|----------|
| Email not in MailHog | `docker-compose restart mailhog` |
| MailHog UI not loading | Check `http://localhost:8025` port |
| Wrong email address | Update `TEST_EMAIL_ADDRESS` in `.env`, restart |
| Worker not sending | Check Redis: `docker-compose ps` |
| Port conflict | Change port in `docker-compose.yml` |

---

## 📊 URLs & Ports

| Service | URL/Port | Purpose |
|---------|----------|---------|
| **MailHog UI** | http://localhost:8025 | View emails |
| **MailHog SMTP** | localhost:1025 | Backend sends here |
| **Backend API** | http://localhost:4000 | REST API |
| **Frontend** | http://localhost:5173 | UI |
| **PostgreSQL** | localhost:5432 | Database |
| **Redis** | localhost:6379 | Job queue |

---

## ✅ Verification Checklist

Quick checklist to ensure everything works:

- [ ] `docker-compose ps` shows 3 services running
- [ ] http://localhost:8025 loads MailHog UI
- [ ] `TEST_EMAIL_ADDRESS` set in `.env`
- [ ] Backend running on port 4000
- [ ] Workers running (shows "started" in logs)
- [ ] Can get auth token via login endpoint
- [ ] Can create test survey
- [ ] Can send test email
- [ ] Email appears in MailHog (< 5 seconds)

---

## 🎯 What Happens in Local Mode

```
Survey Send Request
        ↓
   BullMQ Queue
        ↓
  Survey Worker
        ↓
  Email Service
        ↓
Detects EMAIL_MODE=local
        ↓
Redirects to TEST_EMAIL_ADDRESS
        ↓
Sends to MailHog (localhost:1025)
        ↓
View in MailHog UI (localhost:8025)
```

**Result:** Email goes to YOUR inbox in MailHog, not to the candidate!

---

## 🎨 Email Features

The generated survey email includes:

✅ Professional gradient design  
✅ Personalized candidate name  
✅ Clear "Take Survey" button  
✅ Alternative text link  
✅ Responsive layout  
✅ Plain text fallback  

**Preview:** Send test email and view in MailHog!

---

## 🔐 Safety Features

| Feature | Benefit |
|---------|---------|
| **Auto-redirect** | All emails → your test address |
| **SMS mocking** | No real SMS sent, no costs |
| **Dev-only endpoints** | Test endpoints disabled in production |
| **Comprehensive logs** | Easy debugging with context |

**You cannot accidentally email candidates in local mode!** ✅

---

## 📚 Full Documentation

For complete details, see:

- **`LOCAL_TESTING.md`** - Complete guide (1000+ lines)
- **`LOCAL_EMAIL_TESTING_SETUP.md`** - Setup walkthrough
- **`IMPLEMENTATION_SUMMARY.md`** - Technical details

---

## 🚀 Production Switch

When ready for production:

```bash
# Update .env (or production environment)
EMAIL_MODE=production
RESEND_API_KEY=your_key

SMS_MODE=production
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

**No code changes needed!** Same code, different config.

---

## 💡 Pro Tips

1. **Multiple Tests:** Use `POST /api/test/create-test-survey` to quickly create surveys
2. **Check Config:** Use `GET /api/test/config` to verify setup
3. **Clear Emails:** Click "Delete all" in MailHog UI to start fresh
4. **Search Emails:** Use MailHog search to find specific emails
5. **Test SMS Too:** Use `"channel": "both"` to test email + SMS together

---

## 🎬 One-Line Demo

```bash
# Complete test in one command (requires jq)
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"password"}' | jq -r '.token') && SURVEY_ID=$(curl -s -X POST http://localhost:4000/api/test/create-test-survey -H "Authorization: Bearer $TOKEN" | jq -r '.survey.id') && curl -X POST http://localhost:4000/api/test/send-survey -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d "{\"surveyId\":\"$SURVEY_ID\",\"channel\":\"email\"}" && echo "✅ Email sent! Check http://localhost:8025"
```

---

## ❓ Common Questions

**Q: Do emails get sent to real candidates?**  
A: No! In `EMAIL_MODE=local`, ALL emails go to `TEST_EMAIL_ADDRESS`.

**Q: Do I need a Resend API key for testing?**  
A: No! MailHog doesn't need any API keys or configuration.

**Q: Are real SMS sent in local mode?**  
A: No! `SMS_MODE=mock` only logs SMS, never sends.

**Q: Can I test with my real email address?**  
A: Yes! Set `TEST_EMAIL_ADDRESS` to any email. It will arrive in MailHog, not your real inbox.

**Q: How do I clear MailHog emails?**  
A: Click "Delete all" in MailHog UI, or restart MailHog: `docker-compose restart mailhog`

**Q: Does MailHog persist emails?**  
A: No, emails are stored in memory. Restarting MailHog clears them.

---

## 🎊 Success!

You're ready to test survey emails safely!

**Remember:**
- ✅ MailHog: http://localhost:8025
- ✅ All emails → your test address
- ✅ No real emails or SMS sent
- ✅ Free, fast, safe testing

---

**Last Updated:** November 30, 2025  
**Status:** ✅ Ready to Use

