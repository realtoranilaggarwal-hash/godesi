"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { discoverFeeds, importSource } from "@/lib/eventWire";

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
