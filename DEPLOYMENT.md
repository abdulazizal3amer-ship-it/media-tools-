# نشر روّج (Deployment)

الطريقة الأسهل: **Vercel** (تستضيف نفس فريق Next.js) + **Neon** أو **Supabase**
لقاعدة بيانات PostgreSQL مُدارة. كلاهما لديه باقة مجانية تكفي للبداية.

## 1. قاعدة البيانات

اختر واحدة (كلاهما مجاني للبداية):

- [neon.tech](https://neon.tech) — أنشئ مشروعاً جديداً، انسخ رابط الاتصال
  "Pooled connection" (مهم لبيئة serverless مثل Vercel).
- [supabase.com](https://supabase.com) — من Project Settings → Database،
  انسخ "Connection Pooling" URI.

## 2. النشر على Vercel

1. اذهب إلى [vercel.com/new](https://vercel.com/new) وسجّل دخول بحساب GitHub.
2. اختر مستودع `media-tools-` وفرع `claude/quick-marketing-discounts-idd2mp`
   (أو ادمجه إلى الفرع الرئيسي أولاً).
3. أضف متغيرات البيئة (Environment Variables) — انسخها من `.env.example`:
   - `DATABASE_URL` — رابط الاتصال المُجمّع (pooled) من الخطوة السابقة
   - `SESSION_SECRET` — نص عشوائي طويل (شغّل `openssl rand -base64 32` محلياً)
   - `META_APP_ID`, `META_APP_SECRET` — إن كانت متوفرة لديك
   - `META_REDIRECT_URI` — بعد أول نشر، عدّلها إلى
     `https://<domain-vercel>/api/integrations/meta/callback`
   - باقي المتغيرات (`WHATSAPP_*`, إلخ) حسب توفرها
4. اضغط Deploy.

`postinstall` في المشروع يشغّل `prisma generate` تلقائياً أثناء البناء —
لا حاجة لخطوة يدوية.

## 3. تشغيل الترحيلات (Migrations) على قاعدة الإنتاج

من جهازك، بعد ضبط `DATABASE_URL` في `.env` ليشير إلى قاعدة الإنتاج مؤقتاً:

```bash
npx prisma migrate deploy
npx tsx prisma/seed.ts
```

## 4. تحديث إعدادات Meta

في [developers.facebook.com](https://developers.facebook.com/apps)، أضف
رابط النشر الفعلي (`https://<domain>/api/integrations/meta/callback`) في
Valid OAuth Redirect URIs الخاصة بالتطبيق.

## بدائل أخرى

- **Railway** أو **Render**: يوفران استضافة + قاعدة PostgreSQL في نفس المكان،
  بديل جيد إن أردت كل شيء في منصة واحدة بدل فصل الاستضافة عن قاعدة البيانات.
- **استضافة ذاتية (VPS/Docker)**: ممكنة لكن تتطلب إعداد يدوي أكبر (عملية
  build، عملية تشغيل `next start`، شهادة SSL) — غير موصى بها للبداية.
