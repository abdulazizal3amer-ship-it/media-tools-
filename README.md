# روّج (Rawwij) — Quick Marketing Tool for Discounts

A merchant tool that turns a discount into a live, multi-channel marketing
campaign in minutes: Next.js (App Router, TypeScript) + PostgreSQL/Prisma,
real authentication, and a real Meta (Instagram/Facebook) Ads + WhatsApp
Business integration.

## What's real vs. stubbed

- **Real**: merchant signup/login (hashed passwords, DB-backed sessions),
  the full campaign wizard (discount → objective → creative → audience →
  package → preview → payment → launch → dashboard), Meta Marketing API
  (OAuth connect + campaign/ad-set/creative/ad creation), WhatsApp Business
  Cloud API messaging.
- **Stubbed, ready to implement**: the government/discount-registration
  system ("نظام التخفيضات" — no public API exists today), Google/TikTok/
  Snapchat Ads, and the payment gateway. Each is behind an interface in
  `src/lib/*/types.ts` — swap the implementation in `src/lib/*/registry.ts`
  or the provider file, no caller changes needed.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Have a PostgreSQL server running, then copy `.env.example` to `.env` and
   fill in `DATABASE_URL` (and any integration credentials you have).
3. Run migrations and seed the fixed marketing packages:
   ```bash
   npx prisma migrate dev
   npx tsx prisma/seed.ts
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) — it redirects to
   `/signup` to create a merchant account, then into the campaign wizard.

## Connecting Meta (Instagram/Facebook) Ads

1. Create an app at [developers.facebook.com](https://developers.facebook.com/apps)
   with Marketing API + Facebook Login for Business.
2. Set `META_APP_ID`, `META_APP_SECRET`, and `META_REDIRECT_URI` in `.env`.
3. From the campaign launch step, click "ربط حساب Meta الإعلاني" to run the
   real OAuth flow. New campaigns are created with status `PAUSED` on Meta
   as a safety default — nothing spends until reviewed in Ads Manager.

## Connecting WhatsApp Business

Set `WHATSAPP_PHONE_NUMBER_ID` and `WHATSAPP_ACCESS_TOKEN` from the
[WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api).
Until a real opted-in customer base exists, launching sends a live test
message to `WHATSAPP_TEST_RECIPIENT`.

## Project layout

- `src/app/(signup|login)` — real authentication
- `src/app/campaigns/new/*` — the 9-step campaign wizard (steps 2–10 of the
  product journey; step 1 is account creation)
- `src/app/campaigns/[id]` — campaign dashboard ("تتبع الوصول")
- `src/lib/discounts` — discount system adapter (mock provider today)
- `src/lib/channels` — ad channel provider interface + Meta/WhatsApp (real)
  and Google/TikTok/Snapchat/Email (stubs)
- `src/lib/payment` — payment gateway adapter (stub)
- `prisma/schema.prisma` — full domain model
