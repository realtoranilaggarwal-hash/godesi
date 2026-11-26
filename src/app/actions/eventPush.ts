"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PUSH_DAILY_LIMIT, readEventLink } from "@/lib/eventLink";
import {
  cleanEventCategories,
  cleanEventLanguages,
  guessEventCategories,
  guessEventLanguages,
} from "@/lib/eventCategories";
import { uniqueEventSlug } from "@/lib/events";
import { pingIndexNowInBackground } from "@/lib/indexNow";
import { instantFrom, isEventZone, zoneForPlace } from "@/lib/time";
import { titleCase } from "@/lib/titlecase";

function back(params: Record<string, string>): never {
  redirect(`/events/push?${new URLSearchParams(params).toString()}#push`);
}

/** The original page, without tracking parameters, so the same event matches. */
function canonicalLink(link: string) {
  const url = new URL(link);
  url.hash = "";
  for (const key of Array.from(url.searchParams.keys())) {
    if (/^(utm_|aff$|ref$|fbclid$|gclid$|mc_)/i.test(key)) {
      url.searchParams.delete(key);
    }
  }
  return url.toString();
}

async function alreadyPushed(link: string) {
  return db.event.findFirst({
    where: { pushedFrom: link, status: { not: "REJECTED" } },
    select: { slug: true },
  });
}

/**
 * Step 1: reads the member's event page and hands the facts back to the form.
 * The draft travels in the URL; nothing is stored until they press Publish.
 */
export async function readPushLinkAction(formData: FormData) {
  const raw = String(formData.get("link") ?? "").trim();
  if (!/^https?:\/\/[^\s]+$/i.test(raw)) {
    back({ error: "Paste your event's web address, starting with https://" });
  }
  let link: string;
  try {
    link = canonicalLink(raw);
  } catch {
    back({ error: "That doesn't look like a web address." });
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(
      `/login?next=${encodeURIComponent(`/events/push?link=${encodeURIComponent(link)}#push`)}`,
    );
  }

  const existing = await alreadyPushed(link);
  if (existing) {
    back({
      error: `That event is already on GoDesi: godesi.com/events/${existing.slug}`,
    });
  }

  const host = new URL(link).hostname.replace(/^www\./, "");
  let draft;
  try {
    draft = await readEventLink(link);
  } catch {
    // Facebook shows robots a login wall, so the member types what they see.
    back({ link, host, missing: "anything", manual: "1" });
  }

  back({
    link,
    host: draft.host,
    title: draft.title,
    date: draft.start?.date ?? "",
    time: draft.start?.time ?? "",
    endDate: draft.end?.date ?? "",
    endTime: draft.end?.time ?? "",
    venue: draft.venue,
    address: draft.address,
    city: draft.city,
    state: draft.state,
    zone: zoneForPlace(draft.state, ""),
    text: draft.description.slice(0, 1500),
    image: draft.imageUrl.length <= 500 ? draft.imageUrl : "",
    genres: guessEventCategories(draft.title, draft.description).join(","),
    langs: guessEventLanguages(draft.title, draft.description).join(","),
    missing: draft.missing.join(", "),
  });
}

const pushSchema = z.object({
  link: z.string().trim().url().max(500),
  title: z.string().trim().min(3, "Give the event a title.").max(160),
  date: z.string().trim().min(1, "The event needs a date."),
  time: z.string().trim().min(1, "The event needs a start time."),
  endDate: z.string().trim().optional(),
  endTime: z.string().trim().optional(),
  venue: z.string().trim().min(2, "Where is it happening?").max(120),
  address: z.string().trim().max(240).optional(),
  city: z.string().trim().min(2, "City is needed.").max(80),
  state: z.string().trim().max(40).optional(),
  country: z.string().trim().max(56).default("USA"),
  description: z.string().trim().max(5000).optional(),
  imageUrl: z
    .string()
    .trim()
    .url()
    .max(500)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  timeZone: z.string().trim().max(60).optional(),
});

/** Step 3: publishes the checked draft under the member's own account. */
export async function publishPushedEventAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/events/push");

  const fields = Object.fromEntries(
    [
      "link",
      "title",
      "date",
      "time",
      "endDate",
      "endTime",
      "venue",
      "address",
      "city",
      "state",
      "country",
      "description",
      "imageUrl",
      "timeZone",
    ].map((key) => [key, String(formData.get(key) ?? "")]),
  );
  // Sent back with an error so the member doesn't retype everything.
  const keep = {
    link: fields.link,
    host: fields.link.replace(/^https?:\/\/(www\.)?/i, "").split("/")[0],
    title: fields.title,
    date: fields.date,
    time: fields.time,
    endDate: fields.endDate,
    endTime: fields.endTime,
    venue: fields.venue,
    address: fields.address,
    city: fields.city,
    state: fields.state,
    zone: fields.timeZone,
    text: fields.description.slice(0, 1500),
    image: fields.imageUrl,
    genres: formData.getAll("genres").map(String).join(","),
    langs: formData.getAll("languages").map(String).join(","),
  };
  const fail: (error: string) => never = (error) => back({ ...keep, error });

  if (formData.get("permission") !== "on") {
    fail("Tick the box to confirm you're the organiser or have their permission.");
  }

  const parsed = pushSchema.safeParse({
    ...fields,
    endDate: fields.endDate || undefined,
    endTime: fields.endTime || undefined,
    address: fields.address || undefined,
    state: fields.state || undefined,
    country: fields.country || "USA",
    description: fields.description || undefined,
    timeZone: fields.timeZone || undefined,
  });
  if (!parsed.success) fail(parsed.error.issues[0].message);
  const data = parsed.data;

  let link: string;
  try {
    link = canonicalLink(data.link);
  } catch {
    fail("Keep the link to your event's page.");
  }
  if (!/^https?:$/.test(new URL(link).protocol)) {
    fail("Keep the link to your event's page.");
  }

  const existing = await alreadyPushed(link);
  if (existing) {
    fail(`That event is already on GoDesi: godesi.com/events/${existing.slug}`);
  }

  const today = await db.event.count({
    where: {
      organizerId: user.id,
      pushedFrom: { not: null },
      createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
  });
  if (today >= PUSH_DAILY_LIMIT) {
    fail(
      `You can push ${PUSH_DAILY_LIMIT} events a day. Come back tomorrow, or post it with the full event form.`,
    );
  }

  const zone =
    data.timeZone && isEventZone(data.timeZone)
      ? data.timeZone
      : zoneForPlace(data.state, data.country);
  const startsAt = instantFrom(data.date, data.time, zone);
  if (!startsAt) fail("Enter a valid date and time.");
  if (startsAt.getTime() < Date.now()) {
    fail("That event has already started. GoDesi Push is for upcoming events.");
  }
  const endsAt =
    data.endDate || data.endTime
      ? instantFrom(data.endDate || data.date, data.endTime || data.time, zone)
      : null;
  if ((data.endDate || data.endTime) && !endsAt) {
    fail("Enter a valid end date and time.");
  }
  if (endsAt && endsAt <= startsAt) fail("The event has to end after it starts.");

  const picked = cleanEventCategories(formData.getAll("genres").map(String));
  const genres = picked.length
    ? picked
    : guessEventCategories(data.title, data.description);
  const languages = cleanEventLanguages(formData.getAll("languages").map(String));

  const business = await db.business.findUnique({
    where: { ownerId: user.id },
    select: { id: true },
  });
  const city = titleCase(data.city);
  const slug = await uniqueEventSlug(data.title, city);

  try {
    await db.event.create({
      data: {
        slug,
        title: titleCase(data.title),
        description:
          data.description || `${titleCase(data.title)} in ${city}. Tickets and details on the organiser's page.`,
        startsAt,
        endsAt,
        timeZone: zone,
        venue: titleCase(data.venue),
        address: data.address || null,
        city,
        state: data.state || null,
        country: data.country,
        imageUrl: data.imageUrl ?? null,
        websiteUrl: link,
        pushedFrom: link,
        genres,
        languages,
        // Tickets stay on the original page until the organiser adds seats here.
        price: 0,
        seatsTotal: 0,
        status: "APPROVED",
        organizerId: user.id,
        businessId: business?.id ?? null,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      String((error as { digest?: unknown }).digest ?? "").startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    fail("Could not publish that event. Check the details and try again.");
  }

  revalidatePath("/events");
  pingIndexNowInBackground(`/events/${slug}`);
  redirect(`/events/${slug}?pushed=1`);
}
