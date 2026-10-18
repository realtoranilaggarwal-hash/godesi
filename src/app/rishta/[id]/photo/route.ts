import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { canSeeRishtaPhoto } from "@/lib/rishta";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const [profile, viewer] = await Promise.all([
    db.rishtaProfile.findUnique({
      where: { id: params.id },
      select: {
        userId: true,
        photoUrl: true,
        hidePhoto: true,
        status: true,
        visible: true,
      },
    }),
    getCurrentUser(),
  ]);
  const privileged =
    viewer && (viewer.id === profile?.userId || viewer.role === "ADMIN");
  if (
    !profile?.photoUrl ||
    !canSeeRishtaPhoto(profile, viewer) ||
    (!privileged && (profile.status !== "APPROVED" || !profile.visible))
  ) {
    return new NextResponse(null, { status: 404 });
  }
  const upstream = await fetch(profile.photoUrl, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return new NextResponse(null, { status: 404 });
  }
  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": upstream.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
