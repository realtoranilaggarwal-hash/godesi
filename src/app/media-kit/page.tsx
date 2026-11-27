import type { Metadata } from "next";
import Link from "next/link";
import { GODESI_FLYERS } from "@/lib/flyers";
import { ASTRO_MEDIA_KIT } from "@/lib/astrology";

export const metadata: Metadata = {
  title: "GoDesi media kit — flyers to share and print",
  description:
    "Download GoDesi's flyers for WhatsApp, Instagram, Facebook and print. Each QR code opens the matching GoDesi page.",
  alternates: { canonical: "/media-kit" },
};

export default function MediaKitPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-orange-500 via-pink-600 to-purple-700 px-5 py-6 text-white sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
          GoDesi media kit
        </p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Share GoDesi 📣</h1>
        <p className="mt-2 max-w-2xl text-white/90">
          Download a flyer and post it on WhatsApp, Instagram or Facebook, or
          print it for your shop counter. Every QR code opens the matching GoDesi
          page. Want one with your own business QR code? Order it from the{" "}
          <Link href="/marketing-shop" className="font-bold underline">
            GoDesi Marketing Shop
          </Link>
          .
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
          <Link href="/advertise" className="rounded-xl bg-white px-3 py-2 text-purple-700">
            Advertise on GoDesi
          </Link>
          <Link
            href={ASTRO_MEDIA_KIT.href}
            className="rounded-xl bg-white/15 px-3 py-2 text-white ring-1 ring-white/40"
          >
            Astrologer media kit
          </Link>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {GODESI_FLYERS.map((flyer) => (
          <figure
            key={flyer.slug}
            className={`flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${
              flyer.width > flyer.height ? "md:col-span-2" : ""
            }`}
          >
            <a href={flyer.full} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={flyer.full}
                alt={`GoDesi flyer: ${flyer.title}. ${flyer.line}`}
                width={flyer.width}
                height={flyer.height}
                loading="lazy"
                className="h-auto w-full"
              />
            </a>
            <figcaption className="flex flex-1 flex-col gap-2 p-4">
              <p className="font-bold">{flyer.title}</p>
              <p className="text-sm text-slate-600">{flyer.line}</p>
              <p className="text-xs text-slate-500">
                {flyer.width} × {flyer.height} px ·{" "}
                {flyer.width > flyer.height ? "landscape" : "portrait"} · JPG
              </p>
              <a
                href={flyer.full}
                download
                className="mt-auto w-fit rounded-xl bg-purple-700 px-3 py-2 text-sm font-bold text-white"
              >
                ⬇ Download
              </a>
            </figcaption>
          </figure>
        ))}
      </section>

      <p className="text-sm text-slate-500">
        Sharp for phones and social media, and for print up to about 3.5 × 5
        in. Need a poster size or your own logo on it?{" "}
        <Link href="/advertise/design" className="font-semibold text-purple-700 underline">
          Ask us to design it
        </Link>
        .
      </p>
    </div>
  );
}
