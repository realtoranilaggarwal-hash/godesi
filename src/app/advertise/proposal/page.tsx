import type { Metadata } from "next";
import Link from "next/link";
import { PrintButton } from "@/components/PrintButton";
import { PartnerPackageForm } from "@/components/advertise/PartnerPackageForm";
import { AD_PLACEMENTS } from "@/lib/ads";
import { cachedQuery } from "@/lib/cache";
import { db } from "@/lib/db";
import { PARTNER_HOSTING_NOTE, PARTNER_PACKAGE } from "@/lib/partnerPackage";
import { PLANS } from "@/lib/plans";
import { SITE } from "@/lib/site";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Grow Your Business with GoDesi — Marketing Partnership Proposal",
  description:
    "New Year's Eve party sponsorship, websites, a GoDesi.com banner, podcast and GoDesi Elite interviews, and a quarterly magazine ad — the GoDesi Partner Package for local businesses.",
};

const NYE_SLUG = "new-year-eves-party-2027-edison";
const NYE_SPONSOR_HREF = `/events/${NYE_SLUG}#sponsor`;
const PHONE = "732-877-8585";
const PHONE_HREF = "tel:+17328778585";

/** Silver, Gold and Platinum packages exactly as listed on the party's event page. */
const sponsorLevels = cachedQuery("proposal-nye-sponsors", 3600, async () => {
  const event = await db.event.findUnique({
    where: { slug: NYE_SLUG },
    select: {
      tiers: {
        where: { kind: "SPONSOR" },
        orderBy: { sortOrder: "asc" },
        select: { name: true, price: true, perks: true },
      },
    },
  });
  return (event?.tiers ?? []).filter((tier) =>
    /^(silver|gold|platinum)\b/i.test(tier.name),
  );
});

const LEVEL_STYLE: Record<string, string> = {
  silver: "border-slate-300 bg-slate-100/70 text-slate-700",
  gold: "border-amber-400 bg-amber-100/70 text-amber-800",
  platinum: "border-indigo-300 bg-indigo-50/70 text-indigo-800",
};

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

const usd = (amount: number) => `$${amount.toLocaleString("en-US")}`;

const PACKAGE_ROWS: { item: string; value: string }[] = [
  { item: "Handmade custom website", value: "$500" },
  { item: "300×250 side banner on GoDesi.com for 1 year", value: usd(AD_PLACEMENTS.SIDEBAR.priceUsd * 12) },
  { item: "Featured listing on GoDesi.com for 1 year", value: usd(PLANS.PREMIUM.terms.YEAR?.usd ?? 100) },
  { item: "GoDesi Elite interview with a 30–60 second video", value: "$500" },
  { item: "Your banner inside the hall at the New Year's Eve party", value: "$300" },
  { item: "1 ticket to enjoy the New Year's Eve party", value: "$100" },
];

function Section({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="break-inside-avoid rounded-2xl border border-slate-200 bg-white p-5 shadow-sm print:rounded-xl print:p-4 print:shadow-none">
      <h2 className="flex items-start gap-2 text-lg font-black text-slate-900">
        <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 text-sm font-black text-white">
          {number}
        </span>
        <span className="min-w-0 break-words">{title}</span>
      </h2>
      <div className="mt-3 space-y-2 text-sm text-slate-700">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item, index) => (
        <li key={index} className="break-words">
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function ProposalPage({
  searchParams,
}: {
  searchParams: { paid?: string };
}) {
  const levels = await sponsorLevels();

  return (
    <div id="partner-proposal" className="mx-auto max-w-4xl space-y-5">
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      {searchParams.paid ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 print:hidden">
          <p className="font-black">🎉 Payment received — welcome to the GoDesi Partner Package!</p>
          <p className="mt-1">
            We&apos;ve emailed your receipt. Our team will call you within 1–2 business days to
            collect your logo, photos and details.
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <p className="text-sm text-slate-500">
          Share this page with a client, or save it as a PDF to email.
        </p>
        <div className="flex flex-wrap gap-2">
          <a
            href="#pay"
            className="rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-amber-700"
          >
            💳 Pay ${PARTNER_PACKAGE.priceUsd}
          </a>
          <PrintButton className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 print:hidden">
          🖨️ Download / Print PDF
        </PrintButton>
        </div>
      </div>

      <header className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white print:rounded-xl">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
          GoDesi.com · Marketing Partnership Proposal
        </p>
        <h1 className="mt-2 break-words text-2xl font-black sm:text-3xl">
          Grow Your Business with GoDesi
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-200">
          Put your business in front of the desi community in New Jersey and
          beyond — at our New Year&apos;s Eve party, on GoDesi.com, on our
          podcast, in print and in our members&apos; inboxes.
        </p>
        <p className="mt-3 text-sm font-bold text-amber-300">
          Call{" "}
          <a href={PHONE_HREF} className="underline">
            {PHONE}
          </a>{" "}
          or email{" "}
          <a href={`mailto:${SITE.salesEmail}`} className="underline">
            {SITE.salesEmail}
          </a>
        </p>
      </header>

      <Section number={1} title="New Year's Eve Party Sponsorship">
        <p>
          The Grand New Year&apos;s Eve Party — Big Ball Room, Royal Albert
          Palace, 1050 King Georges Post Rd, Fords, NJ. About 400
          guests, and 6+ years running (celebrating since 2018).
        </p>
        {levels.length ? (
          <ul className="grid gap-3 sm:grid-cols-3 print:grid-cols-3">
            {levels.map((tier) => {
              const level = tier.name.split(/\s/)[0].toLowerCase();
              return (
                <li
                  key={tier.name}
                  className={`min-w-0 break-inside-avoid rounded-xl border p-3 ${LEVEL_STYLE[level] ?? LEVEL_STYLE.gold}`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="min-w-0 break-words font-black uppercase tracking-wide">
                      {tier.name.replace(/\s*sponsor$/i, "")}
                    </span>
                    <span className="shrink-0 text-lg font-black text-amber-700">
                      {usd(tier.price)}
                    </span>
                  </div>
                  <ul className="mt-2 list-disc space-y-0.5 pl-4 text-xs text-slate-700">
                    {tier.perks.map((perk) => (
                      <li key={perk} className="break-words">
                        {perk}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="font-semibold">
            Silver $1,000 · Gold $2,500 · Platinum $5,000
          </p>
        )}
        <p>
          See every package and add-on:{" "}
          <Link href={NYE_SPONSOR_HREF} className="font-bold text-amber-700 underline">
            godesi.com/events/{NYE_SLUG}#sponsor
          </Link>
        </p>
      </Section>

      <Section number={2} title="Website Packages">
        <div className="grid gap-3 sm:grid-cols-2 print:grid-cols-2">
          <div className="rounded-xl border border-slate-200 p-3">
            <p className="font-black text-slate-900">
              {usd(WEBSITE_OFFER.priceUsd)} — AI-built website
            </p>
            <p className="mt-1">
              A professional website for your business, built fast with AI.
            </p>
          </div>
          <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-3">
            <p className="font-black text-slate-900">$500 — Custom website</p>
            <Bullets
              items={[
                "AI chatbot that answers your customers",
                "SEO so customers find you on Google",
                "Dynamic pages that pull in your videos and social content",
                "Client review and revisions included",
              ]}
            />
          </div>
        </div>
        <p>
          More:{" "}
          <Link href="/website" className="font-bold text-amber-700 underline">
            godesi.com/website
          </Link>
        </p>
      </Section>

      <Section number={3} title="Sidebar Banner on GoDesi.com">
        <Bullets
          items={[
            "Your banner in the GoDesi.com sidebar, linking straight to your website.",
            <>
              <strong>Free for 1 year</strong> with any party sponsorship.
            </>,
          ]}
        />
      </Section>

      <Section number={4} title="Podcast & GoDesi Elite Interview">
        <Bullets
          items={[
            "A weekly podcast slot — record in our studio or remotely.",
            <>
              Your GoDesi Elite interview, published with a 30–60 second video
              in the{" "}
              <Link href="/desi-elite" className="font-bold text-amber-700 underline">
                GoDesi Elite
              </Link>{" "}
              section.
            </>,
            <>
              Launch offer: <strong>$250 for 5 years</strong> (normally $500 a
              year).
            </>,
            "Help launching your own channel.",
          ]}
        />
      </Section>

      <Section number={5} title="Quarterly Magazine Ad">
        <Bullets
          items={[
            "Distributed by Mandarin Media to about 100 premium families — past and present clients of broker Anil Aggarwal.",
            <>
              Business-card-size ad on the back page: about $5 per magazine,{" "}
              <strong>$250 for 50 magazines</strong>.
            </>,
          ]}
        />
      </Section>

      <section className="break-inside-avoid rounded-2xl border-2 border-amber-400 bg-amber-50/60 p-5 print:rounded-xl print:p-4">
        <h2 className="flex items-start gap-2 text-lg font-black text-slate-900">
          <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-600 text-sm font-black text-white">
            6
          </span>
          <span className="min-w-0 break-words">GoDesi Partner Package</span>
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-0 text-left text-sm">
            <thead>
              <tr className="border-b border-amber-300 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-3">What you get</th>
                <th className="py-2 text-right">Normally</th>
              </tr>
            </thead>
            <tbody>
              {PACKAGE_ROWS.map((row) => (
                <tr key={row.item} className="border-b border-amber-200">
                  <td className="break-words py-2 pr-3 text-slate-700">{row.item}</td>
                  <td className="whitespace-nowrap py-2 text-right font-semibold text-slate-700">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-b border-amber-300">
                <td className="py-2 pr-3 font-bold text-slate-900">Total value</td>
                <td className="py-2 text-right font-bold text-slate-500 line-through">
                  $1,848
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 text-base font-black text-slate-900">
                  Partner price
                </td>
                <td className="py-2 text-right text-2xl font-black text-amber-700">
                  {usd(PARTNER_PACKAGE.priceUsd)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
        <p className="mt-2 text-xs text-slate-600">
          {PARTNER_HOSTING_NOTE}
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Silver, Gold and Platinum party sponsorships are available
          separately — and any sponsorship adds the GoDesi.com sidebar banner
          free for 1 year.
        </p>
        <div className="mt-4 rounded-xl bg-slate-900 p-4 text-center text-white">
          <p className="text-lg font-black">Ready to grow with GoDesi?</p>
          <p className="mt-1 text-sm">
            Call{" "}
            <a href={PHONE_HREF} className="font-bold text-amber-300 underline">
              {PHONE}
            </a>{" "}
            or reply by email to{" "}
            <a
              href={`mailto:${SITE.salesEmail}?subject=${encodeURIComponent("GoDesi Partner Package")}`}
              className="font-bold text-amber-300 underline"
            >
              {SITE.salesEmail}
            </a>
          </p>
          <p className="mt-1 hidden text-sm print:block">
            Or pay online at{" "}
            <span className="font-bold text-amber-300">godesi.com/advertise/proposal</span>
          </p>
        </div>
        <div id="pay" className="mt-4 scroll-mt-24 rounded-xl border border-amber-300 bg-white p-4 print:hidden">
          <p className="text-lg font-black text-slate-900">
            Pay {usd(PARTNER_PACKAGE.priceUsd)} online and get started
          </p>
          <p className="mb-3 mt-1 text-sm text-slate-600">
            Fill this in and pay securely by card. We&apos;ll call you within 1–2 business days.
          </p>
          <PartnerPackageForm price={PARTNER_PACKAGE.priceUsd} />
        </div>
      </section>
    </div>
  );
}
