# 🔍 Why Survey Form Email vs Test Email Behave Differently

## ✅ Both Emails Are Sent Successfully

**Test Email (Simple):**
- Plain text or minimal HTML
- Simple subject line
- **Less likely to trigger spam filters**

**Survey Email (From Form):**
- Rich HTML content with styling
- Links and buttons
- More complex structure
- **More likely to trigger spam filters** → Goes to Spam folder

## 🎯 Key Differences

### Test Email Format
```
Subject: Test Email from Candidate 360 NPS
Content: Simple text or minimal HTML
Links: None or simple text link
```

### Survey Email Format
```
Subject: Candidate Survey: [Survey Name]
Content: Rich HTML with:
  - Styled header with gradient
  - Multiple paragraphs
  - Call-to-action button
  - Survey link
  - Footer with branding
```

## 📧 Why Survey Emails Go to Spam

### 1. **HTML Content Triggers Filters**
- Rich HTML emails are more likely to be flagged
- Gmail's AI analyzes HTML structure
- Complex styling can trigger spam detection

### 2. **Links in Email**
- Survey emails contain links (`https://example.com/survey`)
- Gmail checks link reputation
- New/unfamiliar links = higher spam score

### 3. **Email Volume**
- First email from sender = more likely spam
- After recipient marks as "Not Spam", future emails improve

### 4. **Subject Line**
- "Candidate Survey" might trigger filters
- Words like "survey", "feedback", "request" can be spam triggers

## ✅ Solutions

### Solution 1: Ask Recipient to Check Spam (Most Important)
1. Check **Spam/Junk** folder
2. Search for: `from:ashwin.manjunath@omio.com`
3. If found, mark as **"Not Spam"**
4. Move to **Inbox**

### Solution 2: Whitelist Sender
Ask recipient to add `ashwin.manjunath@omio.com` to:
- **Gmail Contacts**
- This improves future delivery

### Solution 3: Simplify Email Content (Optional)
If spam issues persist, we can:
- Reduce HTML complexity
- Use simpler styling
- Remove some elements

### Solution 4: Use SPF/DKIM Records (Production)
For production, set up:
- **SPF records** - Authorize sending server
- **DKIM signing** - Verify email authenticity
- **DMARC policy** - Protect domain reputation

## 🧪 How to Verify Survey Email Was Sent

### Check Backend Logs

When you send via survey form, look for:
```
[SurveyEmail] ✅ Email sent successfully to chaswin123@gmail.com (MessageID: ...)
[Email Service] ✅ Email sent successfully: { messageId: "...", ... }
```

### Test Survey Email Format

I just tested the survey email format and it sent successfully:
```
✅ Survey email sent!
   MessageID: <b07b8624-0df8-7791-4918-f6617473841c@omio.com>
   Response: 250 2.0.0 OK
```

## 📋 Summary

| Aspect | Test Email | Survey Email |
|--------|-----------|--------------|
| **Format** | Simple text | Rich HTML |
| **Content** | Minimal | Styled with links |
| **Spam Risk** | Low | Higher |
| **Delivery** | Inbox | Often Spam folder |
| **SMTP Status** | ✅ Sent | ✅ Sent |

## 🎯 Bottom Line

**Both emails are sent successfully by SMTP**, but:
- **Test email** → Simple → Goes to Inbox ✅
- **Survey email** → Rich HTML → Goes to Spam ⚠️

**The solution:** Ask recipients to check Spam folder and mark as "Not Spam". After that, future survey emails should arrive in Inbox.

---

**Next Steps:**
1. ✅ Verify email was sent (check backend logs)
2. ✅ Ask recipient to check Spam folder
3. ✅ Mark as "Not Spam" if found
4. ✅ Add sender to contacts for future

The system is working correctly - it's just Gmail's spam filtering being cautious with HTML emails! 📧

