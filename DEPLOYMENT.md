# دليل النشر والاستضافة

هذا الدليل يشرح كيفية نشر مشروع Tawfeeq على منصات مختلفة.

## جدول المحتويات
1. [نشر محلي مع Docker](#نشر-محلي-مع-docker)
2. [نشر على Vercel (الواجهة)](#نشر-الواجهة-على-vercel)
3. [نشر على Render (الخادم)](#نشر-الخادم-على-render)
4. [نشر على Railway](#نشر-على-railway)
5. [نشر على Digital Ocean](#نشر-على-digital-ocean)

---

## نشر محلي مع Docker

### المتطلبات:
- Docker و Docker Compose مثبتة

### الخطوات:

```bash
# 1. انسخ ملف المتغيرات
cp .env.example .env

# 2. عدل المتغيرات حسب احتياجاتك
nano .env

# 3. شغل التطبيق
docker-compose up --build

# 4. الوصول للتطبيق
# - الواجهة: http://localhost:3000
# - الخادم: http://localhost:5000
# - MongoDB: localhost:27017
```

---

## نشر الواجهة على Vercel

### الخطوات:

1. **أنشئ حساب على Vercel**: https://vercel.com

2. **ربط مستودع GitHub**:
   - اذهب إلى Vercel
   - اختر "New Project"
   - اختر مستودعك من GitHub

3. **إعدادات البناء**:
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **متغيرات البيئة**:
   - أضف متغير: `REACT_APP_API_URL` = عنوان API الخادم (مثل: https://your-api.onrender.com)

5. **انشر**: Vercel سينشر تلقائياً عند كل push

---

## نشر الخادم على Render

### الخطوات:

1. **أنشئ حساب على Render**: https://render.com

2. **أنشئ Web Service جديد**:
   - اختر "New +"
   - اختر "Web Service"
   - ربط مستودع GitHub

3. **إعدادات البناء**:
   - Name: `tawfeeq-server`
   - Runtime: `Node`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **متغيرات البيئة**:
   ```
   PORT=5000
   MONGO_URI=<من MongoDB Atlas - رابط التوصيل>
   JWT_SECRET=<مفتاح سري آمن>
   EMAIL_USER=<بريدك الإلكتروني>
   EMAIL_PASS=<كلمة مرور التطبيق>
   CLIENT_URL=<عنوان الواجهة من Vercel>
   ```

5. **قاعدة البيانات**: استخدم MongoDB Atlas (مجاني للبداية)
   - اذهب إلى https://www.mongodb.com/cloud/atlas
   - أنشئ cluster مجاني
   - احصل على رابط التوصيل

6. **انشر**: Render سينشر تلقائياً

---

## نشر على Railway

### الخطوات:

1. **أنشئ حساب على Railway**: https://railway.app

2. **ربط GitHub**:
   - اختر "New Project"
   - اختر "Deploy from GitHub repo"

3. **إعدادات Railway**:
   - أضف ملف `railway.json` في جذر المشروع:
   ```json
   {
     "build": {
       "builder": "nixpacks"
     },
     "deploy": {
       "numReplicas": 1,
       "sleepApplication": false
     }
   }
   ```

4. **متغيرات البيئة**: أضفها عبر لوحة تحكم Railway

5. **انشر**: Railway سينشر تلقائياً

---

## نشر على Digital Ocean

### الخطوات:

1. **أنشئ حساب على Digital Ocean**: https://www.digitalocean.com

2. **أنشئ Droplet**:
   - اختر Ubuntu 22.04
   - Shared CPU، Basic، $5/شهر يكفي للبداية
   - اختر منطقة قريبة

3. **تثبيت المتطلبات**:
```bash
ssh root@your_droplet_ip

# تحديث النظام
apt update && apt upgrade -y

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs

# تثبيت MongoDB
curl -fsSL https://www.mongodb.org/static/pgp/server-5.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-5.0.list
apt update && apt install -y mongodb-org

# تثبيت Docker و Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

4. **استنساخ المستودع**:
```bash
cd /home && git clone https://github.com/yourusername/repo.git marriage-app
cd marriage-app
```

5. **نسخ وتعديل المتغيرات**:
```bash
cp .env.example .env
nano .env
```

6. **تشغيل التطبيق**:
```bash
docker-compose up -d
```

7. **إضافة Nginx كـ Reverse Proxy** (اختياري):
```bash
apt install nginx -y

# عدل /etc/nginx/sites-available/default:
# أضف server block للواجهة والخادم
```

8. **شهادة SSL مع Let's Encrypt** (موصى به):
```bash
apt install certbot python3-certbot-nginx -y
certbot certonly --nginx -d yourdomain.com
```

---

## إعدادات إضافية

### MongoDB Atlas (قاعدة البيانات السحابية)

1. اذهب إلى https://www.mongodb.com/cloud/atlas
2. أنشئ حساب مجاني
3. أنشئ cluster جديد
4. انسخ رابط التوصيل
5. استخدمه في متغيرات البيئة MONGO_URI

### بريد إلكتروني (Gmail)

1. فعّل "2-Step Verification" في حسابك
2. أنشئ "App Password": https://myaccount.google.com/apppasswords
3. استخدم كلمة المرور في EMAIL_PASS

---

## نصائح أمنية

1. **لا تنشر `.env`** - استخدم Secrets في منصة الاستضافة
2. **غيّر `JWT_SECRET`** إلى قيمة عشوائية آمنة طويلة
3. **استخدم HTTPS** دائماً في الإنتاج
4. **راقب السجلات** بانتظام
5. **عمل نسخ احتياطية** من قاعدة البيانات

---

## استكشاف الأخطاء

### الخادم لا يتصل بـ MongoDB
- تأكد من أن `MONGO_URI` صحيح
- تأكد من أن عنوان IP معاد في MongoDB Atlas

### الواجهة لا تتصل بالخادم
- تأكد من `REACT_APP_API_URL` في Vercel
- تأكد من تفعيل CORS في الخادم

### المشاكل مع Docker
```bash
# عرض السجلات
docker-compose logs

# إعادة تشغيل
docker-compose restart

# حذف وإعادة بناء
docker-compose down
docker-compose up --build
```

---

للمساعدة، اتصل بـ: support@tawfeeq.com
