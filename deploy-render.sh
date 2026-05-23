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

# Step 2: Build client
echo -e "${BLUE}2. بناء الواجهة الأمامية...${NC}"
cd client
npm install
npm run build
cd ..
echo -e "${GREEN}✓ تم بناء العميل${NC}"

# Step 3: Check server dependencies
echo -e "${BLUE}3. التحقق من المتغيرات البيئية...${NC}"
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
echo "1. اذهب إلى: https://render.com"
echo "2. انشئ Web Service جديد وربط مستودعك"
echo "3. في Environment Variables أضف:"
echo "   - MONGO_URI"
echo "   - JWT_SECRET"
echo "   - EMAIL_USER و EMAIL_PASS"
echo "   - CLIENT_URL و CORS_ORIGIN"
echo ""
