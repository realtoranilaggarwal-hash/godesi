import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { effectivePlan } from "@/lib/plans";
import { brandedQr } from "@/lib/qrBrand";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } },
) {
  const business = await db.business.findUnique({
    where: { slug: params.slug },
    select: {
      slug: true,
      name: true,
      profileType: true,
      owner: { select: { plan: true, planExpiresAt: true } },
    },
  });
  if (!business) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = new URL(request.url);
  // ?card=1 targets the shareable digital card (/card/<slug>) instead of the profile.
  const target = url.searchParams.get("card")
    ? `${siteUrl()}/card/${business.slug}`
    : `${siteUrl()}/b/${business.slug}?src=qr`;

  return brandedQr({
    target,
    style: business.profileType === "PROFESSIONAL" ? "professional" : "business",
    name: business.name,
    featured: business.owner ? effectivePlan(business.owner) === "PREMIUM" : false,
    filename: `godesi-${business.slug}-qr.png`,
    download: url.searchParams.get("download") === "1",
  });
}
