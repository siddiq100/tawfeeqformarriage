import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './models/User.js';
import Profile from './models/Profile.js';
import Message from './models/Message.js';
import Contact from './models/Contact.js';
import Notification from './models/Notification.js';
import Admin from './models/Admin.js';
import { authMiddleware, adminAuthMiddleware } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());
app.use(express.static('uploads'));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1E9)}${ext}`);
  }
});

const upload = multer({ storage });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
});

const sendVerificationEmail = async ({ to, code }) => {
  const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@tawfeeq.com';
  const subject = 'رمز تأكيد البريد الإلكتروني - توفيق للزواج';
  const html = `
    <div style="font-family: Arial, sans-serif; direction: rtl; text-align: right;">
      <h2>رمز تأكيد البريد الإلكتروني</h2>
      <p>رمز التحقق الخاص بك هو:</p>
      <p style="font-size: 1.5rem; font-weight: 700; color: #d61eff;">${code}</p>
      <p>استخدم هذا الرمز لتأكيد بريدك الإلكتروني وإكمال التسجيل.</p>
    </div>
  `;

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_HOST) {
    console.log(`📧 [EMAIL DEBUG] ${to} verification code: ${code}`);
    return;
  }

  await transporter.sendMail({
    from: fromAddress,
    to,
    subject,
    html
  });
};

// MongoDB Connection
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/tawfeeq';
mongoose.connect(dbURI)
  .then(() => console.log('✅ قاعدة البيانات متصلة'))
  .catch(err => console.error('❌ خطأ في الاتصال بقاعدة البيانات:', err));

mongoose.connection.on('error', err => {
  console.error('❌ خطأ في اتصال MongoDB:', err);
});

mongoose.connection.once('open', () => {
  console.log('✅ تم فتح اتصال MongoDB بنجاح');
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ الخادم يعمل بشكل صحيح' });
});

// Authentication Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, gender } = req.body;
    
    if (!email || !password || !name || !gender) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'البريد الإلكتروني مسجل بالفعل' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60); // ساعة واحدة

    const user = new User({
      email,
      password,
      name,
      gender,
      status: 'pending',
      isEmailVerified: false,
      emailVerificationCode: verificationCode,
      verificationExpiresAt
    });

    await user.save();
    await sendVerificationEmail({ to: email, code: verificationCode });

    res.status(201).json({ 
      message: 'تم التسجيل بنجاح. تم إرسال رمز التحقق إلى بريدك الإلكتروني.',
      userId: user._id,
      status: 'pending'
    });
  } catch (error) {
    console.error('خطأ في التسجيل:', error);
    res.status(500).json({ message: 'خطأ في التسجيل' });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'البريد الإلكتروني والرمز مطلوبان' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'البريد الإلكتروني مؤكد مسبقاً' });
    }

    if (!user.emailVerificationCode || user.emailVerificationCode !== code) {
      return res.status(400).json({ message: 'رمز التحقق غير صحيح' });
    }

    if (user.verificationExpiresAt && user.verificationExpiresAt < new Date()) {
      return res.status(400).json({ message: 'انتهت صلاحية رمز التحقق. اطلب رمزاً جديداً' });
    }

    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.verificationExpiresAt = null;
    await user.save();

    res.json({ message: 'تم تأكيد البريد الإلكتروني بنجاح. في انتظار موافقة الإدارة.' });
  } catch (error) {
    console.error('خطأ في التحقق من البريد الإلكتروني:', error);
    res.status(500).json({ message: 'خطأ في التحقق من البريد الإلكتروني' });
  }
});

app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'البريد الإلكتروني مؤكد مسبقاً' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60);

    user.emailVerificationCode = verificationCode;
    user.verificationExpiresAt = verificationExpiresAt;
    await user.save();

    await sendVerificationEmail({ to: email, code: verificationCode });

    res.json({ message: 'تم إعادة إرسال رمز التحقق إلى البريد الإلكتروني' });
  } catch (error) {
    console.error('خطأ في إعادة إرسال رمز التحقق:', error);
    res.status(500).json({ message: 'خطأ في إعادة إرسال رمز التحقق' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'البريد وكلمة المرور مطلوبة' });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'بيانات تسجيل الدخول غير صحيحة' });
    }

    // Check if account is approved
    if (!user.isEmailVerified) {
      return res.status(403).json({ message: 'الرجاء تأكيد بريدك الإلكتروني أولاً' });
    }

    if (user.status === 'pending') {
      return res.status(403).json({ message: 'حسابك في انتظار موافقة الإدارة' });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ message: 'تم رفض حسابك' });
    }

    if (user.status === 'suspended') {
      return res.status(403).json({ message: 'تم تعليق حسابك مؤقتاً' });
    }

    if (user.status === 'banned') {
      return res.status(403).json({ message: 'تم حظر حسابك من قبل الإدارة' });
    }

    if (user.activationExpiresAt && user.activationExpiresAt < new Date()) {
      return res.status(403).json({ message: 'انتهت مدة تفعيل حسابك. تواصل مع الإدارة لتجديدها.' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'بيانات تسجيل الدخول غير صحيحة' });
    }

    await User.findByIdAndUpdate(user._id, { isOnline: true });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'تم تسجيل الدخول بنجاح',
      userId: user._id,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        status: user.status,
        isOnline: true,
        accessMode: user.accessMode,
        allowedContacts: user.allowedContacts || []
      }
    });
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    res.status(500).json({ message: 'خطأ في تسجيل الدخول' });
  }
});

// Admin Authentication
app.post('/api/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'البريد وكلمة المرور مطلوبة' });
    }

    const admin = await Admin.findOne({ email });
    
    if (!admin) {
      return res.status(401).json({ message: 'بيانات تسجيل الدخول غير صحيحة' });
    }

    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'بيانات تسجيل الدخول غير صحيحة' });
    }

    const token = jwt.sign(
      { adminId: admin._id, role: admin.role, email: admin.email, canCreateAdmins: admin.canCreateAdmins },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'تم تسجيل دخول الإدارة بنجاح',
      adminId: admin._id,
      token,
      role: admin.role,
      email: admin.email,
      canCreateAdmins: admin.canCreateAdmins
    });
  } catch (error) {
    console.error('خطأ في تسجيل دخول الإدارة:', error);
    res.status(500).json({ message: 'خطأ في تسجيل الدخول' });
  }
});

app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { isOnline: false });
    res.json({ message: 'تم تسجيل الخروج بنجاح' });
  } catch (error) {
    console.error('خطأ في تسجيل الخروج:', error);
    res.status(500).json({ message: 'خطأ في تسجيل الخروج' });
  }
});

app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId);
    const users = await User.find({ status: 'approved', _id: { $ne: req.userId } })
      .select('name email gender isOnline profilePicture status accessMode allowedContacts hideOthers');

    let filteredUsers = users;
    if (currentUser.hideOthers) {
      filteredUsers = [];
    } else if (currentUser.accessMode === 'restricted') {
      if (currentUser.allowedContacts?.length) {
        filteredUsers = users.filter(user =>
          currentUser.allowedContacts.some(id => id.toString() === user._id.toString())
        );
      } else {
        filteredUsers = [];
      }
    }

    res.json({ users: filteredUsers });
  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
    res.status(500).json({ message: 'خطأ في جلب المستخدمين' });
  }
});

app.get('/api/users/online', authMiddleware, async (req, res) => {
  try {
    const onlineUsers = await User.find({ status: 'approved', isOnline: true })
      .select('name email gender isOnline profilePicture');
    res.json({ users: onlineUsers });
  } catch (error) {
    console.error('خطأ في جلب المستخدمين المتصلين:', error);
    res.status(500).json({ message: 'خطأ في جلب المستخدمين المتصلين' });
  }
});

// Profile Routes
app.post('/api/profiles', authMiddleware, async (req, res) => {
  try {
    const { age, location, bio, religion, interests, images } = req.body;
    
    if (!age || !location) {
      return res.status(400).json({ message: 'البيانات غير كاملة' });
    }

    // Check if profile already exists
    let profile = await Profile.findOne({ userId: req.userId });
    
    if (profile) {
      // Update existing profile
      profile.age = age;
      profile.location = location;
      profile.bio = bio || '';
      profile.religion = religion || '';
      profile.interests = interests || [];
      profile.images = images || [];
      profile.updatedAt = new Date();
      await profile.save();
    } else {
      // Create new profile
      profile = new Profile({
        userId: req.userId,
        age,
        location,
        bio: bio || '',
        religion: religion || '',
        interests: interests || [],
        images: images || []
      });
      await profile.save();
    }

    // Mark user profile as complete
    await User.findByIdAndUpdate(req.userId, { profileComplete: true });

    res.status(201).json({ message: 'تم حفظ الملف الشخصي', profile });
  } catch (error) {
    console.error('خطأ في إنشاء الملف الشخصي:', error);
    res.status(500).json({ message: 'خطأ في إنشاء الملف الشخصي' });
  }
});

app.post('/api/profiles/photo', authMiddleware, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لم يتم تحميل الصورة' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/${req.file.filename}`;
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    user.profilePicture = imageUrl;
    await user.save();

    res.json({ message: 'تم تحديث الصورة الشخصية', profilePicture: imageUrl });
  } catch (error) {
    console.error('خطأ في رفع الصورة:', error);
    res.status(500).json({ message: 'خطأ في رفع الصورة' });
  }
});

app.get('/api/profiles', authMiddleware, async (req, res) => {
  try {
    const { location, ageMin, ageMax } = req.query;
    const currentUser = await User.findById(req.userId);

    if (!currentUser) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    const searchGender = currentUser.gender === 'male' ? 'female' : 'male';

    // Build profile filter
    const profileFilter = { isPublic: true };

    if (location) {
      profileFilter.location = { $regex: location, $options: 'i' };
    }

    if (ageMin || ageMax) {
      profileFilter.age = {};
      if (ageMin) profileFilter.age.$gte = parseInt(ageMin, 10);
      if (ageMax) profileFilter.age.$lte = parseInt(ageMax, 10);
    }

    const profiles = await Profile.find(profileFilter)
      .populate({
        path: 'userId',
        match: {
          gender: searchGender,
          status: 'approved',
          _id: { $ne: req.userId }
        },
        select: 'name email gender status isOnline profilePicture accessMode allowedContacts'
      })
      .exec();

    let filteredProfiles = profiles.filter(p => p.userId);

    if (currentUser.hideOthers) {
      filteredProfiles = [];
    } else if (currentUser.accessMode === 'restricted') {
      if (currentUser.allowedContacts?.length) {
        filteredProfiles = filteredProfiles.filter(profile =>
          currentUser.allowedContacts.some(id => id.toString() === profile.userId._id.toString())
        );
      } else {
        filteredProfiles = [];
      }
    }

    res.json({ profiles: filteredProfiles });
  } catch (error) {
    console.error('خطأ في جلب الملفات:', error);
    res.status(500).json({ message: 'خطأ في جلب الملفات الشخصية' });
  }
});

app.get('/api/profiles/:id', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id).populate('userId');
    
    if (!profile) {
      return res.status(404).json({ message: 'الملف الشخصي غير موجود' });
    }

    res.json({ profile });
  } catch (error) {
    console.error('خطأ في جلب الملف:', error);
    res.status(500).json({ message: 'خطأ في جلب الملف الشخصي' });
  }
});

app.put('/api/profiles/:id', authMiddleware, async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id);
    
    if (!profile) {
      return res.status(404).json({ message: 'الملف الشخصي غير موجود' });
    }

    // Check if user owns this profile
    if (profile.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'لا يملك صلاحيات' });
    }

    Object.assign(profile, req.body, { updatedAt: new Date() });
    await profile.save();
    
    res.json({ message: 'تم تحديث الملف الشخصي', profile });
  } catch (error) {
    console.error('خطأ في تحديث الملف:', error);
    res.status(500).json({ message: 'خطأ في تحديث الملف الشخصي' });
  }
});

// Messages Routes
app.post('/api/messages', authMiddleware, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({ message: 'البيانات غير كاملة' });
    }

    const sender = await User.findById(req.userId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    if (sender.accessMode === 'restricted' && sender.allowedContacts?.length) {
      const allowed = sender.allowedContacts.some(id => id.toString() === receiverId);
      if (!allowed) {
        return res.status(403).json({ message: 'غير مسموح لك إرسال رسائل لهذا المستخدم' });
      }
    }

    const message = new Message({
      senderId: req.userId,
      receiverId,
      content
    });

    await message.save();
    res.status(201).json({ message: 'تم إرسال الرسالة', data: message });
  } catch (error) {
    console.error('خطأ في إرسال الرسالة:', error);
    res.status(500).json({ message: 'خطأ في إرسال الرسالة' });
  }
});

app.get('/api/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.userId },
        { receiverId: req.userId }
      ]
    })
    .populate('senderId', 'name email isOnline profilePicture')
    .populate('receiverId', 'name email isOnline profilePicture')
    .sort({ createdAt: -1 });

    res.json({ messages });
  } catch (error) {
    console.error('خطأ في جلب الرسائل:', error);
    res.status(500).json({ message: 'خطأ في جلب الرسائل' });
  }
});

// Contact Form Route
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message: msg } = req.body;
    
    if (!name || !email || !subject || !msg) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    const contact = new Contact({
      name,
      email,
      subject,
      message: msg
    });

    await contact.save();
    res.status(201).json({ message: 'تم إرسال رسالتك بنجاح' });
  } catch (error) {
    console.error('خطأ في إرسال الرسالة:', error);
    res.status(500).json({ message: 'خطأ في إرسال الرسالة' });
  }
});

// Admin Endpoints - Approve/Reject Users
app.get('/api/admin/pending-users', adminAuthMiddleware, async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' })
      .select('-password');
    
    res.json({ users: pendingUsers });
  } catch (error) {
    console.error('خطأ في جلب المستخدمين المعلقين:', error);
    res.status(500).json({ message: 'خطأ في جلب المستخدمين' });
  }
});

app.post('/api/admin/approve-user/:userId', adminAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { status: 'approved' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    res.json({ message: 'تم قبول الحساب', user });
  } catch (error) {
    console.error('خطأ في قبول الحساب:', error);
    res.status(500).json({ message: 'خطأ في قبول الحساب' });
  }
});

app.post('/api/admin/reject-user/:userId', adminAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { status: 'rejected' },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    res.json({ message: 'تم رفض الحساب', user });
  } catch (error) {
    console.error('خطأ في رفض الحساب:', error);
    res.status(500).json({ message: 'خطأ في رفض الحساب' });
  }
});

app.get('/api/admin/all-users', adminAuthMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
    res.status(500).json({ message: 'خطأ في جلب المستخدمين' });
  }
});

app.get('/api/admin/admins', adminAuthMiddleware, async (req, res) => {
  try {
    const admins = await Admin.find().select('-password');
    res.json({ admins });
  } catch (error) {
    console.error('خطأ في جلب مشرفي النظام:', error);
    res.status(500).json({ message: 'خطأ في جلب المشرفين' });
  }
});

app.post('/api/admin/admins', adminAuthMiddleware, async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const allowedCreator = req.adminEmail === 'siddiqa@tawfeeq.com' || req.adminCanCreate;

    if (!allowedCreator) {
      return res.status(403).json({ message: 'لا تملك صلاحية إنشاء مشرف' });
    }

    if (!email || !password || !name) {
      return res.status(400).json({ message: 'جميع الحقول مطلوبة' });
    }

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(409).json({ message: 'هذا المشرف موجود بالفعل' });
    }

    const newAdmin = new Admin({
      email,
      password,
      name,
      role: 'admin',
      canCreateAdmins: true
    });

    await newAdmin.save();
    res.status(201).json({ message: 'تم إنشاء مشرف جديد بنجاح', admin: { _id: newAdmin._id, email: newAdmin.email, name: newAdmin.name, role: newAdmin.role, canCreateAdmins: newAdmin.canCreateAdmins } });
  } catch (error) {
    console.error('خطأ في إنشاء مشرف جديد:', error);
    res.status(500).json({ message: 'خطأ في إنشاء مشرف' });
  }
});

app.post('/api/admin/user/:userId/activate', adminAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { status: 'approved' }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json({ message: 'تم تنشيط الحساب', user });
  } catch (error) {
    console.error('خطأ في تنشيط الحساب:', error);
    res.status(500).json({ message: 'خطأ في تنشيط الحساب' });
  }
});

app.post('/api/admin/user/:userId/activate-duration', adminAuthMiddleware, async (req, res) => {
  try {
    const { duration, unit } = req.body;
    if (!duration || !unit) {
      return res.status(400).json({ message: 'حدد المدة والوحدة (أيام أو أشهر)' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    const amount = Number(duration);
    if (Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'المدة غير صحيحة' });
    }

    const now = new Date();
    const expiresAt = user.activationExpiresAt && user.activationExpiresAt > now ? new Date(user.activationExpiresAt) : now;

    if (unit === 'months') {
      expiresAt.setMonth(expiresAt.getMonth() + amount);
    } else {
      expiresAt.setDate(expiresAt.getDate() + amount);
    }

    user.status = 'approved';
    user.activationExpiresAt = expiresAt;
    await user.save();

    res.json({ message: 'تم تفعيل أو تجديد الحساب بالمدة المحددة', user: user.toObject() });
  } catch (error) {
    console.error('خطأ في تفعيل الحساب بالمدة:', error);
    res.status(500).json({ message: 'خطأ في تفعيل الحساب بالمدة' });
  }
});

app.post('/api/admin/user/:userId/suspend', adminAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { status: 'suspended', isOnline: false }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json({ message: 'تم تعليق الحساب', user });
  } catch (error) {
    console.error('خطأ في تعليق الحساب:', error);
    res.status(500).json({ message: 'خطأ في تعليق الحساب' });
  }
});

app.post('/api/admin/user/:userId/ban', adminAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { status: 'banned', isOnline: false }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json({ message: 'تم حظر المستخدم', user });
  } catch (error) {
    console.error('خطأ في حظر المستخدم:', error);
    res.status(500).json({ message: 'خطأ في حظر المستخدم' });
  }
});

app.post('/api/admin/user/:userId/hide-others', adminAuthMiddleware, async (req, res) => {
  try {
    const { hideOthers } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    user.hideOthers = Boolean(hideOthers);
    await user.save();

    res.json({ message: `تم ${user.hideOthers ? 'إخفاء باقي الأعضاء عن' : 'إظهار باقي الأعضاء للمستخدم'}`, user });
  } catch (error) {
    console.error('خطأ في تحديث خاصية إخفاء الآخرين:', error);
    res.status(500).json({ message: 'خطأ في تحديث خاصية إخفاء الآخرين' });
  }
});

app.delete('/api/admin/user/:userId', adminAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    await Profile.findOneAndDelete({ userId: req.params.userId });
    await Message.deleteMany({ $or: [{ senderId: req.params.userId }, { receiverId: req.params.userId }] });
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json({ message: 'تم حذف الحساب' });
  } catch (error) {
    console.error('خطأ في حذف الحساب:', error);
    res.status(500).json({ message: 'خطأ في حذف الحساب' });
  }
});

app.post('/api/admin/user/:userId/restrict', adminAuthMiddleware, async (req, res) => {
  try {
    const { allowedContacts = [] } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    user.accessMode = allowedContacts.length ? 'restricted' : 'all';
    user.allowedContacts = allowedContacts;
    await user.save();

    res.json({ message: 'تم تحديث قيود الوصول', user: user.toObject() });
  } catch (error) {
    console.error('خطأ في تحديث القيود:', error);
    res.status(500).json({ message: 'خطأ في تحديث القيود' });
  }
});

app.post('/api/admin/user/:userId/clear-restriction', adminAuthMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.userId, { accessMode: 'all', allowedContacts: [] }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    res.json({ message: 'تم إزالة قيود الوصول', user });
  } catch (error) {
    console.error('خطأ في إزالة القيود:', error);
    res.status(500).json({ message: 'خطأ في إزالة القيود' });
  }
});

app.post('/api/admin/broadcast', adminAuthMiddleware, async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!message) return res.status(400).json({ message: 'الرسالة مطلوبة' });

    const users = await User.find({ status: 'approved' }).select('_id');
    const notifications = users.map(user => ({
      userId: user._id,
      title: title || 'إشعار من المنصة',
      content: message
    }));

    await Notification.insertMany(notifications);
    res.json({ message: 'تم إرسال الإشعار للجميع' });
  } catch (error) {
    console.error('خطأ في إرسال إشعار البث:', error);
    res.status(500).json({ message: 'خطأ في إرسال إشعار البث' });
  }
});

app.get('/api/user/notifications', authMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json({ notifications });
  } catch (error) {
    console.error('خطأ في جلب الإشعارات:', error);
    res.status(500).json({ message: 'خطأ في جلب الإشعارات' });
  }
});

app.get('/api/admin/messages', adminAuthMiddleware, async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });
    res.json({ messages });
  } catch (error) {
    console.error('خطأ في جلب الرسائل:', error);
    res.status(500).json({ message: 'خطأ في جلب الرسائل' });
  }
});

// Get current user profile
app.get('/api/user/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    const profile = await Profile.findOne({ userId: req.userId });
    
    res.json({ user, profile });
  } catch (error) {
    console.error('خطأ في جلب البيانات:', error);
    res.status(500).json({ message: 'خطأ في جلب البيانات' });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'حدث خطأ في الخادم' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 خادم توفيق يعمل على http://localhost:${PORT}`);
});

export default app;
