const LMSNotification = require('../models/LMSNotification');
const User = require('../models/User');

/**
 * Create notifications for all students (or specific users)
 * @param {Object} opts - { title, message, type, icon, redirectTab, userIds? }
 */
async function notifyAllStudents(opts) {
    try {
        const students = await User.find({ role: 'student' }).select('_id');
        const docs = students.map(s => ({
            userId: s._id,
            title: opts.title,
            message: opts.message,
            type: opts.type || 'announcement',
            icon: opts.icon || '🔔',
            redirectTab: opts.redirectTab || '',
        }));
        if (docs.length > 0) await LMSNotification.insertMany(docs);
    } catch (err) {
        console.error('Notification error:', err.message);
    }
}

async function notifyUser(userId, opts) {
    try {
        await LMSNotification.create({
            userId,
            title: opts.title,
            message: opts.message,
            type: opts.type || 'announcement',
            icon: opts.icon || '🔔',
            redirectTab: opts.redirectTab || '',
        });
    } catch (err) {
        console.error('Notification error:', err.message);
    }
}

module.exports = { notifyAllStudents, notifyUser };
