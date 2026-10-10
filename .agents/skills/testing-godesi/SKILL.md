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
- **Chrome's omnibox autocompletes to a longer previously-visited path.** Typing
  `localhost:3000/real-estate` + Enter can land you on `/real-estate/start`, silently testing the
  wrong page. Press `Delete` after typing (to drop the inline completion) before `Enter`, and
  always confirm the resulting URL in the screenshot.
- Filter forms scroll: after `ctrl+Home` or a submit the price/BHK row moves, so coordinates from
  the previous screenshot land in the wrong input. Re-screenshot, then **zoom on the inputs to
  confirm the values took** before submitting — otherwise you assert on an unchanged query.

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
- There is **no `Session` table** — auth is a JWT cookie. A cleanup transaction that deletes from
  `"Session"` aborts and silently `ROLLBACK`s everything. Always re-`SELECT` counts after cleanup
  instead of trusting the `DELETE n` lines.

## Listings module (`/real-estate`, `/rooms`, `/listings/new`)

`src/lib/listings.ts`, `src/app/actions/listings.ts`. Sections are partitioned by kind:
`real-estate` = `PROPERTY_SALE|PROPERTY_RENT`, `rooms` = `ROOM_OFFERED|ROOM_WANTED`.

- **The form is kind-aware.** Room kinds show *Furnishing* + *Preferred flatmate*; property kinds
  show *Bedrooms (BHK)* instead. There is **no bedrooms field on room listings**, so a
  "bedrooms filter on rooms" test case is not expressible — test it on `/real-estate` with a
  property fixture. `/listings/new?kind=PROPERTY_RENT` pre-selects the kind.
- Filters are plain GET query params (`q`, `city`, `kind`, `max`, `bedrooms`, `gender`,
  `furnishing`), so you can drive each one independently via the URL bar and assert exact result
  sets. `bedrooms` is a **minimum** ("Min BHK").
- **Gender filter trap — do not report this as a bug.** `gender=FEMALE` returns Female-only
  *and* `ANY` listings, because `listings.ts` does
  `{ genderPref: { in: [filters.gender, "ANY"] } }` — a woman should also see rooms open to
  anyone. To prove the filter actually discriminates, use the *opposite* direction:
  `gender=MALE` must **exclude** a Female-only listing.
- **Use a positive control for section separation.** "`/real-estate` shows no rooms" is weak if the
  page is simply empty. Create one property listing so each section has something it *should*
  show, then assert the partition in both directions.
- Points: `LISTING_POSTED` is +15 per listing with a **null `uniqueKey`** (unlike
  `PROFILE_CREATED`, which is keyed `<userId>:PROFILE_CREATED`), so listing points are not
  idempotency-protected — one row per creation is expected.
- Image upload: the dropzone is a click-to-choose `<input type=file>`; `POST /api/upload`
  unauthenticated returning **401 (not 503)** confirms `BLOB_READ_WRITE_TOKEN` is set and uploads
  are testable. **You almost certainly cannot clean the blob up** — the token is not in the agent
  env, so deleting the DB row orphans the file. Flag the URL for the lead rather than claiming
  full cleanup.

## Real estate module (`/real-estate`, `/real-estate/start`, `/admin/properties`)

Adds many nullable property columns to `Listing` + a `ListingLead` model. `src/lib/property.ts`
holds the taxonomy and `propertyWhere()`; `/real-estate/page.tsx` merges it with `listingWhere()`.

- **Test this on a LOCAL EMPTY database, not prod.** `/real-estate` renders a literal
  `{listings.length} listing(s)` counter, so with exactly 4 hand-made fixtures every filter
  assertion becomes an exact number. On prod that counter is polluted and filters can only be
  eyeballed. Extract it from HTML with `grep -oE '[0-9]+<!-- --> listing'` (React SSR inserts
  the comment marker; a plain `grep '4 listing'` will never match).
- **Do not count results by grepping fixture titles from curl.** Titles also appear in the
  `#godesi live wall` sidebar and cross-sections, so a title match does *not* mean the listing
  passed the filter. Use the counter, or the browser.
- **The property-group `<select>` has no `name`** (`PropertyFields.tsx`), so `group` is never
  POSTed — the server derives `propertyGroup` from `propertyType` via `groupForType()`. To prove
  `?group=COMMERCIAL` preselection worked, assert the **property-type list changed to the
  commercial set** (Office space / Shop / Showroom), not that a group field was submitted.
- **Build fixtures that can *falsify* the filter**, not just satisfy it: one listing priced above
  every `max` you test (proves max is applied), and one carrying only *one* of two amenities
  (proves `amenities: { hasEvery: [...] }` is AND, not OR — with OR it would return 2, not 1).
- Bogus `group`/`ptype`/`amenity`/`by`/`tenant`/`furnishing` are correctly dropped by
  `isPropertyGroup` / `TYPE_LABELS.has` / `keepOptions` and the count reverts to unfiltered.
  Don't file those as bugs; the real bugs are in the *numeric* params (below).
- **Three defects found in `50eff2f`, all fixed in `f9f77b6`. They are the highest-value
  regression targets on this module — re-check them on any change to the filter builders or the
  contact component:**
  1. **`min` silently discarded `max`.** `real-estate/page.tsx` did
     `{...listingWhere(...), ...propertyWhere(...)}`; `listingWhere` writes
     `price:{lte:max,gt:0}` and `propertyWhere` writes `price:{gte:min}`, so the **later spread
     overwrote the whole `price` key**. Test min+max *together* — testing each alone passes.
     Now merged by `propertySearchWhere(filters)` in `src/lib/property.ts`, which must yield
     `price: {lte, gt:0, gte}`.
  2. **Huge numeric params → HTTP 500.** `intOrNull()` didn't clamp, so
     `?min=99999999999999999999` threw `PrismaClientValidationError: Unable to fit value ...
     into a 64-bit signed integer`. Now both `intOrNull`s reject negatives and clamp to
     `2_147_483_647`, and the min/max inputs carry `max={2147483647}`.
  3. **Guest contact leak** — see the contact-gating bullet below.
  A fast way to prove/refute #1 and #2 without the browser is a throwaway script that imports
  `propertySearchWhere` and prints the resulting `price`/`bedrooms`/`bathrooms` clauses.
- **When testing a clamp, assert result COUNTS, not just "no 500".** Clamping is observably
  different from ignoring the value, and only a count distinguishes them. With 4 fixtures priced
  under int4: huge `min` → `gte 2147483647` → **0 listings**; huge `max` → **all 4**; huge
  `baths`/`bedrooms` → **0**; negative or non-numeric → filter dropped → **all 4**. A build that
  silently discarded the param would return 4 where you expect 0, and a "HTTP 200" assertion
  alone would pass on both.
- **`intOrNull` lives in the SHARED `src/lib/listings.ts` too** (`max`, `bedrooms`), so a clamp
  change affects `/rooms`, `/marketplace`, `/city/<x>` and category pages — not just
  `/real-estate`. Re-run the oversized/negative/non-numeric probes against those surfaces as
  well; `/real-estate` passing does not cover them.
- After the `max={2147483647}` attribute was added, the **filter form now blocks oversized input
  natively** ("Value must be less than or equal to 2147483647.") and never submits. So the form
  path and the direct-URL path are guarded by *different* mechanisms — test both, and don't
  conclude the server clamp works just because the form refused to submit.
- **Contact gating: always grep the raw guest HTML, never just look at the screen.** In `50eff2f`
  `listings/[slug]/page.tsx` passed `phone`/`email` into the `PropertyContact` **client**
  component unconditionally (even with `signedIn={false}`), and Next serializes client-component
  props into the RSC flight payload embedded in the HTML — so the visual sign-in wall was real but
  cosmetic. Fixed in `f9f77b6`: the page now passes only `hasPhone`/`hasEmail` booleans and the
  values are fetched by `revealListingContactAction(listingId)` on tap.
  ```bash
  curl -s -H 'Cookie:' http://localhost:3000/listings/<slug> -o guest.html
  grep -c -F '<phone digits>' guest.html   # must be 0
  grep -o 'hasPhone[^,]*' guest.html       # fixed build shows: hasPhone\":true
  ```
  Two things that make this test trustworthy:
  - **Include a sanity control.** Also assert the HTML *does* contain the listing title and the
    (legitimately public) WhatsApp digits. Without it, a 404 or empty body "passes" the leak test.
  - **Make the `whatsapp` field digit-disjoint from `contactPhone` in your fixture.** The WhatsApp
    number is deliberately rendered as a `wa.me` link for guests, so overlapping digits produce a
    false-positive leak. E.g. whatsapp `9876543210` vs contact `+91 98111 22333`.
  Card/list surfaces (`/real-estate`) never leaked — only the detail page.
- **Probing a server action's logged-out guard without borrowing browser cookies.** The reveal
  button isn't rendered for guests, so the action is unreachable via UI. Extract the action ids
  from the dev client chunk and POST them cookielessly:
  ```bash
  grep -o 'createServerReference)("[a-f0-9]\{40\}"' \
    .next/static/chunks/app/listings/\[slug\]/page.js | grep -o '[a-f0-9]\{40\}' | sort -u
  curl -s -X POST http://localhost:3000/listings/<slug> \
    -H "Next-Action: <id>" -H 'Content-Type: text/plain;charset=UTF-8' --data '["<listingId>"]'
  ```
  You don't need to know which id is which: POST **all** of them and assert none returns contact
  data and `ListingLead` count is unchanged — a stronger claim than testing one action. To
  identify the reveal action specifically, look for the one returning a bare `1:null` (its guard
  is `if (!user) return null`); the others return `1:"$undefined"` or
  `1:{"error":"Please sign in first."}`. Note some actions expecting `formData` will 500 on a
  string arg — that's arg-shape noise from the probe, not a leak, and is not user-reachable.
- The reveal's **"Getting it…" loading label is usually too fast to photograph** against a local
  server; the resolved contact is already on screen by the next screenshot. Report it as
  inconclusive rather than claiming you saw it.
- **`Listing.status` is `@default(APPROVED)`** (schema), so a member property goes **live
  instantly with no moderation step**. Don't write a plan step that waits for PENDING and
  "approve it from the desk" — you must set PENDING from the desk yourself to test transitions.
- Moderation actually gates the public page: `getListing()` filters `status:"APPROVED"`, so
  PENDING/REJECTED both make the detail page **404** and drop the marketplace count.
- `/admin/properties` needs `isStaff(user) && can(user,"listings")`; seeded `admin@godesi.in` is
  ADMIN so it passes everything. Logged out it **307s**, which is a quick gate smoke-test.
- The **featured strip and rooms cross-section are suppressed when any narrowing filter is
  present**, so verify a featured toggle on **plain `/real-estate`** or you will wrongly call it
  broken.
- **Regression trap: the local seed has ZERO non-property listings**, so "existing listing still
  renders" has nothing to exercise. Create a `ROOM_OFFERED` through the UI first — that also
  confirms `PropertyFields` correctly does *not* render for non-property kinds. `/rooms` then
  shows a plain card next to property cards, which is the real shared-`ListingCard` test.
- **Proving the content-desk wrong-model bug fix** (it used to send listing ids to
  `setListingStatusAction` → `db.business.update`): snapshot the businesses before and after and
  assert they are byte-identical, e.g.
  `select md5(string_agg(id||status,',' order by id)) from "Business"`. A "no error appeared"
  claim is not enough, since a same-id collision would silently mutate a business.
- `PhoneInput` renders a **separate required country-code `<select>`** plus the number box and
  submits a hidden `+<code><number>`. Typing only digits leaves the form unsubmittable with no
  obvious cause — always pick the country code (+91).
- Leads: `recordListingLeadAction` is best-effort/`try{}catch{}`. Both the "Show phone" reveal and
  the WhatsApp tap write a `ListingLead`; verify in SQL, and note the WhatsApp click opens a new
  tab you must `ctrl+w` out of.

## Vendor packages & referrals

- `/dashboard/packages`: max 8, name ≥3 ("Name your package"), price ≤50,000,000 and description
  ≤400 both surface a generic **"Invalid input"**.
- **Count your boundary strings.** A repeated-unit filler string is rarely the length you assume —
  a "401-char" description was actually 397 and was correctly accepted. Verify with
  `select length(description)` before reporting a cap as broken, or you will file a false defect.
- `/ref/<username>` is a plain route handler, so assert it with `curl -i` (no session needed):
  known handle → 307 to `/signup?ref=…` with `godesi_ref=…; Max-Age=2592000; HttpOnly;
  SameSite=lax; Path=/`; unknown handle → 307 to `/` with **no** `set-cookie`.
- The self-referral guard is unreachable through signup (a new user's id can never equal an
  existing referrer's), and the `FORBIDDEN` forged-delete guard needs a crafted request — report
  both as code-only/untested rather than passed.

### Long user text can break the page layout
User-supplied strings with no spaces (a pasted URL, a long token) were **not** wrapped in the
vendor-package description and widened the whole document (`body.scrollWidth` 1585 → 3255px).
Diagnose by finding nodes where `scrollWidth > clientWidth`:

```js
document.querySelectorAll('*').forEach(e=>{ if(e.scrollWidth>e.clientWidth+2 && e.clientWidth>0)
  console.log(e.tagName, String(e.className).slice(0,50), e.scrollWidth, e.clientWidth); });
```

Note `getBoundingClientRect().right` will **not** find these — the box stays narrow while its
content overflows. If you seed such a fixture, normalise it (or delete it) before running any
mobile-overflow regression, otherwise your own test data contaminates the measurement.

The fix is a global `p,h1..h4,li,dd,td,blockquote { overflow-wrap: anywhere }` in `globals.css`.
When re-verifying a wrap fix, test **every** surface that renders free text (package description
*and* listing description — they are different components), at desktop **and** ~500px, and assert
three things together: `body.scrollWidth <= innerWidth+1`, the offending node's
`scrollWidth <= clientWidth+2`, and a whole-document sweep returning zero overflowers.
Also read back `getComputedStyle(p).overflowWrap === 'anywhere'` to prove the *deployed* CSS is
what you think it is. Listings have **no edit UI** (delete only), so to test a listing description
you must create a new listing rather than editing an existing one.

## Per-item currency (`price` + `currency`, migration `20260727230000`)

`priceInr` was renamed to `price` on `Event`/`Listing`/`VendorPackage`, each gaining a
`currency` TEXT column, rendered via `formatMoney(value, currency)`.

**The single most important trap:** `requestCurrency()` (`src/lib/currency.ts`) derives the default
from the `x-vercel-ip-country` header. A test box outside India therefore **defaults every currency
selector to USD**. Posting one item and seeing `$` proves *nothing* — it is indistinguishable from
a selector that is ignored entirely. Always:

1. Create an **explicit INR** item *and* an **explicit USD** item and compare them side by side on
   the same surface (`/rooms`, `/dashboard/listings`, `/b/<slug>`).
2. Best discriminator: explicitly select **INR** while geo defaults to USD, then assert the row
   persisted `currency=INR`. If the selector were ignored, geo would have written USD.

Money is stored in **minor units**: a USD 25 ticket × 2 persists `amountMinor = 5000`,
`currency='USD'`, `status='PENDING'`. Stripe may additionally offer a localized EUR presentment
option next to the USD total — not a defect, provided the amount is clearly `$50.00` and there is
no ₹/INR. Stop at the hosted page; `Payment` count must stay 0.

## Rewards / redemption

`RedeemPanel.tsx` renders `disabled={balance < reward.points}`, so the **UI gate is a disabled
button** — the server-side "You need N more points" string needs a forged request and should be
reported code-only, not passed.

The cheapest reward is 250 points and the only legitimate route to +100 is a real payment. To
exercise redemption without money, insert **one non-money `ADJUSTMENT` `PointsEntry`**
(`PointsReason` includes `ADJUSTMENT`) to reach exactly 250, disclose it in the report, and perform
the redemption itself **through the UI**. Make the gate check discriminating: at exactly 250 the
250-pt reward must be **enabled** while 300/400/500 stay **disabled** — a broken gate enables all
or none. Then assert exactly one `Redemption` row and exactly one `PointsEntry` of −250.

If a QA account's password is unknown, generate a bcrypt hash locally and `UPDATE` the
`passwordHash` rather than abandoning the flow — disclose it and delete the account in cleanup.

## Referral credit: prove the cookie is *consumed*, not just read

One referred signup only proves the cookie was read. The falsifiable second step is: sign out, go
**straight to `/signup`** without revisiting `/ref/...`, and sign up a second account. That account
must have `referredById IS NULL` and the referrer must **still** have exactly one
`REFERRAL_SIGNUP +10` (total 10, not 20).

## Cleanup: verify your baseline's provenance before trusting it

Record baselines as `table -> count` with the **exact table name**. `"Event"` (analytics, ~157 and
climbing from your own page views) and `"EventListing"` (public events, 2 seeded) are different
tables — a baseline noted as "156 events" can look like a catastrophic 156 → 2 data loss at cleanup
when nothing was lost. Cross-check with the `DELETE n` counts and with dependent rows (all 6 seeded
tickets still resolving to the 2 seeded events) before reporting either success or alarm.

Cleanup order that works: `Ticket` → `EventListing` → `ListingImage` → `Listing` →
`VendorPackage` → `Redemption` → `PointsEntry`, then `Business`, then `User`.

## Investigating "a user signed up but could not post" (funnel/silent-failure bugs)

When asked *why* a real member failed at a flow, the highest-value finding is usually **not** a crash
but an **invisible server-side validation error**. Godesi's forms put the error `<Alert>` at the
**top** of a long form while the submit button is at the **bottom**, with **no `scrollIntoView` and no
error-focus effect**. The user clicks Save, nothing visibly happens, and they conclude the site is
broken.

To find such a trap, look for fields where the **server schema is stricter than the HTML attribute**.
The canonical one in `src/app/actions/business.ts`:

```ts
whatsappNumber: z.string().trim().refine(
  (v) => normalizeWhatsApp(v).length >= 10, "Enter a valid WhatsApp number")
```

HTML `required` only checks **non-empty**, so a short-but-present value like `98765` defeats the
browser and is rejected server-side. Other server-only gates in the same file cover specialty-set,
choice-group and license rules for ~6 subcategories (`spa-and-massage`, `attorneys`, `astrologers`,
`consultants`, `insurance-agents`, `financial-advisors`) — pick a *plain* subcategory (e.g. Wedding &
Event Services → Photographers) for the happy path so these don't confound it.

**Make the invisibility a measurement, not an opinion.** Submit from the bottom, then *without moving
the viewport* record `window.scrollY`, `window.innerHeight` and the alert's
`getBoundingClientRect()`. A negative `top` proves the user saw nothing:

```json
{"errorText":"Enter a valid WhatsApp number","scrollY":1198,"innerHeight":1069,
 "errorTop":-1019,"errorVisibleInViewport":false,"pixelsAboveViewport":1019}
```

Then fix **only** that one field and re-save to prove it was the sole blocker, and note whether
required fields carry any visible marker (Godesi's currently do not). Good contrast evidence: the
`/leads/new` form relies on native validation, so its error appears **inline at the field** — that is
the pattern the business form is missing.

**Always pair this with read-only forensics** before blaming a role or an outage:

```sql
select u.email, u.role, u."foundingNumber", u."emailVerifiedAt" is not null verified,
       (select count(*) from "Business" b where b."ownerId"=u.id) biz
from "User" u where u.email not like '%@example.com';
select email, attempts, "usedAt" from "EmailOtp" order by "createdAt" desc;
```

`EmailOtp.attempts = 0` with `usedAt IS NULL` means the user **never typed a code** — evidence of
abandonment, not of broken mail. Check Resend for `delivered` before claiming a delivery problem. If
several *verified BUSINESS-role* accounts also have 0 businesses, the cause is **not** role
authorization — reproduce the UX trap instead.

### Role and verification facts (do not re-derive)

- There is **no `src/middleware.ts`**. `dashboard/profile/page.tsx` checks **auth only** — no role
  gate, so a **CLIENT can post a business**, and `dashboard/page.tsx` shows "Create my card" to every
  non-admin role.
- In production `emailEnabled()` is true, so `auth.ts` sends **every** role to `/verify-email`,
  skipping the helpful role redirect (BUSINESS → `/dashboard/profile`) entirely.
- `/verify-email` has a **"Skip for now"** link, and `/dashboard` + `/dashboard/profile` both work
  while unverified. Verification is **friction, not a hard block** — confirm, don't assume.
- `/dashboard/rewards` redirects to `/dashboard/me?needsUsername=1` when the account has no username.
  That is a prerequisite, not a rewards bug — set the (prefilled) username first, then return.

## Prod schema column names that will bite you

Guessing these wastes cycles; `\d "Table"` first.

| you'll type | actual |
| --- | --- |
| `Listing.userId` | **`Listing.ownerId`** (same for `Business.ownerId`) |
| `UpiRequest.ref` / `amountInr` | **`reference`** / **`amountMinor`** (+ `currency`) |
| `EmailOtp.consumedAt` / `code` | **`usedAt`**; there is no `code` column |

`Lead` has **no user FK at all** — only `contactEmail`, so clean up test leads by
`DELETE FROM "Lead" WHERE "contactEmail" LIKE 'qa.%'`.

## UPI is signed-in only — don't call it environment-blocked from a logged-out probe

`upiEnabled()` depends on `UPI_VPA`, but the "Pay by UPI" button only renders on `/pricing` for a
**signed-in** user. A logged-out `curl` showing 0 occurrences of "Pay by UPI" does **not** prove the
env var is unset — check while authenticated. In prod it is live (VPA `17329837958@ibl`).

Safe verification without paying: click "Pay by UPI — ₹499" → `/pricing/upi/<REF>`, assert the QR
endpoint `/api/qr/upi/<REF>` returns **200** with `content-type: image/png`, and that the row is
`PENDING` with `utr IS NULL`. **Stop at the UTR form** — never submit a fabricated UTR.

## Prod is live: your baseline can move under you

Real users sign up **while you test**. In one run a real account appeared mid-flow and took founding
seat #14, so the promo counter read `986 spots left` instead of the predicted 987, and the post-cleanup
user count was 13 rather than the recorded baseline of 12. Before reporting a count mismatch or a
"leftover", list the rows and check `createdAt`/ownership — then explicitly state which surviving rows
belong to **real** users so nobody deletes them. Founding math is `1000 - max(foundingNumber)`.

## Capture blob URLs BEFORE deleting the owning row

`BLOB_READ_WRITE_TOKEN` is not available, so uploaded images cannot be deleted and must be reported as
orphaned. Record `logoUrl` / image URLs **while the row still exists** — once you delete the
`Business`/`Listing` the URL is unrecoverable and all you can hand over is the user/business id and
upload timestamp. Query it as part of your pre-cleanup evidence dump.

## `/wall` (Desi news wall) + `/admin/wall` — traps found while testing PR #5

**Setup.** The wall worktree may ship **without** `.env.local`. Create one before starting the dev
server or every page renders "Something went wrong" (and you may not notice if a stale server from an
earlier run is still bound to another port — always `ss -ltnp | grep -E '300[0-9]'` and kill strays).
Minimum env: `DATABASE_URL`, `DIRECT_URL` (both → local disposable Postgres), `AUTH_SECRET`,
`NEXT_PUBLIC_SITE_URL`. `node_modules` is a symlink to the main checkout, so `prisma generate` in the
worktree regenerates the **shared** client — don't do it while another run depends on the old schema.

**Counting boxes: never grep.** `See all` matches both the news-wall boxes *and* the unrelated
`#godesi live wall` rail, and the RSC payload duplicates every match (26 hits for 12 boxes). Count
boxes **visually** in screenshots.

**`wallTopics()` has a hard `take: 18`.** With >18 active topics the ones after rank 18 vanish from
`/wall` with no warning anywhere. The 12 seeded rows hide this. To prove it: create QA topics until
21 are active, confirm the last one's box is missing, then set its `sortOrder` to a low value and
confirm the same topic (same query, same live hits) now renders. Sort-order change is the control —
it rules out "the query has no hits".

**`revalidatePath` cannot be isolated.** `/wall` is `force-dynamic` and `wallTopics()` reads the DB
uncached, so any edit shows on the next request regardless. Claim "visible without restart", not
"revalidatePath proven".

**Fallback test needs a control.** `FALLBACK_TOPICS`' first six labels are identical to seeds 1–6, so
"6 boxes appeared" is a weak test. **Rename `wallseed01` via the admin UI first**; after emptying the
table, the reappearance of the original `I love Modi` label proves the hard-coded list is serving.
Admin then shows `Topics (0 live of 0)` + "No topics yet — the wall falls back to a built-in list."
Restore afterwards by re-running just the `INSERT` from
`prisma/migrations/20260814090000_wall_topics/migration.sql` (the `CREATE TABLE`/`CREATE INDEX`
statements will error harmlessly — that's expected).

**Rejected admin saves are silent.** `saveWallTopicAction` does a bare `return` on zod failure and on
`cleanTag()` → empty, so an over-long label or punctuation-only query discards the **whole** row edit
with **no message**. Assert the absence of feedback explicitly and report it as UX, not as "worked".

**`sortOrder` cannot be adversarially tested through the UI** — the input is
`type="number" min={0} max={9999}`, so negative/huge/non-numeric are blocked by native validation.
Say so rather than claiming the server branch was UI-tested. `label` has no `maxLength`, so length
probes *do* reach zod. Build exact-length strings in Python and **assert the length** — hand-typed
"60-char" strings are usually 58.

**Cookieless action probes.** Read the three ids exclusive to `app/admin/wall/page` from
`.next/server/server-reference-manifest.json` and POST each with no cookies. Expect **HTTP 500** with
`Error: UNAUTHORIZED` in the dev log — `requireUser` *throws*, so 500 is the framework's shape for a
blocked action, not a product response. The decisive assertion is that `WallTopic` is byte-identical
before/after (row-level dump, not md5 — md5 expressions differ between runs and produce false
alarms).

**Forcing an upstream failure without touching product code:** add `127.0.0.1 mastodon.social` to
`/etc/hosts`, restart the dev server to drop the 10-min `unstable_cache`. `/wall` should stay 200 in
~3–4s with only `📰` news rows and zero `💬` rows. Revert the hosts entry afterwards.

**Cache timings observed (healthy):** cold `/wall` ≈3.0s, warm ≈0.04s, and adding one new topic costs
≈0.6s (one query's fetch) — that per-query delta is what proves the cache key includes the query.

**Old dates on the wall are correct.** `recent()` prefers <30-day items but deliberately falls back to
older ones so quiet topics aren't empty, so 200d-old festival headlines are expected, not a bug.

**Entering emoji in the browser** needs `sudo apt-get install -y xclip`, then paste — typing them via
xdotool is unreliable.

## Event taxonomy / calendar / state search (PR #7 era) — traps worth remembering

**`.env.local` beats `.env` in Next.js.** `godesi-checkout/.env.local` holds **production Neon**
URLs. If you copy it into a test worktree, your "local" server silently reads/writes **production**
(you will see prod events in the live wall). Override `DATABASE_URL` **and** `DIRECT_URL` *inside
.env.local itself* — putting them only in `.env` does nothing. Verify with a query that only exists
locally (e.g. `curl localhost:PORT/events | grep 'Jaipur Diwali Mela'`) before any write test.

**Never test in the lead's worktree.** It may go mid-merge under you (conflict markers on disk →
`Merge conflict marker encountered` compile overlay). Make your own:
`git -C <their-worktree> worktree add /home/ubuntu/dev/godesi-qa <sha>`.

**Do not symlink `node_modules` for a QA worktree.** The shared Prisma client may have been
regenerated from a *different* schema (symptom: `Unknown field 'genres' for select statement on model
'Event'`). Copy `node_modules` (≈650 MB) and run `npx prisma generate` in your own worktree so you
don't clobber the other worktree's client.

**Stable dev-server start** (plain `&` dies with the shell):
`cd <worktree> && setsid nohup env NEXT_PUBLIC_SITE_URL=http://localhost:3011 npx next dev -p 3011 > /tmp/qa-dev.log 2>&1 < /dev/null & disown`,
then poll `curl -o /dev/null -w '%{http_code}' localhost:3011/events`. `rm -rf .next` if chunks 500.

**Taxonomy write paths and where the cleaning happens.** `/admin/events/wire` trusts `?genres=`/
`?langs=` verbatim for the pre-ticked picker, so over-limit/junk values *do* render as chips (a
2,000-char value visibly overflows the row) — the guarantee is server-side:
`cleanEventCategories/cleanEventLanguages` cap at 6/3 and drop non-vocabulary values. Assert on SQL
(`array_length(genres,1)`), not on the picker.

**Long hostile URLs**: type them via the clipboard, not xdotool —
`cat url.txt | tr -d '\n' | DISPLAY=:0 xclip -selection clipboard`, then ctrl+v in the address bar
(`xclip -d :1` fails; `$DISPLAY` is `:0`).

**Chip filters vs the lower "Filter" form.** Chips are links (`searchHref`), the lower form is a
plain GET form whose `<select defaultValue>` only reflects the **initial** render. After a
chip-driven soft navigation the selects still read "All categories"/"Any language", so submitting the
form (or a hero search) **drops the active `genre`/`lang`**. Test both paths: chip→chip combos may
pass while chip→Filter/hero-search silently loses a filter. Chip counts are global, so a chip count
can legitimately exceed the filtered result count.

**State search fixture worth reusing:** production stores Edison as `Nj` (mixed case), so `?state=NJ`
and city-box `NJ`/`New Jersey` all matching that row is the assertion that proves
`statesMatching`/case-insensitive `equals` works. State chip row only renders when >1 distinct state
exists — a fresh local seed has one, so state chips need prod or extra local fixtures.

**`.ics` verification**: Chrome will not display `view-source:file://…ics`; copy it to `.txt` and open
that, and additionally `diff <(curl -s <slug>/calendar.ics) ~/Downloads/<slug>.ics`. Expect UTC
stamps (`DTSTART:20260822T200000Z` for a 4 pm EDT event). Google Calendar renders the prefilled
editor; **Outlook.com hits a sign-in wall** — report its prefill as verified from the outgoing URL
only.

**Fixture cleanup for event tests:** `delete from "EventListing" where slug like 'qa-%'` plus the
wire-created row and its `EventSource` (`manual://<host>`); local seed baseline is **6**
`EventListing` rows with `genres={} languages={}`.

## Satellite-site promos and phone-gated UI (`6acd75e`+)

**Run `npx prisma migrate deploy` before blaming the PR.** A local `godesi-pg` that is a few
migrations behind presents as unrelated page 500s: `/` and `/categories` return
`PrismaClientKnownRequestError` and the Next overlay looks like a broken route. Migrate first,
then re-check the pages you were asked about.

**Phone-only behaviour needs a phone user-agent, not a narrow window.** `isPhoneRequest()` in
`src/lib/device.ts` reads the UA server-side and skips the whole desktop rail (`Banners.tsx`
sidebar: category tree, help clip, satellite promo cards, live visitor map). Resizing the window
proves nothing — the rail is still server-rendered. Use Chrome device emulation (iPhone 12 Pro
390×844) **with** the phone UA, then assert the rail markup is absent from the served HTML.
Corollary: a promo that lives only in the rail is invisible on phones **by design** — check the
page-body banner instead of reporting it as missing.

**Satellite promos come in two components per site**, e.g.
`src/components/GodesiWikiPromo.tsx` / `DjsWikiPromo.tsx`: a big `…Banner()` for page bodies
(home, `/marketing`, category tops) and a compact `…Card()` for the rail plus the
`HousePromo.tsx` rotation. The rotation slot is seeded pseudo-randomly, so a specific promo
cannot be asserted deterministically — verify the rail card and the body banner, and call the
rotation best-effort.

**Satellite domains may not resolve yet.** `godesi.wiki`, `djs.wiki` and friends are host-routed
by `/home/ubuntu/dev/godesi-network/src/lib/sites.ts` and only work once NameSilo points apex →
`76.76.21.21` and `www` → `cname.vercel-dns.com`. Until then assert the `href`/`target="_blank"`
on the promo links, not the destination. To preview a host before DNS, `curl --resolve
<domain>:443:76.76.21.21` — but it fails on TLS until Vercel has issued the certificate, and a
`Host:` header against a *different* Vercel domain returns 403.

**Watch the privacy copy on these promos.** They claim only what you publish is shown; there is
no phone show/hide toggle in the business editor, just an optional `Phone` field that renders
publicly when filled (`Call +91…` on `/b/<slug>`). Copy implying a toggle is a real defect.
