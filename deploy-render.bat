@echo off
REM Render Deployment Script for Windows

echo.
echo 🚀 تحضير النشر على Render...
echo.

REM Step 1: Build client
echo 1. بناء الواجهة الأمامية...
cd client
call npm install
call npm run build
cd ..
echo ✓ تم بناء العميل
echo.

REM Step 2: Check server dependencies
echo 2. التحقق من المتغيرات البيئية...
if not exist .env (
    echo ✗ لم نجد ملف .env
    echo انسخ .env.example إلى .env وملأ القيم
    exit /b 1
)
echo ✓ ملف .env موجود
echo.

REM Step 3: Push to GitHub
echo 3. رفع التغييرات إلى GitHub...
git add .
git commit -m "Deploy to Render - %date%" 2>nul || echo (already committed)
git push origin main
echo ✓ تم الرفع إلى GitHub
echo.

echo ✅ تم التحضير!
echo.
echo الخطوات التالية:
echo 1. اذهب إلى: https://render.com
echo 2. انشئ Web Service جديد وربط مستودعك
echo 3. في Environment Variables أضف متغيرات من .env
echo.
pause
