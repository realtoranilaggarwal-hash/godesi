import type { User } from "@prisma/client";
import { db } from "@/lib/db";
import { findBlockedTerm } from "@/lib/moderation";

/** Anything that reads like spam still waits for a human. */
const SPAM_TERMS = [
  "make money fast",
  "work from home earn",
  "bitcoin investment",
  "crypto investment",
  "forex signals",
  "casino",
  "betting id",
  "loan without documents",
  "buy followers",
  "seo backlinks cheap",
];

const LINK = /https?:\/\/|www\./gi;

/**
 * Members who confirmed their email publish straight away — the desk only sees
 * what looks unsafe, so nobody waits on a manual approval to go live.
 */
export function autoApproveStatus(
  user: Pick<User, "emailVerifiedAt" | "role">,
  text: string,
): "APPROVED" | "PENDING" {
  if (user.role === "ADMIN" || user.role === "MODERATOR") return "APPROVED";
  if (!user.emailVerifiedAt) return "PENDING";
  return needsReview(text) ? "PENDING" : "APPROVED";
}

/** Blocked wording, obvious spam pitches, or a wall of links. */
export function needsReview(text: string) {
  const lower = text.toLowerCase();
  if (findBlockedTerm(lower)) return true;
  if (SPAM_TERMS.some((term) => lower.includes(term))) return true;
  return (lower.match(LINK) ?? []).length > 6;
}

/** A listing held only because the email was unconfirmed publishes on verify. */
export async function publishAfterVerification(userId: string) {
  const business = await db.business.findUnique({
    where: { ownerId: userId },
    select: {
      id: true,
      name: true,
      description: true,
      category: true,
      status: true,
    },
  });
  if (!business || business.status !== "PENDING") return;
  const text = [business.name, business.description, business.category].join(
    " ",
  );
  if (needsReview(text)) return;
  await db.business.update({
    where: { id: business.id },
    data: { status: "APPROVED" },
  });
}
