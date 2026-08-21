import type { Metadata } from "next";
import Link from "next/link";
import { Card, LinkButton } from "@/components/ui";
import { SidebarBanners } from "@/components/Banners";
import { ShareButtons } from "@/components/ShareButtons";
import { CopyButton } from "@/components/CopyButton";
import { siteUrl } from "@/lib/format";
import { AD_PLACEMENTS } from "@/lib/ads";
import { platformFeePercent } from "@/lib/connect";
import { PLANS } from "@/lib/plans";
import { EVENT_FEATURE_GROUPS, EVENT_TYPES } from "@/lib/eventOptions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "How events work on Godesi — fees, tickets and where you get listed",
  description:
    "Listing an event on Godesi is free. Sell tickets with a 2% service fee on the free plan and none on a paid plan, pick your categories and venue, add a YouTube clip and a Google Photos album, and get published on GoDesi.wiki too.",
  alternates: { canonical: "/events/how-it-works" },
};

const fee = platformFeePercent();
const typeCount = EVENT_TYPES.length;
const featureCount = EVENT_FEATURE_GROUPS.reduce(
  (total, group) => total + group.options.length,
  0,
);

const STEPS = [
  {
    title: "Post the event",
    body: "Title, description, date and start time, the town's own time zone, and whether it is in person, online or hybrid. Two minutes, no card, no approval queue for members in good standing.",
  },
  {
    title: "Pick your categories",
    body: `Choose one of ${typeCount} event types (mela, garba night, concert, puja, workshop, job fair, expo, fundraiser…), then a directory category and subcategory so the event also shows on that category's page. Paid plans add extra categories.`,
  },
  {
    title: "Pick the venue",
    body: "Start typing the banquet hall, temple or hotel and pick it from the venues other organisers already used — the address, city, state, map link and hall names fill in themselves. Online events paste a joining link instead.",
  },
  {
    title: "Add your tickets — or keep it free",
    body: "Set a price and how many seats, or add named tiers (Early bird, VIP, Family of four) with their own price and capacity. Free entry? Leave the price at 0 and there is nothing to pay us, ever.",
  },
  {
    title: "Add photos and video",
    body: "A banner image, one YouTube or Vimeo link that plays on the page, and a public Google Photos album from last year's event shown as a 3×3 gallery that opens the full album.",
  },
  {
    title: "It publishes itself",
    body: "The event goes live on Godesi events, on its category page, in the events RSS feed, with an add-to-calendar file for attendees — and on GoDesi.wiki, free.",
  },
];

const FEE_ROWS: { label: string; free: string; pro: string; premium: string }[] =
  [
    {
      label: "Listing an event",
      free: "Free, unlimited",
      pro: "Free, unlimited",
      premium: "Free, unlimited",
    },
    {
      label: "A free-entry event (no tickets)",
      free: "No fee at all",
      pro: "No fee at all",
      premium: "No fee at all",
    },
    {
      label: "Godesi service fee on paid tickets",
      free: `${fee}% of the ticket`,
      pro: "None",
      premium: "None",
    },
    {
      label: "Card processing (Stripe / PayPal)",
      free: "About 3%, paid to them",
      pro: "About 3%, paid to them",
      premium: "About 3%, paid to them",
    },
    {
      label: "When you get the money",
      free: "We collect it and send it after the event",
      pro: "We collect it and send it after the event",
      premium: "Straight into your own Stripe account",
    },
    {
      label: "Extra categories per event",
      free: "One category",
      pro: "Two extra",
      premium: "Five extra",
    },
    {
      label: "Coupon codes and reward bonuses",
      free: "Yes",
      pro: "Yes",
      premium: "Yes",
    },
    {
      label: "QR tickets with a check page for the door",
      free: "Yes",
      pro: "Yes",
      premium: "Yes",
    },
  ];

const REASONS = [
  {
    title: "The audience is already desi",
    body: "Nobody has to explain what a garba night, a satsang or an Onam sadya is. Visitors arrive on Godesi looking for their own community's events, in their own city, in their own language.",
  },
  {
    title: "One post, several sites",
    body: "The same event shows on Godesi, on GoDesi.wiki, and festival events on Diwali.cc — with our dedicated events site EventRinger.com next. You never re-type it.",
  },
  {
    title: "Real ticketing, not a form",
    body: "Card payment, an instant QR ticket by email, price tiers, coupon codes and a live seat count. No spreadsheets, no cash box, no chasing transfers.",
  },
  {
    title: "Found by searchers, not just followers",
    body: "Every event gets its own page, its own city and category listing, structured dates for Google, an RSS feed and an add-to-calendar file. A WhatsApp forward dies in a day; the page keeps working.",
  },
  {
    title: "Sell more than tickets",
    body: "Tick “vendor booths available”, “sponsorship slots open” or “stall booking open” and stall-holders and sponsors find you through the filters. We take nothing on those deals.",
  },
  {
    title: "Free featuring if you help us back",
    body: "Stand one Godesi standee at your entrance and we pin your event to the top of Godesi events for free, and design your web banners.",
  },
];

const NETWORK = [
  {
    site: "Godesi.com/events",
    status: "Live",
    body: "Your event page, plus the searchable board: city, state, category, language, date range, event type, online/offline, venue and the facilities filters.",
  },
  {
    site: "GoDesi.wiki",
    status: "Live",
    body: "The desi wiki directory publishes an “Events coming up” shelf straight from Godesi, with every card linking back to your event page. Free for your first year.",
  },
  {
    site: "Diwali.cc",
    status: "Live",
    body: "Melas, garba and Navratri nights, parades, pujas and cultural shows also appear on our festival site — automatic when your event type is a festival one.",
  },
  {
    site: "EventRinger.com",
    status: "Launching",
    body: "Our dedicated desi events site. It runs on the same feed as the sites above, so when it goes live your existing Godesi events appear there with nothing for you to do.",
  },
];

const MEDIA = [
  {
    title: "Banner image",
    body: "One landscape image (a poster works). It is the picture on your card everywhere the event travels, so keep the text large.",
  },
  {
    title: "YouTube or Vimeo clip",
    body: "Paste a normal link — https://youtu.be/abc123 or a Shorts link — and it plays inside your event page. Use last year's highlights, or the artist's own promo.",
  },
  {
    title: "Google Photos album",
    body: "Share an album publicly in Google Photos, paste the link, and the page shows a 3×3 gallery that opens the whole album. Google hosts the photos, so hundreds of pictures cost you nothing and load fast.",
  },
  {
    title: "Line-up, stages and speakers",
    body: "Add sessions with their stage and timing, and speakers with a photo and a short bio, so a two-day expo reads like a programme rather than a paragraph.",
  },
];

export default function EventFeesPage() {
  const hero = AD_PLACEMENTS.HERO;
  const leaderboard = AD_PLACEMENTS.LEADERBOARD;
  const pageUrl = `${siteUrl()}/events/how-it-works`;
  const embedSnippet = `<iframe src="${siteUrl()}/events/your-event/embed"
  width="320" height="260" loading="lazy"
  style="border:0;max-width:100%"
  title="Tickets on Godesi"></iframe>`;

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-fuchsia-600 to-rose-500 px-5 py-8 text-white sm:px-8">
          <p className="text-xs font-black uppercase tracking-wide text-white/80">
            For event organisers
          </p>
          <h1 className="mt-1 text-3xl font-black sm:text-4xl">
            Listing your event on Godesi is free 🎟️
          </h1>
          <p className="mt-2 max-w-2xl text-white/90">
            Post as many events as you like at no charge. If you sell tickets
            through us we keep {fee}% on the free plan and nothing at all on a
            paid plan — the card processor&apos;s ~3% is the only other cost.
            Free-entry events never cost you a rupee.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/events/new" variant="secondary">
              Post your event free
            </LinkButton>
            <Link
              href="/events/partner"
              className="rounded-xl border border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Get featured free 🤝
            </Link>
          </div>
        </section>

        <Card>
          <h2 className="text-lg font-bold">
            Know someone hosting an event? Send them this page 📨
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            A temple committee, a garba organiser, a college association, a
            promoter bringing an artist over — one tap and they have everything
            on this page. Listing is free for them too.
          </p>
          <ShareButtons
            url={pageUrl}
            title="Post your event free on Godesi — tickets, categories, venue, photos and video"
            className="mt-3"
          />
        </Card>

        <Card>
          <h2 className="text-lg font-bold">What it costs</h2>
          <p className="mt-1 text-sm text-slate-600">
            There is no listing fee on any plan. The only Godesi charge is a
            service fee on tickets you actually sell, and a paid plan removes
            it.
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="border-b border-slate-200 px-3 py-2">&nbsp;</th>
                  <th className="border-b border-slate-200 px-3 py-2">
                    Free — $0 / ₹0
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2">
                    Pro — ${PLANS.PRO.priceUsd} / ₹{PLANS.PRO.priceInr}
                  </th>
                  <th className="border-b border-slate-200 px-3 py-2">
                    Premium — ${PLANS.PREMIUM.priceUsd} / ₹
                    {PLANS.PREMIUM.priceInr}
                  </th>
                </tr>
              </thead>
              <tbody>
                {FEE_ROWS.map((row) => (
                  <tr key={row.label} className="align-top">
                    <th className="border-b border-slate-100 px-3 py-2 text-left font-semibold text-slate-900">
                      {row.label}
                    </th>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-600">
                      {row.free}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-600">
                      {row.pro}
                    </td>
                    <td className="border-b border-slate-100 px-3 py-2 text-slate-600">
                      {row.premium}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
            <p className="font-bold text-slate-900">
              A real example: 100 tickets at $20 = $2,000
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>
                On the free plan: Godesi&apos;s {fee}% is $40, the card
                processor takes about $60, you keep roughly $1,900.
              </li>
              <li>
                On Pro (${PLANS.PRO.priceUsd} for 30 days): Godesi takes $0, the
                processor still takes about $60, you keep roughly $1,940 — the
                plan pays for itself on the first few tickets.
              </li>
              <li>
                A free-entry mela with 5,000 visitors: $0 to list, $0 to us,
                nothing to collect.
              </li>
            </ul>
            <p className="mt-2 text-xs text-slate-500">
              Refunds and attendee disputes stay your decision — Godesi is not a
              party to the sale and does not hold your money in escrow.
            </p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <LinkButton href="/pricing">See the plans</LinkButton>
            <Link
              href="/events/new"
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Post an event
            </Link>
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">How it works, step by step</h2>
          <ol className="mt-3 grid gap-3 sm:grid-cols-2">
            {STEPS.map((step, index) => (
              <li key={step.title} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-black text-indigo-700">
                  Step {index + 1}
                </p>
                <p className="font-bold text-slate-900">{step.title}</p>
                <p className="mt-1 text-sm text-slate-600">{step.body}</p>
              </li>
            ))}
          </ol>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Why post on Godesi</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {REASONS.map((reason) => (
              <div key={reason.title} className="rounded-2xl border border-slate-200 p-4">
                <p className="font-bold text-slate-900">{reason.title}</p>
                <p className="mt-1 text-sm text-slate-600">{reason.body}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">
            Categories, filters and how people find you
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>
              <span className="font-semibold text-slate-900">
                Event type ({typeCount} of them)
              </span>{" "}
              — mela, parade, concert, DJ night, garba, comedy, theatre, film
              screening, puja and satsang, food tasting, conference, workshop,
              class, meetup, job fair, expo, sports, health camp, kids &amp;
              family, fundraiser, award night, wedding-related, picnic and more.
              This is what drives the type filter on{" "}
              <Link href="/events" className="font-semibold text-indigo-600">
                /events
              </Link>
              .
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                Directory category and subcategory
              </span>{" "}
              — pick, say, Events &amp; Wedding → DJ &amp; sound, or Religious
              &amp; Cultural → Temples, and your event also appears on that
              category&apos;s page in front of people browsing the trade.{" "}
              <Link
                href="/events/categories"
                className="font-semibold text-indigo-600"
              >
                Browse event categories →
              </Link>
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                Extra categories
              </span>{" "}
              — Free lists under one, Pro adds two more, Premium five, for
              events that genuinely belong in several places (a wedding expo is
              also a fashion show and a trade show).
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                {featureCount} facilities and ticketing tags
              </span>{" "}
              — free parking, wheelchair access, indoor or outdoor, free or paid
              food, alcohol, vegetarian options, security, family friendly, 18+,
              vendor booths, sponsorship slots, stall booking, online tickets,
              on-spot tickets, VIP passes. Attendees filter on these, so every
              tick is another way to be found.
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                Language, city, state and free tags
              </span>{" "}
              — the language the programme is in, the town it is in, and your own
              tags (Navratri, Tamil, live dhol) for the search box.
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Picking the venue</h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>
              Type the first few letters of the banquet hall, temple, gurdwara,
              hotel or community centre and pick it from the list of venues
              other organisers have already used. The address, city, state,
              country, map link and hall names fill in for you — so the same
              hall is never spelt three different ways.
            </li>
            <li>
              A new venue? Type its name and address once and it joins the list
              for everyone, with a Google Maps link attendees can tap for
              directions.
            </li>
            <li>
              Big venue? Name the hall or room (Grand Ballroom, Hall B) so
              guests do not wander.
            </li>
            <li>
              Online or hybrid events swap the address for a joining link, shown
              to ticket holders.
            </li>
            <li>
              Times are stored with the town&apos;s own time zone, so “7:30 pm
              EST” reads correctly to someone in Edison and someone in Delhi.
              Attendees get an add-to-calendar file with the right moment in it.
            </li>
            <li>
              Every venue also gets its own page —{" "}
              <Link href="/venues" className="font-semibold text-indigo-600">
                browse venues
              </Link>{" "}
              — listing everything happening there.
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">
            Photos, video and your Google Photos album
          </h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {MEDIA.map((item) => (
              <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-bold text-slate-900">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Upload the clips to YouTube (public or unlisted, Shorts are fine) and
            share the album from Google Photos — we store only the links, so
            your pages stay fast and you keep control of the files. Your
            business card on Godesi can carry more videos and album photos on a
            paid plan; an event page shows one clip and one album.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">
            Attendees put it in their calendar — so they turn up
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            Half the people who mean to come forget on the day. Every Godesi
            event page carries an <strong>Add to calendar</strong> row — Google
            Calendar, Outlook.com, and an .ics file for Apple Calendar and
            Outlook desktop — so one tap puts your event in the phone that wakes
            them up. Their own calendar then sends the reminder the night before
            and an hour ahead; nothing for you to chase.
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>
              The saved entry carries the title, the start and end time in the
              right time zone, and the venue address — so their phone can even
              tell them when to leave.
            </li>
            <li>
              Ticket buyers also get the QR ticket by email, which keeps the
              event and the directions in their inbox.
            </li>
            <li>
              Recurring classes, weekly satsangs and monthly meetups keep their
              calendar link too, so regulars re-add the next date in one tap.
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">
            Put your event on your own website — we give you the code
          </h2>
          <p className="mt-2 text-sm text-slate-700">
            Every event page has a <strong>&ldquo;Put this on your
            website&rdquo;</strong> box with a ready-made snippet. Paste it into
            your own site, your WordPress page, your temple&apos;s site or your
            society newsletter page and visitors see the poster, the date, the
            venue and a live seat count — and book without leaving your page.
            Light and dark versions, and a copy button so you never type it.
          </p>
          <div className="mt-3 rounded-2xl bg-slate-900 p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                What the snippet looks like
              </p>
              <CopyButton value={embedSnippet} label="Copy" />
            </div>
            <pre className="mt-2 overflow-x-auto text-xs leading-relaxed text-emerald-200">
              <code>{embedSnippet}</code>
            </pre>
            <p className="mt-2 text-xs text-white/60">
              Your event page hands you this with your own event&apos;s link
              filled in.
            </p>
          </div>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>
              It costs nothing and there is no limit — put it on as many pages
              as you like, and on a friend&apos;s or a sponsor&apos;s site too.
            </li>
            <li>
              Update the date, price or venue on Godesi once and every embed
              updates itself — no re-editing your website.
            </li>
            <li>
              Prefer a link? Every event also has share buttons for WhatsApp,
              Facebook and X, an RSS feed of your city&apos;s events, and a QR
              code you can print on a poster.
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">
            Where your event gets published
          </h2>
          <div className="mt-3 space-y-3">
            {NETWORK.map((item) => (
              <div
                key={item.site}
                className="rounded-2xl border border-slate-200 p-4"
              >
                <p className="flex flex-wrap items-center gap-2 font-bold text-slate-900">
                  {item.site}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-black uppercase ${
                      item.status === "Live"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </p>
                <p className="mt-1 text-sm text-slate-600">{item.body}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Wherever it travels, the card links back to your event page on
            Godesi, so the tickets, the venue and the enquiries all stay in one
            place. We publish only what you put on the event — no private
            number, email or address goes out unless you typed it in as public
            contact detail.
          </p>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">
            Want more than a listing? Ways to stand out
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-700">
            <li>
              <span className="font-semibold text-slate-900">
                Free featuring with a standee
              </span>{" "}
              — put one Godesi standee at your entrance, send us the photo, and
              your event is pinned to the top of Godesi events at no charge,
              banner artwork included.{" "}
              <Link
                href="/events/partner"
                className="font-semibold text-indigo-600"
              >
                How the standee offer works →
              </Link>
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                A paid banner across the site
              </span>{" "}
              — the homepage hero is ${hero.priceUsd} / ₹{hero.priceInr} a month
              and the in-content leaderboard ${leaderboard.priceUsd} / ₹
              {leaderboard.priceInr}, rotating with other advertisers, or buy
              impressions by the pack.{" "}
              <Link href="/advertise" className="font-semibold text-indigo-600">
                See all placements →
              </Link>
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                Coupons and reward points
              </span>{" "}
              — issue a discount code with its own percentage and a limit on how
              many times it can be used, and advertise a bonus for buyers (free
              thali, gift bag, lucky draw) next to the ticket box.
            </li>
            <li>
              <span className="font-semibold text-slate-900">
                A Pro or Premium plan
              </span>{" "}
              — removes our ticket fee, adds the featured badge, extra
              categories and higher ranking in search.{" "}
              <Link href="/pricing" className="font-semibold text-indigo-600">
                Compare plans →
              </Link>
            </li>
          </ul>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Questions organisers ask</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="font-bold text-slate-900">
                Is there really no listing fee?
              </dt>
              <dd className="text-slate-600">
                None. Post one event or fifty. We earn from ticket service fees
                on the free plan, from plans, and from advertising.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900">
                Do you take a cut of stalls or sponsorships?
              </dt>
              <dd className="text-slate-600">
                No. Vendors and sponsors who find you through Godesi deal with
                you directly and we take nothing.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900">
                Can I sell tickets somewhere else and still list here?
              </dt>
              <dd className="text-slate-600">
                Yes — put your own ticket link in the website field and we send
                people to it. No ticket sold on Godesi, no fee.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900">
                How do attendees get in?
              </dt>
              <dd className="text-slate-600">
                Every booking emails a QR ticket with its own code. At the gate,
                open the code (or point a phone camera at the QR) and the ticket
                page shows the buyer, the tier and whether it is valid. Your
                event page keeps a live count of seats sold and left.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900">
                When do I get paid, and who handles refunds?
              </dt>
              <dd className="text-slate-600">
                On Free and Pro we collect the money and send it after the
                event, minus the processor&apos;s charge. On Premium the money
                lands in your own Stripe account as tickets sell. Refunds are
                yours to decide.
              </dd>
            </div>
            <div>
              <dt className="font-bold text-slate-900">
                Is it a recurring class or a weekly satsang?
              </dt>
              <dd className="text-slate-600">
                Mark it recurring and describe the pattern (every Sunday, first
                Saturday) — it stays on the board instead of expiring after one
                date.
              </dd>
            </div>
          </dl>
        </Card>

        <section className="rounded-3xl bg-slate-900 px-5 py-8 text-white sm:px-8">
          <h2 className="text-2xl font-black">
            Post it once. Get found everywhere.
          </h2>
          <p className="mt-2 max-w-2xl text-white/80">
            Free listing, {fee}% on tickets you sell (nothing on a paid plan),
            and the same event published on Godesi and GoDesi.wiki.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <LinkButton href="/events/new" variant="secondary">
              Post your event free
            </LinkButton>
            <Link
              href="/events"
              className="rounded-xl border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              See what is on
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-white/40 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
            >
              Ask us anything
            </Link>
          </div>
          <div className="mt-5 border-t border-white/15 pt-4">
            <p className="text-sm font-semibold text-white/80">
              Pass it on to a friend who is hosting something 👇
            </p>
            <ShareButtons
              url={pageUrl}
              title="Post your event free on Godesi — tickets, categories, venue, photos and video"
              className="mt-3"
            />
          </div>
        </section>
      </div>

      <SidebarBanners />
    </div>
  );
}
