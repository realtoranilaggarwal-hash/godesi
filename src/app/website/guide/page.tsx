import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui";
import { SidebarBanners } from "@/components/Banners";
import { GuideSurvey } from "@/components/website/GuideSurvey";
import { WEBSITE_OFFER, whatsappOfferLink } from "@/lib/websiteOffer";

const NAMESILO_URL = "https://www.namesilo.com/?rid=8ec0177ty";
const AUTOMATED_CONTENT_USD = 500;

export const metadata: Metadata = {
  title: "Getting Your Business Website — Step-by-Step Guide",
  description: `Buy your domain, give us DNS access, send your content and pick how you want it delivered. Websites from $${WEBSITE_OFFER.priceUsd}, hosting $${WEBSITE_OFFER.monthlyUsd}/month or $${WEBSITE_OFFER.yearlyUsd}/year.`,
  alternates: { canonical: "/website/guide" },
};

const CHECKLIST = [
  "Business name, category and city",
  "Logo, brand colours and photos — or a link to your Google, Yelp or old website",
  "Page content: Home, About, Services, Gallery, Contact",
  "Phone, WhatsApp, email, address and opening hours",
  "Domain purchased (Step 1)",
  "Features you want: booking, payments, AI chat, lead capture",
];

function CtaButtons({ whatsapp, light = false }: { whatsapp: string | null; light?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href="/website"
        className={`rounded-xl px-5 py-3 text-base font-bold shadow ${
          light ? "bg-white text-indigo-700" : "bg-indigo-600 text-white hover:bg-indigo-700"
        }`}
      >
        🚀 Start your website
      </Link>
      {whatsapp ? (
        <a
          href={whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          💬 Ask on WhatsApp
        </a>
      ) : null}
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <Card>
      <div className="text-xs font-bold text-indigo-600">STEP {n}</div>
      <h2 className="text-xl font-black text-slate-900">{title}</h2>
      <div className="mt-2 space-y-3 text-sm text-slate-700">{children}</div>
    </Card>
  );
}

export default function WebsiteGuidePage() {
  const whatsapp = whatsappOfferLink();

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 px-5 py-8 text-white sm:px-8">
          <h1 className="text-3xl font-black leading-tight sm:text-4xl">
            Getting Your Business Website
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-white/90">
            Five simple steps from domain to launch. Read it once, gather your details, and we do
            the rest.
          </p>
          <p className="mt-2 max-w-2xl text-sm text-white/80">
            ${WEBSITE_OFFER.priceUsd} once for a {WEBSITE_OFFER.pages}-page site, or $
            {WEBSITE_OFFER.customPriceUsd} custom. Hosting ${WEBSITE_OFFER.monthlyUsd}/month or $
            {WEBSITE_OFFER.yearlyUsd}/year.
          </p>
          <div className="mt-5">
            <CtaButtons whatsapp={whatsapp} light />
          </div>
        </section>

        <Step n={1} title="Buy your domain">
          <p>
            Buy your domain at{" "}
            <a
              href={NAMESILO_URL}
              target="_blank"
              rel="noopener noreferrer nofollow sponsored"
              className="font-semibold text-indigo-700 underline"
            >
              NameSilo
            </a>{" "}
            — about $10–15 a year, the lowest renewals we have found, and free WHOIS privacy so
            your home address and phone stay private.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Keep it short and easy to spell.</li>
            <li>Match your business name.</li>
            <li>Prefer .com — it is what customers type first.</li>
          </ul>
          <a
            href={NAMESILO_URL}
            target="_blank"
            rel="noopener noreferrer nofollow sponsored"
            className="inline-block rounded-xl bg-indigo-600 px-4 py-2.5 font-semibold text-white hover:bg-indigo-700"
          >
            Search domains on NameSilo →
          </a>
          <p className="text-xs text-slate-500">
            NameSilo link is a referral link; it costs you nothing extra.
          </p>
        </Step>

        <Step n={2} title="Give us DNS access">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="font-bold text-slate-900">Option A — Access</div>
              <p className="mt-1">
                Share your NameSilo login with us temporarily (change the password after we are
                done), or add us as a delegate on your account.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="font-bold text-slate-900">Option B — You paste our records</div>
              <p className="mt-1">
                We send you the nameserver / DNS records. In NameSilo open{" "}
                <strong>Domain Manager → Change Nameservers</strong>, paste them in and save.
              </p>
            </div>
          </div>
        </Step>

        <Step n={3} title="Website checklist">
          <p>Have these ready before we start:</p>
          <ul className="space-y-2">
            {CHECKLIST.map((item) => (
              <li key={item}>
                <label className="flex items-start gap-2">
                  <input type="checkbox" className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600" />
                  <span>{item}</span>
                </label>
              </li>
            ))}
          </ul>
        </Step>

        <Step n={4} title="Choose a delivery option">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 p-4">
              <div className="font-black text-indigo-800">Option A — We host it</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>
                  ${WEBSITE_OFFER.priceUsd} one-time setup ({WEBSITE_OFFER.pages}-page site), or $
                  {WEBSITE_OFFER.customPriceUsd} custom design (up to {WEBSITE_OFFER.customPages}{" "}
                  pages).
                </li>
                <li>
                  Hosting, domain connection, SSL and support: ${WEBSITE_OFFER.monthlyUsd}/month or
                  ${WEBSITE_OFFER.yearlyUsd}/year.
                </li>
                <li>
                  {WEBSITE_OFFER.changesPerMonth} change a month ({WEBSITE_OFFER.changesPerYear} a
                  year on the yearly plan).
                </li>
                <li>Cancel anytime.</li>
              </ul>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-black text-slate-900">Option B — Full handover</div>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                <li>We deliver your site as a zip / export.</li>
                <li>
                  You confirm in writing that you can upload, install and host it yourself.
                </li>
                <li>No ongoing support after handover.</li>
                <li>Not available with the Automated Content add-on.</li>
              </ul>
            </div>
          </div>
        </Step>

        <Step n={5} title="Why GoDesi">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <strong>SEO built in</strong> — titles, descriptions and a mobile-first layout so
              customers find you on Google.
            </li>
            <li>
              <strong>Free featured classified on GoDesi</strong> for your business.
            </li>
            <li>
              <strong>No AdWords needed to start</strong> — our directory, events and community
              bring you organic reach.
            </li>
            <li>
              <strong>Human + high-tech</strong> — real people, real events and meetups, not just
              software.
            </li>
          </ul>
          <p className="rounded-xl bg-amber-50 p-3">
            <strong>The package:</strong> a professional website, hosting, SSL, monthly updates
            and a featured GoDesi listing — from ${WEBSITE_OFFER.priceUsd} once plus $
            {WEBSITE_OFFER.monthlyUsd}/month.
          </p>
        </Step>

        <Card className="border-fuchsia-200 bg-gradient-to-r from-fuchsia-50 to-orange-50">
          <div className="text-xs font-bold text-fuchsia-700">OPTIONAL ADD-ON</div>
          <h2 className="text-xl font-black text-slate-900">
            Automated Content — ${AUTOMATED_CONTENT_USD}/year
          </h2>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            <li>We write articles for your website.</li>
            <li>We create images and hashtags to go with them.</li>
            <li>We email and post them on a schedule.</li>
            <li>Requires Option A hosting — not available with full handover.</li>
          </ul>
        </Card>

        <Card id="survey">
          <h2 className="text-xl font-black text-slate-900">Quick survey</h2>
          <p className="mt-1 text-sm text-slate-600">
            Already have your website? Tell us how we did — it takes 30 seconds.
          </p>
          <div className="mt-3">
            <GuideSurvey whatsappNumber={WEBSITE_OFFER.whatsapp || null} />
          </div>
        </Card>

        <Card className="text-center">
          <h2 className="text-xl font-black text-slate-900">Ready to get started?</h2>
          <div className="mt-3 flex justify-center">
            <CtaButtons whatsapp={whatsapp} />
          </div>
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
