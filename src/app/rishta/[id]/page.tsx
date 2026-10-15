import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { whatsappLink } from "@/lib/format";
import { effectivePlan } from "@/lib/plans";
import { NAKSHATRAS, RASHIS } from "@/lib/kundliSigns";
import { gunaVerdict } from "@/lib/gunaMilan";
import {
  POSTED_BY_LABELS,
  RISHTA_MARITAL_LABELS,
  ageFromBirthYear,
  canSeeRishtaPhoto,
  heightLabel,
  matchBetween,
  sameGotra,
} from "@/lib/rishta";
import { RishtaPhoto } from "@/components/RishtaCard";
import { ReportRishtaForm } from "@/components/forms/ReportRishtaForm";
import { Alert, Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";

async function load(id: string) {
  return db.rishtaProfile.findUnique({
    where: { id },
    include: { user: { select: { plan: true, planExpiresAt: true } } },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const profile = await load(params.id);
  if (!profile || profile.status !== "APPROVED") return { title: "Rishta" };
  return {
    title: `${profile.displayName}, ${ageFromBirthYear(profile.birthYear)} — Rishta in ${profile.city}`,
    robots: { index: false },
  };
}

export default async function RishtaProfilePage({
  params,
}: {
  params: { id: string };
}) {
  const [profile, viewer] = await Promise.all([
    load(params.id),
    getCurrentUser(),
  ]);
  if (!profile) notFound();
  const isOwner = viewer?.id === profile.userId;
  const isAdmin = viewer?.role === "ADMIN";
  if (
    !isOwner &&
    !isAdmin &&
    (profile.status !== "APPROVED" || !profile.visible)
  ) {
    notFound();
  }

  const mine =
    viewer && !isOwner
      ? await db.rishtaProfile.findUnique({ where: { userId: viewer.id } })
      : null;
  const match = mine ? matchBetween(mine, profile) : null;
  const paidPoster = effectivePlan(profile.user) !== "FREE";
  const canSeePhoto = canSeeRishtaPhoto(profile, viewer);
  const contactVisible =
    Boolean(profile.whatsappNumber) &&
    (isOwner || isAdmin || (Boolean(viewer) && paidPoster));

  const facts: [string, string | null][] = [
    ["Age", `${ageFromBirthYear(profile.birthYear)}`],
    ["Height", profile.heightCm ? heightLabel(profile.heightCm) : null],
    ["Marital status", RISHTA_MARITAL_LABELS[profile.maritalHistory]],
    ["Religion", profile.religion],
    ["Community", profile.community],
    ["Gotra", profile.gotra],
    ["Mother tongue", profile.motherTongue],
    ["Education", profile.education],
    ["Profession", profile.profession],
    [
      "Lives in",
      [profile.city, profile.state, profile.country].filter(Boolean).join(", "),
    ],
    ["Rashi", profile.moonSign !== null ? RASHIS[profile.moonSign].name : null],
    [
      "Nakshatra",
      profile.nakshatra !== null ? NAKSHATRAS[profile.nakshatra] : null,
    ],
    ["Posted by", POSTED_BY_LABELS[profile.postedBy]],
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link href="/rishta" className="text-sm font-semibold text-rose-700">
        ← All Rishta profiles
      </Link>
      {profile.status !== "APPROVED" ? (
        <Alert tone="info">
          This profile is {profile.status.toLowerCase()} and only you and GoDesi
          staff can see it.
        </Alert>
      ) : null}
      <div className="grid gap-4 md:grid-cols-[280px_1fr]">
        <RishtaPhoto profile={profile} canSee={canSeePhoto} className="h-80" />
        <Card>
          <h1 className="text-2xl font-black">{profile.displayName}</h1>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {facts
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label} className="contents">
                  <dt className="text-slate-500">{label}</dt>
                  <dd className="font-medium">{value}</dd>
                </div>
              ))}
          </dl>
          <div className="mt-4">
            {contactVisible && profile.whatsappNumber ? (
              <a
                href={whatsappLink(
                  profile.whatsappNumber,
                  `Namaste, I saw ${profile.displayName}'s Rishta profile on GoDesi.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white"
              >
                💬 WhatsApp the family
              </a>
            ) : !viewer ? (
              <LinkButton
                href={`/login?next=${encodeURIComponent(`/rishta/${profile.id}`)}`}
              >
                Sign in to contact the family
              </LinkButton>
            ) : (
              <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
                🔒 This family hasn&apos;t opened their contact yet.
              </p>
            )}
          </div>
          {isOwner ? (
            <div className="mt-3 space-y-2 text-sm">
              {!paidPoster && profile.whatsappNumber ? (
                <Alert tone="info">
                  Your WhatsApp is hidden from other families.{" "}
                  <Link href="/pricing" className="font-semibold underline">
                    Upgrade to Pro or Featured
                  </Link>{" "}
                  to let signed-in members contact you.
                </Alert>
              ) : null}
              <LinkButton href="/rishta/new" variant="secondary">
                Edit my profile
              </LinkButton>
            </div>
          ) : null}
        </Card>
      </div>

      <Card>
        <h2 className="text-lg font-bold">About</h2>
        <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
          {profile.about}
        </p>
      </Card>

      {match ? (
        <Card>
          <h2 className="text-lg font-bold">
            🔮 Kundli match with your profile: {match.total}/36
          </h2>
          <p className="text-sm font-semibold text-violet-700">
            {gunaVerdict(match.total)}
          </p>
          {sameGotra(mine?.gotra ?? null, profile.gotra) ? (
            <p className="mt-2 text-sm font-semibold text-amber-700">
              ⚠️ Same gotra — many families don&apos;t marry within the gotra.
            </p>
          ) : null}
          <table className="mt-3 w-full text-sm">
            <tbody>
              {match.kootas.map((koota) => (
                <tr key={koota.name} className="border-t border-slate-100">
                  <td className="py-1 font-medium">{koota.name}</td>
                  <td className="py-1 text-slate-500">{koota.meaning}</td>
                  <td className="py-1 text-right font-semibold">
                    {koota.score}/{koota.max}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-slate-500">
            Guna milan is a traditional practice and a matter of belief. Many
            families also check Manglik dosha with a pandit.{" "}
            <Link href="/astrology" className="font-semibold text-violet-700">
              Find an astrologer
            </Link>
            .
          </p>
        </Card>
      ) : viewer && !isOwner ? (
        <p className="text-sm text-slate-500">
          Add your rashi and nakshatra to{" "}
          <Link href="/rishta/new" className="font-semibold text-rose-700">
            your Rishta profile
          </Link>{" "}
          to see your 36-guna match.
        </p>
      ) : null}
      {viewer && !isOwner ? <ReportRishtaForm profileId={profile.id} /> : null}
    </div>
  );
}
