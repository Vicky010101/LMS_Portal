const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Trust proxy (required for Render/Heroku)
app.set('trust proxy', 1);

// CORS — allow deployed frontend + localhost for dev
const allowedOrigins = [
  'http://localhost:3000',
  'https://localhost:3000',
  'http://localhost:3001',
  'https://localhost:3001',
  'https://lms-portal-chi.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not set in environment variables');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ Mongo connection error:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/portal-courses', require('./routes/portalCourses'));
app.use('/api/coding', require('./routes/coding'));
app.use('/api/compiler', require('./routes/compiler'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/tests', require('./routes/tests'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/lms-notifications', require('./routes/notifications'));
app.use('/api/student-profile', require('./routes/studentProfile'));
app.use('/api/live-classes', require('./routes/liveClasses'));

// Health check + route list
app.get('/', (req, res) => res.json({
  status: 'ok',
  message: 'EduLearn LMS API running',
  env: process.env.NODE_ENV || 'development',
  routes: ['/api/auth', '/api/courses', '/api/coding', '/api/quiz', '/api/tests', '/api/live-classes'],
}));

// Debug: log all incoming requests in production to help diagnose routing issues
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} — Origin: ${req.headers.origin || 'none'}`);
  next();
});

// 404 handler — show the path that was not found
app.use((req, res) => {
  console.warn(`404: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ msg: 'Route not found', path: req.originalUrl, method: req.method });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ msg: 'Internal server error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
