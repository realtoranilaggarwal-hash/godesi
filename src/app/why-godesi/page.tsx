import type { Metadata } from "next";
import Link from "next/link";
import { HandleClaim } from "@/components/HandleClaim";
import { Card, LinkButton } from "@/components/ui";
import { getCategoryTree } from "@/lib/directory";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Why Godesi — everything you get with your free desi page",
  description:
    "Your own godesi.com/name page with QR code and WhatsApp button, plus a business card, buyer requirements, events and tickets, rooms and property, temples and community news — what Godesi gives the desi community, free.",
  alternates: { canonical: "/why-godesi" },
};

type Item = { title: string; body: string; href?: string; free: boolean };

const GROUPS: { heading: string; blurb: string; items: Item[] }[] = [
  {
    heading: "Your name and your page",
    blurb: "The bit everyone starts with — one link that is yours.",
    items: [
      {
        title: "godesi.com/yourname",
        body: "A short link for your photo, headline, town, what you do, your links and videos. Names are unique, so the one you take is yours.",
        href: "/claim",
        free: true,
      },
      {
        title: "QR code",
        body: "A personal QR and a separate business QR you can download and print on visiting cards, flyers, menus or the shop window.",
        free: true,
      },
      {
        title: "WhatsApp button",
        body: "Customers tap and the chat opens with your number already filled in — no forms, no waiting for email.",
        free: true,
      },
      {
        title: "Share row",
        body: "One tap to send your page to WhatsApp, Facebook, X, LinkedIn, Telegram or copy the link.",
        free: true,
      },
      {
        title: "Digital business card",
        body: "If you run a shop or work for clients, your page carries a full card: photos, services, hours, address, map, reviews.",
        href: "/add-business",
        free: true,
      },
    ],
  },
  {
    heading: "Getting found",
    blurb: "Being listed is not the same as being found — these do the finding.",
    items: [
      {
        title: "The directory",
        body: "Every desi trade there is, across the desi world; people search by trade and town and land on your card.",
        href: "/categories",
        free: true,
      },
      {
        title: "Buyer requirements",
        body: "People post what they need — a caterer for 200, a tutor for maths, a plumber today. You reply and win the job.",
        href: "/leads",
        free: true,
      },
      {
        title: "Ask Godesi",
        body: "Our search answers questions in plain words (\u201cfind me a caterer in New Jersey\u201d) with real listings.",
        free: true,
      },
      {
        title: "Featured placement",
        body: "Paid: sit at the top of your category and town, with a highlighted card.",
        href: "/pricing",
        free: false,
      },
      {
        title: "Banner advertising and text links",
        body: "Paid: ten banner spots across the site, each with a page showing exactly where it appears, plus cheap text links.",
        href: "/advertise",
        free: false,
      },
    ],
  },
  {
    heading: "Community",
    blurb: "The reason people come back when they are not shopping.",
    items: [
      {
        title: "People and Professionals",
        body: "Every member has a page; complete a professional profile and you appear in the professionals directory automatically.",
        href: "/professionals",
        free: true,
      },
      {
        title: "GoDesi Elite",
        body: "Recognition for desi founders, professionals and community leaders — reviewed by our desk, not automatic.",
        href: "/desi-elite",
        free: false,
      },
      {
        title: "Connect and alumni",
        body: "Meet desi people near you, and find batchmates from your college or school.",
        href: "/connect",
        free: true,
      },
      {
        title: "News, blogs and the wall",
        body: "Daily desi headlines, community stories you can write yourself, and the social wall.",
        href: "/news",
        free: true,
      },
      {
        title: "Live radio and TV",
        body: "Listen to desi radio and watch desi channels; add your own station or channel.",
        href: "/live-radio",
        free: true,
      },
      {
        title: "Temples and nonprofits",
        body: "Temples, gurdwaras, mosques, churches and community organisations, with their timings and services.",
        href: "/religious",
        free: true,
      },
    ],
  },
  {
    heading: "Doing business",
    blurb: "Money things — selling tickets, renting rooms, hiring.",
    items: [
      {
        title: "Events and tickets",
        body: "Post an event, sell up to eight kinds of ticket, take free RSVPs, scan a QR pass at the door — and keep more than Eventbrite leaves you.",
        href: "/events/how-it-works",
        free: true,
      },
      {
        title: "Property and rooms",
        body: "Homes to buy or rent and rooms to share, with the details desi families actually ask for.",
        href: "/real-estate",
        free: true,
      },
      {
        title: "Wedding services",
        body: "Venues, caterers, decorators, mehndi, photographers, DJs, pandits — the whole wedding in one place.",
        href: "/wedding",
        free: true,
      },
      {
        title: "Marketplace and resources",
        body: "Sell what you no longer need, and pick up deals and useful services the community shares.",
        href: "/marketplace",
        free: true,
      },
      {
        title: "Coupons and rewards",
        body: "Publish coupons for your listing, and earn points by referring members, posting and reviewing.",
        href: "/rewards",
        free: true,
      },
      {
        title: "A website of your own",
        body: "Paid: we build you a proper website from $299 if the free page is not enough.",
        href: "/website",
        free: false,
      },
    ],
  },
];

export default async function WhyGodesiPage() {
  const categories = await getCategoryTree();
  const services = categories.reduce(
    (sum, category) => sum + category.children.length,
    0,
  );

  return (
    <div className="space-y-8 py-4">
      <section className="space-y-3">
        <h1 className="text-3xl font-black text-slate-900 sm:text-4xl">
          Everything you get on Godesi
        </h1>
        <p className="max-w-3xl text-slate-600">
          It starts with a name — <strong>godesi.com/yourname</strong>, free and
          yours alone. Everything below is what that name opens up. The green
          lines cost nothing; the few paid ones say so.
        </p>
        <HandleClaim tone="plain" />
        <p className="text-sm text-slate-500">
          {categories.length} categories and {services} services in the
          directory.{" "}
          <Link
            href="/categories"
            className="font-semibold text-indigo-600 hover:underline"
          >
            Browse them all →
          </Link>
        </p>
      </section>

      {GROUPS.map((group) => (
        <section key={group.heading}>
          <h2 className="text-xl font-black text-slate-900">
            {group.heading}
          </h2>
          <p className="mb-3 text-sm text-slate-500">{group.blurb}</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => (
              <Card key={item.title}>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900">
                    {item.title}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      item.free
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.free ? "Free" : "Paid"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{item.body}</p>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:underline"
                  >
                    Open it →
                  </Link>
                ) : null}
              </Card>
            ))}
          </div>
        </section>
      ))}

      <section className="flex flex-wrap items-center gap-3 rounded-3xl border border-slate-200 bg-white p-5">
        <LinkButton href="/claim">Claim your name free</LinkButton>
        <Link
          href="/why-list"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          Listing a business? Read this →
        </Link>
        <Link
          href="/pricing"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          Plans and pricing →
        </Link>
        <Link
          href="/about"
          className="text-sm font-semibold text-indigo-600 hover:underline"
        >
          About Godesi →
        </Link>
      </section>
    </div>
  );
}
