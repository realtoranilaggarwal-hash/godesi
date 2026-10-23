import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui";
import { TravelSearch } from "@/components/travel/TravelSearch";
import { TravelWidget } from "@/components/travel/TravelWidget";
import { TRAVEL_GUIDES, getTravelGuide } from "@/lib/travelGuides";

export function generateStaticParams() {
  return TRAVEL_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const guide = getTravelGuide(params.slug);
  if (!guide) return {};
  return {
    title: `${guide.title} — GoDesi Travel`,
    description: guide.description,
    alternates: { canonical: `/travel/guides/${guide.slug}` },
  };
}

export default function TravelGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const guide = getTravelGuide(params.slug);
  if (!guide) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <p className="text-sm">
        <Link
          href="/travel/guides"
          className="font-semibold text-indigo-600 hover:underline"
        >
          ← All travel guides
        </Link>
      </p>

      <section className="rounded-3xl bg-gradient-to-br from-indigo-600 via-sky-600 to-cyan-500 p-6 text-white sm:p-8">
        <div className="text-3xl">{guide.emoji}</div>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">{guide.title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/90">
          {guide.description}
        </p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-white/70">
          {guide.minutes} min read
        </p>
      </section>

      {guide.sections.map((section) => (
        <Card key={section.heading} className="space-y-3">
          <h2 className="text-lg font-bold text-slate-900">{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p
              key={paragraph.slice(0, 40)}
              className="text-sm leading-relaxed text-slate-600"
            >
              {paragraph}
            </p>
          ))}
          {section.links && section.links.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {section.links.map((link) => {
                const external = link.href.startsWith("http");
                return external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    {link.label} →
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    {link.label} →
                  </Link>
                );
              })}
            </div>
          )}
        </Card>
      ))}

      <Card className="p-4 sm:p-5">
        <TravelWidget />
      </Card>

      <Card className="space-y-3">
        <h2 className="text-lg font-bold text-slate-900">
          Search flights &amp; hotels
        </h2>
        <TravelSearch />
      </Card>
    </div>
  );
}
