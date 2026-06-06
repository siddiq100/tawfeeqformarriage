import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const argv = process.argv.slice(2);
const args = {};
argv.forEach(a => {
  const [k, v] = a.split('=');
  if (k && v) args[k.replace(/^--/, '')] = v;
});

const email = args.email || process.env.ADMIN_EMAIL || 'siddiqa@tawfeeq.com';
const password = args.password || process.env.ADMIN_PASSWORD || 'admin123';
const name = args.name || process.env.ADMIN_NAME || 'سِدِّيقَة';

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tawfeeq';

async function run() {
  try {
    console.log('Connecting to MongoDB...', dbURI);
    await mongoose.connect(dbURI, { autoIndex: true });
    console.log('Connected. Upserting admin:', email);

    let admin = await Admin.findOne({ email: email.toLowerCase() });
    if (admin) {
      admin.email = email.toLowerCase();
      admin.name = name;
      admin.password = password; // will be hashed by pre-save hook
      admin.role = 'admin';
      admin.canCreateAdmins = true;
      await admin.save();
      console.log('✅ Existing admin updated:', admin.email);
    } else {
      admin = new Admin({ email: email.toLowerCase(), password, name, role: 'admin', canCreateAdmins: true });
      await admin.save();
      console.log('✅ Admin created:', admin.email);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB. Done.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error upserting admin:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

run();
