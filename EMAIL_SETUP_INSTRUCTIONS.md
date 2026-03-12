# 📧 Email Configuration - Step-by-Step Guide

## ⚠️ Current Issue

The email is failing because Gmail credentials are not configured in `backend/.env`

---

## 🎯 Solution: Configure Gmail App Password

### Step 1: Enable 2-Step Verification

1. Go to https://myaccount.google.com/security
2. Scroll to "How you sign in to Google"
3. Click "2-Step Verification"
4. Follow the setup process
5. Verify it's enabled (should show "On")

### Step 2: Generate App Password

1. Go to https://myaccount.google.com/apppasswords
2. You'll be asked to sign in again
3. Under "Select app" choose "Mail"
4. Under "Select device" choose "Other (Custom name)"
5. Type: "LMS Portal"
6. Click "Generate"
7. **Copy the 16-character password** (format: xxxx xxxx xxxx xxxx)

### Step 3: Update backend/.env

Open `backend/.env` and replace:

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

With your actual credentials:

```env
EMAIL_USER=youractual@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

**Example:**
```env
EMAIL_USER=john.doe@gmail.com
EMAIL_PASS=xmpl qwer tyui asdf
```

### Step 4: Restart Backend

The backend will automatically restart and pick up the new credentials.

### Step 5: Test Again

1. Go to http://localhost:3000/forgot-password
2. Enter your email
3. Click "Send Reset Link"
4. Check your inbox!

---

## 🔄 Alternative: Use Ethereal Email (Testing)

If you don't want to use your real Gmail, use Ethereal for testing:

### Update sendEmail.js:

```javascript
// For testing only - creates a test account
const testAccount = await nodemailer.createTestAccount();

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: testAccount.user,
    pass: testAccount.pass
  }
});

// After sending, log the preview URL
console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
```

This will log a URL where you can view the email in browser.

---

## 🐛 Troubleshooting

### Error: "Username and Password not accepted"

**Causes:**
- Using regular Gmail password instead of app password
- 2-Step Verification not enabled
- Wrong email address
- Typo in app password

**Solutions:**
1. Make sure 2-Step Verification is ON
2. Generate a NEW app password
3. Copy it exactly (with or without spaces)
4. Update .env file
5. Restart backend

### Error: "Less secure app access"

**Solution:**
- Don't use "Less secure app access"
- Use App Password instead (more secure)

### Can't find App Passwords option

**Cause:** 2-Step Verification not enabled

**Solution:**
1. Enable 2-Step Verification first
2. Then App Passwords option will appear

---

## ✅ Verification Checklist

Before testing:
- [ ] 2-Step Verification enabled
- [ ] App password generated
- [ ] EMAIL_USER updated in .env
- [ ] EMAIL_PASS updated in .env
- [ ] Backend restarted
- [ ] No typos in credentials

---

## 📝 Example Configuration

### Working .env file:

```env
MONGODB_URI=mongodb+srv://vicky07913_db_user:9741794663@myapp.fipbaqd.mongodb.net/?appName=MyApp
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5001
EMAIL_USER=myemail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
CLIENT_URL=http://localhost:3000
```

**Important Notes:**
- EMAIL_USER: Your full Gmail address
- EMAIL_PASS: 16-character app password (not your Gmail password)
- Spaces in app password are optional (works with or without)

---

## 🎯 Quick Test

After configuration:

```bash
# Backend should restart automatically
# Or manually restart:
cd backend
npm start
```

Then test:
1. Go to http://localhost:3000/forgot-password
2. Enter a registered email
3. Click "Send Reset Link"
4. Check your Gmail inbox
5. You should receive the reset email!

---

## 💡 Tips

- Use a real Gmail account you have access to
- App password is different from your regular password
- You can generate multiple app passwords
- Each app password is for one application
- You can revoke app passwords anytime
- Emails might take 1-2 minutes to arrive

---

## 🔐 Security Notes

- App passwords are MORE secure than regular passwords
- They're application-specific
- They don't give access to your full Google account
- You can revoke them without changing your main password
- Never share your app password

---

## 📧 Expected Email

Once configured, users will receive:

**Subject:** Reset Your LMS Password

**Content:**
- Personalized greeting
- Reset password button
- Plain text link
- 15-minute expiration notice
- Security information

---

## ✨ Success!

Once configured correctly, you'll see:
- ✅ "Password reset link has been sent to your email"
- ✅ Email in inbox within 1-2 minutes
- ✅ No errors in backend logs

---

**Need help?** Check backend logs for detailed error messages:
```bash
# View backend logs
cd backend
npm start
# Watch for "Email sent successfully" message
```
