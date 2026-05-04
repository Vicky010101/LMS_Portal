const mongoose = require('mongoose');

const lmsNotificationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['course', 'quiz', 'coding', 'test', 'reminder', 'announcement', 'result', 'enrollment'], default: 'announcement' },
    isRead: { type: Boolean, default: false },
    redirectTab: { type: String, default: '' }, // tab to open in dashboard
    icon: { type: String, default: '🔔' },
}, { timestamps: true });

lmsNotificationSchema.index({ userId: 1, createdAt: -1 });
module.exports = mongoose.model('LMSNotification', lmsNotificationSchema);
