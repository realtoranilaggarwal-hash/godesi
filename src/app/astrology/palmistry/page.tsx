import type { Metadata } from "next";
import Link from "next/link";
import { ASTROLOGY_DISCLAIMER } from "@/lib/astrology";
import { PALM_READING, PALM_SECTIONS } from "@/lib/palmistry";
import { AstrologerBanners, SidebarBanners } from "@/components/Banners";

export const metadata: Metadata = {
  title: "Free palm reading guide (ebook) — read your own hand, or book Anil for $10",
  description:
    "Free palmistry ebook from GoDesi: hand shape, fingers, thumb, life, head, heart and fate lines, mounts and special marks, with a full palm chart. Book a palm reading with Anil on WhatsApp for $10 per hand.",
  alternates: { canonical: PALM_READING.href },
  openGraph: { images: [PALM_READING.chart] },
};

function BookAnil() {
  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
      <h2 className="text-xl font-bold text-slate-900">✋ Book a palm reading with Anil</h2>
      <p className="mt-2 text-slate-700">
        Anil Aggarwal, the founder of GoDesi.com, was known in college as the
        fortune teller: friends lined up to show him their palms. Now you can
        book a personal reading with him. Send a clear photo of your palm on
        WhatsApp and he reads it for you.
      </p>
      <p className="mt-3 text-2xl font-extrabold text-emerald-700">{PALM_READING.price}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <a
          href={PALM_READING.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl bg-emerald-600 px-4 py-2 font-bold text-white hover:bg-emerald-700"
        >
          Book on WhatsApp →
        </a>
        <span className="text-sm text-slate-600">WhatsApp {PALM_READING.whatsappDisplay}</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Readings are for reflection and fun. They are not medical, legal,
        financial or mental-health advice.
      </p>
    </section>
  );
}

export default function PalmistryPage() {
  return (
    <div className="flex justify-center gap-6">
      <AstrologerBanners />
      <article className="min-w-0 max-w-3xl flex-1 space-y-5">
        <p className="text-sm">
          <Link href="/astrology" className="font-semibold text-violet-700 hover:underline">
            ← Astrology
          </Link>
        </p>
        <section className="rounded-3xl bg-gradient-to-r from-indigo-800 via-violet-700 to-fuchsia-600 px-5 py-8 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Free ebook · Palmistry
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Read your own palm: the complete map ✋
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">
            Palmistry (hast rekha shastra) reads character from the shape of
            your hand, your fingers and the lines on your palm. Use the chart and
            the six steps below to read your own hand, or book a reading with Anil.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
            <a
              href={PALM_READING.pdf}
              download
              className="rounded-xl bg-amber-300 px-3 py-2 text-violet-900"
            >
              📘 Download the free ebook (PDF)
            </a>
            <a
              href={PALM_READING.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-white px-3 py-2 text-violet-700"
            >
              Book Anil · {PALM_READING.price}
            </a>
          </div>
        </section>

        <BookAnil />

        <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <a href={PALM_READING.chart} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PALM_READING.chartSmall}
              srcSet={`${PALM_READING.chartSmall} 600w, ${PALM_READING.chart} 1024w`}
              sizes="(min-width: 768px) 720px, 100vw"
              alt="Palm reading chart: hand overview, finger meanings, thumb analysis, major lines, mounts, special marks and the traditional life pattern"
              width={1024}
              height={1536}
              className="h-auto w-full"
            />
          </a>
          <figcaption className="p-3 text-xs text-slate-500">
            The full palm map. Tap to open it full size, or download the ebook.
          </figcaption>
        </figure>

        {PALM_SECTIONS.map((section) => (
          <section key={section.heading} className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="text-lg font-bold text-slate-900">{section.heading}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700">
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </section>
        ))}

        <BookAnil />

        <p className="text-sm text-slate-600">
          Prefer a professional? <Link href="/astrology#astrologers" className="font-semibold text-violet-700 hover:underline">Find an astrologer or palm reader on GoDesi</Link>.
        </p>
        <p className="text-xs text-slate-500">
          Palmistry is a traditional practice, not a science. {ASTROLOGY_DISCLAIMER}
        </p>
      </article>
      <SidebarBanners categorySlug="section:astrology" />
    </div>
  );
}
