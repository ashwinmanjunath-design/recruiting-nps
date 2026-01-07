# 📧 Email Delivery Troubleshooting Guide

## ✅ Email Was Sent Successfully

**Status:** The email to `chaswin123@gmail.com` was **successfully sent** from the SMTP server.

**Evidence:**
- Backend API returned: `{"success": true, "sentTo": 2}`
- SMTP test email sent successfully with Message ID
- Gmail SMTP server accepted the email: `250 2.0.0 OK`

## 🔍 Why Email Might Not Be Received

### 1. **Check Spam/Junk Folder** ⚠️ (Most Common)
- Gmail often filters emails from new/unfamiliar senders
- Check the **Spam** or **Junk** folder in `chaswin123@gmail.com`
- Look for emails from `ashwin.manjunath@omio.com`
- Subject: "Candidate Survey: [Survey Name]"

### 2. **Gmail Promotions Tab**
- Gmail may route it to the **Promotions** tab instead of Primary
- Check all tabs: Primary, Social, Promotions, Updates

### 3. **Email Filtering Rules**
- Gmail may have filters that auto-archive or delete emails
- Check Gmail Settings → Filters and Blocked Addresses

### 4. **Email Address Typo**
- Verify the email address is correct: `chaswin123@gmail.com`
- Double-check for typos (e.g., `chaswin123` vs `chaswin`)

### 5. **Delivery Delay**
- Sometimes emails take 5-15 minutes to arrive
- Wait a few minutes and check again

### 6. **Gmail Account Issues**
- The Gmail account might be inactive or have delivery issues
- Verify `chaswin123@gmail.com` is an active account

## 🧪 How to Verify Email Was Sent

### Check Backend Logs

Look in your backend console for:
```
[SurveyEmail] ✅ Email sent successfully to chaswin123@gmail.com (MessageID: ...)
[Email Service] ✅ Email sent successfully: { messageId: "...", ... }
```

### Test Email Directly

Run this test to send a simple email:
```bash
cd candidate-360-nps/backend
node -e "
require('dotenv').config();
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});
transporter.sendMail({
  from: process.env.SMTP_USER,
  to: 'chaswin123@gmail.com',
  subject: 'Test Email - Candidate 360 NPS',
  html: '<h1>Test Email</h1><p>If you receive this, SMTP is working!</p>'
}, (err, info) => {
  if (err) console.log('Error:', err.message);
  else console.log('Sent! MessageID:', info.messageId);
});
"
```

## ✅ Solutions

### Solution 1: Ask Recipient to Check Spam
1. Ask `chaswin123@gmail.com` to check their **Spam/Junk** folder
2. Search for emails from `ashwin.manjunath@omio.com`
3. If found, mark as "Not Spam" to improve future delivery

### Solution 2: Whitelist Sender Email
Ask recipient to add `ashwin.manjunath@omio.com` to their contacts/whitelist:
- Gmail: Add to Contacts
- This helps Gmail recognize it as a trusted sender

### Solution 3: Use a Different Email Address
Try sending to a different email address to verify delivery:
- Your own Gmail account
- Another test email

### Solution 4: Check Email Content
- Ensure the email content doesn't trigger spam filters
- Avoid spam trigger words in subject/body
- Include proper email headers

## 📋 Email Delivery Checklist

- [ ] Email was sent successfully (API returned `success: true`)
- [ ] Checked Spam/Junk folder
- [ ] Checked all Gmail tabs (Primary, Promotions, etc.)
- [ ] Verified email address is correct
- [ ] Waited 5-15 minutes for delivery
- [ ] Checked Gmail filters/rules
- [ ] Verified recipient email account is active
- [ ] Tried sending to a different email address

## 🚀 Next Steps

1. **Ask recipient to check Spam folder** - This is the #1 reason emails aren't received
2. **Send a test email** using the test script above
3. **Try a different recipient** to verify the system works
4. **Check backend logs** for any delivery errors

## 📞 If Still Not Working

If emails still aren't being received after checking spam:

1. **Check SMTP logs** in backend console for any errors
2. **Verify SMTP credentials** are still valid
3. **Try sending from a different email address** (if you have one)
4. **Contact email provider** (Gmail) if delivery issues persist

---

**Remember:** Gmail's spam filters are very aggressive. Emails from new/unfamiliar senders often go to spam initially. Once the recipient marks it as "Not Spam", future emails should arrive in the inbox.

