const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'faculty'], default: 'student' },
  googleId: { type: String },
  photo: { type: String },
  bio: { type: String, default: '' },
  skills: [{ type: String }],
  phone: { type: String, default: '' },
  college: { type: String, default: '' },
  github: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  themePreference: { type: String, enum: ['light', 'dark'], default: 'light' },
  notificationSettings: {
    emailNotifications: { type: Boolean, default: true },
    quizReminders: { type: Boolean, default: true },
    courseUpdates: { type: Boolean, default: true },
    codingReminders: { type: Boolean, default: false },
  },
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  lastLogin: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
