import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { normalizeUsername } from "@/lib/profiles";
import { siteUrl } from "@/lib/format";
import { REFERRAL_COOKIE } from "@/lib/referrals";

/**
 * Referral entry point: remembers who invited the visitor for 30 days and sends
 * them to signup. Unknown handles simply land on the homepage.
 */
export async function GET(
  _request: Request,
  { params }: { params: { username: string } },
) {
  const username = normalizeUsername(params.username);
  const referrer = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!referrer) return NextResponse.redirect(`${siteUrl()}/`);

  const response = NextResponse.redirect(`${siteUrl()}/signup?ref=${username}`);
  response.cookies.set(REFERRAL_COOKIE, username, {
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}
