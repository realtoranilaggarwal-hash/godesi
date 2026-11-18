"use server";

import { z } from "zod";
import type { ActionState } from "@/lib/actions";
import { escapeHtml, sendEmail, shell } from "@/lib/email";
import { verifyRecaptcha } from "@/lib/recaptcha";
import { SITE } from "@/lib/site";
import {
  SOCIAL_ORDER_PHONE,
  formatSocialQty,
  formatSocialUsd,
  socialPackage,
  socialService,
} from "@/lib/socialGrowth";

const schema = z.object({
  service: z.string().trim().min(1, "Pick a service"),
  qty: z.coerce.number().int().positive("Pick a package"),
  link: z.string().trim().min(3, "Paste the link to your profile, page or post").max(300),
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.string().trim().email("Enter a valid email").max(120),
  phone: z.string().trim().min(7, "Enter a phone number we can call or text").max(30),
  source: z.enum(["upgrade", "proposal"]).default("upgrade"),
});

/** Takes the order request only; payment is collected by Venmo, Zelle or phone. */
export async function requestSocialGrowthOrder(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check the form" };
  if (!(await verifyRecaptcha(String(formData.get("g-recaptcha-response") ?? "")))) {
    return { error: "Please try again — we could not confirm you're not a robot." };
  }
  const data = parsed.data;
  const service = socialService(data.service);
  const pkg = socialPackage(data.service, data.qty);
  if (!service || !pkg) return { error: "Pick a service and package from the list." };

  const order = `${formatSocialQty(pkg.qty)} ${service.label} — ${formatSocialUsd(pkg.priceUsd)}`;
  const rows = [
    ["Order", order],
    ["Link", data.link],
    ["Name", data.name],
    ["Phone", data.phone],
    ["Email", data.email],
    ["From", data.source === "proposal" ? "Partnership proposal add-on" : "Upgrade page"],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#64748b">${label}</td><td style="padding:4px 0"><b>${escapeHtml(value)}</b></td></tr>`,
    )
    .join("");

  const sent = await sendEmail({
    to: SITE.salesEmail,
    subject: `Social media order — ${order}`,
    html: shell("New social media growth order", `<table>${rows}</table><p>Collect payment by Venmo, Zelle or phone, then place the order.</p>`),
    replyTo: data.email,
  });
  if (!sent) {
    return { error: `We could not send that right now. Please call ${SOCIAL_ORDER_PHONE}.` };
  }

  await sendEmail({
    to: data.email,
    subject: `We got your GoDesi order — ${order}`,
    html: shell(
      "Thanks — your order is in",
      `<p>${escapeHtml(order)} for ${escapeHtml(data.link)}.</p>
      <p>We'll call or text you at ${escapeHtml(data.phone)} within one business day to take payment by Venmo, Zelle or phone. Your order starts as soon as it's paid.</p>
      <p>Questions? Call ${SOCIAL_ORDER_PHONE} or reply to this email.</p>`,
    ),
    replyTo: SITE.salesEmail,
  });

  return {
    success: `Order received: ${order}. We'll call or text you within one business day to take payment by Venmo, Zelle or phone.`,
  };
}
