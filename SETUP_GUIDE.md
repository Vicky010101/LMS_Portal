# 🚀 Complete Setup Guide - EduLearn LMS

This guide will help you set up the entire project from scratch.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- ✅ **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- ✅ **npm** or **yarn** package manager
- ✅ **Git** installed
- ✅ **MongoDB Atlas** account ([Sign up](https://www.mongodb.com/cloud/atlas))
- ✅ **Gmail** account (for email service)
- ✅ **Firebase** account (for Google OAuth)

---

## 🔧 Step-by-Step Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/Vicky010101/React_Auth_Structure.git
cd React_Auth_Structure
```

### Step 2: Backend Setup

#### 2.1 Install Dependencies

```bash
cd backend
npm install
```

#### 2.2 Configure Environment Variables

Create `.env` file in the `backend` directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_random_secret_key
PORT=5001
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:3000
```

#### 2.3 Get MongoDB Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster (free tier available)
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Paste in `MONGODB_URI`

#### 2.4 Get Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and "Other (Custom name)"
5. Name it "LMS Portal"
6. Copy the 16-character password
7. Paste in `EMAIL_PASS` (remove spaces)

#### 2.5 Start Backend Server

```bash
npm start
```

You should see:
```
Server running on port 5001
Connected to MongoDB
```

---

### Step 3: Frontend Setup

#### 3.1 Install Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

#### 3.2 Configure Environment Variables

Create `.env` file in the `frontend` directory:

```bash
cp .env.example .env
```

The default configuration should work:

```env
REACT_APP_API_BASE=http://localhost:5001/api
```

#### 3.3 Configure Firebase (for Google OAuth)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Go to **Authentication** → **Sign-in method**
4. Enable **Google** provider
5. Go to **Project Settings** → **General**
6. Scroll to "Your apps" → Click **Web** icon
7. Register your app
8. Copy the Firebase configuration

Edit `frontend/src/firebase.js`:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

#### 3.4 Start Frontend Server

```bash
npm start
```

Application will open at http://localhost:3000

---

## ✅ Verification

### Test Backend

```bash
# In backend directory
curl http://localhost:5001
```

Should return: `{"status":"ok"}`

### Test Frontend

Open http://localhost:3000 in your browser. You should see the login page.

---

## 🧪 Testing the Application

### 1. Test Signup

1. Go to http://localhost:3000/signup
2. Fill in:
   - Name: "Test Student"
   - Email: "test@example.com"
   - Role: Select "Student"
   - Password: "password123"
   - Confirm Password: "password123"
   - Accept Terms: ✅
3. Click "Create Account"
4. Should redirect to Student Dashboard

### 2. Test Login

1. Logout from dashboard
2. Go to http://localhost:3000/login
3. Enter credentials
4. Click "Sign In"
5. Should redirect to appropriate dashboard

### 3. Test Google OAuth

1. Go to login page
2. Click "Continue with Google"
3. Select Google account
4. Should login and redirect to dashboard

### 4. Test Password Reset

1. Go to login page
2. Click "Forgot Password?"
3. Enter your email
4. Check email inbox (or backend console for Ethereal preview URL)
5. Click reset link
6. Enter new password
7. Login with new password

### 5. Test Role-Based Access

**As Student:**
- Try accessing `/faculty-dashboard`
- Should redirect to `/student-dashboard`

**As Faculty:**
- Try accessing `/student-dashboard`
- Should redirect to `/faculty-dashboard`

---

## 🐛 Common Issues & Solutions

### Issue 1: MongoDB Connection Failed

**Error:** `MongoNetworkError: failed to connect to server`

**Solutions:**
- Check MongoDB Atlas is running
- Verify connection string is correct
- Whitelist your IP address in MongoDB Atlas
- Check network access settings

### Issue 2: Email Not Sending

**Error:** `Email could not be sent`

**Solutions:**
- Verify Gmail app password is correct
- Check 2-Step Verification is enabled
- Remove spaces from app password
- Check EMAIL_USER and EMAIL_PASS in .env
- For testing, system will use Ethereal Email automatically

### Issue 3: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5001`

**Solutions:**
```bash
# Windows
netstat -ano | findstr :5001
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5001 | xargs kill -9
```

Or change PORT in backend/.env to 5002

### Issue 4: Firebase Auth Not Working

**Error:** `auth/configuration-not-found`

**Solutions:**
- Enable Google Sign-in in Firebase Console
- Add `localhost` to authorized domains
- Check Firebase credentials in firebase.js
- Verify Firebase project is active

### Issue 5: CORS Errors

**Error:** `Access-Control-Allow-Origin`

**Solutions:**
- Verify backend is running
- Check CORS is enabled in server.js
- Verify API_BASE URL in frontend .env

---

## 📦 Production Deployment

### Backend Deployment (Heroku Example)

```bash
# Install Heroku CLI
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
heroku config:set EMAIL_USER=your_email
heroku config:set EMAIL_PASS=your_password
heroku config:set CLIENT_URL=https://your-frontend-url.com

# Deploy
git push heroku main
```

### Frontend Deployment (Vercel Example)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Set environment variable
vercel env add REACT_APP_API_BASE
# Enter your production API URL
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use environment variables for all sensitive data
- [ ] Enable HTTPS for both frontend and backend
- [ ] Set up proper CORS origins
- [ ] Use production MongoDB cluster
- [ ] Enable rate limiting
- [ ] Add input validation
- [ ] Implement logging
- [ ] Set up monitoring
- [ ] Regular security updates

---

## 📚 Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [React Router Documentation](https://reactrouter.com/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Nodemailer Documentation](https://nodemailer.com/)

---

## 🆘 Getting Help

If you encounter issues:

1. Check this guide thoroughly
2. Review error messages in console
3. Check backend logs
4. Verify all environment variables
5. Open an issue on GitHub
6. Email: vrathod07913@gmail.com

---

## ✨ Next Steps

After successful setup:

1. Customize the UI to match your brand
2. Add more features to dashboards
3. Implement course management
4. Add video upload functionality
5. Create assignment system
6. Build attendance tracking
7. Add analytics and reporting

---

**Happy Coding! 🚀**
