import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ElitePrompt } from "@/components/ElitePrompt";
import { FoundingFeatureOffer } from "@/components/FoundingFeatureOffer";
import { WeddingVendorPerks } from "@/components/WeddingVendorPerks";
import { WEDDING_SLUG } from "@/lib/wedding";
import { weddingLaunchSpotsLeft } from "@/lib/weddingLaunch";
import { FOUNDING_FEATURE_DAYS, foundingFeatureActive } from "@/lib/founding";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";
import { effectivePlan, PLANS } from "@/lib/plans";
import {
  Alert,
  Badge,
  Card,
  EmptyState,
  LinkButton,
  Stars,
} from "@/components/ui";
import { QrCard } from "@/components/QrCard";
import { siteUrl } from "@/lib/format";
import { closeLeadAction } from "@/app/actions/leads";
import { SidebarBanners } from "@/components/Banners";
import { SignOutButton } from "@/components/SignOutButton";
import { EarnStrip } from "@/components/EarnStrip";
import { pointValues, wallet } from "@/lib/rewardsQueries";
import { offerInterest } from "@/lib/offerInterests";
import { formatEventDate } from "@/lib/events";
import { PostAnything } from "@/components/PostAnything";
import { BusinessNextSteps } from "@/components/BusinessNextSteps";
import { MorningEmailSignup } from "@/components/MorningEmailSignup";
import { VdoEbookOffer } from "@/components/VdoEbookOffer";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: {
    saved?: string;
    business?: string;
    posted?: string;
    wedding?: string;
    upgraded?: string;
    verified?: string;
    password?: string;
  };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.role === "ADMIN") redirect("/admin");
  if (user.role === "MODERATOR") redirect("/admin/content");

  const plan = effectivePlan(user);

  const business = await db.business.findUnique({
    where: { ownerId: user.id },
    include: {
      reviews: { where: { hidden: false }, select: { rating: true } },
    },
  });

  const [balance, pointTable] = await Promise.all([
    wallet(user.id),
    pointValues(),
  ]);

  const weddingVendor = business?.categorySlug === WEDDING_SLUG;
  const [weddingSpots, weddingReferrals] = weddingVendor
    ? await Promise.all([
        weddingLaunchSpotsLeft(),
        db.referral.count({
          where: {
            referrerId: user.id,
            status: "APPROVED",
            user: { business: { categorySlug: WEDDING_SLUG } },
          },
        }),
      ])
    : [0, 0];

  const [myLeads, adStats, myEvents] = await Promise.all([
      db.lead.findMany({
        where: { clientId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      db.banner.aggregate({
        where: { advertiserId: user.id },
        _sum: { impressions: true, clicks: true },
        _count: { _all: true },
      }),
      db.event.findMany({
        where: { organizerId: user.id },
        orderBy: { startsAt: "desc" },
        take: 5,
        select: {
          id: true,
          slug: true,
          title: true,
          startsAt: true,
          timeZone: true,
          status: true,
          sourceId: true,
        },
      }),
    ]);

  const reviewCount = business?.reviews.length ?? 0;
  const rating = reviewCount
    ? business!.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Hi {user.name.split(" ")[0]}</h1>
            <p className="text-sm text-slate-600">
              Plan:{" "}
              <Badge tone={plan === "FREE" ? "slate" : "indigo"}>
                {PLANS[plan].name}
              </Badge>
              {user.planExpiresAt && plan !== "FREE"
                ? ` · renews ${user.planExpiresAt.toLocaleDateString("en-IN")}`
                : null}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <LinkButton href="/dashboard/plan" variant="secondary">
              My plan
            </LinkButton>
            <LinkButton href="/dashboard/listings" variant="secondary">
              My listings
            </LinkButton>
            <LinkButton href="/dashboard/rewards" variant="secondary">
              Refer &amp; earn
            </LinkButton>
            <LinkButton href="/dashboard/notifications" variant="secondary">
              Notifications
            </LinkButton>
            <LinkButton href="/leads">Browse leads</LinkButton>
            <SignOutButton />
          </div>
        </div>

        <EarnStrip
          user={user}
          balance={balance.balance}
          signupPoints={pointTable.REFERRAL_SIGNUP}
          profilePoints={pointTable.PROFILE_CREATED}
        />

        {searchParams.verified ? (
          <Alert tone="success">Email verified — thanks!</Alert>
        ) : null}
        {searchParams.password === "reset" ? (
          <Alert tone="success">New password saved — you are signed in.</Alert>
        ) : null}
        {searchParams.business && business ? (
          <Card className="border-emerald-200 bg-emerald-50">
            <h2 className="text-lg font-black text-emerald-900">
              {business.status === "APPROVED"
                ? "✅ Your business is live on Godesi — free"
                : "✅ Your business is saved — it goes live once you verify your email"}
            </h2>
            <p className="mt-1 text-sm text-emerald-800">
              {business.status === "APPROVED"
                ? "People can find you in search, in your city and in your category right now. There is nothing to pay."
                : "Verify your email and it publishes straight away — no waiting for us to approve it, and nothing to pay."}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm font-semibold text-emerald-900">
              <Link href={`/business/${business.slug}`} className="underline">
                See my page
              </Link>
              <Link href="/dashboard/media" className="underline">
                Add photos
              </Link>
              {business.status === "APPROVED" ? null : (
                <Link href="/verify-email" className="underline">
                  Verify my email
                </Link>
              )}
              <Link href="/upgrade" className="underline opacity-80">
                Optional: paid boost
              </Link>
            </div>
          </Card>
        ) : null}
        {searchParams.saved ? (
          <Alert tone="success">Profile saved.</Alert>
        ) : null}
        {business && (searchParams.business || searchParams.saved) ? (
          <BusinessNextSteps showOffer={Boolean(searchParams.business)} />
        ) : null}
        {searchParams.posted ? (
          <Alert tone="success">Requirement posted.</Alert>
        ) : null}
        {searchParams.upgraded ? (
          <Alert tone="success">
            You are now on the {searchParams.upgraded} plan.
          </Alert>
        ) : null}

        {user.foundingNumber !== null ? (
          <FoundingFeatureOffer
            days={FOUNDING_FEATURE_DAYS}
            activeUntil={
              foundingFeatureActive(user) && user.foundingFeatureUntil
                ? user.foundingFeatureUntil.toDateString()
                : null
            }
          />
        ) : null}

        {weddingVendor && business ? (
          <WeddingVendorPerks
            launchUntil={
              user.weddingLaunchAt && user.planExpiresAt
                ? user.planExpiresAt.toDateString()
                : null
            }
            spotsLeft={weddingSpots}
            referralLink={user.username ? `${siteUrl()}/ref/${user.username}` : null}
            referredVendors={weddingReferrals}
            verified={business.verifiedProvider}
            slug={business.slug}
            notice={searchParams.wedding}
          />
        ) : null}

        <PostAnything
          title="What would you like to do on GoDesi?"
          hasCard={Boolean(business)}
          goals={user.joinGoals}
        >
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-900">My profiles</p>
            {business ? (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3">
              <span aria-hidden className="text-2xl">
                {business.profileType === "PROFESSIONAL" ? "🎓" : "🏪"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{business.name}</p>
                <p className="text-xs text-slate-500">
                  {business.profileType === "PROFESSIONAL"
                    ? "Professional profile"
                    : "Business card"}{" "}
                  · {business.category}
                </p>
              </div>
              <Link
                href={`/business/${business.slug}`}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View
              </Link>
              <Link
                href="/dashboard/profile"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Edit
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3">
              <span aria-hidden className="text-2xl">
                🏪
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  Business card or professional profile
                </p>
                <p className="text-xs text-slate-500">
                  Not made yet — free, takes 2 minutes
                </p>
              </div>
              <Link
                href="/post?type=business"
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                Create
              </Link>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 p-3">
            <span aria-hidden className="text-2xl">
              🙋
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Personal profile</p>
              <p className="text-xs text-slate-500">
                {user.username ? `godesi.com/${user.username}` : "Pick your name"}
              </p>
            </div>
            {user.username ? (
              <Link
                href={`/${user.username}`}
                className="text-xs font-semibold text-indigo-600 hover:underline"
              >
                View
              </Link>
            ) : null}
            <Link
              href="/dashboard/me"
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              Edit
            </Link>
          </div>
        </div>
        </PostAnything>

        {user.morningEmailAt ? null : <MorningEmailSignup />}

        <VdoEbookOffer userId={user.id} />

        {user.offerInterests.length ? (
          <p className="rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-900">
            🎁 Your member benefits are set for{" "}
            <strong>
              {user.offerInterests
                .map((id) => offerInterest(id)?.label)
                .filter(Boolean)
                .join(" · ")}
            </strong>
            .{" "}
            <Link href="/dashboard/offers" className="font-semibold underline">
              See my benefits
            </Link>
          </p>
        ) : (
          <Card className="border-indigo-200 bg-indigo-50">
            <h2 className="text-lg font-bold text-indigo-900">
              🎁 Unlock your GoDesi member benefits
            </h2>
            <p className="mt-1 text-sm text-indigo-900/80">
              Member coupons, local business discounts, event deals and shopping
              offers — pick what you&apos;d like to save on, from buying a home
              and saving tax to flights to India. Nobody contacts you unless you
              say so.
            </p>
            <div className="mt-3">
              <LinkButton href="/dashboard/offers">See my benefits</LinkButton>
            </div>
          </Card>
        )}

        <ElitePrompt userId={user.id} answered={user.elitePrompt} />

        {adStats._count._all ? (
          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Your ads</h2>
                <p className="text-sm text-slate-600">
                  {(adStats._sum.impressions ?? 0).toLocaleString("en-IN")}{" "}
                  impressions ·{" "}
                  {(adStats._sum.clicks ?? 0).toLocaleString("en-IN")} clicks
                  across {adStats._count._all} banner
                  {adStats._count._all > 1 ? "s" : ""}
                </p>
              </div>
              <LinkButton href="/dashboard/ads" variant="secondary">
                Ad dashboard
              </LinkButton>
            </div>
          </Card>
        ) : null}

        {business ? (
          <div className="grid gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-bold">{business.name}</h2>
                  <p className="text-sm text-slate-600">
                    {business.category} · {business.city}
                  </p>
                  <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                    <Stars rating={rating} />
                    <span>
                      {reviewCount
                        ? `${rating.toFixed(1)} (${reviewCount})`
                        : "No reviews yet"}
                    </span>
                  </div>
                </div>
                <Badge
                  tone={
                    business.status === "APPROVED"
                      ? "green"
                      : business.status === "PENDING"
                        ? "amber"
                        : "red"
                  }
                >
                  {business.status}
                </Badge>
              </div>

              <p className="mt-3 text-sm text-slate-600">
                Public link:{" "}
                <Link
                  href={`/business/${business.slug}`}
                  className="font-semibold text-indigo-600"
                >
                  /business/{business.slug}
                </Link>
              </p>

              {business.websiteUrl ? null : (
                <p className="mt-3 rounded-xl bg-indigo-50 p-3 text-sm text-indigo-900">
                  <strong>No website yet?</strong> We build you a{" "}
                  {WEBSITE_OFFER.pages}-page site for ${WEBSITE_OFFER.priceUsd},
                  then ${WEBSITE_OFFER.monthlyUsd}/month with domain and hosting
                  included.{" "}
                  <Link href="/website" className="font-bold underline">
                    See what you get →
                  </Link>
                </p>
              )}

              <div className="mt-4 flex flex-wrap gap-2">
                <LinkButton href="/dashboard/profile" variant="secondary">
                  Edit profile
                </LinkButton>
                <LinkButton href="/dashboard/me" variant="secondary">
                  My personal profile
                </LinkButton>
                <LinkButton href="/dashboard/media" variant="secondary">
                  Manage gallery
                </LinkButton>
                <LinkButton href="/dashboard/agent" variant="secondary">
                  Agent credentials
                </LinkButton>
                <LinkButton href="/dashboard/packages" variant="secondary">
                  Packages & pricing
                </LinkButton>
                <LinkButton href="/dashboard/deals" variant="secondary">
                  🏷️ Deals &amp; offers
                </LinkButton>
                <LinkButton href="/dashboard/leads" variant="secondary">
                  Unlocked leads
                </LinkButton>
                <LinkButton href="/dashboard/bookings" variant="secondary">
                  📅 Bookings
                </LinkButton>
                <LinkButton href={`/business/${business.slug}`} variant="secondary">
                  🪪 My digital card
                </LinkButton>
                <LinkButton href="/dashboard/card-leads" variant="secondary">
                  Card leads
                </LinkButton>
                <LinkButton href="/dashboard/scan-card" variant="secondary">
                  📷 Scan card
                </LinkButton>
                <LinkButton href="/dashboard/reviews" variant="secondary">
                  Reviews on my card
                </LinkButton>
                <LinkButton href="/dashboard/tickets" variant="secondary">
                  My tickets &amp; events
                </LinkButton>
                <LinkButton href="/dashboard/gigs" variant="secondary">
                  🛠️ My gigs
                </LinkButton>
                <LinkButton href="/dashboard/payouts" variant="secondary">
                  Payouts
                </LinkButton>
                <LinkButton href="/dashboard/coupons" variant="secondary">
                  Event coupons
                </LinkButton>
                <LinkButton href="/advertise" variant="secondary">
                  Advertise
                </LinkButton>
              </div>
            </Card>

            <Card>
              <h2 className="mb-3 text-lg font-bold">Your QR code</h2>
              <QrCard
                slug={business.slug}
                shareUrl={`${siteUrl()}/business/${business.slug}`}
              />
            </Card>
          </div>
        ) : (
          <Card>
            <EmptyState
              title="You have not created your digital card yet"
              body="It takes a minute — add your name, category, city and WhatsApp number."
            />
            <div className="mt-4 text-center">
              <LinkButton href="/dashboard/profile">Create my card</LinkButton>
            </div>
          </Card>
        )}

        <Card>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-bold">Events you posted</h2>
            <LinkButton href="/events/new" variant="secondary">
              Post an event
            </LinkButton>
          </div>
          {myEvents.length ? (
            <>
              <ul className="divide-y divide-slate-100">
                {myEvents.map((event) => (
                  <li
                    key={event.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/events/${event.slug}`}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        {event.title}
                      </Link>
                      <p className="text-sm text-slate-500">
                        {formatEventDate(event.startsAt, event.timeZone)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        tone={
                          event.status === "APPROVED"
                            ? "green"
                            : event.status === "PENDING"
                              ? "amber"
                              : "red"
                        }
                      >
                        {event.status === "APPROVED"
                          ? "Live"
                          : event.status === "PENDING"
                            ? "Waiting for review"
                            : "Not approved"}
                      </Badge>
                      {event.sourceId ? null : (
                        <Link
                          href={`/events/${event.slug}/edit`}
                          className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
                        >
                          ✏️ Edit
                        </Link>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard/tickets"
                className="mt-2 inline-block text-sm font-semibold text-indigo-600 hover:underline"
              >
                All my events, bookings &amp; ticket types →
              </Link>
            </>
          ) : (
            <p className="text-sm text-slate-500">
              You have not posted any events.
            </p>
          )}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold">Requirements you posted</h2>
            <LinkButton href="/leads/new" variant="secondary">
              Post a requirement
            </LinkButton>
          </div>
          {myLeads.length ? (
            <ul className="divide-y divide-slate-100">
              {myLeads.map((lead) => (
                <li
                  key={lead.id}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div>
                    <p className="font-medium">{lead.title}</p>
                    <p className="text-sm text-slate-500">
                      {lead.category} · {lead.city} · {lead.status}
                    </p>
                  </div>
                  {lead.status === "OPEN" ? (
                    <form action={closeLeadAction}>
                      <input type="hidden" name="leadId" value={lead.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-slate-300 px-3 py-1.5 text-sm font-semibold hover:bg-slate-50"
                      >
                        Close
                      </button>
                    </form>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">
              You have not posted any requirements.
            </p>
          )}
        </Card>
      </div>

      <SidebarBanners />
    </div>
  );
}
