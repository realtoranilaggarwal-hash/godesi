"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { slugify } from "@/lib/slug";
import {
  CLUB_PREMIUM_YEAR_USD,
  composeRules,
  isClubCategory,
} from "@/lib/clubs";
import { siteUrl } from "@/lib/format";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { isPlaylistLink, resolvePlaylistField } from "@/lib/youtubePlaylist";
import { isClubOrganizer } from "@/lib/clubAccess";
import { sentenceCase, titleCase } from "@/lib/titlecase";

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a full link starting with https://")
  .optional()
  .or(z.literal(""));

const clubSchema = z.object({
  name: z.string().trim().min(3, "Give the club a name").max(80),
  description: z
    .string()
    .trim()
    .min(20, "Tell people what the club is about (a couple of sentences)")
    .max(3000),
  category: z.string().refine(isClubCategory, "Pick a category"),
  visibility: z.enum(["PUBLIC", "PRIVATE"]),
  online: z.boolean(),
  city: z.string().trim().max(80).optional(),
  state: z.string().trim().max(80).optional(),
  country: z.string().trim().max(80).optional(),
  rules: z.string().trim().max(3000).optional(),
  imageUrl: optionalUrl,
  playlistUrl: optionalUrl.refine(
    (value) => !value || isPlaylistLink(value),
    "Paste a YouTube playlist or channel link (youtube.com/playlist?list=… or youtube.com/@yourchannel)",
  ),
  websiteUrl: optionalUrl,
  whatsappUrl: optionalUrl,
});

function readClub(formData: FormData) {
  const value = (key: string) => String(formData.get(key) ?? "");
  const online = formData.get("online") === "on";
  const parsed = clubSchema.safeParse({
    name: value("name"),
    description: value("description"),
    category: value("category"),
    visibility: value("visibility") || "PUBLIC",
    online,
    city: value("city") || undefined,
    state: value("state") || undefined,
    country: value("country") || undefined,
    rules:
      composeRules(
        formData.getAll("rulePreset").map(String),
        value("rulesExtra"),
      ) ?? undefined,
    imageUrl: value("imageUrl"),
    playlistUrl: value("playlistUrl"),
    websiteUrl: value("websiteUrl"),
    whatsappUrl: value("whatsappUrl"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!online && !parsed.data.city) {
    return { error: "Add the city the club meets in, or tick “online”." };
  }
  const d = parsed.data;
  return {
    data: {
      name: titleCase(d.name),
      description: sentenceCase(d.description),
      category: d.category,
      visibility: d.visibility,
      online: d.online,
      city: d.city ? titleCase(d.city) : null,
      state: d.state || null,
      country: d.country || null,
      rules: d.rules || null,
      imageUrl: d.imageUrl || null,
      playlistUrl: d.playlistUrl || null,
      websiteUrl: d.websiteUrl || null,
      whatsappUrl: d.whatsappUrl || null,
    },
  };
}

async function uniqueClubSlug(name: string, city: string | null) {
  const base = slugify([name, city].filter(Boolean).join(" ")) || "club";
  let candidate = base;
  let counter = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await db.club.findUnique({ where: { slug: candidate } })) {
    counter += 1;
    candidate = `${base}-${counter}`;
  }
  return candidate;
}

export async function createClubAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let slug: string;
  try {
    const user = await requireUser();
    await resolvePlaylistField(formData);
    const read = readClub(formData);
    if ("error" in read) return { error: read.error };
    slug = await uniqueClubSlug(read.data.name, read.data.city);
    await db.club.create({
      data: {
        ...read.data,
        slug,
        createdById: user.id,
        members: {
          create: { userId: user.id, role: "ORGANIZER", status: "ACTIVE" },
        },
      },
    });
  } catch (error) {
    return fieldError(error);
  }
  revalidatePath("/clubs");
  redirect(`/clubs/${slug}`);
}

export async function updateClubAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let slug: string;
  try {
    const user = await requireUser();
    const clubId = String(formData.get("clubId") ?? "");
    const club = await db.club.findUnique({
      where: { id: clubId },
      select: { slug: true },
    });
    if (!club || !(await isClubOrganizer(clubId, user))) {
      return { error: "Only the club's organisers can edit it." };
    }
    await resolvePlaylistField(formData);
    const read = readClub(formData);
    if ("error" in read) return { error: read.error };
    await db.club.update({ where: { id: clubId }, data: read.data });
    slug = club.slug;
  } catch (error) {
    return fieldError(error);
  }
  revalidatePath("/clubs");
  revalidatePath(`/clubs/${slug}`);
  redirect(`/clubs/${slug}`);
}

/** Public club: joins at once. Private club: a request the organisers approve. */
export async function joinClubAction(formData: FormData) {
  const user = await requireUser();
  const clubId = String(formData.get("clubId") ?? "");
  const note = String(formData.get("note") ?? "")
    .trim()
    .slice(0, 200);
  const club = await db.club.findUnique({
    where: { id: clubId },
    select: { slug: true, visibility: true },
  });
  if (!club) return;
  const status = club.visibility === "PUBLIC" ? "ACTIVE" : "PENDING";
  await db.clubMember.upsert({
    where: { clubId_userId: { clubId, userId: user.id } },
    create: { clubId, userId: user.id, status, note: note || null },
    update: { note: note || undefined },
  });
  revalidatePath(`/clubs/${club.slug}`);
}

export async function leaveClubAction(formData: FormData) {
  const user = await requireUser();
  const clubId = String(formData.get("clubId") ?? "");
  const club = await db.club.findUnique({
    where: { id: clubId },
    select: { slug: true },
  });
  if (!club) return;
  const organisers = await db.clubMember.count({
    where: { clubId, role: "ORGANIZER", status: "ACTIVE" },
  });
  const me = await db.clubMember.findUnique({
    where: { clubId_userId: { clubId, userId: user.id } },
  });
  // The last organiser stays, otherwise nobody could run the club.
  if (me?.role === "ORGANIZER" && organisers <= 1) return;
  await db.clubMember.deleteMany({ where: { clubId, userId: user.id } });
  revalidatePath(`/clubs/${club.slug}`);
}

/**
 * Deletes the club with its members and orders; its events stay, just no
 * longer under a club. The typed name must match, so a stray click does
 * nothing.
 */
export async function deleteClubAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const clubId = String(formData.get("clubId") ?? "");
    const club = await db.club.findUnique({
      where: { id: clubId },
      select: { name: true },
    });
    if (!club || !(await isClubOrganizer(clubId, user))) {
      return { error: "Only the club's organisers can delete it." };
    }
    const typed = String(formData.get("confirmName") ?? "").trim();
    if (typed.toLowerCase() !== club.name.trim().toLowerCase()) {
      return {
        error: `Type the club's name exactly — “${club.name}” — to confirm.`,
      };
    }
    await db.club.delete({ where: { id: clubId } });
  } catch (error) {
    return fieldError(error);
  }
  revalidatePath("/clubs");
  redirect("/clubs");
}

/**
 * Organiser moderation: approve or decline a request, remove a member, or make
 * a member an organiser.
 */
export async function moderateMemberAction(formData: FormData) {
  const user = await requireUser();
  const memberId = String(formData.get("memberId") ?? "");
  const action = String(formData.get("action") ?? "");
  const member = await db.clubMember.findUnique({
    where: { id: memberId },
    include: { club: { select: { id: true, slug: true } } },
  });
  if (!member || !(await isClubOrganizer(member.clubId, user))) return;

  if (action === "approve") {
    await db.clubMember.update({
      where: { id: memberId },
      data: { status: "ACTIVE" },
    });
  } else if (action === "remove" || action === "decline") {
    if (member.userId === user.id) return;
    await db.clubMember.delete({ where: { id: memberId } });
  } else if (action === "promote") {
    await db.clubMember.update({
      where: { id: memberId },
      data: { role: "ORGANIZER", status: "ACTIVE" },
    });
  } else if (action === "demote") {
    if (member.userId === user.id) return;
    await db.clubMember.update({
      where: { id: memberId },
      data: { role: "MEMBER" },
    });
  }
  revalidatePath(`/clubs/${member.club.slug}`);
}

/**
 * A member's answer for a club event: coming or not, what they bring, what
 * they take part in, and (when the organiser asks) what they chip in.
 */
export async function rsvpAction(formData: FormData) {
  const user = await requireUser();
  const eventId = String(formData.get("eventId") ?? "");
  const event = await db.event.findUnique({
    where: { id: eventId },
    select: {
      slug: true,
      clubId: true,
      contributionMode: true,
      bringOptions: true,
      participateOptions: true,
    },
  });
  if (!event) return;
  if (event.clubId) {
    const member = await db.clubMember.findUnique({
      where: { clubId_userId: { clubId: event.clubId, userId: user.id } },
      select: { status: true },
    });
    if (member?.status !== "ACTIVE") return;
  }
  const answerRaw = String(formData.get("answer") ?? "YES");
  const answer =
    answerRaw === "MAYBE" || answerRaw === "NO" ? answerRaw : "YES";
  const bringing = formData
    .getAll("bringing")
    .map(String)
    .filter((v) => event.bringOptions.includes(v));
  const participating = formData
    .getAll("participating")
    .map(String)
    .filter((v) => event.participateOptions.includes(v));
  const bringingNote =
    String(formData.get("bringingNote") ?? "")
      .trim()
      .slice(0, 300) || null;
  const amount = Number(formData.get("amount") ?? 0);
  const amountMinor =
    event.contributionMode !== "NONE" && Number.isFinite(amount) && amount > 0
      ? Math.round(amount * 100)
      : null;
  const guests = Math.min(
    20,
    Math.max(0, Math.floor(Number(formData.get("guests") ?? 0) || 0)),
  );
  const data = {
    answer,
    bringing: answer === "NO" ? [] : bringing,
    participating: answer === "NO" ? [] : participating,
    bringingNote: answer === "NO" ? null : bringingNote,
    amountMinor: answer === "NO" ? null : amountMinor,
    guests: answer === "NO" ? 0 : guests,
  } as const;
  await db.eventRsvp.upsert({
    where: { eventId_userId: { eventId, userId: user.id } },
    create: { eventId, userId: user.id, ...data },
    update: data,
  });
  revalidatePath(`/events/${event.slug}`);
}

const PREMIUM_YEARS = [1, 2] as const;

/** Yearly Premium payment for a club; extends `premiumUntil` when Stripe confirms. */
export async function startClubPremiumCheckoutAction(formData: FormData) {
  const user = await requireUser();
  const clubId = String(formData.get("clubId") ?? "");
  const yearsRaw = Number(String(formData.get("years") ?? "1"));
  const years = (PREMIUM_YEARS as readonly number[]).includes(yearsRaw)
    ? yearsRaw
    : 1;

  const club = await db.club.findUnique({
    where: { id: clubId },
    select: { id: true, slug: true, name: true },
  });
  if (!club || !(await isClubOrganizer(club.id, user))) {
    redirect("/clubs?error=not_organizer");
  }
  if (!stripeEnabled())
    redirect(`/clubs/${club.slug}?error=stripe_unavailable`);

  const amountMinor = CLUB_PREMIUM_YEAR_USD * 100 * years;
  const order = await db.clubOrder.create({
    data: {
      clubId: club.id,
      userId: user.id,
      years,
      amountMinor,
      currency: "USD",
    },
  });

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: {
      kind: "club-premium",
      clubOrderId: order.id,
      clubId: club.id,
      userId: user.id,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountMinor,
          product_data: {
            name: `GoDesi Premium club — ${years} year${years > 1 ? "s" : ""}`,
            description: `${club.name}: no Godesi fee on event tickets, Premium badge, listed first.`,
          },
        },
      },
    ],
    success_url: `${siteUrl()}/clubs/${club.slug}?paid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/clubs/${club.slug}?error=cancelled`,
  });
  if (!session.url) redirect(`/clubs/${club.slug}?error=stripe_unavailable`);
  redirect(session.url);
}
