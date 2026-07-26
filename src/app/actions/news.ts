"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { effectivePlan } from "@/lib/plans";
import { twoLineSummary } from "@/lib/news";

const newsSchema = z.object({
  title: z.string().trim().min(8, "Give the story a headline"),
  summary: z.string().trim().min(20, "Write a short summary (20+ characters)"),
  link: z.string().trim().url("Enter a valid article URL"),
  imageUrl: z
    .string()
    .trim()
    .url("Enter a valid image URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
});

/** Admins publish directly; Pro/Premium members submit for review. */
export async function submitNewsAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const isAdmin = user.role === "ADMIN";
    if (!isAdmin && effectivePlan(user) === "FREE") {
      return { error: "News submission is available to Pro and Premium members." };
    }

    const parsed = newsSchema.safeParse({
      title: formData.get("title"),
      summary: formData.get("summary"),
      link: formData.get("link"),
      imageUrl: formData.get("imageUrl"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const duplicate = await db.newsItem.findUnique({ where: { guid: parsed.data.link } });
    if (duplicate) return { error: "That story has already been submitted." };

    await db.newsItem.create({
      data: {
        guid: parsed.data.link,
        title: parsed.data.title,
        summary: twoLineSummary(parsed.data.summary),
        link: parsed.data.link,
        imageUrl: parsed.data.imageUrl ?? null,
        source: isAdmin ? "Godesi" : user.name,
        submittedById: user.id,
        status: isAdmin ? "PUBLISHED" : "PENDING",
      },
    });

    revalidatePath("/news");
    return {
      success: isAdmin
        ? "Story published."
        : "Thanks! Your story is queued for review by our team.",
    };
  } catch (error) {
    return fieldError(error);
  }
}
