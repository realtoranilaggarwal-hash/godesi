"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { emailEnabled } from "@/lib/email";
import { issueEmailOtp } from "@/lib/otp";
import { creditReferral } from "@/lib/referrals";

/** Only same-site paths may be used as a post-auth destination. */
function safeNext(value: FormDataEntryValue | null) {
  const raw = typeof value === "string" ? value : "";
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : null;
}

const signupSchema = z.object({
  name: z.string().min(2, "Please enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["BUSINESS", "CLIENT"]),
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
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return { error: "An account with this email already exists." };

    const user = await db.user.create({
      data: {
        name: parsed.data.name,
        email,
        role: parsed.data.role,
        passwordHash: await hashPassword(parsed.data.password),
      },
    });
    await createSession(user.id);
    await creditReferral(user.id);

    if (emailEnabled()) {
      await issueEmailOtp(email);
      target = "/verify-email";
    } else {
      target =
        safeNext(formData.get("next")) ??
        (parsed.data.role === "CLIENT" ? "/leads/new" : "/dashboard/profile");
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
