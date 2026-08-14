"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { cleanTag } from "@/lib/hashtag";

const topicSchema = z.object({
  label: z.string().trim().min(2).max(40),
  query: z.string().trim().min(2).max(60),
  emoji: z.string().trim().max(4).optional(),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

function refresh() {
  revalidatePath("/wall");
  revalidatePath("/admin/wall");
}

export async function saveWallTopicAction(formData: FormData) {
  await requirePermission("news");
  const parsed = topicSchema.safeParse({
    label: formData.get("label"),
    query: formData.get("query"),
    emoji: formData.get("emoji") || undefined,
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) return;

  // The same cleaning the public search box applies, so an admin cannot save a
  // keyword the sources would reject.
  const query = cleanTag(parsed.data.query);
  if (!query) return;

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
