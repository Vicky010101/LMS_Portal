const express = require('express');
const router = express.Router();
const PortalCourse = require('../models/PortalCourse');
const CourseProgress = require('../models/CourseProgress');
const { auth } = require('../middleware/auth');

// ── SPECIFIC ROUTES FIRST (before /:id) ──────────────────────────────────────

// Get all enrolled portal courses for student
router.get('/student/enrolled', auth, async (req, res) => {
    try {
        const progresses = await CourseProgress.find({ studentId: req.user.id })
            .populate('courseId', 'title description category thumbnail difficulty duration modules enrolledCount')
            .sort({ updatedAt: -1 });
        res.json(progresses);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// ── GENERAL ROUTES ────────────────────────────────────────────────────────────

// Get all portal courses (public)
router.get('/', async (req, res) => {
    try {
        const courses = await PortalCourse.find({ isActive: true })
            .select('-modules.quiz.correctAnswer -modules.theory -modules.examples')
            .sort({ createdAt: 1 });
        res.json(courses);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Get single course with full content
router.get('/:id', auth, async (req, res) => {
    try {
        const course = await PortalCourse.findById(req.params.id);
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        const safe = course.toObject();
        safe.modules = safe.modules.map(m => ({
            ...m,
            quiz: m.quiz.map(q => ({ ...q, correctAnswer: undefined })),
        }));
        res.json(safe);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Enroll in portal course
router.post('/:id/enroll', auth, async (req, res) => {
    try {
        const existing = await CourseProgress.findOne({ studentId: req.user.id, courseId: req.params.id });
        if (existing) return res.json(existing);
        const progress = new CourseProgress({ studentId: req.user.id, courseId: req.params.id });
        await progress.save();
        await PortalCourse.findByIdAndUpdate(req.params.id, { $inc: { enrolledCount: 1 } });
        res.status(201).json(progress);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Get student's progress for a course
router.get('/:id/progress', auth, async (req, res) => {
    try {
        const progress = await CourseProgress.findOne({ studentId: req.user.id, courseId: req.params.id });
        res.json(progress || null);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Mark module as complete
router.post('/:courseId/modules/:moduleId/complete', auth, async (req, res) => {
    try {
        const course = await PortalCourse.findById(req.params.courseId);
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        let progress = await CourseProgress.findOne({ studentId: req.user.id, courseId: req.params.courseId });
        if (!progress) progress = new CourseProgress({ studentId: req.user.id, courseId: req.params.courseId });
        const modId = req.params.moduleId;
        if (!progress.completedModules.map(m => m.toString()).includes(modId)) {
            progress.completedModules.push(modId);
        }
        progress.lastModuleId = modId;
        progress.progressPercent = Math.round((progress.completedModules.length / course.modules.length) * 100);
        progress.isCompleted = progress.progressPercent === 100;
        await progress.save();
        res.json(progress);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Submit module quiz
router.post('/:courseId/modules/:moduleId/quiz', auth, async (req, res) => {
    try {
        const { answers } = req.body;
        const course = await PortalCourse.findById(req.params.courseId);
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        const mod = course.modules.id(req.params.moduleId);
        if (!mod) return res.status(404).json({ msg: 'Module not found' });
        let score = 0;
        const results = answers.map((ans, i) => {
            const q = mod.quiz[i];
            const correct = q && q.correctAnswer === ans;
            if (correct) score++;
            return { correct, correctAnswer: q?.correctAnswer, explanation: q?.explanation };
        });
        let progress = await CourseProgress.findOne({ studentId: req.user.id, courseId: req.params.courseId });
        if (!progress) progress = new CourseProgress({ studentId: req.user.id, courseId: req.params.courseId });
        const idx = progress.quizScores.findIndex(s => s.moduleId?.toString() === req.params.moduleId);
        const entry = { moduleId: req.params.moduleId, score, total: mod.quiz.length };
        if (idx >= 0) progress.quizScores[idx] = entry;
        else progress.quizScores.push(entry);
        await progress.save();
        res.json({ score, total: mod.quiz.length, results });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;
