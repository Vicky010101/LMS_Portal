const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema({
    question: String,
    options: [String],
    correctAnswer: Number,
    explanation: String,
});

const moduleSchema = new mongoose.Schema({
    title: String,
    order: { type: Number, default: 0 },
    theory: String,
    examples: [{ title: String, code: String, output: String, explanation: String }],
    resources: [{ title: String, url: String }],
    quiz: [quizQuestionSchema],
    duration: { type: String, default: '15 min' },
});

const portalCourseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    category: String,
    thumbnail: String,
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    duration: String,
    tags: [String],
    modules: [moduleSchema],
    enrolledCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('PortalCourse', portalCourseSchema);
