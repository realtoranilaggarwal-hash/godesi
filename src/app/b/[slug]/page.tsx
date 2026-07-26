import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { siteUrl, whatsappLink } from "@/lib/format";
import { Alert, Badge, Card, Stars } from "@/components/ui";
import { QrCard } from "@/components/QrCard";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { TrackVisit } from "@/components/TrackVisit";
import { ReviewForm } from "@/components/ReviewForm";

export const dynamic = "force-dynamic";

async function getBusiness(slug: string) {
  return db.business.findUnique({
    where: { slug },
    include: {
      owner: { select: { id: true, plan: true } },
      media: { orderBy: { sortOrder: "asc" } },
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
  searchParams: { src?: string };
}) {
  const [business, viewer] = await Promise.all([
    getBusiness(params.slug),
    getCurrentUser(),
  ]);
  if (!business) notFound();

  const isOwner = viewer?.id === business.ownerId;
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
    telephone: business.phone ?? `+${business.whatsappNumber}`,
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
    <div className="space-y-5">
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
              {business.owner.plan !== "FREE" ? (
                <Badge tone="indigo">{business.owner.plan}</Badge>
              ) : null}
              {business.featured ? <Badge tone="amber">Featured</Badge> : null}
            </div>
            <p className="text-slate-600">
              {business.category} · {business.city}
              {business.state ? `, ${business.state}` : ""}
            </p>
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

            <div className="mt-4 flex flex-wrap gap-2">
              <WhatsAppButton
                slug={business.slug}
                href={whatsappLink(
                  business.whatsappNumber,
                  `Hi ${business.name}, I found you on Godesi.`,
                )}
              />
              {business.phone ? (
                <a
                  href={`tel:${business.phone}`}
                  className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold hover:bg-slate-50"
                >
                  Call
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

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
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
    </div>
  );
}
