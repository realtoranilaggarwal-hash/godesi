import type { Metadata } from "next";
import Link from "next/link";
import { ASTRO_MEDIA_KIT } from "@/lib/astrology";
import { AstrologerBanners } from "@/components/Banners";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Astrologer media kit — advertise on GoDesi astrology pages",
  description:
    "Advertising for astrologers, pandits and jyotish services on GoDesi: the astrologer banner on horoscope, Panchang and Kundli pages, Featured membership, prices and how to book.",
  alternates: { canonical: ASTRO_MEDIA_KIT.href },
};

export default function AstrologerMediaKitPage() {
  return (
    <div className="flex justify-center gap-6">
      <AstrologerBanners />
      <div className="min-w-0 max-w-3xl flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-700 via-violet-600 to-fuchsia-600 px-5 py-6 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Astrologer media kit
          </p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">
            Advertise to desi families looking for an astrologer 🔮
          </h1>
          <p className="mt-2 max-w-2xl text-white/90">
            The astrologer banner plus Featured membership from $35 a month.
            Download the media kit or book a spot online.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
            <a
              href={ASTRO_MEDIA_KIT.pdf}
              download
              className="rounded-xl bg-amber-300 px-3 py-2 text-violet-900"
            >
              ⬇ Download media kit (PDF)
            </a>
            <Link
              href="/advertise?slot=ASTRO#book"
              className="rounded-xl bg-white px-3 py-2 text-violet-700"
            >
              Book the astrologer banner
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl bg-white px-3 py-2 text-violet-700"
            >
              Go Featured
            </Link>
          </div>
        </section>
        <a
          href={ASTRO_MEDIA_KIT.pdf}
          className="block overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ASTRO_MEDIA_KIT.image}
            alt="GoDesi astrologer media kit: astrologer banner $15 a month, Featured membership $20 a month, combo $35 a month or $244 a year"
            width={1632}
            height={2112}
            className="h-auto w-full"
          />
        </a>
        <p className="text-sm text-slate-600">
          Questions? Call or WhatsApp (732) 983-7958 or email
          godesibiz@gmail.com. Prices are in US dollars; visitors in India see ₹
          prices on the booking pages.
        </p>
      </div>
    </div>
  );
}
