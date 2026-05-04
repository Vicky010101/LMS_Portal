const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    enrolledAt: { type: Date, default: Date.now },
    completedModules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
    completionPercent: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false }
}, { timestamps: true });

enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
module.exports = mongoose.model('Enrollment', enrollmentSchema);
