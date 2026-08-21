"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { cleanTag } from "@/lib/hashtag";

const topicSchema = z.object({
  label: z
    .string()
    .trim()
    .min(2, "Give the box a name of at least 2 characters.")
    .max(40, "Keep the box name under 40 characters."),
  query: z
    .string()
    .trim()
    .min(2, "Give the box a keyword of at least 2 characters.")
    .max(60, "Keep the keyword under 60 characters."),
  emoji: z.string().trim().max(4, "Use a single emoji, or none.").optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

function refresh() {
  revalidatePath("/wall");
  revalidatePath("/admin/wall");
}

/**
 * A rejected save drops the whole row edit, so it has to say so — otherwise it
 * is indistinguishable from a successful one.
 */
function reject(reason: string): never {
  redirect(`/admin/wall?error=${encodeURIComponent(reason)}`);
}

export async function saveWallTopicAction(formData: FormData) {
  await requirePermission("news");
  const parsed = topicSchema.safeParse({
    label: formData.get("label"),
    query: formData.get("query"),
    emoji: formData.get("emoji") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) {
    reject(
      parsed.error.issues[0]?.message ??
        "Check the label (2–40 characters), keyword (2–60) and emoji (1 symbol).",
    );
  }

  // The same cleaning the public search box applies, so an admin cannot save a
  // keyword the sources would reject.
  const query = cleanTag(parsed.data.query);
  if (!query) reject("That keyword has no letters or numbers to search for.");

  const id = String(formData.get("id") ?? "");
  const data = {
    label: parsed.data.label,
    query,
    emoji: parsed.data.emoji ?? null,
    sortOrder: parsed.data.sortOrder,
  };

  if (id) await db.wallTopic.update({ where: { id }, data });
  else await db.wallTopic.create({ data });
  refresh();
}

export async function toggleWallTopicAction(formData: FormData) {
  await requirePermission("news");
  const id = String(formData.get("id") ?? "");
  const topic = await db.wallTopic.findUnique({ where: { id } });
  if (!topic) return;
  await db.wallTopic.update({
    where: { id },
    data: { active: !topic.active },
  });
  refresh();
}

export async function deleteWallTopicAction(formData: FormData) {
  await requirePermission("news");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.wallTopic.delete({ where: { id } });
  refresh();
}
