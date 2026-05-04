const mongoose = require('mongoose');

const courseProgressSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'PortalCourse', required: true },
    completedModules: [{ type: mongoose.Schema.Types.ObjectId }],
    progressPercent: { type: Number, default: 0 },
    quizScores: [{
        moduleId: mongoose.Schema.Types.ObjectId,
        score: Number,
        total: Number,
        completedAt: { type: Date, default: Date.now },
    }],
    lastModuleId: { type: mongoose.Schema.Types.ObjectId },
    isCompleted: { type: Boolean, default: false },
    enrolledAt: { type: Date, default: Date.now },
}, { timestamps: true });

courseProgressSchema.index({ studentId: 1, courseId: 1 }, { unique: true });
module.exports = mongoose.model('CourseProgress', courseProgressSchema);
