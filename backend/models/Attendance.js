const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    records: [{
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['present', 'absent'], default: 'absent' }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
