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
      },
    });
    revalidatePath(`/b/${business.slug}`);
    return { success: "Thanks for your review!" };
  } catch (error) {
    return fieldError(error);
  }
}
