const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: { type: String, required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questions: [{
        question: String,
        options: [String],
        correctAnswer: Number,
        marks: { type: Number, default: 1 }
    }],
    duration: { type: Number, default: 30 },
    totalMarks: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
