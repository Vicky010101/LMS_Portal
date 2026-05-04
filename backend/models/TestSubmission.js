const mongoose = require('mongoose');

const testSubmissionSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    mcqAnswers: [{ questionIndex: Number, selectedOption: Number }],
    codingSubmissions: [{
        questionIndex: Number, code: String, language: String, output: String,
        passedTestCases: { type: Number, default: 0 }, totalTestCases: { type: Number, default: 0 },
        marks: { type: Number, default: 0 }, status: { type: String, default: 'Pending' },
    }],
    mcqScore: { type: Number, default: 0 },
    codingScore: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    resultStatus: { type: String, enum: ['Pass', 'Fail', 'Pending'], default: 'Pending' },
    tabSwitchCount: { type: Number, default: 0 },
    fullscreenViolations: { type: Number, default: 0 },
    webcamViolations: { type: Number, default: 0 },
    malpracticeWarnings: { type: Number, default: 0 },
    submissionReason: { type: String, default: 'manual' }, // manual | auto-timer | tab-switch | fullscreen | webcam | exited
    startedAt: { type: Date },
    submittedAt: { type: Date },
    isAutoSubmitted: { type: Boolean, default: false },
}, { timestamps: true });

testSubmissionSchema.index({ studentId: 1, testId: 1 }, { unique: true });
module.exports = mongoose.model('TestSubmission', testSubmissionSchema);
