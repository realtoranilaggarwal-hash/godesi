import type { Metadata } from "next";
import Link from "next/link";
import { thanksgivingInquiryAction } from "@/app/actions/thanksgiving";
import { Card } from "@/components/ui";
import { THANKSGIVING, thanksgivingLink, thanksgivingLive } from "@/lib/thanksgiving";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Thanksgiving 2026 specials",
  description:
    "GoDesi Thanksgiving 2026 specials: 10% off New Year's Eve Party tickets with TURKEY10, a $250 annual marketing package and a $99 AI website.",
};

const MARKETING_INCLUDES = [
  "AI-powered promotional video content",
  "Search engine optimization (SEO) marketing",
  "Featured business marketing opportunities",
  "Online exposure through GoDesi.com",
  "One year of promotional opportunities under the special package",
];

export default function ThanksgivingPage({
  searchParams,
}: {
  searchParams: { offer?: string; sent?: string; error?: string };
}) {
  const offer = searchParams.offer === "website" ? "website" : "marketing";
  const live = thanksgivingLive();
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <section className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-8 text-white sm:px-8">
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">
          🦃 Thanksgiving specials
        </h1>
        <p className="mt-2 text-lg text-white/90">
          GoDesi.com wishes everyone a very Happy Thanksgiving!{" "}
          {live ? "One day only." : "These Thanksgiving offers have ended."}
        </p>
        <Link
          href={thanksgivingLink("article", "page")}
          className="mt-4 inline-block rounded-xl bg-white px-4 py-2 text-sm font-bold text-orange-700"
        >
          Read our Thanksgiving message →
        </Link>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <h2 className="font-bold">🎆 New Year&apos;s Eve Party</h2>
          <p className="mt-1 text-sm text-slate-600">
            10% OFF eligible tickets with code{" "}
            <strong className="text-orange-700">{THANKSGIVING.nyeCode}</strong>.
          </p>
          <a
            href={thanksgivingLink("nye", "page")}
            target="_blank"
            rel="noopener"
            className="mt-3 inline-block text-sm font-bold text-indigo-700 hover:underline"
          >
            Buy tickets →
          </a>
        </Card>
        <Card>
          <h2 className="font-bold">📣 Annual marketing package</h2>
          <p className="mt-1 text-2xl font-black">${THANKSGIVING.marketingUsd}</p>
          <ul className="mt-1 list-disc pl-4 text-xs text-slate-600">
            {MARKETING_INCLUDES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Link href="/thanksgiving?offer=marketing#inquire" className="mt-3 inline-block text-sm font-bold text-indigo-700 hover:underline">
            Ask about it →
          </Link>
        </Card>
        <Card>
          <h2 className="font-bold">💻 AI website</h2>
          <p className="mt-1 text-2xl font-black">${THANKSGIVING.websiteUsd}</p>
          <p className="mt-1 text-xs text-slate-600">
            A done-for-you AI website for your business, subject to the
            published package terms.
          </p>
          <Link href="/thanksgiving?offer=website#inquire" className="mt-3 inline-block text-sm font-bold text-indigo-700 hover:underline">
            Ask about it →
          </Link>
        </Card>
      </div>

      <Card id="inquire">
        <h2 className="text-lg font-bold">
          {offer === "website"
            ? `Get the $${THANKSGIVING.websiteUsd} AI website`
            : `Get the $${THANKSGIVING.marketingUsd} marketing package`}
        </h2>
        {!live ? (
          <p className="mt-2 text-sm text-slate-600">
            The Thanksgiving offers have ended. See{" "}
            <Link href="/website" className="font-semibold text-indigo-700 hover:underline">
              GoDesi websites
            </Link>{" "}
            and{" "}
            <Link href="/advertise" className="font-semibold text-indigo-700 hover:underline">
              advertising
            </Link>{" "}
            for current prices.
          </p>
        ) : searchParams.sent ? (
          <p className="mt-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
            Thank you! The GoDesi team will call or email you shortly.
          </p>
        ) : (
          <form action={thanksgivingInquiryAction} className="mt-3 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="offer" value={offer} />
            {searchParams.error ? (
              <p className="text-sm font-semibold text-rose-700 sm:col-span-2">
                Please fill in your name, phone and a valid email.
              </p>
            ) : null}
            <input name="name" required placeholder="Your name" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <input name="phone" required placeholder="Phone" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <input name="email" type="email" required placeholder="Email" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <input name="business" placeholder="Business name (optional)" className="rounded-xl border border-slate-300 px-3 py-2 text-sm" />
            <textarea name="message" rows={3} placeholder="Anything we should know? (optional)" className="rounded-xl border border-slate-300 px-3 py-2 text-sm sm:col-span-2" />
            <button className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-bold text-white hover:bg-orange-700 sm:col-span-2">
              Send my inquiry
            </button>
          </form>
        )}
      </Card>

      <p className="text-xs text-slate-500">
        Limited-time Thanksgiving promotions. Offers, eligibility, package
        inclusions and availability are subject to their published terms.
      </p>
    </div>
  );
}
