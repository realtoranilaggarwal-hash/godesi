import { db } from "@/lib/db";
import { sendEmail, shell } from "@/lib/email";
import { siteUrl } from "@/lib/format";
import { WEBSITE_OFFER } from "@/lib/websiteOffer";

export { VIDEO_LANGUAGES, VIDEO_OFFER, wordCount } from "@/lib/videoOffer";

/** Only logos the buyer uploaded here (blob path videos/<userId>/…) are kept. */
export function ownVideoLogo(url: string, userId: string) {
  try {
    const { hostname, pathname } = new URL(url);
    return (
      hostname.endsWith(".public.blob.vercel-storage.com") &&
      pathname.startsWith(`/videos/${userId}/`)
    );
  } catch {
    return false;
  }
}

function escapeHtml(text: string) {
  return text.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

/** Marks the order paid and emails the desk. Idempotent: the webhook and the success page both call it. */
export async function confirmVideoOrder({
  orderId,
  sessionId,
  paymentIntentId,
  email,
}: {
  orderId: string;
  sessionId: string;
  paymentIntentId: string | null;
  email?: string | null;
}) {
  const claimed = await db.videoOrder.updateMany({
    where: { id: orderId, paidAt: null },
    data: {
      status: "PAID",
      paidAt: new Date(),
      stripeSessionId: sessionId,
      stripePaymentIntentId: paymentIntentId,
    },
  });
  const order = await db.videoOrder.findUnique({ where: { id: orderId } });
  if (!order || !claimed.count) return order;
  if (!order.email && email) {
    await db.videoOrder.update({ where: { id: orderId }, data: { email } });
  }
  await sendEmail({
    to: WEBSITE_OFFER.email,
    subject: `AI video paid: ${order.businessName} (${order.language})`,
    html: shell(
      "New AI video to make",
      `<h2>New AI video to make</h2>
       <p><strong>${escapeHtml(order.businessName)}</strong> — ${order.language}, $${(order.priceMinor / 100).toFixed(0)}</p>
       <p style="white-space:pre-wrap">${escapeHtml(order.script)}</p>
       <p>On screen: ${escapeHtml(order.contactPhone)}${order.websiteUrl ? ` · ${escapeHtml(order.websiteUrl)}` : ""}</p>
       <p>Deliver on WhatsApp to <strong>${escapeHtml(order.deliveryWhatsapp)}</strong></p>
       <p><a href="${siteUrl()}/admin/videos">Open the video desk</a></p>`,
    ),
  }).catch(() => undefined);
  return order;
}
