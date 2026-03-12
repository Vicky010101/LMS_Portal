# 🎓 EduLearn LMS - Education Learning Management System

A full-stack Learning Management System built with React, Node.js, Express, and MongoDB. Features include role-based authentication, Google OAuth, password reset, and separate dashboards for Students and Faculty.

![React](https://img.shields.io/badge/React-18.x-blue)
![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)

## ✨ Features

### 🔐 Authentication System
- **Email/Password Authentication** with JWT tokens
- **Google OAuth Integration** using Firebase
- **Role-Based Access Control** (Student & Faculty)
- **Forgot Password** with email reset links
- **Password Reset** with secure token validation
- **Session Management** with localStorage

### 👨‍🎓 Student Dashboard
- View enrolled courses
- Track course progress
- Practice coding problems
- View attendance records
- Access live classes
- Monitor learning analytics

### 👨‍🏫 Faculty Dashboard
- Manage courses
- Upload lecture videos
- Create assignments
- View student submissions
- Track student attendance
- Monitor course analytics
- Manage enrolled students

### 🎨 UI/UX Features
- Modern, responsive design
- Glassmorphism effects
- Smooth animations and transitions
- Password strength indicator
- Loading states
- Error handling
- Success notifications
- Mobile-friendly interface

## 🚀 Tech Stack

### Frontend
- **React** 18.x (Functional Components + Hooks)
- **React Router** 6.x (Client-side routing)
- **Firebase** (Google Authentication)
- **CSS3** (Custom styling with animations)

### Backend
- **Node.js** 18.x
- **Express.js** 4.x
- **MongoDB** (Atlas)
- **Mongoose** (ODM)
- **JWT** (Authentication)
- **Bcrypt** (Password hashing)
- **Nodemailer** (Email service)
- **Crypto** (Token generation)

## 📁 Project Structure

```
React_Auth_Structure/
├── backend/
│   ├── models/
│   │   └── User.js                 # User schema with roles
│   ├── routes/
│   │   └── auth.js                 # Authentication routes
│   ├── utils/
│   │   └── sendEmail.js            # Email utility
│   ├── .env                        # Environment variables
│   ├── server.js                   # Express server
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── auth/
│   │   │   └── googleAuth.js       # Google OAuth logic
│   │   ├── components/
│   │   │   ├── AuthCard.js         # Auth container
│   │   │   ├── Button.js           # Reusable button
│   │   │   ├── InputField.js       # Text input
│   │   │   ├── PasswordInput.js    # Password with strength
│   │   │   ├── ProtectedRoute.js   # Route protection
│   │   │   ├── RoleSelector.js     # Role selection
│   │   │   └── SocialLogin.js      # Social auth buttons
│   │   ├── pages/
│   │   │   ├── Login.js            # Login page
│   │   │   ├── Signup.js           # Signup with roles
│   │   │   ├── ForgotPassword.js   # Forgot password
│   │   │   ├── ResetPassword.js    # Reset password
│   │   │   ├── StudentDashboard.js # Student dashboard
│   │   │   └── FacultyDashboard.js # Faculty dashboard
│   │   ├── styles/
│   │   │   ├── auth.css            # Auth page styles
│   │   │   └── dashboard.css       # Dashboard styles
│   │   ├── App.js                  # Main app with routing
│   │   ├── api.js                  # API calls
│   │   ├── firebase.js             # Firebase config
│   │   └── index.js                # Entry point
│   ├── .env                        # Environment variables
│   └── package.json
│
├── README.md                       # This file
└── Documentation/                  # Detailed guides
    ├── SETUP.md
    ├── FIREBASE_GOOGLE_AUTH_GUIDE.md
    ├── ROLE_BASED_AUTH_GUIDE.md
    └── PASSWORD_RESET_GUIDE.md
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18.x or higher
- MongoDB Atlas account (or local MongoDB)
- Gmail account (for email service)
- Firebase project (for Google OAuth)

### 1. Clone Repository

```bash
git clone https://github.com/Vicky010101/React_Auth_Structure.git
cd React_Auth_Structure
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend directory:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5001
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:3000
```

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Enable 2-Step Verification
3. Generate app password for "Mail"
4. Copy the 16-character password

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in frontend directory:

```env
REACT_APP_API_BASE=http://localhost:5001/api
```

### 4. Firebase Setup (for Google OAuth)

1. Go to https://console.firebase.google.com/
2. Create a new project
3. Enable Authentication → Google Sign-in
4. Get your Firebase config
5. Update `frontend/src/firebase.js` with your credentials

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Application will open at http://localhost:3000

## 🎯 Usage

### Create Account
1. Go to http://localhost:3000/signup
2. Fill in your details
3. **Select Role:** Student or Faculty
4. Submit to create account

### Login
1. Go to http://localhost:3000/login
2. Enter email and password
3. Or use "Continue with Google"
4. Redirected to appropriate dashboard based on role

### Forgot Password
1. Click "Forgot Password?" on login page
2. Enter your email
3. Check email for reset link
4. Click link and enter new password
5. Login with new password

### Role-Based Access
- **Students** → `/student-dashboard`
- **Faculty** → `/faculty-dashboard`
- Cross-role access automatically redirected

## 🔐 Security Features

- **JWT Authentication** with 7-day expiration
- **Bcrypt Password Hashing** (10 salt rounds)
- **Secure Token Generation** (32-byte crypto)
- **SHA-256 Token Hashing** for reset tokens
- **15-Minute Token Expiration** for password reset
- **Protected Routes** with role verification
- **CORS Enabled** for cross-origin requests
- **Environment Variables** for sensitive data

## 📧 Email Configuration

The system uses Nodemailer with Gmail SMTP:

**For Testing (No Gmail needed):**
- Automatically uses Ethereal Email
- View emails in browser via preview URL
- Check backend console for preview links

**For Production:**
- Configure Gmail credentials in `.env`
- System automatically switches to Gmail
- Real emails sent to users

## 🎨 UI Components

### Reusable Components
- **AuthCard** - Authentication container with branding
- **InputField** - Text input with floating labels
- **PasswordInput** - Password field with show/hide toggle
- **RoleSelector** - Visual role selection cards
- **Button** - Styled button with loading states
- **SocialLogin** - Google/GitHub login buttons
- **ProtectedRoute** - Route protection wrapper

### Styling Features
- Modern gradient backgrounds
- Glassmorphism effects
- Smooth animations
- Responsive design
- Loading spinners
- Success animations
- Error messages
- Hover effects

## 🧪 Testing

### Test Student Flow
```bash
1. Signup as Student
2. Login with credentials
3. Access student dashboard
4. Try accessing faculty dashboard (should redirect)
```

### Test Faculty Flow
```bash
1. Signup as Faculty
2. Login with credentials
3. Access faculty dashboard
4. Try accessing student dashboard (should redirect)
```

### Test Password Reset
```bash
1. Click "Forgot Password?"
2. Enter email
3. Check email/console for reset link
4. Reset password
5. Login with new password
```

### Test Google OAuth
```bash
1. Click "Continue with Google"
2. Select Google account
3. Verify login and dashboard access
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password

### Request/Response Examples

**Register:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "student"
}

Response:
{
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  }
}
```

## 🐛 Troubleshooting

### Email Not Sending
- Check Gmail app password is correct
- Verify 2-Step Verification is enabled
- Check backend console for errors
- Try using Ethereal Email for testing

### Google OAuth Not Working
- Enable Google Sign-in in Firebase Console
- Add `localhost` to authorized domains
- Check Firebase credentials in `firebase.js`

### MongoDB Connection Failed
- Verify connection string is correct
- Check network access in MongoDB Atlas
- Ensure IP address is whitelisted

### Port Already in Use
- Change PORT in backend `.env`
- Update REACT_APP_API_BASE in frontend `.env`

## 📖 Documentation

Detailed guides available in the repository:

- **SETUP.md** - Complete setup instructions
- **FIREBASE_GOOGLE_AUTH_GUIDE.md** - Google OAuth setup
- **ROLE_BASED_AUTH_GUIDE.md** - Role system documentation
- **PASSWORD_RESET_GUIDE.md** - Password reset implementation
- **EMAIL_SETUP_INSTRUCTIONS.md** - Email configuration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

**Vicky Rathod**
- GitHub: [@Vicky010101](https://github.com/Vicky010101)
- Email: vrathod07913@gmail.com

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the database
- Firebase for authentication services
- Nodemailer for email functionality

## 📞 Support

For support, email vrathod07913@gmail.com or open an issue in the repository.

---

**Made with ❤️ for Education**
