import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/LegalPage";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ — everything you need to know",
  description:
    "What Godesi is, why to use it, and how listings, leads, tickets, property, weddings, temples, ads, points and claims work.",
};

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "🌍 What is Godesi?",
    a: (
      <>
        <p>
          Godesi is a global desi platform that combines a business directory, professional
          network, lead marketplace, event platform and community hub — all in one place.
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
          Think of Godesi as your digital identity + marketplace + community network, built
          for desis worldwide.
        </p>
      </>
    ),
  },
  {
    q: "🚀 Why should I list my business or profile on Godesi?",
    a: (
      <>
        <p>Because Godesi is built for visibility, trust and direct connections.</p>
        <p>When you list:</p>
        <ul>
          <li>You get a shareable profile page (like a digital business card)</li>
          <li>A QR code you can use on visiting cards, WhatsApp and social media</li>
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
            Professionals (individual experts like realtors, lawyers, astrologers,
            consultants)
          </li>
        </ul>
        <p>
          You get a personal profile plus a professional presence, which makes it perfect
          for independent service providers. See{" "}
          <Link href="/categories/professionals">Professionals &amp; Experts</Link>.
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
          👉 Premium members can unlock and contact these leads directly, so customers are
          already looking for you instead of you chasing them.{" "}
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
          <li>Create events (cultural, religious, business, weddings and more)</li>
          <li>Set ticket price and number of seats</li>
          <li>Accept online payments</li>
          <li>Generate QR-based tickets</li>
        </ul>
        <p>
          Customers get an email confirmation and a scannable QR ticket for entry —
          perfect for organisers, temples, communities and businesses.{" "}
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
          Listings include photos, location, budget or rent and preferences, and direct
          WhatsApp contact keeps it fast. See{" "}
          <Link href="/real-estate">real estate</Link> and <Link href="/rooms">rooms</Link>
          .
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
          We combine basic public data, user submissions and event updates, which makes it
          a living spiritual and community directory.{" "}
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
          Godesi shows curated desi news from trusted sources: headlines with images, short
          summaries and regular updates, so the platform stays active and engaging daily.{" "}
          <Link href="/news">Read the news</Link>.
        </p>
      </>
    ),
  },
  {
    q: "📲 How does the QR code help me?",
    a: (
      <>
        <p>
          Each user gets a unique QR code linked to their profile. Use it on visiting
          cards, flyers, WhatsApp and social media — anyone scanning it sees your full
          profile instantly.
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
    q: "🏆 What are reward points?",
    a: (
      <>
        <p>Godesi includes a Refer &amp; Earn system. You earn points when:</p>
        <ul>
          <li>Someone joins using your referral link</li>
          <li>They create a profile</li>
          <li>They upgrade or post</li>
        </ul>
        <p>You can use points to:</p>
        <ul>
          <li>Buy banner ads</li>
          <li>Upgrade your listing</li>
          <li>Promote your business or event</li>
        </ul>
        <p>
          👉 Turn your network into growth —{" "}
          <Link href="/dashboard/rewards">Refer &amp; Earn</Link>.
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
          Your dashboard shows impressions, clicks and performance — simple, measurable
          advertising built into the platform.{" "}
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
          Once approved you can edit everything and add photos, services and contact
          details.
        </p>
      </>
    ),
  },
  {
    q: "❌ How do I remove my listing or data?",
    a: (
      <>
        <p>
          Just email <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>. We
          verify your request and remove your data — your privacy matters. See our{" "}
          <Link href="/privacy">privacy policy</Link>.
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
];

export default function FaqPage() {
  return (
    <LegalPage title="Godesi FAQ — everything you need to know">
      <p>
        Still stuck? Write to{" "}
        <a href={`mailto:${SITE.supportEmail}`}>{SITE.supportEmail}</a>.
      </p>

      {FAQS.map((faq) => (
        <div key={faq.q}>
          <h2>{faq.q}</h2>
          {faq.a}
        </div>
      ))}

      <h2>🚀 Final thought</h2>
      <p>
        Godesi is not just a listing site. It is your digital identity, growth engine and
        community network. 👉 <Link href="/signup">Start free</Link> and grow as you need.
      </p>
    </LegalPage>
  );
}
