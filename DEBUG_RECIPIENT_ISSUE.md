# 🔍 Debug: Recipient Issue - Step by Step

## 🎯 What to Check

When you send a survey, check **BOTH** frontend and backend logs:

### Frontend (Browser Console)

Open **DevTools → Console** and look for:

```
[CreateSurveyModal] ⚠️  SELECTED RECIPIENTS: [...]
[CreateSurveyModal] ⚠️  RECIPIENT EMAILS TO SEND: [...]
[CreateSurveyModal] ⚠️  CALLING POST /api/surveys/send with payload: {...}
```

**Check:**
- Does `RECIPIENT EMAILS TO SEND` show the correct emails?
- Does it include `chaswin123@gmail.com` when you didn't select it?

### Backend (Terminal Console)

Look for:

```
[SurveyEmail] ⚠️  IMPORTANT: Recipients from frontend: [...]
[POST /api/surveys/send] ⚠️  FINAL RECIPIENTS: [...]
[SurveyEmail] ⚠️  About to send email - TO: ..., FROM: ...
[Email Service] ⚠️  EMAIL DETAILS - FROM: ... TO: ...
```

**Check:**
- Does `FINAL RECIPIENTS` match what you selected?
- Does `TO:` show the correct recipient?

---

## 🧪 Test Steps

### Test 1: Send to Prapti Only

1. **Open Create Survey modal**
2. **Switch to "Individual" mode**
3. **Remove any auto-selected recipients** (if any)
4. **Search for "prapti"** in candidate list
5. **Select only Prapti Shah**
6. **Check "Selected Recipients" section** - should show only Prapti
7. **Click "Send Now"**
8. **Check browser console** - what does `RECIPIENT EMAILS TO SEND` show?
9. **Check backend console** - what does `FINAL RECIPIENTS` show?
10. **Check your inbox** - what emails did you receive?

### Test 2: Check Email Header

1. **Open the email** you received
2. **Click "Show original"** or **"View source"**
3. **Look for:** `To: chaswin123@gmail.com` or `To: prapti.shah@omio.com`
4. **What does the "To" field say?**

---

## 🤔 Common Scenarios

### Scenario A: Gmail Showing Sent Emails (Normal)

**What you see:**
- Email in your inbox
- "To: chaswin123@gmail.com" in header

**What's happening:**
- Gmail shows emails sent FROM your account
- This is normal behavior
- The email IS going to chaswin123@gmail.com
- You're just seeing a copy

**Solution:** This is normal - check if chaswin123@gmail.com actually received it

---

### Scenario B: Wrong Recipient in Logs

**What you see:**
- Backend logs show: `FINAL RECIPIENTS: ["chaswin123@gmail.com"]`
- But you selected Prapti

**What's happening:**
- Frontend is sending wrong recipients
- Or recipients not being cleared properly

**Solution:** Check frontend logs to see what's being sent

---

### Scenario C: Multiple Recipients

**What you see:**
- Backend logs show: `FINAL RECIPIENTS: ["prapti.shah@omio.com", "chaswin123@gmail.com"]`

**What's happening:**
- Multiple recipients selected
- Or old recipients not cleared

**Solution:** Clear recipients before selecting new ones

---

## 🔧 Quick Fix: Clear Recipients

If recipients are not being cleared:

1. **Close the modal**
2. **Reopen it**
3. **Manually remove any auto-selected recipients**
4. **Select only the recipient you want**
5. **Send**

---

## 📋 What I Need From You

Please provide:

1. **Browser Console Logs:**
   - Copy the `⚠️  RECIPIENT EMAILS TO SEND` line
   - Copy the `⚠️  CALLING POST` payload

2. **Backend Console Logs:**
   - Copy the `⚠️  FINAL RECIPIENTS` line
   - Copy the `⚠️  EMAIL DETAILS - TO:` lines

3. **Email Header:**
   - What does the "To" field say in the email you received?

4. **What you selected:**
   - Which recipients did you select in the modal?

---

**With these logs, I can identify exactly what's happening!** 🔍

