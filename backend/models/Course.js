const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, enum: ['Java', 'Python', 'MERN Stack', 'DSA', 'Aptitude', 'Communication Skills', 'Resume Building', 'Other'], required: true },
    thumbnail: { type: String, default: '' },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    duration: { type: String },
    isPublished: { type: Boolean, default: false },
    enrolledCount: { type: Number, default: 0 },
    tags: [String]
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);
