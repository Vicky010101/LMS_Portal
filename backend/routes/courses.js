const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Module = require('../models/Module');
const Enrollment = require('../models/Enrollment');
const { auth, facultyOnly } = require('../middleware/auth');

// Get all published courses
router.get('/', async (req, res) => {
    try {
        const { category, search } = req.query;
        const query = { isPublished: true };
        if (category) query.category = category;
        if (search) query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
        const courses = await Course.find(query).populate('facultyId', 'name').sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Get single course with modules
router.get('/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('facultyId', 'name email');
        if (!course) return res.status(404).json({ msg: 'Course not found' });
        const modules = await Module.find({ courseId: req.params.id }).sort({ order: 1 });
        res.json({ course, modules });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

const { notifyAllStudents } = require('../utils/createNotification');

// Faculty: create course
router.post('/', auth, facultyOnly, async (req, res) => {
    try {
        const course = new Course({ ...req.body, facultyId: req.user.id });
        await course.save();
        // Notify all students
        if (course.isPublished) {
            notifyAllStudents({ title: `📚 New Course: ${course.title}`, message: `A new ${course.category} course has been added. Enroll now!`, type: 'course', icon: '📚', redirectTab: 'courses' });
        }
        res.status(201).json(course);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: update course
router.put('/:id', auth, facultyOnly, async (req, res) => {
    try {
        const course = await Course.findOneAndUpdate(
            { _id: req.params.id, facultyId: req.user.id },
            req.body, { new: true }
        );
        if (!course) return res.status(404).json({ msg: 'Not found or unauthorized' });
        res.json(course);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: delete course
router.delete('/:id', auth, facultyOnly, async (req, res) => {
    try {
        await Course.findOneAndDelete({ _id: req.params.id, facultyId: req.user.id });
        await Module.deleteMany({ courseId: req.params.id });
        res.json({ msg: 'Course deleted' });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: get own courses
router.get('/faculty/mycourses', auth, facultyOnly, async (req, res) => {
    try {
        const courses = await Course.find({ facultyId: req.user.id }).sort({ createdAt: -1 });
        res.json(courses);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Add module to course
router.post('/:id/modules', auth, facultyOnly, async (req, res) => {
    try {
        const course = await Course.findOne({ _id: req.params.id, facultyId: req.user.id });
        if (!course) return res.status(403).json({ msg: 'Unauthorized' });
        const module = new Module({ ...req.body, courseId: req.params.id });
        await module.save();
        res.status(201).json(module);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Enroll in course
router.post('/:id/enroll', auth, async (req, res) => {
    try {
        const existing = await Enrollment.findOne({ studentId: req.user.id, courseId: req.params.id });
        if (existing) return res.status(400).json({ msg: 'Already enrolled' });
        const enrollment = new Enrollment({ studentId: req.user.id, courseId: req.params.id });
        await enrollment.save();
        await Course.findByIdAndUpdate(req.params.id, { $inc: { enrolledCount: 1 } });
        res.status(201).json(enrollment);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Get student enrollments
router.get('/student/enrolled', auth, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ studentId: req.user.id })
            .populate('courseId').sort({ enrolledAt: -1 });
        res.json(enrollments);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Mark module complete
router.post('/:courseId/modules/:moduleId/complete', auth, async (req, res) => {
    try {
        const enrollment = await Enrollment.findOne({ studentId: req.user.id, courseId: req.params.courseId });
        if (!enrollment) return res.status(404).json({ msg: 'Not enrolled' });
        if (!enrollment.completedModules.includes(req.params.moduleId)) {
            enrollment.completedModules.push(req.params.moduleId);
        }
        const totalModules = await Module.countDocuments({ courseId: req.params.courseId });
        enrollment.completionPercent = totalModules > 0
            ? Math.round((enrollment.completedModules.length / totalModules) * 100) : 0;
        enrollment.isCompleted = enrollment.completionPercent === 100;
        await enrollment.save();
        res.json(enrollment);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;
