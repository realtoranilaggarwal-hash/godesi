"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { isSupportedVideoUrl } from "@/lib/video";

const clipSchema = z.object({
  title: z.string().trim().min(4, "Give the clip a short title").max(70),
  url: z
    .string()
    .trim()
    .url("Paste the full YouTube or Vimeo link")
    .refine(isSupportedVideoUrl, "Only YouTube and Vimeo links are supported"),
  note: z.string().trim().max(90).optional(),
  categorySlug: z.string().trim().max(80).optional(),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

/** Admin: add or update a sidebar clip, sitewide or for one category. */
export async function saveHelpClipAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireAdmin();

    const parsed = clipSchema.safeParse({
      title: formData.get("title"),
      url: formData.get("url"),
      note: formData.get("note") || undefined,
      categorySlug: formData.get("categorySlug") || undefined,
      sortOrder: formData.get("sortOrder") || 0,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const id = String(formData.get("id") ?? "");
    const data = {
      title: parsed.data.title,
      url: parsed.data.url,
      note: parsed.data.note ?? null,
      categorySlug: parsed.data.categorySlug || null,
      sortOrder: parsed.data.sortOrder,
      active: true,
    };

    if (id) await db.helpClip.update({ where: { id }, data });
    else await db.helpClip.create({ data });

    revalidatePath("/admin/help-clips");
    return { success: id ? "Clip updated." : "Clip added." };
  } catch (error) {
    return fieldError(error);
  }
}

export async function toggleHelpClipAction(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const clip = await db.helpClip.findUnique({ where: { id } });
  if (!clip) return;

  await db.helpClip.update({ where: { id }, data: { active: !clip.active } });
  revalidatePath("/admin/help-clips");
}

export async function deleteHelpClipAction(formData: FormData) {
  await requireAdmin();

  await db.helpClip.deleteMany({ where: { id: String(formData.get("id") ?? "") } });
  revalidatePath("/admin/help-clips");
}
