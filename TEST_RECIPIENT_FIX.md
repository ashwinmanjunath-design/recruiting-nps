# 🧪 Test: Recipient Selection Fix

## ✅ Servers Running

- ✅ Backend: http://localhost:3001
- ✅ Frontend: http://localhost:5173

## 📋 Test Steps

### Step 1: Open the App

1. Go to: http://localhost:5173
2. Login if needed
3. Navigate to **Surveys** page

### Step 2: Create Survey

1. Click **"Create New Survey"** button
2. Fill in:
   - **Survey Name:** `Test Survey - Recipient Fix`
   - **From Email:** `ashwin.manjunath@omio.com`
   - **Send To:** Select **"Individual"**

### Step 3: Select Recipient

1. **Search for "prapti"** in the candidate search box
2. **Check the box** next to "Prapti Shah (prapti.shah@omio.com)"
3. **Verify** "Selected Recipients" section shows:
   - Prapti Shah (prapti.shah@omio.com) - Product Manager
4. **Make sure** `chaswin123@gmail.com` is NOT in the list

### Step 4: Send Survey

1. Click **"Send Now"** button
2. **Confirmation dialog appears** - verify it shows:
   ```
   Send survey to these 1 recipient(s)?
   
   prapti.shah@omio.com
   ```
3. **Click OK** to confirm

### Step 5: Check Logs

**Browser Console (DevTools → Console):**
Look for:
```
[CreateSurveyModal] ⚠️  ===== RECIPIENT DEBUG =====
[CreateSurveyModal] ⚠️  SELECTED RECIPIENTS (raw): [...]
[CreateSurveyModal] ⚠️  RECIPIENT EMAILS TO SEND: ["prapti.shah@omio.com"]
[CreateSurveyModal] ⚠️  PAYLOAD recipients array: ["prapti.shah@omio.com"]
```

**Backend Console (Terminal):**
Look for:
```
[SurveyEmail] ⚠️  IMPORTANT: Recipients from frontend: ["prapti.shah@omio.com"]
[POST /api/surveys/send] ⚠️  FINAL RECIPIENTS: ["prapti.shah@omio.com"]
[SurveyEmail] ⚠️  TO (recipient): prapti.shah@omio.com
[Email Service] ⚠️  EMAIL DETAILS - FROM: ashwin.manjunath@omio.com TO: prapti.shah@omio.com
```

### Step 6: Verify Email

1. **Check your inbox** - you might see a copy (Gmail shows sent emails)
2. **Check email header** - "To" field should say `prapti.shah@omio.com`
3. **Ask Prapti** - did she receive the email?

---

## ✅ Expected Results

**If fix is working:**
- ✅ Confirmation dialog shows: `prapti.shah@omio.com`
- ✅ Browser console shows: `["prapti.shah@omio.com"]`
- ✅ Backend console shows: `TO: prapti.shah@omio.com`
- ✅ Email goes to Prapti (not chaswin123@gmail.com)

**If still broken:**
- ❌ Confirmation dialog shows: `chaswin123@gmail.com`
- ❌ Browser console shows: `["chaswin123@gmail.com"]`
- ❌ Backend console shows: `TO: chaswin123@gmail.com`

---

## 🔍 What to Report

After testing, please share:

1. **What recipient did you select?** (e.g., Prapti Shah)
2. **What did confirmation dialog show?**
3. **Browser console `RECIPIENT EMAILS TO SEND`:** `[...]`
4. **Backend console `FINAL RECIPIENTS`:** `[...]`
5. **Backend console `TO (recipient):`:** `...`
6. **Who received the email?**

---

**Ready to test! Follow the steps above and share the logs.** 🧪

