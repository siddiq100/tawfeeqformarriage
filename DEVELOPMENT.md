# منصة الزواج - وثائق التطوير

## نظرة عامة

هذا مشروع تطبيق ويب لمنصة زواج متكاملة تستخدم React في الواجهة الأمامية و Node.js/Express في الواجهة الخلفية.

## المتطلبات

- Node.js v14.0.0 أو أحدث
- npm v6.0.0 أو أحدث
- مدير قاعدة بيانات MongoDB (للإنتاج)

## التثبيت والإعداد

### الخطوة 1: تثبيت الخادم

```bash
cd server
npm install
```

أنشئ ملف `.env` برمز السري الخاص بك:
```
PORT=5000
JWT_SECRET=your_secret_key
MONGODB_URI=mongodb://localhost:27017/marriage-app
```

### الخطوة 2: تشغيل الخادم

```bash
npm run dev
```

### الخطوة 3: تثبيت العميل

```bash
cd ../client
npm install
```

### الخطوة 4: تشغيل العميل

```bash
npm start
```

## هيكل المشروع

### الخادم (Server)
- `routes/` - تعريفات المسارات
- `controllers/` - منطق معالجة الطلبات
- `models/` - نماذج البيانات (قابلة للتوسع مع MongoDB)
- `middleware/` - البرامج الوسيطة
- `utils/` - دوال مساعدة

### العميل (Client)
- `src/pages/` - صفحات التطبيق
- `src/components/` - مكونات React
- `src/context/` - إدارة الحالة
- `src/utils/` - أدوات وخدمات

## ميزات الواجهات (API)

### المصادقة
```
POST /api/auth/register
Body: { email, password, name, gender }

POST /api/auth/login
Body: { email, password }
```

### الملفات الشخصية
```
GET /api/profiles?location=&ageMin=&ageMax=
POST /api/profiles
Body: { userId, age, location, bio, religion, interests, images }

GET /api/profiles/:id
PUT /api/profiles/:id
Body: { age, location, bio, interests }
```

### الرسائل
```
POST /api/messages
Body: { senderId, receiverId, content }

GET /api/messages/:userId
```

## الميزات الحالية

✅ تسجيل وتسجيل دخول
✅ إنشاء وتحديث الملفات الشخصية
✅ البحث والتصفية
✅ الرسائل الخاصة
✅ نموذج الاتصال

## الميزات المستقبلية

- [ ] المصادقة متعددة العوامل
- [ ] نظام التقييم والمراجعات
- [ ] خاصية الإشعارات
- [ ] تحميل الصور المتقدم
- [ ] الدفع والاشتراكات
- [ ] تطبيق الهاتف المحمول

## المشاكل الشائعة والحل

### خطأ في الاتصال بالخادم

**المشكلة:** العميل لا يتصل بالخادم

**الحل:**
1. تأكد من تشغيل الخادم على المنفذ 5000
2. تحقق من متغير `REACT_APP_API_URL` في `.env`
3. افحص console للأخطاء

### CORS Error

**المشكلة:** خطأ في الوصول الموارد المشتركة

**الحل:**
```javascript
// في الخادم، تأكد من تكوين CORS صحيح
app.use(cors({
  origin: 'http://localhost:3000'
}));
```

## قواعد التطوير

- استخدم async/await بدلاً من callbacks
- أضف معالجة الأخطاء في جميع الطلبات
- كتابة تعليقات واضحة للدوال المعقدة
- اختبر الواجهات قبل الدمج

## ملاحظات مهمة

✅ هذا الإصدار يستخدم MongoDB لتخزين بيانات المستخدمين والحسابات والملفات الشخصية والرسائل
✅ كلمات المرور تُشفّر الآن باستخدام bcryptjs
✅ يتم استخدام JWT للمصادقة وحماية المسارات

## للإنتاج

قبل النشر:
1. استبدل in-memory storage بـ MongoDB
2. استخدم bcrypt لتشفير كلمات المرور
3. أضف JWT للمصادقة
4. قم ببناء React: `npm run build`
5. استخدم خادم الإنتاج مثل Nginx

## المساهمة

نرحب بالمساهمات! يرجى:
1. عمل fork للمشروع
2. إنشاء branch جديد
3. إضافة التحسينات
4. عمل pull request

---

تم الإنشاء: مايو 2024
