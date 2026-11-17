import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/components/PrintButton";
import { PartnerPackageForm } from "@/components/advertise/PartnerPackageForm";
import { AD_PLACEMENTS, adPrice } from "@/lib/ads";
import { cachedQuery } from "@/lib/cache";
import { db } from "@/lib/db";
import {
  PARTNER_HOSTING_NOTE,
  PARTNER_PACKAGE,
  PREMIUM_PARTNER_PACKAGE,
  partnerPackageFor,
} from "@/lib/partnerPackage";
import { PLANS } from "@/lib/plans";
import { SITE } from "@/lib/site";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "GoDesi Elite Partnership + New Year's Eve Sponsorship — $500 Starter & $2,000 Premium",
  description:
    "One partnership, multiple opportunities: the $500 Starter Partnership (Elite interview, membership, DesiWho'sWho.com listing, 10-second video, 320×100 banner for 12 months, AI website, 2 New Year's Eve tickets) and the $2,000 Premium Partnership (everything in Starter plus a VIP table for 12 guests and sponsor recognition at Royal Albert Palace).",
};

const NYE_SLUG = "new-year-eves-party-2027-edison";
const PHONE = "732-877-8585";
const PHONE_HREF = "tel:+17328778585";
const SALES_MAILTO = (subject: string) =>
  `mailto:${SITE.salesEmail}?subject=${encodeURIComponent(subject)}`;

/** Fallback is the party's till-Dec-15 adult price, used if the event can't be read. */
const FALLBACK_NYE_PRICES = { adult: 95 };

/** Premium's VIP table value: $1,500 through Dec 15 (Eastern), $2,500 after. */
const VIP_TABLE_VALUE = { early: 1500, regular: 2500, earlyEnds: new Date("2026-12-16T05:00:00Z") };
const SUPPORTERS_BANNER_VALUE = 300;
const PROMO_VIDEO_VALUE = 50;

/** The adult ticket price on sale right now on the party's event page. */
const nyePrices = cachedQuery("proposal-nye-prices", 3600, async () => {
  const event = await db.event.findUnique({
    where: { slug: NYE_SLUG },
    select: {
      tiers: {
        where: { kind: "TICKET" },
        select: { name: true, price: true, salesStart: true, salesEnd: true },
      },
    },
  });
  const now = Date.now();
  const onSale = (event?.tiers ?? []).filter(
    (tier) =>
      (!tier.salesStart || tier.salesStart.getTime() <= now) &&
      (!tier.salesEnd || tier.salesEnd.getTime() > now),
  );
  const lowest = (pattern: RegExp) => {
    const prices = onSale.filter((tier) => pattern.test(tier.name)).map((tier) => tier.price);
    return prices.length ? Math.min(...prices) : null;
  };
  return {
    adult: lowest(/^adults?\b/i) ?? FALLBACK_NYE_PRICES.adult,
  };
});

/** Prints only the proposal: site chrome, side banners and widgets are hidden. */
const PRINT_CSS = `
  @media print {
    body > *:not(main) { display: none !important; }
    main > *:not(:has(#partner-proposal)) { display: none !important; }
    main > div > *:not(#partner-proposal) { display: none !important; }
    main { display: block !important; padding: 0 !important; max-width: none !important; }
    body { background: #fff !important; padding: 0 !important; }
    #partner-proposal { max-width: none !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @page { margin: 12mm; }
  }
`;

const usd = (amount: number) => `$${Math.round(amount).toLocaleString("en-US")}`;

const STARTER_BENEFITS = [
  "Professional business interview conducted by our team (GoDesi Elite feature)",
  "GoDesi Elite membership and featured business profile",
  "Directory listing on DesiWho'sWho.com",
  "Professionally produced 10-second promotional video",
  "320 × 100 pixel side banner advertisement for 12 months",
  "Rotational banner exposure on the GoDesi homepage and relevant business category pages",
  "AI-enabled, SEO-friendly business website",
];

const PREMIUM_BENEFITS: React.ReactNode[] = [
  <>
    <strong>VIP table for 12 guests</strong> — 10 additional VIP seats (12 total guests including
    the 2 complimentary tickets)
  </>,
  "Company logo, picture and website on the New Year's Eve event supporters banner",
  "Personalized company placard displayed on your sponsored table",
  "VIP seating for 12 guests",
  "Personalized 10% ticket discount code for your clients and business associates",
  "Additional event sponsor recognition",
];

const HIGHLIGHTS = [
  { icon: "📈", label: "Increase Visibility" },
  { icon: "🤝", label: "Build Credibility" },
  { icon: "👥", label: "Network with Clients & Community" },
  { icon: "📣", label: "Year-Round Marketing" },
  { icon: "💻", label: "Professional Online Presence" },
];

type ValueRow = { item: string; value: number | null };

function Check({ tone }: { tone: "blue" | "red" }) {
  return (
    <span
      aria-hidden
      className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-black text-white ${
        tone === "blue" ? "bg-blue-800" : "bg-red-700"
      }`}
    >
      ✓
    </span>
  );
}

function Benefits({ items, tone }: { items: React.ReactNode[]; tone: "blue" | "red" }) {
  return (
    <ul className="space-y-2 text-sm text-slate-800 print:space-y-1 print:text-xs">
      {items.map((item, index) => (
        <li key={index} className="flex min-w-0 items-start gap-2">
          <Check tone={tone} />
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ValueTable({
  title,
  rows,
  price,
}: {
  title: string;
  rows: ValueRow[];
  price: number;
}) {
  const retail = rows.reduce((sum, row) => sum + (row.value ?? 0), 0);
  const savings = retail - price;
  const unpriced = rows.filter((row) => row.value === null).length;
  return (
    <div className="min-w-0 break-inside-avoid rounded-2xl border border-slate-200 bg-white p-4 shadow-sm print:shadow-none">
      <h3 className="font-black text-slate-900">{title}</h3>
      <table className="mt-2 w-full text-left text-sm print:text-xs">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="py-1.5 pr-3">Service</th>
            <th className="py-1.5 text-right">Value</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.item} className="border-b border-slate-100 align-top">
              <td className="break-words py-1.5 pr-3 text-slate-700">{row.item}</td>
              <td className="whitespace-nowrap py-1.5 text-right font-semibold text-slate-700">
                {row.value === null ? (
                  <span className="text-xs font-bold uppercase text-emerald-700">Included</span>
                ) : (
                  usd(row.value)
                )}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-b border-slate-200">
            <td className="py-1.5 pr-3 font-bold text-slate-900">Combined retail value</td>
            <td className="py-1.5 text-right font-bold text-slate-500 line-through">
              {usd(retail)}
            </td>
          </tr>
          <tr>
            <td className="py-1.5 pr-3 font-black text-slate-900">Partnership price</td>
            <td className="whitespace-nowrap py-1.5 text-right text-xl font-black text-amber-700">{usd(price)}</td>
          </tr>
          {savings >= price * 0.05 ? (
            <tr>
              <td colSpan={2} className="pt-2">
                <span className="inline-block rounded-full bg-emerald-600 px-3 py-1 text-xs font-black text-white">
                  You save {usd(savings)} on the priced services alone
                </span>
              </td>
            </tr>
          ) : unpriced ? (
            <tr>
              <td colSpan={2} className="pt-2 text-xs font-bold text-emerald-700">
                Plus {unpriced} services included that aren&apos;t sold separately
              </td>
            </tr>
          ) : null}
        </tfoot>
      </table>
    </div>
  );
}

export default async function ProposalPage({
  searchParams,
}: {
  searchParams: { paid?: string; tier?: string };
}) {
  const prices = await nyePrices();
  const paidPackage = searchParams.paid ? partnerPackageFor(searchParams.paid) : null;

  const bannerValue = adPrice(AD_PLACEMENTS.MOBILE, "USD", 12);
  const starterServices: ValueRow[] = [
    { item: "GoDesi Elite interview & feature (1 year)", value: 500 },
    { item: "Featured business profile on GoDesi.com (1 year)", value: PLANS.PREMIUM.terms.YEAR?.usd ?? 100 },
    { item: "320 × 100 side banner, rotating on GoDesi, 12 months", value: bannerValue },
    { item: "AI-enabled, SEO-friendly business website", value: WEBSITE_OFFER.priceUsd },
    { item: "DesiWho'sWho.com directory listing", value: null },
    { item: "10-second promotional video", value: PROMO_VIDEO_VALUE },
  ];
  const starterRows: ValueRow[] = [
    ...starterServices,
    { item: `2 New Year's Eve party tickets (2 × ${usd(prices.adult)})`, value: prices.adult * 2 },
  ];
  const vipEarly = Date.now() < VIP_TABLE_VALUE.earlyEnds.getTime();
  const premiumRows: ValueRow[] = [
    ...starterServices,
    {
      item: vipEarly
        ? `VIP table for 12 guests (your 2 complimentary tickets + 10 additional VIP seats) — till Dec 15, then ${usd(VIP_TABLE_VALUE.regular)}`
        : "VIP table for 12 guests (your 2 complimentary tickets + 10 additional VIP seats)",
      value: vipEarly ? VIP_TABLE_VALUE.early : VIP_TABLE_VALUE.regular,
    },
    { item: "Logo, picture & website on the event supporters banner", value: SUPPORTERS_BANNER_VALUE },
    { item: "Personalized company placard on your table", value: null },
    { item: "Personalized 10% ticket discount code for your clients", value: null },
    { item: "Additional event sponsor recognition", value: null },
  ];

  const tierOptions = [
    { tier: PARTNER_PACKAGE.tier, label: "Starter Partnership — Elite Marketing + Website", priceUsd: PARTNER_PACKAGE.priceUsd },
    { tier: PREMIUM_PARTNER_PACKAGE.tier, label: "Premium Partnership — Complete Elite + VIP Sponsorship", priceUsd: PREMIUM_PARTNER_PACKAGE.priceUsd },
  ];

  return (
    <div id="partner-proposal" className="mx-auto max-w-5xl space-y-5">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      {paidPackage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 print:hidden">
          <p className="font-black">🎉 Payment received — welcome to the {paidPackage.name}!</p>
          <p className="mt-1">
            We&apos;ve emailed your receipt. Our team will call you within 1–2 business days to
            schedule your interview and collect your logo, photos and details.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-slate-500">
          Share this page with a client, or save it as a PDF to email.
        </p>
        <PrintButton className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 print:hidden">
          🖨️ Download / Print PDF
        </PrintButton>
      </div>

      <header className="rounded-3xl bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 p-6 text-white print:rounded-xl print:p-4 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
          GoDesi Elite Partnership + New Year&apos;s Eve Sponsorship
        </p>
        <h1 className="mt-2 break-words text-3xl font-black leading-tight sm:text-4xl">
          ONE PARTNERSHIP.{" "}
          <span className="text-amber-300">MULTIPLE OPPORTUNITIES.</span>
        </h1>
        <p className="mt-3 max-w-3xl text-base font-semibold text-slate-100">
          Digital Visibility. Professional Branding. Community Networking. Real-World Connections.
        </p>
        <p className="mt-3 max-w-3xl text-sm text-slate-200">
          A complete marketing, branding and networking solution for attorneys, accountants,
          realtors, mortgage professionals, insurance agents and other business owners — online
          on GoDesi.com all year, and in person at our New Year&apos;s Eve party at Royal Albert
          Palace (Big Ball Room, 1050 King Georges Post Rd, Fords, NJ).
        </p>
        <p className="mt-4 text-sm font-bold text-amber-300">
          Call{" "}
          <a href={PHONE_HREF} className="underline">
            {PHONE}
          </a>{" "}
          or email{" "}
          <a href={SALES_MAILTO("GoDesi Elite Partnership")} className="break-all underline">
            {SITE.salesEmail}
          </a>
        </p>
      </header>

      <div className="grid gap-5 md:grid-cols-2 print:grid-cols-2">
        <section className="flex min-w-0 break-inside-avoid flex-col overflow-hidden rounded-3xl border-4 border-amber-400 bg-white shadow-md print:rounded-xl print:shadow-none">
          <div className="bg-gradient-to-b from-blue-800 to-blue-900 p-5 text-center text-white">
            <h2 className="break-words text-2xl font-black">Starter Partnership</h2>
            <p className="mt-0.5 text-sm font-semibold italic text-blue-100">
              Elite Marketing + Website
            </p>
            <p className="mx-auto mt-3 inline-block rounded-xl bg-amber-300 px-6 py-1 text-4xl font-black text-blue-950">
              {usd(PARTNER_PACKAGE.priceUsd)}
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-5 print:gap-2 print:p-3">
            <Benefits items={STARTER_BENEFITS} tone="blue" />
            <div className="flex items-center gap-3 rounded-2xl bg-amber-100 p-3">
              <span aria-hidden className="text-3xl">🎟️</span>
              <p className="min-w-0 text-sm text-slate-800">
                <strong className="block text-base text-slate-900">
                  2 Complimentary New Year&apos;s Eve Tickets
                </strong>
                as a valued partner
              </p>
            </div>
            <Link
              href={`/advertise/proposal?tier=${PARTNER_PACKAGE.tier}#pay`}
              className="mt-auto block rounded-xl bg-blue-800 px-5 py-3 text-center text-base font-black text-white hover:bg-blue-900 print:hidden"
            >
              💳 Get Starter — {usd(PARTNER_PACKAGE.priceUsd)}
            </Link>
          </div>
        </section>

        <section className="flex min-w-0 break-inside-avoid flex-col overflow-hidden rounded-3xl border-4 border-amber-400 bg-white shadow-md print:rounded-xl print:shadow-none">
          <div className="bg-gradient-to-b from-red-700 to-red-900 p-5 text-center text-white">
            <h2 className="break-words text-2xl font-black">Premium Partnership</h2>
            <p className="mt-0.5 text-sm font-semibold italic text-red-100">
              Complete Elite + VIP Sponsorship
            </p>
            <p className="mx-auto mt-3 inline-block rounded-xl bg-amber-300 px-6 py-1 text-4xl font-black text-red-900">
              {usd(PREMIUM_PARTNER_PACKAGE.priceUsd)}
            </p>
          </div>
          <div className="flex flex-1 flex-col gap-4 p-5 print:gap-2 print:p-3">
            <p className="text-sm font-black text-red-700">
              Everything in the {usd(PARTNER_PACKAGE.priceUsd)} package, PLUS:
            </p>
            <Benefits items={PREMIUM_BENEFITS} tone="red" />
            <div className="rounded-2xl bg-red-800 p-3 text-center text-white">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-300">
                Total party guests
              </p>
              <p className="text-sm">
                <span className="text-3xl font-black">12</span> (2 complimentary + 10 additional)
              </p>
            </div>
            <Link
              href={`/advertise/proposal?tier=${PREMIUM_PARTNER_PACKAGE.tier}#pay`}
              className="mt-auto block rounded-xl bg-red-700 px-5 py-3 text-center text-base font-black text-white hover:bg-red-800 print:hidden"
            >
              💳 Get Premium — {usd(PREMIUM_PARTNER_PACKAGE.priceUsd)}
            </Link>
          </div>
        </section>
      </div>

      <ul className="grid break-inside-avoid grid-cols-2 gap-2 rounded-2xl bg-blue-950 p-4 text-center text-white sm:grid-cols-5 print:grid-cols-5 print:p-2">
        {HIGHLIGHTS.map((highlight) => (
          <li key={highlight.label} className="min-w-0 break-words text-sm font-bold print:text-xs">
            <span aria-hidden className="block text-2xl">
              {highlight.icon}
            </span>
            {highlight.label}
          </li>
        ))}
      </ul>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-slate-900">What each package is worth</h2>
        <div className="grid gap-4 md:grid-cols-2 print:grid-cols-2">
          <ValueTable
            title={`Starter Partnership — ${usd(PARTNER_PACKAGE.priceUsd)}`}
            rows={starterRows}
            price={PARTNER_PACKAGE.priceUsd}
          />
          <ValueTable
            title={`Premium Partnership — ${usd(PREMIUM_PARTNER_PACKAGE.priceUsd)}`}
            rows={premiumRows}
            price={PREMIUM_PARTNER_PACKAGE.priceUsd}
          />
        </div>
        <p className="text-xs text-slate-500">
          Values are our regular prices when bought separately: GoDesi Elite interview, Featured
          profile, 12-month small banner, AI website, promotional video, VIP table and supporters
          banner, plus New Year&apos;s Eve tickets at today&apos;s prices on the{" "}
          <Link href={`/events/${NYE_SLUG}`} className="underline">
            event page
          </Link>
          . Services marked &ldquo;Included&rdquo; aren&apos;t sold separately, so they aren&apos;t
          counted in the retail value. {PARTNER_HOSTING_NOTE}
        </p>
      </section>

      <section className="break-inside-avoid rounded-2xl border-2 border-amber-400 bg-amber-50/60 p-5 print:rounded-xl print:p-4">
        <h2 className="text-lg font-black text-slate-900">Want a customized sponsorship?</h2>
        <p className="mt-1 text-sm text-slate-700">
          Need more tables, a bigger brand presence or a package built around your business?
          Tell us what you have in mind and we&apos;ll put it together.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 print:hidden">
          <a
            href={SALES_MAILTO("Customized GoDesi sponsorship inquiry")}
            className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700"
          >
            ✉️ Email {SITE.salesEmail}
          </a>
          <a
            href={PHONE_HREF}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800"
          >
            📞 Call {PHONE}
          </a>
        </div>
        <p className="mt-2 hidden text-sm font-bold text-slate-900 print:block">
          Email {SITE.salesEmail} · Call {PHONE} · Secure your partnership at godesi.com/proposal
        </p>
      </section>

      <section
        id="pay"
        className="scroll-mt-24 rounded-2xl border border-amber-300 bg-white p-5 shadow-sm print:hidden"
      >
        <h2 className="text-lg font-black text-slate-900">Secure your partnership online</h2>
        <p className="mb-3 mt-1 text-sm text-slate-600">
          Pick your package, fill this in and pay securely by card. We&apos;ll call you within 1–2
          business days.
        </p>
        <PartnerPackageForm
          key={searchParams.tier ?? "starter"}
          tiers={tierOptions}
          defaultTier={searchParams.tier}
        />
      </section>
    </div>
  );
}
