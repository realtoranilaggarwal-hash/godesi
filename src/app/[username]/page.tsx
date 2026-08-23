import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  normalizeUsername,
  publicProfile,
  RESERVED_USERNAMES,
} from "@/lib/profiles";
import { effectivePlan } from "@/lib/plans";
import { formatEventDate } from "@/lib/events";
import { siteUrl, whatsappLink } from "@/lib/format";
import { ShareButtons } from "@/components/ShareButtons";
import { Badge, Card, EmptyState, Stars } from "@/components/ui";
import { VideoEmbed } from "@/components/VideoEmbed";
import { PERSONAL_SOCIALS } from "@/lib/personalProfile";
import { JournalistBadge } from "@/components/JournalistBadge";
import { PressCard } from "@/components/PressCard";
import { FoundingBadge } from "@/components/FoundingBadge";
import { journalistStats } from "@/lib/journalistsQueries";
import { alumniFor } from "@/lib/alumniQueries";
import { wallet } from "@/lib/rewardsQueries";
import { ContributionScore } from "@/components/ContributionScore";

export const dynamic = "force-dynamic";

async function load(usernameParam: string) {
  const username = normalizeUsername(decodeURIComponent(usernameParam));
  if (RESERVED_USERNAMES.has(username)) return null;
  return publicProfile(username);
}

export async function generateMetadata({
  params,
}: {
  params: { username: string };
}): Promise<Metadata> {
  const profile = await load(params.username);
  if (!profile) return { title: "Profile not found" };
  const { user } = profile;
  return {
    title: `${user.name} on Godesi`,
    description:
      user.bio ??
      `${user.name}${user.location ? ` from ${user.location}` : ""} on Godesi — businesses, events and requirements.`,
    alternates: { canonical: `/${user.username}` },
  };
}

export default async function PublicProfilePage({
  params,
}: {
  params: { username: string };
}) {
  const profile = await load(params.username);
  if (!profile) notFound();

  const { user, events, leads, reviews, listings } = profile;
  const journalist = await journalistStats(user.id);
  const points = await wallet(user.id);
  const plan = effectivePlan(user);
  const shareUrl = `${siteUrl()}/${user.username}`;
  const activity =
    events.length + leads.length + reviews.length + listings.length;
  const socialLinks = PERSONAL_SOCIALS.map((social) => ({
    ...social,
    url: user[social.key],
  })).filter((social): social is typeof social & { url: string } =>
    Boolean(social.url),
  );
  const lines = (value: string | null) =>
    (value ?? "")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  const education = lines(user.education);
  const schools = await alumniFor(user.id);
  const experience = lines(user.experience);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card className="overflow-hidden !p-0">
        <div className="h-2 bg-gradient-to-r from-orange-400 via-rose-500 to-fuchsia-600" />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-20 w-20 shrink-0 rounded-full border-4 border-white object-cover shadow sm:h-24 sm:w-24"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-3xl font-black text-white shadow sm:h-24 sm:w-24">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-slate-900">
                {user.name}
              </h1>
              {user.headline ? (
                <p className="text-sm font-semibold text-slate-700">
                  {user.headline}
                </p>
              ) : null}
              <p className="text-sm text-slate-500">@{user.username}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {user.openToWork ? (
                  <Badge tone="green">✅ Open to work / projects</Badge>
                ) : null}
                {user.location ? <Badge>📍 {user.location}</Badge> : null}
                <FoundingBadge number={user.foundingNumber} />
                {journalist?.level ? (
                  <JournalistBadge
                    level={journalist.level}
                    beat={journalist.beat}
                  />
                ) : null}
                {plan !== "FREE" ? (
                  <Badge tone="indigo">{plan} member</Badge>
                ) : null}
                <Badge tone="green">
                  Member since {user.createdAt.getFullYear()}
                </Badge>
              </div>
              <div className="mt-3 max-w-sm">
                <ContributionScore earned={points.earned} plan={plan} />
              </div>
            </div>
          </div>
          <ShareButtons url={shareUrl} title={`${user.name} on Godesi`} />
        </div>
        {user.bio ? (
          <p className="border-t border-slate-100 px-5 py-4 text-sm text-slate-700">
            {user.bio}
          </p>
        ) : null}

        {socialLinks.length || user.whatsappNumber ? (
          <div className="flex flex-wrap gap-2 border-t border-slate-100 px-5 py-4">
            {user.whatsappNumber ? (
              <a
                href={whatsappLink(
                  user.whatsappNumber,
                  `Hi ${user.name}, I found you on Godesi.`,
                )}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-xl bg-[#25D366] px-3 py-2 text-sm font-semibold text-white hover:brightness-95"
              >
                <span aria-hidden>💬</span> WhatsApp
              </a>
            ) : null}
            {socialLinks.map((social) => (
              <a
                key={social.key}
                href={social.url}
                target="_blank"
                rel="noreferrer nofollow"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <span aria-hidden>{social.icon}</span> {social.label}
              </a>
            ))}
          </div>
        ) : null}
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {user.lookingFor ? (
            <Card className="bg-gradient-to-r from-amber-50 to-rose-50">
              <h2 className="text-lg font-bold">What I am looking for</h2>
              <p className="mt-1 whitespace-pre-line text-sm text-slate-700">
                {user.lookingFor}
              </p>
            </Card>
          ) : null}

          {journalist?.joined ? (
            <Card>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-bold">Local journalist 🗞️</h2>
                <JournalistBadge
                  level={journalist.level}
                  beat={journalist.beat}
                />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  { label: "Trust score", value: `${journalist.trust.score}` },
                  { label: "Stories", value: `${journalist.approved}` },
                  {
                    label: "Level",
                    value: journalist.level?.title ?? "Contributor",
                  },
                  {
                    label: "Confirmed",
                    value: `${journalist.trust.confirmed}`,
                  },
                ].map((cell) => (
                  <div
                    key={cell.label}
                    className="rounded-2xl bg-slate-50 px-3 py-2"
                  >
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      {cell.label}
                    </dt>
                    <dd className="truncate text-base font-black text-slate-800">
                      {cell.value}
                    </dd>
                  </div>
                ))}
              </dl>
              {journalist.beat ? (
                <p className="mt-2 text-sm text-slate-600">
                  Coverage area: <strong>{journalist.beat}</strong>
                </p>
              ) : null}
              {journalist.pressCard && !journalist.pressCard.expired ? (
                <div className="mt-3 max-w-md">
                  <PressCard card={journalist.pressCard} />
                </div>
              ) : null}
            </Card>
          ) : null}

          {user.videoUrls.length ? (
            <section className="space-y-3">
              <h2 className="text-lg font-bold">Videos</h2>
              {user.videoUrls.map((url) => (
                <VideoEmbed key={url} url={url} title={`${user.name} video`} />
              ))}
            </section>
          ) : null}

          {experience.length ? (
            <Card>
              <h2 className="text-lg font-bold">Work & achievements</h2>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {experience.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-indigo-500">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {schools.length ? (
            <Card>
              <h2 className="text-lg font-bold">School &amp; college</h2>
              <ul className="mt-2 space-y-2 text-sm text-slate-700">
                {schools.map((school) => (
                  <li
                    key={school.id}
                    className="flex flex-wrap items-center gap-2"
                  >
                    <span className="text-indigo-500">🎓</span>
                    <Link
                      href={`/alumni?institution=${encodeURIComponent(school.institution)}${school.endYear ? `&year=${school.endYear}` : ""}`}
                      className="font-semibold text-indigo-700 underline"
                    >
                      {school.institution}
                    </Link>
                    {school.degree ? <span>· {school.degree}</span> : null}
                    {school.fieldOfStudy ? (
                      <span>· {school.fieldOfStudy}</span>
                    ) : null}
                    {school.endYear ? (
                      <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                        Batch of {school.endYear}
                      </span>
                    ) : school.current ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        Studying now
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-500">
                Looking for batchmates?{" "}
                <Link
                  href={`/alumni?institution=${encodeURIComponent(schools[0].institution)}`}
                  className="font-semibold underline"
                >
                  Find everyone from {schools[0].institution}
                </Link>
              </p>
            </Card>
          ) : null}

          {education.length ? (
            <Card>
              <h2 className="text-lg font-bold">Other education</h2>
              <ul className="mt-2 space-y-1 text-sm text-slate-700">
                {education.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-indigo-500">🎓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {listings.length ? (
            <section className="space-y-2">
              <h2 className="text-lg font-bold">Listings</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {listings.map((listing) => (
                  <Link
                    key={listing.slug}
                    href={`/listings/${listing.slug}`}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <p className="font-bold text-slate-900">{listing.title}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      📍 {listing.city}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
          {user.business && user.business.status === "APPROVED" ? (
            <section className="space-y-2">
              <h2 className="text-lg font-bold">Business</h2>
              <Link
                href={`/b/${user.business.slug}`}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                {user.business.logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.business.logoUrl}
                    alt={user.business.name}
                    className="h-12 w-12 rounded-xl border border-slate-200 object-cover"
                  />
                ) : (
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-xl">
                    🏪
                  </span>
                )}
                <span>
                  <span className="block font-bold text-slate-900">
                    {user.business.name}
                  </span>
                  <span className="block text-sm text-slate-600">
                    {user.business.category} · {user.business.city}
                  </span>
                </span>
              </Link>
            </section>
          ) : null}

          {events.length ? (
            <section className="space-y-2">
              <h2 className="text-lg font-bold">Events</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {events.map((event) => (
                  <Link
                    key={event.slug}
                    href={`/events/${event.slug}`}
                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <p className="font-bold text-slate-900">{event.title}</p>
                    <p className="mt-1 text-sm text-slate-600">
                      📅 {formatEventDate(event.startsAt, event.timeZone)}
                    </p>
                    <p className="text-sm text-slate-600">📍 {event.city}</p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {leads.length ? (
            <section className="space-y-2">
              <h2 className="text-lg font-bold">Open requirements</h2>
              <div className="space-y-2">
                {leads.map((lead) => (
                  <Link
                    key={lead.id}
                    href={`/leads/${lead.id}`}
                    className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                  >
                    <p className="font-semibold text-slate-900">{lead.title}</p>
                    <p className="text-sm text-slate-600">
                      {lead.category} · {lead.city}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {reviews.length ? (
            <section className="space-y-2">
              <h2 className="text-lg font-bold">Reviews written</h2>
              <div className="space-y-2">
                {reviews.map((review) => (
                  <Card key={review.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Stars rating={review.rating} />
                      <Link
                        href={`/b/${review.business.slug}`}
                        className="text-sm font-semibold text-indigo-700 hover:underline"
                      >
                        {review.business.name}
                      </Link>
                    </div>
                    {review.comment ? (
                      <p className="text-sm text-slate-700">{review.comment}</p>
                    ) : null}
                  </Card>
                ))}
              </div>
            </section>
          ) : null}

          {!activity && !user.business ? (
            <EmptyState
              title="Nothing posted yet"
              body={`${user.name} has not published a business, event or requirement so far.`}
            />
          ) : null}
        </div>

        <aside className="space-y-4">
          {user.skills.length || user.languages.length ? (
            <Card className="space-y-3">
              {user.skills.length ? (
                <div>
                  <p className="text-sm font-bold text-slate-900">
                    Skills & interests
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {user.skills.map((skill) => (
                      <Badge key={skill} tone="indigo">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
              {user.languages.length ? (
                <div>
                  <p className="text-sm font-bold text-slate-900">Languages</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {user.languages.map((language) => (
                      <Badge key={language}>{language}</Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </Card>
          ) : null}
          <Card className="space-y-3 text-center">
            <p className="text-sm font-bold text-slate-900">Personal QR code</p>
            <Image
              src={`/api/qr/u/${user.username}`}
              alt={`QR code for ${user.name}`}
              width={200}
              height={200}
              unoptimized
              className="mx-auto rounded-xl border border-slate-200"
            />
            <a
              href={`/api/qr/u/${user.username}?download=1`}
              className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Download QR
            </a>
          </Card>

          {user.business && user.business.status === "APPROVED" ? (
            <Card className="space-y-3 text-center">
              <p className="text-sm font-bold text-slate-900">
                Business QR code
              </p>
              <Image
                src={`/api/qr/${user.business.slug}`}
                alt={`QR code for ${user.business.name}`}
                width={200}
                height={200}
                unoptimized
                className="mx-auto rounded-xl border border-slate-200"
              />
              <a
                href={`/api/qr/${user.business.slug}?download=1`}
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Download business QR
              </a>
            </Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
