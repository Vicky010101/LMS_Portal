const mongoose = require('mongoose');

const codingProblemSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
    category: { type: String, default: 'General' },
    examples: [{ input: String, output: String, explanation: String }],
    testCases: [{ input: String, expectedOutput: String, isHidden: { type: Boolean, default: false } }],
    starterCode: {
        python: { type: String, default: '# Write your solution here\n' },
        javascript: { type: String, default: '// Write your solution here\n' },
        java: { type: String, default: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your solution here\n    }\n}' },
        cpp: { type: String, default: '#include<bits/stdc++.h>\nusing namespace std;\nint main() {\n    // Write your solution here\n    return 0;\n}' }
    },
    marks: { type: Number, default: 10 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('CodingProblem', codingProblemSchema);
