const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const CourseProgress = require('../models/CourseProgress');
const QuizAttempt = require('../models/QuizAttempt');
const TestSubmission = require('../models/TestSubmission');
const Submission = require('../models/Submission');
const Attendance = require('../models/Attendance');
const { auth, facultyOnly } = require('../middleware/auth');

// GET /api/analytics/students — all students with summary stats
router.get('/students', auth, facultyOnly, async (req, res) => {
    try {
        const students = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });

        const summaries = await Promise.all(students.map(async (s) => {
            const [facultyEnrolled, portalEnrolled, quizAttempts, testSubs, codingSubs] = await Promise.all([
                Enrollment.countDocuments({ studentId: s._id }),
                CourseProgress.countDocuments({ studentId: s._id }),
                QuizAttempt.find({ studentId: s._id }),
                TestSubmission.find({ studentId: s._id, resultStatus: { $ne: 'Pending' } }),
                Submission.find({ studentId: s._id }),
            ]);

            const quizAvg = quizAttempts.length > 0
                ? Math.round(quizAttempts.reduce((sum, a) => sum + (a.totalMarks > 0 ? (a.score / a.totalMarks) * 100 : 0), 0) / quizAttempts.length)
                : 0;

            const testAvg = testSubs.length > 0
                ? Math.round(testSubs.reduce((sum, t) => sum + (t.percentage || 0), 0) / testSubs.length)
                : 0;

            const solved = new Set(codingSubs.filter(s => s.status === 'Accepted').map(s => s.problemId?.toString())).size;

            return {
                _id: s._id,
                name: s.name,
                email: s.email,
                profileImage: s.profileImage,
                createdAt: s.createdAt,
                enrolledCourses: facultyEnrolled + portalEnrolled,
                quizzesAttempted: quizAttempts.length,
                testsAttempted: testSubs.length,
                codingSolved: solved,
                quizAvg,
                testAvg,
                avgScore: Math.round((quizAvg + testAvg) / (quizAttempts.length + testSubs.length > 0 ? 2 : 1)),
            };
        }));

        res.json(summaries);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/analytics/overview — dashboard summary cards
router.get('/overview', auth, facultyOnly, async (req, res) => {
    try {
        const [totalStudents, totalQuizAttempts, totalTestSubs, codingSubs] = await Promise.all([
            User.countDocuments({ role: 'student' }),
            QuizAttempt.countDocuments(),
            TestSubmission.countDocuments({ resultStatus: { $ne: 'Pending' } }),
            Submission.find({ status: 'Accepted' }),
        ]);

        const allAttempts = await QuizAttempt.find();
        const avgQuizScore = allAttempts.length > 0
            ? Math.round(allAttempts.reduce((s, a) => s + (a.totalMarks > 0 ? (a.score / a.totalMarks) * 100 : 0), 0) / allAttempts.length)
            : 0;

        const solved = new Set(codingSubs.map(s => s.problemId?.toString())).size;

        res.json({ totalStudents, totalQuizAttempts, totalTestSubs, avgQuizScore, codingSolved: solved });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// GET /api/analytics/student/:id — full student detail
router.get('/student/:id', auth, facultyOnly, async (req, res) => {
    try {
        const student = await User.findById(req.params.id).select('-password');
        if (!student) return res.status(404).json({ msg: 'Student not found' });

        const [
            facultyEnrollments, portalEnrollments,
            quizAttempts, testSubs, codingSubs, attendanceRecords,
        ] = await Promise.all([
            Enrollment.find({ studentId: req.params.id }).populate('courseId', 'title category'),
            CourseProgress.find({ studentId: req.params.id }).populate('courseId', 'title category'),
            QuizAttempt.find({ studentId: req.params.id }).populate('quizId', 'title totalMarks').sort({ submittedAt: -1 }),
            TestSubmission.find({ studentId: req.params.id }).populate('testId', 'title testType duration passingMarks').sort({ submittedAt: -1 }),
            Submission.find({ studentId: req.params.id }).populate('problemId', 'title difficulty marks').sort({ createdAt: -1 }),
            Attendance.find({ 'records.studentId': req.params.id }),
        ]);

        // Attendance stats
        let attendedClasses = 0, totalClasses = attendanceRecords.length;
        attendanceRecords.forEach(rec => {
            const myRecord = rec.records.find(r => r.studentId?.toString() === req.params.id);
            if (myRecord?.status === 'present') attendedClasses++;
        });

        // Coding stats
        const solvedSet = new Set(codingSubs.filter(s => s.status === 'Accepted').map(s => s.problemId?._id?.toString()));
        const byDiff = { Easy: 0, Medium: 0, Hard: 0 };
        codingSubs.forEach(s => { if (s.status === 'Accepted' && s.problemId?.difficulty) byDiff[s.problemId.difficulty]++; });
        const langUsed = {};
        codingSubs.forEach(s => { langUsed[s.language] = (langUsed[s.language] || 0) + 1; });

        // Quiz avg
        const quizAvg = quizAttempts.length > 0
            ? Math.round(quizAttempts.reduce((sum, a) => sum + (a.totalMarks > 0 ? (a.score / a.totalMarks) * 100 : 0), 0) / quizAttempts.length) : 0;

        // Test avg
        const testAvg = testSubs.length > 0
            ? Math.round(testSubs.reduce((sum, t) => sum + (t.percentage || 0), 0) / testSubs.length) : 0;

        res.json({
            student,
            facultyEnrollments,
            portalEnrollments,
            quizAttempts,
            testSubs,
            codingSubs,
            codingStats: { totalSolved: solvedSet.size, totalAttempted: new Set(codingSubs.map(s => s.problemId?._id?.toString())).size, byDiff, langUsed, totalMarks: codingSubs.reduce((s, c) => s + (c.marks || 0), 0) },
            attendance: { attended: attendedClasses, total: totalClasses, percent: totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0 },
            summary: { quizAvg, testAvg, enrolledCourses: facultyEnrollments.length + portalEnrollments.length },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
