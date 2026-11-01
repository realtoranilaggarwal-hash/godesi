import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { WEDDING_SLUG } from "@/lib/wedding";
import {
  WEDDING_LAUNCH_LIMIT,
  WEDDING_LAUNCH_MONTHS,
  WEDDING_REFERRALS_PER_REWARD,
  WEDDING_REFERRAL_MONTHS,
  weddingLaunchSpotsLeft,
} from "@/lib/weddingLaunch";
import { Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Desi wedding vendors: list your business free and get wedding leads",
  description:
    "Mehndi artists, decorators, mandap, DJs, dhol, caterers, photographers, makeup artists, venues and pandits: list free on GoDesi and get wedding requests from desi families. First 50 vendors get Premium free for 6 months.",
  alternates: { canonical: "/wedding/vendors" },
};

const PROFILE_HREF = `/dashboard/profile?category=${WEDDING_SLUG}`;

const STEPS = [
  {
    icon: "📝",
    title: "List free in 5 minutes",
    body: "Add your service, city, photos, packages and WhatsApp number. Already on GoDesi? Search your name and tap “Claim”.",
  },
  {
    icon: "🔔",
    title: "Get wedding requests",
    body: "Families post their date, city, guest count and the services they need. Matching vendors get a GoDesi alert and an email straight away.",
  },
  {
    icon: "💬",
    title: "Reply on WhatsApp",
    body: "Premium vendors unlock the family's contact and reply directly. No commission on the bookings you win.",
  },
];

const SERVICES = [
  "Mehndi artists",
  "Decorators & mandap",
  "DJs & dhol",
  "Caterers",
  "Photographers & video",
  "Makeup & hair",
  "Banquet halls & venues",
  "Pandits & officiants",
  "Turban tying & saree draping",
  "Bridal & groom wear",
  "Wedding planners",
  "Baraat horse & cars",
];

export default async function WeddingVendorsPage() {
  const [user, spotsLeft, vendorCount] = await Promise.all([
    getCurrentUser(),
    weddingLaunchSpotsLeft(),
    db.business.count({ where: { status: "APPROVED", categorySlug: WEDDING_SLUG } }),
  ]);
  const joinHref = user
    ? PROFILE_HREF
    : `/signup?next=${encodeURIComponent(PROFILE_HREF)}`;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-rose-600 via-fuchsia-600 to-orange-500 px-5 py-8 text-white sm:px-8">
        <p className="text-sm font-bold uppercase tracking-wide text-white/80">
          For desi wedding vendors
        </p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl">
          Get wedding customers from GoDesi 💍
        </h1>
        <p className="mt-2 max-w-2xl text-white/90">
          Families planning desi weddings come to GoDesi to find vendors and post
          what they need. List your business free and get their requests on your
          phone.
        </p>
        {spotsLeft > 0 ? (
          <p className="mt-4 inline-block rounded-2xl bg-white/15 px-4 py-2 text-sm font-bold">
            🎉 Launch offer: the first {WEDDING_LAUNCH_LIMIT} wedding vendors get
            Premium free for {WEDDING_LAUNCH_MONTHS} months — {spotsLeft} spots left
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href={joinHref} variant="secondary">
            List my wedding business free
          </LinkButton>
          <Link
            href={`/search?category=${WEDDING_SLUG}`}
            className="rounded-xl border border-white/70 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
          >
            Already listed? Find & claim it
          </Link>
        </div>
        <p className="mt-3 text-xs text-white/80">
          {vendorCount} wedding vendors already on GoDesi.
        </p>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <Card key={step.title}>
            <p className="text-2xl">{step.icon}</p>
            <h2 className="mt-1 font-black">{step.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{step.body}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-2">
        <h2 className="text-lg font-black">Who should join</h2>
        <div className="flex flex-wrap gap-2">
          {SERVICES.map((service) => (
            <span
              key={service}
              className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-800"
            >
              {service}
            </span>
          ))}
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-emerald-200 bg-emerald-50">
          <h2 className="font-black text-emerald-900">
            ✅ GoDesi Verified Wedding Vendor
          </h2>
          <p className="mt-1 text-sm text-emerald-900">
            Upload your licence or business document and we check it. Verified
            vendors get a badge on their card and a ready-made image to post on
            Instagram.
          </p>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <h2 className="font-black text-amber-900">🎁 Refer vendors, get Premium</h2>
          <p className="mt-1 text-sm text-amber-900">
            Bring {WEDDING_REFERRALS_PER_REWARD} wedding vendors you work with
            (photographer, decorator, DJ, caterer…) using your invite link and get{" "}
            {WEDDING_REFERRAL_MONTHS} month of Premium free. Every{" "}
            {WEDDING_REFERRALS_PER_REWARD} more earns another month.
          </p>
        </Card>
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-black">Planning a wedding instead?</h2>
          <p className="text-sm text-slate-600">
            Tell vendors your date, city and what you need, and get quotes.
          </p>
        </div>
        <LinkButton href="/wedding/requirements/new">Get wedding quotes</LinkButton>
      </Card>
    </div>
  );
}
