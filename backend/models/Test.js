const mongoose = require('mongoose');

const mcqQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: [String],
    correctAnswer: { type: Number, required: true },
    marks: { type: Number, default: 1 },
    negativeMark: { type: Number, default: 0 },
});

const codingQuestionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    statement: { type: String, required: true },
    constraints: { type: String },
    examples: [{ input: String, output: String, explanation: String }],
    testCases: [{ input: String, expectedOutput: String, isHidden: { type: Boolean, default: false } }],
    starterCode: {
        python: { type: String, default: '# Write your solution\n' },
        javascript: { type: String, default: '// Write your solution\n' },
        java: { type: String, default: 'public class Main {\n    public static void main(String[] args) {\n    }\n}\n' },
        cpp: { type: String, default: '#include<bits/stdc++.h>\nusing namespace std;\nint main(){\n    return 0;\n}\n' },
    },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
    marks: { type: Number, default: 10 },
});

const testSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    instructions: { type: String },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testType: { type: String, enum: ['MCQ', 'Coding', 'Mixed'], default: 'MCQ' },
    category: { type: String, default: 'General' },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    duration: { type: Number, required: true }, // minutes
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    passingMarks: { type: Number, default: 0 },
    assignedTo: { type: String, enum: ['all', 'specific'], default: 'all' },
    assignedStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    mcqQuestions: [mcqQuestionSchema],
    codingQuestions: [codingQuestionSchema],
    isPublished: { type: Boolean, default: false },
}, { timestamps: true });

testSchema.virtual('totalMarks').get(function () {
    const mcq = this.mcqQuestions.reduce((s, q) => s + (q.marks || 1), 0);
    const code = this.codingQuestions.reduce((s, q) => s + (q.marks || 10), 0);
    return mcq + code;
});

module.exports = mongoose.model('Test', testSchema);
