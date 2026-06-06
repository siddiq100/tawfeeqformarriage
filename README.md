# Tawfeeq - Full Project (Ready for GitHub)

نسخة جاهزة لرفع المشروع على GitHub وتشغيله محلياً أو عبر Docker.

## محتويات المستودع
- `client/` - تطبيق React (واجهة المستخدم)
- `server/` - خادم Node/Express (API)
- `docker-compose.yml` - لتشغيل التطبيق بقاعدة بيانات MongoDB محلية باستخدام Docker
- `server/Dockerfile` و `client/Dockerfile` - تعريفات بناء الحاويات

## نشر مباشر على Render
يمكنك نشر هذا المشروع مباشرة إلى Render باستخدام ملف `render.yaml` الموجود في جذر المشروع.

1. تأكد من أنك قد دفعت الكود إلى GitHub على الفرع `main`.
2. في Render أنشئ خدمة `Web Service` جديدة مرتبطة بالمستودع.
   - Build command: `cd server && npm install`
   - Start command: `cd server && npm start`
   - Branch: `main`
   - Health check path: `/api/health`
3. أضف متغيرات البيئة في Render:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `EMAIL_HOST`
   - `EMAIL_PORT`
   - `EMAIL_USER`
   - `EMAIL_PASS`
   - `EMAIL_FROM`
   - `CLIENT_URL = https://<your-service>.onrender.com`
   - `CORS_ORIGIN = https://<your-service>.onrender.com`
4. بعد النشر، سيعمل الموقع من خلال نفس الخادم ولن تحتاج واجهة React المنفصلة.

> إذا أردت نشرًا تلقائيًا من GitHub، أضف أسرار GitHub التالية في إعدادات المستودع:
> - `RENDER_SERVICE_ID` (الـ service id من Render)
> - `RENDER_API_KEY` (Render API key)
>
> يمكنك أيضًا تشغيل النشر يدويًا من صفحة Actions عبر زر `Run workflow` في `Deploy to Render`.
>
> ثم استخدم وِرْك فْلُو `.github/workflows/deploy-render.yml` لنشر كل دفعة إلى Render.

## تشغيل محلي (بدون Docker)
1. تثبيت الخادم:

```bash
cd server
npm install
```

2. إعداد متغيرات البيئة (`.env`) داخل `server/` مثل:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/tawfeeq
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
```

3. تشغيل الخادم:

```bash
npm run dev
```

4. تثبيت و تشغيل الواجهة:

```bash
cd ../client
npm install
npm start
```

## تشغيل باستخدام Docker (موصى به للنسخة المنشورة)
تأكد من تثبيت Docker و Docker Compose.

1. انسخ مثال المتغيرات:

```bash
cp .env.example .env
# ثم عدل القيم داخل .env
```

2. شغل الحاويات:

```bash
docker-compose up --build
```

- الواجهة ستعمل على: `http://localhost:3000`
- الخادم على: `http://localhost:5000`

## رفع إلى GitHub
1. أنشئ مستودعاً جديداً على GitHub.
2. أضف المستودع البعيد وادفع (push):

```bash
git init
git add .
git commit -m "Initial commit - ready for deployment"
git remote add origin git@github.com:USERNAME/REPO.git
git push -u origin main
```

3. نشر: يمكنك استخدام أحد الخيارات:
- Vercel (لواجهة React) + Render/Heroku/Render.com (لـ API)
- أو استخدام Docker images و GitHub Actions/Container Registry ثم نشر على أي مزود يدعم الحاويات.

## ملاحظات أمنية
- لا ترفع `.env` إلى GitHub. استخدم `Secrets` في GitHub Actions أو إعدادات البيئة في منصة الاستضافة.

## ملفات مهمة أضفتها
- `.env.example` — مثال لمتغيرات البيئة
- `docker-compose.yml` — لتشغيل client/server/mongo
- `server/Dockerfile`, `client/Dockerfile` — لبناء الحاويات
- `.gitignore`, `LICENSE`.

إذا أردت أجهز لك GitHub Actions لنشر تلقائي أو أضبط إعدادات لنشر الواجهة على GitHub Pages أو Vercel أخبرني وأفعله.
# 💍 توفيق للزواج - Tawfeeq Marriage Matching Platform

منصة ويب حديثة وآمنة للبحث عن شريك الحياة والزواج مع نظام تفعيل حسابات من الإدارة. تجمع المستخدمين ذوي الأهداف المشتركة في بيئة موثوقة وآمنة تماماً.

## ✨ الميزات الرئيسية

- 🔐 **تسجيل وتسجيل دخول آمن** - حماية كاملة للبيانات الشخصية
- ✅ **نظام تفعيل حسابات** - جميع الحسابات تحتاج موافقة من الإدارة
- 👤 **ملفات شخصية شاملة** - أضف صورك واهتماماتك ومعلوماتك
- 🔍 **بحث وتصفية متقدمة** - ابحث عن شريك مع معايير محددة
- 💬 **رسائل خاصة** - تواصل مباشر مع أشخاص مهتمين
- 🖼️ **معرض صور** - عرض الصور بشكل احترافي
- 📞 **نموذج اتصال** - تواصل مع فريق الدعم
- 🌐 **واجهة باللغة العربية** - سهلة الاستخدام للجميع
- 🔐 **MongoDB Database** - قاعدة بيانات قوية وموثوقة

## 🛠️ التقنيات المستخدمة

### الواجهة الأمامية (Frontend)
- React 18
- React Router
- Axios
- CSS3

### الواجهة الخلفية (Backend)
- Node.js
- Express.js
- CORS

### قاعدة البيانات
- **MongoDB** - قاعدة بيانات NoSQL (مركبة محليًا أو Atlas سحابية)
- Mongoose - ODM للتعامل مع MongoDB
- bcryptjs - تشفير كلمات المرور
- JWT - المصادقة الآمنة

## 🚀 البدء السريع

### متطلبات البيئة
- Node.js 14+
- npm أو yarn
- **MongoDB** (مركب محليًا أو حساب على Atlas)

### خطوات التثبيت السريعة

```bash
# 1. تثبيت MongoDB
# Windows: https://www.mongodb.com/try/download/community
# macOS: brew install mongodb-community && brew services start mongodb-community
# Linux: sudo apt-get install mongodb

# 2. استنساخ وإعداد المشروع
cd marriage

# 3. تحديث متغيرات البيئة
cp server/.env.example server/.env
# تحرير server/.env وتحديث MONGODB_URI إذا لزم

# 4. إنشاء حساب الإدارة
cd server
npm install
npm run seed  # هام جداً!

# 5. تثبيت العميل
cd ../client
npm install
```

### تشغيل التطبيق

**النافذة الأولى - الخادم:**
```bash
cd server
npm run dev
# الخادم يعمل على http://localhost:5000
```

**النافذة الثانية - الواجهة الأمامية:**
```bash
cd client
npm start
# التطبيق يفتح على http://localhost:3000
```

**الدخول للإدارة:**
- الرابط: http://localhost:3000/admin
- البريد: admin@tawfeeq.com
- كلمة المرور: admin123

📖 **راجع [SETUP_MONGODB.md](./SETUP_MONGODB.md) للتفاصيل الكاملة**

## 📁 هيكل المشروع

```
marriage/
├── server/                 # الواجهة الخلفية
│   ├── controllers/       # منطق التحكم
│   ├── models/            # نماذج قاعدة البيانات
│   ├── routes/            # المسارات والنقاط النهائية
│   ├── middleware/        # البرامج الوسيطة
│   ├── utils/             # أدوات مساعدة
│   ├── server.js          # ملف الخادم الرئيسي
│   └── package.json
│
├── client/                # الواجهة الأمامية
│   ├── src/
│   │   ├── components/    # المكونات
│   │   ├── pages/         # الصفحات
│   │   ├── context/       # سياق React
│   │   ├── utils/         # أدوات مساعدة
│   │   ├── App.jsx        # التطبيق الرئيسي
│   │   ├── App.css        # الأنماط
│   │   └── index.jsx      # نقطة الدخول
│   ├── public/
│   │   └── index.html
│   └── package.json
│
└── README.md
```

## � نظام تفعيل الحسابات

### كيفية العملية

```
المستخدم الجديد
      ↓
يسجل حساب جديد
      ↓
الحساب في حالة "قيد الانتظار" (Pending)
      ↓
الإدارة تراجع الحساب
      ↓
✅ قبول أو ❌ رفض
      ↓
يمكن للمستخدم تسجيل الدخول (في حالة القبول فقط)
```

### حالات الحساب

- 🔄 **Pending** - في انتظار موافقة الإدارة
- ✅ **Approved** - تم الموافقة، يمكن تسجيل الدخول
- ❌ **Rejected** - تم الرفض، لا يمكن الدخول

### لوحة التحكم الإدارية

الإدارة لديها صفحة خاصة تعرض:
- قائمة بجميع الحسابات المعلقة
- معلومات كل مستخدم (الاسم، البريل، النوع، التاريخ)
- زرين: ✅ قبول و ❌ رفض لكل حساب

---

## �🔧 الواجهات المتاحة (API Endpoints)

### المصادقة
- `POST /api/auth/register` - تسجيل حساب جديد
- `POST /api/auth/login` - تسجيل دخول

### الملفات الشخصية
- `GET /api/profiles` - الحصول على قائمة الملفات
- `POST /api/profiles` - إنشاء ملف شخصي
- `GET /api/profiles/:id` - الحصول على ملف شخصي
- `PUT /api/profiles/:id` - تحديث الملف الشخصي

### الرسائل
- `POST /api/messages` - إرسال رسالة
- `GET /api/messages/:userId` - الحصول على الرسائل

### التواصل
- `POST /api/contact` - إرسال رسالة تواصل

## 👥 كيفية الاستخدام

### 1. إنشاء حساب
- انقر على "تسجيل" من الصفحة الرئيسية
- أدخل بياناتك الشخصية
- اكمل ملفك الشخصي

### 2. البحث والاستكشاف
- انقر على "استكشف"
- استخدم الفلاتر للبحث عن شريك مناسب
- شاهد الملفات الشخصية

### 3. التواصل
- أرسل رسالة لشخص مهتم
- ردود الرسائل ستظهر في قسم "الرسائل"
- استمتع بالتواصل!

## 🔐 الأمان والخصوصية

- جميع البيانات تُشفّر بشكل آمن
- سياسة خصوصية صارمة
- عدم مشاركة البيانات مع طرف ثالث
- التحقق من الهوية قبل النشر

## 📝 متطلبات المتصفح

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🐛 حل المشاكل

### الخادم لا يعمل
```bash
# تأكد من تثبيت Node.js
node --version

# أعد تثبيت المكتبات
rm -rf node_modules
npm install
npm run dev
```

### العميل لا يحميل
```bash
# تأكد من عمل الخادم على المنفذ 5000
# مسح ذاكرة المتصفح (Cache)
# إعادة تحديث الصفحة Ctrl+Shift+R
```

### خطأ في الاتصال
- تأكد من متغيرات البيئة `.env`
- تأكد من عمل الخادم
- تحقق من الأخطاء في console

## 📞 الدعم والمساعدة

للحصول على الدعم:
- 📧 البريد: support@marriage-app.com
- 📱 الهاتف: +20 100 000 0000
- 🕐 ساعات العمل: السبت - الخميس، 9:00 ص - 9:00 م

## 📄 الترخيص

هذا المشروع مرخص بموجب MIT License

## 🙏 شكر وتقدير

شكراً لاستخدام منصة الزواج. نتمنى لك قصة حب جميلة! ❤️

---

**آخر تحديث:** مايو 2024
**الإصدار:** 1.0.0
"# tawfeeqformarriage" 
