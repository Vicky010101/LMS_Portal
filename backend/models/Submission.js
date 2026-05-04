const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'CodingProblem', required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    status: { type: String, enum: ['Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded', 'Compilation Error', 'Pending'], default: 'Pending' },
    output: { type: String },
    passedTestCases: { type: Number, default: 0 },
    totalTestCases: { type: Number, default: 0 },
    marks: { type: Number, default: 0 },
    executionTime: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);
