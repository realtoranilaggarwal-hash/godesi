import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { siteUrl, whatsappLink } from "@/lib/format";
import {
  CONVERSATION_STARTERS,
  interestLabel,
  nearbyLabel,
  parseIntents,
} from "@/lib/meetups";
import { circleClubs, circleEvents, circleMatches } from "@/lib/connectCircle";
import {
  deleteMeetupProfileAction,
  toggleMeetupVisibilityAction,
} from "@/app/actions/meetups";
import { MeetupProfileForm } from "@/components/forms/MeetupProfileForm";
import { SafetyResourcesRail } from "@/components/SafetyResourcesRail";
import { ClubCard } from "@/components/ClubCard";
import { EventCard } from "@/components/EventCard";
import { PostedBy } from "@/components/PostedBy";
import { ShareButtons } from "@/components/ShareButtons";
import { Badge, Card, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Find your Desi Circle — meet desis near you | GoDesi Connect",
  description:
    "Meet friends, professionals, families, travellers and activity partners near you. Pick what you enjoy and GoDesi suggests people, clubs and events that match. Every profile is reviewed.",
  alternates: { canonical: "/connect/new" },
};

const PROMISES = [
  {
    title: "Who you can meet",
    text: "New friends, professionals, families with kids, travellers and people who enjoy what you enjoy.",
  },
  {
    title: "What you can do",
    text: "Join clubs, go to events, find a cricket, karaoke or hiking group, or just grab chai.",
  },
  {
    title: "Why join",
    text: "Pick your interests once and we suggest people, clubs and events near you that match.",
  },
];

const SAFETY = [
  "Every profile is reviewed before it appears",
  "Your exact location is never shown",
  "Hide or delete your profile anytime",
  "Report anyone in one tap",
  "No dating or adult content",
];

function Hero({ cta }: { cta: { href: string; label: string } }) {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-fuchsia-700 to-orange-500 p-6 text-white shadow-lg sm:p-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">
        Your people. Your community.
      </p>
      <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">
        Your Desi Circle starts here
      </h1>
      <p className="mt-3 max-w-2xl text-white/90">
        Meet friends, professionals, families, travellers and activity partners
        near you. Join clubs, find events and build real connections.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <Link
          href={cta.href}
          className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-indigo-700 shadow hover:bg-indigo-50"
        >
          {cta.label}
        </Link>
        <Link
          href="/connect"
          className="rounded-xl border border-white/60 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10"
        >
          Browse members
        </Link>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {PROMISES.map((item) => (
          <div key={item.title} className="rounded-2xl bg-white/10 p-4">
            <p className="font-bold">{item.title}</p>
            <p className="mt-1 text-sm text-white/85">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SafetyStrip() {
  return (
    <ul className="flex flex-wrap gap-2 text-xs text-slate-600">
      {SAFETY.map((line) => (
        <li
          key={line}
          className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800"
        >
          🛡️ {line}
        </li>
      ))}
    </ul>
  );
}

export default async function ConnectProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Hero
          cta={{
            href: "/signup?next=/connect/new",
            label: "Find my Desi Circle",
          }}
        />
        <SafetyStrip />
        <Card className="text-sm text-slate-600">
          Already a member?{" "}
          <Link
            href="/login?next=/connect/new"
            className="font-semibold text-indigo-700"
          >
            Log in
          </Link>{" "}
          to pick what you&rsquo;re looking for and see who matches.
        </Card>
      </div>
    );
  }

  const profile = await db.meetupProfile.findUnique({
    where: { userId: user.id },
  });
  const [matches, clubs, events] = profile
    ? await Promise.all([
        circleMatches(profile),
        circleClubs(profile),
        circleEvents(profile.city),
      ])
    : [[], [], []];
  const inviteLink = user.username
    ? `${siteUrl()}/ref/${user.username}`
    : `${siteUrl()}/connect/new`;

  return (
    <div className="flex justify-center gap-6">
      <div className="min-w-0 max-w-4xl flex-1 space-y-6">
        <Hero
          cta={
            profile
              ? { href: "#my-profile", label: "Update my preferences" }
              : { href: "#my-profile", label: "Find my Desi Circle" }
          }
        />
        <SafetyStrip />

        {profile ? (
          <section className="space-y-3">
            <div>
              <h2 className="text-xl font-bold">People you may click with</h2>
              <p className="text-sm text-slate-600">
                Matched on what you enjoy, what you&rsquo;re looking for and
                where you are.
              </p>
            </div>
            {matches.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {matches.map(({ profile: match, km, reason }) => (
                  <Card key={match.id} className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold">{match.displayName}</p>
                        <p className="text-xs text-slate-500">
                          {match.city}
                          {km !== null ? ` · ${nearbyLabel(km)}` : ""}
                          {match.visiting ? " · visiting / new here" : ""}
                        </p>
                      </div>
                    </div>
                    {reason ? (
                      <p className="text-sm font-medium text-indigo-700">
                        {reason}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap gap-1">
                      {match.interests.slice(0, 4).map((slug) => (
                        <Badge key={slug} tone="indigo">
                          {interestLabel(slug)}
                        </Badge>
                      ))}
                    </div>
                    <p className="line-clamp-2 text-sm text-slate-600">
                      {match.bio}
                    </p>
                    <PostedBy user={match.user} prefix="Member" />
                    <div className="mt-auto space-y-1 pt-1">
                      <p className="text-xs text-slate-500">
                        Ask: {CONVERSATION_STARTERS.join(" · ")}
                      </p>
                      {match.whatsappNumber ? (
                        <a
                          href={whatsappLink(
                            match.whatsappNumber,
                            `Hi ${match.displayName}, I found you on GoDesi Connect. ${reason.replace(/^You are both/, "We are both").replace(/^You both/, "We both")} ${CONVERSATION_STARTERS[0]}`,
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-xl bg-emerald-600 px-4 py-2 text-center text-sm font-semibold text-white hover:bg-emerald-700"
                        >
                          Say hello on WhatsApp
                        </a>
                      ) : null}
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-sm text-slate-600">
                No matches yet. Add a few more interests below, widen &ldquo;How
                far&rdquo;, or invite friends to start the {profile.city}{" "}
                circle.
              </Card>
            )}
            {matches.length < 3 ? (
              <Card className="space-y-2">
                <p className="font-semibold">
                  Help start the {profile.city} circle
                </p>
                <p className="text-sm text-slate-600">
                  Invite friends to GoDesi. You earn points when they join.
                </p>
                <ShareButtons
                  url={inviteLink}
                  title="Join my Desi Circle on GoDesi"
                />
              </Card>
            ) : null}
          </section>
        ) : null}

        {clubs.length ? (
          <section className="space-y-3">
            <div className="flex items-end justify-between gap-2">
              <h2 className="text-xl font-bold">Clubs for you</h2>
              <Link
                href="/clubs"
                className="text-sm font-semibold text-indigo-700"
              >
                All clubs →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {clubs.map((club) => (
                <ClubCard key={club.slug} club={club} />
              ))}
            </div>
          </section>
        ) : null}

        {events.length ? (
          <section className="space-y-3">
            <div className="flex items-end justify-between gap-2">
              <h2 className="text-xl font-bold">
                Coming up in {profile?.city}
              </h2>
              <Link
                href="/events"
                className="text-sm font-semibold text-indigo-700"
              >
                All events →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {events.map((event) => (
                <EventCard key={event.id} event={event} variant="tile" />
              ))}
            </div>
          </section>
        ) : null}

        {profile && !clubs.length ? (
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              No clubs in {profile.city} yet for what you enjoy. Start one and
              invite your circle.
            </p>
            <LinkButton href="/clubs/new" variant="secondary">
              Start a club
            </LinkButton>
          </Card>
        ) : null}

        <section id="my-profile" className="scroll-mt-24 space-y-3">
          <div>
            <h2 className="text-xl font-bold">
              {profile
                ? "My Connect profile"
                : "Tell us what you're looking for"}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Every profile is reviewed before it appears, and edits go back for
              review.
            </p>
          </div>
          <Card>
            <MeetupProfileForm
              defaults={
                profile
                  ? {
                      displayName: profile.displayName,
                      age: profile.age,
                      gender: profile.gender,
                      marital: profile.marital,
                      city: profile.city,
                      state: profile.state ?? "",
                      intents: parseIntents(profile.intents),
                      interests: profile.interests,
                      ageRange: profile.ageRange ?? "",
                      meetRadiusMiles: profile.meetRadiusMiles,
                      bio: profile.bio,
                      whatsappNumber: profile.whatsappNumber ?? "",
                      visiting: profile.visiting,
                    }
                  : undefined
              }
            />
          </Card>
        </section>

        {profile ? (
          <Card className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-600">
              Status: <strong>{profile.status.toLowerCase()}</strong> ·{" "}
              {profile.visible ? "visible in Connect" : "hidden from Connect"}
            </p>
            <div className="flex gap-2">
              <form action={toggleMeetupVisibilityAction}>
                <button
                  type="submit"
                  className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold hover:bg-slate-50"
                >
                  {profile.visible ? "Hide my profile" : "Show my profile"}
                </button>
              </form>
              <form action={deleteMeetupProfileAction}>
                <button
                  type="submit"
                  className="rounded-xl border border-rose-300 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                >
                  Delete
                </button>
              </form>
            </div>
          </Card>
        ) : null}
      </div>

      <SafetyResourcesRail />
    </div>
  );
}
