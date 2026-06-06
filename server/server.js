import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import User from './models/User.js';
import Profile from './models/Profile.js';
import Message from './models/Message.js';
import Contact from './models/Contact.js';
import Notification from './models/Notification.js';
import Admin from './models/Admin.js';
import Banner from './models/Banner.js';
import ManagerMessage from './models/ManagerMessage.js';
import { authMiddleware, adminAuthMiddleware } from './middleware/auth.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
  : ['http://localhost:3000', 'http://localhost:3003'];

if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  }
}));
app.use(express.json());
app.use(express.static('uploads'));

const newProjectPath = path.join(__dirname, '..', 'newproject');
if (fs.existsSync(newProjectPath)) {
  app.use(express.static(newProjectPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(newProjectPath, 'index.html'));
  });
}

// Serve client build if present (links frontend with backend)
const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
if (fs.existsSync(clientBuildPath)) {
  // Serve at the homepage path used when the app was built
  app.use('/tawfeeqformarriage', express.static(clientBuildPath));

  // Also serve files at root for convenience
  app.use(express.static(clientBuildPath));

  // Serve index.html for requests to the prefixed path
  app.get('/tawfeeqformarriage*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });

  // For any other non-API route, serve the React app
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

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
const dbURI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/tawfeeq';
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
    const {
      email, password, name, gender, age, nationality, tribe,
      location, education, height, weight, color, hair,
      appearanceDesc, preferences, interests, partnerPreferences, religion
    } = req.body;

    // Required fields for registration per request
    if (!email || !password || !name || !gender || !age || !nationality || !tribe || !location || !education) {
      return res.status(400).json({ message: 'جميع الحقول الأساسية مطلوبة' });
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
      age: Number(age),
      location,
      religion: religion || '',
      status: 'pending',
      isEmailVerified: false,
      emailVerificationCode: verificationCode,
      verificationExpiresAt,
      profileComplete: true
    });

    await user.save();

    // Create profile document
    const profile = new Profile({
      userId: user._id,
      age: Number(age),
      location,
      nationality,
      tribe,
      education,
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      color: color || '',
      hair: hair || '',
      appearanceDesc: appearanceDesc || '',
      preferences: preferences ? (Array.isArray(preferences) ? preferences : String(preferences).split(',').map(s => s.trim())) : [],
      bio: '',
      religion: religion || '',
      interests: interests ? (Array.isArray(interests) ? interests : String(interests).split(',').map(s => s.trim())) : [],
      images: []
    });

    await profile.save();

    // --- Automatic matching for manager notifications ---
    try {
      // Fetch candidate profiles (approved) of opposite gender
      const searchGender = user.gender === 'male' ? 'female' : 'male';
      const candidates = await Profile.find({ isPublic: true }).populate('userId').exec();

      const scored = candidates.map(p => {
        const pUser = p.userId;
        if (!pUser || pUser.status !== 'approved' || pUser.gender !== searchGender) return null;

        let score = 0;
        // location
        if (p.location && profile.location && p.location.toLowerCase().includes(String(profile.location).toLowerCase())) score += 25;
        // age proximity (within +/-2 years) gives some points, within range gives more
        const age = p.age || 0;
        const newAge = profile.age || 0;
        if (newAge && age) {
          const diff = Math.abs(age - newAge);
          if (diff === 0) score += 20;
          else if (diff <= 2) score += 15;
          else if (diff <= 5) score += 8;
        }
        // religion
        if (profile.religion && p.religion && profile.religion.toLowerCase() === p.religion.toLowerCase()) score += 15;
        // interests overlap
        const aInterests = (profile.interests || []).map(i => String(i).toLowerCase());
        const bInterests = (p.interests || []).map(i => String(i).toLowerCase());
        if (aInterests.length > 0 && bInterests.length > 0) {
          const overlap = aInterests.filter(i => bInterests.includes(i)).length;
          score += Math.min(25, overlap * 8);
        }
        // picture + completeness
        if (pUser.profilePicture) score += 10;
        if (p.profileComplete) score += 5;
        score = Math.min(100, Math.round(score));

        return { profile: p, score };
      }).filter(Boolean);

      const THRESHOLD = 50; // notify manager when score >= threshold
      const matchesToNotify = scored.filter(s => s.score >= THRESHOLD).sort((a,b)=>b.score-a.score);

      for (const m of matchesToNotify) {
        const msg = new ManagerMessage({
          newProfileId: profile._id,
          matchedProfileId: m.profile._id,
          score: m.score,
          message: `New signup ${user.name} matched with ${m.profile.userId?.name || 'N/A'} (score ${m.score})`
        });
        await msg.save();
      }
    } catch (matchErr) {
      console.error('خطأ أثناء حساب المطابقات أو إرسال إشعار الإدارة:', matchErr);
    }

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

// Matches endpoint - scores profiles against provided criteria or current user's implicit preferences
app.get('/api/matches', authMiddleware, async (req, res) => {
  try {
    const { location, ageMin, ageMax, interests, religion, minScore } = req.query;
    const currentUser = await User.findById(req.userId);
    if (!currentUser) return res.status(404).json({ message: 'المستخدم غير موجود' });

    // parse interests list if provided
    const requestedInterests = interests ? String(interests).split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];

    // Fetch candidate profiles (public) and opposite gender
    const searchGender = currentUser.gender === 'male' ? 'female' : 'male';
    const profileFilter = { isPublic: true };
    if (location) profileFilter.location = { $regex: location, $options: 'i' };
    const profiles = await Profile.find(profileFilter).populate('userId').exec();

    const scored = profiles.map(profile => {
      const pUser = profile.userId;
      // basic eligibility
      if (!pUser || pUser.status !== 'approved' || pUser.gender !== searchGender) {
        return null;
      }

      let score = 0;

      // location exact or substring
      if (location && profile.location && profile.location.toLowerCase().includes(String(location).toLowerCase())) score += 25;

      // age scoring
      const age = profile.age || 0;
      if (ageMin && ageMax) {
        const aMin = Number(ageMin) || 0;
        const aMax = Number(ageMax) || 0;
        if (age >= aMin && age <= aMax) score += 20;
      }

      // religion match
      if (religion && profile.religion && profile.religion.toLowerCase() === String(religion).toLowerCase()) score += 15;

      // interests overlap
      let interestsScore = 0;
      const profileInterests = (profile.interests || []).map(i => String(i).toLowerCase());
      if (requestedInterests.length > 0 && profileInterests.length > 0) {
        const overlap = requestedInterests.filter(i => profileInterests.includes(i)).length;
        interestsScore = Math.min(25, overlap * 8); // up to 24-25
      } else if (requestedInterests.length === 0 && profileInterests.length > 0) {
        // small score if they have interests but user didn't specify
        interestsScore = 5;
      }
      score += interestsScore;

      // profile completeness and picture
      if (pUser.profilePicture) score += 10;
      if (profile.profileComplete) score += 5;

      // cap score at 100
      score = Math.min(100, Math.round(score));

      return { profile, score };
    }).filter(Boolean);

    const min = Number(minScore) || 0;
    const filtered = scored.filter(s => s.score >= min).sort((a, b) => b.score - a.score);

    res.json({ matches: filtered.map(s => ({ profile: s.profile, score: s.score })) });
  } catch (error) {
    console.error('خطأ في جلب المطابقات:', error);
    res.status(500).json({ message: 'خطأ في جلب المطابقات' });
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

app.get('/api/home-banner', async (req, res) => {
  try {
    const banner = await Banner.findOne().lean();
    res.json({ banner: banner || {} });
  } catch (error) {
    console.error('خطأ في جلب إعدادات البنر:', error);
    res.status(500).json({ message: 'خطأ في جلب إعدادات البنر' });
  }
});

// Return all banners (carousel / advert windows)
app.get('/api/home-banners', async (req, res) => {
  try {
    const banners = await Banner.find().sort({ updatedAt: -1 }).lean();
    res.json({ banners });
  } catch (error) {
    console.error('خطأ في جلب البنرات:', error);
    res.status(500).json({ message: 'خطأ في جلب البنرات' });
  }
});

app.get('/api/admin/home-banner', adminAuthMiddleware, async (req, res) => {
  try {
    const banner = await Banner.findOne().lean();
    res.json({ banner: banner || {} });
  } catch (error) {
    console.error('خطأ في جلب إعدادات البنر للمشرف:', error);
    res.status(500).json({ message: 'خطأ في جلب إعدادات البنر' });
  }
});

app.post('/api/admin/home-banner', adminAuthMiddleware, async (req, res) => {
  try {
    const { imageUrl, title, description } = req.body;
    if (!imageUrl) {
      return res.status(400).json({ message: 'رابط الصورة مطلوب' });
    }

    const banner = await Banner.findOneAndUpdate(
      {},
      { imageUrl, title: title || '', description: description || '', updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'تم تحديث إعدادات البنر بنجاح', banner });
  } catch (error) {
    console.error('خطأ في تحديث إعدادات البنر:', error);
    res.status(500).json({ message: 'خطأ في تحديث إعدادات البنر' });
  }
});

app.post('/api/admin/home-banner/upload', adminAuthMiddleware, upload.single('bannerImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لم يتم تحميل الصورة' });
    }

    const imageUrl = `${req.protocol}://${req.get('host')}/${req.file.filename}`;
    res.json({ message: 'تم رفع الصورة بنجاح', imageUrl });
  } catch (error) {
    console.error('خطأ في رفع صورة البنر:', error);
    res.status(500).json({ message: 'خطأ في رفع صورة البنر' });
  }
});

// Admin: create/update multiple banners (store images array)
app.post('/api/admin/home-banners', adminAuthMiddleware, async (req, res) => {
  try {
    const { images = [], title, description } = req.body;
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ message: 'الصور مطلوبة كمصفوفة' });
    }

    const banner = await Banner.findOneAndUpdate(
      {},
      { images, title: title || '', description: description || '', updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'تم حفظ البنرات بنجاح', banner });
  } catch (error) {
    console.error('خطأ في حفظ البنرات:', error);
    res.status(500).json({ message: 'خطأ في حفظ البنرات' });
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

app.post('/api/admin/user/:userId/set-status', adminAuthMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'approved', 'suspended', 'banned'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'حالة المستخدم غير صحيحة' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    user.status = status;
    await user.save();

    res.json({ message: 'تم تحديث حالة المستخدم', user: user.toObject() });
  } catch (error) {
    console.error('خطأ في تحديث حالة المستخدم:', error);
    res.status(500).json({ message: 'خطأ في تحديث حالة المستخدم' });
  }
});

app.post('/api/admin/user/:userId/update-credentials', adminAuthMiddleware, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email && !password) {
      return res.status(400).json({ message: 'ادخل البريد أو كلمة المرور للتحديث' });
    }

    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    if (email) {
      const existingEmailUser = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingEmailUser) {
        return res.status(400).json({ message: 'هذا البريد مستخدم بالفعل من قبل مستخدم آخر' });
      }
      user.email = email;
    }

    if (password) {
      user.password = password;
    }

    await user.save();

    res.json({ message: 'تم تحديث بيانات الدخول للمستخدم', user: user.toObject() });
  } catch (error) {
    console.error('خطأ في تحديث بيانات الدخول للمستخدم:', error);
    res.status(500).json({ message: 'خطأ في تحديث بيانات الدخول للمستخدم' });
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

// Admin: manager messages (notifications about auto-matches)
app.get('/api/admin/manager-messages', adminAuthMiddleware, async (req, res) => {
  try {
    const msgs = await ManagerMessage.find().populate('newProfileId').populate('matchedProfileId').sort({ createdAt: -1 }).limit(200);
    res.json({ messages: msgs });
  } catch (error) {
    console.error('خطأ في جلب رسائل الإدارة:', error);
    res.status(500).json({ message: 'خطأ في جلب رسائل الإدارة' });
  }
});

app.post('/api/admin/manager-messages/:id/read', adminAuthMiddleware, async (req, res) => {
  try {
    const id = req.params.id;
    const msg = await ManagerMessage.findById(id);
    if (!msg) return res.status(404).json({ message: 'الرسالة غير موجودة' });
    msg.read = true;
    await msg.save();
    res.json({ message: 'تم وضع الرسالة كمقروءة' });
  } catch (error) {
    console.error('خطأ في تحديث حالة الرسالة:', error);
    res.status(500).json({ message: 'خطأ في تحديث حالة الرسالة' });
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
const HOST = process.env.BIND_HOST || '0.0.0.0';

const getLocalIp = () => {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
};

const localIp = getLocalIp();

app.listen(PORT, HOST, () => {
  console.log(`🚀 خادم توفيق يعمل على http://localhost:${PORT}`);
  console.log(`🌐 الوصول عبر الشبكة المحلية: http://${localIp}:${PORT}`);
});

export default app;
