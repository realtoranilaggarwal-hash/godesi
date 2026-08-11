"use server";

import { revalidatePath } from "next/cache";
import { invalidateDirectory } from "@/lib/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { emailEnabled } from "@/lib/email";
import { consumeEmailOtp, issueEmailOtp } from "@/lib/otp";
import { publishAfterVerification } from "@/lib/autoApprove";
import { type ActionState, fieldError } from "@/lib/actions";

export async function sendEmailOtpAction(): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in first." };
  if (user.emailVerifiedAt)
    return { success: "Your email is already verified." };
  if (!emailEnabled()) return { error: "Email sending is not configured yet." };

  const result = await issueEmailOtp(user.email);
  if (!result.ok) return { error: result.error };
  return result.delivered
    ? { success: `We sent a 6-digit code to ${user.email}.` }
    : {
        error:
          "We could not send the email just now — please try again shortly.",
      };
}

export async function verifyEmailOtpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in first." };

  if (!user.emailVerifiedAt) {
    const code = String(formData.get("code") ?? "").replace(/\D/g, "");
    if (code.length !== 6)
      return { error: "Enter the 6-digit code from the email." };

    try {
      const result = await consumeEmailOtp(user.email, code);
      if (!result.ok) return { error: result.error };
      await db.user.update({
        where: { id: user.id },
        data: { emailVerifiedAt: new Date() },
      });
      await publishAfterVerification(user.id);
    } catch (error) {
      return fieldError(error);
    }
  }

  revalidatePath("/dashboard");
  invalidateDirectory();
  redirect("/dashboard?verified=1");
}
