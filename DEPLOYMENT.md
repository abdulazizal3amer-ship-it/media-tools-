# نشر روّج (Deployment)

## الطريقة الموصى بها: Railway (استضافة + قاعدة بيانات في مكان واحد)

1. اذهب إلى [railway.com](https://railway.com) وسجّل دخول بحساب GitHub.
2. **New Project** → **Deploy from GitHub repo** → اختر `media-tools-`
   وفرع `claude/quick-marketing-discounts-idd2mp`.
3. داخل نفس المشروع: **+ New** → **Database** → **Add PostgreSQL**.
   يُنشئ Railway خدمة قاعدة بيانات منفصلة تلقائياً بمتغيّر
   `DATABASE_URL` خاص بها.
4. افتح خدمة التطبيق (الـ repo) → تبويب **Variables** → أضف:
   - `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` (مرجع لقاعدة البيانات
     التي أنشأتها في الخطوة السابقة — اكتبها بالضبط هكذا، Railway يفهمها
     كمرجع تلقائي بين الخدمتين)
   - `SESSION_SECRET` = نص عشوائي طويل (شغّل `openssl rand -base64 32`
     محلياً وانسخ الناتج)
   - `META_APP_ID`, `META_APP_SECRET` إن كانت متوفرة لديك
   - `META_REDIRECT_URI` = اتركها فارغة الآن، وبعد أول نشر ستحصل على
     دومين مثل `xxx.up.railway.app` — عدّلها حينها إلى
     `https://<الدومين>/api/integrations/meta/callback`
   - باقي المتغيرات (`WHATSAPP_*`, إلخ) حسب توفرها
5. Railway يكتشف أنه مشروع Next.js تلقائياً (عبر Nixpacks) ويشغّل
   `npm install` ثم `npm run build` ثم `npm run start`.
   - `postinstall` يشغّل `prisma generate` تلقائياً أثناء التثبيت.
   - `npm run start` يشغّل `prisma migrate deploy` ثم تعبئة الباقات
     (`tsx prisma/seed.ts`) قبل بدء الخادم — أي أن قاعدة البيانات تُحدَّث
     وتُعبَّأ تلقائياً في كل نشر، بدون خطوة يدوية.
6. من تبويب **Settings → Networking** فعّل **Generate Domain** للحصول على
   رابط عام (`https://xxx.up.railway.app`)، ثم حدّث `META_REDIRECT_URI`
   كما في الخطوة 4 وأعد النشر.

## بديل: Vercel + Neon/Supabase

استضافة منفصلة عن قاعدة البيانات — مناسب إن أردت الاستفادة من شبكة Vercel
العالمية تحديداً.

1. أنشئ قاعدة بيانات مجانية على [neon.tech](https://neon.tech) (انسخ رابط
   "Pooled connection") أو [supabase.com](https://supabase.com) (انسخ
   "Connection Pooling" URI من Project Settings → Database).
2. على [vercel.com/new](https://vercel.com/new) اربط حساب GitHub واختر
   مستودع `media-tools-` وفرع `claude/quick-marketing-discounts-idd2mp`.
3. أضف نفس متغيرات البيئة الموضّحة أعلاه في `.env.example` (بدون مرجع
   `${{Postgres...}}` الخاص بـ Railway — هنا تلصق رابط Neon/Supabase مباشرة
   في `DATABASE_URL`).
4. اضغط Deploy. بعد أول نشر، حدّث `META_REDIRECT_URI` إلى دومين Vercel
   وأعد النشر.
5. الترحيلات وتعبئة الباقات تُشغَّلان تلقائياً في كل نشر عبر سكربت
   `vercel-build` (`prisma migrate deploy && tsx prisma/seed.ts && next build`)
   — Vercel يكتشفه تلقائياً بدل `build` العادي، فلا حاجة لأي خطوة يدوية.

## تحديث إعدادات Meta بعد النشر

في [developers.facebook.com](https://developers.facebook.com/apps)، أضف
رابط النشر الفعلي (`https://<domain>/api/integrations/meta/callback`) في
Valid OAuth Redirect URIs الخاصة بالتطبيق — سواء كان الدومين من Railway أو
Vercel.
