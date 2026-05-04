require('dotenv').config();
const mongoose = require('mongoose');
const PortalCourse = require('./models/PortalCourse');
const PORTAL_COURSES = require('./data/portalCourses');

async function seed() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    await PortalCourse.deleteMany({});
    console.log('Cleared existing portal courses');
    const inserted = await PortalCourse.insertMany(PORTAL_COURSES);
    console.log(`✅ Seeded ${inserted.length} portal courses`);
    inserted.forEach(c => console.log(`  - ${c.title} (${c.modules.length} modules)`));
    await mongoose.disconnect();
    process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
