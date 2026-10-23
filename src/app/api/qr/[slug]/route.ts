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
  // The card now lives on the profile — both targets open /b/<slug>.
  const target = `${siteUrl()}/b/${business.slug}?src=qr`;

  return brandedQr({
    target,
    style: business.profileType === "PROFESSIONAL" ? "professional" : "business",
    name: business.name,
    featured: business.owner ? effectivePlan(business.owner) === "PREMIUM" : false,
    filename: `godesi-${business.slug}-qr.png`,
    download: url.searchParams.get("download") === "1",
  });
}
