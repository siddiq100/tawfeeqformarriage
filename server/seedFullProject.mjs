import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import User from './models/User.js';
import Profile from './models/Profile.js';
import Message from './models/Message.js';
import Contact from './models/Contact.js';
import Notification from './models/Notification.js';
import Banner from './models/Banner.js';
import ManagerMessage from './models/ManagerMessage.js';

dotenv.config();

const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/marriage-app';

const connect = async () => {
  await mongoose.connect(dbURI, { autoIndex: true });
  console.log('✅ Connected to MongoDB:', dbURI);
};

const createAdmin = async () => {
  const email = process.env.ADMIN_EMAIL || 'admin@tawfeeq.com';
  let admin = await Admin.findOne({ email });
  if (admin) {
    console.log('ℹ️ Admin already exists:', email);
    return admin;
  }

  admin = new Admin({
    email,
    password: process.env.ADMIN_PASSWORD || 'admin123',
    name: process.env.ADMIN_NAME || 'سِدِّيقَة',
    role: 'admin',
    canCreateAdmins: true
  });
  await admin.save();
  console.log('✅ Created admin:', email);
  return admin;
};

const createUserWithProfile = async () => {
  const userId = new mongoose.Types.ObjectId('68ed0016348638397114dd18');
  let user = await User.findById(userId);
  if (user) {
    console.log('ℹ️ User already exists with id', userId.toString());
  } else {
    user = new User({
      _id: userId,
      name: 'Tawfeeq User',
      email: 'user68ed0016@example.com',
      password: 'Password123!',
      gender: 'male',
      age: 28,
      location: 'Riyadh',
      religion: 'Islam',
      status: 'approved',
      isEmailVerified: true,
      profileComplete: true
    });
    await user.save();
    console.log('✅ Created user', user.email, 'with id', user._id.toString());
  }

  let profile = await Profile.findOne({ userId: user._id });
  if (profile) {
    console.log('ℹ️ Profile already exists for user', user._id.toString());
  } else {
    profile = new Profile({
      userId: user._id,
      age: 28,
      location: 'Riyadh',
      nationality: 'Saudi',
      tribe: 'Al-Saud',
      education: 'Bachelor\'s Degree',
      height: 175,
      weight: 72,
      color: 'Fair',
      hair: 'Black',
      appearanceDesc: 'شاب ملتزم يبحث عن شريكة حياة',
      preferences: ['دين', 'خلق', 'استقرار'],
      bio: 'شاب طموح من الرياض يبحث عن شريكة حياة متفاهمة ومؤمنة.',
      religion: 'Islam',
      interests: ['قراءة', 'سفر', 'قراءة القرآن'],
      images: [],
      isPublic: true
    });
    await profile.save();
    console.log('✅ Created profile for user', user._id.toString());
  }

  return { user, profile };
};

const createSampleData = async (targetUser) => {
  const otherUserEmail = 'samplefemale@example.com';
  let otherUser = await User.findOne({ email: otherUserEmail });
  if (!otherUser) {
    otherUser = new User({
      name: 'Sample Match',
      email: otherUserEmail,
      password: 'Password123!',
      gender: 'female',
      age: 26,
      location: 'Riyadh',
      religion: 'Islam',
      status: 'approved',
      isEmailVerified: true,
      profileComplete: true
    });
    await otherUser.save();
    console.log('✅ Created sample user', otherUser.email);
  }

  let otherProfile = await Profile.findOne({ userId: otherUser._id });
  if (!otherProfile) {
    otherProfile = new Profile({
      userId: otherUser._id,
      age: 26,
      location: 'Riyadh',
      nationality: 'Saudi',
      tribe: 'Al-Rashid',
      education: 'Bachelor\'s Degree',
      height: 165,
      weight: 58,
      color: 'Fair',
      hair: 'Brown',
      appearanceDesc: 'سيدة ملتزمة تبحث عن رفيق حياة صالح.',
      preferences: ['دين', 'خلق'],
      bio: 'أبحث عن شريك حياة ملتزم ومتوازن.',
      religion: 'Islam',
      interests: ['قراءة', 'طبخ', 'سفر'],
      images: [],
      isPublic: true
    });
    await otherProfile.save();
    console.log('✅ Created profile for sample user', otherUser.email);
  }

  const messageCount = await Message.countDocuments({ senderId: targetUser._id, receiverId: otherUser._id });
  if (!messageCount) {
    const message = new Message({
      senderId: targetUser._id,
      receiverId: otherUser._id,
      content: 'مرحبا! أود التعرف عليك أكثر.',
      read: false
    });
    await message.save();
    console.log('✅ Created sample message between users');
  }

  const notificationCount = await Notification.countDocuments({ userId: targetUser._id });
  if (!notificationCount) {
    const notification = new Notification({
      userId: targetUser._id,
      title: 'مرحباً بك في توفيق',
      content: 'تم إنشاء حسابك بنجاح ويمكنك البدء بالبحث عن الشريك المناسب.'
    });
    await notification.save();
    console.log('✅ Created welcome notification for target user');
  }

  const contactCount = await Contact.countDocuments();
  if (!contactCount) {
    await Contact.create({
      name: 'زائر',
      email: 'visitor@example.com',
      subject: 'استفسار عن التطبيق',
      message: 'أرغب في معرفة كيفية استخدام التطبيق والتسجيل.'
    });
    console.log('✅ Created sample contact message');
  }

  const bannerCount = await Banner.countDocuments();
  if (!bannerCount) {
    await Banner.create({
      imageUrl: 'https://example.com/banner.jpg',
      title: 'مرحبا بكم في توفيق',
      description: 'ابدأ رحلتك للعثور على شريك حياتك الآن'
    });
    console.log('✅ Created sample banner');
  }
};

const run = async () => {
  try {
    await connect();
    await createAdmin();
    const { user } = await createUserWithProfile();
    await createSampleData(user);
    console.log('🎉 MongoDB seeding complete.');
  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();
