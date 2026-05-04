const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
    name: { type: String, default: 'Resume' },
    url: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
    isDefault: { type: Boolean, default: false },
});

const studentProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    // Personal
    fullName: String,
    gender: String,
    mobile: String,
    whatsapp: String,
    dob: String,
    parentMobile: String,
    linkedin: String,
    github: String,
    instagram: String,
    currentState: String,
    currentCity: String,
    nativeState: String,
    nativeCity: String,
    address: String,
    bio: String,
    // Academic
    college: String,
    degree: String,
    branch: String,
    semester: String,
    cgpa: String,
    passingYear: String,
    // Skills
    skills: [String],
    // Images
    profileImage: String,
    coverImage: String,
    // Resumes
    resumes: [resumeSchema],
    // Completion
    profileCompletionPercentage: { type: Number, default: 0 },
}, { timestamps: true });

// Auto-calculate completion
studentProfileSchema.pre('save', function (next) {
    const fields = ['fullName', 'gender', 'mobile', 'dob', 'linkedin', 'github', 'currentState', 'currentCity', 'bio', 'college', 'degree', 'branch', 'cgpa', 'passingYear'];
    const filled = fields.filter(f => this[f] && this[f].toString().trim() !== '').length;
    const skillsScore = this.skills?.length > 0 ? 1 : 0;
    const resumeScore = this.resumes?.length > 0 ? 1 : 0;
    const imageScore = this.profileImage ? 1 : 0;
    const total = fields.length + 3;
    this.profileCompletionPercentage = Math.round(((filled + skillsScore + resumeScore + imageScore) / total) * 100);
    next();
});

module.exports = mongoose.model('StudentProfile', studentProfileSchema);
