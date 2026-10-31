import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";

export const dynamic = "force-dynamic";

/**
 * Public read-only mini card for godesi.us short links (godesi.us/<slug>).
 * One approved listing's public fields — same data the public profile shows.
 */
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const item = await db.business.findFirst({
    where: { slug: params.slug, status: "APPROVED" },
    select: {
      slug: true,
      name: true,
      profileType: true,
      description: true,
      logoUrl: true,
      coverUrl: true,
      city: true,
      state: true,
      country: true,
      address: true,
      categorySlug: true,
      subcategorySlug: true,
      specialties: true,
      serviceOptions: true,
      yearsExperience: true,
      verifiedProvider: true,
      featured: true,
      hideContact: true,
      ownerId: true,
      whatsappNumber: true,
      phone: true,
      publicEmail: true,
      websiteUrl: true,
      instagramUrl: true,
      facebookUrl: true,
      googleReviewUrl: true,
      mapsUrl: true,
      priceFrom: true,
      startingPrice: true,
      priceCurrency: true,
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const base = siteUrl();
  const contact = item.hideContact
    ? {}
    : {
        whatsapp: item.whatsappNumber,
        phone: item.phone,
        email: item.publicEmail,
      };

  return NextResponse.json(
    {
      slug: item.slug,
      name: item.name,
      profileType: item.profileType,
      description: item.description,
      logoUrl: item.logoUrl,
      coverUrl: item.coverUrl,
      city: item.city,
      state: item.state,
      country: item.country,
      address: item.address,
      categorySlug: item.categorySlug,
      subcategory: item.subcategorySlug,
      services: [...item.specialties, ...item.serviceOptions].slice(0, 10),
      yearsExperience: item.yearsExperience,
      verified: item.verifiedProvider,
      claimed: Boolean(item.ownerId),
      featured: item.featured,
      websiteUrl: item.websiteUrl,
      instagramUrl: item.instagramUrl,
      facebookUrl: item.facebookUrl,
      googleReviewUrl: item.googleReviewUrl,
      mapsUrl: item.mapsUrl,
      priceFrom: item.priceFrom ?? item.startingPrice,
      priceCurrency: item.priceCurrency,
      shortUrl: `https://godesi.us/${item.slug}`,
      url: `${base}/business/${item.slug}`,
      ...contact,
    },
    {
      headers: {
        "access-control-allow-origin": "*",
        "cache-control": "public, s-maxage=600, stale-while-revalidate=3600",
      },
    },
  );
}
