import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  type Authority,
  COMPLAINT_GUIDES,
  EVERGREEN_EVIDENCE,
  POST_RULES,
  complaintGuide,
} from "@/lib/complaints";
import { FOOD_SAFETY_STATES } from "@/lib/foodSafetyStates";
import { siteUrl } from "@/lib/format";
import { StatePicker } from "@/components/StatePicker";
import { SidebarBanners } from "@/components/Banners";
import { CopyButton } from "@/components/CopyButton";
import { Card } from "@/components/ui";

export function generateStaticParams() {
  return COMPLAINT_GUIDES.map((guide) => ({ slug: guide.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const guide = complaintGuide(params.slug);
  if (!guide) return { title: "Guide not found" };
  return {
    title: `${guide.title} — how to complain (US & Canada)`,
    description: guide.intro,
    alternates: { canonical: `${siteUrl()}/complaints/${guide.slug}` },
  };
}

function AuthorityList({
  flag,
  country,
  rows,
}: {
  flag: string;
  country: string;
  rows: Authority[];
}) {
  return (
    <Card>
      <h2 className="text-lg font-bold">
        {flag} Where to file in {country}
      </h2>
      <ul className="mt-3 space-y-3">
        {rows.map((row) => (
          <li key={row.url + row.name} className="text-sm">
            <a
              href={row.url}
              target="_blank"
              rel="noreferrer noopener"
              className="font-bold text-rose-700 hover:underline"
            >
              {row.name} ↗
            </a>
            <p className="text-slate-600">{row.when}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export default function ComplaintGuidePage({
  params,
}: {
  params: { slug: string };
}) {
  const guide = complaintGuide(params.slug);
  if (!guide) notFound();

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: guide.title,
      description: guide.intro,
      step: guide.firstSteps.map((text, index) => ({
        "@type": "HowToStep",
        position: index + 1,
        text,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: guide.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    },
  ];

  const others = COMPLAINT_GUIDES.filter((row) => row.slug !== guide.slug);

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-3xl flex-1 space-y-5">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <section className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 px-5 py-8 text-white sm:px-8">
          <Link
            href="/complaints"
            className="text-xs font-semibold uppercase tracking-widest text-white/80 hover:underline"
          >
            ← Consumer help
          </Link>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            {guide.emoji} {guide.title}
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">{guide.intro}</p>
        </section>

        <Card>
          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
            Sounds like this?
          </p>
          <p className="mt-1 text-sm text-slate-700">{guide.example}</p>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">Step by step</h2>
          <ol className="mt-3 space-y-2">
            {guide.firstSteps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm text-slate-700">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-black text-rose-700">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
            <li className="flex gap-3 text-sm text-slate-700">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-xs font-black text-rose-700">
                {guide.firstSteps.length + 1}
              </span>
              <span>
                File with the official body below, using the template. Then warn
                the community with a{" "}
                <Link
                  href="/news/report?topic=consumer"
                  className="font-semibold text-rose-700 hover:underline"
                >
                  consumer alert on GoDesi
                </Link>{" "}
                — anonymously if you prefer.
              </span>
            </li>
          </ol>
        </Card>

        <Card>
          <h2 className="text-lg font-bold">What to gather</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {guide.evidence.map((point) => (
              <li key={point}>• {point}</li>
            ))}
          </ul>
          <details className="mt-3 text-sm text-slate-600">
            <summary className="cursor-pointer font-semibold text-slate-700">
              The full evidence checklist
            </summary>
            <ul className="mt-2 space-y-1">
              {EVERGREEN_EVIDENCE.map((point) => (
                <li key={point}>• {point}</li>
              ))}
            </ul>
          </details>
        </Card>

        {guide.writeDown ? (
          <Card>
            <h2 className="text-lg font-bold">Write down what happened</h2>
            <p className="mt-1 text-xs text-slate-500">
              Fill this in the same day — it becomes your complaint. Copy it
              into your notes app.
            </p>
            <div className="mt-3 flex justify-end">
              <CopyButton
                value={guide.writeDown.map((f) => `${f}: `).join("\n")}
                label="Copy blank sheet"
              />
            </div>
            <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
              {guide.writeDown.map((field) => (
                <div
                  key={field}
                  className="flex items-baseline gap-2 border-b border-dotted border-slate-200 py-1"
                >
                  <dt className="shrink-0 text-slate-700">{field}:</dt>
                  <dd className="flex-1 text-slate-300"> </dd>
                </div>
              ))}
            </dl>
          </Card>
        ) : null}

        {guide.hotlines ? (
          <Card>
            <h2 className="text-lg font-bold">
              ☎️ Hotlines and online forms (US)
            </h2>
            <ul className="mt-3 space-y-3">
              {guide.hotlines.map((line) => (
                <li key={line.url + line.name} className="text-sm">
                  <a
                    href={line.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-bold text-rose-700 hover:underline"
                  >
                    {line.name} ↗
                  </a>
                  {line.phone ? (
                    <span className="ml-2 rounded-lg bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-800">
                      {line.phone}
                    </span>
                  ) : null}
                  <p className="text-slate-600">{line.note}</p>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {guide.ifSick ? (
          <Card className="border-rose-200 bg-rose-50">
            <h2 className="text-lg font-bold text-rose-900">
              🩺 If someone became sick
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-rose-900/90">
              {guide.ifSick.map((point) => (
                <li key={point}>☐ {point}</li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-rose-800/80">
              Reporting suspected food poisoning is how public-health officials
              spot an outbreak early.
            </p>
          </Card>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <AuthorityList flag="🇺🇸" country="the US" rows={guide.us} />
          <AuthorityList flag="🇨🇦" country="Canada" rows={guide.canada} />
        </div>

        {guide.stateDirectory ? (
          <Card id="states">
            <h2 className="text-lg font-bold">
              🗺️ Your state&apos;s food-safety complaint office
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Food-safety contacts differ from state to state, sometimes city to
              city. Pick your state for the agency that inspects stores and
              restaurants there; it will route you to the county office if that
              is who handles it.
            </p>
            <StatePicker states={FOOD_SAFETY_STATES} />
          </Card>
        ) : null}

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Copy this complaint</h2>
            <CopyButton value={guide.template} label="Copy template" />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Replace the [brackets], keep it short and factual, attach the
            evidence. Email it, paste it into the online form, or read it out on
            the phone.
          </p>
          <pre className="mt-3 whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
            {guide.template}
          </pre>
        </Card>

        <section className="rounded-3xl bg-slate-900 px-5 py-6 text-white sm:px-8">
          <h2 className="text-xl font-bold">Warn the next customer</h2>
          <p className="mt-2 text-sm text-white/80">
            An official complaint fixes it for you; an alert on GoDesi fixes it
            for the community. Post what happened with the date, place and
            photos. Tick <em>Post anonymously</em> and readers see “A GoDesi
            member · your city” — the news desk keeps your name.
          </p>
          <ul className="mt-3 space-y-1 text-xs text-white/70">
            {POST_RULES.slice(0, 3).map((rule) => (
              <li key={rule}>• {rule}</li>
            ))}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
            <Link
              href="/news/report?topic=consumer"
              className="rounded-xl bg-white px-3 py-2 text-slate-900"
            >
              Post a consumer alert
            </Link>
            <Link
              href="/news?topic=consumer"
              className="rounded-xl border border-white/40 px-3 py-2"
            >
              Read alerts
            </Link>
          </div>
        </section>

        {guide.faqs.length ? (
          <Card>
            <h2 className="text-lg font-bold">Questions people ask</h2>
            <dl className="mt-3 space-y-3">
              {guide.faqs.map((faq) => (
                <div key={faq.q}>
                  <dt className="text-sm font-bold text-slate-900">{faq.q}</dt>
                  <dd className="mt-1 text-sm text-slate-600">{faq.a}</dd>
                </div>
              ))}
            </dl>
          </Card>
        ) : null}

        <Card>
          <h2 className="text-sm font-bold text-slate-700">Other guides</h2>
          <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
            {others.map((row) => (
              <li key={row.slug}>
                <Link
                  href={`/complaints/${row.slug}`}
                  className="text-rose-700 hover:underline"
                >
                  {row.emoji} {row.title}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Official links were checked when this guide was written; agencies
            move pages, so if one fails, search the agency name plus
            “complaint”. Nothing here is legal advice.
          </p>
        </Card>
      </div>
      <SidebarBanners />
    </div>
  );
}
