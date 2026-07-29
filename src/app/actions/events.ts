"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { requestCurrency } from "@/lib/currency";
import { confirmTicket, seatsLeft, ticketCode, uniqueEventSlug } from "@/lib/events";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { siteUrl, toMinor } from "@/lib/format";
import { isSupportedVideoUrl } from "@/lib/video";
import { checkCoupon, normalizeCouponCode } from "@/lib/coupons";
import { EVENT_FEATURES, PARTNER_COMMITMENTS } from "@/lib/eventOptions";
import { rememberVenue } from "@/lib/venues";
import { titleCase } from "@/lib/titlecase";
import { payoutAccount, platformFeeMinor } from "@/lib/connect";

/** Up to three seat types per event, e.g. Basic / Webinar / Premium. */
const MAX_TIERS = 3;

type TierInput = { name: string; price: number; seatsTotal: number };

/**
 * Reads the repeated tier rows off the event form. Rows without a name are
 * ignored, so organisers can leave the tier block empty for a flat-priced event.
 */
function readTiers(formData: FormData): TierInput[] | { error: string } {
  const names = formData.getAll("tierName").map((value) => String(value).trim());
  const prices = formData.getAll("tierPrice").map((value) => String(value).trim());
  const seats = formData.getAll("tierSeats").map((value) => String(value).trim());

  const tiers: TierInput[] = [];
  for (let index = 0; index < names.length && tiers.length < MAX_TIERS; index += 1) {
    const name = names[index];
    if (!name) continue;

    const price = Number(prices[index] ?? 0);
    const seatsTotal = Number(seats[index] ?? 0);
    if (!Number.isFinite(price) || price < 0) {
      return { error: `Enter a valid price for the "${name}" ticket.` };
    }
    if (!Number.isInteger(seatsTotal) || seatsTotal < 1) {
      return { error: `Enter how many "${name}" seats are available.` };
    }
    tiers.push({ name, price: Math.round(price), seatsTotal });
  }
  return tiers;
}

const optionalUrl = z
  .string()
  .trim()
  .url("Enter a valid URL")
  .optional()
  .or(z.literal("").transform(() => undefined));

type SpeakerInput = { name: string; bio: string | null; photoUrl: string | null };
type SessionInput = {
  title: string;
  stage: string | null;
  speaker: string | null;
  startTime: string | null;
  endTime: string | null;
};

const MAX_SPEAKERS = 12;
const MAX_SESSIONS = 20;

/** Repeated speaker rows; rows without a name are skipped. */
function readSpeakers(formData: FormData): SpeakerInput[] {
  const names = formData.getAll("speakerName").map((value) => String(value).trim());
  const bios = formData.getAll("speakerBio").map((value) => String(value).trim());
  const photos = formData.getAll("speakerPhoto").map((value) => String(value).trim());

  const speakers: SpeakerInput[] = [];
  for (let index = 0; index < names.length && speakers.length < MAX_SPEAKERS; index += 1) {
    if (!names[index]) continue;
    speakers.push({
      name: names[index].slice(0, 120),
      bio: bios[index]?.slice(0, 600) || null,
      photoUrl: photos[index] || null,
    });
  }
  return speakers;
}

/** Repeated agenda rows; rows without a title are skipped. */
function readSessions(formData: FormData): SessionInput[] {
  const titles = formData.getAll("sessionTitle").map((value) => String(value).trim());
  const stages = formData.getAll("sessionStage").map((value) => String(value).trim());
  const speakers = formData.getAll("sessionSpeaker").map((value) => String(value).trim());
  const starts = formData.getAll("sessionStart").map((value) => String(value).trim());
  const ends = formData.getAll("sessionEnd").map((value) => String(value).trim());

  const sessions: SessionInput[] = [];
  for (let index = 0; index < titles.length && sessions.length < MAX_SESSIONS; index += 1) {
    if (!titles[index]) continue;
    sessions.push({
      title: titles[index].slice(0, 160),
      stage: stages[index] || null,
      speaker: speakers[index] || null,
      startTime: starts[index] || null,
      endTime: ends[index] || null,
    });
  }
  return sessions;
}

const eventSchema = z.object({
  title: z.string().trim().min(5, "Give your event a clear title"),
  description: z.string().trim().min(20, "Describe the event (20+ characters)"),
  date: z.string().trim().min(1, "Event date is required"),
  time: z.string().trim().min(1, "Event time is required"),
  venue: z.string().trim().min(3, "Venue is required"),
  hallName: z.string().trim().max(120).optional(),
  address: z.string().trim().max(300).optional(),
  mapsUrl: optionalUrl,
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  country: z.string().trim().min(2, "Country is required"),
  eventType: z.string().trim().min(2, "Pick an event type"),
  mode: z.enum(["OFFLINE", "ONLINE", "HYBRID"]).default("OFFLINE"),
  frequency: z.enum(["ONE_TIME", "RECURRING"]).default("ONE_TIME"),
  recurrence: z.string().trim().max(120).optional(),
  onlineUrl: optionalUrl,
  websiteUrl: optionalUrl,
  tags: z.string().trim().max(300).optional(),
  categorySlug: z.string().trim().optional(),
  subcategorySlug: z.string().trim().optional(),
  price: z.coerce.number().int().min(0, "Price cannot be negative"),
  currency: z.enum(["INR", "USD"]).optional(),
  seatsTotal: z.coerce.number().int().min(1, "At least 1 seat is required"),
  imageUrl: optionalUrl,
  videoUrl: optionalUrl.refine(
    (value) => !value || isSupportedVideoUrl(value),
    "Paste a YouTube or Vimeo video link",
  ),
});

/**
 * Turns the optional coupon box on the event form into a live TICKETS code. A
 * clashing or malformed code is skipped rather than losing the whole event.
 */
async function createLaunchCoupon(eventId: string, userId: string, formData: FormData) {
  const code = normalizeCouponCode(String(formData.get("couponCode") ?? ""));
  const percent = Number(formData.get("couponPercent") ?? 0);
  if (!code || !/^[A-Z0-9-]{3,24}$/.test(code)) return;
  if (!Number.isInteger(percent) || percent < 1 || percent > 100) return;

  const clash = await db.coupon.findUnique({ where: { code } });
  if (clash) return;

  const maxRedemptions = Number(formData.get("couponMaxRedemptions") ?? 0);
  await db.coupon.create({
    data: {
      code,
      scope: "TICKETS",
      discountKind: "PERCENT",
      amount: percent,
      eventId,
      createdById: userId,
      maxRedemptions: maxRedemptions > 0 ? maxRedemptions : null,
    },
  });
}

export async function createEventAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let slug: string;
  try {
    const user = await requireUser();
    const parsed = eventSchema.safeParse({
      title: formData.get("title"),
      description: formData.get("description"),
      date: formData.get("date"),
      time: formData.get("time"),
      venue: formData.get("venue"),
      hallName: formData.get("hallName") ?? undefined,
      address: formData.get("address") ?? undefined,
      mapsUrl: formData.get("mapsUrl") ?? undefined,
      city: formData.get("city"),
      state: formData.get("state"),
      country: formData.get("country"),
      eventType: formData.get("eventType"),
      mode: formData.get("mode") || "OFFLINE",
      frequency: formData.get("frequency") || "ONE_TIME",
      recurrence: formData.get("recurrence") ?? undefined,
      onlineUrl: formData.get("onlineUrl") ?? undefined,
      websiteUrl: formData.get("websiteUrl") ?? undefined,
      tags: formData.get("tags") ?? undefined,
      categorySlug: formData.get("categorySlug") ?? undefined,
      subcategorySlug: formData.get("subcategorySlug") ?? undefined,
      price: formData.get("price") || 0,
      currency: formData.get("currency") || undefined,
      seatsTotal: formData.get("seatsTotal") || 1,
      imageUrl: formData.get("imageUrl") ?? undefined,
      videoUrl: formData.get("videoUrl") ?? undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const startsAt = new Date(`${parsed.data.date}T${parsed.data.time}:00+05:30`);
    if (Number.isNaN(startsAt.getTime())) return { error: "Enter a valid date and time." };

    const tiers = readTiers(formData);
    if ("error" in tiers) return { error: tiers.error };

    if (parsed.data.mode !== "OFFLINE" && !parsed.data.onlineUrl) {
      return { error: "Add the join link for an online or hybrid event." };
    }

    const speakers = readSpeakers(formData);
    const sessions = readSessions(formData);
    const features = formData
      .getAll("features")
      .map((value) => String(value))
      .filter((value) => EVENT_FEATURES.includes(value));

    /** The deal only counts when every branding commitment is ticked. */
    const wantsPartnership = formData.get("partnerRequested") === "yes";
    const commitmentsMade = PARTNER_COMMITMENTS.every(
      (item) => formData.get(item.name) === "on",
    );
    if (wantsPartnership && !commitmentsMade) {
      return {
        error:
          "Tick all four branding commitments to join the Godesi promotion partnership, or choose “No thanks”.",
      };
    }
    const primaryCategory =
      parsed.data.subcategorySlug || parsed.data.categorySlug || null;
    const extraCategories = formData
      .getAll("extraCategorySlugs")
      .map((value) => String(value).trim())
      .filter(Boolean);
    const categorySlugs = Array.from(
      new Set([primaryCategory, ...extraCategories].filter(Boolean) as string[]),
    );
    const tags = (parsed.data.tags ?? "")
      .split(",")
      .map((tag) => tag.trim().slice(0, 30))
      .filter(Boolean)
      .slice(0, 10);

    const business = await db.business.findUnique({ where: { ownerId: user.id } });
    slug = await uniqueEventSlug(parsed.data.title, parsed.data.city);

    const venueRef =
      parsed.data.mode === "ONLINE"
        ? null
        : await rememberVenue({
            name: parsed.data.venue,
            city: parsed.data.city,
            state: parsed.data.state,
            country: parsed.data.country,
            address: parsed.data.address ?? null,
            mapsUrl: parsed.data.mapsUrl ?? null,
            hall: parsed.data.hallName ?? null,
          });

    /** With tiers the event totals mirror the tiers, so seat counts stay in step. */
    const seatsTotal = tiers.length
      ? tiers.reduce((sum, tier) => sum + tier.seatsTotal, 0)
      : parsed.data.seatsTotal;
    const price = tiers.length
      ? Math.min(...tiers.map((tier) => tier.price))
      : parsed.data.price;

    const created = await db.event.create({
      data: {
        slug,
        title: titleCase(parsed.data.title),
        description: parsed.data.description,
        startsAt,
        venue: parsed.data.venue,
        hallName: parsed.data.hallName || null,
        address: parsed.data.address || null,
        mapsUrl: parsed.data.mapsUrl ?? null,
        venueRefId: venueRef?.id ?? null,
        features,
        partnerStatus: wantsPartnership ? "REQUESTED" : "NONE",
        partnerAgreedAt: wantsPartnership ? new Date() : null,
        city: parsed.data.city,
        state: parsed.data.state,
        country: parsed.data.country,
        eventType: parsed.data.eventType,
        mode: parsed.data.mode,
        onlineUrl: parsed.data.onlineUrl ?? null,
        websiteUrl: parsed.data.websiteUrl ?? null,
        bonusNote: String(formData.get("bonusNote") ?? "").trim().slice(0, 200) || null,
        frequency: parsed.data.frequency,
        recurrence:
          parsed.data.frequency === "RECURRING"
            ? parsed.data.recurrence || null
            : null,
        tags,
        imageUrl: parsed.data.imageUrl ?? null,
        videoUrl: parsed.data.videoUrl ?? null,
        price,
        currency: parsed.data.currency ?? requestCurrency(),
        seatsTotal,
        organizerId: user.id,
        businessId: business?.id ?? null,
        categorySlug: primaryCategory,
        categorySlugs,
        speakers: speakers.length
          ? {
              create: speakers.map((speaker, index) => ({
                ...speaker,
                sortOrder: index,
              })),
            }
          : undefined,
        sessions: sessions.length
          ? {
              create: sessions.map((session, index) => ({
                ...session,
                sortOrder: index,
              })),
            }
          : undefined,
        tiers: tiers.length
          ? {
              create: tiers.map((tier, index) => ({
                name: tier.name,
                price: tier.price,
                seatsTotal: tier.seatsTotal,
                sortOrder: index,
              })),
            }
          : undefined,
      },
    });

    await createLaunchCoupon(created.id, user.id, formData);
  } catch (error) {
    return fieldError(error);
  }

  revalidatePath("/events");
  redirect(`/events/${slug}`);
}

const bookingSchema = z.object({
  eventId: z.string().min(1),
  tierId: z.string().trim().optional(),
  couponCode: z.string().trim().optional(),
  quantity: z.coerce.number().int().min(1, "Book at least 1 seat").max(10, "Maximum 10 seats"),
  buyerName: z.string().trim().min(2, "Your name is required"),
  buyerEmail: z.string().trim().email("Enter a valid email"),
  buyerPhone: z.string().trim().optional(),
});

/**
 * Free events issue a confirmed ticket immediately; paid events create a PENDING
 * ticket and hand off to Stripe. Seats are only taken once payment is confirmed.
 */
export async function bookTicketAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let destination: string;

  try {
    const user = await requireUser();
    const parsed = bookingSchema.safeParse({
      eventId: formData.get("eventId"),
      tierId: formData.get("tierId"),
      couponCode: formData.get("couponCode"),
      quantity: formData.get("quantity") || 1,
      buyerName: formData.get("buyerName") || user.name,
      buyerEmail: formData.get("buyerEmail") || user.email,
      buyerPhone: formData.get("buyerPhone"),
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const event = await db.event.findUnique({
      where: { id: parsed.data.eventId },
      include: {
        tiers: { orderBy: { sortOrder: "asc" } },
        organizer: {
          select: { stripeAccountId: true, stripePayoutsEnabled: true },
        },
      },
    });
    if (!event) return { error: "This event no longer exists." };
    if (event.status !== "APPROVED") return { error: "This event is not open for booking." };
    if (event.startsAt.getTime() < Date.now()) return { error: "This event has already ended." };

    const tier = event.tiers.length
      ? event.tiers.find((candidate) => candidate.id === parsed.data.tierId)
      : undefined;
    if (event.tiers.length && !tier) return { error: "Choose a ticket type." };

    const available = tier ? seatsLeft(tier) : seatsLeft(event);
    if (available < parsed.data.quantity) {
      return {
        error: tier
          ? `Only ${available} ${tier.name} seat(s) left.`
          : `Only ${available} seat(s) left for this event.`,
      };
    }

    const unitPrice = tier ? tier.price : event.price;
    const subtotalMinor = toMinor(unitPrice * parsed.data.quantity);

    let discountMinor = 0;
    let couponId: string | null = null;
    if (parsed.data.couponCode) {
      const check = await checkCoupon({
        code: parsed.data.couponCode,
        scope: "TICKETS",
        userId: user.id,
        eventId: event.id,
        subtotalMinor,
        currency: event.currency,
      });
      if (!check.ok) return { error: check.error };
      discountMinor = check.discountMinor;
      couponId = check.coupon.id;
    }

    const amountMinor = Math.max(0, subtotalMinor - discountMinor);

    const ticket = await db.ticket.create({
      data: {
        code: ticketCode(),
        eventId: event.id,
        tierId: tier?.id ?? null,
        couponId,
        discountMinor,
        userId: user.id,
        buyerName: parsed.data.buyerName,
        buyerEmail: parsed.data.buyerEmail,
        buyerPhone: parsed.data.buyerPhone || null,
        quantity: parsed.data.quantity,
        amountMinor,
        currency: event.currency,
        provider: amountMinor === 0 ? "free" : "stripe",
      },
    });

    if (amountMinor === 0) {
      await confirmTicket({
        ticketId: ticket.id,
        provider: "free",
        reference: `free_${ticket.id}`,
        amountMinor: 0,
        currency: event.currency,
      });
      destination = `/tickets/${ticket.code}`;
    } else {
      if (!stripeEnabled()) {
        return { error: "Ticket payments are not configured yet. Please try later." };
      }

      /**
       * When the organiser has connected Stripe, the buyer pays them directly and
       * Godesi keeps its service fee; otherwise the charge stays on Godesi.
       */
      const destinationAccount = payoutAccount(event.organizer);
      const session = await getStripe().checkout.sessions.create({
        mode: "payment",
        customer_email: parsed.data.buyerEmail,
        client_reference_id: user.id,
        metadata: { kind: "ticket", ticketId: ticket.id, eventId: event.id },
        ...(destinationAccount
          ? {
              payment_intent_data: {
                application_fee_amount: platformFeeMinor(amountMinor),
                transfer_data: { destination: destinationAccount },
              },
            }
          : {}),
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: event.currency.toLowerCase(),
              /** Charged as one line so a coupon discount is reflected exactly. */
              unit_amount: amountMinor,
              product_data: {
                name: `${event.title} — ${tier ? `${tier.name} × ` : ""}${parsed.data.quantity} seat(s)`,
                description: `${event.venue}, ${event.city}${
                  discountMinor ? " · coupon applied" : ""
                }`,
              },
            },
          },
        ],
        success_url: `${siteUrl()}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl()}/events/${event.slug}?error=cancelled`,
      });

      if (!session.url) return { error: "We could not start the payment. Please try again." };
      destination = session.url;
    }
  } catch (error) {
    return fieldError(error);
  }

  revalidatePath("/events");
  redirect(destination);
}

const proofSchema = z.object({
  eventId: z.string().min(1),
  partnerBannerUrl: optionalUrl,
  partnerStandeeUrl: optionalUrl,
  partnerSalesUrl: optionalUrl,
});

/**
 * Organiser evidence for the promotion partnership: the banner and standee in
 * place, plus a ticket-sales screenshot. Uploading resets the request to
 * REQUESTED so staff re-check it before the event is featured again.
 */
export async function submitPartnerProofAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = proofSchema.safeParse({
      eventId: formData.get("eventId"),
      partnerBannerUrl: formData.get("partnerBannerUrl") ?? undefined,
      partnerStandeeUrl: formData.get("partnerStandeeUrl") ?? undefined,
      partnerSalesUrl: formData.get("partnerSalesUrl") ?? undefined,
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };

    const event = await db.event.findUnique({ where: { id: parsed.data.eventId } });
    if (!event) return { error: "This event no longer exists." };
    if (event.organizerId !== user.id && !can(user, "events")) {
      return { error: "Only the organiser can upload proof for this event." };
    }
    if (event.partnerStatus === "NONE") {
      return { error: "Join the Godesi promotion partnership first." };
    }
    if (!parsed.data.partnerBannerUrl && !parsed.data.partnerStandeeUrl) {
      return { error: "Add at least the banner or standee photo." };
    }

    await db.event.update({
      where: { id: event.id },
      data: {
        partnerBannerUrl: parsed.data.partnerBannerUrl ?? event.partnerBannerUrl,
        partnerStandeeUrl: parsed.data.partnerStandeeUrl ?? event.partnerStandeeUrl,
        partnerSalesUrl: parsed.data.partnerSalesUrl ?? event.partnerSalesUrl,
        partnerProofAt: new Date(),
        partnerStatus: event.partnerStatus === "APPROVED" ? "APPROVED" : "REQUESTED",
      },
    });
  } catch (error) {
    return fieldError(error);
  }

  revalidatePath("/events");
  return { success: "Thanks — the Godesi team will verify your photos." };
}

/** Staff decision on a partnership request; approval turns the promotion on. */
export async function reviewPartnerAction(formData: FormData) {
  const user = await requireUser();
  if (!can(user, "events")) throw new Error("FORBIDDEN");

  const id = String(formData.get("id") ?? "");
  const decision = String(formData.get("decision") ?? "");
  if (decision !== "APPROVED" && decision !== "REJECTED") {
    throw new Error("Unknown decision");
  }

  await db.event.update({
    where: { id },
    data: {
      partnerStatus: decision,
      partnerNote: String(formData.get("partnerNote") ?? "").slice(0, 500) || null,
    },
  });

  revalidatePath("/events");
  revalidatePath(`/admin/events/${id}`);
}

export async function cancelEventAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const event = await db.event.findUnique({ where: { id } });
  if (!event || (event.organizerId !== user.id && !can(user, "events"))) {
    throw new Error("FORBIDDEN");
  }
  await db.event.update({ where: { id }, data: { status: "REJECTED" } });
  revalidatePath("/events");
  revalidatePath("/dashboard/events");
}
