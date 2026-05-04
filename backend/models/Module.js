const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String },
    videoUrl: { type: String },
    notes: { type: String },
    resources: [{ title: String, url: String }],
    order: { type: Number, default: 0 },
    duration: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Module', moduleSchema);
