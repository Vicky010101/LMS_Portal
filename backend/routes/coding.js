const express = require('express');
const router = express.Router();
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const CodingProblem = require('../models/CodingProblem');
const Submission = require('../models/Submission');
const { auth, facultyOnly } = require('../middleware/auth');

const LANG_CONFIG = {
    python: { ext: 'py', file: 'main.py' },
    javascript: { ext: 'js', file: 'main.js' },
    java: { ext: 'java', file: 'Main.java' },
    cpp: { ext: 'cpp', file: 'main.cpp' },
};

function runLocally(code, language, stdin = '') {
    const config = LANG_CONFIG[language];
    if (!config) throw new Error(`Unsupported language: ${language}`);

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lms-'));
    const filePath = path.join(tmpDir, config.file);
    const stdinFile = path.join(tmpDir, 'stdin.txt');

    try {
        fs.writeFileSync(filePath, code, 'utf8');
        fs.writeFileSync(stdinFile, stdin || '', 'utf8');
        const opts = { timeout: 8000, maxBuffer: 512 * 1024, cwd: tmpDir };
        let stdout = '';

        if (language === 'python') {
            stdout = execSync(`python "${filePath}" < "${stdinFile}"`, opts).toString();
        } else if (language === 'javascript') {
            stdout = execSync(`node "${filePath}" < "${stdinFile}"`, opts).toString();
        } else if (language === 'java') {
            execSync(`javac "${filePath}"`, opts);
            stdout = execSync(`java -cp "${tmpDir}" Main < "${stdinFile}"`, opts).toString();
        } else if (language === 'cpp') {
            const outFile = path.join(tmpDir, 'main.exe');
            execSync(`g++ "${filePath}" -o "${outFile}"`, opts);
            stdout = execSync(`"${outFile}" < "${stdinFile}"`, opts).toString();
        }

        return { output: stdout.trim(), status: 'Success', isError: false };
    } catch (err) {
        const msg = (err.stderr?.toString() || err.stdout?.toString() || err.message || '').trim();
        const isCompile = msg.includes('error:') || msg.includes('SyntaxError') || msg.includes('javac');
        return { output: msg, status: isCompile ? 'Compilation Error' : 'Runtime Error', isError: true };
    } finally {
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { }
    }
}

// Get all problems
router.get('/problems', async (req, res) => {
    try {
        const { difficulty, category } = req.query;
        const query = {};
        if (difficulty) query.difficulty = difficulty;
        if (category) query.category = category;
        const problems = await CodingProblem.find(query).select('-testCases').sort({ createdAt: -1 });
        res.json(problems);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Get single problem
router.get('/problems/:id', async (req, res) => {
    try {
        const problem = await CodingProblem.findById(req.params.id);
        if (!problem) return res.status(404).json({ msg: 'Problem not found' });
        const safeProb = problem.toObject();
        safeProb.testCases = safeProb.testCases.filter(tc => !tc.isHidden);
        res.json(safeProb);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: create problem
router.post('/problems', auth, facultyOnly, async (req, res) => {
    try {
        const problem = new CodingProblem({ ...req.body, createdBy: req.user.id });
        await problem.save();
        const { notifyAllStudents } = require('../utils/createNotification');
        notifyAllStudents({ title: `💻 New Problem: ${problem.title}`, message: `A new ${problem.difficulty} coding problem has been added. Try to solve it!`, type: 'coding', icon: '💻', redirectTab: 'coding' });
        res.status(201).json(problem);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: delete problem
router.delete('/problems/:id', auth, facultyOnly, async (req, res) => {
    try {
        await CodingProblem.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Problem deleted' });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Run code (uses local executor)
router.post('/run', auth, async (req, res) => {
    try {
        const { code, language, stdin = '' } = req.body;
        const result = runLocally(code, language, stdin);
        res.json(result);
    } catch (err) {
        res.status(500).json({ output: err.message, status: 'Error', isError: true });
    }
});

// Submit solution — run against all test cases locally
router.post('/submit/:problemId', auth, async (req, res) => {
    try {
        const { code, language } = req.body;
        const problem = await CodingProblem.findById(req.params.problemId);
        if (!problem) return res.status(404).json({ msg: 'Problem not found' });

        let passedTestCases = 0;
        let status = 'Accepted';
        let lastOutput = '';

        if (problem.testCases.length === 0) {
            // No test cases defined — auto-accept
            status = 'Accepted';
            passedTestCases = 0;
        } else {
            for (const tc of problem.testCases) {
                const result = runLocally(code, language, tc.input || '');
                const actual = result.output.trim();
                lastOutput = actual;

                if (result.isError) {
                    status = result.status; // Compilation Error or Runtime Error
                    break;
                }
                if (actual === (tc.expectedOutput || '').trim()) {
                    passedTestCases++;
                } else {
                    status = 'Wrong Answer';
                }
            }

            // Only Accepted if ALL test cases passed
            if (passedTestCases === problem.testCases.length && status !== 'Compilation Error' && status !== 'Runtime Error') {
                status = 'Accepted';
            }
        }

        const submission = new Submission({
            studentId: req.user.id,
            problemId: req.params.problemId,
            code, language, status,
            output: lastOutput,
            passedTestCases,
            totalTestCases: problem.testCases.length,
            marks: status === 'Accepted' ? problem.marks : 0,
        });
        await submission.save();
        res.json(submission);
    } catch (err) {
        console.error('Submit error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});
// Get student submissions
router.get('/submissions/my', auth, async (req, res) => {
    try {
        const submissions = await Submission.find({ studentId: req.user.id })
            .populate('problemId', 'title difficulty marks')
            .sort({ createdAt: -1 });
        res.json(submissions);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Get last submission for a specific problem (for code restore)
router.get('/submissions/problem/:problemId', auth, async (req, res) => {
    try {
        const submission = await Submission.findOne({
            studentId: req.user.id,
            problemId: req.params.problemId,
        }).sort({ createdAt: -1 });
        res.json(submission || null);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Get student coding stats
router.get('/stats/my', auth, async (req, res) => {
    try {
        const submissions = await Submission.find({ studentId: req.user.id })
            .populate('problemId', 'difficulty');
        const solved = new Set(
            submissions.filter(s => s.status === 'Accepted').map(s => s.problemId?._id?.toString())
        );
        const byDifficulty = { Easy: 0, Medium: 0, Hard: 0 };
        for (const s of submissions) {
            if (s.status === 'Accepted' && s.problemId?.difficulty) {
                byDifficulty[s.problemId.difficulty] = (byDifficulty[s.problemId.difficulty] || 0) + 1;
            }
        }
        res.json({
            totalSolved: solved.size,
            totalAttempted: new Set(submissions.map(s => s.problemId?._id?.toString())).size,
            totalSubmissions: submissions.length,
            byDifficulty,
            totalMarks: submissions.reduce((sum, s) => sum + (s.marks || 0), 0),
        });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;
