const express = require('express');
const router = express.Router();
const LMSNotification = require('../models/LMSNotification');
const { auth } = require('../middleware/auth');

// Get notifications for current user (latest 30)
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await LMSNotification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(30);
        const unreadCount = await LMSNotification.countDocuments({ userId: req.user.id, isRead: false });
        res.json({ notifications, unreadCount });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Mark single notification as read
router.put('/:id/read', auth, async (req, res) => {
    try {
        await LMSNotification.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, { isRead: true });
        res.json({ msg: 'Marked as read' });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Mark all as read
router.put('/read/all', auth, async (req, res) => {
    try {
        await LMSNotification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
        res.json({ msg: 'All marked as read' });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Delete a notification
router.delete('/:id', auth, async (req, res) => {
    try {
        await LMSNotification.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        res.json({ msg: 'Deleted' });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Clear all notifications
router.delete('/clear/all', auth, async (req, res) => {
    try {
        await LMSNotification.deleteMany({ userId: req.user.id });
        res.json({ msg: 'Cleared' });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;
