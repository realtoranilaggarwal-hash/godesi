import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { fetchGoogleProfile, googleAuthEnabled } from "@/lib/googleAuth";
import { creditReferral } from "@/lib/referrals";
import { welcomeFoundingMember } from "@/lib/founding";
import { canonicalEmail } from "@/lib/signupGuard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const failure = NextResponse.redirect(new URL("/login?error=google", url));
  if (!googleAuthEnabled()) return failure;

  const stored = cookies().get("google_oauth")?.value ?? "";
  cookies().delete("google_oauth");
  const [state, next = ""] = stored.split("|");
  const code = url.searchParams.get("code");
  if (!code || !state || url.searchParams.get("state") !== state) return failure;

  const profile = await fetchGoogleProfile(code);
  if (!profile) return failure;

  const suspended = NextResponse.redirect(
    new URL("/login?error=suspended", url),
  );

  const existing = await db.user.findUnique({ where: { email: profile.email } });
  const user =
    existing ??
    (await db.user.create({
      data: {
        email: profile.email,
        emailCanonical: canonicalEmail(profile.email),
        name: profile.name ?? profile.email.split("@")[0],
        // Google accounts sign in without a password; a random hash blocks password login.
        passwordHash: await hashPassword(randomBytes(32).toString("hex")),
        avatarUrl: profile.picture,
        emailVerifiedAt: profile.emailVerified ? new Date() : null,
      },
    }));

  if (user.bannedAt) return suspended;

  if (!existing) {
    await creditReferral(user.id);
    await welcomeFoundingMember(user.id);
  }
  if (existing && profile.emailVerified && !existing.emailVerifiedAt) {
    await db.user.update({
      where: { id: existing.id },
      data: { emailVerifiedAt: new Date() },
    });
  }

  await createSession(user.id);

  const target = next || (user.role === "ADMIN" ? "/admin" : "/dashboard");
  return NextResponse.redirect(new URL(target, url));
}
