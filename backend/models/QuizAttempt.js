const mongoose = require('mongoose');

const quizAttemptSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    answers: [{ questionIndex: Number, selectedOption: Number }],
    score: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    timeTaken: { type: Number },
    submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
