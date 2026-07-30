import type { Metadata } from "next";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { whatsappLink } from "@/lib/format";
import {
  GENDER_LABELS,
  INTENT_LABELS,
  MARITAL_LABELS,
  MEETUP_INTENT_GROUPS,
  MEETUP_INTENT_NOTE,
  distanceKm,
  intentLabels,
  nearbyLabel,
} from "@/lib/meetups";
import { InlineBanner } from "@/components/Banners";
import { SafetyResourcesRail } from "@/components/SafetyResourcesRail";
import { PostedBy } from "@/components/PostedBy";
import { NearMe } from "@/components/NearMe";
import { ReportMeetupForm } from "@/components/forms/ReportMeetupForm";
import { GlobalChat } from "@/components/GlobalChat";
import { recentChat } from "@/lib/chat";
import {
  Alert,
  Badge,
  Card,
  EmptyState,
  LinkButton,
  inputClass,
} from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Connect — meet desis near you",
  description:
    "Meet desis in your city for networking, mentorship, cultural meetups, workshops and community groups. Reviewed and moderated; not a dating service.",
};

type Filters = {
  city?: string;
  gender?: string;
  marital?: string;
  intent?: string;
  minAge?: string;
  maxAge?: string;
  lat?: string;
  lng?: string;
};

function ageRange(filters: Filters) {
  const min = Number(filters.minAge);
  const max = Number(filters.maxAge);
  const range: Prisma.IntFilter = {};
  if (Number.isInteger(min) && min >= 18) range.gte = min;
  if (Number.isInteger(max) && max >= 18) range.lte = max;
  return Object.keys(range).length ? range : undefined;
}

export default async function ConnectPage({
  searchParams,
}: {
  searchParams: Filters;
}) {
  const user = await getCurrentUser();
  const chat = await recentChat(user?.id ?? null);

  const where: Prisma.MeetupProfileWhereInput = {
    status: "APPROVED",
    visible: true,
    ...(searchParams.city
      ? { city: { contains: searchParams.city, mode: "insensitive" } }
      : {}),
    ...(searchParams.gender === "WOMAN" ||
    searchParams.gender === "MAN" ||
    searchParams.gender === "OTHER"
      ? { gender: searchParams.gender }
      : {}),
    ...(searchParams.marital === "SINGLE" ||
    searchParams.marital === "MARRIED" ||
    searchParams.marital === "PREFER_NOT_SAY"
      ? { marital: searchParams.marital }
      : {}),
    ...(searchParams.intent && searchParams.intent in INTENT_LABELS
      ? { intents: { contains: searchParams.intent } }
      : {}),
  };
  const age = ageRange(searchParams);
  if (age) where.age = age;

  const here = (() => {
    const latitude = Number(searchParams.lat);
    const longitude = Number(searchParams.lng);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
    return { latitude, longitude };
  })();
  if (here) where.latitude = { not: null };

  const [found, mine] = await Promise.all([
    db.meetupProfile.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: here ? 200 : 60,
      include: {
        user: { select: { name: true, username: true, avatarUrl: true } },
      },
    }),
    user
      ? db.meetupProfile.findUnique({ where: { userId: user.id } })
      : Promise.resolve(null),
  ]);

  const withDistance = found.map((profile) => ({
    profile,
    km:
      here && profile.latitude !== null && profile.longitude !== null
        ? distanceKm(here, {
            latitude: profile.latitude,
            longitude: profile.longitude,
          })
        : null,
  }));
  const profiles = here
    ? withDistance
        .filter((row) => row.km !== null)
        .sort((a, b) => (a.km ?? 0) - (b.km ?? 0))
        .slice(0, 60)
    : withDistance;

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <section className="rounded-3xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 px-5 py-8 text-white sm:px-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-white/80">
            Connect
          </p>
          <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
            Meet desis near you 🤝
          </h1>
          <p className="mt-3 max-w-2xl text-white/90">
            Networking, mentorship, cultural meetups, workshops and local community
            groups — students, professionals and families all welcome. {MEETUP_INTENT_NOTE}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <LinkButton href="/connect/new" variant="secondary">
              {mine ? "Edit my Connect profile" : "Create my Connect profile"}
            </LinkButton>
          </div>
        </section>

        {mine && mine.status === "PENDING" ? (
          <Alert tone="info">
            Your Connect profile is awaiting review — it will appear here once approved.
          </Alert>
        ) : null}
        {mine && mine.status === "REJECTED" ? (
          <Alert>
            Your Connect profile was not approved. Please edit it to follow the
            community rules and submit again.
          </Alert>
        ) : null}

        <Card>
          <form className="grid gap-3 sm:grid-cols-3">
            <input
              name="city"
              defaultValue={searchParams.city ?? ""}
              placeholder="City"
              aria-label="City"
              className={inputClass}
            />
            <select
              name="intent"
              defaultValue={searchParams.intent ?? ""}
              aria-label="Open to"
              className={inputClass}
            >
              <option value="">Any interest</option>
              {MEETUP_INTENT_GROUPS.map((group) => (
                <optgroup key={group.id} label={group.label}>
                  {group.intents.map((intent) => (
                    <option key={intent.id} value={intent.id}>
                      {intent.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <select
              name="gender"
              defaultValue={searchParams.gender ?? ""}
              aria-label="Gender"
              className={inputClass}
            >
              <option value="">Anyone</option>
              {Object.entries(GENDER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              name="marital"
              defaultValue={searchParams.marital ?? ""}
              aria-label="Marital status"
              className={inputClass}
            >
              <option value="">Any status</option>
              {Object.entries(MARITAL_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="minAge"
                type="number"
                min={18}
                defaultValue={searchParams.minAge ?? ""}
                placeholder="Age from"
                aria-label="Minimum age"
                className={inputClass}
              />
              <input
                name="maxAge"
                type="number"
                min={18}
                defaultValue={searchParams.maxAge ?? ""}
                placeholder="to"
                aria-label="Maximum age"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Filter
            </button>
          </form>
        </Card>

        <NearMe
          canShare={Boolean(mine)}
          sharing={Boolean(mine?.latitude && mine?.longitude)}
        />

        {here ? (
          <Alert tone="info">
            Showing members closest to you first — distances are approximate.{" "}
            <Link href="/connect" className="font-semibold underline">
              Clear
            </Link>
          </Alert>
        ) : null}

        {profiles.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {profiles.map(({ profile, km }) => (
              <Card key={profile.id} className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {profile.displayName}
                      {profile.age ? `, ${profile.age}` : ""}
                    </p>
                    <p className="text-sm text-slate-500">
                      {profile.city}
                      {profile.state ? `, ${profile.state}` : ""} ·{" "}
                      {GENDER_LABELS[profile.gender]} ·{" "}
                      {MARITAL_LABELS[profile.marital]}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {km !== null ? (
                    <Badge tone="green">📍 {nearbyLabel(km)}</Badge>
                  ) : null}
                  {profile.visiting ? (
                    <Badge tone="indigo">✈️ Visiting / new here</Badge>
                  ) : null}
                  {intentLabels(profile.intents).map((label) => (
                    <Badge key={label} tone="slate">
                      {label}
                    </Badge>
                  ))}
                </div>

                <p className="whitespace-pre-line break-words text-sm text-slate-700">
                  {profile.bio}
                </p>
                <PostedBy user={profile.user} />

                <div className="mt-auto space-y-2 pt-2">
                  {user ? (
                    profile.whatsappNumber ? (
                      <a
                        href={whatsappLink(
                          profile.whatsappNumber,
                          `Hi ${profile.displayName}, I found you on Godesi Connect.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                      >
                        Say hello on WhatsApp
                      </a>
                    ) : (
                      <p className="text-xs text-slate-500">
                        No WhatsApp shared — reach out via their profile.
                      </p>
                    )
                  ) : (
                    <LinkButton
                      href={`/login?next=${encodeURIComponent("/connect")}`}
                      className="w-full"
                    >
                      Sign in to contact
                    </LinkButton>
                  )}
                  {user && user.id !== profile.userId ? (
                    <ReportMeetupForm profileId={profile.id} />
                  ) : null}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Connect profiles match your filters yet"
            body="Be the first in your city — create your profile and others will find you."
            action={<LinkButton href="/connect/new">Create my profile</LinkButton>}
          />
        )}

        <Card>
          <h2 className="text-lg font-bold">House rules</h2>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            <li>• 18+ only, and every profile is reviewed before it appears.</li>
            <li>
              • Networking, community and activities only. Dating and adult content are
              not allowed and such wording is blocked automatically.
            </li>
            <li>• Meet in public places and never send money to anyone.</li>
            <li>
              • Report anything uncomfortable — we review every report and remove
              offenders. Questions?{" "}
              <Link href="/contact" className="font-semibold text-indigo-600">
                Contact us
              </Link>
              .
            </li>
          </ul>
        </Card>

        {/* Same moderated room as the live page, so meet-ups can be arranged here. */}
        <GlobalChat initial={chat} signedIn={user !== null} />

        <InlineBanner />
      </div>

      <SafetyResourcesRail />
    </div>
  );
}
