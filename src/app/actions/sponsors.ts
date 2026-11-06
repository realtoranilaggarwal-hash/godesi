"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { can, requireUser } from "@/lib/auth";
import { normalizeCouponCode } from "@/lib/coupons";
import { sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";

function text(formData: FormData, key: string, max: number) {
  return String(formData.get(key) ?? "")
    .trim()
    .slice(0, max);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

function refresh(slug: string) {
  revalidatePath(`/events/${slug}`);
  revalidatePath("/dashboard/sponsor");
}

function back(slug: string, error?: string): never {
  redirect(
    `/events/${slug}${error ? `?error=${encodeURIComponent(error)}` : ""}#sponsor-requests`,
  );
}

export async function setSponsorOptInAction(formData: FormData) {
  const user = await requireUser();
  const business = await db.business.findUnique({
    where: { ownerId: user.id },
  });
  if (!business) redirect("/dashboard/profile");
  await db.business.update({
    where: { id: business.id },
    data: { sponsorsEvents: formData.get("sponsorsEvents") === "on" },
  });
  revalidatePath("/dashboard/sponsor");
  redirect("/dashboard/sponsor");
}

/** A business owner asks an organiser to sponsor their event. */
export async function requestSponsorAction(formData: FormData) {
  const user = await requireUser();
  const business = await db.business.findUnique({
    where: { ownerId: user.id },
  });
  if (!business) redirect("/dashboard/profile");
  const event = await db.event.findUnique({
    where: { id: String(formData.get("eventId") ?? "") },
    include: { organizer: { select: { email: true, name: true } } },
  });
  if (!event || event.status !== "APPROVED") redirect("/dashboard/sponsor");
  const message = text(formData, "message", 600) || null;

  const existing = await db.eventSponsor.findUnique({
    where: {
      eventId_businessId: { eventId: event.id, businessId: business.id },
    },
  });
  if (existing?.status === "APPROVED") redirect("/dashboard/sponsor?sent=1");
  await db.eventSponsor.upsert({
    where: {
      eventId_businessId: { eventId: event.id, businessId: business.id },
    },
    create: { eventId: event.id, businessId: business.id, message },
    update: { status: "REQUESTED", message },
  });
  if (!business.sponsorsEvents) {
    await db.business.update({
      where: { id: business.id },
      data: { sponsorsEvents: true },
    });
  }

  const eventUrl = `${siteUrl()}/events/${event.slug}#sponsor-requests`;
  const cardUrl = `${siteUrl()}/business/${business.slug}`;
  await sendEmail({
    to: event.organizer.email,
    subject: `${business.name} would like to sponsor ${event.title}`,
    html: shell(
      "New sponsor request",
      `<p><a href="${cardUrl}">${escapeHtml(business.name)}</a> (${escapeHtml(business.category)}, ${escapeHtml(business.city)}) would like to sponsor <b>${escapeHtml(event.title)}</b>.</p>
      ${message ? `<blockquote style="margin:12px 0;padding:8px 12px;border-left:4px solid #f97316;background:#fff7ed">${escapeHtml(message)}</blockquote>` : ""}
      <p>Reply to them at ${escapeHtml(business.publicEmail || user.email)}, or approve them on your event page — approved sponsors show there with their logo and discount code.</p>
      <p><a href="${eventUrl}" style="display:inline-block;background:#4f46e5;color:#fff;padding:10px 16px;border-radius:10px;text-decoration:none;font-weight:700">Review the request</a></p>`,
    ),
  });

  refresh(event.slug);
  redirect("/dashboard/sponsor?sent=1");
}

async function managedEvent(eventId: string) {
  const user = await requireUser();
  const event = await db.event.findUnique({ where: { id: eventId } });
  if (!event) redirect("/events");
  if (event.organizerId !== user.id && !can(user, "events"))
    throw new Error("Only the organiser can manage sponsors.");
  return { user, event };
}

/**
 * Organiser approves a request, or adds a business directly by its card
 * address, with an optional ticket discount code for the sponsor's clients.
 */
export async function saveSponsorAction(formData: FormData) {
  const { user, event } = await managedEvent(
    String(formData.get("eventId") ?? ""),
  );
  const sponsorId = text(formData, "sponsorId", 40);
  const offer = text(formData, "offer", 120) || null;
  const code = normalizeCouponCode(text(formData, "code", 24));
  const percent = Number(formData.get("percent") || 0);

  let sponsor = sponsorId
    ? await db.eventSponsor.findFirst({
        where: { id: sponsorId, eventId: event.id },
      })
    : null;
  if (!sponsor) {
    const ref = text(formData, "business", 200)
      .replace(/^https?:\/\/[^/]+\/business\//i, "")
      .replace(/[/?#].*$/, "");
    const business = ref
      ? await db.business.findFirst({
          where: { OR: [{ slug: ref }, { previousSlugs: { has: ref } }] },
        })
      : null;
    if (!business)
      back(
        event.slug,
        "No GoDesi card found at that address. Paste the godesi.com/business/… link.",
      );
    sponsor = await db.eventSponsor.upsert({
      where: {
        eventId_businessId: { eventId: event.id, businessId: business.id },
      },
      create: { eventId: event.id, businessId: business.id },
      update: {},
    });
  }

  let couponId = sponsor.couponId;
  if (code) {
    if (!/^[A-Z0-9-]{3,24}$/.test(code))
      back(event.slug, "Codes are 3–24 letters, numbers or dashes.");
    if (!(percent >= 1 && percent <= 100))
      back(event.slug, "Pick a discount between 1% and 100%.");
    const clash = await db.coupon.findUnique({ where: { code } });
    if (clash && clash.id !== couponId) {
      if (clash.eventId !== event.id || clash.scope !== "TICKETS")
        back(
          event.slug,
          `The code ${code} is already used elsewhere — try another.`,
        );
      const owner = await db.eventSponsor.findUnique({
        where: { couponId: clash.id },
      });
      if (owner && owner.id !== sponsor.id)
        back(
          event.slug,
          `The code ${code} already belongs to another sponsor.`,
        );
      couponId = clash.id;
    }
    if (couponId) {
      await db.coupon.update({
        where: { id: couponId },
        data: {
          code,
          discountKind: "PERCENT",
          amount: percent,
          currency: null,
          active: true,
        },
      });
    } else {
      couponId = (
        await db.coupon.create({
          data: {
            code,
            scope: "TICKETS",
            discountKind: "PERCENT",
            amount: percent,
            eventId: event.id,
            createdById: user.id,
          },
        })
      ).id;
    }
  } else if (couponId) {
    await db.coupon.update({
      where: { id: couponId },
      data: { active: false },
    });
  }

  await db.eventSponsor.update({
    where: { id: sponsor.id },
    data: {
      status: "APPROVED",
      offer,
      couponId,
      approvedAt: sponsor.approvedAt ?? new Date(),
    },
  });
  refresh(event.slug);
  back(event.slug);
}

export async function removeSponsorAction(formData: FormData) {
  const { event } = await managedEvent(String(formData.get("eventId") ?? ""));
  const sponsor = await db.eventSponsor.findFirst({
    where: { id: String(formData.get("sponsorId") ?? ""), eventId: event.id },
  });
  if (sponsor) {
    await db.eventSponsor.update({
      where: { id: sponsor.id },
      data: { status: "DECLINED" },
    });
    if (sponsor.couponId)
      await db.coupon.update({
        where: { id: sponsor.couponId },
        data: { active: false },
      });
  }
  refresh(event.slug);
  back(event.slug);
}
