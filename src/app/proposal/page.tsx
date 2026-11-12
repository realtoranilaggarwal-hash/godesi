import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { PrintButton } from "@/components/PrintButton";
import { Card } from "@/components/ui";
import { AD_PLACEMENTS, adPrice } from "@/lib/ads";
import { ELITE_PACKAGES } from "@/lib/elite";
import {
  NYE_2027_EVENT_SLUG,
  NYE_2027_SPONSOR_LEVELS,
} from "@/lib/nyeSponsorLevels";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";

export const metadata: Metadata = {
  title: "Grow Your Business with GoDesi — Marketing Partnership Proposal",
  description:
    "New Year's Eve party sponsorship, websites, GoDesi.com banners, the GoDesi podcast and Elite interview, a quarterly magazine ad and email marketing — one partner package from Anil Aggarwal, Broker / GoDesi.com.",
  alternates: { canonical: "/proposal" },
};

const PHONE = "732-877-8585";
const PHONE_HREF = "tel:+17328778585";
const SPONSOR_HREF = `/events/${NYE_2027_EVENT_SLUG}#sponsor`;

const CUSTOM_WEBSITE_USD = 500;
const EMAIL_MONTHLY_USD = 300;
const MAGAZINE_PER_COPY_USD = 5;
const MAGAZINE_COPIES = 50;
const MAGAZINE_USD = MAGAZINE_PER_COPY_USD * MAGAZINE_COPIES;
const PARTNER_PRICE_USD = 500;

const elite = ELITE_PACKAGES.INTERVIEW;
const sidebarYearUsd = Math.round(adPrice(AD_PLACEMENTS.SIDEBAR, "USD", 12));

const PACKAGE_ITEMS: { item: string; value: number | null }[] = [
  {
    item: "Custom website with AI chatbot, SEO and dynamic video/social pages",
    value: CUSTOM_WEBSITE_USD,
  },
  {
    item: "GoDesi Elite interview with 30–60 second video",
    value: ELITE_PACKAGES.INTERVIEW_1Y.usd,
  },
  {
    item: "Email marketing — 1 month, ~100 emails a day with your logo",
    value: EMAIL_MONTHLY_USD,
  },
  {
    item: "GoDesi.com sidebar banner linking to your website — 12 months",
    value: sidebarYearUsd,
  },
  { item: "Weekly GoDesi podcast guest slot", value: null },
];

const packageValue = PACKAGE_ITEMS.reduce(
  (sum, row) => sum + (row.value ?? 0),
  0,
);

const PRINT_CSS = `
@page { size: letter; margin: 0.3in; }
@media print {
  html, body { background: #fff !important; padding: 0 !important; min-height: 0 !important; }
  body:has(#godesi-proposal) > *:not(main) { display: none !important; }
  body:has(#godesi-proposal) main { display: block !important; max-width: none !important; padding: 0 !important; }
  body:has(#godesi-proposal) main > *:not(:has(#godesi-proposal)) { display: none !important; }
  body:has(#godesi-proposal) main > div > *:not(#godesi-proposal) { display: none !important; }
  #godesi-proposal { zoom: 0.68; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  #godesi-proposal a { text-decoration: none; }
}
`;

function usd(value: number) {
  return `$${value.toLocaleString("en-US")}`;
}

function Section({
  number,
  title,
  children,
  className = "",
}: {
  number: number;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={`break-inside-avoid print:p-3 print:shadow-none ${className}`}
    >
      <h2 className="flex items-center gap-2 text-lg font-black text-slate-900">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-black text-white">
          {number}
        </span>
        <span className="min-w-0 break-words">{title}</span>
      </h2>
      <div className="mt-2 space-y-2 text-sm text-slate-700">{children}</div>
    </Card>
  );
}

const LEVEL_STYLES: Record<string, string> = {
  "Silver sponsor": "border-slate-300 bg-slate-50 text-slate-700",
  "Gold sponsor": "border-amber-400 bg-amber-50 text-amber-800",
  "Platinum sponsor": "border-indigo-300 bg-indigo-50 text-indigo-800",
};

export default function ProposalPage() {
  return (
    <div
      id="godesi-proposal"
      className="mx-auto max-w-4xl space-y-4 print:max-w-none print:space-y-3"
    >
      <style dangerouslySetInnerHTML={{ __html: PRINT_CSS }} />

      <div className="flex flex-wrap items-center justify-end gap-2 print:hidden">
        <PrintButton className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700">
          ⬇️ Download / Print PDF
        </PrintButton>
      </div>

      <header className="rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 p-6 text-white print:p-4">
        <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
          Marketing Partnership Proposal
        </p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl">
          Grow Your Business with GoDesi
        </h1>
        <p className="mt-2 text-sm text-white/85">
          Prepared by <strong className="text-white">Anil Aggarwal</strong>,
          Broker / GoDesi.com ·{" "}
          <a href={PHONE_HREF} className="font-bold text-amber-300">
            {PHONE}
          </a>
        </p>
      </header>

      <Section number={1} title="New Year's Eve Party Sponsorship">
        <p>
          The GoDesi New Year&apos;s Eve party at{" "}
          <strong>Royal Albert Palace, Fords (Edison), NJ</strong> —{" "}
          <strong>400 guests</strong>, running for <strong>6+ years</strong>.
        </p>
        <div className="grid gap-3 sm:grid-cols-3 print:grid-cols-3 print:gap-2">
          {NYE_2027_SPONSOR_LEVELS.map((level) => (
            <div
              key={level.name}
              className={`min-w-0 rounded-xl border p-3 print:p-2 ${LEVEL_STYLES[level.name]}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-black uppercase tracking-wide">
                  {level.name.replace(" sponsor", "")}
                </span>
                <span className="text-lg font-black">{usd(level.price)}</span>
              </div>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-slate-700">
                {level.perks.map((perk) => (
                  <li key={perk} className="break-words">
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-xs">
          <Link
            href={SPONSOR_HREF}
            className="font-semibold text-indigo-600 hover:underline"
          >
            See every sponsor package and add-on on GoDesi.com →
          </Link>
        </p>
      </Section>

      <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2 print:gap-3">
        <Section number={2} title="Website packages">
          <div className="rounded-xl border border-slate-200 p-3 print:p-2">
            <p className="font-bold text-slate-900">
              {usd(WEBSITE_OFFER.priceUsd)} — AI-built website
            </p>
            <p className="text-xs">
              We turn your Google, Yelp or current website into a new site.{" "}
              <Link href="/website" className="text-indigo-600 hover:underline">
                Preview it free
              </Link>
              .
            </p>
          </div>
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 print:p-2">
            <p className="font-bold text-slate-900">
              {usd(CUSTOM_WEBSITE_USD)} — Custom website
            </p>
            <ul className="list-disc pl-4 text-xs">
              <li>AI chatbot that answers your customers</li>
              <li>SEO set up so Google finds you</li>
              <li>Dynamic pages that pull in your videos and social posts</li>
              <li>You review the site and we make the revisions</li>
            </ul>
          </div>
        </Section>

        <Section number={3} title="Sidebar banner on GoDesi.com">
          <p>
            Your banner in the GoDesi.com sidebar beside listings, events and
            news, linking straight to your website.
          </p>
          <p className="rounded-xl bg-emerald-50 p-3 font-bold text-emerald-800 print:p-2">
            FREE for 1 year with any party sponsorship
          </p>
        </Section>

        <Section number={4} title="Podcast & GoDesi Elite interview">
          <ul className="list-disc space-y-1 pl-4">
            <li>
              <strong>Weekly podcast slot</strong> — record in our studio or
              remotely.
            </li>
            <li>
              <strong>
                <Link href="/desi-elite" className="hover:underline">
                  GoDesi Elite
                </Link>{" "}
                interview
              </strong>{" "}
              with a 30–60 second video in the Elite section. Launch offer{" "}
              <strong>
                {usd(elite.usd)} for {elite.years} years
              </strong>{" "}
              (normally {usd(elite.listUsd ?? ELITE_PACKAGES.INTERVIEW_1Y.usd)}
              /year).
            </li>
            <li>Help launching your own channel.</li>
          </ul>
        </Section>

        <Section number={5} title="Quarterly magazine ad">
          <p>
            Distributed by <strong>Mandarin Media</strong> to ~100 premium
            families — clients of broker Anil Aggarwal.
          </p>
          <p>
            Business-card-size ad on the back page: about{" "}
            {usd(MAGAZINE_PER_COPY_USD)} per magazine —{" "}
            <strong>
              {usd(MAGAZINE_USD)} for {MAGAZINE_COPIES} magazines
            </strong>
            .
          </p>
        </Section>
      </div>

      <Section number={6} title="Email marketing">
        <p>
          About <strong>100 emails a day</strong> to the GoDesi database with
          your logo on the flyer. Normally {usd(EMAIL_MONTHLY_USD)}/month —{" "}
          <strong>included in the Partner Package</strong>.
        </p>
      </Section>

      <Section
        number={7}
        title="Partner Package"
        className="border-amber-300 bg-gradient-to-br from-amber-50 via-white to-white"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                <th className="py-1.5 pr-3 font-semibold">Included</th>
                <th className="py-1.5 text-right font-semibold">Value</th>
              </tr>
            </thead>
            <tbody>
              {PACKAGE_ITEMS.map((row) => (
                <tr key={row.item} className="border-b border-slate-100">
                  <td className="py-1.5 pr-3">{row.item}</td>
                  <td className="whitespace-nowrap py-1.5 text-right font-semibold">
                    {row.value === null ? "Included" : usd(row.value)}
                  </td>
                </tr>
              ))}
              <tr className="border-b border-slate-200">
                <td className="py-1.5 pr-3 font-bold">Total value</td>
                <td className="whitespace-nowrap py-1.5 text-right font-bold text-slate-500 line-through">
                  {usd(Math.floor(packageValue / 100) * 100)}+
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3 text-base font-black text-slate-900">
                  Partner price
                </td>
                <td className="whitespace-nowrap py-2 text-right text-2xl font-black text-emerald-700">
                  {usd(PARTNER_PRICE_USD)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500">
          Party sponsorship (Silver, Gold or Platinum) is separate.
        </p>
        <a
          href={PHONE_HREF}
          className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-base font-black text-white hover:bg-emerald-700"
        >
          Call {PHONE} to get started
        </a>
      </Section>
    </div>
  );
}
