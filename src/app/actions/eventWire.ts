"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import {
  discoverFeeds,
  importSource,
  manualSource,
  wireOrganizerId,
} from "@/lib/eventWire";
import { readEventLink } from "@/lib/eventLink";
import { uniqueEventSlug } from "@/lib/events";
import { instantFrom, isEventZone, zoneForPlace } from "@/lib/time";
import { titleCase } from "@/lib/titlecase";

const sourceSchema = z.object({
  name: z.string().trim().min(2, "Give the calendar a name.").max(80),
  url: z
    .string()
    .trim()
    .url("The feed address must start with http:// or https://")
    .max(500),
  city: z.string().trim().min(2, "City is needed for events with no address.").max(80),
  state: z.string().trim().max(40).optional(),
  country: z.string().trim().max(56).default("USA"),
  websiteUrl: z.string().trim().url("The website must be a full link.").max(300).optional(),
  categorySlugs: z.string().trim().max(200).optional(),
  tags: z.string().trim().max(200).optional(),
});

function list(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function refresh() {
  revalidatePath("/admin/events/wire");
  revalidatePath("/events");
}

/** Next's redirect() works by throwing, so it must pass through a catch. */
function isRedirect(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

/** Sends the admin back with a reason rather than losing what they typed. */
function reject(reason: string): never {
  redirect(`/admin/events/wire?error=${encodeURIComponent(reason)}`);
}

/**
 * Looks up the calendar feed on an organisation's website so the admin pastes
 * the website they know rather than hunting for an .ics address.
 */
export async function findFeedAction(formData: FormData) {
  await requirePermission("events");
  const website = String(formData.get("website") ?? "").trim();
  if (!/^https?:\/\//i.test(website)) {
    reject("Paste the organisation's website, starting with https://");
  }

  let found: { url: string; events: number }[];
  try {
    found = await discoverFeeds(website);
  } catch (error) {
    reject(
      `Could not read ${website}: ${error instanceof Error ? error.message : "failed"}`,
    );
  }
  if (!found.length) {
    reject(
      `No public calendar found on ${website}. Ask them for their iCal link, or check whether their calendar is a Google Calendar embed.`,
    );
  }

  redirect(
    `/admin/events/wire?found=${encodeURIComponent(
      found.map((feed) => `${feed.url} (${feed.events} entries)`).join(" | "),
    )}&feed=${encodeURIComponent(found[0].url)}`,
  );
}

export async function saveEventSourceAction(formData: FormData) {
  await requirePermission("events");
  const parsed = sourceSchema.safeParse({
    name: formData.get("name"),
    url: formData.get("url"),
    city: formData.get("city"),
    state: formData.get("state") || undefined,
    country: formData.get("country") || "USA",
    websiteUrl: formData.get("websiteUrl") || undefined,
    categorySlugs: formData.get("categorySlugs") || undefined,
    tags: formData.get("tags") || undefined,
  });
  if (!parsed.success) {
    reject(parsed.error.issues.map((issue) => issue.message).join(" "));
  }

  const data = {
    name: parsed.data.name,
    url: parsed.data.url,
    city: parsed.data.city,
    state: parsed.data.state ?? null,
    country: parsed.data.country,
    websiteUrl: parsed.data.websiteUrl ?? null,
    categorySlugs: list(parsed.data.categorySlugs),
    tags: list(parsed.data.tags),
  };

  const id = String(formData.get("id") ?? "");
  const clash = await db.eventSource.findUnique({
    where: { url: data.url },
    select: { id: true, name: true },
  });
  if (clash && clash.id !== id) {
    reject(`That feed is already added as “${clash.name}”.`);
  }

  if (id) await db.eventSource.update({ where: { id }, data });
  else await db.eventSource.create({ data });
  refresh();
}

export async function toggleEventSourceAction(formData: FormData) {
  await requirePermission("events");
  const id = String(formData.get("id") ?? "");
  const source = await db.eventSource.findUnique({ where: { id } });
  if (!source) return;
  await db.eventSource.update({
    where: { id },
    data: { active: !source.active },
  });
  refresh();
}

/**
 * Removing a source keeps the events it already imported — they are real
 * events people may have saved. Use the events desk to delete those.
 */
export async function deleteEventSourceAction(formData: FormData) {
  await requirePermission("events");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await db.eventSource.delete({ where: { id } });
  refresh();
}

export async function runEventSourceAction(formData: FormData) {
  await requirePermission("events");
  const id = String(formData.get("id") ?? "");
  const source = await db.eventSource.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      url: true,
      city: true,
      state: true,
      country: true,
      websiteUrl: true,
      categorySlugs: true,
      tags: true,
    },
  });
  if (!source) return;

  const result = await importSource(source);
  refresh();
  if (result.error) reject(`${source.name}: ${result.error}`);
}

const linkedSchema = z.object({
  title: z.string().trim().min(3, "Give the event a title.").max(160),
  date: z.string().trim().min(1, "The event needs a date."),
  time: z.string().trim().min(1, "The event needs a start time."),
  endDate: z.string().trim().optional(),
  endTime: z.string().trim().optional(),
  venue: z.string().trim().min(2, "Where is it happening?").max(120),
  hallName: z.string().trim().max(120).optional(),
  address: z.string().trim().max(240).optional(),
  city: z.string().trim().min(2, "City is needed.").max(80),
  state: z.string().trim().max(40).optional(),
  country: z.string().trim().max(56).default("USA"),
  description: z.string().trim().max(5000).optional(),
  sourceUrl: z.string().trim().url("Keep the link to the original page.").max(500),
  imageUrl: z.string().trim().url().max(500).optional().or(z.literal("").transform(() => undefined)),
  categorySlug: z.string().trim().max(60).optional(),
  tags: z.string().trim().max(200).optional(),
  timeZone: z.string().trim().max(60).optional(),
});

/**
 * Reads a pasted event page and hands the facts back to the desk to confirm.
 * The draft travels in the URL rather than the database: nothing is stored
 * until a person has looked at it.
 */
export async function readEventLinkAction(formData: FormData) {
  await requirePermission("events");
  const link = String(formData.get("link") ?? "").trim();
  if (!/^https?:\/\//i.test(link)) {
    reject("Paste the event's own web address, starting with https://");
  }

  const host = new URL(link).hostname.replace(/^www\./, "");
  let draft;
  try {
    draft = await readEventLink(link);
  } catch (error) {
    // Facebook answers robots with a login wall, so a failure still opens the
    // form: the desk types what it sees on its own screen.
    redirect(
      `/admin/events/wire?${new URLSearchParams({
        link,
        host,
        missing: "anything",
        error: `Could not read that page (${
          error instanceof Error ? error.message : "failed"
        }) — Facebook hides events from anyone not signed in. Fill the fields in from what you can see.`,
      }).toString()}#confirm`,
    );
  }

  const params = new URLSearchParams({
    link: draft.sourceUrl,
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
    // The page states the event's own local time; the zone is guessed from
    // where it happens and the desk can correct it.
    zone: zoneForPlace(draft.state, ""),
    text: draft.description.slice(0, 1500),
    missing: draft.missing.join(", "),
  });
  redirect(`/admin/events/wire?${params.toString()}#confirm`);
}

/** Saves the confirmed draft as a live event credited to where it came from. */
export async function saveLinkedEventAction(formData: FormData) {
  await requirePermission("events");
  const parsed = linkedSchema.safeParse({
    title: formData.get("title"),
    date: formData.get("date"),
    time: formData.get("time"),
    endDate: formData.get("endDate") || undefined,
    endTime: formData.get("endTime") || undefined,
    venue: formData.get("venue"),
    hallName: formData.get("hallName") || undefined,
    address: formData.get("address") || undefined,
    city: formData.get("city"),
    state: formData.get("state") || undefined,
    country: formData.get("country") || "USA",
    description: formData.get("description") || undefined,
    sourceUrl: formData.get("sourceUrl"),
    imageUrl: formData.get("imageUrl") || undefined,
    categorySlug: formData.get("categorySlug") || undefined,
    tags: formData.get("tags") || undefined,
    timeZone: formData.get("timeZone") || undefined,
  });
  if (!parsed.success) {
    reject(parsed.error.issues.map((issue) => issue.message).join(" "));
  }

  // Times are the event's own local times, so they are read in its zone.
  const zone =
    parsed.data.timeZone && isEventZone(parsed.data.timeZone)
      ? parsed.data.timeZone
      : zoneForPlace(parsed.data.state, parsed.data.country);

  const startsAt = instantFrom(parsed.data.date, parsed.data.time, zone);
  if (!startsAt) reject("Enter a valid date and time.");

  const endsAt =
    parsed.data.endDate || parsed.data.endTime
      ? instantFrom(
          parsed.data.endDate || parsed.data.date,
          parsed.data.endTime || parsed.data.time,
          zone,
        )
      : null;
  if ((parsed.data.endDate || parsed.data.endTime) && !endsAt) {
    reject("Enter a valid end date and time.");
  }
  if (endsAt && endsAt <= startsAt) {
    reject("The event has to end after it starts.");
  }

  const host = new URL(parsed.data.sourceUrl).hostname.replace(/^www\./, "");
  const sourceId = await manualSource(host);
  const duplicate = await db.event.findUnique({
    where: { sourceId_sourceUid: { sourceId, sourceUid: parsed.data.sourceUrl } },
    select: { slug: true },
  });
  if (duplicate) reject(`That link is already listed as /events/${duplicate.slug}`);

  const city = titleCase(parsed.data.city);
  try {
    await db.event.create({
      data: {
        title: parsed.data.title,
        slug: await uniqueEventSlug(parsed.data.title, city),
        description: [
          parsed.data.description,
          `Listed by Godesi from ${host}. Check the details with the organiser.`,
        ]
          .filter(Boolean)
          .join("\n\n")
          .slice(0, 5000),
        startsAt,
        endsAt,
        timeZone: zone,
        venue: titleCase(parsed.data.venue),
        hallName: parsed.data.hallName || null,
        address: parsed.data.address || null,
        city,
        state: parsed.data.state || null,
        country: parsed.data.country,
        imageUrl: parsed.data.imageUrl ?? null,
        websiteUrl: parsed.data.sourceUrl,
        categorySlug: parsed.data.categorySlug || null,
        categorySlugs: parsed.data.categorySlug
          ? [parsed.data.categorySlug]
          : [],
        tags: list(parsed.data.tags),
        // Godesi sells no tickets for someone else's event.
        price: 0,
        seatsTotal: 0,
        status: "APPROVED" as const,
        organizerId: await wireOrganizerId(),
        sourceId,
        sourceUid: parsed.data.sourceUrl,
      },
    });
  } catch (error) {
    // A failure here used to show the desk the generic crash page, which says
    // nothing about what to change. Redirects still travel as thrown errors.
    if (isRedirect(error)) throw error;
    reject(
      `Could not save that event: ${
        error instanceof Error ? error.message.slice(0, 300) : "unknown error"
      }`,
    );
  }

  refresh();
  redirect("/admin/events/wire?added=1");
}

/** Pulls an imported event off the site; the next run will not bring it back. */
export async function removeImportedEventAction(formData: FormData) {
  await requirePermission("events");
  const id = String(formData.get("id") ?? "");
  const event = await db.event.findUnique({
    where: { id },
    select: { id: true, sourceId: true },
  });
  if (!event?.sourceId) return;

  await db.event.update({
    where: { id: event.id },
    data: { status: "REJECTED" },
  });
  refresh();
}
