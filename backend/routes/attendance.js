const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const { auth, facultyOnly } = require('../middleware/auth');

// Faculty: mark attendance
router.post('/', auth, facultyOnly, async (req, res) => {
    try {
        const { courseId, date, records } = req.body;
        const attendance = new Attendance({ courseId, facultyId: req.user.id, date, records });
        await attendance.save();
        res.status(201).json(attendance);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: get attendance for a course
router.get('/course/:courseId', auth, facultyOnly, async (req, res) => {
    try {
        const records = await Attendance.find({ courseId: req.params.courseId })
            .populate('records.studentId', 'name email').sort({ date: -1 });
        res.json(records);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Student: get own attendance
router.get('/my', auth, async (req, res) => {
    try {
        const enrollments = await Enrollment.find({ studentId: req.user.id });
        const courseIds = enrollments.map(e => e.courseId);
        const records = await Attendance.find({ courseId: { $in: courseIds } });
        const stats = {};
        for (const rec of records) {
            const cid = rec.courseId.toString();
            if (!stats[cid]) stats[cid] = { present: 0, total: 0 };
            stats[cid].total++;
            const myRecord = rec.records.find(r => r.studentId?.toString() === req.user.id);
            if (myRecord?.status === 'present') stats[cid].present++;
        }
        res.json(stats);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;
