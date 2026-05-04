const express = require('express');
const router = express.Router();
const LiveClass = require('../models/LiveClass');
const LiveClassAttendance = require('../models/LiveClassAttendance');
const { auth, facultyOnly } = require('../middleware/auth');
const { notifyAllStudents } = require('../utils/createNotification');
const { v4: uuidv4 } = require('uuid');

// ── SPECIFIC ROUTES FIRST ─────────────────────────────────────────────────────

// Student: get available classes
router.get('/student/available', auth, async (req, res) => {
    try {
        const now = new Date();
        const classes = await LiveClass.find({
            status: { $in: ['scheduled', 'live'] },
            $or: [{ assignedTo: 'all' }, { assignedStudents: req.user.id }],
        }).sort({ startTime: 1 });
        res.json(classes);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Student: get completed classes
router.get('/student/completed', auth, async (req, res) => {
    try {
        const classes = await LiveClass.find({
            status: 'completed',
            $or: [{ assignedTo: 'all' }, { assignedStudents: req.user.id }],
        }).sort({ startTime: -1 }).limit(20);
        res.json(classes);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: get own classes
router.get('/faculty/mine', auth, facultyOnly, async (req, res) => {
    try {
        const classes = await LiveClass.find({ facultyId: req.user.id }).sort({ startTime: -1 });
        res.json(classes);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// ── GENERAL ROUTES ────────────────────────────────────────────────────────────

// Faculty: create class
router.post('/', auth, facultyOnly, async (req, res) => {
    try {
        // Safe room name: only lowercase letters, numbers, hyphens
        const roomName = `edulearn-live-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const lc = new LiveClass({ ...req.body, facultyId: req.user.id, roomName });
        await lc.save();

        // Notify students
        notifyAllStudents({
            title: `📹 New Live Class: ${lc.title}`,
            message: `${lc.facultyName || 'Faculty'} scheduled a live class on ${new Date(lc.startTime).toLocaleString()}`,
            type: 'announcement', icon: '📹', redirectTab: 'live',
        });

        // Schedule reminders
        scheduleReminders(lc);
        res.status(201).json(lc);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// Faculty: update class
router.put('/:id', auth, facultyOnly, async (req, res) => {
    try {
        const lc = await LiveClass.findOneAndUpdate(
            { _id: req.params.id, facultyId: req.user.id },
            req.body, { new: true }
        );
        if (!lc) return res.status(404).json({ msg: 'Not found' });
        res.json(lc);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: start class (set live)
router.post('/:id/start', auth, facultyOnly, async (req, res) => {
    try {
        const lc = await LiveClass.findOneAndUpdate(
            { _id: req.params.id, facultyId: req.user.id },
            { status: 'live', startTime: new Date() },
            { new: true }
        );
        if (!lc) return res.status(404).json({ msg: 'Not found' });
        notifyAllStudents({
            title: `🔴 LIVE NOW: ${lc.title}`,
            message: `${lc.facultyName || 'Faculty'} has started a live class. Join now!`,
            type: 'announcement', icon: '🔴', redirectTab: 'live',
        });
        res.json(lc);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: end class
router.post('/:id/end', auth, facultyOnly, async (req, res) => {
    try {
        const lc = await LiveClass.findOneAndUpdate(
            { _id: req.params.id, facultyId: req.user.id },
            { status: 'completed' }, { new: true }
        );
        res.json(lc);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: delete class
router.delete('/:id', auth, facultyOnly, async (req, res) => {
    try {
        await LiveClass.findOneAndDelete({ _id: req.params.id, facultyId: req.user.id });
        res.json({ msg: 'Deleted' });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Get single class
router.get('/:id', auth, async (req, res) => {
    try {
        const lc = await LiveClass.findById(req.params.id);
        if (!lc) return res.status(404).json({ msg: 'Not found' });
        res.json(lc);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Student: join class (mark attendance)
router.post('/:id/join', auth, async (req, res) => {
    try {
        const lc = await LiveClass.findById(req.params.id);
        if (!lc) return res.status(404).json({ msg: 'Class not found' });

        // Add to participants
        if (!lc.participants.includes(req.user.id)) {
            lc.participants.push(req.user.id);
            lc.participantCount = lc.participants.length;
            await lc.save();
        }

        // Mark attendance
        await LiveClassAttendance.findOneAndUpdate(
            { classId: req.params.id, studentId: req.user.id },
            { joinedAt: new Date(), attendanceMarked: true },
            { upsert: true, new: true }
        );

        res.json({ roomName: lc.roomName, title: lc.title });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Student: leave class
router.post('/:id/leave', auth, async (req, res) => {
    try {
        const att = await LiveClassAttendance.findOne({ classId: req.params.id, studentId: req.user.id });
        if (att) {
            att.leftAt = new Date();
            att.attendanceDuration = Math.round((att.leftAt - att.joinedAt) / 60000);
            await att.save();
        }
        res.json({ msg: 'Left' });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Faculty: get attendance for a class
router.get('/:id/attendance', auth, facultyOnly, async (req, res) => {
    try {
        const records = await LiveClassAttendance.find({ classId: req.params.id })
            .populate('studentId', 'name email').sort({ joinedAt: 1 });
        res.json(records);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// ── Reminder scheduler ────────────────────────────────────────────────────────
function scheduleReminders(lc) {
    const start = new Date(lc.startTime).getTime();
    const now = Date.now();
    [{ offset: 60 * 60 * 1000, label: '1 hour' }, { offset: 30 * 60 * 1000, label: '30 minutes' }, { offset: 10 * 60 * 1000, label: '10 minutes' }].forEach(({ offset, label }) => {
        const delay = start - offset - now;
        if (delay > 0) {
            setTimeout(() => {
                notifyAllStudents({ title: `⏰ Live Class in ${label}: ${lc.title}`, message: `${lc.facultyName || 'Faculty'}'s live class starts in ${label}. Get ready!`, type: 'reminder', icon: '⏰', redirectTab: 'live' });
            }, delay);
        }
    });
}

module.exports = router;
