# 🔍 Debug: Why You're Receiving Emails Meant for Others

## 🔍 Understanding the Issue

**Symptom:** You sent a survey to other users, but you're receiving emails meant for `chaswin123@gmail.com`.

## 🤔 Possible Causes

### 1. **Gmail Shows Sent Emails in Inbox** (Most Common)

**What's happening:**
- Gmail often shows emails **sent FROM your account** in your inbox
- Even though the email goes TO `chaswin123@gmail.com`, Gmail shows it to you because you're the sender

**How to check:**
- Look at the email header - does it say **"To: chaswin123@gmail.com"**?
- If yes, this is normal Gmail behavior - the email IS going to the right recipient
- You're just seeing a copy because you sent it

**Solution:** This is normal - check the "To" field in the email header

---

### 2. **Email Forwarding**

**What's happening:**
- Your Gmail account might have forwarding rules
- Emails sent TO `chaswin123@gmail.com` are being forwarded to you

**How to check:**
1. Gmail Settings → **Forwarding and POP/IMAP**
2. Check if forwarding is enabled
3. Check if `chaswin123@gmail.com` forwards to your account

**Solution:** Disable forwarding if not needed

---

### 3. **Wrong Recipient in Code**

**What's happening:**
- The code might be sending to the wrong email address

**How to check:**
- Check backend console logs when sending
- Look for: `[SurveyEmail] ⚠️  FINAL RECIPIENTS`
- Verify the recipients match what you selected in the modal

---

## 🧪 Debugging Steps

### Step 1: Check Backend Logs

When you send a survey, check the backend console for:

```
[SurveyEmail] ⚠️  IMPORTANT: Recipients from frontend: ["prapti.shah@omio.com"]
[POST /api/surveys/send] ⚠️  FINAL RECIPIENTS: ["prapti.shah@omio.com"]
[SurveyEmail] ⚠️  About to send email - TO: prapti.shah@omio.com, FROM: ashwin.manjunath@omio.com
[Email Service] ⚠️  EMAIL DETAILS - FROM: ashwin.manjunath@omio.com TO: prapti.shah@omio.com
```

**Verify:**
- Recipients match what you selected in the modal
- `TO:` field shows the correct recipient
- No unexpected emails in the list

### Step 2: Check Email Header

In Gmail, open the email and check:
1. Click **"Show original"** or **"View source"**
2. Look for: `To: chaswin123@gmail.com` or `To: prapti.shah@omio.com`
3. Check if the "To" field matches the intended recipient

### Step 3: Test with Different Recipient

1. Send a survey to a different email (not chaswin123@gmail.com)
2. Check backend logs - who is it actually sending to?
3. Check your inbox - are you receiving it?
4. Ask the recipient - did they receive it?

---

## ✅ Expected Behavior

**When you send to `prapti.shah@omio.com`:**
- ✅ Email goes TO: `prapti.shah@omio.com`
- ✅ Prapti receives it in her inbox
- ⚠️ You might see it in YOUR inbox too (Gmail shows sent emails)
- ✅ Backend logs show: `TO: prapti.shah@omio.com`

**If you're receiving emails meant for chaswin123@gmail.com:**
- Check if `chaswin123@gmail.com` forwards to you
- Check if you're just seeing sent emails (normal Gmail behavior)
- Check backend logs to see actual recipients

---

## 🔧 Quick Test

### Test 1: Send to Yourself

1. Send survey to: `ashwin.manjunath@omio.com`
2. Check backend logs: Should show `TO: ashwin.manjunath@omio.com`
3. Check inbox: Should receive 1 email

### Test 2: Send to Different Email

1. Send survey to: `prapti.shah@omio.com`
2. Check backend logs: Should show `TO: prapti.shah@omio.com`
3. Check inbox: You might see it (sent email), but Prapti should also receive it
4. Ask Prapti: Did she receive it?

---

## 📋 What to Check

1. **Backend Console Logs:**
   - Look for `⚠️  FINAL RECIPIENTS` - these are the actual recipients
   - Look for `⚠️  EMAIL DETAILS - TO:` - this is who receives the email

2. **Email Header:**
   - Check "To" field in Gmail
   - Does it match the intended recipient?

3. **Gmail Settings:**
   - Check forwarding rules
   - Check filters

4. **Recipient Confirmation:**
   - Ask the recipient if they received the email
   - This confirms if email is going to the right place

---

## 🚨 If Emails Are Going to Wrong Recipient

If backend logs show wrong recipient:

1. **Check frontend modal** - are you selecting the right recipients?
2. **Check browser console** - what payload is being sent?
3. **Check API call** - Network tab → see actual request payload

---

**After checking backend logs, we can identify the exact issue!** 🔍

