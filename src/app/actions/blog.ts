"use server";

import { revalidatePath } from "next/cache";
import { pingIndexNowInBackground } from "@/lib/indexNow";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { uniqueBlogSlug } from "@/lib/blog";

const postSchema = z.object({
  title: z.string().trim().min(4, "Give the post a title").max(140),
  excerpt: z.string().trim().max(200).optional(),
  body: z.string().trim().min(20, "Write at least a couple of sentences"),
  coverUrl: z
    .string()
    .trim()
    .url("Enter a valid image URL")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  tags: z.string().trim().max(200).optional(),
  kind: z.enum(["POST", "UPDATE"]),
  published: z.boolean(),
});

function readTags(value?: string) {
  const seen = new Set<string>();
  for (const raw of (value ?? "").split(",")) {
    const tag = raw.trim().replace(/^#/, "").slice(0, 30).toLowerCase();
    if (tag) seen.add(tag);
    if (seen.size >= 8) break;
  }
  return Array.from(seen);
}

export async function saveBlogPostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requirePermission("blog");

    const parsed = postSchema.safeParse({
      title: formData.get("title"),
      excerpt: formData.get("excerpt") ?? undefined,
      body: formData.get("body"),
      coverUrl: formData.get("coverUrl") ?? undefined,
      tags: formData.get("tags") ?? undefined,
      kind: formData.get("kind") ?? "POST",
      published: formData.get("published") !== null,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const id = String(formData.get("id") ?? "");
    const data = {
      title: parsed.data.title,
      excerpt: parsed.data.excerpt ?? null,
      body: parsed.data.body,
      coverUrl: parsed.data.coverUrl ?? null,
      tags: readTags(parsed.data.tags),
      kind: parsed.data.kind,
      published: parsed.data.published,
    };

    const post = id
      ? await db.blogPost.update({ where: { id }, data })
      : await db.blogPost.create({
          data: {
            ...data,
            slug: await uniqueBlogSlug(parsed.data.title),
            authorId: user.id,
          },
        });

    revalidatePath("/blog");
    revalidatePath("/admin");
    if (post.published) pingIndexNowInBackground(`/blog/${post.slug}`);
    return { success: id ? "Post updated." : "Post published." };
  } catch (error) {
    return fieldError(error);
  }
}

export async function deleteBlogPostAction(formData: FormData) {
  await requirePermission("blog");
  await db.blogPost.delete({ where: { id: String(formData.get("id") ?? "") } });
  revalidatePath("/blog");
  revalidatePath("/admin");
}

export async function toggleBlogPostAction(formData: FormData) {
  await requirePermission("blog");
  const id = String(formData.get("id") ?? "");
  const post = await db.blogPost.findUnique({ where: { id } });
  if (!post) return;
  await db.blogPost.update({
    where: { id },
    data: { published: !post.published },
  });
  if (!post.published) pingIndexNowInBackground(`/blog/${post.slug}`);
  revalidatePath("/blog");
  revalidatePath("/admin");
}
