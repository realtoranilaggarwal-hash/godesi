import { createHash, randomInt } from "crypto";
import { db } from "@/lib/db";
import { otpEmail, sendEmail } from "@/lib/email";

const TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 6;
/** A fresh code can only be requested once per minute per address. */
const RESEND_COOLDOWN_MS = 60 * 1000;

function hash(code: string) {
  return createHash("sha256").update(code).digest("hex");
}

export type OtpIssueResult =
  | { ok: true; delivered: boolean }
  | { ok: false; error: string };

/** Creates a one-time code for `email` and mails it out. */
export async function issueEmailOtp(email: string): Promise<OtpIssueResult> {
  const recent = await db.emailOtp.findFirst({
    where: { email, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
    orderBy: { createdAt: "desc" },
  });
  if (recent) {
    return { ok: false, error: "We just sent a code — please wait a minute before asking for another." };
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await db.emailOtp.deleteMany({ where: { email, usedAt: null } });
  await db.emailOtp.create({
    data: { email, codeHash: hash(code), expiresAt: new Date(Date.now() + TTL_MS) },
  });

  const { subject, html } = otpEmail(code);
  const delivered = await sendEmail({ to: email, subject, html });
  return { ok: true, delivered };
}

export type OtpCheckResult = { ok: true } | { ok: false; error: string };

/** Consumes a code for `email`, counting failed attempts to slow guessing. */
export async function consumeEmailOtp(email: string, code: string): Promise<OtpCheckResult> {
  const record = await db.emailOtp.findFirst({
    where: { email, usedAt: null },
    orderBy: { createdAt: "desc" },
  });
  if (!record) return { ok: false, error: "That code has expired — request a new one." };
  if (record.expiresAt < new Date()) {
    return { ok: false, error: "That code has expired — request a new one." };
  }
  if (record.attempts >= MAX_ATTEMPTS) {
    return { ok: false, error: "Too many wrong attempts — request a new code." };
  }
  if (record.codeHash !== hash(code.trim())) {
    await db.emailOtp.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: "That code is not right — check the email and try again." };
  }

  await db.emailOtp.update({ where: { id: record.id }, data: { usedAt: new Date() } });
  return { ok: true };
}
