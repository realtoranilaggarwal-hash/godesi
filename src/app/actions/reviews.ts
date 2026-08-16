"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { can, getCurrentUser, requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { requestCurrency } from "@/lib/currency";
import { disputeFee } from "@/lib/reviewDisputes";
import { siteUrl, toMinor } from "@/lib/format";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { awardPoints } from "@/lib/rewards";
import { REVIEW_SOURCES } from "@/lib/reviewSources";

const reviewSchema = z.object({
  businessId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  authorName: z.string().trim().min(2, "Please enter your name"),
  comment: z.string().trim().max(1000).optional(),
  localKnowledge: z.coerce.number().int().min(1).max(5).optional(),
  processExpertise: z.coerce.number().int().min(1).max(5).optional(),
  responsiveness: z.coerce.number().int().min(1).max(5).optional(),
  negotiation: z.coerce.number().int().min(1).max(5).optional(),
});

export async function createReviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await getCurrentUser();
    const parsed = reviewSchema.safeParse({
      businessId: formData.get("businessId"),
      rating: formData.get("rating"),
      authorName: formData.get("authorName") || user?.name,
      comment: formData.get("comment"),
      localKnowledge: formData.get("localKnowledge") || undefined,
      processExpertise: formData.get("processExpertise") || undefined,
      responsiveness: formData.get("responsiveness") || undefined,
      negotiation: formData.get("negotiation") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    if (formData.get("acceptTerms") !== "on") {
      return {
        error:
          "Please confirm this is your own honest experience — knowingly false reviews can have legal consequences.",
      };
    }

    const business = await db.business.findUnique({
      where: { id: parsed.data.businessId },
    });
    if (!business) return { error: "Business not found." };
    if (user && business.ownerId === user.id) {
      return { error: "You cannot review your own business." };
    }

    const review = await db.review.create({
      data: {
        businessId: business.id,
        authorId: user?.id ?? null,
        authorName: parsed.data.authorName,
        rating: parsed.data.rating,
        comment: parsed.data.comment || null,
        localKnowledge: parsed.data.localKnowledge ?? null,
        processExpertise: parsed.data.processExpertise ?? null,
        responsiveness: parsed.data.responsiveness ?? null,
        negotiation: parsed.data.negotiation ?? null,
      },
    });
    if (user) {
      await awardPoints({
        userId: user.id,
        reason: "REVIEW_POSTED",
        note: `Review of ${business.name}`,
        key: review.id,
      });
    }

    revalidatePath(`/b/${business.slug}`);
    return { success: "Thanks for your review!" };
  } catch (error) {
    return fieldError(error);
  }
}

/** Staff: take a review off the public card (or put it back), keeping the row for audit. */
export async function setReviewHiddenAction(formData: FormData) {
  const user = await requireUser();
  if (!can(user, "reviews")) throw new Error("FORBIDDEN");

  const id = String(formData.get("reviewId") ?? "");
  const hidden = formData.get("hidden") === "1";
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 300);

  const review = await db.review.update({
    where: { id },
    data: { hidden, hiddenReason: hidden ? reason || "Removed by Godesi staff" : null },
    include: { business: { select: { slug: true } } },
  });

  revalidatePath("/admin/reviews");
  revalidatePath(`/b/${review.business.slug}`);
}

/** Staff: delete a review outright, for spam and abuse that should leave no trace. */
export async function deleteReviewAction(formData: FormData) {
  const user = await requireUser();
  if (!can(user, "reviews")) throw new Error("FORBIDDEN");

  const id = String(formData.get("reviewId") ?? "");
  const review = await db.review.findUnique({
    where: { id },
    include: { business: { select: { slug: true } } },
  });
  if (!review) return;

  await db.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  revalidatePath(`/b/${review.business.slug}`);
}

/**
 * Card owner: ask staff to remove a review. The fee is charged up front for the
 * review of the request; paying it does not guarantee removal.
 */
export async function startReviewDisputeAction(formData: FormData) {
  const user = await requireUser();
  const reviewId = String(formData.get("reviewId") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  const review = await db.review.findUnique({
    where: { id: reviewId },
    include: { business: { select: { slug: true, ownerId: true } } },
  });
  if (!review) redirect("/dashboard?error=review_missing");
  if (review.business.ownerId !== user.id) {
    redirect(`/b/${review.business.slug}?error=not_your_card`);
  }
  if (reason.length < 20) {
    redirect(`/dashboard/reviews?error=reason#review-${reviewId}`);
  }

  const open = await db.reviewDispute.findFirst({
    where: { reviewId, status: { in: ["AWAITING_PAYMENT", "PENDING"] } },
  });
  if (open) redirect("/dashboard/reviews?error=already_open");

  const currency = requestCurrency();
  const feeMinor = toMinor(disputeFee(currency));
  const dispute = await db.reviewDispute.create({
    data: {
      reviewId,
      raisedById: user.id,
      reason: reason.slice(0, 1500),
      feeMinor,
      feeCurrency: currency,
    },
  });

  if (!stripeEnabled()) redirect("/dashboard/reviews?error=stripe_unavailable");

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: { kind: "review-dispute", reviewDisputeId: dispute.id, userId: user.id },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: currency.toLowerCase(),
          unit_amount: feeMinor,
          product_data: {
            name: "Godesi review takedown request",
            description:
              "Fee for staff to review a disputed review. The fee covers the review, not the outcome.",
          },
        },
      },
    ],
    success_url: `${siteUrl()}/dashboard/reviews?paid=1`,
    cancel_url: `${siteUrl()}/dashboard/reviews?error=cancelled`,
  });

  if (!session.url) redirect("/dashboard/reviews?error=stripe_session");
  redirect(session.url);
}

/** Staff: decide a paid takedown request; approving hides the review. */
export async function decideReviewDisputeAction(formData: FormData) {
  const user = await requireUser();
  if (!can(user, "reviews")) throw new Error("FORBIDDEN");

  const id = String(formData.get("disputeId") ?? "");
  const approve = formData.get("decision") === "approve";
  const note = String(formData.get("note") ?? "").trim().slice(0, 500);

  const dispute = await db.reviewDispute.findUnique({
    where: { id },
    include: { review: { include: { business: { select: { slug: true } } } } },
  });
  if (!dispute) return;

  await db.reviewDispute.update({
    where: { id },
    data: {
      status: approve ? "APPROVED" : "REJECTED",
      decisionNote: note || null,
      decidedAt: new Date(),
    },
  });

  if (approve) {
    await db.review.update({
      where: { id: dispute.reviewId },
      data: {
        hidden: true,
        hiddenReason: note || "Removed after a successful takedown request",
      },
    });
  }

  revalidatePath("/admin/reviews");
  revalidatePath(`/b/${dispute.review.business.slug}`);
}

const offsiteSchema = z.object({
  businessSlug: z.string().trim().min(1, "Enter the business page slug"),
  authorName: z.string().trim().min(2, "Enter the customer's name"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(5, "Paste what the customer wrote"),
  source: z.enum(REVIEW_SOURCES),
});

/**
 * Staff enter a review a customer sent over WhatsApp or email. It is labelled
 * as such on the card, and the customer must have agreed to it being published
 * — we publish the words and a first name, never their number.
 */
export async function addOffsiteReviewAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    if (!can(user, "reviews")) return { error: "Not allowed." };

    const parsed = offsiteSchema.safeParse({
      businessSlug: formData.get("businessSlug"),
      authorName: formData.get("authorName"),
      rating: formData.get("rating"),
      comment: formData.get("comment"),
      source: formData.get("source"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    if (formData.get("consent") !== "on") {
      return {
        error:
          "Confirm the customer agreed to their words being published on Godesi.",
      };
    }

    const slug = parsed.data.businessSlug.trim().replace(/^.*\/b\//, "");
    const business = await db.business.findUnique({ where: { slug } });
    if (!business)
      return { error: `No business page found at /b/${slug}.` };

    if (/\+?\d[\d\s()-]{7,}/.test(parsed.data.comment)) {
      return {
        error: "Remove the phone number from the review text before saving.",
      };
    }

    await db.review.create({
      data: {
        businessId: business.id,
        authorName: parsed.data.authorName,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        source: parsed.data.source,
        addedById: user.id,
        consentAt: new Date(),
      },
    });

    revalidatePath(`/b/${business.slug}`);
    revalidatePath("/admin/reviews");
    return { success: `Added to ${business.name}.` };
  } catch (error) {
    return fieldError(error);
  }
}
