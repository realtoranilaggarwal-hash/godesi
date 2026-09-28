import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { clubPlace } from "@/components/ClubCard";
import { EventCard } from "@/components/EventCard";
import { PlaylistGallery } from "@/components/PlaylistGallery";
import { ShareButtons } from "@/components/ShareButtons";
import { siteUrl } from "@/lib/format";
import { Badge, Card, LinkButton, inputClass } from "@/components/ui";
import { clubCategory } from "@/lib/clubs";
import {
  joinClubAction,
  leaveClubAction,
  moderateMemberAction,
} from "@/app/actions/clubs";
import { thumbImage } from "@/lib/proxyImage";
import { properName } from "@/lib/names";

export const dynamic = "force-dynamic";

async function loadClub(slug: string) {
  return db.club.findUnique({
    where: { slug },
    include: {
      members: {
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              headline: true,
              emailVerifiedAt: true,
              bannedAt: true,
            },
          },
        },
      },
      events: {
        where: { status: "APPROVED" },
        orderBy: { startsAt: "asc" },
        include: {
          category: { select: { name: true, icon: true, color: true } },
        },
      },
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const club = await db.club.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true, city: true, imageUrl: true },
  });
  if (!club) return { title: "Club not found" };
  const title = `${club.name}${club.city ? ` — ${club.city}` : ""} | GoDesi Clubs`;
  return {
    title,
    description: club.description.slice(0, 160),
    alternates: { canonical: `/clubs/${params.slug}` },
    openGraph: {
      title,
      description: club.description.slice(0, 160),
      images: club.imageUrl ? [club.imageUrl] : undefined,
    },
  };
}

function Avatar({
  user,
  size = "h-10 w-10",
}: {
  user: { name: string; avatarUrl: string | null };
  size?: string;
}) {
  return (
    <span
      className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-400 to-fuchsia-500 text-sm font-black text-white`}
    >
      {user.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumbImage(user.avatarUrl, 384)}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        user.name.trim()[0]?.toUpperCase() || "🙂"
      )}
    </span>
  );
}

export default async function ClubPage({
  params,
}: {
  params: { slug: string };
}) {
  const [club, viewer] = await Promise.all([
    loadClub(params.slug),
    getCurrentUser(),
  ]);
  if (!club) notFound();

  const cat = clubCategory(club.category);
  const me = viewer
    ? (club.members.find((m) => m.userId === viewer.id) ?? null)
    : null;
  const isOrganizer = me?.role === "ORGANIZER" && me.status === "ACTIVE";
  const isMember = me?.status === "ACTIVE";
  const active = club.members.filter((m) => m.status === "ACTIVE");
  const pending = club.members.filter((m) => m.status === "PENDING");
  const organizers = active.filter((m) => m.role === "ORGANIZER");
  const now = Date.now();
  const upcoming = club.events.filter((e) => e.startsAt.getTime() >= now);
  const past = club.events
    .filter((e) => e.startsAt.getTime() < now)
    .reverse()
    .slice(0, 6);
  // Private clubs show their people to members only.
  const showMembers = club.visibility === "PUBLIC" || isMember;
  const profileHref = (u: {
    username: string | null;
    emailVerifiedAt: Date | null;
    bannedAt: Date | null;
  }) =>
    u.username && u.emailVerifiedAt && !u.bannedAt ? `/${u.username}` : null;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-4xl">
            {club.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbImage(club.imageUrl, 384)}
                alt={club.name}
                className="h-full w-full object-cover"
              />
            ) : (
              cat.emoji
            )}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900">
                {club.name}
              </h1>
              <Badge tone={club.visibility === "PUBLIC" ? "green" : "slate"}>
                {club.visibility === "PUBLIC"
                  ? "Public club"
                  : "🔒 Private club"}
              </Badge>
              {isOrganizer ? (
                <Badge tone="indigo">You organise this</Badge>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {cat.emoji} {cat.label}
              {clubPlace(club) ? ` · ${clubPlace(club)}` : ""} ·{" "}
              <strong>{active.length}</strong> member
              {active.length === 1 ? "" : "s"}
              {organizers.length ? (
                <>
                  {" "}
                  · Organiser{organizers.length > 1 ? "s" : ""}:{" "}
                  {organizers.map((m, i) => {
                    const href = profileHref(m.user);
                    const name = properName(m.user.name);
                    return (
                      <span key={m.id}>
                        {i ? ", " : ""}
                        {href ? (
                          <Link
                            href={href}
                            className="font-semibold text-indigo-700"
                          >
                            {name}
                          </Link>
                        ) : (
                          <span className="font-semibold">{name}</span>
                        )}
                      </span>
                    );
                  })}
                </>
              ) : null}
            </p>
            {upcoming[0] ? (
              <p className="mt-1 text-sm font-semibold text-indigo-700">
                Next event:{" "}
                <Link
                  href={`/events/${upcoming[0].slug}`}
                  className="underline"
                >
                  {upcoming[0].title}
                </Link>
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center gap-2">
              {!viewer ? (
                <LinkButton href={`/login?next=/clubs/${club.slug}`}>
                  {club.visibility === "PUBLIC"
                    ? "Join this club"
                    : "Request to join"}
                </LinkButton>
              ) : me?.status === "PENDING" ? (
                <Badge tone="amber">
                  Request sent — waiting for an organiser
                </Badge>
              ) : isMember ? (
                <>
                  <Badge tone="green">✓ You&rsquo;re a member</Badge>
                  {club.whatsappUrl ? (
                    <LinkButton href={club.whatsappUrl} variant="whatsapp">
                      WhatsApp group
                    </LinkButton>
                  ) : null}
                  {isOrganizer ? (
                    <>
                      <LinkButton href={`/events/new?club=${club.slug}`}>
                        Post an event
                      </LinkButton>
                      <LinkButton
                        href={`/clubs/${club.slug}/edit`}
                        variant="secondary"
                      >
                        Edit club
                      </LinkButton>
                    </>
                  ) : null}
                  {!(isOrganizer && organizers.length <= 1) ? (
                    <form action={leaveClubAction}>
                      <input type="hidden" name="clubId" value={club.id} />
                      <button className="text-xs text-slate-500 underline">
                        Leave club
                      </button>
                    </form>
                  ) : null}
                </>
              ) : (
                <form
                  action={joinClubAction}
                  className="flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="clubId" value={club.id} />
                  {club.visibility === "PRIVATE" ? (
                    <input
                      name="note"
                      maxLength={200}
                      placeholder="A line for the organiser — how you heard of the club, what you sing…"
                      className={`${inputClass} !w-72`}
                    />
                  ) : null}
                  <button className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">
                    {club.visibility === "PUBLIC"
                      ? "Join this club"
                      : "Request to join"}
                  </button>
                </form>
              )}
              {club.websiteUrl ? (
                <a
                  href={club.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-indigo-600"
                >
                  Website ↗
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <Card>
            <h2 className="font-bold text-slate-900">About</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
              {club.description}
            </p>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900">Upcoming events</h2>
              {isOrganizer ? (
                <Link
                  href={`/events/new?club=${club.slug}`}
                  className="text-sm font-semibold text-indigo-600"
                >
                  + Post an event
                </Link>
              ) : null}
            </div>
            {upcoming.length ? (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} variant="compact" />
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Nothing scheduled yet
                {isOrganizer
                  ? " — post the next meet and members can RSVP."
                  : ". Join to hear when the next one is announced."}
              </p>
            )}
          </Card>

          {past.length ? (
            <Card>
              <h2 className="font-bold text-slate-900">Past events</h2>
              <ul className="mt-2 divide-y divide-slate-100 text-sm">
                {past.map((event) => (
                  <li
                    key={event.id}
                    className="flex justify-between gap-3 py-2"
                  >
                    <Link
                      href={`/events/${event.slug}`}
                      className="font-medium text-slate-800 hover:text-indigo-700"
                    >
                      {event.title}
                    </Link>
                    <span className="shrink-0 text-slate-500">
                      {event.startsAt.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {club.playlistUrl ? (
            <PlaylistGallery
              url={club.playlistUrl}
              owner={club.name}
              heading="Club playlist"
            />
          ) : null}

          {club.rules ? (
            <Card>
              <h2 className="font-bold text-slate-900">Club rules</h2>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                {club.rules}
              </p>
            </Card>
          ) : null}
        </div>

        <div className="space-y-6">
          {isOrganizer && pending.length ? (
            <Card className="!border-amber-200 bg-amber-50/40">
              <h2 className="font-bold text-slate-900">
                Requests to join ({pending.length})
              </h2>
              <ul className="mt-2 space-y-3">
                {pending.map((m) => (
                  <li key={m.id} className="text-sm">
                    <div className="flex items-center gap-2">
                      <Avatar user={m.user} size="h-8 w-8" />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold">
                          {properName(m.user.name)}
                        </span>
                        {m.note ? (
                          <span className="block truncate text-xs text-slate-500">
                            “{m.note}”
                          </span>
                        ) : null}
                      </span>
                    </div>
                    <div className="mt-1 flex gap-2 pl-10">
                      <form action={moderateMemberAction}>
                        <input type="hidden" name="memberId" value={m.id} />
                        <input type="hidden" name="action" value="approve" />
                        <button className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white">
                          Approve
                        </button>
                      </form>
                      <form action={moderateMemberAction}>
                        <input type="hidden" name="memberId" value={m.id} />
                        <input type="hidden" name="action" value="decline" />
                        <button className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          Decline
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          <Card>
            <h2 className="font-bold text-slate-900">
              Members ({active.length})
            </h2>
            {showMembers ? (
              <ul className="mt-2 space-y-2">
                {active.map((m) => {
                  const href = profileHref(m.user);
                  const name = properName(m.user.name);
                  return (
                    <li key={m.id} className="flex items-center gap-2 text-sm">
                      <Avatar user={m.user} size="h-8 w-8" />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5">
                          {href ? (
                            <Link
                              href={href}
                              className="truncate font-semibold text-slate-900 hover:text-indigo-700"
                            >
                              {name}
                            </Link>
                          ) : (
                            <span className="truncate font-semibold">
                              {name}
                            </span>
                          )}
                          {m.role === "ORGANIZER" ? (
                            <Badge tone="indigo">Organiser</Badge>
                          ) : null}
                        </span>
                        {m.note || m.user.headline ? (
                          <span className="block truncate text-xs text-slate-500">
                            {m.note ?? m.user.headline}
                          </span>
                        ) : null}
                      </span>
                      {isOrganizer && m.userId !== viewer?.id ? (
                        <span className="flex shrink-0 gap-1">
                          <form action={moderateMemberAction}>
                            <input type="hidden" name="memberId" value={m.id} />
                            <input
                              type="hidden"
                              name="action"
                              value={
                                m.role === "ORGANIZER" ? "demote" : "promote"
                              }
                            />
                            <button
                              className="text-xs text-indigo-600 hover:underline"
                              title={
                                m.role === "ORGANIZER"
                                  ? "Make a regular member"
                                  : "Make an organiser"
                              }
                            >
                              {m.role === "ORGANIZER" ? "Demote" : "Promote"}
                            </button>
                          </form>
                          <form action={moderateMemberAction}>
                            <input type="hidden" name="memberId" value={m.id} />
                            <input type="hidden" name="action" value="remove" />
                            <button className="text-xs text-rose-600 hover:underline">
                              Remove
                            </button>
                          </form>
                        </span>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Members are shown to members of this private club.
              </p>
            )}
          </Card>

          <Card>
            <h2 className="font-bold text-slate-900">Invite friends</h2>
            <p className="mt-1 text-xs text-slate-500">
              Share the club page — they join in one tap.
            </p>
            <ShareButtons
              url={`${siteUrl()}/clubs/${club.slug}`}
              title={`${club.name} on GoDesi Clubs`}
              className="mt-2"
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
