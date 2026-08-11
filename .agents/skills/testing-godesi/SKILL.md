---
name: testing-godesi
description: How to set up, run and end-to-end test the Godesi digital-business-card app (Next.js 14 App Router + Prisma/Postgres), locally or against the deployed Vercel/Neon production site, including seeded logins, Premium lead-unlock gating, and safely testing the real Stripe/PayPal checkout without spending money.
---

# Testing Godesi

Next.js 14 (App Router + Server Actions) + TypeScript + Tailwind + Prisma/PostgreSQL.
All mutations are **Server Actions**, so test through the UI — do not try to drive
mutations with `curl` + session cookies.

## Environment setup

Postgres runs in Docker and does **not** persist across sessions — start it fresh:

```bash
docker start godesi-pg 2>/dev/null || docker run -d --name godesi-pg \
  -e POSTGRES_PASSWORD=godesi -e POSTGRES_USER=godesi -e POSTGRES_DB=godesi \
  -p 5433:5432 postgres:16-alpine
```

`.env` in the repo root:

```
DATABASE_URL="postgresql://godesi:godesi@localhost:5433/godesi"
AUTH_SECRET="dev-secret-change-me-0123456789abcdef"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

```bash
npm install && npx prisma migrate deploy && npm run db:seed
npm run build && npm run start -- -p 3000
```

Locally, no external API keys are needed — with no Stripe/PayPal env vars set, checkout falls
back to a **mock** provider. There is no email/SMS integration. Auth is a self-signed JWT
cookie via `jose`.

## Testing the deployed production site

Production has been deployed to **https://godesi-app.vercel.app** (Vercel + Neon Postgres),
seeded with the same `prisma/seed.ts` fixtures and the same `password123`. When asked to test
"live", do **not** start a local server — the deployed app has real payment providers wired up,
which localhost does not.

The admin password may have been rotated on live; confirm before planning admin flows.

**You may well have a Neon connection string as a session secret** (look for something like
`GODESI_DATABASE_URL` via `list_secrets`) even if the task says no DB shell is available. Check
first — DB assertions are far stronger than UI-only ones for proving "no plan was granted":

```bash
# exec(env={"GDB": "secret:session:GODESI_DATABASE_URL"})
psql "$GDB" -At -c 'select email, plan, "planExpiresAt" from "User" order by email;'
psql "$GDB" -At -c 'select count(*) from "Payment";'
```

Install the client first if needed: `sudo apt-get install -y postgresql-client`.

## Billing: mock vs real providers

`src/app/actions/billing.ts`, `src/lib/stripe.ts`, `src/lib/paypal.ts`, `src/lib/billing.ts`.

- `stripeEnabled()` = `STRIPE_SECRET_KEY` set; `paypalEnabled()` = `PAYPAL_CLIENT_ID` +
  `PAYPAL_CLIENT_SECRET` set.
- The mock instant upgrade (`mockSubscribeAction`) **self-disables** when either provider is
  configured, redirecting to `/pricing?error=mock_disabled`. `/pricing` also only renders the
  `Get {plan} (test mode)` button when `!providersOn`.
- **Key regression check on any deployment with real keys:** grep the served `/pricing` HTML for
  `test mode` — it must appear **0** times. A mock button in production is a free-upgrade hole.
  The footer should read "Payments are processed securely by Stripe and PayPal."
- `activatePlan()` is idempotent on the unique `Payment.reference`.

### Testing real checkout WITHOUT spending money

Assume live keys. Never type card details, never log into PayPal, never approve/capture an order.

- Stripe: click "Pay by card — ₹999" and stop on the hosted page. Assert product name
  `Godesi {Plan} — 30 days`, the INR total (Pro ₹499 / Premium ₹999), and prefilled
  `customer_email`. A `cs_live_` prefix means live mode. Abandon with Stripe's back arrow →
  must land on `/pricing?error=cancelled` ("you have not been charged").
- **Best free negative test:** grab the real `cs_live_...` id out of the hosted-checkout URL, then
  visit `/pricing/success?session_id=<that id>`. It is a genuine session owned by that very user
  but `payment_status` is `unpaid`, so the page must show "Payment pending" and grant nothing.
  Also try a garbage id ("We could not verify this payment") and another user's id.
  Caveat: `payment_status` is checked *before* the `userId` ownership check
  (`pricing/success/page.tsx`), so a cross-account *unpaid* session hits the payment guard — the
  ownership branch cannot be reached without a real paid session. Don't claim it as tested.
- Webhook: `POST /api/webhooks/stripe` with no `stripe-signature` → 400 `Missing signature`;
  with a forged one → 400 `Invalid signature`. A **503 `Stripe is not configured`** means
  `STRIPE_WEBHOOK_SECRET` is missing in that environment — a config defect, not a pass. Make the
  forged payload dangerous (real userId, `payment_status: "paid"`) then assert the DB is unchanged.
- PayPal: `/api/paypal/create-order` and `/api/paypal/capture-order` both return
  401 `Unauthorized` when unauthenticated. For a logged-in user, create-order returns
  `{"id":"<PayPal order id>"}`; an uncaptured order costs nothing. `capture-order` reads the
  buyer from the server-set `custom_id`, so it can't be forged by the buyer.

### Known issue: PayPal buttons may not render

On production, both paid plan cards rendered **"PayPal is unavailable right now."** instead of
PayPal buttons, making the whole PayPal path unreachable. Before blaming credentials or the
network, probe from inside the page — the SDK may be perfectly fine:

```js
document.getElementById('paypal-sdk')           // script tag present?
typeof window.paypal, typeof window.paypal.Buttons
window.paypal.Buttons({...}).render(freshDiv)    // does this RESOLVE?
```

If `render()` resolves manually, the fault is in `src/components/PayPalCheckout.tsx`: its
`loadSdk()` is not safe when **two** `PayPalCheckout` instances mount on `/pricing` (Pro +
Premium). The second instance attaches a `load` listener to a script whose load event it can
miss, and the component latches permanently into the `loadSdk(...).catch()` error state.
A module-level shared SDK promise (plus resolving immediately when `window.paypal` already
exists) is the likely fix. Workaround for testing the backend: invoke the same same-origin
`fetch('/api/paypal/create-order', ...)` the component would have made, from within the page.

Note `PayPalCheckout.tsx` hardcodes the **live** `www.paypal.com` SDK host while
`paypalApiBase()` switches on `PAYPAL_ENV` — sandbox credentials would therefore mismatch.

## Gotchas that will waste your time

- **Never `pkill -f "next start"` / `pgrep -f "next build"`.** The pattern matches your own
  shell's command string and kills the shell (you get exit code -1 and no output). Use the
  bracket trick instead: `pkill -f 'next-serv[e]r'`.
- **Restarting the prod server while a build is in flight** leaves the server's build manifest
  out of sync with `.next`. Symptom: pages fail with `ChunkLoadError: Loading chunk N failed`
  and the chunk **404s even though the file exists on disk**. Fix:
  `rm -rf .next && npm run build`, then start the server. Do a hard reload afterwards.
  This is an environment artifact, not a product bug — don't report it as one.
- Re-running `npm run db:seed` **adds more Event rows** (analytics counters climb: 20/6/9 per
  seed run). Always read the live pre-interaction counts from the DB as your baseline instead
  of assuming the seed numbers.
- Clicking a link/button right after a page re-render can miss, because removing an alert
  banner shifts the layout upward. Re-screenshot and re-locate before clicking.

## Seeded logins (password for all: `password123`)

| Email | Role / Plan |
|---|---|
| `admin@godesi.in` | ADMIN |
| `sweetcrumbs@example.com` | BUSINESS · PREMIUM (slug `sweet-crumbs-bakery`, APPROVED, featured) |
| `sparkelectric@example.com` | BUSINESS · PRO (`spark-electricals`, APPROVED) |
| `printhub@example.com` | BUSINESS · FREE (`printhub-solutions`, APPROVED) |
| `greengarden@example.com` | BUSINESS · FREE (`green-garden-nursery`, **PENDING**) |
| `client@example.com` | CLIENT — owns the 3 seeded leads |

`green-garden-nursery` being PENDING is the intended fixture for testing admin approval →
public search propagation.

## Premium lead-unlock gating (the core monetization logic)

Key files: `src/lib/plans.ts` (`canUnlockLeads` = `effectivePlan(user) === "PREMIUM"`,
expiry-aware), `src/app/actions/leads.ts` (`unlockLeadAction` redirects non-premium to
`/pricing?reason=leads` **before** any DB write), `src/app/leads/page.tsx`
(`unlocked = premium && lead.unlocks.length > 0`), `src/app/leads/[id]/page.tsx`.

Behaviour worth asserting:
- The gate is **PREMIUM-only** — PRO is also blocked. Always test PRO as a boundary case.
- Unlock is **per-lead**, not per-plan: a PREMIUM user still sees locked contacts until they
  click "Unlock contact" on that specific lead (creates a `LeadUnlock` row).
- Button label differs by plan: `"Unlock with Premium"` (locked) vs `"Unlock contact"` (premium).

**Test it server-side, not just visually.** The locked state uses a CSS `blur-sm` placeholder,
so a screenshot alone cannot distinguish working gating from broken gating. Do both:

1. Grep the saved page HTML for the real contact value (seeded client phone is
   `+919812300000`) — it must be absent for non-premium users, including when navigating
   **directly** to `/leads/<id>`.
2. Assert the DB: blocked attempts must create **zero** rows.

```bash
docker exec godesi-pg psql -U godesi -d godesi \
  -c 'select u.email, u.plan, l.title from "LeadUnlock" lu
      join "User" u on u.id=lu."userId" join "Lead" l on l.id=lu."leadId";'
```

Strongest single piece of evidence: run FREE → PRO → PREMIUM against the *same* lead and show
the table ends with exactly one row, owned by the PREMIUM account.

## Other useful checks

- Mock checkout (**local only** — disabled when real providers are configured): `/pricing` →
  "Get Premium" (₹999) → redirects to `/dashboard?upgraded=PREMIUM`, writes a `Payment` row
  (`provider='mock'`) and sets `planExpiresAt` ~30 days out plus `featured=true` on the owner's
  business. Use it to flip one account from blocked → unlocked.
- QR: `/api/qr/<slug>?download=1` should return `content-type: image/png` and
  `content-disposition: attachment; filename="godesi-<slug>-qr.png"`. Verify PNG magic bytes.
- **Decode the QR, don't just look at it.** `siteUrl()` (`src/lib/format.ts`) silently falls back
  to `http://localhost:3000` when `NEXT_PUBLIC_SITE_URL` is unset, which would make every printed
  production QR dead while still rendering a valid-looking image:
  ```bash
  sudo apt-get install -y zbar-tools
  curl -s -o qr.png "$BASE/api/qr/sweet-crumbs-bakery?download=1" && zbarimg --quiet --raw qr.png
  # expect https://<prod-host>/b/sweet-crumbs-bakery?src=qr
  ```
  Also assert `sitemap.xml`, `robots.txt` and the card's JSON-LD `url` contain the prod host and
  **0** occurrences of `localhost`.
- New business signups land as `PENDING`: the card is reachable at `/b/<slug>` with a "listing is
  pending" banner but must be **absent** from `/search`.
- Analytics: `/api/track` records `PROFILE_VIEW` / `QR_SCAN` / `WHATSAPP_CLICK`; counters surface
  on the owner's `/dashboard`. Compare against a DB baseline taken before interacting.
- Search (`src/lib/businesses.ts`) returns only `status: APPROVED`, sorted
  planRank → featured → rating → reviewCount → name.

## Devin Secrets Needed

- **Local runs:** none. Everything runs against the Docker Postgres with the mock payment provider.
- **Live/production runs:** a Neon connection string (seen as session secret
  `GODESI_DATABASE_URL`) is optional but strongly recommended for authoritative plan/`Payment`
  assertions. Stripe/PayPal keys are **not** needed by the tester — they live in the Vercel
  environment, and testing must stop before any real charge.

## Directory / events / banners / news revisions (`ae4fff6`+)

### Two local stacks
Later revisions were tested with a **second** container and checkout so the live and local stacks
can coexist:

```bash
docker start godesi-pg-dev 2>/dev/null || docker run -d --name godesi-pg-dev \
  -e POSTGRES_PASSWORD=godesi -e POSTGRES_USER=godesi -e POSTGRES_DB=godesi \
  -p 5434:5432 postgres:16-alpine
# /home/ubuntu/dev/godesi-checkout/.env → DATABASE_URL=...localhost:5434/godesi,
#                                          NEXT_PUBLIC_SITE_URL=http://localhost:3001
npm run start -- -p 3001      # .next build usually already present after a restart
```

Categories need their own seed: `npm run db:categories` (11 top-level + 92 children).

### Tailwind class-order trap (real defect, twice now)
`LinkButton`/`Button` in `src/components/ui.tsx` concatenate `variant` classes **then** your
`className`. Tailwind precedence is **stylesheet order, not attribute order**, so
`variant="secondary"` (`bg-white text-slate-800`) plus `className="bg-transparent text-white"`
resolves to `text-white` **and** `bg-white` → an invisible white-on-white pill.

- Known instance still unfixed at `3a9ccf3`: the `/events` hero "Past events" toggle
  (`src/app/events/page.tsx`). The home-page CTAs were fixed by replacing them with explicit
  bordered `Link` elements — do the same elsewhere.
- **Screenshots alone can miss this** (a blank pill looks like padding). Confirm authoritatively:
  ```js
  const a=[...document.querySelectorAll('a')].find(x=>x.textContent.trim()==='Past events');
  const s=getComputedStyle(a); console.log(s.color, s.backgroundColor);
  // FAIL if color === backgroundColor
  ```
- A separate, *different* bug was the tailwind content globs missing `./src/lib/**/*.{js,ts}`
  (gradient classes live in `src/lib/categories.ts`). Verify the fix by grepping the **served**
  stylesheet, not the source:
  `curl -s "$BASE$(curl -s $BASE/ | grep -o '/_next/static/css/[a-z0-9]*\.css' | head -1)" | grep -o 'from-rose-500'`

### Mobile / responsive testing
Chrome enforces a **minimum window width of ~532px**, so `wmctrl -e 0,0,0,390,1100` silently
clamps and you cannot get a true 390px *window*. Either accept a ~500px CSS viewport (still well
below the `lg` 1024px breakpoint that hides the sidebar) or use devtools device emulation. Assert
via computed style, because the `<aside>` stays in the DOM (`hidden lg:block`):

```js
getComputedStyle(document.querySelector('aside[aria-label="Sponsored"]')).display // 'none'
document.documentElement.scrollWidth <= window.innerWidth + 1                      // no overflow
```

### Events / tickets
- Free events confirm instantly (`provider='free'`, amount 0); paid events create a **PENDING**
  ticket and redirect to Stripe. Abandoning leaves the row PENDING with `reference` NULL and
  **does not** move `seatsBooked` — the strongest free negative test for ticketing.
- Seat assertion: capture `seatsBooked` before/after and require **exactly +quantity**.
  Prod state accumulates across runs, so never assume the seeded 0 — re-read the baseline.
- Decode ticket QRs too: `zbarimg --raw` must give `https://<prod-host>/tickets/<code>`.
- Authorization: a signed-in non-holder gets a Next.js **404** on `/tickets/<code>` and
  **403 `{"error":"Forbidden"}`** on `/api/tickets/<code>/qr`; a PENDING ticket's QR is **404**.

### Banners
Assert impressions from a DB baseline (the beacon is `navigator.sendBeacon`, so it is easy to
miss). Click a **specific** banner and prove **only that one** incremented — clicking any banner
and seeing "some counter went up" would pass even if the id were ignored.

```bash
psql "$GDB" -At -c 'select slot::text||position::text||'"'"' imp '"'"'||impressions||'"'"' clk '"'"'||clicks from "Banner" order by slot,position;'
```

Note the `slot` column is an enum — `slot||position` raises
`operator does not exist: "BannerSlot" || integer`; cast with `slot::text||position::text`.

### News + admin moderation
The seed creates **only PUBLISHED** items, so there is nothing to moderate. Create a PENDING row
through the real member flow first: sign in as a PRO/PREMIUM member (`sweetcrumbs@example.com`)
and submit on `/news` → "Thanks! Your story is queued for review by our team." Then sign in as
admin and click **published** in `/admin`; verify it appears on public `/news`.

- FREE users must see "Submitting news is a Pro and Premium member benefit." and **no** form.
- Re-submitting the same link → "That story has already been submitted." (unique `guid`).
  Beware: browser `type` actions append to already-filled fields — **clear inputs first**, or you
  will create a second, differently-GUID'd story instead of testing the duplicate path.
- Admin banner pause/resume must be verified **on the public page**, not just the admin table:
  `curl -s $BASE/search | grep -c 'QA test banner'` → 1 active, 0 paused, 0 after delete.

### Contact gating
`printhub-solutions` has a NULL phone in prod, so its clean HTML proves nothing. Build the fixture
through a normal signup with a real phone + public email, then grep the logged-out HTML for
**0** occurrences of the digits, `mailto:` and `tel:`, and use a PREMIUM listing as the positive
control (`tel:+919812345670` present) to prove the template is not simply empty. The `wa.me`
WhatsApp link remaining visible is **by design**, not a leak.

### SQL gotchas on this schema
- Analytics events live in table `"Event"`; ticketed listings are `"EventListing"`.
- `Ticket` and `EventListing` both have `status` — qualify it (`t.status`) or you get
  "column reference is ambiguous".
- Public business email is `Business.publicEmail` (the `User.email` is the account login).
