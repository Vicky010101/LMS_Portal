const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const { auth, facultyOnly } = require('../middleware/auth');

// IMPORTANT: specific routes must come before /:id

// Get student quiz history (must be before /:id)
router.get('/attempts/my', auth, async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({ studentId: req.user.id })
            .populate('quizId', 'title totalMarks').sort({ submittedAt: -1 });
        res.json(attempts);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: get own quizzes (must be before /:id)
router.get('/my', auth, facultyOnly, async (req, res) => {
    try {
        const quizzes = await Quiz.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
        res.json(quizzes);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Get all published quizzes (for students)
router.get('/', auth, async (req, res) => {
    try {
        const quizzes = await Quiz.find({ isPublished: true })
            .populate('createdBy', 'name')
            .select('-questions.correctAnswer');
        res.json(quizzes);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

const { notifyAllStudents } = require('../utils/createNotification');

// Faculty: create quiz
router.post('/', auth, facultyOnly, async (req, res) => {
    try {
        const totalMarks = (req.body.questions || []).reduce((sum, q) => sum + (q.marks || 1), 0);
        const quiz = new Quiz({ ...req.body, createdBy: req.user.id, totalMarks });
        await quiz.save();
        if (quiz.isPublished) {
            notifyAllStudents({ title: `📝 New Quiz: ${quiz.title}`, message: `A new quiz with ${quiz.questions?.length || 0} questions has been added. Test your knowledge!`, type: 'quiz', icon: '📝', redirectTab: 'quiz' });
        }
        res.status(201).json(quiz);
    } catch (err) {
        console.error('Create quiz error:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Faculty: update quiz
router.put('/:id', auth, facultyOnly, async (req, res) => {
    try {
        const totalMarks = (req.body.questions || []).reduce((sum, q) => sum + (q.marks || 1), 0);
        const quiz = await Quiz.findOneAndUpdate(
            { _id: req.params.id, createdBy: req.user.id },
            { ...req.body, totalMarks },
            { new: true }
        );
        if (!quiz) return res.status(404).json({ msg: 'Not found or unauthorized' });
        res.json(quiz);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: delete quiz
router.delete('/:id', auth, facultyOnly, async (req, res) => {
    try {
        await Quiz.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });
        res.json({ msg: 'Quiz deleted' });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Get quiz for attempt (hides correct answers)
router.get('/:id', auth, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name');
        if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });
        const safe = quiz.toObject();
        safe.questions = safe.questions.map(q => ({ ...q, correctAnswer: undefined }));
        res.json(safe);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Submit quiz attempt
router.post('/:id/submit', auth, async (req, res) => {
    try {
        const { answers, timeTaken } = req.body;
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ msg: 'Quiz not found' });

        let score = 0;
        answers.forEach(ans => {
            const q = quiz.questions[ans.questionIndex];
            if (q && q.correctAnswer === ans.selectedOption) score += q.marks || 1;
        });

        const attempt = new QuizAttempt({
            studentId: req.user.id,
            quizId: req.params.id,
            answers, score,
            totalMarks: quiz.totalMarks,
            timeTaken
        });
        await attempt.save();
        res.json({ score, totalMarks: quiz.totalMarks, attemptId: attempt._id });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: get attempts for a quiz
router.get('/:id/attempts', auth, facultyOnly, async (req, res) => {
    try {
        const attempts = await QuizAttempt.find({ quizId: req.params.id })
            .populate('studentId', 'name email').sort({ submittedAt: -1 });
        res.json(attempts);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;
