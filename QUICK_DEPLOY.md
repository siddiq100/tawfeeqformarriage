# تعليمات البدء السريع - Render Deploy

## 1️⃣ تجهيز MongoDB Atlas (2 دقيقة)

```
1. اذهب: https://www.mongodb.com/cloud/atlas
2. Sign Up أو Log In
3. Create Project → Tawfeeq
4. Create Cluster → Free
5. انتظر 5 دقائق
6. Connect → Driver Node.js
7. انسخ الرابط: mongodb+srv://...
```

## 2️⃣ دفع للـ GitHub

```bash
cd c:\Users\dell\marriage
git add .
git commit -m "Production ready deployment"
git push origin main
```

## 3️⃣ نشر الخادم على Render

```
1. اذهب: https://render.com
2. Sign In with GitHub
3. New → Web Service
4. اختر: siddiq100/tawfeeqformarriage
5. Settings:
   - Name: tawfeeq-server
   - Build: cd server && npm install
   - Start: cd server && npm start
6. Advanced → Environment Variables:
```

```
MONGO_URI=mongodb+srv://youruser:yourpass@cluster0.abc.mongodb.net/tawfeeq?retryWrites=true&w=majority
JWT_SECRET=abcdefghijk1234567890abcdefghijk
EMAIL_USER=yourmail@gmail.com
EMAIL_PASS=yourapppassword
CLIENT_URL=https://tawfeeq-client.onrender.com
CORS_ORIGIN=https://tawfeeq-client.onrender.com
```

```
7. Create Web Service
8. انتظر النشر (~5 دقائق)
```

## 4️⃣ نشر الواجهة على Render

```
1. في Render dashboard
2. New → Static Site
3. اختر: siddiq100/tawfeeqformarriage
4. Settings:
   - Name: tawfeeq-client
   - Build: cd client && npm install && npm run build
   - Publish: client/build
5. Create Static Site
6. انتظر النشر (~3 دقائق)
```

## ✅ اختبر الموقع

- العميل: `https://tawfeeq-client.onrender.com`
- الخادم: `https://tawfeeq-server.onrender.com`
- API: `https://tawfeeq-server.onrender.com/api/auth/login`

## 🎯 في حالة الخطأ

- شيك الـ Logs في Render dashboard
- تأكد من MONGO_URI صحيح
- أضف IP 0.0.0.0/0 في MongoDB Atlas Network Access
