# دليل البدء السريع 🚀

## المتطلبات الأساسية

- Node.js v14 أو أحدث
- npm أو yarn
- متصفح ويب حديث

## التثبيت والتشغيل في 3 دقائق

### 1. نسخ المتغيرات البيئية

**الخادم:**
```bash
cd server
cp .env.example .env
```

**العميل:**
```bash
cd ../client
cp .env.example .env
```

### 2. تثبيت المكتبات

**الخادم:**
```bash
cd server
npm install
```

**العميل:**
```bash
cd ../client
npm install
```

### 3. تشغيل التطبيق

**في نافذة واحدة (الخادم والعميل معاً):**
```bash
npm run dev
```

أو **في نافذتين منفصلتين:**

النافذة 1 - الخادم:
```bash
cd server
npm run dev
```

النافذة 2 - العميل:
```bash
cd client
npm start
```

### 4. الوصول إلى التطبيق

- 🌐 الواجهة الأمامية: http://localhost:3000
- 🔌 الخادم: http://localhost:5000

## أول خطوات

1. **سجل حساب جديد** على http://localhost:3000/register
2. **أكمل ملفك الشخصي** بذهابك إلى صفحة Profile
3. **ابحث عن شريك** في صفحة Browse
4. **أرسل رسائل** للأشخاص المهتمين

## حسابات تجريبية

اختبر البتطبيق بهذه البيانات:

### مستخدم 1:
- البريد: user1@example.com
- كلمة المرور: password123

### مستخدم 2:
- البريد: user2@example.com
- كلمة المرور: password123

## المشاكل الشائعة

### ❌ خطأ: "Could not connect to server"
**الحل:** تأكد من تشغيل الخادم على المنفذ 5000

```bash
cd server
npm run dev
```

### ❌ خطأ: PORT already in use
**الحل:** غير المنفذ في ملف `.env`

```
PORT=5001  # استخدم منفذ مختلف
```

### ❌ خطأ: Module not found
**الحل:** أعد تثبيت المكتبات

```bash
rm -rf node_modules
npm install
```

## الملفات المهمة

```
marriage/
├── server/
│   ├── server.js          ← الخادم الرئيسي
│   ├── .env.example       ← نموذج المتغيرات
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── App.jsx        ← التطبيق الرئيسي
│   │   ├── index.jsx      ← نقطة الدخول
│   │   ├── pages/         ← الصفحات الرئيسية
│   │   └── context/       ← إدارة الحالة
│   ├── .env.example
│   └── package.json
│
├── README.md              ← دليل المشروع
├── DEVELOPMENT.md         ← وثائق التطوير
└── QUICK_START.md        ← هذا الملف
```

## الخطوات التالية

بعد التشغيل الناجح:

1. **اقرأ الوثائق الكاملة** في `README.md`
2. **استكشف واجهات API** في `DEVELOPMENT.md`
3. **ابدأ التطوير** بإضافة ميزات جديدة

## الموارد الإضافية

- 📚 [وثائق React](https://react.dev)
- 📚 [وثائق Express.js](https://expressjs.com)
- 📚 [وثائق Node.js](https://nodejs.org/docs)
- 💬 [Stack Overflow](https://stackoverflow.com/questions/tagged/react+express)

## تحتاج للمساعدة؟

اتصل بنا:
- 📧 البريد: support@marriage-app.com
- 📱 الهاتف: +20 100 000 0000
- 🔗 الموقع: https://marriage-app.com

---

**تم تحديثه:** مايو 2024
**الحالة:** جاهز للاستخدام ✅
