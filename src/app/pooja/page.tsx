import type { Metadata } from "next";
import { POOJA_PACKAGES } from "@/lib/poojaPackages";
import { PoojaBookingForm } from "@/components/PoojaBookingForm";
import { Card } from "@/components/ui";

export const metadata: Metadata = {
  title: "Book a video pooja — live pandit, in your name & gotra",
  description:
    "Ganesh, Satyanarayan, Rudra Abhishek, Lakshmi, Griha Pravesh and custom havans — a Vedic pandit performs your pooja live on video, with sankalp in your name and gotra.",
  alternates: { canonical: "/pooja" },
};

const STEPS = [
  { icon: "🙏", text: "Pick a package & book below" },
  { icon: "📞", text: "Our team calls to fix the muhurat" },
  { icon: "📹", text: "Pandit performs your pooja live on video" },
  { icon: "🌺", text: "Sankalp in your name & gotra — prasad options available" },
];

export default function PoojaPage({
  searchParams,
}: {
  searchParams: { package?: string };
}) {
  const selected = POOJA_PACKAGES.find(
    (pkg) => pkg.slug === searchParams.package,
  );

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 px-5 py-8 text-white sm:px-8">
        <h1 className="text-3xl font-black sm:text-4xl">
          🪔 Book a video pooja
        </h1>
        <p className="mt-2 max-w-2xl text-white/90">
          A Vedic pandit performs the ritual live on video in your name and
          gotra — at your home&apos;s altar, wherever you are in the world.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          {STEPS.map((step) => (
            <div
              key={step.icon}
              className="rounded-xl bg-white/15 px-3 py-2 text-xs font-semibold"
            >
              <span className="text-base">{step.icon}</span> {step.text}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        {POOJA_PACKAGES.map((pkg) => (
          <Card
            key={pkg.slug}
            className={
              selected?.slug === pkg.slug
                ? "border-2 border-amber-400"
                : undefined
            }
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xl">{pkg.emoji}</p>
                <h2 className="mt-1 font-black text-slate-900">{pkg.name}</h2>
                <p className="text-xs font-semibold text-orange-700">
                  {pkg.deity}
                </p>
              </div>
              <p className="rounded-full bg-amber-100 px-3 py-1 text-sm font-black text-amber-800">
                {pkg.priceUsd ? `$${pkg.priceUsd}` : "Custom"}
              </p>
            </div>
            <p className="mt-2 text-sm text-slate-600">{pkg.purpose}</p>
            <ul className="mt-2 space-y-1 text-xs text-slate-600">
              {pkg.includes.map((item) => (
                <li key={item}>✓ {item}</li>
              ))}
            </ul>
            <a
              href={`/pooja?package=${pkg.slug}#book`}
              className="mt-3 inline-block rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600"
            >
              Book {pkg.priceUsd ? `— $${pkg.priceUsd}` : ""}
            </a>
          </Card>
        ))}
      </div>

      <Card id="book" className="border-2 border-amber-300 bg-amber-50/60">
        <h2 className="text-lg font-black text-slate-900">
          🙏 Book {selected ? `— ${selected.name}` : "your pooja"}
        </h2>
        <p className="mb-3 mt-1 text-sm text-slate-600">
          Fill this in and our pandit team confirms your muhurat on call or
          WhatsApp within a day.
        </p>
        <PoojaBookingForm pkg={selected?.slug ?? POOJA_PACKAGES[0].slug} />
      </Card>

      <p className="text-center text-xs text-slate-500">
        Running a temple or a pandit yourself?{" "}
        <a href="/contact" className="font-semibold text-indigo-600">
          Partner with GoDesi Pooja →
        </a>
      </p>
    </div>
  );
}
