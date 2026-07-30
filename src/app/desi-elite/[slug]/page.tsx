import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, LinkButton } from "@/components/ui";
import { PlaceLink } from "@/components/PlaceLink";
import { StaffEditLink } from "@/components/StaffEditLink";
import { ELITE_BADGES, showsContact } from "@/lib/elite";
import { videoEmbedUrl } from "@/lib/video";
import { whatsappLink } from "@/lib/format";

export const dynamic = "force-dynamic";

async function getEntry(slug: string) {
  return db.eliteEntry.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { user: { select: { username: true } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const entry = await getEntry(params.slug);
  if (!entry) return { title: "GoDesi Elite — Godesi" };
  return {
    title: `${entry.fullName} — GoDesi Elite | Godesi`,
    description: entry.shortBio.slice(0, 300),
    openGraph: entry.photoUrl ? { images: [entry.photoUrl] } : undefined,
  };
}

export default async function EliteProfilePage({
  params,
}: {
  params: { slug: string };
}) {
  const entry = await getEntry(params.slug);
  if (!entry) notFound();

  const badge = ELITE_BADGES[entry.badge];
  const embed = videoEmbedUrl(entry.videoUrl ?? entry.interviewUrl);
  const achievements = (entry.achievements ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link href="/desi-elite" className="text-sm font-semibold text-indigo-600">
        ← GoDesi Elite
      </Link>

      <Card className={`relative ${badge.card}`}>
        <span
          className={`absolute -top-2.5 left-4 rounded-full px-3 py-0.5 text-xs font-black uppercase tracking-wide shadow ${badge.ribbon}`}
        >
          {badge.label}
        </span>
        <StaffEditLink
          href={`/admin/desi-elite?entry=${entry.id}`}
          className="absolute right-4 top-4"
        />
        <div className="flex flex-col gap-4 pt-3 sm:flex-row sm:items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={entry.photoUrl ?? "/placeholder-logo.svg"}
            alt={entry.fullName}
            className="h-24 w-24 rounded-2xl border border-slate-200 object-cover"
          />
          <div className="min-w-0">
            <h1 className="text-2xl font-black sm:text-3xl">{entry.fullName}</h1>
            {entry.businessName ? (
              <p className="text-base font-semibold text-slate-700">
                {entry.businessName}
              </p>
            ) : null}
            <p className="text-sm text-slate-600">
              {entry.category} ·{" "}
              <PlaceLink city={entry.city} state={entry.state} country={entry.country} />
              {entry.yearsExperience !== null
                ? ` · ${entry.yearsExperience} yrs experience`
                : ""}
            </p>
            {entry.user?.username ? (
              <Link
                href={`/${entry.user.username}`}
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                Godesi profile →
              </Link>
            ) : null}
          </div>
        </div>
      </Card>

      {embed ? (
        <Card>
          <h2 className="mb-2 text-lg font-bold">🎥 Interview</h2>
          <div className="aspect-video overflow-hidden rounded-xl border border-slate-200">
            <iframe
              src={embed}
              title={`${entry.fullName} interview`}
              allowFullScreen
              className="h-full w-full"
            />
          </div>
        </Card>
      ) : null}

      <Card>
        <h2 className="mb-2 text-lg font-bold">About</h2>
        <p className="whitespace-pre-line text-sm text-slate-700">{entry.shortBio}</p>
      </Card>

      {achievements.length ? (
        <Card>
          <h2 className="mb-2 text-lg font-bold">🏅 Achievements</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-slate-700">
            {achievements.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {entry.socialLinks.length || entry.websiteUrl ? (
        <Card>
          <h2 className="mb-2 text-lg font-bold">Links</h2>
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            {[entry.websiteUrl, ...entry.socialLinks]
              .filter((url): url is string => Boolean(url))
              .map((url) => (
                <a
                  key={url}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-300 px-3 py-1 text-slate-700 hover:bg-slate-50"
                >
                  {new URL(url).hostname.replace(/^www\./, "")}
                </a>
              ))}
          </div>
        </Card>
      ) : null}

      <Card>
        <h2 className="mb-2 text-lg font-bold">Contact</h2>
        {showsContact(entry.badge) ? (
          <div className="flex flex-wrap gap-2">
            {entry.contactPhone ? (
              <a
                href={whatsappLink(entry.contactPhone)}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white"
              >
                WhatsApp
              </a>
            ) : null}
            {entry.contactEmail ? (
              <a
                href={`mailto:${entry.contactEmail}`}
                className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-bold text-slate-700"
              >
                Email
              </a>
            ) : null}
            {!entry.contactPhone && !entry.contactEmail ? (
              <p className="text-sm text-slate-600">No contact details shared.</p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-slate-600">
            Contact details are shown on Premium and Featured entries.{" "}
            <Link href="/pricing" className="font-bold text-indigo-600 underline">
              Upgrade
            </Link>{" "}
            to display yours.
          </p>
        )}
      </Card>

      <Card className="border-amber-200 bg-amber-50">
        <p className="text-sm font-semibold text-amber-900">
          Know someone who belongs in GoDesi Elite?
        </p>
        <LinkButton href="/desi-elite/apply?nominate=other" className="mt-3">
          Nominate them
        </LinkButton>
      </Card>
    </div>
  );
}
