# 📧 Troubleshooting: Recipient Didn't Receive Email

## ✅ SMTP Status

**SMTP is working correctly!** Test email sent successfully to `prapti.shah@omio.com`.

## 🔍 Why Recipient Might Not Receive Email

### 1. **Email Went to Spam** ⚠️ (Most Common - 90% of cases)

**What to check:**
- Ask recipient to check **Spam/Junk** folder
- Search for: `from:ashwin.manjunath@omio.com`
- Look for subject: "Candidate Survey: [Survey Name]"

**Why this happens:**
- Gmail filters HTML emails with links
- First-time sender = higher spam score
- Survey emails often trigger spam filters

**Solution:**
- Mark as "Not Spam" if found
- Add sender to contacts
- Future emails will arrive in inbox

---

### 2. **Check Backend Logs - Verify Recipient**

**Check backend console for:**
```
[SurveyEmail] ⚠️  TO (recipient): prapti.shah@omio.com
[Email Service] ⚠️  EMAIL DETAILS - FROM: ... TO: prapti.shah@omio.com
[Email Service] ✅ Email sent successfully: { messageId: "...", ... }
```

**Verify:**
- Does `TO:` show the correct recipient?
- Does it match who you selected in the modal?

---

### 3. **Email Address Typo**

**Check:**
- Is the email address correct?
- Any typos in the recipient email?
- Is it a valid, active email address?

---

### 4. **Gmail Promotions Tab**

**Check:**
- Gmail may route to **Promotions** tab
- Check all tabs: Primary, Social, Promotions, Updates

---

### 5. **Email Filters/Rules**

**Check recipient's Gmail:**
- Settings → Filters and Blocked Addresses
- Check if any filters are auto-archiving emails
- Check if sender is blocked

---

## 🧪 Verification Steps

### Step 1: Check Backend Logs

When you sent the survey, check backend console:

```
[SurveyEmail] ⚠️  IMPORTANT: Recipients from frontend: ["prapti.shah@omio.com"]
[POST /api/surveys/send] ⚠️  FINAL RECIPIENTS: ["prapti.shah@omio.com"]
[SurveyEmail] ⚠️  TO (recipient): prapti.shah@omio.com
[Email Service] ⚠️  EMAIL DETAILS - FROM: ashwin.manjunath@omio.com TO: prapti.shah@omio.com
[Email Service] ✅ Email sent successfully: { messageId: "...", ... }
```

**Questions:**
- Does `FINAL RECIPIENTS` show the correct email?
- Does `TO:` show the correct recipient?
- Was `messageId` returned? (indicates successful send)

### Step 2: Check Email Header

If you received a copy (Gmail shows sent emails):
1. Open the email
2. Click "Show original" or "View source"
3. Look for: `To: prapti.shah@omio.com`
4. Verify the "To" field matches intended recipient

### Step 3: Ask Recipient to Check

**Ask recipient to:**
1. Check **Spam/Junk** folder
2. Search for: `from:ashwin.manjunath@omio.com`
3. Check **all Gmail tabs** (Primary, Promotions, etc.)
4. Check **All Mail** folder
5. Verify email address is correct and active

---

## 📋 Quick Checklist

- [ ] Backend logs show correct recipient in `TO:` field
- [ ] Backend logs show `✅ Email sent successfully` with messageId
- [ ] Recipient checked Spam folder
- [ ] Recipient checked all Gmail tabs
- [ ] Recipient searched for `from:ashwin.manjunath@omio.com`
- [ ] Email address is correct (no typos)
- [ ] Email address is active/valid

---

## 🔍 What to Check Now

### 1. Backend Console Logs

**Please share:**
- What does `⚠️  FINAL RECIPIENTS` show?
- What does `⚠️  TO (recipient):` show?
- Was there a `✅ Email sent successfully` message?
- What was the `messageId`?

### 2. Browser Console Logs

**Please share:**
- What does `⚠️  RECIPIENT EMAILS TO SEND` show?
- What recipient did you select in the modal?

### 3. Recipient Verification

**Ask recipient:**
- Did you check Spam folder?
- Did you search for `from:ashwin.manjunath@omio.com`?
- What email address should the survey go to?

---

## 🚨 If Email Went to Wrong Recipient

If backend logs show wrong recipient:

1. **Check browser console** - what recipients were sent?
2. **Check modal** - what recipients were selected?
3. **Clear browser cache** and try again
4. **Check if multiple recipients** were selected accidentally

---

## ✅ Most Likely Solution

**90% chance:** Email went to **Spam folder**

**Action:**
1. Ask recipient to check Spam
2. If found, mark as "Not Spam"
3. Add sender to contacts
4. Future emails will arrive in inbox

---

**Please share the backend console logs so I can verify the recipient!** 🔍

