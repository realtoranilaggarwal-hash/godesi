# Godesi

A mobile-first SaaS platform of **digital business cards** for small businesses, with
QR codes, WhatsApp integration, reviews, a lead marketplace, and paid membership tiers.

## Tech stack

- **Next.js 14** (App Router, Server Actions) + **TypeScript**
- **Tailwind CSS** (mobile-first, responsive UI)
- **Prisma** + **PostgreSQL**
- Cookie/JWT auth (`jose`), password hashing (`bcryptjs`)
- QR generation (`qrcode`), validation (`zod`)

## Features

| Area | What it does |
| --- | --- |
| Business profile | Name, logo, description, gallery (images/videos), website, socials, Google Maps, WhatsApp, reviews |
| Public card | SEO-friendly `/b/[slug]` with metadata, JSON-LD, sitemap & robots |
| QR system | Unique QR per profile at `/api/qr/[slug]`, with download & share |
| WhatsApp | Click-to-chat button with click tracking |
| Analytics | Profile views, QR scans, WhatsApp clicks, leads unlocked |
| Lead marketplace | Clients post requirements; businesses browse; **Premium** unlocks contact details |
| Membership | Free / Pro / Premium plans with mock checkout (Stripe/Razorpay-ready) |
| Search | Filter by category, city, rating, premium badge; premium/featured ranking |
| Admin | Approve/reject listings, manage user plans, toggle featured, view payments |

## Getting started

```bash
cp .env.example .env         # set DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_SITE_URL
npm install
npx prisma migrate deploy    # or: npx prisma migrate dev
npm run db:seed              # demo data
npm run dev
```

### Seeded accounts (password: `password123`)

- Admin: `admin@godesi.in`
- Business (Premium): `sweetcrumbs@example.com`
- Client: `client@example.com`

## Scripts

- `npm run dev` / `build` / `start`
- `npm run lint` — ESLint
- `npm run typecheck` — `tsc --noEmit`
- `npm run db:migrate` / `db:seed`

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Secret for signing session JWTs |
| `NEXT_PUBLIC_SITE_URL` | Absolute site URL (used for QR targets, canonical URLs, sitemap) |
