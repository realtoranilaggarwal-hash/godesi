"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { handleFromUrl, platformFromUrl } from "@/lib/social";
import { fetchTweet, tweetUrl } from "@/lib/tweetEmbed";

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
    const pasted = String(formData.get("url") ?? "").trim();
    let author = String(formData.get("author") ?? "")
      .trim()
      .slice(0, 80);
    let text = String(formData.get("text") ?? "")
      .trim()
      .slice(0, 400);
    let handle = String(formData.get("handle") ?? "")
      .trim()
      .slice(0, 40);
    const imageUrl = String(formData.get("imageUrl") ?? "").trim();
    let postedAt = String(formData.get("postedAt") ?? "").trim();

    if (!/^https?:\/\//i.test(pasted))
      return { error: "Paste the link to the post." };

    // A tweet link is enough on its own: X fills in who posted it and what.
    const canonicalTweet = tweetUrl(pasted);
    const url = canonicalTweet ?? pasted;
    let textFromX = false;
    if (canonicalTweet && (!author || !text)) {
      const tweet = await fetchTweet(url);
      if (!tweet) {
        return {
          error:
            "X didn't return that tweet — it may be deleted or private. Check the link, or type who posted it and a line from it.",
        };
      }
      author ||= tweet.author.slice(0, 80);
      if (!text) {
        text = tweet.text.slice(0, 400);
        textFromX = true;
      }
      handle ||= tweet.handle;
      if (!postedAt && tweet.postedAt) postedAt = tweet.postedAt.toISOString();
    }
    if (author.length < 2) return { error: "Who posted it?" };
    if (textFromX ? !text : text.length < 10)
      return { error: "Add a line or two from the post." };

    // The same tweet may already be saved under a twitter.com or tracking-link form.
    const tweetId = canonicalTweet?.split("/").pop();
    const saved = tweetId
      ? (
          await db.socialPost.findMany({
            where: { url: { contains: `/status/${tweetId}` } },
            select: { id: true, url: true },
          })
        ).filter((post) => tweetUrl(post.url) === canonicalTweet)
      : [];
    const existing = saved.find((post) => post.url === url) ?? saved[0] ?? null;

    await db.socialPost.upsert({
      where: existing ? { id: existing.id } : { url },
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
        ...(existing && !saved.some((post) => post.url === url) ? { url } : {}),
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
