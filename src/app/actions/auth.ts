"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import type { Role } from "@prisma/client";
import { type ActionState, fieldError, uniqueViolation } from "@/lib/actions";
import { emailEnabled } from "@/lib/email";
import { issueEmailOtp } from "@/lib/otp";
import { creditReferral } from "@/lib/referrals";
import { welcomeFoundingMember } from "@/lib/founding";
import { canonicalEmail, screenSignup } from "@/lib/signupGuard";
import { normalizeUsername, usernameError } from "@/lib/profiles";

/**
 * A name claimed on the homepage. It is only kept if it is still free when the
 * account is created, so two people racing for one name cannot both get it.
 */
async function claimedUsername(value: FormDataEntryValue | null) {
  const username = normalizeUsername(typeof value === "string" ? value : "");
  if (!username || usernameError(username)) return null;
  const taken = await db.user.findUnique({
    where: { username },
    select: { id: true },
  });
  return taken ? null : username;
}

/** The visitor's address, as Vercel forwards it. */
function clientIp() {
  const forwarded = headers().get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || null;
}

/** Only same-site paths may be used as a post-auth destination. */
function safeNext(value: FormDataEntryValue | null) {
  const raw = typeof value === "string" ? value : "";
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : null;
}

const signupSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  /// PROFESSIONAL is a BUSINESS account whose card is an individual, not a shop.
  role: z.enum(["BUSINESS", "PROFESSIONAL", "CLIENT"]),
});

export async function signupAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let target = "/dashboard";
  try {
    const parsed = signupSchema.safeParse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0].message };
    }
    const email = parsed.data.email.toLowerCase();
    const ip = clientIp();
    const verdict = await screenSignup({
      name: parsed.data.name,
      email,
      ip,
      trap: String(formData.get("website") ?? ""),
    });
    if (!verdict.ok) return { error: verdict.reason };

    const role: Role = parsed.data.role === "CLIENT" ? "CLIENT" : "BUSINESS";
    const claimed = await claimedUsername(formData.get("username"));
    const account = {
      name: parsed.data.name.trim(),
      email,
      emailCanonical: canonicalEmail(email),
      signupIp: ip,
      role,
      passwordHash: await hashPassword(parsed.data.password),
    };

    // The name may be gone between the check and the insert. Losing that race
    // must not lose the signup, so the account is created without a name and
    // the member picks another one on their profile.
    let username = claimed;
    let user = await db.user
      .create({ data: { ...account, username } })
      .catch((error: unknown) => {
        if (username && uniqueViolation(error)) return null;
        throw error;
      });
    if (!user) {
      username = null;
      user = await db.user.create({ data: { ...account, username: null } });
    }
    await createSession(user.id);
    cookies().set("godesi_joined", "1", { path: "/", maxAge: 300, sameSite: "lax" });
    await creditReferral(user.id);
    await welcomeFoundingMember(user.id);

    if (emailEnabled()) {
      await issueEmailOtp(email);
      target = "/verify-email";
    } else {
      const home = username
        ? "/dashboard/me"
        : parsed.data.role === "CLIENT"
          ? "/leads/new"
          : parsed.data.role === "PROFESSIONAL"
            ? "/dashboard/profile?type=professional"
            : "/dashboard/profile";
      target = safeNext(formData.get("next")) ?? home;
    }
  } catch (error) {
    return fieldError(error);
  }
  redirect(target);
}

export async function loginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let target = "/dashboard";
  try {
    const email = String(formData.get("email") ?? "").toLowerCase();
    const password = String(formData.get("password") ?? "");
    const user = await db.user.findUnique({ where: { email } });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return { error: "Invalid email or password." };
    }
    if (user.bannedAt) {
      return {
        error:
          "This account has been suspended. Email support if you think that is a mistake.",
      };
    }
    await createSession(user.id);
    target =
      safeNext(formData.get("next")) ??
      (user.role === "ADMIN" ? "/admin" : "/dashboard");
  } catch (error) {
    return fieldError(error);
  }
  redirect(target);
}

export async function logoutAction() {
  destroySession();
  redirect("/");
}
