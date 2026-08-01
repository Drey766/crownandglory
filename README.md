# Crown & Glory Hair Salon — Full Stack Website

Next.js 14 salon website: e-commerce shop + appointment booking + M-Pesa + WhatsApp.

## Quick Start

1. `npm install`
2. Fill in `.env.local` with your Supabase, M-Pesa, and WhatsApp credentials
3. In Supabase SQL Editor, run in order:
   - `supabase-schema.sql`
   - `seed-services.sql`
   - `seed-products.sql`
   - `seed-blogs.sql`
4. Set your admin role: `UPDATE public.profiles SET role = 'admin' WHERE email = 'you@email.com';`
5. `npm run dev` → http://localhost:3000

## Key Files

- `supabase-schema.sql` — all tables, RLS, storage bucket
- `seed-products.sql` — 107 hair products (wigs, extensions, lace closures, lashes)
- `seed-services.sql` — 24 salon services
- `seed-blogs.sql` — 8 blog articles (uses dollar-quoting to avoid apostrophe SQL errors)
- `src/hooks/useDebounce.ts` — debounced search (400ms) used on every search input
- `src/app/api/appointments/route.ts` — booking validation + M-Pesa + WhatsApp
- `src/app/api/orders/route.ts` — order creation + M-Pesa STK push + WhatsApp
- `src/app/admin/page.tsx` — full CRUD dashboard

## M-Pesa Sandbox

Default is sandbox mode (sandbox.safaricom.co.ke). For production, replace with api.safaricom.co.ke in both API route files.

Use ngrok for local callback testing: `npx ngrok http 3000`

## Set Admin User (after first signup)

```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
```

## Tech Stack

Next.js 14 · Tailwind CSS · Supabase · M-Pesa Daraja · WhatsApp Business Cloud API · Vercel
