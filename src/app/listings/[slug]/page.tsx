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
import { marketplaceCategories } from "@/lib/listingsQueries";
import { Badge, Card } from "@/components/ui";
import { PostedBy } from "@/components/PostedBy";
import { PlaceLink } from "@/components/PlaceLink";
import { ShareButtons } from "@/components/ShareButtons";
import { InlineBanner, SidebarBanners } from "@/components/Banners";
import {
  FairHousingNotice,
  RoomSharingNotice,
} from "@/components/FairHousingNotice";
import { RecommendedLinks } from "@/components/RecommendedLinks";
import { NeedHelpBox, TradingTips } from "@/components/NeedHelp";
import { VideoEmbed } from "@/components/VideoEmbed";
import { PhotoAlbumGallery } from "@/components/PhotoAlbumGallery";
import { effectivePlan } from "@/lib/plans";
import { maskContactDetails } from "@/lib/moderation";
import { PropertySpec } from "@/components/PropertySpec";
import { PropertyContact } from "@/components/PropertyContact";
import { WhatsAppLead } from "@/components/WhatsAppLead";
import { ListingCard } from "@/components/ListingCard";
import { getCurrentUser } from "@/lib/auth";
import { PROPERTY_GROUP_LABELS } from "@/lib/property";
import Link from "next/link";

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

export default async function ListingPage({
  params,
}: {
  params: { slug: string };
}) {
  const listing = await getListing(params.slug);
  if (!listing) notFound();

  const viewer = await getCurrentUser();
  const isProperty =
    listing.kind === "PROPERTY_SALE" || listing.kind === "PROPERTY_RENT";
  // Similar property in the same city, same branch of the tree, similar budget.
  const similar = isProperty
    ? await db.listing.findMany({
        where: {
          status: "APPROVED",
          kind: listing.kind,
          id: { not: listing.id },
          OR: [
            { city: { equals: listing.city, mode: "insensitive" } },
            listing.propertyGroup
              ? { propertyGroup: listing.propertyGroup }
              : {},
          ],
        },
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        include: LISTING_INCLUDE,
        take: 3,
      })
    : [];

  const isRoom =
    listing.kind === "ROOM_OFFERED" || listing.kind === "ROOM_WANTED";
  const isItem = listing.kind === "MARKETPLACE";
  const sectionHref = isItem
    ? "/marketplace"
    : isRoom
      ? "/rooms"
      : "/real-estate";
  const category = listing.categorySlug
    ? (await marketplaceCategories()).find(
        (row) => row.slug === listing.categorySlug,
      )
    : null;
  const description =
    listing.owner && effectivePlan(listing.owner) !== "FREE"
      ? listing.description
      : maskContactDetails(listing.description);

  const facts = [
    ["Type", KIND_LABELS[listing.kind]],
    category ? ["Category", category.name] : null,
    ["Location", `${listing.area ? `${listing.area}, ` : ""}${listing.city}`],
    ["Price", priceLabel(listing)],
    listing.bedrooms ? ["Bedrooms", `${listing.bedrooms} BHK`] : null,
    listing.furnishing
      ? ["Furnishing", FURNISHING_LABELS[listing.furnishing]]
      : null,
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
              <PlaceLink city={listing.city} base={sectionHref} />
            </p>
          </div>
          <p className="text-2xl font-black text-emerald-700">
            {priceLabel(listing)}
          </p>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
            <PostedBy user={listing.owner} prefix="Listed by" />
            <ShareButtons
              url={`${siteUrl()}/listings/${listing.slug}`}
              title={listing.title}
            />
          </div>

          <WhatsAppLead
            listingId={listing.id}
            href={whatsappLink(
              listing.whatsapp,
              `Hi, I saw your listing "${listing.title}" on Godesi.`,
            )}
          >
            💬 Chat on WhatsApp
          </WhatsAppLead>

          {isProperty ? (
            <PropertyContact
              listingId={listing.id}
              listingSlug={listing.slug}
              hasPhone={Boolean(listing.contactPhone)}
              hasEmail={Boolean(listing.contactEmail)}
              signedIn={Boolean(viewer)}
            />
          ) : null}
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

        {listing.videoUrl ? (
          <VideoEmbed url={listing.videoUrl} title={listing.title} />
        ) : null}

        <PhotoAlbumGallery url={listing.albumUrl} heading="More photos" />

        {isProperty ? <PropertySpec listing={listing} /> : null}

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
            {description}
          </p>
        </Card>
        {similar.length ? (
          <section className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-bold">Similar property</h2>
              <Link
                href={`/real-estate?city=${encodeURIComponent(listing.city)}${
                  listing.propertyGroup ? `&group=${listing.propertyGroup}` : ""
                }`}
                className="text-sm font-semibold text-indigo-600 hover:underline"
              >
                {listing.propertyGroup
                  ? `All ${PROPERTY_GROUP_LABELS[listing.propertyGroup].toLowerCase()} in ${listing.city}`
                  : `All property in ${listing.city}`}{" "}
                →
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {similar.map((item) => (
                <ListingCard key={item.id} listing={item} />
              ))}
            </div>
          </section>
        ) : null}

        <RecommendedLinks
          categorySlug={isRoom ? "rooms-roommates" : "real-estate"}
        />

        {isRoom || listing.kind.startsWith("PROPERTY") ? (
          <FairHousingNotice />
        ) : null}
        {isRoom ? <RoomSharingNotice /> : null}

        <TradingTips />

        <InlineBanner />
      </div>

      <aside className="hidden w-[260px] shrink-0 space-y-4 lg:order-first lg:block">
        <NeedHelpBox about={listing.title} />
        <SidebarBanners />
      </aside>
    </div>
  );
}
