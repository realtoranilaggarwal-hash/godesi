import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { RASHIS } from "@/lib/kundliSigns";
import { RELIGIONS, canSeeRishtaPhoto, matchBetween } from "@/lib/rishta";
import { RishtaCard } from "@/components/RishtaCard";
import { AstrologerList } from "@/components/AstrologerList";
import { ASTROLOGER_SUBCATEGORIES } from "@/lib/astrology";
import { searchBusinesses } from "@/lib/businesses";
import { Alert, EmptyState, LinkButton, inputClass } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Rishta — desi matrimonial profiles with kundli match",
  description:
    "Marriage-minded desi profiles posted by the person or their family. Reviewed by GoDesi, with optional hidden photos and a free 36-guna kundli match.",
  alternates: { canonical: "/rishta" },
};

type Filters = {
  seeking?: string;
  minAge?: string;
  maxAge?: string;
  city?: string;
  religion?: string;
  community?: string;
  rashi?: string;
};

const SAFETY = [
  "Every profile is reviewed before it appears",
  "Hide the photo and share it only on request",
  "Contact shows to signed-in members only",
  "Never send money to someone you haven't met",
];

export default async function RishtaPage({
  searchParams,
}: {
  searchParams: Filters;
}) {
  const [viewer, astrologers] = await Promise.all([
    getCurrentUser(),
    searchBusinesses({ categorySlugs: ASTROLOGER_SUBCATEGORIES, take: 4 }),
  ]);
  const mine = viewer
    ? await db.rishtaProfile.findUnique({ where: { userId: viewer.id } })
    : null;

  const seeking =
    searchParams.seeking === "MAN" || searchParams.seeking === "WOMAN"
      ? searchParams.seeking
      : mine
        ? mine.gender === "MAN"
          ? "WOMAN"
          : "MAN"
        : undefined;
  const year = new Date().getFullYear();
  const minAge = Number(searchParams.minAge);
  const maxAge = Number(searchParams.maxAge);
  const birthYear: Prisma.IntFilter = {};
  if (Number.isInteger(minAge) && minAge >= 18) birthYear.lte = year - minAge;
  if (Number.isInteger(maxAge) && maxAge >= 18) birthYear.gte = year - maxAge;
  const rashi = Number(searchParams.rashi);

  const where: Prisma.RishtaProfileWhereInput = {
    status: "APPROVED",
    visible: true,
    ...(viewer ? { userId: { not: viewer.id } } : {}),
    ...(seeking ? { gender: seeking } : {}),
    ...(Object.keys(birthYear).length ? { birthYear } : {}),
    ...(searchParams.city
      ? { city: { contains: searchParams.city.trim(), mode: "insensitive" } }
      : {}),
    ...(searchParams.religion && RELIGIONS.includes(searchParams.religion)
      ? { religion: searchParams.religion }
      : {}),
    ...(searchParams.community
      ? {
          community: {
            contains: searchParams.community.trim(),
            mode: "insensitive",
          },
        }
      : {}),
    ...(searchParams.rashi &&
    Number.isInteger(rashi) &&
    rashi >= 0 &&
    rashi < 12
      ? { moonSign: rashi }
      : {}),
  };
  const profiles = await db.rishtaProfile.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 60,
  });

  const scored = profiles
    .map((profile) => ({
      profile,
      guna: mine ? (matchBetween(mine, profile)?.total ?? null) : null,
    }))
    .sort((a, b) => (b.guna ?? -1) - (a.guna ?? -1));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-gradient-to-r from-rose-600 to-amber-500 p-6 text-white">
        <h1 className="text-3xl font-black">💍 Rishta</h1>
        <p className="mt-1 max-w-2xl text-rose-50">
          Marriage-minded desi profiles, posted by the person or their parents,
          brother, sister or relatives. Add a rashi and nakshatra to see the
          36-guna kundli match with every profile.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href="/rishta/new" variant="secondary">
            {mine ? "Edit my Rishta profile" : "Post a Rishta profile"}
          </LinkButton>
          <Link
            href="/astrology/kundli-matching-for-marriage"
            className="rounded-xl border border-white/60 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            How guna milan works
          </Link>
        </div>
        <ul className="mt-4 grid gap-1 text-xs text-rose-50 sm:grid-cols-2">
          {SAFETY.map((line) => (
            <li key={line}>✓ {line}</li>
          ))}
        </ul>
      </section>

      {mine?.status === "PENDING" ? (
        <Alert tone="info">
          Your Rishta profile is awaiting review and will appear once approved.
        </Alert>
      ) : null}
      {mine?.status === "REJECTED" ? (
        <Alert>
          Your Rishta profile was not approved. Please edit it and submit again.
        </Alert>
      ) : null}
      {viewer && mine && (mine.moonSign === null || mine.nakshatra === null) ? (
        <Alert tone="info">
          Add your rashi and nakshatra to{" "}
          <Link href="/rishta/new" className="font-semibold underline">
            your profile
          </Link>{" "}
          to see guna scores on every card.
        </Alert>
      ) : null}

      <form className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-3 sm:grid-cols-4 lg:grid-cols-7">
        <select
          name="seeking"
          defaultValue={seeking ?? ""}
          className={inputClass}
        >
          <option value="">Brides & grooms</option>
          <option value="WOMAN">Brides</option>
          <option value="MAN">Grooms</option>
        </select>
        <input
          name="minAge"
          type="number"
          min={18}
          placeholder="Age from"
          defaultValue={searchParams.minAge}
          className={inputClass}
        />
        <input
          name="maxAge"
          type="number"
          min={18}
          placeholder="Age to"
          defaultValue={searchParams.maxAge}
          className={inputClass}
        />
        <input
          name="city"
          placeholder="City"
          defaultValue={searchParams.city}
          className={inputClass}
        />
        <select
          name="religion"
          defaultValue={searchParams.religion ?? ""}
          className={inputClass}
        >
          <option value="">Any religion</option>
          {RELIGIONS.map((religion) => (
            <option key={religion}>{religion}</option>
          ))}
        </select>
        <input
          name="community"
          placeholder="Community"
          defaultValue={searchParams.community}
          className={inputClass}
        />
        <div className="flex gap-2">
          <select
            name="rashi"
            defaultValue={searchParams.rashi ?? ""}
            className={inputClass}
          >
            <option value="">Any rashi</option>
            {RASHIS.map((sign, index) => (
              <option key={sign.name} value={index}>
                {sign.name}
              </option>
            ))}
          </select>
          <button className="rounded-xl bg-rose-600 px-3 text-sm font-bold text-white">
            Go
          </button>
        </div>
      </form>

      {scored.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {scored.map(({ profile, guna }) => (
            <RishtaCard
              key={profile.id}
              profile={profile}
              canSeePhoto={canSeeRishtaPhoto(profile, viewer)}
              guna={guna}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Rishta profiles match yet"
          body="Be among the first — post a profile for yourself or your son or daughter."
          action={
            <LinkButton href="/rishta/new">Post a Rishta profile</LinkButton>
          }
        />
      )}
      <AstrologerList astrologers={astrologers} />
    </div>
  );
}
