const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';

const auth = (req, res, next) => {
    const token = req.header('x-auth-token') || req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ msg: 'No token' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ msg: 'Token invalid' });
    }
};

const facultyOnly = (req, res, next) => {
    if (req.user.role !== 'faculty') return res.status(403).json({ msg: 'Faculty only' });
    next();
};

const studentOnly = (req, res, next) => {
    if (req.user.role !== 'student') return res.status(403).json({ msg: 'Students only' });
    next();
};

module.exports = { auth, facultyOnly, studentOnly };
