"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission, requireUser } from "@/lib/auth";
import { fieldError, uniqueViolation, type ActionState } from "@/lib/actions";
import { findBlockedTerm } from "@/lib/moderation";
import { notify } from "@/lib/notifications";
import { storeImage, uploadsEnabled, validateImage } from "@/lib/uploads";
import { properName } from "@/lib/names";
import {
  CHATTER_AUTO_HIDE_REPORTS,
  CHATTER_MAX,
  CHATTER_RATE,
  chatterExcerpt,
  chatterPath,
  extractHashtags,
  isChatterLanguage,
  isChatterTopic,
} from "@/lib/chatter";

const postSchema = z.object({
  body: z
    .string()
    .trim()
    .min(2, "Write something first.")
    .max(CHATTER_MAX, `Keep it to ${CHATTER_MAX} characters.`),
  topic: z.string().refine(isChatterTopic, "Pick a topic.").default("general"),
  city: z.string().trim().max(60, "City name is too long.").optional(),
  language: z
    .string()
    .refine(isChatterLanguage, "Pick a language.")
    .default("en"),
});

function refreshChatter(...ids: (string | null | undefined)[]) {
  revalidateTag("chatter-feed");
  revalidateTag("chatter-tags");
  revalidateTag("keyword-search");
  revalidatePath("/chatter");
  for (const id of ids) if (id) revalidatePath(chatterPath(id));
}

function blockedWordError(text: string) {
  const term = findBlockedTerm(text);
  return term
    ? "That post has words GoDesi doesn't allow. Please reword it."
    : null;
}

async function rateLimitError(userId: string) {
  for (const rule of CHATTER_RATE) {
    const count = await db.chatterPost.count({
      where: {
        authorId: userId,
        createdAt: { gte: new Date(Date.now() - rule.windowMs) },
      },
    });
    if (count >= rule.max) {
      return `You can post ${rule.max} times per ${rule.label}. Please wait a little and try again.`;
    }
  }
  return null;
}

async function readPhoto(formData: FormData, userId: string) {
  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { url: null };
  if (!uploadsEnabled())
    return { error: "Photo uploads are switched off right now." };
  const invalid = validateImage(file);
  if (invalid) return { error: invalid };
  return {
    url: await storeImage({ file, folder: "chatter", ownerId: userId }),
  };
}

export async function createChatterPostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let createdId: string;
  let parentId: string | null = null;
  try {
    const user = await requireUser();
    if (!user.emailVerifiedAt) {
      return { error: "Verify your email before posting on Chatter." };
    }
    const parsed = postSchema.safeParse({
      body: formData.get("body") ?? "",
      topic: formData.get("topic") || undefined,
      city: formData.get("city") || undefined,
      language: formData.get("language") || undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const blocked = blockedWordError(parsed.data.body);
    if (blocked) return { error: blocked };
    const limited = await rateLimitError(user.id);
    if (limited) return { error: limited };

    const rawParent = String(formData.get("parentId") ?? "").trim();
    let parent: {
      id: string;
      authorId: string;
      topic: string;
      city: string | null;
    } | null = null;
    if (rawParent) {
      parent = await db.chatterPost.findFirst({
        where: { id: rawParent, hiddenAt: null },
        select: { id: true, authorId: true, topic: true, city: true },
      });
      if (!parent) return { error: "That post is no longer available." };
      const blockedByAuthor = await db.chatterBlock.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: parent.authorId,
            blockedId: user.id,
          },
        },
        select: { blockerId: true },
      });
      if (blockedByAuthor) return { error: "You can't reply to this member." };
      parentId = parent.id;
    }

    const photo = await readPhoto(formData, user.id);
    if ("error" in photo) return { error: photo.error };

    const created = await db.$transaction(async (tx) => {
      const post = await tx.chatterPost.create({
        data: {
          authorId: user.id,
          body: parsed.data.body,
          imageUrl: photo.url,
          topic: parent?.topic ?? parsed.data.topic,
          city: parent ? parent.city : parsed.data.city || null,
          language: parsed.data.language,
          tags: extractHashtags(parsed.data.body),
          parentId,
        },
        select: { id: true },
      });
      if (parentId) {
        await tx.chatterPost.update({
          where: { id: parentId },
          data: { replyCount: { increment: 1 } },
        });
      }
      return post;
    });
    createdId = created.id;

    if (parent && parent.authorId !== user.id) {
      await notify({
        userId: parent.authorId,
        title: `${properName(user.name)} replied to your Chatter post`,
        body: chatterExcerpt(parsed.data.body, 120),
        href: chatterPath(parent.id),
      });
    }
    refreshChatter(createdId, parentId);
  } catch (error) {
    return fieldError(error);
  }
  if (parentId) return { success: "Reply posted." };
  redirect(chatterPath(createdId));
}

export async function editChatterPostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const id = String(formData.get("id") ?? "");
    const post = await db.chatterPost.findUnique({
      where: { id },
      select: { authorId: true, parentId: true, topic: true, language: true },
    });
    if (!post || post.authorId !== user.id) {
      return { error: "You can only edit your own posts." };
    }
    const parsed = postSchema.safeParse({
      body: formData.get("body") ?? "",
      topic: formData.get("topic") || post.topic,
      city: formData.get("city") || undefined,
      language: formData.get("language") || post.language,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const blocked = blockedWordError(parsed.data.body);
    if (blocked) return { error: blocked };

    const photo =
      formData.get("removePhoto") === "on"
        ? { url: null }
        : await readPhoto(formData, user.id);
    if ("error" in photo) return { error: photo.error };
    const keepPhoto =
      formData.get("removePhoto") !== "on" && photo.url === null;

    await db.chatterPost.update({
      where: { id },
      data: {
        body: parsed.data.body,
        tags: extractHashtags(parsed.data.body),
        language: parsed.data.language,
        editedAt: new Date(),
        ...(keepPhoto ? {} : { imageUrl: photo.url }),
        ...(post.parentId
          ? {}
          : { topic: parsed.data.topic, city: parsed.data.city || null }),
      },
    });
    if (!post.parentId) {
      await db.chatterPost.updateMany({
        where: { parentId: id },
        data: { topic: parsed.data.topic, city: parsed.data.city || null },
      });
    }
    refreshChatter(id, post.parentId);
    return { success: "Saved." };
  } catch (error) {
    return fieldError(error);
  }
}

export async function deleteChatterPostAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const post = await db.chatterPost.findUnique({
    where: { id },
    select: { authorId: true, parentId: true },
  });
  if (!post || post.authorId !== user.id) return;
  await db.$transaction(async (tx) => {
    await tx.chatterPost.delete({ where: { id } });
    if (post.parentId) {
      await tx.chatterPost.updateMany({
        where: { id: post.parentId, replyCount: { gt: 0 } },
        data: { replyCount: { decrement: 1 } },
      });
    }
  });
  refreshChatter(post.parentId);
  revalidateTag("sitemap-rows");
  redirect(post.parentId ? chatterPath(post.parentId) : "/chatter");
}

export async function toggleChatterLikeAction(formData: FormData) {
  const user = await requireUser();
  const postId = String(formData.get("postId") ?? "");
  const post = await db.chatterPost.findFirst({
    where: { id: postId, hiddenAt: null },
    select: { id: true, parentId: true },
  });
  if (!post) return;
  const existing = await db.chatterLike.findUnique({
    where: { postId_userId: { postId, userId: user.id } },
    select: { postId: true },
  });
  try {
    await db.$transaction(async (tx) => {
      if (existing) {
        await tx.chatterLike.delete({
          where: { postId_userId: { postId, userId: user.id } },
        });
        await tx.chatterPost.updateMany({
          where: { id: postId, likeCount: { gt: 0 } },
          data: { likeCount: { decrement: 1 } },
        });
      } else {
        await tx.chatterLike.create({ data: { postId, userId: user.id } });
        await tx.chatterPost.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
        });
      }
    });
  } catch (error) {
    // A double click races the unique key; the first like already counted.
    if (!uniqueViolation(error)) throw error;
  }
  refreshChatter(post.id, post.parentId);
}

export async function toggleChatterFollowAction(formData: FormData) {
  const user = await requireUser();
  const followingId = String(formData.get("userId") ?? "");
  if (!followingId || followingId === user.id) return;
  const key = { followerId_followingId: { followerId: user.id, followingId } };
  const existing = await db.chatterFollow.findUnique({
    where: key,
    select: { followerId: true },
  });
  if (existing) {
    await db.chatterFollow.delete({ where: key });
  } else {
    const target = await db.user.findFirst({
      where: {
        id: followingId,
        bannedAt: null,
        chatterBlocking: { none: { blockedId: user.id } },
      },
      select: { id: true },
    });
    if (!target) return;
    try {
      await db.chatterFollow.create({
        data: { followerId: user.id, followingId },
      });
    } catch (error) {
      if (!uniqueViolation(error)) throw error;
      return;
    }
    await notify({
      userId: followingId,
      title: `${properName(user.name)} started following you on Chatter`,
      href: "/chatter?feed=following",
    });
  }
  revalidatePath("/chatter");
  const back = String(formData.get("postId") ?? "");
  if (back) revalidatePath(chatterPath(back));
}

export async function blockChatterMemberAction(formData: FormData) {
  const user = await requireUser();
  const blockedId = String(formData.get("userId") ?? "");
  if (!blockedId || blockedId === user.id) return;
  const key = { blockerId_blockedId: { blockerId: user.id, blockedId } };
  const existing = await db.chatterBlock.findUnique({
    where: key,
    select: { blockerId: true },
  });
  if (existing) {
    await db.chatterBlock.delete({ where: key });
  } else {
    await db.$transaction([
      db.chatterBlock.create({ data: { blockerId: user.id, blockedId } }),
      db.chatterFollow.deleteMany({
        where: {
          OR: [
            { followerId: user.id, followingId: blockedId },
            { followerId: blockedId, followingId: user.id },
          ],
        },
      }),
    ]);
  }
  revalidatePath("/chatter");
  const back = String(formData.get("postId") ?? "");
  if (back) revalidatePath(chatterPath(back));
}

const reportSchema = z.object({
  postId: z.string().min(1),
  reason: z
    .string()
    .trim()
    .min(3, "Tell us what is wrong with this post.")
    .max(300, "Keep the reason under 300 characters."),
});

export async function reportChatterPostAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    if (!user.emailVerifiedAt) {
      return { error: "Verify your email before reporting posts." };
    }
    const parsed = reportSchema.safeParse({
      postId: formData.get("postId"),
      reason: formData.get("reason"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const post = await db.chatterPost.findUnique({
      where: { id: parsed.data.postId },
      select: { id: true, authorId: true, parentId: true, hiddenAt: true },
    });
    if (!post) return { error: "That post is no longer available." };
    if (post.authorId === user.id) return { error: "This is your own post." };
    try {
      await db.chatterReport.create({
        data: {
          postId: post.id,
          reporterId: user.id,
          reason: parsed.data.reason,
        },
      });
    } catch (error) {
      if (uniqueViolation(error)) {
        return {
          success: "You already reported this post. Staff will review it.",
        };
      }
      throw error;
    }
    const reports = await db.chatterReport.count({
      where: { postId: post.id },
    });
    if (reports >= CHATTER_AUTO_HIDE_REPORTS && !post.hiddenAt) {
      await db.chatterPost.update({
        where: { id: post.id },
        data: { hiddenAt: new Date(), hiddenReason: "Reported by members" },
      });
      refreshChatter(post.id, post.parentId);
    }
    return { success: "Thanks — staff will review this post." };
  } catch (error) {
    return fieldError(error);
  }
}

export async function moderateChatterPostAction(formData: FormData) {
  await requirePermission("chatter");
  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const post = await db.chatterPost.findUnique({
    where: { id },
    select: { id: true, authorId: true, parentId: true, body: true },
  });
  if (!post) return;

  if (decision === "hide") {
    await db.chatterPost.update({
      where: { id },
      data: { hiddenAt: new Date(), hiddenReason: "Removed by GoDesi staff" },
    });
    await notify({
      userId: post.authorId,
      title: "A Chatter post of yours was removed",
      body: `"${chatterExcerpt(post.body, 80)}" broke the Chatter rules.`,
      href: "/chatter/rules",
    });
  } else if (decision === "restore") {
    await db.$transaction([
      db.chatterPost.update({
        where: { id },
        data: { hiddenAt: null, hiddenReason: null },
      }),
      db.chatterReport.deleteMany({ where: { postId: id } }),
    ]);
  } else if (decision === "dismiss") {
    await db.chatterReport.deleteMany({ where: { postId: id } });
  } else if (decision === "delete") {
    await db.$transaction(async (tx) => {
      await tx.chatterPost.delete({ where: { id } });
      if (post.parentId) {
        await tx.chatterPost.updateMany({
          where: { id: post.parentId, replyCount: { gt: 0 } },
          data: { replyCount: { decrement: 1 } },
        });
      }
    });
  } else {
    return;
  }
  refreshChatter(post.id, post.parentId);
  revalidateTag("sitemap-rows");
  revalidatePath("/admin/chatter");
}
