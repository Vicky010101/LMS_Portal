const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

const JWT_SECRET = process.env.JWT_SECRET || "change_this_secret";
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

const authMiddleware = (req, res, next) => {
  const token = req.header("x-auth-token") || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token invalid" });
  }
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: "Missing fields" });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "User already exists" });
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: hash, role: role || "student" });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Missing fields" });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });
    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Please provide an email address" });
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "No account found with that email address" });
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
    await user.save();
    const resetUrl = CLIENT_URL + "/reset-password/" + resetToken;
    const message = "<div style='font-family:Arial,sans-serif;max-width:600px;margin:0 auto'><h2 style='color:#4F46E5'>Reset Your Password</h2><p>Hello " + user.name + ",</p><p>Click the button below to reset your password:</p><div style='text-align:center;margin:30px 0'><a href='" + resetUrl + "' style='background-color:#4F46E5;color:white;padding:12px 30px;text-decoration:none;border-radius:8px;display:inline-block'>Reset Password</a></div><p>Or copy and paste this link:</p><p style='color:#4F46E5;word-break:break-all'>" + resetUrl + "</p><p><strong>This link will expire in 15 minutes.</strong></p></div>";
    try {
      await sendEmail({ email: user.email, subject: "Reset Your LMS Password", message });
      res.json({ success: true, msg: "Password reset link has been sent to your email" });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ msg: "Email could not be sent. Please try again later." });
    }
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.put("/reset-password/:token", async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) return res.status(400).json({ msg: "Please provide a new password" });
    if (password.length < 8) return res.status(400).json({ msg: "Password must be at least 8 characters long" });
    const hashedToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user = await User.findOne({ resetPasswordToken: hashedToken, resetPasswordExpire: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ msg: "Invalid or expired reset token. Please request a new password reset." });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    res.json({ success: true, msg: "Password has been reset successfully. You can now login with your new password." });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
