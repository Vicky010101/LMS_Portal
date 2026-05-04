const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const StudentProfile = require('../models/StudentProfile');
const { auth } = require('../middleware/auth');

// Ensure upload dirs exist
const ensureDir = (dir) => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };
ensureDir(path.join(__dirname, '../uploads/profiles'));
ensureDir(path.join(__dirname, '../uploads/resumes'));

const profileStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/profiles')),
    filename: (req, file, cb) => cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`),
});
const resumeStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/resumes')),
    filename: (req, file, cb) => cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`),
});

const uploadProfile = multer({ storage: profileStorage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => { if (file.mimetype.startsWith('image/')) cb(null, true); else cb(new Error('Images only')); } });
const uploadResume = multer({ storage: resumeStorage, limits: { fileSize: 10 * 1024 * 1024 }, fileFilter: (req, file, cb) => { if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) cb(null, true); else cb(new Error('PDF only')); } });

// Get profile
router.get('/', auth, async (req, res) => {
    try {
        let profile = await StudentProfile.findOne({ userId: req.user.id });
        if (!profile) profile = await StudentProfile.create({ userId: req.user.id });
        res.json(profile);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Update profile
router.put('/', auth, async (req, res) => {
    try {
        const allowed = ['fullName', 'gender', 'mobile', 'whatsapp', 'dob', 'parentMobile', 'linkedin', 'github', 'instagram', 'currentState', 'currentCity', 'nativeState', 'nativeCity', 'address', 'bio', 'college', 'degree', 'branch', 'semester', 'cgpa', 'passingYear', 'skills'];
        const update = {};
        allowed.forEach(k => { if (req.body[k] !== undefined) update[k] = req.body[k]; });
        const profile = await StudentProfile.findOneAndUpdate(
            { userId: req.user.id },
            { $set: update },
            { new: true, upsert: true, runValidators: false }
        );
        // Recalculate completion
        await profile.save();
        res.json(profile);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Upload profile image
router.post('/image', auth, uploadProfile.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
        const url = `/uploads/profiles/${req.file.filename}`;
        const profile = await StudentProfile.findOneAndUpdate(
            { userId: req.user.id },
            { profileImage: url },
            { new: true, upsert: true }
        );
        await profile.save();
        res.json({ profileImage: url, profile });
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Upload resume
router.post('/resume', auth, uploadResume.single('resume'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ msg: 'No file uploaded' });
        const url = `/uploads/resumes/${req.file.filename}`;
        const name = req.body.name || `Resume ${Date.now()}`;
        let profile = await StudentProfile.findOne({ userId: req.user.id });
        if (!profile) profile = new StudentProfile({ userId: req.user.id });
        const isFirst = profile.resumes.length === 0;
        profile.resumes.push({ name, url, isDefault: isFirst });
        await profile.save();
        res.json(profile);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Set default resume
router.put('/resume/:resumeId/default', auth, async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({ userId: req.user.id });
        if (!profile) return res.status(404).json({ msg: 'Profile not found' });
        profile.resumes.forEach(r => { r.isDefault = r._id.toString() === req.params.resumeId; });
        await profile.save();
        res.json(profile);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

// Delete resume
router.delete('/resume/:resumeId', auth, async (req, res) => {
    try {
        const profile = await StudentProfile.findOne({ userId: req.user.id });
        if (!profile) return res.status(404).json({ msg: 'Profile not found' });
        const resume = profile.resumes.id(req.params.resumeId);
        if (resume) {
            const filePath = path.join(__dirname, '..', resume.url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            profile.resumes.pull(req.params.resumeId);
            // Set new default if needed
            if (profile.resumes.length > 0 && !profile.resumes.some(r => r.isDefault)) {
                profile.resumes[0].isDefault = true;
            }
        }
        await profile.save();
        res.json(profile);
    } catch (err) { res.status(500).json({ msg: 'Server error' }); }
});

module.exports = router;
