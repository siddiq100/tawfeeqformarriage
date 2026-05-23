import mongoose from 'mongoose';
import Admin from './models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tawfeeq')
  .then(() => console.log('✅ متصل بقاعدة البيانات'))
  .catch(err => {
    console.error('❌ خطأ في الاتصال:', err);
    process.exit(1);
  });

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ 
      email: process.env.ADMIN_EMAIL || 'admin@tawfeeq.com' 
    });

    if (existingAdmin) {
      console.log('✅ حساب الإدارة موجود بالفعل');
      process.exit(0);
    }

    // Create new admin
    const admin = new Admin({
      email: process.env.ADMIN_EMAIL || 'siddiqa@tawfeeq.com',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      name: process.env.ADMIN_NAME || 'سِدِّيقَة',
      role: 'admin',
      canCreateAdmins: true
    });

    await admin.save();
    console.log('✅ تم إنشاء حساب الإدارة بنجاح');
    console.log('البريد:', admin.email);
    console.log('الدور:', admin.role);
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في إنشاء حساب الإدارة:', error);
    process.exit(1);
  }
};

createDefaultAdmin();
