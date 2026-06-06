import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Admin from './models/Admin.js';
import jwt from 'jsonwebtoken';

// Load root .env (project root)
dotenv.config({ path: path.join(process.cwd(), '..', '.env') });

const dbURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tawfeeq';

const argv = process.argv.slice(2);
const args = {};
argv.forEach(a => { const [k,v] = a.split('='); if (k && v) args[k.replace(/^--/, '')] = v; });

const email = args.email || 'siddiqa@tawfeeq.com';
const password = args.password || 'admin123';
const name = args.name || 'سِدِّيقَة';

async function run(){
  try{
    console.log('Connecting to', dbURI);
    await mongoose.connect(dbURI, { autoIndex: true });
    let admin = await Admin.findOne({ email: email.toLowerCase() });
    if (admin){
      admin.email = email.toLowerCase();
      admin.name = name;
      admin.password = password;
      admin.role = 'admin';
      admin.canCreateAdmins = true;
      await admin.save();
      console.log('Updated admin:', admin.email);
    } else {
      admin = new Admin({ email: email.toLowerCase(), password, name, role: 'admin', canCreateAdmins: true });
      await admin.save();
      console.log('Created admin:', admin.email);
    }

    const secret = process.env.JWT_SECRET || 'devsecret';
    const token = jwt.sign({ adminId: admin._id, role: admin.role, email: admin.email, canCreateAdmins: admin.canCreateAdmins }, secret, { expiresIn: '7d' });
    console.log('\nADMIN_TOKEN=' + token + '\n');
    await mongoose.disconnect();
    process.exit(0);
  }catch(err){
    console.error('Error:', err);
    try{ await mongoose.disconnect(); }catch(e){}
    process.exit(1);
  }
}

run();
