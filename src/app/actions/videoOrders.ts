"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireStaff, requireUser } from "@/lib/auth";
import { type ActionState, fieldError } from "@/lib/actions";
import { getStripe, stripeEnabled } from "@/lib/stripe";
import { siteUrl } from "@/lib/format";
import {
  VIDEO_LANGUAGES,
  VIDEO_OFFER,
  ownVideoLogo,
  wordCount,
} from "@/lib/videoOrders";

const phone = (message: string) =>
  z
    .string()
    .trim()
    .max(30)
    .refine((value) => value.replace(/\D/g, "").length >= 7, message);

const orderSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Tell us your business name")
    .max(VIDEO_OFFER.businessNameMax, `Business name: up to ${VIDEO_OFFER.businessNameMax} characters`),
  script: z
    .string()
    .trim()
    .min(10, "Write what she should say")
    .max(1000)
    .refine(
      (text) => wordCount(text) <= VIDEO_OFFER.maxWords,
      `Keep the script to ${VIDEO_OFFER.maxWords} words`,
    ),
  contactPhone: phone("Add the phone/WhatsApp number to show in the video"),
  websiteUrl: z.string().trim().max(200).optional(),
  language: z.enum(VIDEO_LANGUAGES, { message: "Pick a language" }),
  logoUrl: z.string().trim().max(500).optional(),
  deliveryWhatsapp: phone("Add your WhatsApp number so we can send you the video"),
});

/** Saves the order, then sends the buyer to Stripe for the fixed $50. */
export async function startVideoOrderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  let url: string;
  try {
    const user = await requireUser();
    const parsed = orderSchema.safeParse({
      businessName: formData.get("businessName") ?? undefined,
      script: formData.get("script") ?? undefined,
      contactPhone: formData.get("contactPhone") ?? undefined,
      websiteUrl: formData.get("websiteUrl") || undefined,
      language: formData.get("language") ?? undefined,
      logoUrl: formData.get("logoUrl") || undefined,
      deliveryWhatsapp: formData.get("deliveryWhatsapp") ?? undefined,
    });
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? "Please check the form." };
    }
    if (!stripeEnabled()) {
      throw new Error("Card payments are not available right now — please try again later.");
    }
    const data = parsed.data;
    const priceMinor = VIDEO_OFFER.priceUsd * 100;
    const order = await db.videoOrder.create({
      data: {
        userId: user.id,
        businessName: data.businessName,
        script: data.script,
        contactPhone: data.contactPhone,
        websiteUrl: data.websiteUrl ?? null,
        language: data.language,
        logoUrl: data.logoUrl && ownVideoLogo(data.logoUrl, user.id) ? data.logoUrl : null,
        deliveryWhatsapp: data.deliveryWhatsapp,
        email: user.email,
        priceMinor,
      },
    });

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: user.email,
      client_reference_id: user.id,
      metadata: { kind: "ai-video", videoOrderId: order.id, userId: user.id },
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: priceMinor,
            product_data: {
              name: `AI video for your business — ${data.businessName}`,
              description: `One short vertical AI presenter video in ${data.language}, one revision included, sent on WhatsApp.`,
            },
          },
        },
      ],
      success_url: `${siteUrl()}/video-order/done?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/video-order?cancelled=1`,
    });
    if (!session.url) throw new Error("Stripe did not return a checkout link.");
    await db.videoOrder.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });
    url = session.url;
  } catch (error) {
    return fieldError(error);
  }
  redirect(url);
}

const STATUSES = ["PENDING", "PAID", "DELIVERED", "CANCELLED"] as const;

/** Video desk: move an order along and keep the finished video's link. */
export async function updateVideoOrderAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requireStaff();
    const status = z.enum(STATUSES).parse(formData.get("status"));
    const current = await db.videoOrder.findUnique({ where: { id } });
    if (!current) throw new Error("Order not found.");
    await db.videoOrder.update({
      where: { id },
      data: {
        status,
        videoUrl: String(formData.get("videoUrl") ?? "").trim().slice(0, 500) || null,
        staffNotes: String(formData.get("staffNotes") ?? "").trim().slice(0, 2000) || null,
        revisionUsed: formData.get("revisionUsed") === "1",
        deliveredAt:
          status === "DELIVERED" ? (current.deliveredAt ?? new Date()) : current.deliveredAt,
      },
    });
  } catch (error) {
    return fieldError(error);
  }
  revalidatePath("/admin/videos");
  return { success: "Saved" };
}
