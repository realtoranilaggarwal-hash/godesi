import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { siteUrl, whatsappLink } from "@/lib/format";
import {
  FURNISHING_LABELS,
  GENDER_LABELS,
  KIND_LABELS,
  LISTING_INCLUDE,
  priceLabel,
} from "@/lib/listings";
import { Badge, Card } from "@/components/ui";
import { PostedBy } from "@/components/PostedBy";
import { ShareButtons } from "@/components/ShareButtons";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
import { RecommendedLinks } from "@/components/RecommendedLinks";
import { VideoEmbed } from "@/components/VideoEmbed";

export const dynamic = "force-dynamic";

async function getListing(slug: string) {
  return db.listing.findFirst({
    where: { slug, status: "APPROVED" },
    include: LISTING_INCLUDE,
  });
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const listing = await getListing(params.slug);
  if (!listing) return { title: "Listing not found" };

  return {
    title: `${listing.title} — ${listing.city}`,
    description: listing.description.slice(0, 155),
    alternates: { canonical: `${siteUrl()}/listings/${listing.slug}` },
    openGraph: {
      title: listing.title,
      description: listing.description.slice(0, 155),
      images: listing.images[0] ? [listing.images[0].url] : undefined,
    },
  };
}

export default async function ListingPage({ params }: { params: { slug: string } }) {
  const listing = await getListing(params.slug);
  if (!listing) notFound();

  const facts = [
    ["Type", KIND_LABELS[listing.kind]],
    ["Location", `${listing.area ? `${listing.area}, ` : ""}${listing.city}`],
    ["Price", priceLabel(listing)],
    listing.bedrooms ? ["Bedrooms", `${listing.bedrooms} BHK`] : null,
    listing.furnishing ? ["Furnishing", FURNISHING_LABELS[listing.furnishing]] : null,
    listing.genderPref ? ["Flatmate", GENDER_LABELS[listing.genderPref]] : null,
  ].filter((row): row is [string, string] => Boolean(row));

  return (
    <div className="flex gap-6">
      <div className="min-w-0 flex-1 space-y-5">
        <Card className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="indigo">{KIND_LABELS[listing.kind]}</Badge>
            {listing.featured ? <Badge tone="amber">Featured</Badge> : null}
          </div>
          <div>
            <h1 className="text-2xl font-black sm:text-3xl">{listing.title}</h1>
            <p className="text-sm text-slate-600">
              📍 {listing.area ? `${listing.area}, ` : ""}
              {listing.city}
            </p>
          </div>
          <p className="text-2xl font-black text-emerald-700">{priceLabel(listing)}</p>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <PostedBy user={listing.owner} prefix="Listed by" />
            <ShareButtons
              url={`${siteUrl()}/listings/${listing.slug}`}
              title={listing.title}
            />
          </div>

          <a
            href={whatsappLink(
              listing.whatsapp,
              `Hi, I saw your listing "${listing.title}" on Godesi.`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white hover:bg-emerald-700 sm:w-auto"
          >
            💬 Chat on WhatsApp
          </a>
        </Card>

        {listing.images.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {listing.images.map((image) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={image.id}
                src={image.url}
                alt={listing.title}
                className="h-56 w-full rounded-2xl border border-slate-200 object-cover"
                loading="lazy"
              />
            ))}
          </div>
        ) : null}

        {listing.videoUrl ? <VideoEmbed url={listing.videoUrl} title={listing.title} /> : null}

        <Card>
          <h2 className="mb-2 font-bold">Details</h2>
          <dl className="grid gap-2 sm:grid-cols-2">
            {facts.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-3 text-sm">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-semibold text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <h2 className="mb-2 font-bold">About this listing</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">
            {listing.description}
          </p>
        </Card>
      <RecommendedLinks
        categorySlug={
          listing.kind === "ROOM_OFFERED" || listing.kind === "ROOM_WANTED"
            ? "rooms-roommates"
            : "real-estate"
        }
      />

      <InlineBanner />
      </div>

      <SidebarBanners />
    </div>
  );
}
