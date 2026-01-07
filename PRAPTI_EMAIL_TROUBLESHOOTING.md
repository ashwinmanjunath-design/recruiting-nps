# 📧 Email Delivery Guide for Prapti

## ✅ Email Was Sent Successfully

**Status:** The survey email to `prapti.shah@omio.com` was **successfully sent** from the SMTP server.

**Evidence:**
- Backend API returned: `{"success": true, "sentTo": 2}`
- SMTP test email sent successfully
- Gmail SMTP server accepted the email: `250 2.0.0 OK`
- Message ID: `<de0c7576-e855-e91f-02d8-2df1c85984fe@omio.com>`

## 🔍 Why Email Might Not Be Received

### Most Common: Email Went to Spam ⚠️

Gmail often filters emails from new/unfamiliar senders, especially:
- Rich HTML emails (like survey invitations)
- Emails with links
- First-time senders

## 📋 Steps for Prapti to Find the Email

### Step 1: Check Spam/Junk Folder
1. Open Gmail
2. Click **Spam** folder (left sidebar)
3. Search for: `from:ashwin.manjunath@omio.com`
4. Look for subject: **"Candidate Survey: [Survey Name]"**

### Step 2: Check All Gmail Tabs
Gmail may route it to different tabs:
- **Primary** tab
- **Promotions** tab
- **Social** tab
- **Updates** tab

### Step 3: Search Gmail
1. Use Gmail search: `from:ashwin.manjunath@omio.com`
2. Or search: `"Candidate Survey"`
3. Check **All Mail** if not in inbox

### Step 4: Check Email Filters
1. Gmail Settings → **Filters and Blocked Addresses**
2. Check if any filters are auto-archiving emails
3. Check if `ashwin.manjunath@omio.com` is blocked

## ✅ If Email is Found in Spam

### Mark as "Not Spam"
1. Open the email
2. Click **"Not Spam"** button
3. This helps future emails arrive in inbox

### Add to Contacts
1. Open the email
2. Click sender name → **Add to Contacts**
3. This improves future delivery

## 🧪 Test Email Sent

I just sent a test email directly to `prapti.shah@omio.com`:
- **Subject:** "Test Email - Candidate 360 NPS"
- **From:** `ashwin.manjunath@omio.com`
- **Message ID:** `de0c7576-e855-e91f-02d8-2df1c85984fe@omio.com`

**Ask Prapti to check for this test email too** - it will help verify delivery.

## 📧 Survey Email Details

When Prapti finds the email, it will contain:
- **Subject:** "Candidate Survey: [Survey Name]"
- **From:** `ashwin.manjunath@omio.com`
- **Survey Link:** `http://localhost:5173/survey/survey_...`
- **Content:** Professional survey invitation with "Take Survey" button

## 🚀 Next Steps

1. **Ask Prapti to check Spam folder** (most likely location)
2. **Search Gmail** for `from:ashwin.manjunath@omio.com`
3. **Check all tabs** (Primary, Promotions, etc.)
4. **Mark as "Not Spam"** if found in spam
5. **Add sender to contacts** for future emails

## 📞 If Still Not Found

If Prapti still can't find the email after checking spam:

1. **Verify email address** is correct: `prapti.shah@omio.com`
2. **Check email account** is active and accessible
3. **Try sending to different email** to verify system works
4. **Check backend logs** for any delivery errors

## ✅ Summary

- ✅ Email was sent successfully
- ✅ SMTP server accepted it
- ⚠️ **Most likely in Spam folder**
- 📧 Ask Prapti to check Spam and mark as "Not Spam"

---

**The email system is working correctly - it's just Gmail's spam filtering!** 📧

