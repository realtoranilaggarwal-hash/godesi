"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { newsQuotaLeft, twoLineSummary } from "@/lib/news";
import { REPORT_DECLARATIONS, REPORT_SOURCES } from "@/lib/journalists";
import { REPORT_TOPIC_OPTIONS, topicSlug } from "@/lib/newsTopics";

const MAX_PHOTOS = 8;

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid link")
  .optional()
  .or(z.literal("").transform(() => undefined));

const reportSchema = z.object({
  title: z.string().trim().min(8, "Give the report a headline"),
  topic: z.string().trim().min(2, "Pick a topic"),
  city: z.string().trim().min(2, "Where did this happen?"),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  happenedAt: z.coerce.date({ message: "Add the date and time" }),
  summary: z
    .string()
    .trim()
    .min(30, "Describe what happened in at least 30 characters"),
  sourceType: z.enum(REPORT_SOURCES),
  sourceUrl: optionalUrl,
  videoUrl: optionalUrl,
  photoUrls: z.array(z.string().url()).max(MAX_PHOTOS),
});

/**
 * A member's own report from the ground, as opposed to a link to someone
 * else's article. Everything goes through the news desk queue first.
 */
export async function submitReportAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();

    const missing = REPORT_DECLARATIONS.find(
      (item) => formData.get(item.name) !== "on",
    );
    if (missing) {
      return { error: `Please confirm: ${missing.label.toLowerCase()}` };
    }

    const parsed = reportSchema.safeParse({
      title: formData.get("title"),
      topic: formData.get("topic"),
      city: formData.get("city"),
      state: formData.get("state") || undefined,
      country: formData.get("country") || undefined,
      happenedAt: formData.get("happenedAt"),
      summary: formData.get("summary"),
      sourceType: formData.get("sourceType"),
      sourceUrl: formData.get("sourceUrl"),
      videoUrl: formData.get("videoUrl"),
      photoUrls: formData
        .getAll("photoUrls")
        .map(String)
        .filter(Boolean)
        .slice(0, MAX_PHOTOS),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const quota = await newsQuotaLeft(user);
    if (quota.left === 0) {
      return {
        error: `Your plan covers ${quota.allowance} news post${
          quota.allowance === 1 ? "" : "s"
        } a week — upgrade for 10 a week, or report again in a few days.`,
      };
    }

    const data = parsed.data;
    if (data.happenedAt.getTime() > Date.now() + 60 * 60 * 1000) {
      return { error: "The date and time cannot be in the future." };
    }

    const report = await db.newsItem.create({
      data: {
        guid: `report:${randomUUID()}`,
        title: data.title,
        summary: twoLineSummary(data.summary),
        link: "",
        source: user.name,
        submittedById: user.id,
        status: "PENDING",
        topic: topicSlug(data.topic),
        category:
          REPORT_TOPIC_OPTIONS.find((option) => option.slug === topicSlug(data.topic))
            ?.label ?? "General",
        city: data.city,
        state: data.state ?? null,
        country: data.country ?? null,
        happenedAt: data.happenedAt,
        sourceType: data.sourceType,
        sourceUrl: data.sourceUrl ?? null,
        photoUrls: data.photoUrls,
        imageUrl: data.photoUrls[0] ?? null,
        videoUrl: data.videoUrl ?? null,
        declaredAt: new Date(),
      },
    });

    // Member reports live on Godesi, so the story link points back at itself.
    await db.newsItem.update({
      where: { id: report.id },
      data: { link: `/news/${report.id}` },
    });

    // Journalists start their patch from the first place they report on.
    if (!user.journalistSince) {
      await db.user.update({
        where: { id: user.id },
        data: { journalistSince: new Date(), journalistBeat: data.city },
      });
    }

    revalidatePath("/news");
    revalidatePath("/journalists");
    return {
      success:
        "Thanks — your report is with the news desk. We check every report before it goes live.",
    };
  } catch (error) {
    return fieldError(error);
  }
}

const VERDICTS = ["CONFIRMED", "DOUBTED", "FAKE"] as const;

/** Readers vouch for or challenge a report; voting the same way again clears it. */
export async function verifyReportAction(formData: FormData) {
  const user = await requireUser();
  const newsId = String(formData.get("id") ?? "");
  const verdict = VERDICTS.find((item) => item === formData.get("verdict"));
  if (!verdict) return;

  const item = await db.newsItem.findUnique({ where: { id: newsId } });
  if (!item || item.status !== "PUBLISHED") return;
  if (item.submittedById === user.id) return;

  const existing = await db.newsVerification.findUnique({
    where: { newsId_userId: { newsId, userId: user.id } },
  });

  if (existing?.verdict === verdict) {
    await db.newsVerification.delete({ where: { id: existing.id } });
  } else if (existing) {
    await db.newsVerification.update({
      where: { id: existing.id },
      data: { verdict, note: String(formData.get("note") ?? "").trim() || null },
    });
  } else {
    await db.newsVerification.create({
      data: {
        newsId,
        userId: user.id,
        verdict,
        note: String(formData.get("note") ?? "").trim() || null,
      },
    });
  }

  revalidatePath(`/news/${newsId}`);
  revalidatePath("/news");
}
