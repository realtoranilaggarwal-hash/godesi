import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatMoney, siteUrl, whatsappLink } from "@/lib/format";
import { effectivePlan } from "@/lib/plans";
import { softFor } from "@/lib/categories";
import { Alert, Badge, Card, LinkButton, Stars } from "@/components/ui";
import { QrCard } from "@/components/QrCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { TrackVisit } from "@/components/TrackVisit";
import { ReviewForm } from "@/components/ReviewForm";
import { PostedBy } from "@/components/PostedBy";
import { ShareButtons } from "@/components/ShareButtons";
import { ClaimBusinessForm } from "@/components/forms/ClaimBusinessForm";
import { VideoEmbed } from "@/components/VideoEmbed";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
import { RecommendedLinks } from "@/components/RecommendedLinks";

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
        },
      },
      categoryRef: { select: { slug: true, name: true, icon: true, color: true } },
      subcategoryRef: { select: { slug: true, name: true } },
      media: { orderBy: { sortOrder: "asc" } },
      packages: { orderBy: { sortOrder: "asc" } },
      reviews: { orderBy: { createdAt: "desc" } },
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
  const description =
    business.description?.slice(0, 160) ??
    `${business.name} is a ${business.category} in ${business.city}. Chat on WhatsApp, see reviews and scan the QR card on Godesi.`;

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

const socialLinks = [
  { key: "websiteUrl", label: "Website" },
  { key: "instagramUrl", label: "Instagram" },
  { key: "facebookUrl", label: "Facebook" },
  { key: "youtubeUrl", label: "YouTube" },
  { key: "mapsUrl", label: "Google Maps" },
] as const;

export default async function BusinessProfilePage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { src?: string; claim?: string };
}) {
  const [business, viewer] = await Promise.all([
    getBusiness(params.slug),
    getCurrentUser(),
  ]);
  if (!business) notFound();

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
  const reviewCount = business.reviews.length;
  const rating = reviewCount
    ? business.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    description: business.description ?? undefined,
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
              {business.owner && business.owner.plan !== "FREE" ? (
                <Badge tone="indigo">{business.owner.plan}</Badge>
              ) : null}
              {business.owner ? null : <Badge tone="slate">Unclaimed</Badge>}
              {business.profileType === "PROFESSIONAL" ? (
                <Badge tone="green">Professional</Badge>
              ) : null}
              {business.featured ? <Badge tone="amber">Featured</Badge> : null}
            </div>
            <p className="text-slate-600">
              {business.category} · {business.city}
              {business.state ? `, ${business.state}` : ""}
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
              </div>
            ) : null}
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              <Stars rating={rating} />
              <span>
                {reviewCount ? `${rating.toFixed(1)} (${reviewCount} reviews)` : "No reviews yet"}
              </span>
            </div>
            {business.description ? (
              <p className="mt-3 whitespace-pre-line text-slate-700">
                {business.description}
              </p>
            ) : null}

            {business.videoUrl ? (
              <div className="mt-3">
                <VideoEmbed url={business.videoUrl} title={business.name} />
              </div>
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
              {socialLinks.map(({ key, label }) =>
                business[key] ? (
                  <a
                    key={key}
                    href={business[key] as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                  >
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
                      {formatMoney(item.price, item.currency)}
                    </p>
                    {item.description ? (
                      <p className="mt-1 text-sm text-slate-600">{item.description}</p>
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
                <ReviewForm businessId={business.id} defaultName={viewer?.name} />
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

      <RecommendedLinks categorySlug={business.categoryRef?.slug ?? null} />

      <InlineBanner />
      </div>

      <SidebarBanners />
    </div>
  );
}
