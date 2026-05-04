const mongoose = require('mongoose');

const liveClassAttendanceSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'LiveClass', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    joinedAt: { type: Date, default: Date.now },
    leftAt: { type: Date },
    attendanceDuration: { type: Number, default: 0 }, // minutes
    attendanceMarked: { type: Boolean, default: true },
}, { timestamps: true });

liveClassAttendanceSchema.index({ classId: 1, studentId: 1 }, { unique: true });
module.exports = mongoose.model('LiveClassAttendance', liveClassAttendanceSchema);
