const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// Get profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password -resetPasswordToken -resetPasswordExpire');
        res.json(user);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
    try {
        const allowed = ['name', 'bio', 'skills', 'phone', 'college', 'github', 'linkedin', 'photo'];
        const updates = {};
        allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
        res.json(user);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Save theme preference
router.put('/theme', auth, async (req, res) => {
    try {
        const { theme } = req.body;
        if (!['light', 'dark'].includes(theme)) return res.status(400).json({ msg: 'Invalid theme' });
        await User.findByIdAndUpdate(req.user.id, { themePreference: theme });
        res.json({ theme });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Update notification settings
router.put('/notifications', auth, async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { notificationSettings: req.body },
            { new: true }
        ).select('notificationSettings');
        res.json(user.notificationSettings);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Change password
router.put('/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ msg: 'All fields required' });
        if (newPassword.length < 8) return res.status(400).json({ msg: 'Password must be at least 8 characters' });

        const user = await User.findById(req.user.id);
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Current password is incorrect' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();
        res.json({ msg: 'Password changed successfully' });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Delete account
router.delete('/account', auth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ msg: 'Account deleted' });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;
