import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { normalizeUsername, publicProfile, RESERVED_USERNAMES } from "@/lib/profiles";
import { effectivePlan } from "@/lib/plans";
import { formatEventDate } from "@/lib/events";
import { siteUrl } from "@/lib/format";
import { ShareButtons } from "@/components/ShareButtons";
import { Badge, Card, EmptyState, Stars } from "@/components/ui";

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

  const { user, events, leads, reviews } = profile;
  const plan = effectivePlan(user);
  const shareUrl = `${siteUrl()}/${user.username}`;
  const activity = events.length + leads.length + reviews.length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Card className="overflow-hidden !p-0">
        <div className="h-24 bg-gradient-to-r from-orange-400 via-rose-500 to-fuchsia-600" />
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            {user.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="-mt-16 h-24 w-24 rounded-full border-4 border-white object-cover shadow"
              />
            ) : (
              <div className="-mt-16 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-indigo-500 to-fuchsia-600 text-3xl font-black text-white shadow">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
              <p className="text-sm text-slate-500">@{user.username}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {user.location ? <Badge>📍 {user.location}</Badge> : null}
                {plan !== "FREE" ? <Badge tone="indigo">{plan} member</Badge> : null}
                <Badge tone="green">
                  Member since {user.createdAt.getFullYear()}
                </Badge>
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
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
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
                      📅 {formatEventDate(event.startsAt)}
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
              <p className="text-sm font-bold text-slate-900">Business QR code</p>
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
