import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";

/** One published GoDesi Elite profile for desiwhoswho.com; contact details stay private. */
export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const entry = await db.eliteEntry.findFirst({
    where: { slug: params.slug, status: "PUBLISHED" },
    select: {
      slug: true,
      fullName: true,
      businessName: true,
      category: true,
      city: true,
      state: true,
      country: true,
      shortBio: true,
      achievements: true,
      yearsExperience: true,
      websiteUrl: true,
      socialLinks: true,
      photoUrl: true,
      photoCredit: true,
      videoUrl: true,
      badge: true,
      awards: true,
      awardTitle: true,
      awardYear: true,
      sourceUrl: true,
      sourceName: true,
      userId: true,
      publishedAt: true,
      updatedAt: true,
    },
  });
  const headers = {
    "access-control-allow-origin": "*",
    "cache-control": "public, s-maxage=600, stale-while-revalidate=3600",
  };
  if (!entry) return NextResponse.json(null, { status: 404, headers });
  const { userId, ...rest } = entry;
  const base = siteUrl();
  return NextResponse.json(
    {
      ...rest,
      claimed: userId !== null,
      url: `${base}/desi-elite/${entry.slug}`,
      claimUrl: `${base}/desi-elite/${entry.slug}?claim=1`,
    },
    { headers },
  );
}
