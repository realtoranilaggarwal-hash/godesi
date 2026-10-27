import type { Metadata } from "next";
import Link from "next/link";
import { Card, LinkButton } from "@/components/ui";
import { metaDescription, pageTitle } from "@/lib/seo";
import { CLASSIFIEDS, NEWSPAPERS, type MediaPartner } from "@/lib/mediaPartners";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: pageTitle("Indian-American newspapers & desi classifieds in the USA"),
  description: metaDescription(
    "The full list of Indian-American newspapers and desi classifieds websites in the USA — News India Times, Desi Talk, India-West, Khabar, Sulekha and more — plus where to list your desi business free.",
  ),
  alternates: { canonical: "/newspapers" },
};

function PartnerCard({ p }: { p: MediaPartner }) {
  return (
    <Link
      href={`/read?u=${encodeURIComponent(p.url)}&n=${encodeURIComponent(p.name)}`}
      className="flex items-baseline justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 hover:border-indigo-300 hover:bg-indigo-50/40"
    >
      <span className="font-semibold text-slate-900">{p.name}</span>
      <span className="text-right text-xs text-slate-500">{p.focus}</span>
    </Link>
  );
}

export default function NewspapersPage() {
  const badgeCode = `<a href="https://godesi.com/newspapers" target="_blank" rel="noopener"><img src="https://godesi.com/badges/featured-on-godesi.png" alt="Featured on GoDesi — the desi community platform" width="300" height="100" style="border:0"></a>`;

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-black tracking-tight text-slate-900">
          Indian-American newspapers &amp; desi classifieds in the USA
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-600">
          Every Indian-American newspaper and desi classifieds site we could
          find, in one place — for readers looking for their community&apos;s
          voice, and for businesses deciding where to advertise. We keep the
          list current as publications open and close; if we missed one,{" "}
          <Link href="/report" className="font-semibold text-indigo-600">
            tell us
          </Link>
          .
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          📰 Newspapers &amp; media publishers
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {NEWSPAPERS.map((p) => (
            <PartnerCard key={p.name} p={p} />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-slate-900">
          🗂️ Desi classifieds websites
        </h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {CLASSIFIEDS.map((p) => (
            <PartnerCard key={p.name} p={p} />
          ))}
        </div>
      </section>

      <Card className="space-y-3 border-amber-200 bg-amber-50/60">
        <h2 className="text-lg font-bold text-slate-900">
          Run a desi publication? Partner with GoDesi
        </h2>
        <p className="text-sm leading-relaxed text-slate-700">
          Your advertisers can carry a free GoDesi listing alongside their print
          ad — it keeps working after the issue date — and you earn a referral
          fee on any paid plan they take. We already carry partner papers on{" "}
          <Link href="/news" className="font-semibold text-indigo-600">
            the GoDesi news wire
          </Link>{" "}
          with full credit and links back.
        </p>
        <LinkButton href="/contact" className="bg-amber-500 text-slate-900">
          Talk to us about partnering
        </LinkButton>
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          Listed here? Show your badge
        </h2>
        <p className="text-sm text-slate-600">
          Paste this on your site — it points readers back to your listing here
          and tells Google we&apos;re connected.
        </p>
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/badges/featured-on-godesi.png"
            alt="Featured on GoDesi badge"
            width={300}
            height={100}
            className="rounded-xl border border-slate-200"
          />
          <pre className="flex-1 overflow-x-auto rounded-xl bg-slate-900 p-3 text-xs text-slate-100">
            {badgeCode}
          </pre>
        </div>
      </Card>
    </div>
  );
}
