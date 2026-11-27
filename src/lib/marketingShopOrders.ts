import { escapeHtml, sendEmail, shell } from "@/lib/email";
import { generateFreeCourseCode } from "@/lib/courseCodes";
import { COURSES } from "@/lib/courses";
import { ebookBonusCount, findMarketingProduct, usd } from "@/lib/marketingShop";
import { siteUrl } from "@/lib/format";
import { SITE } from "@/lib/site";
import { getStripe } from "@/lib/stripe";

/** Where the team orders each item to drop-ship it. Server-only: never rendered on public pages. */
const SUPPLIER_LINKS: Record<string, string> = {
  "triangle-flags": "https://temu.to/k/pghibh3a0tc",
  "car-sticker": "https://temu.to/k/pnfxxaemq6x",
  "wall-banner": "https://temu.to/k/piel24o9o1s",
  "rollup-banner-stand": "https://temu.to/k/pprt99t4jxb",
  "business-cards": "https://temu.to/k/peg5grybfjv",
  "rainbow-backdrop": "https://temu.to/k/ppkh9p1lcjt",
  "vertical-flags": "https://temu.to/k/p7mvglj8wcp",
  "qr-stickers": "https://temu.to/k/p2ynlppu5g3",
  "a5-flyers": "https://temu.to/k/pvk5ko4h4lf",
  "qr-keychains": "https://temu.to/k/pz27dn3v72m",
  "printed-pens": "https://temu.to/k/pwz113guw4r",
  "bamboo-pens": "https://temu.to/k/poceweyx9bf",
  "nfc-review-stand": "https://temu.to/k/ppzirlueuw8",
  "logo-beanie": "https://temu.to/k/puisxje148q",
};

/** Cart as stored in Stripe metadata: `id:qty,id:qty`. */
export function encodeCart(items: { id: string; qty: number }[]) {
  return items.map((i) => `${i.id}:${i.qty}`).join(",");
}

export function decodeCart(value: string | undefined) {
  return (value ?? "").split(",").flatMap((part) => {
    const [id, qty] = part.split(":");
    const product = findMarketingProduct(id);
    const n = Number(qty);
    return product && Number.isInteger(n) && n > 0 ? [{ product, qty: n }] : [];
  });
}

type ShopSession = {
  id: string;
  payment_intent?: string | { id: string } | null;
  amount_total: number | null;
  customer_email?: string | null;
  customer_details?: { email?: string | null; name?: string | null; phone?: string | null } | null;
  collected_information?: {
    shipping_details?: {
      name?: string | null;
      address?: {
        line1?: string | null;
        line2?: string | null;
        city?: string | null;
        state?: string | null;
        postal_code?: string | null;
        country?: string | null;
      } | null;
    } | null;
  } | null;
  metadata?: Record<string, string> | null;
};

/** Metadata key holding the client's design details for one item. */
export function designKey(id: string) {
  return `design-${id}`;
}

function itemRows(items: ReturnType<typeof decodeCart>, designs: Record<string, string | undefined>) {
  return items
    .map(({ product, qty }) => {
      const link = SUPPLIER_LINKS[product.id];
      const design = designs[designKey(product.id)];
      return `<li>${qty} × ${escapeHtml(product.name)} (${usd(product.priceUsd * qty)})${link ? ` — <a href="${link}">order on Temu</a>` : ""}<br/><i>Design:</i> ${escapeHtml(design || "—").replace(/\n/g, "<br/>")}</li>`;
    })
    .join("");
}

function bonusNote(ebooks: number) {
  return ebooks > 0
    ? `<p><b>Ebook bonus:</b> once paid, mint ${ebooks} free-course code${ebooks === 1 ? "" : "s"} at /admin/coupons and email them to the client.</p>`
    : "";
}

function bonusHtml(codes: string[]) {
  if (!codes.length) return "";
  const list = codes.map((code) => `<li><b style="font-family:monospace;font-size:15px">${code}</b></li>`).join("");
  return `<h3>Your free bonus: ${codes.length} GoDesi course ebook${codes.length === 1 ? "" : "s"}</h3>
    <p>Each code unlocks one course of your choice for life, with its lessons and downloadable PDF ebook:</p>
    <ol>${list}</ol>
    <p>Open any course at <a href="${siteUrl()}/course">${siteUrl().replace(/^https?:\/\//, "")}/course</a>, sign in, and enter a code in the “Got a free-course code?” box. Use a different code for each course.</p>`;
}

/** Card checkout is unavailable: email the team the cart so they can collect payment and the address by phone. */
export async function requestMarketingShopOrder(order: {
  items: { id: string; qty: number }[];
  email: string;
  name: string;
  business: string;
  phone: string;
  page: string;
  website: string;
  orderFor: string;
  notes: string;
  designs: Record<string, string>;
}) {
  const items = decodeCart(encodeCart(order.items));
  const total = items.reduce((sum, { product, qty }) => sum + product.priceUsd * qty, 0);
  return sendEmail({
    to: SITE.salesEmail,
    subject: `Marketing Shop order request ${usd(total)} (not paid): ${order.business || order.email}`,
    html: shell(
      "Marketing Shop order request — collect payment",
      `<p>Card checkout was unavailable, so this order is <b>not paid</b>. Contact the client for payment and their shipping address.</p>
      <p><b>${escapeHtml(order.business || "—")}</b> · ${escapeHtml(order.name)}<br/>
      Email: ${escapeHtml(order.email)} · Phone: ${escapeHtml(order.phone || "—")}<br/>
      QR code links to: ${escapeHtml(order.page || "— (no GoDesi page yet; ask them)")}<br/>
      Website: ${escapeHtml(order.website || "—")}<br/>
      Adding to: ${escapeHtml(order.orderFor)}</p>
      <ul>${itemRows(items, order.designs)}</ul>
      <p>Total: <b>${usd(total)}</b></p>
      <p><b>Other notes:</b> ${escapeHtml(order.notes || "—")}</p>
      <p>Client confirmed: custom-made, no returns.</p>
      ${bonusNote(ebookBonusCount(total, COURSES.length))}`,
    ),
    replyTo: order.email,
  });
}

/**
 * Stripe confirmed a Marketing Shop order: send the team the drop-ship sheet and thank the buyer.
 * Throws if the team email fails so the webhook returns 500 and Stripe retries; a
 * `shopNotified` flag on the PaymentIntent stops redeliveries from sending it twice.
 */
export async function notifyMarketingShopOrder(session: ShopSession) {
  const paymentIntentId =
    typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  const stripe = getStripe();
  if (paymentIntentId) {
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    if (intent.metadata?.shopNotified === "1") return;
  }
  const items = decodeCart(session.metadata?.items);
  const meta = session.metadata ?? {};
  const email = session.customer_details?.email ?? session.customer_email ?? "";
  const paid = usd((session.amount_total ?? 0) / 100);
  const ship = session.collected_information?.shipping_details;
  const a = ship?.address;
  const address = [ship?.name, a?.line1, a?.line2, [a?.city, a?.state, a?.postal_code].filter(Boolean).join(" "), a?.country]
    .filter(Boolean)
    .map((line) => escapeHtml(String(line)))
    .join("<br/>");

  const sent = await sendEmail({
    to: SITE.salesEmail,
    subject: `Marketing Shop order ${paid}: ${meta.business || email || session.id}`,
    html: shell(
      "Marketing Shop order — drop-ship",
      `<p><b>${escapeHtml(meta.business || "—")}</b> · ${escapeHtml(meta.name || session.customer_details?.name || "")}<br/>
      Email: ${escapeHtml(email || "—")} · Phone: ${escapeHtml(meta.phone || session.customer_details?.phone || "—")}<br/>
      QR code links to: ${escapeHtml(meta.page || "— (no GoDesi page yet; ask them)")}<br/>
      Website: ${escapeHtml(meta.website || "—")}<br/>
      Adding to: ${escapeHtml(meta.orderFor || "shop")}</p>
      <ul>${itemRows(items, meta)}</ul>
      <p>Paid: <b>${paid}</b> · Stripe: ${escapeHtml(session.id)}</p>
      <p><b>Ship to:</b><br/>${address || "—"}</p>
      <p><b>Other notes:</b> ${escapeHtml(meta.notes || "—")}</p>
      <p>No returns confirmed: ${meta.noReturns === "agreed" ? "yes" : "no"}</p>
      <p>Design each item with their logo and GoDesi QR code before ordering.</p>`,
    ),
    ...(email ? { replyTo: email } : {}),
  });
  if (!sent) throw new Error(`Marketing Shop order email failed for ${session.id}`);
  if (paymentIntentId) {
    await stripe.paymentIntents.update(paymentIntentId, { metadata: { shopNotified: "1" } });
  }

  if (email) {
    const codes = Array.from(
      { length: ebookBonusCount((session.amount_total ?? 0) / 100, COURSES.length) },
      generateFreeCourseCode,
    );
    const list = items.map(({ product, qty }) => `<li>${qty} × ${escapeHtml(product.name)}</li>`).join("");
    await sendEmail({
      to: email,
      subject: `Your GoDesi Marketing Shop order (${paid})`,
      html: shell(
        "Thank you for your order",
        `<p>We received your <b>${paid}</b> order:</p><ul>${list}</ul>
        <p>Reply to this email with your logo or artwork (PNG or JPG) and any text you want printed. We design each item with your artwork and your GoDesi QR code, send you a preview, and order and ship it to your address once you approve. Items are custom-made, so they can't be returned.</p>
        ${bonusHtml(codes)}
        <p>Questions? Call or WhatsApp Anil at (732) 983-7958.</p>`,
      ),
      replyTo: SITE.alertsEmail,
    });
  }
}
