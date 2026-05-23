# نشر HTML ثابت

إذا كنت تريد نشر النسخة كـ HTML ثابتة (بدون خادم Node.js)، اتبع الخطوات التالية:

## الخيار 1: بناء React وتحميل على GitHub Pages

### الخطوات:

1. **بناء التطبيق**:
```bash
cd client
npm run build
```

سيتم إنشاء مجلد `build/` يحتوي على جميع ملفات HTML و CSS و JavaScript الثابتة.

2. **تحميل على GitHub Pages**:
   - انسخ محتوى مجلد `build/` 
   - أنشئ branch جديد باسم `gh-pages`
   - ارفع ملفات `build/` إلى هذا الـ Branch
   - فعّل GitHub Pages من Settings الخاص بـ Repository

3. **التحديثات**:
   - كلما أردت تحديث النسخة المنشورة، قم بـ build جديد ورفع ملفات `build/` الجديدة

## الخيار 2: استخدام Netlify (موصى به)

### الخطوات:

1. اذهب إلى https://netlify.com
2. اختر "New site from Git"
3. ربط مستودع GitHub
4. اعدادات النشر:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/build`
5. انشر تلقائياً!

## الخيار 3: استخدام Vercel (الأفضل)

### الخطوات:

1. اذهب إلى https://vercel.com
2. اختر "New Project"
3. ربط مستودعك
4. اختر `client` كـ root directory
5. يتعامل Vercel مع الباقي تلقائياً

## ملاحظات مهمة

- ملفات `build/` لا تحتاج إلى خادم Node.js للتشغيل
- يمكن تشغيلها على أي استضافة ويب عادية
- التطبيق سيحتاج إلى اتصال بـ API (الخادم) للعمل بالكامل
- إذا أردت API محلي، استخدم Docker Compose

## التحقق من النسخة المبنية

لاختبار النسخة المبنية محلياً:

```bash
cd client
npm install -g serve
serve -s build
```

ثم اذهب إلى: http://localhost:3000
