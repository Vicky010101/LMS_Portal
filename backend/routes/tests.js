const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const TestSubmission = require('../models/TestSubmission');
const { auth, facultyOnly } = require('../middleware/auth');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// ── SPECIFIC ROUTES FIRST ─────────────────────────────────────────────────────

// Faculty: get own tests
router.get('/faculty/mine', auth, facultyOnly, async (req, res) => {
    try {
        const tests = await Test.find({ facultyId: req.user.id }).sort({ createdAt: -1 });
        res.json(tests);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Student: get available tests
router.get('/student/available', auth, async (req, res) => {
    try {
        const now = new Date();
        const tests = await Test.find({
            isPublished: true,
            endTime: { $gt: now },
            $or: [{ assignedTo: 'all' }, { assignedStudents: req.user.id }],
        }).select('-mcqQuestions.correctAnswer -codingQuestions.testCases').sort({ startTime: 1 });
        res.json(tests);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Student: get completed tests
router.get('/student/completed', auth, async (req, res) => {
    try {
        const subs = await TestSubmission.find({ studentId: req.user.id, resultStatus: { $ne: 'Pending' } })
            .populate('testId', 'title testType duration startTime endTime passingMarks')
            .sort({ submittedAt: -1 });
        res.json(subs);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// ── GENERAL ROUTES ────────────────────────────────────────────────────────────

// Faculty: create test
router.post('/', auth, facultyOnly, async (req, res) => {
    try {
        const test = new Test({ ...req.body, facultyId: req.user.id });
        await test.save();
        // Notify students when test is published
        if (test.isPublished) {
            const { notifyAllStudents } = require('../utils/createNotification');
            const startStr = test.startTime ? new Date(test.startTime).toLocaleString() : 'soon';
            notifyAllStudents({ title: `🧪 New Test: ${test.title}`, message: `A new ${test.testType} test has been scheduled. Starts at ${startStr}. Duration: ${test.duration} min.`, type: 'test', icon: '🧪', redirectTab: 'tests' });
            // Schedule reminders
            scheduleTestReminders(test);
        }
        res.status(201).json(test);
    } catch (err) {
        console.error('Create test error:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Faculty: update test
router.put('/:id', auth, facultyOnly, async (req, res) => {
    try {
        const test = await Test.findOneAndUpdate(
            { _id: req.params.id, facultyId: req.user.id },
            req.body, { new: true }
        );
        if (!test) return res.status(404).json({ msg: 'Not found' });
        res.json(test);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: delete test
router.delete('/:id', auth, facultyOnly, async (req, res) => {
    try {
        await Test.findOneAndDelete({ _id: req.params.id, facultyId: req.user.id });
        res.json({ msg: 'Test deleted' });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Get single test (student view — hides answers)
router.get('/:id', auth, async (req, res) => {
    try {
        const test = await Test.findById(req.params.id).populate('facultyId', 'name');
        if (!test) return res.status(404).json({ msg: 'Test not found' });
        const safe = test.toObject({ virtuals: true });
        safe.mcqQuestions = safe.mcqQuestions.map(q => ({ ...q, correctAnswer: undefined }));
        safe.codingQuestions = safe.codingQuestions.map(q => ({
            ...q,
            testCases: q.testCases.filter(tc => !tc.isHidden),
            hiddenCount: q.testCases.filter(tc => tc.isHidden).length,
        }));
        res.json(safe);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: get test with answers (for review)
router.get('/:id/full', auth, facultyOnly, async (req, res) => {
    try {
        const test = await Test.findOne({ _id: req.params.id, facultyId: req.user.id });
        if (!test) return res.status(404).json({ msg: 'Not found' });
        res.json(test.toObject({ virtuals: true }));
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Start test — create pending submission
router.post('/:id/start', auth, async (req, res) => {
    try {
        const test = await Test.findById(req.params.id);
        if (!test) return res.status(404).json({ msg: 'Test not found' });
        const now = new Date();
        if (now > test.endTime) return res.status(400).json({ msg: 'Test has ended' });

        let sub = await TestSubmission.findOne({ studentId: req.user.id, testId: req.params.id });
        if (sub && sub.resultStatus !== 'Pending') return res.status(400).json({ msg: 'Already submitted' });
        if (!sub) {
            sub = new TestSubmission({ studentId: req.user.id, testId: req.params.id, startedAt: now });
            await sub.save();
        }
        res.json(sub);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Track tab switch
router.post('/:id/tabswitch', auth, async (req, res) => {
    try {
        const sub = await TestSubmission.findOneAndUpdate(
            { studentId: req.user.id, testId: req.params.id, resultStatus: 'Pending' },
            { $inc: { tabSwitchCount: 1, malpracticeWarnings: 1 } },
            { new: true }
        );
        res.json({ tabSwitchCount: sub?.tabSwitchCount || 0, malpracticeWarnings: sub?.malpracticeWarnings || 0 });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Log malpractice event (fullscreen / webcam)
router.post('/:id/malpractice', auth, async (req, res) => {
    try {
        const { type } = req.body;
        const inc = { malpracticeWarnings: 1 };
        if (type === 'fullscreen') inc.fullscreenViolations = 1;
        if (type === 'webcam') inc.webcamViolations = 1;
        const sub = await TestSubmission.findOneAndUpdate(
            { studentId: req.user.id, testId: req.params.id, resultStatus: 'Pending' },
            { $inc: inc },
            { new: true }
        );
        res.json({ malpracticeWarnings: sub?.malpracticeWarnings || 0 });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Submit test
router.post('/:id/submit', auth, async (req, res) => {
    try {
        const { mcqAnswers = [], codingSubmissions = [], isAutoSubmitted = false, submissionReason = 'manual' } = req.body;
        const test = await Test.findById(req.params.id);
        if (!test) return res.status(404).json({ msg: 'Test not found' });

        // Evaluate MCQ
        let mcqScore = 0;
        mcqAnswers.forEach(ans => {
            const q = test.mcqQuestions[ans.questionIndex];
            if (!q) return;
            if (q.correctAnswer === ans.selectedOption) mcqScore += q.marks || 1;
            else if (ans.selectedOption !== null && ans.selectedOption !== undefined) mcqScore -= q.negativeMark || 0;
        });
        mcqScore = Math.max(0, mcqScore);

        // Evaluate Coding via local executor
        let codingScore = 0;
        const evaluatedCoding = await Promise.all(codingSubmissions.map(async (sub, idx) => {
            const q = test.codingQuestions[sub.questionIndex];
            if (!q || !sub.code) return { ...sub, marks: 0, passedTestCases: 0, totalTestCases: 0, status: 'No submission' };
            let passed = 0;
            let status = 'Accepted';
            for (const tc of q.testCases) {
                const result = runLocally(sub.code, sub.language || 'python', tc.input || '');
                if (result.isError) { status = result.status; break; }
                if (result.output.trim() === (tc.expectedOutput || '').trim()) passed++;
                else status = 'Wrong Answer';
            }
            const allPassed = passed === q.testCases.length && !['Compilation Error', 'Runtime Error'].includes(status);
            const marks = allPassed ? q.marks : Math.round((passed / Math.max(q.testCases.length, 1)) * q.marks);
            codingScore += marks;
            return { ...sub, passedTestCases: passed, totalTestCases: q.testCases.length, marks, status: allPassed ? 'Accepted' : status };
        }));

        const totalMarks = test.mcqQuestions.reduce((s, q) => s + (q.marks || 1), 0) +
            test.codingQuestions.reduce((s, q) => s + (q.marks || 10), 0);
        const totalScore = mcqScore + codingScore;
        const percentage = totalMarks > 0 ? Math.round((totalScore / totalMarks) * 100) : 0;
        const resultStatus = totalScore >= (test.passingMarks || 0) ? 'Pass' : 'Fail';

        const submission = await TestSubmission.findOneAndUpdate(
            { studentId: req.user.id, testId: req.params.id },
            {
                mcqAnswers, codingSubmissions: evaluatedCoding,
                mcqScore, codingScore, totalScore, totalMarks, percentage, resultStatus,
                submittedAt: new Date(), isAutoSubmitted, submissionReason,
            },
            { new: true, upsert: true }
        );
        res.json(submission);
    } catch (err) {
        console.error('Submit test error:', err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get submission result
router.get('/:id/result', auth, async (req, res) => {
    try {
        const sub = await TestSubmission.findOne({ studentId: req.user.id, testId: req.params.id })
            .populate('testId');
        if (!sub) return res.status(404).json({ msg: 'No submission found' });
        res.json(sub);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: get all submissions for a test
router.get('/:id/submissions', auth, facultyOnly, async (req, res) => {
    try {
        const subs = await TestSubmission.find({ testId: req.params.id })
            .populate('studentId', 'name email').sort({ submittedAt: -1 });
        res.json(subs);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// ── Local code executor ───────────────────────────────────────────────────────
const LANG_CONFIG = {
    python: { file: 'main.py' }, javascript: { file: 'main.js' },
    java: { file: 'Main.java' }, cpp: { file: 'main.cpp' },
};

function runLocally(code, language, stdin = '') {
    const config = LANG_CONFIG[language];
    if (!config) return { output: 'Unsupported language', isError: true, status: 'Error' };
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-'));
    const filePath = path.join(tmpDir, config.file);
    const stdinFile = path.join(tmpDir, 'stdin.txt');
    try {
        fs.writeFileSync(filePath, code, 'utf8');
        fs.writeFileSync(stdinFile, stdin || '', 'utf8');
        const opts = { timeout: 8000, maxBuffer: 512 * 1024, cwd: tmpDir };
        let stdout = '';
        if (language === 'python') stdout = execSync(`python "${filePath}" < "${stdinFile}"`, opts).toString();
        else if (language === 'javascript') stdout = execSync(`node "${filePath}" < "${stdinFile}"`, opts).toString();
        else if (language === 'java') { execSync(`javac "${filePath}"`, opts); stdout = execSync(`java -cp "${tmpDir}" Main < "${stdinFile}"`, opts).toString(); }
        else if (language === 'cpp') { const out = path.join(tmpDir, 'main.exe'); execSync(`g++ "${filePath}" -o "${out}"`, opts); stdout = execSync(`"${out}" < "${stdinFile}"`, opts).toString(); }
        return { output: stdout.trim(), isError: false, status: 'Success' };
    } catch (err) {
        const msg = (err.stderr?.toString() || err.message || '').trim();
        return { output: msg, isError: true, status: msg.includes('error:') ? 'Compilation Error' : 'Runtime Error' };
    } finally {
        try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch { }
    }
}

// ── Test reminder scheduler ───────────────────────────────────────────────────
function scheduleTestReminders(test) {
    if (!test.startTime) return;
    const { notifyAllStudents } = require('../utils/createNotification');
    const start = new Date(test.startTime).getTime();
    const now = Date.now();
    const reminders = [
        { offset: 60 * 60 * 1000, label: '1 hour' },
        { offset: 30 * 60 * 1000, label: '30 minutes' },
        { offset: 10 * 60 * 1000, label: '10 minutes' },
    ];
    reminders.forEach(({ offset, label }) => {
        const delay = start - offset - now;
        if (delay > 0) {
            setTimeout(() => {
                notifyAllStudents({ title: `⏰ Test Reminder: ${test.title}`, message: `Your test "${test.title}" starts in ${label}! Get ready.`, type: 'reminder', icon: '⏰', redirectTab: 'tests' });
            }, delay);
        }
    });
}

module.exports = router;
