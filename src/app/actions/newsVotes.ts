"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser, requirePermission } from "@/lib/auth";
import { awardPoints } from "@/lib/rewards";

/** Up/down vote on a published story; voting again on the same side clears it. */
export async function voteNewsAction(formData: FormData) {
  const user = await requireUser();
  const newsId = String(formData.get("id") ?? "");
  const value = Number(formData.get("value") ?? 0) > 0 ? 1 : -1;

  const item = await db.newsItem.findUnique({ where: { id: newsId } });
  if (!item || item.status !== "PUBLISHED") return;

  const existing = await db.newsVote.findUnique({
    where: { newsId_userId: { newsId, userId: user.id } },
  });

  if (existing?.value === value) {
    await db.newsVote.delete({ where: { id: existing.id } });
  } else if (existing) {
    await db.newsVote.update({ where: { id: existing.id }, data: { value } });
  } else {
    await db.newsVote.create({ data: { newsId, userId: user.id, value } });
  }

  const totals = await db.newsVote.aggregate({
    where: { newsId },
    _sum: { value: true },
  });
  const score = totals._sum.value ?? 0;
  await db.newsItem.update({ where: { id: newsId }, data: { score } });

  // Contributors earn once their story reaches five net upvotes.
  if (item.submittedById && score >= 5) {
    await awardPoints({
      userId: item.submittedById,
      reason: "NEWS_UPVOTED",
      note: item.title,
      key: item.id,
    }).catch(() => null);
  }

  revalidatePath("/news");
}

/** Editor's pick — pins a story to the top of /news and rewards the poster. */
export async function featureNewsAction(formData: FormData) {
  await requirePermission("news");
  const id = String(formData.get("id") ?? "");
  const item = await db.newsItem.findUnique({ where: { id } });
  if (!item) return;

  await db.newsItem.update({ where: { id }, data: { featured: !item.featured } });

  if (!item.featured && item.submittedById) {
    await awardPoints({
      userId: item.submittedById,
      reason: "NEWS_FEATURED",
      note: `Editor's pick: ${item.title}`,
      key: item.id,
    }).catch(() => null);
  }

  revalidatePath("/news");
  revalidatePath("/admin/content");
}
