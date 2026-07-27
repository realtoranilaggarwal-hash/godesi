"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";

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

    const business = await db.business.findUnique({
      where: { id: parsed.data.businessId },
    });
    if (!business) return { error: "Business not found." };
    if (user && business.ownerId === user.id) {
      return { error: "You cannot review your own business." };
    }

    await db.review.create({
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
    revalidatePath(`/b/${business.slug}`);
    return { success: "Thanks for your review!" };
  } catch (error) {
    return fieldError(error);
  }
}
