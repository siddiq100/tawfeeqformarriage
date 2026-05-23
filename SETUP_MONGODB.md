# 🚀 دليل الإعداد - توفيق للزواج مع MongoDB

## المتطلبات

1. **Node.js** - v14.0.0 أو أحدث
2. **MongoDB** - مركب محليًا أو حساب على MongoDB Atlas
3. **npm** - مدير الحزم

## 📥 خطوات الإعداد

### 1. تثبيت MongoDB

#### على Windows:
```bash
# قم بتحميل MongoDB من: https://www.mongodb.com/try/download/community
# واتبع المثبت التفاعلي
```

#### على macOS (مع Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

#### على Linux (Ubuntu):
```bash
sudo apt-get install -y mongodb
sudo service mongod start
```

#### أو استخدم MongoDB Atlas (سحابي):
1. اذهب إلى https://www.mongodb.com/cloud/atlas
2. أنشئ حساب مجاني
3. أنشئ cluster جديد
4. احصل على connection string

### 2. تحديث متغيرات البيئة

#### في `server/.env`:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tawfeeq
# أو للـ Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tawfeeq
JWT_SECRET=your_secret_key_here
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
ADMIN_EMAIL=admin@tawfeeq.com
ADMIN_PASSWORD=admin123
```

### 3. إنشاء حساب الإدارة

```bash
cd server
npm run seed
```

### 4. تثبيت المكتبات

```bash
cd server
npm install

cd ../client
npm install
```

### 5. تشغيل التطبيق

**النافذة 1 - الخادم:**
```bash
cd server
npm run dev
```

**النافذة 2 - العميل:**
```bash
cd client
npm start
```

## 🔐 استخدام النظام

### حساب الإدارة (Admin)

**عنوان URL:** `http://localhost:3000/admin`

**بيانات الدخول الافتراضية:**
- البريل: `admin@tawfeeq.com`
- كلمة المرور: `admin123`

### عملية التسجيل

1. **المستخدم** يسجل حساب جديد عبر صفحة التسجيل
2. الحساب يُنشأ بحالة **"قيد الانتظار"** (pending)
3. **الإدارة** تدخل لوحة التحكم وتراجع الحسابات المعلقة
4. الإدارة تقبل أو ترفض الحساب
5. **المستخدم** يمكنه تسجيل الدخول فقط بعد الموافقة

## 📊 حالات الحسابات

- 🔄 **Pending** - في انتظار موافقة الإدارة
- ✅ **Approved** - تم الموافقة، يمكن تسجيل الدخول
- ❌ **Rejected** - تم الرفض

## 🛠️ إعادة تعيين البيانات

لحذف جميع البيانات والبدء من جديد:

```bash
# في MongoDB:
use tawfeeq
db.dropDatabase()

# ثم إعادة تشغيل:
npm run seed
```

## 🐛 استكشاف الأخطاء

### خطأ: "Cannot connect to MongoDB"
- تأكد من تشغيل MongoDB
- تحقق من `MONGODB_URI` في `.env`
- جرب الاتصال باستخدام: `mongodb://localhost:27017`

### خطأ: "Admin login failed"
- تأكد من تشغيل seed: `npm run seed`
- تحقق من `ADMIN_EMAIL` و `ADMIN_PASSWORD` في `.env`

### خطأ: "User cannot login despite approval"
- تأكد من أن حالة الحساب = "approved"
- افحص tokens في localStorage

## 📝 تسجيل الدخول للعميل

بعد الموافقة من الإدارة:
1. اذهب إلى `/login`
2. أدخل البريد الإلكتروني وكلمة المرور
3. سيتم إنشاء JWT token
4. الوصول محمي - يتطلب token صالح

## 🚀 للإنتاج

قبل النشر:

1. **تغيير بيانات الإدارة الافتراضية:**
```bash
ADMIN_EMAIL=your_real_email@example.com
ADMIN_PASSWORD=strong_password_here
```

2. **استخدام MongoDB Atlas (سحابي):**
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tawfeeq?retryWrites=true&w=majority
```

3. **تعيين JWT_SECRET قوي:**
```bash
JWT_SECRET=random_strong_secret_key_32_chars_or_more
```

4. **تفعيل HTTPS وتحديث CORS:**
```bash
CORS_ORIGIN=https://yourdomain.com
```

## 📞 تحتاج للمساعدة؟

- اتصل بنا عبر: support@tawfeeq.com
- أو زر الموقع: https://tawfeeq.com

---

**آخر تحديث:** مايو 2024
**النسخة:** 2.0.0 (مع MongoDB)
