import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { siteUrl, whatsappLink } from "@/lib/format";
import { Money } from "@/components/Money";
import { effectivePlan } from "@/lib/plans";
import { maskContactDetails } from "@/lib/moderation";
import { softFor } from "@/lib/categories";
import { Alert, Badge, Card, LinkButton, Stars } from "@/components/ui";
import { QrCard } from "@/components/QrCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { FoundingBadge } from "@/components/FoundingBadge";
import { TrackVisit } from "@/components/TrackVisit";
import { ReviewForm } from "@/components/ReviewForm";
import { PostedBy } from "@/components/PostedBy";
import { PlaceLink } from "@/components/PlaceLink";
import { ShareButtons } from "@/components/ShareButtons";
import { BadgeEmbed } from "@/components/BadgeEmbed";
import { ClaimBusinessForm } from "@/components/forms/ClaimBusinessForm";
import { VideoEmbed } from "@/components/VideoEmbed";
import { PhotoAlbumGallery } from "@/components/PhotoAlbumGallery";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
import { HiringChecklist, NeedHelpBox } from "@/components/NeedHelp";
import { RecommendedLinks } from "@/components/RecommendedLinks";
import { BUSINESS_SOCIALS } from "@/lib/businessSocials";
import { disclaimerFor, specialtySet } from "@/lib/specialties";
import { AgentDetails, SimilarAgents } from "@/components/AgentProfile";
import { isAgentCard } from "@/lib/agents";
import { priceLabel } from "@/lib/listings";
import { StaffEditLink } from "@/components/StaffEditLink";
import { metaDescription } from "@/lib/seo";
import { badgeStatus } from "@/lib/badge";

export const dynamic = "force-dynamic";

async function getBusiness(slug: string) {
  return db.business.findUnique({
    where: { slug },
    include: {
      owner: {
        select: {
          id: true,
          plan: true,
          planExpiresAt: true,
          name: true,
          username: true,
          avatarUrl: true,
          foundingNumber: true,
        },
      },
      categoryRef: { select: { slug: true, name: true, icon: true, color: true } },
      subcategoryRef: { select: { slug: true, name: true } },
      media: { orderBy: { sortOrder: "asc" } },
      packages: { orderBy: { sortOrder: "asc" } },
      reviews: { where: { hidden: false }, orderBy: { createdAt: "desc" } },
      agentProfile: { include: { sales: { orderBy: { soldOn: "desc" }, take: 12 } } },
      vehicle: true,
    },
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const business = await db.business.findUnique({
    where: { slug: params.slug },
    select: { name: true, category: true, city: true, description: true, logoUrl: true },
  });
  if (!business) return { title: "Business not found" };

  const title = `${business.name} — ${business.category} in ${business.city}`;
  const description = metaDescription(
    business.description ? maskContactDetails(business.description) : null,
    `${business.name} is a ${business.category.toLowerCase()} in ${business.city}.`,
    "Message on WhatsApp, call, see photos, opening hours and reviews, or scan the free QR business card on Godesi.",
  );

  return {
    title,
    description,
    alternates: { canonical: `/b/${params.slug}` },
    openGraph: {
      title,
      description,
      url: `${siteUrl()}/b/${params.slug}`,
      images: business.logoUrl ? [business.logoUrl] : undefined,
    },
  };
}



export default async function BusinessProfilePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { src?: string; claim?: string };
}) {
  const [business, viewer, badge] = await Promise.all([
    getBusiness(params.slug),
    getCurrentUser(),
    badgeStatus(params.slug),
  ]);
  if (!business) notFound();

  const extraCategories = business.extraCategorySlugs.length
    ? await db.category.findMany({
        where: { slug: { in: business.extraCategorySlugs } },
        select: { slug: true, name: true },
        orderBy: { name: "asc" },
      })
    : [];

  const agentListings =
    business.ownerId && isAgentCard(business.subcategorySlug)
      ? await db.listing.findMany({
          where: {
            ownerId: business.ownerId,
            status: "APPROVED",
            kind: { in: ["PROPERTY_SALE", "PROPERTY_RENT"] },
          },
          orderBy: { createdAt: "desc" },
          take: 6,
          select: {
            id: true,
            slug: true,
            title: true,
            city: true,
            area: true,
            price: true,
            currency: true,
            perMonth: true,
          },
        })
      : [];

  const isOwner = viewer?.id === business.ownerId;
  /**
   * Phone and email are only rendered for paid listings (or to the owner/admin), so a
   * free listing never exposes them in the HTML. WhatsApp chat stays open to everyone,
   * as promised by the Free plan.
   */
  const contactVisible =
    isOwner ||
    viewer?.role === "ADMIN" ||
    (business.owner ? effectivePlan(business.owner) !== "FREE" : false);
  // Free listings agreed to WhatsApp-only contact, so details typed into the
  // description are masked rather than left as a paid-field workaround.
  const description = business.description
    ? contactVisible
      ? business.description
      : maskContactDetails(business.description)
    : null;
  const isAgent = isAgentCard(business.subcategorySlug);
  const reviewCount = business.reviews.length;
  const rating = reviewCount
    ? business.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: description ?? undefined,
    image: business.logoUrl ?? undefined,
    url: `${siteUrl()}/b/${business.slug}`,
    ...(contactVisible && (business.phone || business.whatsappNumber)
      ? { telephone: business.phone ?? `+${business.whatsappNumber}` }
      : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: business.address ?? undefined,
      addressLocality: business.city,
      addressRegion: business.state ?? undefined,
      addressCountry: business.country ?? undefined,
    },
    ...(reviewCount
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: rating.toFixed(1),
            reviewCount,
          },
        }
      : {}),
  };

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
      <TrackVisit slug={business.slug} fromQr={searchParams.src === "qr"} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {business.status !== "APPROVED" ? (
        <Alert tone="info">
          This listing is {business.status.toLowerCase()} — it is reachable by direct link
          and QR, but does not appear in search yet.
        </Alert>
      ) : null}

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={business.logoUrl ?? "/placeholder-logo.svg"}
            alt={`${business.name} logo`}
            className="h-20 w-20 rounded-2xl border border-slate-200 object-cover"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold">{business.name}</h1>
              <StaffEditLink href={`/admin/business/${business.slug}`} />
              {business.owner && business.owner.plan !== "FREE" ? (
                <Badge tone="indigo">{business.owner.plan}</Badge>
              ) : null}
              {business.owner ? (
                <FoundingBadge number={business.owner.foundingNumber} />
              ) : (
                <Badge tone="slate">Unclaimed</Badge>
              )}
              {business.profileType === "PROFESSIONAL" ? (
                <Badge tone="green">Professional</Badge>
              ) : null}
              {business.featured ? <Badge tone="amber">Featured</Badge> : null}
              {badge.level === "VERIFIED" ? (
                <Link href={`/verify/${business.slug}`} title="What this means">
                  <Badge tone="green">✅ Verified on Godesi</Badge>
                </Link>
              ) : null}
            </div>
            <p className="text-slate-600">
              {business.category} ·{" "}
              <PlaceLink
                city={business.city}
                state={business.state}
                country={business.country}
              />
            </p>
            {business.categoryRef ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Link
                  href={`/categories/${business.categoryRef.slug}`}
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${softFor(business.categoryRef.color)}`}
                >
                  {business.categoryRef.icon} {business.categoryRef.name}
                </Link>
                {business.subcategoryRef ? (
                  <Link
                    href={`/categories/${business.subcategoryRef.slug}`}
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${softFor(business.categoryRef.color)}`}
                  >
                    {business.subcategoryRef.name}
                  </Link>
                ) : null}
                {extraCategories.map((extra) => (
                  <Link
                    key={extra.slug}
                    href={`/categories/${extra.slug}`}
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${softFor(business.categoryRef?.color ?? "indigo")}`}
                  >
                    {extra.name}
                  </Link>
                ))}
              </div>
            ) : null}
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              <Stars rating={rating} />
              <span>
                {reviewCount ? `${rating.toFixed(1)} (${reviewCount} reviews)` : "No reviews yet"}
              </span>
            </div>
            {description ? (
              <p className="mt-3 whitespace-pre-line text-slate-700">
                {description}
              </p>
            ) : null}

            {business.specialties.length ? (
              <div className="mt-3">
                <h2 className="text-sm font-bold text-slate-900">
                  {specialtySet(business.subcategorySlug)?.title ?? "Services"}
                </h2>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {business.featuredSpecialty ? (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      ⭐ {business.featuredSpecialty}
                    </span>
                  ) : null}
                  {business.specialties
                    .filter((item) => item !== business.featuredSpecialty)
                    .map((item) => (
                      <Link
                        key={item}
                        href={`/categories/${business.subcategorySlug}?service=${encodeURIComponent(item)}`}
                        className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800 hover:bg-cyan-100"
                      >
                        {item}
                      </Link>
                    ))}
                </div>
              </div>
            ) : null}

            {business.vehicle ? (
              <div className="mt-3 rounded-2xl border border-lime-300 bg-lime-50/60 p-4">
                <h2 className="text-sm font-bold text-lime-900">Vehicle details</h2>
                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-slate-700 sm:grid-cols-3">
                  {[
                    ["Type", business.vehicle.vehicleType],
                    ["Make & model", `${business.vehicle.make} ${business.vehicle.model}`],
                    ["Year", String(business.vehicle.year)],
                    [
                      "Mileage",
                      business.vehicle.mileage === null
                        ? null
                        : `${business.vehicle.mileage.toLocaleString()} ${business.vehicle.mileageUnit}`,
                    ],
                    ["Fuel", business.vehicle.fuelType],
                    ["Transmission", business.vehicle.transmission],
                    ["Ownership", business.vehicle.ownership],
                    ["Condition", business.vehicle.condition],
                    [
                      "Price",
                      business.vehicle.price === null
                        ? null
                        : `${business.vehicle.currency === "INR" ? "₹" : "$"}${business.vehicle.price.toLocaleString()}${business.vehicle.negotiable ? " (negotiable)" : ""}`,
                    ],
                  ]
                    .filter((row): row is [string, string] => Boolean(row[1]))
                    .map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs font-semibold text-lime-900/70">{label}</dt>
                        <dd className="font-semibold">{value}</dd>
                      </div>
                    ))}
                </dl>
                {business.vehicle.features.length ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {business.vehicle.features.map((item) => (
                      <span
                        key={item}
                        className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-lime-900"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                ) : null}
                {business.vehicle.documents.length ? (
                  <p className="mt-2 text-xs font-semibold text-lime-900">
                    ✅ {business.vehicle.documents.join(" · ")}
                  </p>
                ) : null}
              </div>
            ) : null}

            {business.serviceOptions.length ||
            business.priceFrom ||
            business.priceHourly ||
            business.priceExtra ||
            business.availability ? (
              <div className="mt-3 rounded-2xl border border-violet-200 bg-violet-50/60 p-4">
                <h2 className="text-sm font-bold text-violet-900">
                  Service details
                </h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {business.verifiedProvider ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      ✅ Verified provider
                    </span>
                  ) : null}
                  {business.serviceOptions.map((option) => (
                    <Link
                      key={option}
                      href={`/categories/${business.subcategorySlug}?opt=${encodeURIComponent(option)}`}
                      className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-violet-800 hover:bg-violet-100"
                    >
                      {option}
                    </Link>
                  ))}
                </div>
                <dl className="mt-3 grid gap-x-4 gap-y-1 text-sm text-slate-700 sm:grid-cols-2">
                  {[
                    ["Starting price", business.priceFrom],
                    ["Per hour", business.priceHourly],
                    ["Home visit extra", business.priceExtra],
                    ["Availability", business.availability],
                  ]
                    .filter((row): row is [string, string] => Boolean(row[1]))
                    .map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs font-semibold text-violet-900/70">
                          {label}
                        </dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                </dl>
              </div>
            ) : null}

            {business.certifications.length ||
            business.licenseNumber ||
            business.feeStructure ||
            business.carriers ||
            business.yearsExperience !== null ? (
              <div className="mt-3 space-y-1 text-sm text-slate-700">
                {business.yearsExperience !== null ? (
                  <p>
                    <span className="font-semibold">Experience:</span>{" "}
                    {business.yearsExperience} years
                  </p>
                ) : null}
                {business.licenseNumber ? (
                  <p>
                    <span className="font-semibold">Licence:</span>{" "}
                    {business.licenseNumber}
                  </p>
                ) : null}
                {business.certifications.length ? (
                  <p>
                    <span className="font-semibold">Certifications:</span>{" "}
                    {business.certifications.join(", ")}
                  </p>
                ) : null}
                {business.feeStructure ? (
                  <p>
                    <span className="font-semibold">Fees:</span>{" "}
                    {business.feeStructure}
                  </p>
                ) : null}
                {business.carriers ? (
                  <p>
                    <span className="font-semibold">Carriers:</span>{" "}
                    {business.carriers}
                  </p>
                ) : null}
                <p className="text-xs text-slate-500">
                  {disclaimerFor(business.subcategorySlug)}
                </p>
              </div>
            ) : null}

            {business.videoUrl ? (
              <div className="mt-3">
                <VideoEmbed url={business.videoUrl} title={business.name} />
              </div>
            ) : null}

            {business.albumUrl ? (
              <div className="mt-3">
                <PhotoAlbumGallery
                  url={business.albumUrl}
                  heading="Photos"
                />
              </div>
            ) : null}

            {business.startingPrice !== null || business.customQuote ? (
              <p className="mt-3 text-sm font-bold text-emerald-700">
                {business.startingPrice !== null ? (
                  <>
                    Packages from{" "}
                    <Money
                      value={business.startingPrice}
                      currency={business.priceCurrency ?? "USD"}
                    />
                  </>
                ) : (
                  "Custom quote for every booking"
                )}
              </p>
            ) : null}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              {business.owner ? (
                <PostedBy user={business.owner} prefix="Listed by" />
              ) : (
                <p className="text-sm text-slate-500">Not claimed yet</p>
              )}
              <ShareButtons
                url={`${siteUrl()}/b/${business.slug}`}
                title={business.name}
              />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {business.whatsappNumber ? (
                <WhatsAppButton
                  slug={business.slug}
                  href={whatsappLink(
                    business.whatsappNumber,
                    `Hi ${business.name}, I found you on Godesi.`,
                  )}
                />
              ) : null}
              {contactVisible && business.phone ? (
                <a
                  href={`tel:${business.phone}`}
                  className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                >
                  Call {business.phone}
                </a>
              ) : null}
              {contactVisible && business.publicEmail ? (
                <a
                  href={`mailto:${business.publicEmail}`}
                  className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                >
                  Email
                </a>
              ) : null}
              {BUSINESS_SOCIALS.map(({ key, label, icon }) =>
                business[key] ? (
                  <a
                    key={key}
                    href={business[key] as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                  >
                    <span aria-hidden>{icon}</span>
                    {label}
                  </a>
                ) : null,
              )}
            </div>
          </div>
        </div>
      </Card>

      {!business.owner ? (
        <Card className="space-y-3 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900">
            🏷️ This is a starter listing — nobody has claimed it yet. If you run{" "}
            {business.name}, claim it to add photos, packages, WhatsApp and your contact
            details.
          </p>
          {business.source === "osm" ? (
            <p className="text-xs text-amber-800">
              Basic details from{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                OpenStreetMap contributors
              </a>{" "}
              (ODbL).
            </p>
          ) : null}
          {viewer ? (
            <ClaimBusinessForm businessId={business.id} open={searchParams.claim === "1"} />
          ) : (
            <LinkButton href={`/login?next=/b/${business.slug}?claim=1`}>
              Sign in to claim this business
            </LinkButton>
          )}
        </Card>
      ) : null}

      {!contactVisible && (business.phone || business.publicEmail) ? (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-amber-200 bg-amber-50">
          <p className="text-sm text-amber-900">
            📞 Phone and email are shown on Pro &amp; Premium listings. This business can
            unlock them by upgrading — meanwhile you can chat on WhatsApp.
          </p>
          {isOwner ? <LinkButton href="/pricing">Upgrade to show contact</LinkButton> : null}
        </Card>
      ) : null}

      {isAgent && business.agentProfile ? (
        <div className="space-y-5">
          <AgentDetails
            profile={business.agentProfile}
            reviews={business.reviews}
          />
        </div>
      ) : null}

      {isAgent && isOwner && !business.agentProfile ? (
        <Card className="border-indigo-200 bg-indigo-50">
          <p className="text-sm text-indigo-900">
            Add your licence, service areas, specialties and closed sales so buyers can see
            you know their area.
          </p>
          <LinkButton href="/dashboard/agent" className="mt-2">
            Complete my agent profile
          </LinkButton>
        </Card>
      ) : null}

      {isAgent && agentListings.length ? (
        <Card>
          <h2 className="mb-3 text-lg font-bold">Available listings</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {agentListings.map((listing) => (
              <Link
                key={listing.id}
                href={`/listings/${listing.slug}`}
                className="rounded-2xl border border-slate-200 p-3 transition hover:border-indigo-300 hover:bg-indigo-50/50"
              >
                <p className="font-semibold text-slate-900">{listing.title}</p>
                <p className="text-sm text-emerald-700">{priceLabel(listing)}</p>
                <p className="text-xs text-slate-500">
                  {listing.city}
                  {listing.area ? ` · ${listing.area}` : ""}
                </p>
              </Link>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {business.packages.length ? (
            <Card>
              <h2 className="mb-3 text-lg font-bold">Packages & pricing</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {business.packages.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-rose-50 p-4"
                  >
                    <p className="font-bold">{item.name}</p>
                    <p className="text-xl font-black text-emerald-700">
                      <Money value={item.price} currency={item.currency} />
                    </p>
                    {item.description ? (
                      <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                    ) : null}
                    {item.includes ? (
                      <ul className="mt-2 space-y-0.5 text-sm text-slate-600">
                        {item.includes
                          .split("\n")
                          .map((line) => line.trim())
                          .filter(Boolean)
                          .map((line) => (
                            <li key={line}>✓ {line}</li>
                          ))}
                      </ul>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>
          ) : null}

          {business.media.length ? (
            <Card>
              <h2 className="mb-3 text-lg font-bold">Gallery</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {business.media.map((item) =>
                  item.type === "VIDEO" ? (
                    <video
                      key={item.id}
                      src={item.url}
                      controls
                      className="h-48 w-full rounded-xl bg-black object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={item.id}
                      src={item.url}
                      alt={item.caption ?? business.name}
                      className="h-48 w-full rounded-xl border border-slate-200 object-cover"
                    />
                  ),
                )}
              </div>
            </Card>
          ) : null}

          <Card>
            <h2 className="mb-3 text-lg font-bold">
              Reviews {reviewCount ? `(${reviewCount})` : ""}
            </h2>
            <div className="space-y-4">
              {business.reviews.length ? (
                business.reviews.map((review) => (
                  <div key={review.id} className="border-b border-slate-100 pb-3 last:border-0">
                    <div className="flex items-center gap-2">
                      <Stars rating={review.rating} />
                      <span className="text-sm font-semibold">{review.authorName}</span>
                      <span className="text-xs text-slate-400">
                        {review.createdAt.toLocaleDateString("en-IN")}
                      </span>
                    </div>
                    {review.comment ? (
                      <p className="mt-1 text-sm text-slate-700">{review.comment}</p>
                    ) : null}
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">Be the first to leave a review.</p>
              )}
            </div>

            {!isOwner ? (
              <div className="mt-5 border-t border-slate-100 pt-4">
                <h3 className="mb-3 font-semibold">Leave a review</h3>
                <ReviewForm
                  businessId={business.id}
                  defaultName={viewer?.name}
                  detailed={isAgent}
                />
              </div>
            ) : null}
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <h2 className="mb-3 text-lg font-bold">Scan &amp; share</h2>
            <QrCard slug={business.slug} shareUrl={`${siteUrl()}/b/${business.slug}`} />
          </Card>

          {business.address || business.mapsUrl ? (
            <Card>
              <h2 className="mb-2 text-lg font-bold">Location</h2>
              {business.address ? (
                <p className="text-sm text-slate-700">{business.address}</p>
              ) : null}
              {business.mapsUrl ? (
                <a
                  href={business.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-semibold text-indigo-600"
                >
                  Open in Google Maps
                </a>
              ) : null}
            </Card>
          ) : null}

          {isOwner ? (
            <Card>
              <h2 className="font-bold">Show it off on your website 🏅</h2>
              <p className="mt-1 text-sm text-slate-600">
                Paste this badge on your own site — customers can click it to
                check your Godesi listing is real.
              </p>
              <div className="mt-3">
                <BadgeEmbed
                  slug={business.slug}
                  name={business.name}
                  level={badge.level}
                  origin={siteUrl()}
                />
              </div>
            </Card>
          ) : null}

          {isOwner ? (
            <Card>
              <p className="text-sm text-slate-600">This is your card.</p>
              <Link
                href="/dashboard"
                className="mt-2 inline-block text-sm font-semibold text-indigo-600"
              >
                Go to dashboard →
              </Link>
            </Card>
          ) : null}
        </div>
      </div>

      {isAgent && business.agentProfile ? (
        <SimilarAgents
          businessId={business.id}
          city={business.city}
          subcategorySlug={business.subcategorySlug ?? ""}
        />
      ) : null}

      <RecommendedLinks categorySlug={business.categoryRef?.slug ?? null} />

      <HiringChecklist />

      <InlineBanner />
      </div>

      <aside className="hidden w-[260px] shrink-0 space-y-4 lg:order-first lg:block">
        <NeedHelpBox about={business.name} />
        <SidebarBanners />
      </aside>
    </div>
  );
}
