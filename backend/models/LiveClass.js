const mongoose = require('mongoose');

const liveClassSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    facultyName: { type: String },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    courseName: { type: String },
    roomName: { type: String, required: true, unique: true },
    startTime: { type: Date, required: true },
    duration: { type: Number, default: 60 }, // minutes
    status: { type: String, enum: ['scheduled', 'live', 'completed', 'cancelled'], default: 'scheduled' },
    thumbnail: { type: String, default: '' },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    participantCount: { type: Number, default: 0 },
    assignedTo: { type: String, enum: ['all', 'specific'], default: 'all' },
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

module.exports = mongoose.model('LiveClass', liveClassSchema);
