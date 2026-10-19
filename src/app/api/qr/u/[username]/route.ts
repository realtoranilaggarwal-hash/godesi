import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { siteUrl } from "@/lib/format";
import { effectivePlan } from "@/lib/plans";
import { normalizeUsername } from "@/lib/profiles";
import { brandedQr } from "@/lib/qrBrand";

/** Personal QR code: scanning it opens godesi.com/<username>. */
export async function GET(
  request: Request,
  { params }: { params: { username: string } },
) {
  const username = normalizeUsername(decodeURIComponent(params.username));
  const user = await db.user.findUnique({
    where: { username },
    select: { username: true, name: true, plan: true, planExpiresAt: true },
  });
  if (!user?.username) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return brandedQr({
    target: `${siteUrl()}/${user.username}?src=qr`,
    style: "personal",
    name: user.name,
    featured: effectivePlan(user) === "PREMIUM",
    filename: `godesi-${user.username}-qr.png`,
    download: new URL(request.url).searchParams.get("download") === "1",
  });
}
