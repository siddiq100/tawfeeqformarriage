# تعليمات النشر الكامل - Tawfeeq للزواج

## 🚀 الخيارات المتاحة

### 1️⃣ النشر على Render (الأسهل والأسرع)

#### الخطوة 1: إعداد قاعدة البيانات MongoDB Atlas

1. اذهب إلى [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. أنشئ حساب مجاني أو سجل دخول
3. أنشئ مشروع جديد باسم "Tawfeeq"
4. أنشئ cluster بخطة FREE
5. انتظر إنشاء الـ cluster (5-10 دقائق)
6. اضغط على "Connect" → "Drivers" → اختر Node.js
7. انسخ رابط الاتصال: `mongodb+srv://username:password@cluster.mongodb.net/tawfeeq?retryWrites=true&w=majority`

#### الخطوة 2: رفع المشروع إلى GitHub

```bash
cd c:\Users\dell\marriage
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

#### الخطوة 3: نشر على Render

1. اذهب إلى [Render.com](https://render.com)
2. سجل دخول باستخدام حسابك على GitHub
3. اضغط على "New" → "Web Service"
4. اختر المستودع `siddiq100/tawfeeqformarriage`
5. ملأ المعلومات:
   - **Name**: `tawfeeq-server`
   - **Environment**: Node
   - **Build Command**: `cd server && npm install`
   - **Start Command**: `cd server && npm start`
6. اضغط على "Advanced" وأضف متغيرات البيئة:

```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/tawfeeq?retryWrites=true&w=majority
JWT_SECRET=your_very_secure_random_key_here_min_32_chars
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_specific_password
CLIENT_URL=https://tawfeeq-client.onrender.com
CORS_ORIGIN=https://tawfeeq-client.onrender.com
```

7. اضغط "Create Web Service" وانتظر النشر (5-10 دقائق)

#### الخطوة 4: نشر الواجهة الأمامية

1. في لوحة Render، اضغط "New" → "Static Site"
2. اختر نفس المستودع
3. ملأ المعلومات:
   - **Name**: `tawfeeq-client`
   - **Build Command**: `cd client && npm install && npm run build`
   - **Publish directory**: `client/build`
4. اضغط "Create Static Site"
5. بعد النشر، سيعطيك رابط عام مثل: `https://tawfeeq-client.onrender.com`

---

### 2️⃣ النشر على Docker (محلي أو VPS)

#### متطلبات:
- [Docker](https://www.docker.com/products/docker-desktop)
- [Docker Compose](https://docs.docker.com/compose/install/)

#### الخطوة 1: إنشاء ملف .env

```bash
# في جذر المشروع
cat > .env << EOF
MONGO_USER=admin
MONGO_PASSWORD=your_secure_password_here
JWT_SECRET=your_jwt_secret_key_here_min_32_chars
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_specific_password
EOF
```

#### الخطوة 2: تشغيل جميع الخدمات

```bash
# من جذر المشروع
docker-compose -f docker-compose.full.yml up -d

# التحقق من الحالة
docker-compose -f docker-compose.full.yml ps

# عرض السجلات
docker-compose -f docker-compose.full.yml logs -f
```

#### الخطوة 3: الوصول إلى الموقع

- العميل: http://localhost:3000
- الخادم: http://localhost:5000
- API Admin: http://localhost:5000/api/admin/login

---

### 3️⃣ النشر على Railway (بديل Render)

1. اذهب إلى [Railway.app](https://railway.app)
2. سجل دخول باستخدام GitHub
3. اضغط "New Project" → "Deploy from GitHub repo"
4. اختر `siddiq100/tawfeeqformarriage`
5. أضف متغيرات البيئة في صفحة Project Settings
6. Railway سينشر الخادم تلقائياً

---

### 4️⃣ النشر على Heroku (يتطلب كارت دائم الآن)

```bash
# تثبيت Heroku CLI
# ثم:
heroku login
heroku create tawfeeq-app
git push heroku main
heroku config:set MONGO_URI=your_mongodb_uri
# وهكذا...
```

---

## 🔧 متغيرات البيئة الكاملة

```
# قاعدة البيانات
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname

# الأمان
JWT_SECRET=your_secret_key_here_very_secure

# البريد الإلكتروني (لتفعيل الحسابات)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=app_specific_password

# المنصة
PORT=5000
CLIENT_URL=https://your_frontend_url
CORS_ORIGIN=https://your_frontend_url
```

---

## ✅ اختبار الموقع بعد النشر

### 1. تسجيل مستخدم جديد
```bash
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "الاسم",
  "gender": "male",
  "age": 25
}
```

### 2. دخول الإدارة
```bash
POST /api/admin/login
{
  "email": "siddiqa@tawfeeq.com",
  "password": "your_admin_password"
}
```

### 3. التحقق من المستخدمين
```bash
GET /api/admin/all-users
Headers: Authorization: Bearer {admin_token}
```

---

## 🆘 استكشاف الأخطاء

### الخادم لا يتصل بـ MongoDB
- تأكد من صحة `MONGO_URI`
- تأكد من سماح IPs في MongoDB Atlas (أضف 0.0.0.0/0)

### البريد الإلكتروني لا يعمل
- استخدم Gmail مع "App Passwords" وليس كلمة المرور الأساسية
- [إنشاء App Password](https://myaccount.google.com/apppasswords)

### CORS errors
- تأكد أن `CLIENT_URL` و `CORS_ORIGIN` متطابقة في البيئة

### الصور لا تُحفظ
- في Docker و Render: استخدم خدمة تخزين سحابية (S3, Cloudinary)
- بدلاً من حفظ محلي

---

## 📊 الأوامر المفيدة

```bash
# بناء الصور
docker build -f server.Dockerfile -t tawfeeq-server .

# تشغيل مع إعادة بناء
docker-compose -f docker-compose.full.yml up --build

# إيقاف الخدمات
docker-compose -f docker-compose.full.yml down

# إزالة كل شيء
docker-compose -f docker-compose.full.yml down -v
```

---

## 🎉 بعد النشر الناجح

1. استخدم رابط الموقع العام
2. سجل حساب جديد
3. تحقق من البريد الإلكتروني للتأكيد
4. ادخل كمسؤول استخدم البريد `siddiqa@tawfeeq.com`
5. ابدأ باستخدام المنصة!

---

**ملاحظة**: لأول مرة قد يستغرق النشر 10-15 دقيقة. بعد ذلك يكون أسرع.
