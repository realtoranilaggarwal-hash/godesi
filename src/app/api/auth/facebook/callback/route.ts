import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import {
  facebookAuthEnabled,
  fetchFacebookProfile,
} from "@/lib/facebookAuth";
import { creditReferral } from "@/lib/referrals";
import { welcomeFoundingMember } from "@/lib/founding";
import { canonicalEmail } from "@/lib/signupGuard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const failure = NextResponse.redirect(new URL("/login?error=facebook", url));
  if (!facebookAuthEnabled()) return failure;

  const stored = cookies().get("facebook_oauth")?.value ?? "";
  cookies().delete("facebook_oauth");
  const [state, next = ""] = stored.split("|");
  const code = url.searchParams.get("code");
  // Facebook sends the member back with an error when they cancel the dialog.
  if (url.searchParams.get("error")) return failure;
  if (!code || !state || url.searchParams.get("state") !== state) return failure;

  const profile = await fetchFacebookProfile(code);
  if (!profile) {
    return NextResponse.redirect(new URL("/login?error=facebook-email", url));
  }

  const existing = await db.user.findUnique({ where: { email: profile.email } });
  const user =
    existing ??
    (await db.user.create({
      data: {
        email: profile.email,
        emailCanonical: canonicalEmail(profile.email),
        name: profile.name ?? profile.email.split("@")[0],
        // Facebook accounts sign in without a password; a random hash blocks password login.
        passwordHash: await hashPassword(randomBytes(32).toString("hex")),
        avatarUrl: profile.picture,
        // Facebook only releases a verified email address.
        emailVerifiedAt: new Date(),
      },
    }));

  if (user.bannedAt) {
    return NextResponse.redirect(new URL("/login?error=suspended", url));
  }

  if (!existing) {
    await creditReferral(user.id);
    await welcomeFoundingMember(user.id);
  }
  if (existing && !existing.emailVerifiedAt) {
    await db.user.update({
      where: { id: existing.id },
      data: { emailVerifiedAt: new Date() },
    });
  }

  await createSession(user.id);

  const target = next || (user.role === "ADMIN" ? "/admin" : "/dashboard");
  return NextResponse.redirect(new URL(target, url));
}
