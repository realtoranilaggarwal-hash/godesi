import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { googleAuthEnabled, googleAuthorizeUrl } from "@/lib/googleAuth";

export const dynamic = "force-dynamic";

/** Starts the Google sign-in flow; `next` survives the round trip in a cookie. */
export async function GET(request: Request) {
  if (!googleAuthEnabled()) {
    return NextResponse.redirect(new URL("/login?error=google", request.url));
  }

  const requested = new URL(request.url).searchParams.get("next") ?? "";
  const next = requested.startsWith("/") && !requested.startsWith("//") ? requested : "";
  const state = randomBytes(16).toString("hex");

  cookies().set("google_oauth", `${state}|${next}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 600,
  });

  return NextResponse.redirect(googleAuthorizeUrl(state));
}
