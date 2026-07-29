import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  facebookAuthEnabled,
  facebookAuthorizeUrl,
} from "@/lib/facebookAuth";

export const dynamic = "force-dynamic";

/** Starts the Facebook sign-in flow; `next` survives the round trip in a cookie. */
export async function GET(request: Request) {
  if (!facebookAuthEnabled()) {
    return NextResponse.redirect(new URL("/login?error=facebook", request.url));
  }

  const requested = new URL(request.url).searchParams.get("next") ?? "";
  const next =
    requested.startsWith("/") && !requested.startsWith("//") ? requested : "";
  const state = randomBytes(16).toString("hex");

  cookies().set("facebook_oauth", `${state}|${next}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(facebookAuthorizeUrl(state));
}
