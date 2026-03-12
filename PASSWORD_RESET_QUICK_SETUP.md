# 🚀 Password Reset - Quick Setup Guide

## ✅ Implementation Complete!

Your password reset system is ready. Just configure email and test!

---

## ⚡ Quick Setup (3 Steps)

### Step 1: Get Gmail App Password

1. Go to https://myaccount.google.com/apppasswords
2. Create app password for "Mail"
3. Copy the 16-character password

### Step 2: Update backend/.env

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx
CLIENT_URL=http://localhost:3000
```

### Step 3: Restart Backend

```bash
# Backend is already running, just restart to apply changes
# Or it will pick up changes automatically
```

---

## 🧪 Quick Test

1. **Go to:** http://localhost:3000/login
2. **Click:** "Forgot Password?"
3. **Enter:** your registered email
4. **Check:** your email inbox
5. **Click:** reset link in email
6. **Enter:** new password
7. **Login:** with new password ✅

---

## 📧 Email Setup Help

### If you don't have 2-Step Verification:

1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification"
3. Then generate app password

### If email not sending:

- Check EMAIL_USER is correct
- Check EMAIL_PASS is app password (not regular password)
- Check 2-Step Verification is enabled
- Restart backend server

---

## 🎯 What's Working

✅ Forgot password page
✅ Reset password page
✅ Email sending with Nodemailer
✅ Secure token generation
✅ 15-minute token expiration
✅ Password hashing
✅ Success animations
✅ Error handling

---

## 📝 Routes Added

| URL | Purpose |
|-----|---------|
| `/forgot-password` | Request reset link |
| `/reset-password/:token` | Reset password |

---

## 🔐 Security Features

- ✅ Crypto token generation (32 bytes)
- ✅ SHA-256 token hashing
- ✅ 15-minute expiration
- ✅ Bcrypt password hashing
- ✅ One-time use tokens

---

## 💡 Tips

- Use a real Gmail account for testing
- App password is different from your Gmail password
- Reset links expire in 15 minutes
- Each token can only be used once
- Check spam folder if email not in inbox

---

## 🎉 Ready to Use!

Just configure your Gmail credentials and test the password reset flow!

**Backend:** Running on port 5001 ✅
**Frontend:** http://localhost:3000 ✅

---

**Full documentation:** See `PASSWORD_RESET_GUIDE.md`
