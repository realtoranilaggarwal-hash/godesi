"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { handleFromUrl, platformFromUrl } from "@/lib/social";

async function requireSocialStaff() {
  const user = await requireUser();
  if (!can(user, "blog")) throw new Error("FORBIDDEN");
  return user;
}

/** Adds a real #godesi post to the social wall from its public link. */
export async function addSocialPostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireSocialStaff();
    const url = String(formData.get("url") ?? "").trim();
    const author = String(formData.get("author") ?? "").trim().slice(0, 80);
    const text = String(formData.get("text") ?? "").trim().slice(0, 400);
    const handle = String(formData.get("handle") ?? "").trim().slice(0, 40);
    const imageUrl = String(formData.get("imageUrl") ?? "").trim();
    const postedAt = String(formData.get("postedAt") ?? "").trim();

    if (!/^https?:\/\//i.test(url)) return { error: "Paste the link to the post." };
    if (author.length < 2) return { error: "Who posted it?" };
    if (text.length < 10) return { error: "Add a line or two from the post." };

    await db.socialPost.upsert({
      where: { url },
      create: {
        url,
        platform: platformFromUrl(url),
        author,
        handle: handle || handleFromUrl(url),
        text,
        imageUrl: imageUrl || null,
        postedAt: postedAt ? new Date(postedAt) : new Date(),
      },
      update: {
        author,
        handle: handle || handleFromUrl(url),
        text,
        imageUrl: imageUrl || null,
        active: true,
        ...(postedAt ? { postedAt: new Date(postedAt) } : {}),
      },
    });

    revalidatePath("/admin/content");
    revalidatePath("/buzz");
    return { success: "Added to the #godesi wall." };
  } catch (error) {
    return fieldError(error);
  }
}

export async function toggleSocialPostAction(formData: FormData) {
  await requireSocialStaff();
  const id = String(formData.get("id") ?? "");
  const post = await db.socialPost.findUnique({ where: { id } });
  if (!post) return;
  await db.socialPost.update({ where: { id }, data: { active: !post.active } });
  revalidatePath("/admin/content");
  revalidatePath("/buzz");
}

export async function deleteSocialPostAction(formData: FormData) {
  await requireSocialStaff();
  const id = String(formData.get("id") ?? "");
  await db.socialPost.deleteMany({ where: { id } });
  revalidatePath("/admin/content");
  revalidatePath("/buzz");
}
