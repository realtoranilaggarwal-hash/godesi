import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { cachedQuery, CONTENT_TTL } from "@/lib/cache";
import { formatEventDate } from "@/lib/events";
import { Alert, Badge, Card, LinkButton } from "@/components/ui";
import { AmbassadorForm } from "@/components/forms/AmbassadorForm";
import {
  AMBASSADOR_COMPLIANCE,
  AMBASSADOR_COMPLIANCE_REVIEW_NOTE,
  AMBASSADOR_EVENT_BENEFITS,
  AMBASSADOR_PERKS,
  AMBASSADOR_PLEDGE,
  AMBASSADOR_PROGRAM_NAME,
} from "@/lib/joinGoals";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Community Ambassador & Event Promotion Program",
  description:
    "Represent GoDesi in your city: promote local desi events with your own tracked link, earn complimentary invites and featured recognition, spotlight your business, and get a badge and certificate.",
  alternates: { canonical: "/ambassador" },
};

/** Approved, upcoming events ambassadors can be assigned to promote. Cached dates come back as strings. */
const promotableEvents = cachedQuery("ambassador-events", CONTENT_TTL, () =>
  db.event.findMany({
    where: { status: "APPROVED", startsAt: { gt: new Date() } },
    select: {
      id: true,
      slug: true,
      title: true,
      startsAt: true,
      timeZone: true,
      city: true,
      featured: true,
    },
    orderBy: [{ featured: "desc" }, { startsAt: "asc" }],
    take: 6,
  }),
);

const ambassadorBusinesses = cachedQuery(
  "ambassador-businesses",
  CONTENT_TTL,
  () =>
    db.ambassador.findMany({
      where: { status: "APPROVED", businessApprovedAt: { not: null } },
      select: {
        id: true,
        city: true,
        businessName: true,
        socialUrl: true,
        logoUrl: true,
        businessInfo: true,
        user: { select: { name: true } },
      },
      orderBy: { businessApprovedAt: "desc" },
      take: 12,
    }),
);

export default async function AmbassadorPage() {
  const user = await getCurrentUser();
  const [application, events, businesses] = await Promise.all([
    user ? db.ambassador.findUnique({ where: { userId: user.id } }) : null,
    promotableEvents(),
    ambassadorBusinesses(),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-100">
          {AMBASSADOR_PROGRAM_NAME}
        </p>
        <h1 className="mt-1 text-3xl font-black sm:text-4xl">
          Represent GoDesi in your city 🤝
        </h1>
        <p className="mt-2 max-w-2xl text-emerald-50">
          Help desi businesses, families and organisers near you be discovered,
          heard and remembered. Ambassadors promote community events with
          their own tracked link, and GoDesi honours and rewards them for it.
        </p>
        {application?.status === "APPROVED" ? (
          <div className="mt-4">
            <LinkButton href="/ambassador/dashboard" variant="secondary">
              📊 My ambassador dashboard
            </LinkButton>
          </div>
        ) : null}
      </div>

      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="font-bold">
          ⚖️ Event &amp; community marketing only
        </p>
        <ul className="mt-1 list-disc space-y-1 pl-5">
          {AMBASSADOR_COMPLIANCE.slice(0, 3).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-2 text-xs">
          {AMBASSADOR_COMPLIANCE_REVIEW_NOTE}{" "}
          <Link href="/ambassador/terms" className="font-semibold underline">
            Read the program terms
          </Link>
          .
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">What you get</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {AMBASSADOR_PERKS.map((perk) => (
            <Card key={perk.title}>
              <p className="text-2xl" aria-hidden>
                {perk.icon}
              </p>
              <h3 className="mt-1 font-bold">{perk.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{perk.text}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Event promotion</h2>
        <p className="text-sm text-slate-600">
          Approved ambassadors get a personal tracked link for each event the
          GoDesi team assigns them. Your dashboard shows clicks, tickets and
          verified sales, and the benefit you are working towards.
        </p>
        {events.length ? (
          <ul className="grid gap-2 sm:grid-cols-2">
            {events.map((event) => (
              <li key={event.id} className="min-w-0">
                <Link
                  href={`/events/${event.slug}`}
                  className="block rounded-xl border border-slate-200 bg-white p-3 hover:border-emerald-400"
                >
                  <p className="break-words font-semibold text-slate-900">
                    {event.title}
                    {event.featured ? (
                      <span className="ml-2 align-middle">
                        <Badge tone="amber">featured</Badge>
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatEventDate(new Date(event.startsAt), event.timeZone)}{" "}
                    · {event.city}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-500">
            New events are added all the time —{" "}
            <Link href="/events" className="underline">
              see all events
            </Link>
            .
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Recognition &amp; benefits</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {AMBASSADOR_EVENT_BENEFITS.map((perk) => (
            <Card key={perk.title}>
              <p className="text-2xl" aria-hidden>
                {perk.icon}
              </p>
              <h3 className="mt-1 font-bold">{perk.title}</h3>
              <p className="mt-1 text-sm text-slate-600">{perk.text}</p>
            </Card>
          ))}
        </div>
        <p className="text-xs text-slate-500">
          Benefits are non-cash, set per campaign by the GoDesi team, and
          earned only on verified ticket sales for that event.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Business promotion</h2>
        <p className="text-sm text-slate-600">
          Run a business? Approved ambassadors can submit their business name,
          link and logo from their dashboard to be spotlighted here (mortgage,
          real-estate and insurance businesses can&apos;t be featured). Want more
          reach? See{" "}
          <Link href="/pricing" className="font-semibold underline">
            plans &amp; pricing
          </Link>{" "}
          and{" "}
          <Link href="/advertise" className="font-semibold underline">
            advertising packages
          </Link>
          .
        </p>
        {businesses.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {businesses.map((item) => (
              <li key={item.id} className="min-w-0">
                <Card>
                  <div className="flex items-center gap-3">
                    {item.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.logoUrl}
                        alt=""
                        className="h-12 w-12 shrink-0 rounded-lg border border-slate-200 object-cover"
                      />
                    ) : null}
                    <div className="min-w-0">
                      <p className="break-words font-bold">
                        {item.socialUrl ? (
                          <a
                            href={item.socialUrl}
                            target="_blank"
                            rel="nofollow noopener"
                            className="hover:underline"
                          >
                            {item.businessName}
                          </a>
                        ) : (
                          item.businessName
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.user.name} · {item.city}
                      </p>
                    </div>
                  </div>
                  {item.businessInfo ? (
                    <p className="mt-2 break-words text-sm text-slate-600">
                      {item.businessInfo}
                    </p>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">How it works</h2>
        <ol className="grid gap-2 text-sm text-slate-700 sm:grid-cols-4">
          {[
            "Create a free GoDesi account.",
            "Fill in the form below and sign the ethics pledge.",
            "The GoDesi team reviews you and gets in touch.",
            "Once approved, your badge and certificate go live.",
          ].map((step, index) => (
            <li key={step} className="rounded-xl bg-slate-50 p-3">
              <span className="block text-lg font-black text-emerald-700">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      <Card id="apply">
        <h2 className="text-xl font-bold">Apply</h2>
        {!user ? (
          <div className="mt-2 space-y-3 text-sm text-slate-700">
            <p>
              Sign in or create a free account to apply. The pledge you sign:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              {AMBASSADOR_PLEDGE.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2">
              <LinkButton href="/signup?next=/ambassador%23apply">
                Create free account
              </LinkButton>
              <LinkButton
                href="/login?next=/ambassador%23apply"
                variant="secondary"
              >
                Log in
              </LinkButton>
            </div>
          </div>
        ) : application?.status === "APPROVED" ? (
          <div className="mt-2 space-y-3">
            <Alert tone="success">
              You are a GoDesi Local Ambassador for {application.city}. Thank
              you!
            </Alert>
            <div className="flex flex-wrap gap-2">
              <LinkButton href="/ambassador/dashboard">
                📊 My ambassador dashboard
              </LinkButton>
              <LinkButton
                href={`/ambassador/certificate/${application.id}`}
                variant="secondary"
              >
                🏅 View my certificate
              </LinkButton>
            </div>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {application?.status === "PENDING" ? (
              <Alert tone="info">
                Your application is with the GoDesi team. You signed the pledge
                on {application.pledgedAt.toDateString()}; you can update it
                below.
              </Alert>
            ) : null}
            {application?.status === "DECLINED" ? (
              <Alert tone="info">
                Your last application was not approved. You can update it and
                apply again.
              </Alert>
            ) : null}
            <AmbassadorForm
              name={user.name}
              defaults={{
                city: application?.city ?? user.location ?? "",
                phone: application?.phone ?? user.offerPhone ?? "",
                pitch: application?.pitch ?? "",
                helps: application?.helps ?? [],
                businessName: application?.businessName ?? "",
                socialUrl: application?.socialUrl ?? "",
              }}
            />
          </div>
        )}
      </Card>

      <p className="text-xs text-slate-500">
        Ambassadors are never paid commission, cash or points; benefits are
        non-cash and have no cash value.{" "}
        <Link href="/ambassador/terms" className="underline">
          Program terms
        </Link>
        . Questions?{" "}
        <Link href="/contact" className="underline">
          Contact us
        </Link>
        .
      </p>
    </div>
  );
}
