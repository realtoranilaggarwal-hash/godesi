import type { Metadata } from "next";
import Link from "next/link";
import { ASTROLOGY_DISCLAIMER } from "@/lib/astrology";
import { siteUrl } from "@/lib/format";
import { SidebarBanners } from "@/components/Banners";
import { Card } from "@/components/ui";
import { KundliCalculator } from "@/components/KundliCalculator";

export const metadata: Metadata = {
  title: "Free Vedic birth chart (kundli) calculator",
  description:
    "Free kundli calculator: enter your birth date, time and place to see your rashi, nakshatra, lagna and a North Indian chart with planet positions (Lahiri). Nothing is saved.",
  alternates: { canonical: "/astrology/kundli-calculator" },
};

const FAQS = [
  {
    q: "Which ayanamsa does this calculator use?",
    a: "Lahiri (Chitrapaksha), the one used by the Indian government's Rashtriya Panchang and most Indian astrologers.",
  },
  {
    q: "What if I don't know my birth time?",
    a: 'Tick "I don\'t know my birth time". You still get your rashi, nakshatra and planet signs; the lagna and houses need a time.',
  },
  {
    q: "Is my birth information saved?",
    a: "No. It is used for that one calculation and is not stored.",
  },
];

export default function KundliCalculatorPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "GoDesi Kundli Calculator",
      url: `${siteUrl()}/astrology/kundli-calculator`,
      applicationCategory: "LifestyleApplication",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
  ];

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-3xl flex-1 space-y-5">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-600 to-fuchsia-600 px-5 py-8 text-white sm:px-8">
          <Link
            href="/astrology"
            className="text-xs font-semibold uppercase tracking-widest text-white/80 hover:underline"
          >
            ← Astrology guides
          </Link>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Free kundli calculator 🔮
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">
            Enter your birth date, time and place to see your rashi, nakshatra,
            lagna and birth chart, the Vedic way.
          </p>
        </section>

        <KundliCalculator />

        <Card>
          <h2 className="text-lg font-bold">Questions people ask</h2>
          <dl className="mt-3 space-y-3">
            {FAQS.map((faq) => (
              <div key={faq.q}>
                <dt className="text-sm font-bold text-slate-900">{faq.q}</dt>
                <dd className="mt-1 text-sm text-slate-600">{faq.a}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-sm">
            <Link
              href="/astrology/birth-details-for-a-kundli"
              className="text-violet-700 hover:underline"
            >
              Why the exact birth time and place matter →
            </Link>
          </p>
        </Card>

        <p className="text-xs text-slate-500">{ASTROLOGY_DISCLAIMER}</p>
      </div>
      <SidebarBanners />
    </div>
  );
}
