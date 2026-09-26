"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { emailEnabled, noAccountEmail, sendEmail } from "@/lib/email";
import { consumeEmailOtp, issueEmailOtp } from "@/lib/otp";
import { canonicalEmail } from "@/lib/signupGuard";

async function findAccount(email: string) {
  return db.user.findFirst({
    where: { OR: [{ email }, { emailCanonical: canonicalEmail(email) }] },
    select: { id: true, email: true, bannedAt: true },
  });
}

/** Step 1: email a reset code. Says the same thing whether the account exists or not. */
export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!z.string().email().safeParse(email).success) {
    return { error: "Enter the email you joined with." };
  }
  if (!emailEnabled()) {
    return {
      error:
        "Password reset emails are not switched on yet — email us and we will sort it out.",
    };
  }

  try {
    const account = await findAccount(email);
    if (account && !account.bannedAt) {
      const result = await issueEmailOtp(account.email);
      if (!result.ok) return { error: result.error };
    } else {
      const { subject, html } = noAccountEmail();
      await sendEmail({ to: email, subject, html });
    }
  } catch (error) {
    return fieldError(error);
  }
  redirect(`/forgot-password?email=${encodeURIComponent(email)}&sent=1`);
}

/** Step 2: code + new password, then signed straight in. */
export async function resetPasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const code = String(formData.get("code") ?? "").replace(/\D/g, "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (code.length !== 6)
    return { error: "Enter the 6-digit code from the email." };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };
  if (password !== confirm) return { error: "The two passwords do not match." };

  try {
    const account = await findAccount(email);
    if (!account || account.bannedAt) {
      return {
        error: "That code is not right — check the email and try again.",
      };
    }
    const result = await consumeEmailOtp(account.email, code);
    if (!result.ok) return { error: result.error };

    await db.user.update({
      where: { id: account.id },
      data: {
        passwordHash: await hashPassword(password),
        emailVerifiedAt: new Date(),
      },
    });
    await createSession(account.id);
  } catch (error) {
    return fieldError(error);
  }
  redirect("/dashboard?password=reset");
}
