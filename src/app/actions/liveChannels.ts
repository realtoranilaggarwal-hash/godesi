"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { LiveChannelStatus, LiveMediaKind } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser, requireStaff, getCurrentUser } from "@/lib/auth";
import { type ActionState } from "@/lib/actions";
import { notify } from "@/lib/notifications";
import { siteUrl } from "@/lib/format";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import {
  LIVE_CHANNEL_MONTHLY_USD,
  LIVE_CHANNEL_MONTHS,
  normalizeEmbedId,
  uniqueChannelSlug,
} from "@/lib/liveChannels";

const schema = z.object({
  kind: z.enum(["RADIO", "TV"]),
  name: z.string().trim().min(2, "Station or channel name is required"),
  place: z.string().trim().min(2, "Where does it broadcast from?"),
  about: z.string().trim().max(1200).optional(),
  embedId: z.string().trim().min(2, "Add the TuneIn or YouTube link"),
  websiteUrl: z
    .string()
    .trim()
    .url("Enter a full URL starting with https://")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  contactName: z.string().trim().max(120).optional(),
  contactPhone: z.string().trim().max(30).optional(),
  contactEmail: z
    .string()
    .trim()
    .email("Enter a valid email")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  nonProfit: z.boolean(),
});

/**
 * Members submit their own station or channel for review. Commercial carriage is
 * $50 a month, charities and non-profit suggestions are free — either way an
 * admin approves before anything appears on the site.
 */
export async function submitLiveChannelAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    const user = await requireUser();
    const parsed = schema.safeParse({
      kind: formData.get("kind") === "TV" ? "TV" : "RADIO",
      name: formData.get("name"),
      place: formData.get("place"),
      about: formData.get("about") || undefined,
      embedId: formData.get("embedId"),
      websiteUrl: formData.get("websiteUrl") || undefined,
      contactName: formData.get("contactName") || undefined,
      contactPhone: formData.get("contactPhone") || undefined,
      contactEmail: formData.get("contactEmail") || undefined,
      nonProfit: formData.get("nonProfit") === "on",
    });
    if (!parsed.success) return { error: parsed.error.issues[0].message };
    const data = parsed.data;

    const embedId = normalizeEmbedId(data.kind, data.embedId);
    if (!embedId) {
      return {
        error:
          data.kind === "RADIO"
            ? "Paste the TuneIn player link or its station id (it looks like s123456)."
            : "Paste the YouTube channel link or its channel id (it starts with UC…).",
      };
    }

    const channel = await db.liveChannel.create({
      data: {
        slug: await uniqueChannelSlug(data.name),
        kind: data.kind,
        name: data.name,
        place: data.place,
        about: data.about ?? null,
        embedId,
        websiteUrl: data.websiteUrl ?? null,
        contactName: data.contactName ?? null,
        contactPhone: data.contactPhone ?? null,
        contactEmail: data.contactEmail ?? null,
        nonProfit: data.nonProfit,
        submittedById: user.id,
      },
    });

    revalidatePath("/admin/live-channels");
    return {
      success: data.nonProfit
        ? "Thanks — a non-profit suggestion is free. Our team will review it and get it on the site."
        : `Submitted for review. Pay the monthly carriage fee on this page to go live once approved. Reference: ${channel.name}.`,
    };
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return { error: "Please sign in first." };
    }
    return { error: "Could not submit right now. Please try again." };
  }
}

/** Anyone, signed in or not, can flag a stream that will not play. */
export async function reportLiveChannelAction(formData: FormData) {
  const user = await getCurrentUser();
  const channelKey = String(formData.get("channelKey") ?? "").slice(0, 120);
  const label = String(formData.get("label") ?? "").slice(0, 160);
  const note = String(formData.get("note") ?? "").slice(0, 500);
  const kind: LiveMediaKind = formData.get("kind") === "TV" ? "TV" : "RADIO";
  if (!channelKey) return;

  await db.liveChannelReport.create({
    data: {
      channelKey,
      kind,
      label: label || channelKey,
      note: note || null,
      userId: user?.id ?? null,
    },
  });
  revalidatePath("/admin/live-channels");
}

/** Monthly carriage payment; extends the paid-until date on approval. */
export async function startLiveChannelCheckoutAction(formData: FormData) {
  const user = await requireUser();
  const channelId = String(formData.get("channelId") ?? "");
  const monthsRaw = Number(String(formData.get("months") ?? "1"));
  const months = LIVE_CHANNEL_MONTHS.includes(monthsRaw) ? monthsRaw : 1;

  const channel = await db.liveChannel.findFirst({
    where: { id: channelId, submittedById: user.id },
    select: { id: true, name: true, kind: true },
  });
  if (!channel) redirect("/live/submit?error=not_found");
  if (!stripeEnabled()) redirect("/live/submit?error=stripe_unavailable");

  const amountMinor = LIVE_CHANNEL_MONTHLY_USD * 100 * months;
  const order = await db.liveChannelOrder.create({
    data: {
      channelId: channel.id,
      userId: user.id,
      months,
      amountMinor,
      currency: "USD",
    },
  });

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    client_reference_id: user.id,
    metadata: {
      kind: "live-channel",
      liveChannelOrderId: order.id,
      channelId: channel.id,
      userId: user.id,
    },
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountMinor,
          product_data: {
            name: `Godesi live ${channel.kind === "TV" ? "TV" : "radio"} carriage — ${months} month${months > 1 ? "s" : ""}`,
            description: channel.name,
          },
        },
      },
    ],
    success_url: `${siteUrl()}/live/submit?paid={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl()}/live/submit?error=cancelled`,
  });

  if (!session.url) redirect("/live/submit?error=stripe_session");
  redirect(session.url);
}

/** Admin: approve, reject, feature or extend a submitted station. */
export async function updateLiveChannelAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "PENDING") as LiveChannelStatus;
  const featured = formData.get("featured") === "on";
  const nonProfit = formData.get("nonProfit") === "on";
  const adminNote = String(formData.get("adminNote") ?? "").trim();
  const addMonths = Number(String(formData.get("addMonths") ?? "0"));

  const channel = await db.liveChannel.findUnique({ where: { id } });
  if (!channel) throw new Error("Channel not found");

  const paidUntil =
    addMonths > 0
      ? new Date(
          Math.max(channel.paidUntil?.getTime() ?? 0, Date.now()) +
            addMonths * 30 * 24 * 60 * 60 * 1000,
        )
      : channel.paidUntil;

  await db.liveChannel.update({
    where: { id },
    data: {
      status,
      featured,
      nonProfit,
      paidUntil,
      adminNote: adminNote || null,
      approvedAt:
        status === "APPROVED" ? (channel.approvedAt ?? new Date()) : channel.approvedAt,
    },
  });

  if (channel.submittedById && status !== channel.status) {
    await notify({
      userId: channel.submittedById,
      title:
        status === "APPROVED"
          ? `${channel.name} is live on Godesi`
          : `${channel.name} was not approved`,
      body:
        status === "APPROVED"
          ? "Your station is now playable from the Live Radio / Live TV bar."
          : "Our team could not carry this stream. Reply to us if you think this is a mistake.",
      href: channel.kind === "TV" ? "/live-tv" : "/live-radio",
    });
  }

  revalidatePath("/admin/live-channels");
  revalidatePath("/live-radio");
  revalidatePath("/live-tv");
}

export async function resolveLiveReportAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  await db.liveChannelReport.update({ where: { id }, data: { resolved: true } });
  revalidatePath("/admin/live-channels");
}

export async function deleteLiveChannelAction(formData: FormData) {
  await requireStaff();
  const id = String(formData.get("id") ?? "");
  await db.liveChannel.delete({ where: { id } });
  revalidatePath("/admin/live-channels");
  revalidatePath("/live-radio");
  revalidatePath("/live-tv");
}
