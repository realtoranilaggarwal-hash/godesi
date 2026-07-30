import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { SidebarBanners } from "@/components/Banners";
import { ShareAnchor } from "@/components/ShareAnchor";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "FAQ — everything you need to know",
  description:
    "What Godesi is, why to use it, and how listings, leads, tickets, property, weddings, temples, ads, points and claims work.",
};

function slugify(question: string) {
  return question
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

/** Every answer is useful only if the visitor can act on it straight away. */
const ACTIONS: { href: string; label: string }[] = [
  { href: "/signup", label: "📇 List your business free" },
  { href: "/listings/new", label: "🛍 Post a listing (sell anything)" },
  { href: "/leads/new", label: "🎯 Post a requirement / hire someone" },
  { href: "/leads", label: "🔎 Browse buyer requirements" },
  { href: "/events/new", label: "🎉 Post an event & sell tickets" },
  { href: "/real-estate", label: "🏠 Property, rentals & roommates" },
  { href: "/wedding", label: "💍 Find or offer wedding services" },
  { href: "/religious/new", label: "🛕 Add a temple or religious service" },
  { href: "/news/report", label: "📰 Share news as a member" },
  { href: "/journalists", label: "🎙 Become a local journalist" },
  { href: "/desi-elite/apply", label: "🏆 Apply for GoDesi Elite" },
  { href: "/live/submit", label: "🎧 Add your radio or TV channel" },
  { href: "/live-radio", label: "🎧 Listen to desi radio" },
  { href: "/live-tv", label: "📺 Watch desi TV" },
  { href: "/dashboard/rewards", label: "🪙 Your points wallet" },
  { href: "/leaderboard", label: "🏅 Top contributors" },
  { href: "/advertise", label: "📢 Advertise on Godesi" },
  { href: "/website", label: "🌐 Get a website for $99" },
  { href: "/connect", label: "🤝 Connect & meet-ups" },
  { href: "/live", label: "💬 Global chat & live visitors" },
  { href: "/alumni", label: "🎓 Find your batchmates" },
  { href: "/resources", label: "🔗 Useful resources" },
  { href: "/pricing", label: "💎 Membership plans" },
  { href: "/report", label: "🛡 Report an issue" },
];

const FAQS: { q: string; a: React.ReactNode; id?: string }[] = [
  {
    q: "🌍 What is Godesi?",
    a: (
      <>
        <p>
          Godesi is a global desi platform that combines a business directory,
          professional network, lead marketplace, event platform and community
          hub — all in one place.
        </p>
        <p>You can:</p>
        <ul>
          <li>Discover businesses and professionals</li>
          <li>Post your requirements and get responses</li>
          <li>Promote and sell event tickets</li>
          <li>List real estate, rentals and roommates</li>
          <li>Find wedding vendors and services</li>
          <li>Explore temples, religious services and community events</li>
          <li>Stay updated with curated desi news</li>
        </ul>
        <p>
          Think of Godesi as your digital identity + marketplace + community
          network, built for desis worldwide.
        </p>
      </>
    ),
  },
  {
    q: "🚀 Why should I list my business or profile on Godesi?",
    a: (
      <>
        <p>
          Because Godesi is built for visibility, trust and direct connections.
        </p>
        <p>When you list:</p>
        <ul>
          <li>
            You get a shareable profile page (like a digital business card)
          </li>
          <li>
            A QR code you can use on visiting cards, WhatsApp and social media
          </li>
          <li>A WhatsApp button so customers can contact you instantly</li>
          <li>Access to real buyers posting requirements (leads)</li>
          <li>The ability to promote events, services and listings</li>
        </ul>
        <p>
          👉 Most importantly: customers contact you directly — no middleman.{" "}
          <Link href="/signup">List free</Link>.
        </p>
      </>
    ),
  },
  {
    q: "💼 Can professionals (realtors, attorneys, astrologers, consultants) join?",
    a: (
      <>
        <p>Yes. Godesi supports both:</p>
        <ul>
          <li>Businesses (companies, shops, services)</li>
          <li>
            Professionals (individual experts like realtors, lawyers,
            astrologers, consultants)
          </li>
        </ul>
        <p>
          You get a personal profile plus a professional presence, which makes
          it perfect for independent service providers. See{" "}
          <Link href="/categories/professionals">
            Professionals &amp; Experts
          </Link>
          .
        </p>
      </>
    ),
  },
  {
    q: "💸 Is it really free?",
    a: (
      <>
        <p>Yes. You can start completely free.</p>
        <p>The Free plan includes:</p>
        <ul>
          <li>Your profile page</li>
          <li>Up to 5 images</li>
          <li>QR code</li>
          <li>WhatsApp contact button</li>
          <li>Basic visibility in search</li>
        </ul>
        <p>Paid plans unlock:</p>
        <ul>
          <li>Up to 20 images</li>
          <li>Visible phone number and email</li>
          <li>Featured badge</li>
          <li>Higher ranking in search</li>
          <li>Access to leads (buyer requirements)</li>
        </ul>
        <p>
          👉 You can upgrade any time as your business grows — see{" "}
          <Link href="/pricing">pricing</Link>.
        </p>
      </>
    ),
  },
  {
    q: "🎯 How do leads (buyer requirements) work?",
    a: (
      <>
        <p>Customers post what they need, for example:</p>
        <ul>
          <li>“Looking for a wedding photographer in New Jersey”</li>
          <li>“Need a 2BHK apartment under $2,000”</li>
        </ul>
        <p>Each requirement includes budget, location and a description.</p>
        <p>
          👉 Premium members can unlock and contact these leads directly, so
          customers are already looking for you instead of you chasing them.{" "}
          <Link href="/leads">Browse leads</Link>.
        </p>
      </>
    ),
  },
  {
    q: "🎉 Can I post events and sell tickets?",
    a: (
      <>
        <p>Yes — Godesi includes a full event and ticketing system. You can:</p>
        <ul>
          <li>
            Create events (cultural, religious, business, weddings and more)
          </li>
          <li>Set ticket price and number of seats</li>
          <li>Accept online payments</li>
          <li>Generate QR-based tickets</li>
        </ul>
        <p>
          Customers get an email confirmation and a scannable QR ticket for
          entry — perfect for organisers, temples, communities and businesses.{" "}
          <Link href="/events/new">Post an event</Link>.
        </p>
      </>
    ),
  },
  {
    q: "🏠 Can I list property, rentals, or find roommates?",
    a: (
      <>
        <p>Yes. Godesi supports:</p>
        <ul>
          <li>Property sales (buy/sell)</li>
          <li>Rentals (apartments, homes, offices)</li>
          <li>Roommate matching (need a room / have a room)</li>
        </ul>
        <p>
          Listings include photos, location, budget or rent and preferences, and
          direct WhatsApp contact keeps it fast. See{" "}
          <Link href="/real-estate">real estate</Link> and{" "}
          <Link href="/rooms">rooms</Link>.
        </p>
      </>
    ),
  },
  {
    q: "💍 What about wedding services?",
    a: (
      <>
        <p>Godesi has a complete wedding marketplace. You can list or find:</p>
        <ul>
          <li>Photographers &amp; videographers</li>
          <li>Makeup artists</li>
          <li>Caterers</li>
          <li>DJs &amp; entertainment</li>
          <li>Wedding planners</li>
          <li>Venues</li>
          <li>Decorators</li>
        </ul>
        <p>
          👉 Users can also post wedding requirements and vendors respond.{" "}
          <Link href="/wedding">Wedding marketplace</Link>.
        </p>
      </>
    ),
  },
  {
    q: "🛕 Does Godesi include temples and religious services?",
    a: (
      <>
        <p>Yes. Godesi features:</p>
        <ul>
          <li>Temples, gurudwaras, mosques and churches</li>
          <li>Religious events and festivals</li>
          <li>Community gatherings</li>
        </ul>
        <p>
          We combine basic public data, user submissions and event updates,
          which makes it a living spiritual and community directory.{" "}
          <Link href="/religious">Explore temples</Link>.
        </p>
      </>
    ),
  },
  {
    q: "📰 What is the news section?",
    a: (
      <>
        <p>
          Godesi shows curated desi news from trusted sources: headlines with
          images, short summaries and regular updates, so the platform stays
          active and engaging daily. <Link href="/news">Read the news</Link>.
        </p>
      </>
    ),
  },
  {
    id: "qr",
    q: "📲 How does the QR code help me?",
    a: (
      <>
        <p>
          Each user gets a unique QR code linked to their profile. Use it on
          visiting cards, flyers, WhatsApp and social media — anyone scanning it
          sees your full profile instantly.
        </p>
      </>
    ),
  },
  {
    q: "🔗 Can I share my profile easily?",
    a: (
      <>
        <p>Yes. Every profile can be:</p>
        <ul>
          <li>Shared on WhatsApp</li>
          <li>Copied as a link</li>
          <li>Used as a digital business card</li>
        </ul>
        <p>
          👉 For example: <code>godesi.com/yourname</code> — set your handle in{" "}
          <Link href="/dashboard/me">your profile</Link>.
        </p>
      </>
    ),
  },
  {
    q: "🏆 How do Godesi points work?",
    a: (
      <>
        <p>
          Points are Godesi&apos;s recognition and rewards programme. They are not
          money and have no cash value — they simply reward the people who build
          the community.
        </p>
        <p>You earn points when:</p>
        <ul>
          <li>Someone joins using your referral link (+5)</li>
          <li>You post a listing or an event (+2)</li>
          <li>You review a business (+1)</li>
          <li>Your referral completes a profile, upgrades or posts</li>
          <li>You spend money with Godesi — 1 point for every $1</li>
        </ul>
        <p>You can spend points on:</p>
        <ul>
          <li>Featuring your listing</li>
          <li>Unlocking a buyer&apos;s contact details on a requirement</li>
          <li>Banner ads and promotion</li>
        </ul>
        <p>
          Your profile shows a <strong>Contribution Score</strong> bar with your
          Elite / Premium / Member badge, and the biggest contributors appear on
          the leaderboard.
        </p>
        <p>
          👉 <Link href="/dashboard/rewards">Your points wallet</Link> ·{" "}
          <Link href="/leaderboard">Top contributors</Link> ·{" "}
          <Link href="/rewards">Refer &amp; earn</Link>
        </p>
      </>
    ),
  },
  {
    q: "🎧 How do Live Radio and Live TV work?",
    a: (
      <>
        <p>
          Godesi plays desi radio stations and news channels through the
          broadcasters&apos; own official players, so the audio keeps going in the
          floating mini player while you browse. Nothing is hosted or
          re-streamed by Godesi.
        </p>
        <ul>
          <li>
            <Link href="/live-radio">🎧 Listen live</Link> — 20 built-in stations
            (Hindi, Punjabi, Tamil, Gurbani, UK and US desi radio) plus a free
            search across thousands more that play inside Godesi
          </li>
          <li>
            <Link href="/live-tv">📺 Watch live</Link> — desi news channels in
            Hindi, English, Marathi, Malayalam, Kannada and Tamil
          </li>
          <li>
            Every card has a <strong>🚩 Not working?</strong> button — tell us and
            we fix or remove it
          </li>
        </ul>
        <p>
          Own a station or channel?{" "}
          <Link href="/live/submit">Submit it here</Link> — $50/month carriage,{" "}
          <strong>free</strong> for charity, non-profit and community stations,
          and a premium package if you want to be featured at the top. Our team
          approves everything before it appears.
        </p>
      </>
    ),
  },
  {
    q: "🏆 What is GoDesi Elite?",
    a: (
      <>
        <p>
          GoDesi Elite is our recognition directory for outstanding desi
          business owners and professionals. You can apply yourself or nominate
          someone you admire, our team interviews you, and your profile is
          published with a video and your business awards.
        </p>
        <ul>
          <li>$50 one-time interview fee including a 30–60 second video</li>
          <li>$500 three-minute professional film from the content you supply</li>
          <li>$100 / $250 / $500 placement boosts — higher spend ranks higher</li>
          <li>Every nominee is invited to the annual GoDesi Elite Awards</li>
        </ul>
        <p>
          👉 <Link href="/desi-elite">Elite Directory</Link> ·{" "}
          <Link href="/desi-elite/apply">Apply or nominate</Link> ·{" "}
          <Link href="/desi-elite/awards">🏆 Awards ceremony</Link>
        </p>
      </>
    ),
  },
  {
    q: "💬 Can I chat with other desis?",
    a: (
      <>
        <p>
          Yes — the <Link href="/live">live visitor page</Link> has a global chat
          room where members online right now can chit-chat. Sign in to post,
          keep it friendly, and use the 🚩 button on any message that breaks the
          rules; our team reviews reports and can remove messages and accounts.
        </p>
        <p>
          Links are stripped from chat messages to keep spam out. For business
          conversations use{" "}
          <Link href="/connect">Connect</Link> or WhatsApp the member directly
          from their profile.
        </p>
      </>
    ),
  },
  {
    q: "📢 How does advertising work?",
    a: (
      <>
        <p>You can promote your business using:</p>
        <ul>
          <li>Sidebar banners (300×250)</li>
          <li>Header banners</li>
          <li>Featured listings</li>
        </ul>
        <p>
          Your dashboard shows impressions, clicks and performance — simple,
          measurable advertising built into the platform.{" "}
          <Link href="/advertise">Advertise on Godesi</Link>.
        </p>
      </>
    ),
  },
  {
    q: "🌍 Which countries does Godesi support?",
    a: (
      <>
        <p>Godesi is global.</p>
        <ul>
          <li>Works in the USA, India, UK and beyond</li>
          <li>Supports multiple currencies</li>
          <li>Shows relevant pricing based on visitor location</li>
        </ul>
        <p>👉 Built for the global desi community.</p>
      </>
    ),
  },
  {
    q: "🔒 Where does your data come from?",
    a: (
      <>
        <p>Godesi uses:</p>
        <ul>
          <li>User-submitted listings</li>
          <li>Claimable starter listings</li>
          <li>Public/open data (limited and compliant)</li>
        </ul>
        <p>👉 We do NOT copy or scrape other platforms.</p>
      </>
    ),
  },
  {
    q: "🛠 I found my business already listed. What do I do?",
    a: (
      <>
        <p>You can claim it:</p>
        <ol>
          <li>Open your listing</li>
          <li>Click “Is this your business? Claim it”</li>
          <li>Verify ownership</li>
        </ol>
        <p>
          Once approved you can edit everything and add photos, services and
          contact details.
        </p>
      </>
    ),
  },
  {
    q: "❌ How do I remove my listing or data?",
    a: (
      <>
        <p>
          Just email{" "}
          <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>. We
          verify your request and remove your data — your privacy matters. See
          our <Link href="/privacy">privacy policy</Link>.
        </p>
      </>
    ),
  },
  {
    q: "🤝 Why is Godesi worth using?",
    a: (
      <>
        <p>Because it combines everything in one place:</p>
        <ul>
          <li>Visibility (directory)</li>
          <li>Leads (requirements)</li>
          <li>Trust (profiles + reviews)</li>
          <li>Growth (ads + referrals)</li>
          <li>Community (events + temples + news)</li>
        </ul>
        <p>👉 Instead of using five different platforms, you use one.</p>
      </>
    ),
  },
  {
    q: "🗂 What can I list in each category?",
    a: (
      <>
        <p>
          Godesi has 15 categories and 130+ subcategories. Pick the closest one
          — it decides which searches, filters and “Recommended links” boxes you
          appear in.
        </p>
        <ul>
          <li>
            <strong>🏠 Home Services</strong> — plumbers, electricians,
            carpenters, AC repair, painters, pest control, packers &amp; movers,
            interior designers, appliance repair, plus everyday helpers: home
            cleaning, housekeeping &amp; maid service, car wash &amp; detailing,
            babysitting &amp; nanny, elder care, snow removal &amp; yard work
            and handyman/odd jobs. If you personally offer “I&apos;ll clean your
            house” or “I&apos;ll wash your car”, this is your category.
          </li>
          <li>
            <strong>🎓 Education &amp; Training</strong> — home tutors, coaching
            centres, playschools and daycare, music, dance and language classes,
            computer training, study-abroad consultants and sports coaching.
          </li>
          <li>
            <strong>💼 Business &amp; IT Services</strong> — chartered
            accountants, tax and GST consultants, lawyers, printing and signage,
            web and app development, digital marketing, courier and logistics,
            staffing and insurance.
          </li>
          <li>
            <strong>🍛 Food &amp; Catering</strong> — restaurants, sweet shops,
            caterers, tiffin services, cloud kitchens, street food, cooks &amp;
            chefs and cooking at home for people who cook to order from their
            own kitchen.
          </li>
          <li>
            <strong>🛒 Grocery &amp; Daily Needs</strong> — desi grocery stores,
            spice shops, bakeries, dairy, meat and organic suppliers.
          </li>
          <li>
            <strong>💇 Beauty &amp; Wellness</strong> — salons, spas, mehndi
            artists, bridal makeup, ayurveda, yoga and fitness trainers.
          </li>
          <li>
            <strong>🏥 Health &amp; Medical</strong> — doctors, dentists,
            physiotherapy, diagnostics, pharmacies and mental-health support.
          </li>
          <li>
            <strong>💍 Weddings &amp; Events</strong> — photographers,
            videographers, makeup artists, decorators, DJs, planners, venues and
            priests.
          </li>
          <li>
            <strong>🏢 Real Estate &amp; Homes</strong> — real estate agents
            (see the agent profile below), flats for sale and rent, plots,
            commercial property, builders, home loans and property management.
          </li>
          <li>
            <strong>🛏 Rooms &amp; Roommates</strong> — need a room, have a room,
            shared apartments, PG and student housing.
          </li>
          <li>
            <strong>✈️ Travel &amp; Transport</strong> — travel agents, carpool
            &amp; rideshare, taxis, tempo travellers and buses, hotels,
            homestays, visa help, pilgrimage tours and car rentals.
          </li>
          <li>
            <strong>🪔 Religious &amp; Cultural</strong> — temples, gurudwaras,
            mosques and churches, pandits, astrologers, pooja samagri and katha.
          </li>
          <li>
            <strong>🎓 Professionals &amp; Experts</strong> — real estate
            agents, attorneys, accountants, astrologers, consultants, insurance
            agents, financial advisors, immigration consultants and
            doctors/therapists. Choose this if you are an individual expert
            rather than a shop.
          </li>
          <li>
            <strong>🛍 Buy &amp; Sell Marketplace</strong> — second-hand
            electronics, furniture, vehicles, appliances and books.
          </li>
          <li>
            <strong>👷 Jobs &amp; Staffing</strong> — drivers, cooks, maids,
            security guards, sales roles and placement consultants.
          </li>
        </ul>
        <p>
          Not sure? Use <Link href="/post">+ Post</Link> — pick what you are
          posting, then the category, and the right form opens with everything
          pre-filled.
        </p>
      </>
    ),
  },
  {
    q: "🏡 I am a real estate agent — what do I get?",
    a: (
      <>
        <p>
          Agents get a full profile page, not just a card. From{" "}
          <Link href="/dashboard/agent">your agent credentials page</Link> you
          add:
        </p>
        <ul>
          <li>
            Headline stats: total sales volume, years of experience,
            transactions and average price
          </li>
          <li>
            Service areas — every town you cover, so local searches find you
          </li>
          <li>Licence number, licensing state and your brokerage</li>
          <li>Designations, certifications and awards by year</li>
          <li>
            Specialties: buyers, sellers, rentals, residential, commercial,
            investment
          </li>
          <li>
            A recent-sales table with date, address, price and the side you
            represented
          </li>
          <li>Your live property listings, shown as “Available listings”</li>
        </ul>
        <p>
          Clients reviewing you also rate local knowledge, process expertise,
          responsiveness and negotiation, which appear as averages on your
          profile.
        </p>
      </>
    ),
  },
  {
    q: "🎟 How do discount coupons work?",
    a: (
      <>
        <p>Coupons work in two directions:</p>
        <ul>
          <li>
            <strong>Godesi coupons</strong> — we issue codes you can pass to
            clients for membership upgrades, advertising or event tickets. Each
            code has a percent or fixed discount, an expiry date and a usage
            limit.
          </li>
          <li>
            <strong>Your own coupons</strong> — event organisers create codes
            for their own tickets from{" "}
            <Link href="/dashboard/coupons">your coupons page</Link> and share
            them with customers, e.g. an early-bird or community discount.
          </li>
        </ul>
        <p>
          Buyers enter the code at checkout; we validate the scope, expiry and
          remaining uses before the discount applies.
        </p>
      </>
    ),
  },
  {
    q: "🔗 What are Resources / important links?",
    a: (
      <>
        <p>
          <Link href="/resources">Resources</Link> is a curated set of useful
          links — visas, taxes, remittances, travel and community services —
          filtered by category.
        </p>
        <p>
          You can buy a spot in the “Recommended links” box shown on category
          pages, business cards and property listings from{" "}
          <Link href="/resources/new">Advertise a link</Link>: $10 per 1,000
          views, packs of 1,000 / 5,000 / 10,000. No artwork needed, sponsored
          links are labelled, and your link retires itself the moment the views
          you paid for are delivered.
        </p>
      </>
    ),
  },
  {
    q: "🤝 What is Connect?",
    a: (
      <>
        <p>
          <Link href="/connect">Connect</Link> is for meeting other desis for
          professional and community reasons — networking, industry discussions,
          mentorship, cultural meetups, workshops, local community groups,
          fitness, hobbies and family-friendly activities.
        </p>
        <p>
          It is <strong>not</strong> a dating service. Profiles are moderated,
          adult or dating-style content is removed and the account blocked, and
          you can report or block anyone.
        </p>
      </>
    ),
  },
  {
    q: "🚗 Can I offer or find a carpool?",
    a: (
      <>
        <p>
          Yes — post under Travel &amp; Transport → Carpool &amp; Rideshare with
          your route, city and timings. Riders contact you on WhatsApp directly;
          Godesi does not take a cut or handle the money. Please share costs
          only and follow your local rules on paid rides.
        </p>
      </>
    ),
  },
  {
    q: "🛡️ How do I hire safely, and what if something goes wrong?",
    a: (
      <>
        <p>
          Before hiring anyone: check their profile, images and reviews; speak
          directly on WhatsApp or phone; ask for samples or references; get the
          price, deliverables and timeline confirmed in writing; use a clear
          agreement rather than a verbal promise; avoid paying the full amount in
          advance and keep proof of every payment; read other members&apos; reviews;
          and if something feels off, take your time before committing.
        </p>
        <p>
          Buying or selling an item? Verify the seller, pay on collection, meet in a
          busy public place, test the item, check documents for vehicles and
          property, and treat prices far below market or pressure to decide
          instantly as red flags.
        </p>
        <p>
          Godesi is a listing platform and is not a party to any transaction — we
          never hold money. We do review complaints and may warn, suspend or remove
          accounts. Full guide:{" "}
          <Link href="/safety">Trust &amp; safety</Link>. Something wrong?{" "}
          <Link href="/report">Report an issue</Link>.
        </p>
      </>
    ),
  },
];

export default function FaqPage() {
  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1">
        <LegalPage title="Godesi FAQ — everything you need to know">
          <p>
            Still stuck? Write to{" "}
            <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
          </p>

          <h2>⚡ Do it now — direct links</h2>
          <div className="not-prose grid gap-2 sm:grid-cols-2">
            {ACTIONS.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50"
              >
                {action.label}
              </Link>
            ))}
          </div>


          {FAQS.map((faq, index) => {
            const anchor = faq.id ?? slugify(faq.q);
            return (
              <details
                key={faq.q}
                id={anchor}
                open={index === 0}
                className="group scroll-mt-24 rounded-xl border border-slate-200 open:bg-slate-50/60"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-base font-bold text-slate-900">
                  {faq.q}
                  <span className="text-slate-400 transition group-open:rotate-180">
                    ▾
                  </span>
                </summary>
                <div className="space-y-3 px-4 pb-4">
                  {faq.a}
                  <ShareAnchor anchor={anchor} title={faq.q} />
                </div>
              </details>
            );
          })}

          <h2>🚀 Final thought</h2>
          <p>
            Godesi is not just a listing site. It is your digital identity,
            growth engine and community network. 👉{" "}
            <Link href="/signup">Start free</Link> and grow as you need.
          </p>
        </LegalPage>
      </div>

      <SidebarBanners />
    </div>
  );
}
