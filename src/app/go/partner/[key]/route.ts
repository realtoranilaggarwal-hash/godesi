import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PARTNER_REF_COOKIE, PARTNER_TIERS } from "@/lib/partnerPackage";

export const dynamic = "force-dynamic";

const BOT_UA = /bot|crawl|spider|slurp|preview|fetch|curl|wget|python|headless|scanner|proofpoint|mimecast|barracuda/i;

/** Partner reminder email link: records the click, then opens the proposal. */
export async function GET(request: Request, { params }: { params: { key: string } }) {
  const tier = new URL(request.url).searchParams.get("tier");
  const target =
    tier && (PARTNER_TIERS as readonly string[]).includes(tier)
      ? `/advertise/proposal?tier=${tier}#pay`
      : "/advertise/proposal";

  if (!BOT_UA.test(request.headers.get("user-agent") ?? "")) {
    const now = new Date();
    await db.partnerFollowUp
      .updateMany({ where: { key: params.key, clickedAt: null }, data: { clickedAt: now } })
      .then(() =>
        db.partnerFollowUp.updateMany({ where: { key: params.key }, data: { clicks: { increment: 1 } } }),
      )
      .catch(() => null);
  }
  const response = NextResponse.redirect(new URL(target, request.url), 302);
  response.cookies.set(PARTNER_REF_COOKIE, params.key, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    maxAge: 60 * 60 * 24 * 60,
    path: "/",
  });
  return response;
}
