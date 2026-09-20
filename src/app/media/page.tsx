import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { Card, LinkButton } from "@/components/ui";
import { EliteCard } from "@/components/EliteCard";
import {
  CONTENT_MULTIPLIER,
  FIRST_MARKETS,
  MEDIA_PROGRAMS,
  WHOS_WHO_YOUTUBE,
} from "@/lib/media";
import { STUDIO_ADDRESS } from "@/lib/storySheet";

export const revalidate = 3600;
export const metadata: Metadata = {
  title:
    "GoDesi Media — Desi Who's Who, GoDesi News, Podcast & Community Stories",
  description:
    "GoDesi Media gives the desi community in America a place to be seen, heard and remembered: the Desi Who's Who interview show, GoDesi News, the GoDesi Podcast, Desi on the Street and Desi Business Spotlight. Nominate someone or join the team.",
  alternates: { canonical: "/media" },
};

export default async function MediaPage() {
  const recent = await db.eliteEntry.findMany({
    where: { status: "PUBLISHED", videoUrl: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  return (
    <div className="space-y-8">
      <Card className="border-amber-200 bg-gradient-to-br from-slate-900 via-slate-800 to-amber-900 text-white">
        <p className="text-xs font-bold uppercase tracking-wide text-amber-300">
          GoDesi Media
        </p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl">
          A place for desis in America to be seen, heard and remembered.
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-slate-200 sm:text-base">
          Desi Who&apos;s Who · GoDesi News · The GoDesi Podcast · Desi on the
          Street · Desi Business Spotlight. Millions of desis, thousands of
          stories that will never reach mainstream TV — we record them while
          they are being written.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton
            href="/desi-elite/apply"
            className="bg-amber-400 text-slate-900 hover:bg-amber-300"
          >
            Nominate yourself
          </LinkButton>
          <LinkButton
            href="/desi-elite/apply?nominate=other"
            className="bg-white/10 text-white ring-1 ring-white/40 hover:bg-white/20"
          >
            Nominate someone
          </LinkButton>
          <LinkButton
            href="/media/join"
            className="bg-white/10 text-white ring-1 ring-white/40 hover:bg-white/20"
          >
            Join the team
          </LinkButton>
          <a
            href={WHOS_WHO_YOUTUBE}
            target="_blank"
            rel="noopener noreferrer"
            className="self-center text-sm font-semibold text-amber-200 underline"
          >
            ▶️ youtube.com/@desiwhoswho
          </a>
        </div>
      </Card>

      <section>
        <h2 className="text-xl font-black">Our shows</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {MEDIA_PROGRAMS.map((program) => {
            const external = program.href.startsWith("http");
            return (
              <Card key={program.slug} className="flex flex-col">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700">
                  {program.tag}
                </p>
                <h3 className="mt-1 text-lg font-black">
                  {program.icon} {program.name}
                </h3>
                <p className="mt-2 flex-1 text-sm text-slate-600">
                  {program.blurb}
                </p>
                {external ? (
                  <a
                    href={program.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-sm font-bold text-indigo-600 hover:underline"
                  >
                    {program.cta} →
                  </a>
                ) : (
                  <Link
                    href={program.href}
                    className="mt-3 text-sm font-bold text-indigo-600 hover:underline"
                  >
                    {program.cta} →
                  </Link>
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {recent.length ? (
        <section>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black">Recent Desi Who&apos;s Who</h2>
            <Link
              href="/desi-elite"
              className="text-sm font-semibold text-indigo-600"
            >
              All profiles →
            </Link>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {recent.map((entry) => (
              <EliteCard key={entry.id} entry={entry} size="small" />
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-black">How an interview works</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
            <li>
              <b>Nominate</b> — yourself or someone who deserves it at{" "}
              <Link
                href="/desi-elite/apply"
                className="font-semibold underline"
              >
                godesi.com/desi-elite/apply
              </Link>
              . Free.
            </li>
            <li>
              <b>Prepare</b> — you fill in a short story sheet: how you came to
              America, your first job, the challenge that shaped you, the
              mistake that taught you most.
            </li>
            <li>
              <b>Record</b> — 30–45 minutes at the {STUDIO_ADDRESS}, or over
              Zoom.
            </li>
            <li>
              <b>Publish</b> — your interview goes on YouTube and your GoDesi
              Elite profile, clips go on social, and a GoDesi News story links
              back to your business or profile.
            </li>
          </ol>
        </Card>
        <Card className="border-amber-200 bg-amber-50">
          <h2 className="text-lg font-black text-amber-900">
            One interview → a week of content
          </h2>
          <ul className="mt-3 grid gap-1 text-sm text-amber-900 sm:grid-cols-2">
            {CONTENT_MULTIPLIER.map((item) => (
              <li key={item}>✔ {item}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-amber-900">
            Every piece links back to GoDesi — the guest shares it, their
            customers discover their card, and more businesses see the
            opportunity.
          </p>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-black">The studio</h2>
          <p className="mt-2 text-sm text-slate-700">
            <b>GoDesi Media Studio</b>
            <br />1 Austin Ave, Suite C, Iselin, NJ 08830
          </p>
          <p className="mt-2 text-sm text-slate-600">
            Two cameras, two microphones, lights and a GoDesi backdrop in our
            Iselin office — a place people come to tell their story. Starting
            with Central New Jersey: {FIRST_MARKETS.join(", ")} and the towns
            around them; then New York, Pennsylvania, Texas, California,
            Illinois, Georgia, Florida, and local contributors nationwide.
          </p>
        </Card>
        <Card className="border-indigo-200 bg-indigo-50">
          <h2 className="text-lg font-black text-indigo-900">Join the team</h2>
          <p className="mt-2 text-sm text-indigo-900">
            We are looking for interviewers and hosts, camera and lighting,
            editors for long-form and Shorts, reporters, social-media clip
            makers and Desi-on-the-Street roving reporters — in any desi
            language.
          </p>
          <LinkButton href="/media/join" className="mt-3">
            Apply to join GoDesi Media
          </LinkButton>
          <p className="mt-3 text-xs text-indigo-900">
            Businesses: sponsored segments are always labelled so the audience
            can tell advertising from reporting.{" "}
            <Link href="/advertise" className="font-semibold underline">
              Sponsor a show
            </Link>
            .
          </p>
        </Card>
      </section>
    </div>
  );
}
