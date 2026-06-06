#!/bin/bash

# Render Deployment Script
# This script helps prepare and deploy the app to Render

set -e

echo "🚀 تحضير النشر على Render..."

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check if git is clean
echo -e "${BLUE}1. التحقق من حالة Git...${NC}"
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}✗ هناك تغييرات غير محفوظة${NC}"
    echo "استخدم: git add . && git commit -m 'message'"
    exit 1
fi
echo -e "${GREEN}✓ Git نظيف${NC}"

# Step 2: Ensure server and static site are ready
echo -e "${BLUE}2. تثبيت تبعيات الخادم...${NC}"
cd server
npm install
cd ..
echo -e "${GREEN}✓ تم تثبيت تبعيات الخادم${NC}"

echo -e "${BLUE}3. التحقق من وجود موقع static الجديد...${NC}"
if [ ! -d newproject ]; then
    echo -e "${RED}✗ لم نجد مجلد newproject${NC}"
    echo "تأكد أن الموقع الثابت موجود في مجلد newproject/"
    exit 1
fi

echo -e "${GREEN}✓ مجلد newproject موجود${NC}"

# Step 4: Check server environment variables
echo -e "${BLUE}4. التحقق من المتغيرات البيئية...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}✗ لم نجد ملف .env${NC}"
    echo "انسخ .env.example إلى .env وملأ القيم:"
    echo "cp .env.example .env"
    exit 1
fi
echo -e "${GREEN}✓ ملف .env موجود${NC}"

# Step 4: Push to GitHub
echo -e "${BLUE}4. رفع التغييرات إلى GitHub...${NC}"
git add .
git commit -m "Deploy to Render - $(date +%Y-%m-%d)" || true
git push origin main
echo -e "${GREEN}✓ تم الرفع إلى GitHub${NC}"

echo ""
echo -e "${GREEN}✅ تم التحضير!${NC}"
echo ""
echo "الخطوات التالية:"
echo "1. ادفع الكود إلى GitHub إذا لم تفعل بعد."
echo "2. افتح https://render.com وأنشئ Web Service جديدًا مرتبطًا بالمستودع."
echo "   - Build command: cd server && npm install"
echo "   - Start command: cd server && npm start"
echo "3. أضف متغيرات البيئة في Render:"
echo "   - MONGO_URI"
echo "   - JWT_SECRET"
echo "   - EMAIL_HOST"
echo "   - EMAIL_PORT"
echo "   - EMAIL_USER"
echo "   - EMAIL_PASS"
echo "   - EMAIL_FROM"
echo "   - CLIENT_URL = https://<your-service>.onrender.com"
echo "   - CORS_ORIGIN = https://<your-service>.onrender.com"
echo "4. تأكد أن الخدمة تستخدم فرع main."
echo ""
echo "بعد الإنشاء، سيرفر Render سيخدم الموقع الثابت من newproject/ تلقائيًا."
echo ""